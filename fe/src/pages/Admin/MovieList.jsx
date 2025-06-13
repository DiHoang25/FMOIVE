import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SidebarLayout from '../../components/Sidebar-Admin';
import { FaChevronLeft, FaSearch, FaEye, FaEdit, FaTrash } from 'react-icons/fa';

const MovieList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All genres');
  const [currentPage, setCurrentPage] = useState(1);
  const moviesPerPage = 8;

  const movies = [
    { id: 'MV001', name: 'Avatar: The Way of Water', genres: 'Sci-Fi', duration: 192, showtime: 15, revenue: '2.5M', status: 'Now showing' },
    { id: 'MV002', name: 'Top Gun: Maverick', genres: 'Action', duration: 131, showtime: 12, revenue: '1.8M', status: 'Now showing' },
    { id: 'MV003', name: 'Black Panther: Wakanda Forever', genres: 'Action', duration: 161, showtime: 18, revenue: '3.2M', status: 'Now showing' },
    { id: 'MV004', name: 'The Batman', genres: 'Action', duration: 176, showtime: 8, revenue: '1.1M', status: 'Stop showing' },
    { id: 'MV005', name: 'Doctor Strange 2', genres: 'Fantasy', duration: 126, showtime: 14, revenue: '2.1M', status: 'Now showing' },
    { id: 'MV006', name: 'Minions: The Rise of Gru', genres: 'Animation', duration: 87, showtime: 10, revenue: '1.6M', status: 'Now showing' },
    { id: 'MV007', name: 'Jurassic World Dominion', genres: 'Adventure', duration: 147, showtime: 6, revenue: '0.9M', status: 'Stop showing' },
    { id: 'MV008', name: 'Thor: Love and Thunder', genres: 'Action', duration: 119, showtime: 16, revenue: '2.8M', status: 'Now showing' },
  ];

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleGenreChange = (e) => {
    setSelectedGenre(e.target.value);
  };

  const filteredMovies = movies.filter(movie =>
    movie.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedGenre === 'All genres' || movie.genres === selectedGenre)
  );

  const indexOfLastMovie = currentPage * moviesPerPage;
  const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
  const currentMovies = filteredMovies.slice(indexOfFirstMovie, indexOfLastMovie);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalMovies = movies.length;
  const nowShowingMovies = movies.filter(movie => movie.status === 'Now showing').length;
  const upcomingMovies = 6; // Placeholder as per image
  const todayShowtimes = 156; // Placeholder as per image

  return (
    <SidebarLayout>
      <div className="flex h-screen bg-gray-900 text-gray-300">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <header className="p-2 flex justify-between items-center border-b border-gray-800">
            <div className="flex items-center">
              <h1 className="text-xl text-gray-300">Admin</h1>
            </div>
            <div className="flex items-center space-x-2">
              {/* User Avatar */}
              <Link to="/admin/admin-profile">
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm">
                  A
                </div>
              </Link>
            </div>
          </header>

          {/* Back Button and Title */}
          <div className="bg-gray-900 p-2 flex items-center justify-between">
            <Link to="/admin" className="text-gray-400 hover:text-gray-300 flex items-center mr-2 text-sm">
              <FaChevronLeft className="mr-1 text-xs" /> Back
            </Link>
            <div className="flex-1 text-center">
              <h2 className="text-xl text-white font-bold">Movie List</h2>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-4 gap-2 p-2">
            <div className="bg-gray-800 p-2 rounded-lg text-center">
              <div className="text-xl font-bold text-white">{totalMovies}</div>
              <div className="text-gray-400 text-sm">Total Movies</div>
            </div>
            <div className="bg-gray-800 p-2 rounded-lg text-center">
              <div className="text-xl font-bold text-white">{nowShowingMovies}</div>
              <div className="text-gray-400 text-sm">Now Showing</div>
            </div>
            <div className="bg-gray-800 p-2 rounded-lg text-center">
              <div className="text-xl font-bold text-white">{upcomingMovies}</div>
              <div className="text-gray-400 text-sm">Upcoming movies</div>
            </div>
            <div className="bg-gray-800 p-2 rounded-lg text-center">
              <div className="text-xl font-bold text-white">{todayShowtimes}</div>
              <div className="text-gray-400 text-sm">Today's showtimes</div>
            </div>
          </div>

          {/* Search and Add Movie */}
          <div className="flex justify-between items-center p-2">
            <div className="flex space-x-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search movies name...."
                  className="bg-gray-800 text-gray-300 pl-2 pr-8 py-1 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-700 w-48 text-sm"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <FaSearch className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
              </div>
              <div className="relative">
                <select
                  className="bg-gray-800 text-gray-300 pl-2 pr-8 py-1 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-700 appearance-none text-sm"
                  value={selectedGenre}
                  onChange={handleGenreChange}
                >
                  <option>All genres</option>
                  <option>Sci-Fi</option>
                  <option>Action</option>
                  <option>Fantasy</option>
                  <option>Animation</option>
                  <option>Adventure</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-gray-400">
                  <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
              <button className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md flex items-center text-sm">
                <FaSearch className="mr-1 text-xs" /> Search
              </button>
            </div>
            <Link to="/admin/add-movie" className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md flex items-center text-sm">
              + Add new movie
            </Link>
          </div>

          {/* Movie List Table */}
          <div className="flex-1 overflow-y-auto p-2">
            <div className="text-xs text-gray-400 mb-1">
              Showing {currentMovies.length} of {filteredMovies.length} movies
            </div>
            <div className="bg-gray-800 rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID #</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Movie name</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Genres</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Duration</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Showtime</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Revenue</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Operation</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {currentMovies.map((movie) => (
                    <tr key={movie.id} className="hover:bg-gray-700">
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-300">{movie.id}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-300">{movie.name}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-300">{movie.genres}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-300">{movie.duration} minutes</td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-300">{movie.showtime}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-300">${movie.revenue}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          movie.status === 'Now showing'
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                        }`}>
                          {movie.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs font-medium">
                        <div className="flex space-x-1">
                          <button className="text-blue-500 hover:text-blue-700 text-xs"><FaEye /></button>
                          <button className="text-yellow-500 hover:text-yellow-700 text-xs"><FaEdit /></button>
                          <button className="text-red-500 hover:text-red-700 text-xs"><FaTrash /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center space-x-1 mt-2">
              {Array.from({ length: Math.ceil(filteredMovies.length / moviesPerPage) }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => paginate(page)}
                  className={`w-6 h-6 rounded-md flex items-center justify-center text-xs ${
                    currentPage === page
                      ? 'bg-red-500 text-white'
                      : 'text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default MovieList;