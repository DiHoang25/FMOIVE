import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Input, message } from 'antd';
import Pagination from '../../components/PaginationHomepage';

const MovieSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const moviesPerPage = 10;

  // State mới để kích hoạt việc tìm kiếm khi nhấn Enter
  // Chúng ta sẽ lưu trữ giá trị searchTerm cuối cùng mà người dùng đã nhấn Enter
  const [activeSearchTerm, setActiveSearchTerm] = useState('');

  // useEffect sẽ theo dõi activeSearchTerm để gọi API
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = activeSearchTerm // Sử dụng activeSearchTerm cho API call
          ? `http://localhost:5000/api/feature/search?search=${encodeURIComponent(activeSearchTerm)}`
          : 'http://localhost:5000/api/feature/search'; // Fetch all if activeSearchTerm is empty

        // **Quan trọng: Thêm JWT vào header nếu backend yêu cầu**
        // Ví dụ:
        const token = localStorage.getItem('jwtToken'); // Lấy token từ localStorage
        const headers = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, { headers }); // Pass headers to fetch

        if (!response.ok) {
          const errorData = await response.json(); // Cố gắng đọc lỗi từ response body
          throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setMovies(data.movies || []);
      } catch (err) {
        console.error('Error fetching movies:', err);
        setError(err);
        message.error('Failed to load movies.');
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    // Chỉ gọi fetchMovies khi activeSearchTerm thay đổi (tức là khi người dùng nhấn Enter)
    // Hoặc khi component mount lần đầu với activeSearchTerm rỗng (để tải tất cả phim)
    fetchMovies();
  }, [activeSearchTerm]); // Dependency chỉ còn activeSearchTerm

  // Xử lý thay đổi trong ô input (chỉ cập nhật searchTerm tạm thời)
  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Xử lý khi nhấn Enter trong ô input
  const handlePressEnter = () => {
    setActiveSearchTerm(searchTerm); // Cập nhật activeSearchTerm để kích hoạt useEffect
    setCurrentPage(0); // Reset về trang đầu tiên khi tìm kiếm mới
  };

  const indexOfLastMovie = (currentPage + 1) * moviesPerPage;
  const indexOfFirstMovie = currentPage * moviesPerPage;
  const currentMovies = movies.slice(indexOfFirstMovie, indexOfLastMovie);
  const totalPages = Math.ceil(movies.length / moviesPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="bg-black text-white min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-white">Movie Search</h1>
          <p className="text-center">Loading movies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black text-white min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-white">Movie Search</h1>
          <p className="text-center text-red-500">Error: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">Movie Search</h1>

        {/* Search bar */}
        <div className="flex mb-10 max-w-xl mx-auto">
          <Input
            placeholder="The..."
            value={searchTerm} // Giá trị hiển thị trong input
            onChange={handleInputChange}
            onPressEnter={handlePressEnter} // Thêm sự kiện onPressEnter
            className="rounded-md p-2 h-12 flex-grow"
            style={{ backgroundColor: '#1a1a2e', color: 'white', borderColor: '#333' }}
          />
        </div>

        {/* Movie grid */}
        {movies.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              {currentMovies.map((movie) => (
                // Sử dụng movie._id làm key nếu có, nếu không thì fallback về movie.name (ít lý tưởng hơn)
                <div key={movie._id || movie.name} className="relative cursor-pointer group">
                  <img
                    src={movie.image_url}
                    alt={movie.name}
                    className="w-full h-[500px] object-cover rounded shadow-lg"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 p-3">
                    <h2 className="text-lg font-bold text-white truncate">{movie.name}</h2>
                    <div className="flex justify-between items-center">
                      {/* Giả sử API có trả về 'rating', nếu không thì có thể xóa hoặc dùng giá trị mặc định */}
                      {movie.rating && <span className="text-sm text-yellow-400">{movie.rating.toFixed(1)}</span>}
                      <span className="text-xs text-gray-300">{movie.running_time}</span>
                    </div>
                    <div className="mt-2 flex gap-1">
                      {/* Đảm bảo movie._id là hợp lệ và được dùng để điều hướng */}
                      <Link to={`/moviedetails/${movie._id}`} className="w-full">
                        <button className="w-full bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-2 rounded">
                          View Details
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {movies.length > moviesPerPage && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-xl">No movies found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieSearch;