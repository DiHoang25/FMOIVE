import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaEdit, FaTrash, FaSpinner } from "react-icons/fa";
import { Modal, message, Tag } from "antd";
import Pagination from "../../components/PaginationHomepage"; // Assuming this is a custom component
import SidebarLayout from "../../components/Sidebar-Admin";
import dayjs from "dayjs";
import axios from "axios";
import { motion } from "framer-motion"; // Import motion for animations

const MovieList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 8;
  const [roomName, setRoomName] = useState("");

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/movies");
        const sortedMovies = response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setMovies(sortedMovies);
      } catch (error) {
        console.error("Error fetching movies:", error);
        message.error("Failed to fetch movies. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  useEffect(() => {
    const fetchRoomName = async () => {
      if (!selectedMovie?.cinema_room) return;

      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/theater/rooms/${selectedMovie.cinema_room}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setRoomName(res.data?.room?.roomName || "Unknown Room");
      } catch (error) {
        console.error("Lỗi lấy tên phòng:", error);
        setRoomName("Unknown Room");
      }
    };

    fetchRoomName();
  }, [selectedMovie?.cinema_room]);

  useEffect(() => {
    movies.forEach((movie) => {
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
    if (today.isBefore(start)) return "coming_soon";
    if (today.isAfter(end)) return "ended";
    return "now_showing";
  };

  const totalMovies = movies.length;
  const nowShowing = movies.filter(
    (movie) => getCalculatedStatus(movie) === "now_showing"
  ).length;
  const upcomingMovies = movies.filter(
    (movie) => getCalculatedStatus(movie) === "coming_soon"
  ).length;

  const confirmDelete = async (movie) => {
    Modal.confirm({
      title: "Confirm Delete",
      content: `Are you sure you want to delete "${movie.name}"?`,
      okText: "Delete",
      cancelText: "Cancel",
      okType: "danger",
      onOk: async () => {
        try {
          await axios.delete(`http://localhost:5000/api/movies/${movie._id}`);
          const updated = movies.filter((m) => m._id !== movie._id);
          setMovies(updated);
          message.success(`"${movie.name}" has been deleted.`);
        } catch (error) {
          console.error("Error deleting movie:", error);
          message.error(`Failed to delete "${movie.name}": ${error.message}`);
        }
      },
      className: "custom-ant-modal", // Apply custom modal styling
    });
  };

  const showMovieDetails = (movie) => {
    setSelectedMovie(movie);
    setModalVisible(true);
  };

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const filteredMovies = movies.filter((movie) =>
    movie.name?.trim().toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const totalPages = Math.ceil(filteredMovies.length / itemsPerPage);

  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      // Adjusted condition for 0-indexed page
      setCurrentPage(totalPages - 1);
    } else if (totalPages === 0 && currentPage !== 0) {
      setCurrentPage(0);
    }
  }, [totalPages, currentPage]);

  const paginatedMovies = filteredMovies.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePageChange = (page) => {
    // Page from PaginationHomepage is 0-indexed, so no change needed here
    setCurrentPage(page);
  };

  return (
    <SidebarLayout>
      {/* Custom Ant Design Modal styles */}
      <style>{`
          .custom-ant-modal .ant-modal-content {
              background-color: #1e293b !important; /* slate-800 */
              border-radius: 12px !important;
              border: 1px solid rgba(71, 85, 105, 0.4) !important; /* slate-600/40 */
              backdrop-filter: blur(10px) !important;
              -webkit-backdrop-filter: blur(10px) !important;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1) !important;
              color: #e2e8f0 !important; /* gray-200 */
          }
          .custom-ant-modal .ant-modal-confirm-title {
              color: #e2e8f0 !important; /* gray-200 */
          }
          .custom-ant-modal .ant-modal-confirm-content {
              color: #cbd5e1 !important; /* gray-300 */
          }
          .custom-ant-modal .ant-modal-confirm-btns .ant-btn-primary {
              background-color: #dc2626 !important; /* red-600 */
              border-color: #dc2626 !important;
              color: white !important;
          }
          .custom-ant-modal .ant-modal-confirm-btns .ant-btn-default {
              background-color: #475569 !important; /* slate-600 */
              border-color: #475569 !important;
              color: white !important;
          }
          .custom-ant-modal .ant-modal-confirm-btns .ant-btn-default:hover {
              background-color: #64748b !important; /* slate-500 */
              border-color: #64748b !important;
          }
          .custom-ant-modal .ant-modal-confirm-btns .ant-btn-primary:hover {
              background-color: #b91c1c !important; /* red-700 */
              border-color: #b91c1c !important;
          }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent rounded-20">
                Movie Management
              </h1>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div
              className="w-full max-w-full mx-auto px-4 bg-slate-800/70 backdrop-blur-lg border border-slate-600/40 shadow-2xl overflow-visible"
              style={{ borderRadius: "20px" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/8 via-transparent to-cyan-600/8 pointer-events-none" />
              <div className="relative p-5 lg:p-6">
                {/* Stats cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-slate-900/30 backdrop-blur-sm rounded-2xl p-6 text-center border border-slate-600/30 transition-all duration-300 hover:scale-[1.02] shadow-md"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                      {/* Icon for Total Movies */}
                    </div>
                    <p className="text-slate-300 text-sm md:text-base">
                      Total Movies
                    </p>
                    <h2 className="text-xl md:text-3xl font-bold text-white mt-1">
                      {totalMovies}
                    </h2>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-slate-900/30 backdrop-blur-sm rounded-2xl p-6 text-center border border-slate-600/30 transition-all duration-300 hover:scale-[1.02] shadow-md"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                      {/* Icon for Now Showing */}
                    </div>
                    <p className="text-slate-300 text-sm md:text-base">
                      Now Showing
                    </p>
                    <h2 className="text-xl md:text-3xl font-bold text-white mt-1">
                      {nowShowing}
                    </h2>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="bg-slate-900/30 backdrop-blur-sm rounded-2xl p-6 text-center border border-slate-600/30 transition-all duration-300 hover:scale-[1.02] shadow-md"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                      {/* Icon for Coming Soon */}
                    </div>
                    <p className="text-slate-300 text-sm md:text-base">
                      Coming Soon
                    </p>
                    <h2 className="text-xl md:text-3xl font-bold text-white mt-1">
                      {upcomingMovies}
                    </h2>
                  </motion.div>
                </div>

                {/* Search and Add Movie */}
                <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <input
                    type="text"
                    placeholder="Search movie..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full sm:w-80 border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                  />
                  <Link
                    to="/admin/add-movie"
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-none text-white hover:text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl text-center flex items-center justify-center"
                    style={{ height: "48px" }}
                  >
                    + Add New Movie
                  </Link>
                </div>

                {/* Movie List Table */}
                {loading ? (
                  <div className="text-center py-8 text-gray-400 flex flex-col items-center justify-center">
                    <FaSpinner className="animate-spin inline mr-2 text-3xl text-blue-400 mb-3" />
                    <span className="text-lg">Loading movies...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-sm text-gray-400 mb-4">
                      Showing {filteredMovies.length} movies
                    </div>

                    <div className="bg-slate-900/30 rounded-xl overflow-hidden overflow-x-auto border border-slate-600/30 shadow-inner">
                      <table className="min-w-full divide-y divide-slate-700">
                        <thead className="bg-slate-700/50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                              ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                              Genres
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                              Duration
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-300 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-slate-800/40 divide-y divide-slate-700">
                          {paginatedMovies.length === 0 ? (
                            <tr>
                              <td
                                colSpan="6"
                                className="px-6 py-8 text-sm text-gray-400 text-center"
                              >
                                No movies found.
                              </td>
                            </tr>
                          ) : (
                            paginatedMovies.map((movie, index) => {
                              const status = getCalculatedStatus(movie);
                              return (
                                <tr
                                  key={movie._id}
                                  className="hover:bg-slate-700/60 transition-colors duration-200"
                                >
                                  <td className="px-6 py-4 text-sm text-gray-300">
                                    {currentPage * itemsPerPage + index + 1}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-white font-medium">
                                    {movie.name}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-300">
                                    {Array.isArray(movie.genres)
                                      ? movie.genres.join(", ")
                                      : movie.genres}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-300">
                                    {movie.running_time} min
                                  </td>
                                  <td className="px-6 py-4">
                                    {status === "now_showing" && (
                                      <Tag
                                        color="#22c55e"
                                        className="rounded-full px-3 py-1 font-semibold text-white border border-green-600"
                                      >
                                        Now Showing
                                      </Tag>
                                    )}
                                    {status === "coming_soon" && (
                                      <Tag
                                        color="#f97316"
                                        className="rounded-full px-3 py-1 font-semibold text-white border border-orange-600"
                                      >
                                        Coming Soon
                                      </Tag>
                                    )}
                                    {status === "ended" && (
                                      <Tag
                                        color="#ef4444"
                                        className="rounded-full px-3 py-1 font-semibold text-white border border-red-600"
                                      >
                                        Ended
                                      </Tag>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center gap-4">
                                      <button
                                        onClick={() => showMovieDetails(movie)}
                                        className="text-blue-400 hover:text-blue-500 text-xl transition-colors duration-200"
                                        title="View Details"
                                      >
                                        <FaEye />
                                      </button>
                                      <button
                                        onClick={() =>
                                          (window.location.href =
                                            "/admin/movie-list/edit-movie/" +
                                            movie._id)
                                        }
                                        className="text-yellow-400 hover:text-yellow-500 text-xl transition-colors duration-200"
                                        title="Edit Movie"
                                      >
                                        <FaEdit />
                                      </button>
                                      <button
                                        onClick={() => confirmDelete(movie)}
                                        className="text-red-400 hover:text-red-500 text-xl transition-colors duration-200"
                                        title="Delete Movie"
                                      >
                                        <FaTrash />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {totalPages > 0 && (
                      <div className="mt-6 flex justify-center">
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={handlePageChange}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
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
                  <h2 className="text-3xl font-bold mb-2">
                    {selectedMovie.name}
                  </h2>
                  <div className="w-16 h-1 bg-red-600 rounded-full"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-400 text-sm">Genres</p>
                    <p className="font-semibold">
                      {Array.isArray(selectedMovie.genres)
                        ? selectedMovie.genres.join(", ")
                        : selectedMovie.genres}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Duration</p>
                    <p className="font-semibold">
                      {selectedMovie.running_time} minutes
                    </p>
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
                    <p className="font-semibold">
                      {selectedMovie.production_company}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Start Date</p>
                    <p className="font-semibold">
                      {dayjs(selectedMovie.start_date).format("DD/MM/YYYY")}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">End Date</p>
                    <p className="font-semibold">
                      {dayjs(selectedMovie.end_date).format("DD/MM/YYYY")}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Cinema Room</p>
                    <p className="font-semibold">{roomName}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Trailer</p>
                  <a
                    href={selectedMovie.trailer_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline"
                  >
                    {selectedMovie.trailer_link}
                  </a>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Description</p>
                  <p className="font-medium leading-relaxed">
                    {selectedMovie.description}
                  </p>
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
    </SidebarLayout>
  );
};

export default MovieList;
