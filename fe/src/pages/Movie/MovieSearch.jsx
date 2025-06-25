import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Input, message } from 'antd';
import Pagination from '../../components/PaginationHomepage';
import { SearchOutlined } from '@ant-design/icons'; // Import icon kính lúp

const MovieSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const moviesPerPage = 10;

  // useEffect để lấy tất cả phim từ API
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError(null);
      try {
        // Sử dụng API /movies
        const url = `http://localhost:5000/api/movies`;
        console.log('Fetching from URL:', url);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
          'Content-Type': 'application/json',
        }
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          const contentType = response.headers.get('content-type');
          console.log('Content-Type:', contentType);

          if (contentType && contentType.includes('text/html')) {
            throw new Error('Nhận được phản hồi HTML thay vì JSON. Kiểm tra đường dẫn API và cấu hình CORS.');
        }
          const errorData = await response.json();
          throw new Error(errorData.message || `Lỗi HTTP! Status: ${response.status}`);
        }

        const moviesData = await response.json();
        console.log('API response data:', moviesData);
        setMovies(moviesData || []);
        setFilteredMovies(moviesData || []); // Khởi tạo ban đầu với tất cả phim
      } catch (err) {
        console.error('Error fetching movies:', err);
        setError(err);
        message.error(`Không thể tải danh sách phim: ${err.message}`);
        setMovies([]);
        setFilteredMovies([]);
      } finally {
        setLoading(false);
      }
};

    fetchMovies();
  }, []); // Chỉ chạy một lần khi component được mount

  // useEffect để lọc phim dựa trên searchTerm (chạy mỗi khi searchTerm thay đổi)
  useEffect(() => {
    if (!searchTerm.trim()) {
      // Nếu searchTerm trống, hiển thị tất cả phim
      setFilteredMovies(movies);
      setCurrentPage(0); // Reset về trang đầu tiên
      return;
    }

    // Lọc phim CHỈ dựa trên tên phim
    const searchRegex = new RegExp(searchTerm, 'i');
    const filtered = movies.filter(movie =>
      searchRegex.test(movie.name)
      // Đã loại bỏ việc tìm kiếm theo đạo diễn và diễn viên
    );

    setFilteredMovies(filtered);
    setCurrentPage(0); // Reset về trang đầu tiên khi kết quả tìm kiếm thay đổi
  }, [searchTerm, movies]);

  // Xử lý thay đổi trong ô input - chạy ngay khi nhập
  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const indexOfLastMovie = (currentPage + 1) * moviesPerPage;
  const indexOfFirstMovie = currentPage * moviesPerPage;
  const currentMovies = filteredMovies.slice(indexOfFirstMovie, indexOfLastMovie);
  const totalPages = Math.ceil(filteredMovies.length / moviesPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
};

  if (loading) {
    return (
      <div className="bg-black text-white min-h-screen p-6">
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
          <p className="text-center text-red-500">Lỗi: {error.message}</p>
          <div className="text-center mt-4">
            <button
              onClick={() => window.location.reload()}
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
    <div className="bg-black text-white min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">Movie Search</h1>

        {/* Search bar với icon kính lúp */}
        <div className="flex flex-col mb-10 max-w-xl mx-auto">
          <div className="relative">
            <Input
              placeholder="Tìm kiếm phim theo tên..."
              value={searchTerm}
              onChange={handleInputChange}
              className="rounded-md p-2 h-12 pl-10"
              style={{ backgroundColor: '#1a1a2e', color: 'white', borderColor: '#333' }}
              suffix={<SearchOutlined className="text-gray-400 text-lg" />}
            />
          </div>
        </div>

        {/* Movie grid */}
        {filteredMovies.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              {currentMovies.map((movie) => (
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

            {/* Pagination */}
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