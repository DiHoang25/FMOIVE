import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';
import { Modal, message } from 'antd';
import Pagination from '../../components/PaginationHomepage'; // Assuming this is a custom component
import SidebarLayout from '../../components/Sidebar-Admin';
import dayjs from 'dayjs';
import axios from 'axios';
import { motion } from 'framer-motion'; // Import motion for animations

const { confirm } = Modal;

const Promotions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [promotionData, setPromotionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortByDiscount, setSortByDiscount] = useState(null); // 'asc' | 'desc' | null
  const promotionsPerPage = 8;

  useEffect(() => {
    axios.get('http://localhost:5000/api/promotions')
      .then(res => {
        const formatted = res.data
          .map(promo => ({
            id: promo._id,
            promotionCode: promo.promotion_code || '-',
            title: promo.title,
            startDate: new Date(promo.start_date).toLocaleDateString(),
            endDate: new Date(promo.end_date).toLocaleDateString(),
            rawStartDate: new Date(promo.start_date),
            discountLevel: promo.discount ? `${promo.discount}%` : '-',
            rawDiscount: promo.discount || 0,
            createdAt: new Date(promo.createdAt), // để sort mới nhất
          }))
          .sort((a, b) => b.createdAt - a.createdAt); // mới nhất lên đầu

        setPromotionData(formatted);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        message.error('Failed to load promotions list.');
        setLoading(false);
      });
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };

  const handlePageChange = page => {
    if (page < 0 || page >= Math.ceil(filtered.length / promotionsPerPage)) return;
    setCurrentPage(page);
  };

  const handleDelete = promotion => {
    confirm({
      title: 'Confirm Delete',
      content: `Are you sure you want to delete "${promotion.title}"?`,
      okText: 'Delete',
      cancelText: 'Cancel',
      okType: 'danger',
      onOk: () => {
        fetch(`http://localhost:5000/api/promotions/${promotion.id}`, { method: 'DELETE' })
          .then(res => res.json())
          .then(data => {
            message.success('Promotion deleted successfully.');
            setPromotionData(prev => prev.filter(p => p.id !== promotion.id));
            const remaining = promotionData.length - 1;
            const maxPage = Math.ceil(remaining / promotionsPerPage) - 1;
            if (currentPage > maxPage) setCurrentPage(maxPage);
          })
          .catch(() => message.error('Failed to delete promotion.'));
      },
      className: 'custom-ant-modal', // Apply custom modal styling
    });
  };

  const filtered = promotionData
    .filter(p => {
      const term = searchTerm.toLowerCase();
      return (
        p.title.toLowerCase().includes(term) ||
        p.promotionCode.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      if (sortByDiscount) {
        return sortByDiscount === 'asc'
          ? a.rawDiscount - b.rawDiscount
          : b.rawDiscount - a.rawDiscount;
      }
      return 0;
    });

  const totalPages = Math.ceil(filtered.length / promotionsPerPage);
  const visible = filtered.slice(
    currentPage * promotionsPerPage,
    (currentPage + 1) * promotionsPerPage
  );

  const toggleDiscountSort = () => {
    if (!sortByDiscount) setSortByDiscount('asc');
    else if (sortByDiscount === 'asc') setSortByDiscount('desc');
    else setSortByDiscount(null);
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
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent rounded-20">
                Promotion Management
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
                    placeholder="Search promotion..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full sm:w-80 border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                  />
                  <Link
                    to="/admin/add-promotion"
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-none text-white hover:text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl text-center flex items-center justify-center"
                    style={{ height: '48px' }}
                  >
                    + Add New Promotion
                  </Link>
                </div>

                {loading ? (
                  <div className="text-center py-8 text-gray-400 flex flex-col items-center justify-center">
                    <FaSpinner className="animate-spin inline mr-2 text-3xl text-blue-400 mb-3" />
                    <span className="text-lg">Loading promotions...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-sm text-gray-400 mb-4">
                      Showing {filtered.length} promotions
                    </div>
                    <div className="bg-slate-900/30 rounded-xl overflow-hidden overflow-x-auto border border-slate-600/30 shadow-inner">
                      <table className="min-w-full divide-y divide-slate-700">
                        <thead className="bg-slate-700/50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Promotion Code</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Start Date</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">End Date</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider cursor-pointer" onClick={toggleDiscountSort}>
                              Discount
                              {sortByDiscount === 'asc' ? ' ↑' : sortByDiscount === 'desc' ? ' ↓' : ''}
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-300 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-slate-800/40 divide-y divide-slate-700">
                          {visible.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="px-6 py-8 text-sm text-gray-400 text-center">No promotions found.</td>
                            </tr>
                          ) : (
                            visible.map((p, idx) => (
                              <tr key={p.id} className="hover:bg-slate-700/60 transition-colors duration-200">
                                <td className="px-6 py-4 text-sm text-gray-300">{currentPage * promotionsPerPage + idx + 1}</td>
                                <td className="px-6 py-4 text-sm text-white font-medium">{p.promotionCode}</td>
                                <td className="px-6 py-4 text-sm text-gray-300">{p.title}</td>
                                <td className="px-6 py-4 text-sm text-gray-300">{dayjs(p.rawStartDate).format('DD/MM/YYYY')}</td>
                                <td className="px-6 py-4 text-sm text-gray-300">{p.endDate}</td>
                                <td className="px-6 py-4 text-sm text-gray-300">{p.discountLevel}</td>
                                <td className="px-6 py-4 text-center">
                                  <div className="flex justify-center gap-4">
                                    <Link
                                      to={`/admin/promotions/edit-promotion/${p.id}`}
                                      className="text-yellow-400 hover:text-yellow-500 text-xl transition-colors duration-200"
                                      title="Edit Promotion"
                                    >
                                      <FaEdit />
                                    </Link>
                                    <button
                                      onClick={() => handleDelete(p)}
                                      className="text-red-400 hover:text-red-500 text-xl transition-colors duration-200"
                                      title="Delete Promotion"
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
    </SidebarLayout>
  );
};

export default Promotions;
