import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { Switch } from 'antd';
import SidebarLayout from '../../components/Sidebar-Admin';

const initialMovies = [
  { id: 'MV001', name: 'Avatar: The Way of Water', genres: 'Sci-Fi', duration: 192, showtime: 15, revenue: '2.5M', status: 'Now showing' },
  { id: 'MV002', name: 'Top Gun: Maverick', genres: 'Action', duration: 131, showtime: 12, revenue: '1.8M', status: 'Now showing' },
  { id: 'MV003', name: 'Black Panther: Wakanda Forever', genres: 'Action', duration: 161, showtime: 18, revenue: '3.2M', status: 'Now showing' },
  { id: 'MV004', name: 'The Batman', genres: 'Action', duration: 176, showtime: 8, revenue: '1.1M', status: 'Stop showing' },
  { id: 'MV005', name: 'Doctor Strange 2', genres: 'Fantasy', duration: 126, showtime: 14, revenue: '2.1M', status: 'Now showing' },
  { id: 'MV006', name: 'Minions: The Rise of Gru', genres: 'Animation', duration: 87, showtime: 10, revenue: '1.6M', status: 'Now showing' },
  { id: 'MV007', name: 'Jurassic World Dominion', genres: 'Adventure', duration: 147, showtime: 6, revenue: '0.9M', status: 'Stop showing' },
  { id: 'MV008', name: 'Thor: Love and Thunder', genres: 'Action', duration: 119, showtime: 16, revenue: '2.8M', status: 'Now showing' },
];

const MovieList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All genres');
  const [movies, setMovies] = useState(() => {
    const saved = localStorage.getItem('movie-list');
    return saved ? JSON.parse(saved) : initialMovies;
  });

  const totalMovies = movies.length;
  const nowShowing = movies.filter(movie => movie.status === 'Now showing').length;
  const upcomingMovies = movies.filter(movie => movie.status === 'Stop showing').length;
  const todaysShowtimes = movies.reduce((total, movie) => total + movie.showtime, 0);

  const toggleStatus = (id) => {
    const updated = movies.map(movie =>
      movie.id === id
        ? {
            ...movie,
            status: movie.status === 'Now showing' ? 'Stop showing' : 'Now showing',
          }
        : movie
    );
    setMovies(updated);
    localStorage.setItem('movie-list', JSON.stringify(updated));
  };

  const handleSearch = (e) => setSearchTerm(e.target.value);
  const handleGenreChange = (e) => setSelectedGenre(e.target.value);

  const filteredMovies = movies.filter(
    movie =>
      movie.name.trim().toLowerCase().includes(searchTerm.toLowerCase().trim()) &&
      (selectedGenre === 'All genres' || movie.genres === selectedGenre)
  );

  return (
    <SidebarLayout>
      <div className="p-6 text-white">
        <div className="p-4 flex items-center justify-between">
          <div className="flex-1 text-center">
            <h2 className="text-2xl text-white font-bold">Movie Management</h2>
          </div>
        </div>

        {/* THỐNG KÊ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-700 rounded-lg p-4 text-center shadow">
            <p className="text-sm text-gray-300">Total Movies</p>
            <h2 className="text-xl font-bold">{totalMovies}</h2>
          </div>
          <div className="bg-green-700 rounded-lg p-4 text-center shadow">
            <p className="text-sm text-gray-100">Now Showing</p>
            <h2 className="text-xl font-bold">{nowShowing}</h2>
          </div>
          <div className="bg-yellow-600 rounded-lg p-4 text-center shadow">
            <p className="text-sm text-gray-100">Upcoming Movies</p>
            <h2 className="text-xl font-bold">{upcomingMovies}</h2>
          </div>
          <div className="bg-blue-600 rounded-lg p-4 text-center shadow">
            <p className="text-sm text-gray-100">Today's Showtimes</p>
            <h2 className="text-xl font-bold">{todaysShowtimes}</h2>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-4">
          <input
            type="text"
            placeholder="Search movie..."
            value={searchTerm}
            onChange={handleSearch}
            className="bg-gray-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 w-64"
          />
          <select
            value={selectedGenre}
            onChange={handleGenreChange}
            className="bg-gray-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option>All genres</option>
            <option>Sci-Fi</option>
            <option>Action</option>
            <option>Fantasy</option>
            <option>Animation</option>
            <option>Adventure</option>
          </select>
          <Link to="/admin/add-movie" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow">
            + Add New Movie
          </Link>
        </div>

        <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900 text-gray-300 text-sm uppercase">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Genres</th>
                <th className="px-4 py-3 text-left">Duration</th>
                <th className="px-4 py-3 text-left">Showtimes</th>
                <th className="px-4 py-3 text-left">Revenue</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 text-gray-300 text-sm">
              {filteredMovies.map(movie => (
                <tr key={movie.id} className="hover:bg-gray-700 transition">
                  <td className="px-4 py-2">{movie.id}</td>
                  <td className="px-4 py-2">{movie.name}</td>
                  <td className="px-4 py-2">{movie.genres}</td>
                  <td className="px-4 py-2">{movie.duration} min</td>
                  <td className="px-4 py-2">{movie.showtime}</td>
                  <td className="px-4 py-2">${movie.revenue}</td>
                  <td className="px-4 py-2">
                    <Switch
                      checked={movie.status === 'Now showing'}
                      onChange={() => toggleStatus(movie.id)}
                      checkedChildren="Now Showing"
                      unCheckedChildren="Stop Showing"
                      style={{
                        backgroundColor: movie.status === 'Now showing' ? '#22c55e' : '#ef4444',
                      }}
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex justify-center gap-4">
                      <button className="text-blue-400 hover:text-blue-600 text-xl"><FaEye /></button>
                      <button className="text-yellow-400 hover:text-yellow-600 text-xl"><FaEdit /></button>
                      <button className="text-red-400 hover:text-red-600 text-xl"><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMovies.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-gray-400">
                    No movies found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default MovieList;
