import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { Modal, message } from 'antd';
import SidebarLayout from '../../components/Sidebar-Admin';
import Pagination from '../../components/PaginationHomepage';

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
      <div className="flex h-screen text-gray-300">
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Header */}
          <div className="p-4 flex justify-center">
            <h2 className="text-2xl text-white font-bold">Promotion Management</h2>
          </div>

          {/* Search + Add */}
          <div className="flex justify-between items-center p-4">
            <input
              type="text"
              placeholder="Search promotions..."
              className="bg-gray-800 text-gray-300 pl-4 pr-10 py-2 rounded-md"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(0);
              }}
            />
            <Link
              to="/admin/add-promotion"
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center"
            >
              <FaPlus className="mr-2" /> Add Promotion
            </Link>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="text-center text-gray-400">Đang tải...</div>
            ) : (
              <>
                <div className="text-sm text-gray-400 mb-2">
                  Showing {visible.length} of {filtered.length} promotion(s)
                </div>

                <div className="bg-gray-800 rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                      <tr className="bg-gray-800">
                        <th className="px-6 py-3 text-xs text-gray-300 uppercase text-left">#</th>
                        <th className="px-6 py-3 text-xs text-gray-300 uppercase text-left">Promotion Code</th>
                        <th className="px-6 py-3 text-xs text-gray-300 uppercase text-left">Title</th>
                        <th
                          className="px-6 py-3 text-xs text-gray-300 uppercase text-left cursor-pointer"
                          onClick={() => {
                            setSortByStartDate(prev => prev === 'asc' ? 'desc' : 'asc');
                            setSortByDiscount(null);
                          }}
                        >
                          Start Date {sortByStartDate === 'asc' ? '▲' : sortByStartDate === 'desc' ? '▼' : ''}
                        </th>
                        <th className="px-6 py-3 text-xs text-gray-300 uppercase text-left">End Date</th>
                        <th
                          className="px-6 py-3 text-xs text-gray-300 uppercase text-left cursor-pointer"
                          onClick={() => {
                            setSortByDiscount(prev => prev === 'asc' ? 'desc' : 'asc');
                            setSortByStartDate(null);
                          }}
                        >
                          Discount {sortByDiscount === 'asc' ? '▲' : sortByDiscount === 'desc' ? '▼' : ''}
                        </th>
                        <th className="px-6 py-3 text-xs text-gray-300 uppercase text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                      {visible.map((p, idx) => (
                        <tr key={p.id} className="hover:bg-gray-700">
                          <td className="px-6 py-4 text-sm text-gray-300">
                            {currentPage * promotionsPerPage + idx + 1}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-300">{p.promotionCode}</td>
                          <td className="px-6 py-4 text-sm text-gray-300">{p.title}</td>
                          <td className="px-6 py-4 text-sm text-gray-300">{p.startDate}</td>
                          <td className="px-6 py-4 text-sm text-gray-300">{p.endDate}</td>
                          <td className="px-6 py-4 text-sm text-gray-300">{p.discountLevel}</td>
                          <td className="px-6 py-4 text-sm flex space-x-3">
                            <button
                              className="text-yellow-400 hover:text-yellow-600"
                              onClick={() => window.location.href = `/admin/promotions/edit-promotion/${p.id}`}
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDelete(p)}
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default Promotions;
