import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';
import { Modal, message, Tag } from 'antd';
import Pagination from '../../components/PaginationHomepage';
import SidebarLayout from '../../components/Sidebar-Admin';
import dayjs from 'dayjs';
import axios from 'axios';

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
        const response = await axios.get('http://localhost:5000/api/movies');
        const sortedMovies = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setMovies(sortedMovies);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  useEffect(() => {
    movies.forEach(movie => {
      if (movie.banner_url) {
        const img = new Image();
        img.src = movie.banner_url;
      }
    });
  }, [movies]);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, movies]);

  const getCalculatedStatus = (movie) => {
    const today = dayjs();
    const start = dayjs(movie.start_date);
    const end = dayjs(movie.end_date);
    if (today.isBefore(start)) return 'coming_soon';
    if (today.isAfter(end)) return 'ended';
    return 'now_showing';
  };

  const totalMovies = movies.length;
  const nowShowing = movies.filter(movie => getCalculatedStatus(movie) === 'now_showing').length;
  const upcomingMovies = movies.filter(movie => getCalculatedStatus(movie) === 'coming_soon').length;

  const confirmDelete = async (movie) => {
    Modal.confirm({
      title: 'Confirm Delete',
      content: `Are you sure you want to delete "${movie.name}"?`,
      okText: 'Delete',
      cancelText: 'Cancel',
      okType: 'danger',
      onOk: async () => {
        try {
          await axios.delete(`http://localhost:5000/api/movies/${movie._id}`);
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

  const filteredMovies = movies.filter(movie =>
    movie.name?.trim().toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

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
    if (page < 0 || page >= totalPages) return;
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

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-700 rounded-lg p-4 text-center shadow">
            <p className="text-sm text-gray-300">Total Movies</p>
            <h2 className="text-xl font-bold">{totalMovies}</h2>
          </div>
          <div className="bg-red-700 rounded-lg p-3 text-center shadow">
            <p className="text-sm text-gray-100">Now Showing</p>
            <h2 className="text-xl font-bold">{nowShowing}</h2>
          </div>
          <div className="bg-yellow-600 rounded-lg p-3 text-center shadow">
            <p className="text-sm text-gray-100">Coming Soon</p>
            <h2 className="text-xl font-bold">{upcomingMovies}</h2>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Search movie..."
            value={searchTerm}
            onChange={handleSearch}
            className="bg-gray-700 text-white px-3 py-2 rounded-md w-64"
          />
          <Link
            to="/admin/add-movie"
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow flex items-center"
          >
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
                paginatedMovies.map((movie, index) => {
                  const status = getCalculatedStatus(movie);
                  return (
                    <tr key={movie._id} className="hover:bg-gray-700 transition">
                      <td className="px-4 py-2">{(currentPage * itemsPerPage + index + 1)}</td>
                      <td className="px-4 py-2">{movie.name}</td>
                      <td className="px-4 py-2">{movie.genres}</td>
                      <td className="px-4 py-2">{movie.running_time} min</td>
                      <td className="px-4 py-2">
                        {status === 'now_showing' && <Tag color="green">Now Showing</Tag>}
                        {status === 'coming_soon' && <Tag color="orange">Coming Soon</Tag>}
                        {status === 'ended' && <Tag color="red">Ended</Tag>}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <div className="flex justify-center gap-4">
                          <button onClick={() => showMovieDetails(movie)} className="text-blue-400 hover:text-blue-600 text-xl"><FaEye /></button>
                          <button onClick={() => window.location.href = '/admin/movie-list/edit-movie/' + movie._id} className="text-yellow-400 hover:text-yellow-600 text-xl"><FaEdit /></button>
                          <button onClick={() => confirmDelete(movie)} className="text-red-400 hover:text-red-600 text-xl"><FaTrash /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          {totalPages > 0 && (
            <div className="py-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>

        {/* Movie Detail Modal */}
        <Modal
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          centered
          width={800}
          className="custom-modal"
        >
          {selectedMovie && (
            <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl text-white">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-shrink-0">
                  <img
                    src={selectedMovie.image_url || "/placeholder.svg"}
                    alt="Banner"
                    className="w-64 h-96 rounded-xl object-cover shadow-2xl border-2 border-gray-700"
                  />
                </div>
                <div className="flex-1 space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">{selectedMovie.name}</h2>
                    <div className="w-16 h-1 bg-red-600 rounded-full"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-400 text-sm">Genres</p>
                      <p className="font-semibold">{Array.isArray(selectedMovie.genres) ? selectedMovie.genres.join(', ') : selectedMovie.genres}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Duration</p>
                      <p className="font-semibold">{selectedMovie.running_time} minutes</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Version</p>
                      <p className="font-semibold">{selectedMovie.version}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Director</p>
                      <p className="font-semibold">{selectedMovie.director}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Actors</p>
                      <p className="font-semibold">{selectedMovie.actors}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Company</p>
                      <p className="font-semibold">{selectedMovie.production_company}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Start Date</p>
                      <p className="font-semibold">{dayjs(selectedMovie.start_date).format('DD/MM/YYYY')}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">End Date</p>
                      <p className="font-semibold">{dayjs(selectedMovie.end_date).format('DD/MM/YYYY')}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Trailer</p>
                    <a href={selectedMovie.trailer_link} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
                      {selectedMovie.trailer_link}
                    </a>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Description</p>
                    <p className="font-medium leading-relaxed">{selectedMovie.description}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setModalVisible(false)}
                className="mt-8 w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.02]"
              >
                Close
              </button>
            </div>
          )}
        </Modal>
      </div>
    </SidebarLayout>
  );
};

export default MovieList;
