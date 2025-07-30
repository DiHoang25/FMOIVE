import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Modal, message } from 'antd';
import SidebarLayout from '../../components/Sidebar-Admin';
import { FaEye, FaTrash, FaSpinner, FaEdit } from 'react-icons/fa';
import Pagination from '../../components/PaginationHomepage'; // Assuming this is a custom component
import dayjs from 'dayjs';
import { motion } from 'framer-motion'; // Import motion for animations

const MovieNewsList = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 6;

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/movie-news');
        const data = await res.json();
        setNews(data);
      } catch (err) {
        console.error('Fetch failed:', err);
        message.error('Failed to load news');
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  useEffect(() => {
    setCurrentPage(0); // Reset page when search term changes
  }, [searchTerm]);

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const handleDelete = async (item) => {
    Modal.confirm({
      title: 'Confirm Delete',
      content: `Are you sure you want to delete "${item.title}"?`,
      okText: 'Yes',
      cancelText: 'No',
      okType: 'danger',
      onOk: async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/movie-news/${item._id}/delete`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!res.ok) throw new Error('Failed to delete news');
          setNews((prev) => prev.filter((n) => n._id !== item._id));
          message.success('News deleted successfully.');
        } catch (err) {
          console.error(err);
          message.error('Delete failed');
        }
      },
      className: 'custom-ant-modal', // Apply custom modal styling
    });
  };

  const filteredNews = news.filter(item =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
    item.author?.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
    item.short_description?.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);

  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(totalPages - 1);
    } else if (totalPages === 0 && currentPage !== 0) {
      setCurrentPage(0);
    }
  }, [totalPages, currentPage]);

  const paginatedNews = filteredNews.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

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
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent rounded-20">
                Movie News Management
              </h1>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
            <div
              className="w-full max-w-full mx-auto px-4 bg-slate-800/70 backdrop-blur-lg border border-slate-600/40 shadow-2xl overflow-visible"
              style={{ borderRadius: '20px' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/8 via-transparent to-cyan-600/8 pointer-events-none" />
              <div className="relative p-5 lg:p-6">
                <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <input
                    type="text"
                    placeholder="Search movie news..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full sm:w-80 border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                  />
                  <Link
                    to="/admin/add-movienews"
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-none text-white hover:text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl text-center flex items-center justify-center"
                    style={{ height: '48px' }}
                  >
                    + Add News
                  </Link>
                </div>

                <div className="text-sm text-gray-400 mb-4">
                  Showing {filteredNews.length} news articles
                </div>

                <div className="bg-slate-900/30 rounded-xl overflow-hidden overflow-x-auto border border-slate-600/30 shadow-inner">
                  <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-700/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">#</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Author</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-slate-800/40 divide-y divide-slate-700">
                      {loading ? (
                        <tr>
                          <td colSpan="5" className="text-center py-8 text-gray-400 flex flex-col items-center justify-center">
                            <FaSpinner className="animate-spin inline mr-2 text-3xl text-blue-400 mb-3" />
                            <span className="text-lg">Loading news...</span>
                          </td>
                        </tr>
                      ) : paginatedNews.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-sm text-gray-400 text-center">No news found.</td>
                        </tr>
                      ) : (
                        paginatedNews.map((item, idx) => (
                          <tr key={item._id} className="hover:bg-slate-700/60 transition-colors duration-200">
                            <td className="px-6 py-4 text-sm text-gray-300">{currentPage * itemsPerPage + idx + 1}</td>
                            <td className="px-6 py-4 text-sm text-white font-medium">{item.title}</td>
                            <td className="px-6 py-4 text-sm text-gray-300">{item.author}</td>
                            <td className="px-6 py-4 text-sm text-gray-300">{dayjs(item.date).format('DD/MM/YYYY')}</td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex justify-center items-center gap-4">
                                <button
                                  onClick={() => {
                                    setSelectedNews(item);
                                    setModalVisible(true);
                                  }}
                                  className="text-blue-400 hover:text-blue-500 text-xl transition-colors duration-200"
                                  title="View Details"
                                >
                                  <FaEye />
                                </button>

                                <Link
                                  to={`/admin/edit-movienews/${item._id}`}
                                  className="text-yellow-400 hover:text-yellow-500 text-xl transition-colors duration-200"
                                  title="Edit News"
                                >
                                  <FaEdit />
                                </Link>

                                <button
                                  onClick={() => handleDelete(item)}
                                  className="text-red-400 hover:text-red-500 text-xl transition-colors duration-200"
                                  title="Delete News"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="mt-6 flex justify-center">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <Modal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        centered // Center the modal
        width={700}
        className="custom-ant-modal" // Apply custom modal styling
      >
        {selectedNews && (
          <div className="bg-slate-800/90 backdrop-blur-lg border border-slate-600/40 p-8 rounded-2xl shadow-lg relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/8 via-transparent to-cyan-600/8 pointer-events-none" />
            <div className="relative z-10 text-white space-y-4"> {/* Ensure text is white */}
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {selectedNews.title}
              </h3>
              <div className="w-20 h-1 bg-red-600 rounded-full mb-4"></div> {/* Separator line */}

              <p className="text-gray-300"><strong>Author:</strong> <span className="text-white">{selectedNews.author}</span></p>
              <p className="text-gray-300"><strong>Date:</strong> <span className="text-white">{dayjs(selectedNews.date).format('DD/MM/YYYY')}</span></p>
              {selectedNews.image_url && (
                <img
                  src={selectedNews.image_url}
                  alt="News"
                  className="w-full h-64 object-cover rounded-xl shadow-lg border border-slate-700"
                  onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x384/1f2937/e2e8f0?text=No+Image" }}
                />
              )}
              <p className="text-gray-300 leading-relaxed">{selectedNews.short_description}</p>
              <div className="text-gray-200 border-t border-slate-700 pt-3" dangerouslySetInnerHTML={{ __html: selectedNews.content }} />
            </div>
            <button
              onClick={() => setModalVisible(false)}
              className="mt-8 w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-8 rounded-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg"
              style={{ height: '48px', borderRadius: '12px' }}
            >
              Close
            </button>
          </div>
        )}
      </Modal>
    </SidebarLayout>
  );
};

export default MovieNewsList;
