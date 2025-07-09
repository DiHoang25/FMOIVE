import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';
import { Modal, message, Tag } from 'antd';
import Pagination from '../../components/PaginationHomepage';
import SidebarLayout from '../../components/Sidebar-Admin';
import dayjs from 'dayjs';
import axios from 'axios';

const Promotions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [promotionData, setPromotionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortByStartDate, setSortByStartDate] = useState(null); // 'asc' | 'desc' | null
  const [sortByDiscount, setSortByDiscount] = useState(null);   // 'asc' | 'desc' | null
  const promotionsPerPage = 8;

  useEffect(() => {
    fetch('http://localhost:5000/api/promotions')
      .then(res => res.json())
      .then(data => {
        const formatted = data.map(promo => ({
          id: promo._id,
          promotionCode: promo.promotion_code || '-',
          title: promo.title,
          startDate: new Date(promo.start_date).toLocaleDateString(),
          endDate: new Date(promo.end_date).toLocaleDateString(),
          rawStartDate: new Date(promo.start_date),
          discountLevel: promo.discount ? `${promo.discount}%` : '-',
          rawDiscount: promo.discount || 0
        }));
        setPromotionData(formatted);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0); // Reset về trang đầu khi tìm kiếm
  };


  const handlePageChange = page => {
    if (page < 0 || page >= Math.ceil(filtered.length / promotionsPerPage)) return;
    setCurrentPage(page);
  };

  const handleDelete = promotion => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc muốn xóa "${promotion.title}"?`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: () => {
        fetch(`http://localhost:5000/api/promotions/${promotion.id}`, { method: 'DELETE' })
          .then(res => res.json())
          .then(data => {
            message.success('Xóa thành công');
            setPromotionData(prev => prev.filter(p => p.id !== promotion.id));
            const remaining = promotionData.length - 1;
            const maxPage = Math.ceil(remaining / promotionsPerPage) - 1;
            if (currentPage > maxPage) setCurrentPage(maxPage);
          })
          .catch(() => message.error('Xóa thất bại'));
      },
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
      if (sortByStartDate) {
        return sortByStartDate === 'asc'
          ? a.rawStartDate - b.rawStartDate
          : b.rawStartDate - a.rawStartDate;
      }
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

  return (
    <SidebarLayout>
      <div className="p-6 text-white">
        <div className="p-4 flex items-center justify-between">
          <div className="flex-1 text-center">
            <h2 className="text-2xl font-bold">Promotion Management</h2>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-4">
          <input
            type="text"
            placeholder="Search promotion..."
            value={searchTerm}
            onChange={handleSearch}
            className="bg-gray-700 text-white px-3 py-2 rounded-md w-64"
          />
          <Link to="/admin/add-promotion" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md">
            + Add New Promotion
          </Link>
        </div>

        <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900 text-gray-300 text-sm uppercase">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Promotion Code</th>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Start Date</th>
                <th className="px-4 py-3 text-left">End Date</th>
                {/* <th className="px-4 py-3 text-left">Discount</th> */}
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 text-gray-300 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <FaSpinner className="animate-spin mr-2" /> Loading promotions...
                  </td>
                </tr>
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-400">No promotions found.</td>
                </tr>
              ) : (
                visible.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-gray-700 transition">
                    <td className="px-4 py-2">{currentPage * promotionsPerPage + idx + 1}</td>
                    <td className="px-4 py-2">{p.promotionCode}</td>
                    <td className="px-4 py-2">{p.title}</td>
                    <td className="px-4 py-2">{dayjs(p.rawStartDate).format('DD/MM/YYYY')}</td>
                    <td className="px-4 py-2">{p.endDate}</td>
{/* <td className="px-4 py-2">{p.discountLevel}</td> */}
                    <td className="px-4 py-2 text-center">
                      <div className="flex justify-center gap-4">
                        <button
                          onClick={() => window.location.href = `/admin/promotions/edit-promotion/${p.id}`}
                          className="text-yellow-400 hover:text-yellow-600 text-xl">
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="text-red-400 hover:text-red-600 text-xl">
                          <FaTrash />
                        </button>
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
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
};

export default Promotions;
