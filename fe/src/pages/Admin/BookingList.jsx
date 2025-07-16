import React, { useEffect, useState, useRef } from 'react';
import SidebarLayout from '../../components/Sidebar-Admin';
import { FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import Pagination from '../../components/PaginationHomepage';
import { message, Modal } from 'antd';
import { FaSearch, FaEye } from "react-icons/fa";

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 5;
  const [totalPages, setTotalPages] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const isFetchedRef = useRef(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/booking-management', {
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
      message.error(error?.response?.data?.message || 'Không thể tải danh sách đặt vé.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setCurrentPage(1);
      
    }, 500);
    return () => clearTimeout(delayDebounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const showBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setModalVisible(true);
  };

  const getStatusBadge = (status) => {
    if (status?.toUpperCase() === "PAID") {
      return (
        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-200 text-green-700 border border-green-600">
          Success
        </span>
      );
    } else if (status?.toUpperCase() === "PENDING_PAYMENT") {
      return (
        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-200 text-yellow-800 border border-yellow-600">
          Pending
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-200 text-red-700 border border-red-600">
          {status}
        </span>
      );
    }
  };

  return (
    <SidebarLayout>
      <div className="p-6 text-white">
        <div className="p-4 flex items-center justify-between">
          <div className="flex-1 text-center">
            <h2 className="text-2xl font-bold"> Booking Management</h2>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, movie, phone..."
              value={searchTerm}
              onChange={handleSearch}
              className="bg-gray-700 text-white px-10 py-2 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900 text-gray-300 text-sm uppercase">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Full Name</th>
                <th className="px-4 py-3 text-left">Phone Number</th>
                <th className="px-4 py-3 text-left">Movie</th>
                <th className="px-4 py-3 text-left">Time</th>
                <th className="px-4 py-3 text-left">Seat</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Action</th>
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
                    <td className="px-4 py-2">{booking.user?.name || 'N/A'}</td>
                    <td className="px-4 py-2">{booking.user?.phone || 'N/A'}</td>
                    <td className="px-4 py-2">{booking.movieDetails?.name || 'N/A'}</td>
                    <td className="px-4 py-2">
                      {booking.movieDetails?.time
                        ? new Date(booking.movieDetails.time).toLocaleString('vi-VN')
                        : 'N/A'}
                    </td>
                    <td className="px-4 py-2">{booking.selectedSeats?.join(', ') || 'N/A'}</td>
                    <td className="px-4 py-2 text-center">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => showBookingDetails(booking)}
                        className="text-blue-400 hover:text-blue-600 text-xl transition-colors duration-200"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
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

      <Modal
        title="Booking Details"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <button
            key="close"
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
            onClick={() => setModalVisible(false)}
          >
            Close
          </button>,
        ]}
        width={700}
        bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
        {selectedBooking && (
          <div className="space-y-4 text-black">
            <div><strong>Booking ID:</strong> {selectedBooking.bookingId}</div>
            <div><strong>Full Name:</strong> {selectedBooking.user?.name || 'N/A'}</div>
            <div><strong>Phone Number:</strong> {selectedBooking.user?.phone || 'N/A'}</div>
            <div><strong>Movie:</strong> {selectedBooking.movieDetails?.name || 'N/A'}</div>
            <div><strong>Showtime:</strong> {
              selectedBooking.movieDetails?.time
                ? new Date(selectedBooking.movieDetails.time).toLocaleString("vi-VN")
                : 'N/A'
            }</div>
            <div><strong>Seat(s):</strong> {selectedBooking.selectedSeats?.join(", ") || 'N/A'}</div>
            <div><strong>Status:</strong> {selectedBooking.status}</div>
            <div><strong>Total Price:</strong> {selectedBooking.grandTotal?.toLocaleString('vi-VN')} VND</div>
            <div><strong>Created At:</strong> {
              selectedBooking.createdAt
                ? new Date(selectedBooking.createdAt).toLocaleString("vi-VN")
                : 'N/A'
            }</div>
          </div>
        )}
      </Modal>
    </SidebarLayout>
  );
};

export default BookingList;