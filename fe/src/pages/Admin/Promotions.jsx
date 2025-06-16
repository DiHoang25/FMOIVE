import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SidebarLayout from '../../components/Sidebar-Admin';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const Promotions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const promotionsPerPage = 8;

  const promotions = [
    { id: '05202501', title: 'Summer Sale 2025', startTime: '2025-06-01 00:00', endTime: '2025-06-30 23:59', discountLevel: '20%', detail: '20% off on all summer' },
    { id: '05202502', title: 'New Customer Discount', startTime: '2025-01-01 00:00', endTime: '2025-12-31 23:59', discountLevel: '10%', detail: '10% off on first booked' },
    { id: '05202503', title: 'Valentine', startTime: '2025-02-14 00:00', endTime: '2025-02-14 23:59', discountLevel: '50%', detail: '50% off for couples' },
    { id: '05202504', title: 'Happy New Year', startTime: '2025-01-01 00:00', endTime: '2025-01-03 23:59', discountLevel: '30%', detail: 'Happy new year' },
    { id: '05202505', title: 'Christmas', startTime: '2024-12-20 00:00', endTime: '2024-12-26 23:59', discountLevel: '25%', detail: '25% off on christmas' },
    { id: '05202506', title: 'End of Season Clearance', startTime: '2024-08-25 00:00', endTime: '2024-09-10 23:59', discountLevel: '15%', detail: 'Up to 15% off' },
  ];

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredPromotions = promotions.filter(promotion =>
    promotion.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastPromotion = currentPage * promotionsPerPage;
  const indexOfFirstPromotion = indexOfLastPromotion - promotionsPerPage;
  const currentPromotions = filteredPromotions.slice(indexOfFirstPromotion, indexOfLastPromotion);


  return (
    <SidebarLayout>
      <div className="flex h-screen  text-gray-300">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">


          {/* Title */}
          <div className=" p-4 flex items-center justify-center">
            <h2 className="text-2xl text-white font-bold">Promotion Management</h2>
          </div>

          {/* Search and Add Promotion */}
          <div className="flex justify-between items-center p-4">
            <div className="flex space-x-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search promotions..."
                  className="bg-gray-800 text-gray-300 pl-4 pr-10 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-700 w-64"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>
            <Link to="/admin/add-promotion" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center">
              <FaPlus className="mr-2" /> Add Promotion
            </Link>
          </div>

          {/* Promotion List Table */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="text-sm text-gray-400 mb-2">
              Showing {currentPromotions.length} promotions
            </div>
            <div className="bg-gray-800 rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Promotion ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Start Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">End Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Discount Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Detail</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Action</th>
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
                          <button className="text-yellow-500 hover:text-yellow-700 text-xl"><FaEdit /></button>
                          <button className="text-red-500 hover:text-red-700 text-xl"><FaTrash /></button>
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