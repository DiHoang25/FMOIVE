import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { Modal, message } from 'antd';
import SidebarLayout from '../../components/Sidebar-Admin';

const Promotions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const promotionsPerPage = 8;
  const [promotionData, setPromotionData] = useState([
    { id: '05202501', title: 'Summer Sale 2025', startTime: '2025-06-01 00:00', endTime: '2025-06-30 23:59', discountLevel: '20%', detail: '20% off on all summer' },
    { id: '05202502', title: 'New Customer Discount', startTime: '2025-01-01 00:00', endTime: '2025-12-31 23:59', discountLevel: '10%', detail: '10% off on first booked' },
    { id: '05202503', title: 'Valentine', startTime: '2025-02-14 00:00', endTime: '2025-02-14 23:59', discountLevel: '50%', detail: '50% off for couples' },
    { id: '05202504', title: 'Happy New Year', startTime: '2025-01-01 00:00', endTime: '2025-01-03 23:59', discountLevel: '30%', detail: 'Happy new year' },
    { id: '05202505', title: 'Christmas', startTime: '2024-12-20 00:00', endTime: '2024-12-26 23:59', discountLevel: '25%', detail: '25% off on christmas' },
    { id: '05202506', title: 'End of Season Clearance', startTime: '2024-08-25 00:00', endTime: '2024-09-10 23:59', discountLevel: '15%', detail: 'Up to 15% off' },
  ]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDelete = (promotion) => {
    Modal.confirm({
      title: 'Confirm Delete',
      content: `Are you sure you want to delete "${promotion.title}"?`,
      okText: 'Delete',
      cancelText: 'Cancel',
      okType: 'danger',
      onOk: () => {
        const updatedPromotions = promotionData.filter(p => p.id !== promotion.id);
        setPromotionData(updatedPromotions);
        message.success(`"${promotion.title}" has been deleted.`);
      },
    });
  };

  const filteredPromotions = promotionData.filter(promotion =>
    promotion.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastPromotion = currentPage * promotionsPerPage;
  const indexOfFirstPromotion = indexOfLastPromotion - promotionsPerPage;
  const currentPromotions = filteredPromotions.slice(indexOfFirstPromotion, indexOfLastPromotion);

  return (
    <SidebarLayout>
      <div className="flex h-screen text-gray-300">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 flex items-center justify-center">
            <h2 className="text-2xl text-white font-bold">Promotion Management</h2>
          </div>

          {/* Search & Add */}
          <div className="flex justify-between items-center p-4">
            <input
              type="text"
              placeholder="Search promotions..."
              className="bg-gray-800 text-gray-300 pl-4 pr-10 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-700 w-64"
              value={searchTerm}
              onChange={handleSearch}
            />
            <Link to="/admin/add-promotion" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center">
              <FaPlus className="mr-2" /> Add Promotion
            </Link>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="text-sm text-gray-400 mb-2">
              Showing {currentPromotions.length} promotion(s)
            </div>
            <div className="bg-gray-800 rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Start Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">End Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Discount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Detail</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {currentPromotions.map((promotion, index) => (
                    <tr key={promotion.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{indexOfFirstPromotion + index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{promotion.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{promotion.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{promotion.startTime}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{promotion.endTime}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{promotion.discountLevel}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{promotion.detail}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <button
                            className="text-yellow-400 hover:text-yellow-600 text-xl"
                            onClick={() => window.location.href = '/admin/promotions/edit-promotion/' + promotion.id}
                          ><FaEdit /></button>
                          <button
                            className="text-red-500 hover:text-red-700 text-xl"
                            onClick={() => handleDelete(promotion)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default Promotions;
