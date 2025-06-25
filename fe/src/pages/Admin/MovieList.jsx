// ... import giữ nguyên
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';
import { Switch, Modal, message } from 'antd';
import Pagination from '../../components/PaginationHomepage';
import SidebarLayout from '../../components/Sidebar-Admin';
import dayjs from 'dayjs';

const MovieList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/movies');
        if (!response.ok) throw new Error('Failed to fetch movies');
        const data = await response.json();
        setMovies(data);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, movies]);

  const totalMovies = movies.length;
  const nowShowing = movies.filter(movie => movie.status === 'Now showing').length;
  const upcomingMovies = movies.filter(movie => movie.status === 'Comming Soon').length;
  const todaysShowtimes = movies.reduce((total, movie) => total + (movie.showtime || 0), 0);

  const toggleStatus = (movie) => {
    const newStatus = movie.status === 'Now showing' ? 'Comming Soon' : 'Now showing';
    Modal.confirm({
      title: 'Confirm Status Change',
      content: `Are you sure you want to change status of "${movie.name}" to "${newStatus}"?`,
      okText: 'Confirm',
      cancelText: 'Cancel',
      okType: 'primary',
      okButtonProps: {
        style: {
          backgroundColor: '#1677ff',
          color: 'white',
          borderColor: '#1677ff',
        },
      },
      onOk: () => {
        const updated = movies.map(m =>
          m._id === movie._id ? { ...m, status: newStatus } : m
        );
        setMovies(updated);
        message.success(`Status of "${movie.name}" changed to "${newStatus}"`);
      },
    });
  };

  const confirmDelete = async (movie) => {
    Modal.confirm({
      title: 'Confirm Delete',
      content: `Are you sure you want to delete "${movie.name}"?`,
      okText: 'Delete',
      cancelText: 'Cancel',
      okType: 'danger',
      onOk: async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/movies/${movie._id}`, {
            method: 'DELETE'
          });
          if (!response.ok) throw new Error('Failed to delete movie');
          const updated = movies.filter(m => m._id !== movie._id);
          setMovies(updated);
          message.success(`"${movie.name}" has been deleted.`);
        } catch (error) {
          console.error('Error deleting movie:', error);
          message.error(`Failed to delete "${movie.name}": ${error.message}`);
        }
      },
    });
  };

  const showMovieDetails = (movie) => {
    setSelectedMovie(movie);
    setModalVisible(true);
  };

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const filteredMovies = movies.filter(movie => {
    const nameMatch = movie.name?.trim().toLowerCase().includes(searchTerm.toLowerCase().trim());
    return nameMatch;
  });

  const totalPages = Math.ceil(filteredMovies.length / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedMovies = filteredMovies.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );
  

  const handlePageChange = page => {
    if (page < 0 || page >= Math.ceil(filteredMovies.length / itemsPerPage)) return;
    setCurrentPage(page);
  };

  return (
    <SidebarLayout>
      <div className="p-6 text-white">
        <div className="p-4 flex items-center justify-between">
          <div className="flex-1 text-center">
            <h2 className="text-2xl font-bold">Movie Management</h2>
          </div>
        </div>

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
            <p className="text-sm text-gray-100">Comming Soon</p>
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
            className="bg-gray-700 text-white px-3 py-2 rounded-md w-64"
          />
          <Link to="/admin/add-movie" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md">
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
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 text-gray-300 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    <FaSpinner className="animate-spin mr-2" /> Loading movies...
                  </td>
                </tr>
              ) : paginatedMovies.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-400">No movies found.</td>
                </tr>
              ) : (
                paginatedMovies.map((movie, index) => (
                  <tr key={movie._id} className="hover:bg-gray-700 transition">
                    <td className="px-4 py-2">{(currentPage  * itemsPerPage + index + 1)}</td>
                    <td className="px-4 py-2">{movie.name}</td>
                    <td className="px-4 py-2">{movie.genres}</td>
                    <td className="px-4 py-2">{movie.running_time} min</td>
                    <td className="px-4 py-2">
                      <Switch
                        checked={movie.status === 'Now showing'}
                        onChange={() => toggleStatus(movie)}
                        checkedChildren="Now Showing"
                        unCheckedChildren="Comming Soon"
                        style={{
                          backgroundColor: movie.status === 'Now showing' ? '#22c55e' : '#ef4444',
                        }}
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex justify-center gap-4">
                        <button onClick={() => showMovieDetails(movie)} className="text-blue-400 hover:text-blue-600 text-xl"><FaEye /></button>
                        <button onClick={() => window.location.href = '/admin/movie-list/edit-movie/' + movie._id} className="text-yellow-400 hover:text-yellow-600 text-xl"><FaEdit /></button>
                        <button onClick={() => confirmDelete(movie)} className="text-red-400 hover:text-red-600 text-xl"><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {totalPages > 0 && (
            <div className="py-4">
              <Pagination
                currentPage={currentPage }
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>

        <Modal
          title="Movie Details"
          open={modalVisible}
          onOk={() => setModalVisible(false)}
          onCancel={() => setModalVisible(false)}
          width={700}
          bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
          footer={[
            <button key="close" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md" onClick={() => setModalVisible(false)}>
              Close
            </button>,
          ]}
        >
          {selectedMovie && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-black">
                <div><p className="text-gray-400">Movie Name:</p><p>{selectedMovie.name}</p></div>
                <div><p className="text-gray-400">Actor(s):</p><p>{selectedMovie.actors}</p></div>
                <div><p className="text-gray-400">Production Company:</p><p>{selectedMovie.production_company}</p></div>
                <div><p className="text-gray-400">Director:</p><p>{selectedMovie.director}</p></div>
                <div><p className="text-gray-400">Duration:</p><p>{selectedMovie.running_time} minutes</p></div>
                <div><p className="text-gray-400">Version:</p><p>{selectedMovie.version}</p></div>
                <div><p className="text-gray-400">Start Date:</p><p>{dayjs(selectedMovie.start_date).format('DD/MM/YYYY')}</p></div>
                <div><p className="text-gray-400">End Date:</p><p>{dayjs(selectedMovie.end_date).format('DD/MM/YYYY')}</p></div>
                <div className="col-span-2">
                  <p className="text-gray-400">Trailer Link:</p>
                  <a href={selectedMovie.trailer_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{selectedMovie.trailer_link}</a>
                </div>
                <div><p className="text-gray-400">Genres:</p><p>{Array.isArray(selectedMovie.genres) ? selectedMovie.genres.join(', ') : selectedMovie.genres}</p></div>
                <div className="col-span-2">
                  <p className="text-gray-400">Banner Image:</p>
                  <img src={selectedMovie.banner_url} alt="Banner" className="w-full rounded-md shadow" />
                </div>
                <div className="col-span-2">
                  <p className="text-gray-400">Movie Description:</p>
                  <p>{selectedMovie.description}</p>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </SidebarLayout>
  );
};

export default MovieList;
