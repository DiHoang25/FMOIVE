import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Input, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Pagination from '../../components/PaginationHomepage';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllMovies,
  searchMovies,
  setSearchTerm,
  setCurrentPage,
  resetSearchState
} from '../../redux/movieSearchSlice';

const MovieSearch = () => {
  const dispatch = useDispatch();
  const {
    movies,
    filteredMovies,
    loading,
    error,
    searchTerm,
    currentPage
  } = useSelector(state => state.movieSearch);
  const moviesPerPage = 10;

  
  useEffect(() => {
    dispatch(fetchAllMovies())
      .unwrap()
      .catch(error => {
        message.error(`Không thể tải danh sách phim: ${error}`);
      });

    
    return () => {
      dispatch(resetSearchState());
    };
  }, [dispatch]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    dispatch(setSearchTerm(value));
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      dispatch(searchMovies({
        search: searchTerm,
        excludeStatus: 'ended'
      }))
        .unwrap()
        .catch(error => {
          message.error(`Tìm kiếm thất bại: ${error}`);
        });
    }
  };


  const indexOfFirstMovie = currentPage * moviesPerPage;
  const indexOfLastMovie = (currentPage + 1) * moviesPerPage;
  const visibleMovies = filteredMovies.filter(movie => movie.status !== 'ended');
  const currentMovies = visibleMovies.slice(indexOfFirstMovie, indexOfLastMovie);
  const totalPages = Math.ceil(visibleMovies.length / moviesPerPage);

  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page));
  };

  if (loading) {
    return (
      <div className="bg-black text-white min-h-screen p-6 ">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-white">Movie Search</h1>
          <p className="text-center">Đang tải dữ liệu phim...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black text-white min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-white">Movie Search</h1>
          <p className="text-center text-red-500">Lỗi: {error}</p>
          <div className="text-center mt-4">
            <button
              onClick={() => dispatch(fetchAllMovies())}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    
    <div className="bg-black text-white min-h-screen p-6 pt-[50px]">


      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">Movie Search</h1>


        <div className="flex flex-col mb-10 max-w-xl mx-auto">
          <div className="relative">
<Input
              placeholder="Tìm kiếm phim theo tên..."
              value={searchTerm}
              onChange={handleInputChange}
              onKeyPress={handleSearch}
              className="rounded-md p-2 h-12 pl-10"
              style={{ backgroundColor: '#1a1a2e', color: 'white', borderColor: '#333' }}
              suffix={
                <SearchOutlined
                  className="text-gray-400 text-lg cursor-pointer"
                  onClick={() => dispatch(searchMovies({ search: searchTerm }))}
                />
              }
            />
          </div>
        </div>


        {filteredMovies.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              {currentMovies
                .filter(movie => movie.status !== 'ended')
                .map((movie) => (
                  <div key={movie._id || movie.name} className="relative cursor-pointer group">
                    <Link to={`/moviedetails/${movie._id}`}>
                      <img
                        src={movie.image_url}
                        alt={movie.name}
                        className="w-full h-[500px] object-cover rounded shadow-lg transition-opacity duration-300 hover:opacity-80"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 p-3">
                        <h2 className="text-lg font-bold text-white truncate">{movie.name}</h2>
                        <div className="flex justify-between items-center">
                          {movie.rating && <span className="text-sm text-yellow-400">{movie.rating.toFixed(1)}</span>}
                          <span className="text-xs text-gray-300">{movie.running_time} min</span>
                        </div>
                        <div className="mt-2 flex gap-1">
                          <button className="w-full bg-red-600 hover:bg-red-700 text-white text-m py-1 px-2 rounded">
                            View Details
                          </button>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
            </div>


            {filteredMovies.length > moviesPerPage && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-xl">Không tìm thấy phim phù hợp.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieSearch;

