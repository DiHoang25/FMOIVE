import React, { useEffect, useState } from 'react';
import SidebarLayout from '../../components/Sidebar-Admin';
import { FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import Pagination from '../../components/PaginationHomepage';
import { message, Modal } from 'antd';
import { FaSearch, FaEye } from "react-icons/fa";
import { Calendar, Clock, MapPin, Users, CreditCard } from "lucide-react";

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 5;
  const [totalPages, setTotalPages] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [roomMap, setRoomMap] = useState({});

  useEffect(() => {
    axios.get("http://localhost:5000/api/theater/rooms")
      .then(res => {
        const map = {};
        res.data.forEach(r => { map[r.roomId] = r.roomName });
        setRoomMap(map);
      })
      .catch(err => console.error("Room fetch error:", err));
  }, []);

  const getRoomName = (roomName) => {
    const key = roomName?.trim().toUpperCase();
    return roomMap[key] || (key?.match(/ROOM0*(\d+)/) ? `Cinema ${+key.match(/ROOM0*(\d+)/)[1]}` : key || 'N/A');
  };

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
            <h2 className="text-2xl font-bold">Booking Management</h2>
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
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        centered
        width={800}
        className="custom-modal"
      >
        {selectedBooking && (
          <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Movie Poster */}
              <div className="flex-shrink-0">
                <img
                  src={selectedBooking.movieDetails?.image_url || "/placeholder.svg"}
                  alt="Poster"
                  className="w-64 h-96 rounded-xl object-cover shadow-2xl border-2 border-gray-700"
                />
              </div>

              {/* Movie Details */}
              <div className="flex-1 space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedBooking.movieDetails?.name || 'N/A'}</h2>
                  <div className="w-16 h-1 bg-red-600 rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="text-gray-400 text-sm">Show Date</p>
                        <p className="text-white font-semibold">
                          {selectedBooking.movieDetails?.time
                            ? new Date(selectedBooking.movieDetails.time).toLocaleDateString('vi-VN')
                            : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="text-gray-400 text-sm">Showtime</p>
                        <p className="text-white font-semibold">
                          {selectedBooking.movieDetails?.time
                            ? new Date(selectedBooking.movieDetails.time).toLocaleTimeString('vi-VN')
                            : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="text-gray-400 text-sm">Cinema Room</p>
                        <p className="text-white font-semibold">
                          {getRoomName(selectedBooking.movieDetails?.roomName)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="text-gray-400 text-sm">Seat</p>
                        <p className="text-white font-semibold">{selectedBooking.selectedSeats?.join(', ') || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="text-gray-400 text-sm">Booking date</p>
                        <p className="text-white font-semibold">
                          {selectedBooking.createdAt
                            ? new Date(selectedBooking.createdAt).toLocaleString('vi-VN')
                            : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="text-gray-400 text-sm">Total Price</p>
                        <p className="text-white font-semibold text-lg">
                          {selectedBooking.grandTotal?.toLocaleString('vi-VN')} VND
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <div className="flex flex-col space-y-3">
                    <div>
                      <p className="text-gray-400 text-sm">Customer Name</p>
                      <p className="text-white font-semibold">{selectedBooking.user?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Customer Phone</p>
                      <p className="text-white font-semibold">{selectedBooking.user?.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Booking ID</p>
                      <p className="text-white font-semibold">{selectedBooking.bookingId}</p>
                    </div>
                  </div>
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

export default BookingList;