import React, { useEffect, useState } from 'react';
import SidebarLayout from '../../components/Sidebar-Admin';
import { FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import Pagination from '../../components/PaginationHomepage';
import { message } from 'antd';

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 8;
  const [totalPages, setTotalPages] = useState(0);

  // Fetch bookings từ server
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/booking', {
        params: {
          page: currentPage,
          limit: bookingsPerPage,
          userName: searchTerm || undefined,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = response.data;
      setBookings(data.bookings || []);
      setTotalPages(Math.ceil((data.total || 0) / bookingsPerPage));
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đặt vé:', error?.response?.data || error.message);
      message.error(
        error?.response?.data?.message || 'Không thể tải danh sách đặt vé.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Gọi khi trang thay đổi
  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Gọi khi searchTerm thay đổi (debounce 500ms)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setCurrentPage(1); // reset về trang đầu
      fetchBookings();
    }, 500);

    return () => clearTimeout(delayDebounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <SidebarLayout>
      <div className="p-6 text-white">
        <div className="p-4 flex items-center justify-between">
          <div className="flex-1 text-center">
            <h2 className="text-2xl font-bold">Booking Management</h2>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by name, movie, phone..."
            value={searchTerm}
            onChange={handleSearch}
            className="bg-gray-700 text-white px-3 py-2 rounded-md w-64"
          />
        </div>

        <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900 text-gray-300 text-sm uppercase">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Booking ID</th>
                <th className="px-4 py-3 text-left">Full Name</th>
                <th className="px-4 py-3 text-left">Phone Number</th>
                <th className="px-4 py-3 text-left">Movie</th>
                <th className="px-4 py-3 text-left">Time</th>
                <th className="px-4 py-3 text-left">Seat</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 text-gray-300 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-6">
                    <FaSpinner className="animate-spin inline mr-2" />
                    Loading bookings...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-gray-400">
                    No bookings found.
                  </td>
                </tr>
              ) : (
                bookings.map((booking, index) => (
                  <tr key={booking._id} className="hover:bg-gray-700 transition">
                    <td className="px-4 py-2">
                      {(currentPage - 1) * bookingsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-2">{booking.bookingId}</td>
                    <td className="px-4 py-2">{booking.user?.name || 'N/A'}</td>
                    <td className="px-4 py-2">{booking.user?.phone || 'N/A'}</td>
                    <td className="px-4 py-2">{booking.movieDetails?.name || 'N/A'}</td>
                    <td className="px-4 py-2">
                      {booking.movieDetails?.time
                        ? new Date(booking.movieDetails.time).toLocaleString('vi-VN')
                        : 'N/A'}
                    </td>
                    <td className="px-4 py-2">{booking.selectedSeats?.join(', ')}</td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className={`px-3 py-1 rounded-md font-medium text-sm ${
                          booking.status === 'Agree'
                            ? 'bg-green-500 text-white'
                            : booking.status === 'Pending'
                            ? 'bg-yellow-500 text-black'
                            : 'bg-red-500 text-white'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="py-4">
              <Pagination
                currentPage={currentPage - 1}
                totalPages={totalPages}
                onPageChange={(page) => handlePageChange(page + 1)}
              />
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
};

export default BookingList;
