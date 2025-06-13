import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SidebarLayout from '../../components/Sidebar-Admin';
import { FaSearch, FaEye, FaEdit, FaTrash, FaClipboardList, FaRegBuilding } from 'react-icons/fa';

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

  const handleSearch = (e) => setSearchTerm(e.target.value);
  const handleGenreChange = (e) => setSelectedGenre(e.target.value);

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
  const upcomingMovies = 6;
  const todayShowtimes = 156;

  return (
    <SidebarLayout>
      <div className="flex h-screen text-gray-300">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 flex items-center justify-center">
            <h2 className="text-2xl font-bold text-white">Movie List</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 px-4">
            <div className="bg-[#1e293b] p-4 rounded-lg shadow flex items-center space-x-4">
              <FaClipboardList className="text-2xl text-red-500" />
              <div>
                <div className="text-xl font-bold text-white">{totalMovies}</div>
                <div className="text-gray-400 text-sm">Total Movies</div>
              </div>
            </div>
            <div className="bg-[#1e293b] p-4 rounded-lg shadow flex items-center space-x-4">
              <FaEye className="text-2xl text-green-400" />
              <div>
                <div className="text-xl font-bold text-white">{nowShowingMovies}</div>
                <div className="text-gray-400 text-sm">Now Showing</div>
              </div>
            </div>
            <div className="bg-[#1e293b] p-4 rounded-lg shadow flex items-center space-x-4">
              <FaEdit className="text-2xl text-yellow-400" />
              <div>
                <div className="text-xl font-bold text-white">{upcomingMovies}</div>
                <div className="text-gray-400 text-sm">Upcoming Movies</div>
              </div>
            </div>
            <div className="bg-[#1e293b] p-4 rounded-lg shadow flex items-center space-x-4">
              <FaRegBuilding className="text-2xl text-blue-400" />
              <div>
                <div className="text-xl font-bold text-white">{todayShowtimes}</div>
                <div className="text-gray-400 text-sm">Today's Showtimes</div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center px-4 py-2">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Search movie name..."
                className="bg-gray-700 text-white pl-3 pr-8 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 w-56"
                value={searchTerm}
                onChange={handleSearch}
              />
              <select
                className="bg-gray-700 text-white pl-3 pr-8 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
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
            </div>
            <Link to="/admin/add-movie" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow text-sm font-medium">
              + Add New Movie
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="text-xs text-gray-400 mb-2">
              Showing {currentMovies.length} of {filteredMovies.length} movies
            </div>
            <div className="bg-gray-800 rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-700 text-sm">
                <thead className="bg-gray-900">
                  <tr>
                    {['ID #', 'Movie name', 'Genres', 'Duration', 'Showtime', 'Revenue', 'Status', 'Action'].map((head) => (
                      <th key={head} className="px-4 py-2 text-left font-medium text-gray-300 uppercase tracking-wider">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {currentMovies.map((movie) => (
                    <tr key={movie.id} className="hover:bg-gray-700 transition-colors duration-200">
                      <td className="px-4 py-2 text-gray-200">{movie.id}</td>
                      <td className="px-4 py-2 text-gray-200">{movie.name}</td>
                      <td className="px-4 py-2 text-gray-400">{movie.genres}</td>
                      <td className="px-4 py-2 text-gray-400">{movie.duration} min</td>
                      <td className="px-4 py-2 text-gray-400">{movie.showtime}</td>
                      <td className="px-4 py-2 text-gray-400">${movie.revenue}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          movie.status === 'Now showing' ? 'bg-green-500' : 'bg-red-500'
                        } text-white`}>
                          {movie.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex space-x-2 text-base">
                          <button className="text-blue-400 hover:text-blue-600"><FaEye /></button>
                          <button className="text-yellow-400 hover:text-yellow-600"><FaEdit /></button>
                          <button className="text-red-400 hover:text-red-600"><FaTrash /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-center items-center space-x-1 mt-4">
              {Array.from({ length: Math.ceil(filteredMovies.length / moviesPerPage) }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => paginate(page)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentPage === page
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  } transition-colors duration-200`}
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
