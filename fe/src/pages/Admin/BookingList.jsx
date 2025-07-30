import React, { useEffect, useState, useRef } from 'react';
import SidebarLayout from '../../components/Sidebar-Admin';
import { FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import Pagination from '../../components/PaginationHomepage'; // Assuming this is a custom component
import { message, Modal } from 'antd'; // Keeping Ant Design Modal and message for functionality
import { FaSearch, FaEye } from "react-icons/fa";
import { Calendar, Clock, MapPin, Users, CreditCard } from "lucide-react";
import { motion } from 'framer-motion'; // Import motion for animations
import { useAuth } from '../../contexts/AuthContext';

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
  const [roomNames, setRoomNames] = useState({});


const { authToken } = useAuth();

useEffect(() => {
  if (!authToken) return;

  axios.get("http://localhost:5000/api/theater/rooms", {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  })
    .then(res => {
      const map = {};
      res.data.forEach(room => {
        map[room.roomId] = room.roomName;
      });
      console.log("✅ roomMap fetched:", map);
      setRoomMap(map);
    })
    .catch(err => console.error("❌ Lỗi fetch room:", err));
}, [authToken]);


const fetchRoomName = async (roomId) => {
  if (!roomId || roomNames[roomId]) return; // nếu đã có rồi thì bỏ qua

  try {
    const token = localStorage.getItem('token');
    const res = await axios.get(`http://localhost:5000/api/theater/rooms/${roomId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const roomName = res.data?.room?.roomName || roomId;
    setRoomNames(prev => ({ ...prev, [roomId]: roomName }));
  } catch (error) {
    console.error(`❌ Lỗi lấy phòng ${roomId}:`, error);
    setRoomNames(prev => ({ ...prev, [roomId]: roomId }));
  }
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

      // ⬇️ Gọi fetchRoomName cho từng roomId
    data.bookings?.forEach(booking => {
      const roomId = booking.movieDetails?.cinema_room;
      if (roomId) fetchRoomName(roomId);
    });

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
      fetchBookings(); // Fetch bookings again after debounce
    }, 500);
    return () => clearTimeout(delayDebounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const [roomList, setRoomList] = useState([]);




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
        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-500 text-white border border-green-600">
          Success
        </span>
      );
    } else if (status?.toUpperCase() === "PENDING_PAYMENT") {
      return (
        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-500 text-white border border-yellow-600">
          Pending
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-500 text-white border border-red-600">
          {status}
        </span>
      );
    }
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
                Booking Management
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
                  <div className="relative w-full sm:w-80">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-base" />
                    <input
                      type="text"
                      placeholder="Search by name, movie, phone..."
                      value={searchTerm}
                      onChange={handleSearch}
                      className="bg-slate-900/50 text-white pl-10 pr-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-8 text-gray-400 flex flex-col items-center justify-center">
                    <FaSpinner className="animate-spin inline mr-2 text-3xl text-blue-400 mb-3" />
                    <span className="text-lg">Loading bookings...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-sm text-gray-400 mb-4">
                      Showing {bookings.length} bookings
                    </div>

                    <div className="bg-slate-900/30 rounded-xl overflow-hidden overflow-x-auto border border-slate-600/30 shadow-inner">
                      <table className="min-w-full divide-y divide-slate-700">
                        <thead className="bg-slate-700/50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Full Name</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Phone Number</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Movie</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Seat</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-300 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-300 uppercase tracking-wider">Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-slate-800/40 divide-y divide-slate-700">
                          {bookings.length === 0 ? (
                            <tr>
                              <td colSpan="8" className="px-6 py-8 text-sm text-gray-400 text-center">No bookings found.</td>
                            </tr>
                          ) : (
                            bookings.map((booking, index) => (
                              <tr key={booking._id} className="hover:bg-slate-700/60 transition-colors duration-200">
                                <td className="px-6 py-4 text-sm text-gray-300">
                                  {(currentPage - 1) * bookingsPerPage + index + 1}
                                </td>
                                <td className="px-6 py-4 text-sm text-white font-medium">{booking.user?.name || 'N/A'}</td>
                                <td className="px-6 py-4 text-sm text-gray-300">{booking.user?.phone || 'N/A'}</td>
                                <td className="px-6 py-4 text-sm text-gray-300">{booking.movieDetails?.name || 'N/A'}</td>
                                <td className="px-6 py-4 text-sm text-gray-300">
                                  {booking.movieDetails?.time
                                    ? new Date(booking.movieDetails.time).toLocaleString('vi-VN')
                                    : 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-300">{booking.selectedSeats?.join(', ') || 'N/A'}</td>
                                <td className="px-6 py-4 text-center">
                                  {getStatusBadge(booking.status)}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <button
                                    onClick={() => showBookingDetails(booking)}
                                    className="text-blue-400 hover:text-blue-500 text-xl transition-colors duration-200"
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
                    </div>

                    {totalPages > 1 && (
                      <div className="mt-6 flex justify-center">
                        <Pagination
                          currentPage={currentPage - 1}
                          totalPages={totalPages}
                          onPageChange={(page) => handlePageChange(page + 1)}
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

      <Modal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        centered
        width={800}
        className="custom-ant-modal" // Use the custom class for styling
      >
        {selectedBooking && (
          <div className="bg-slate-800/90 backdrop-blur-lg border border-slate-600/40 p-8 rounded-2xl shadow-lg relative">
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/8 via-transparent to-cyan-600/8 pointer-events-none" />
            <div className="flex flex-col lg:flex-row gap-8 relative z-10">
              {/* Movie Poster */}
              <div className="flex-shrink-0">
                <img
                  src={selectedBooking.movieDetails?.image_url || "https://placehold.co/256x384/1f2937/e2e8f0?text=No+Poster"}
                  alt="Movie Poster"
                  className="w-64 h-96 rounded-xl object-cover shadow-2xl border-2 border-slate-700"
                  onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/256x384/1f2937/e2e8f0?text=No+Poster" }}
                />
              </div>

              {/* Movie Details */}
              <div className="flex-1 space-y-6">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {selectedBooking.movieDetails?.name || 'N/A'}
                  </h2>
                  <div className="w-20 h-1 bg-red-600 rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-blue-400" />
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
                      <Clock className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-gray-400 text-sm">Showtime</p>
                        <p className="text-white font-semibold">
                          {selectedBooking.movieDetails?.time
                            ? new Date(selectedBooking.movieDetails.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                            : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-gray-400 text-sm">Cinema Room</p>
                        <p className="text-white font-semibold">
                          {roomNames[selectedBooking.movieDetails?.cinema_room] || 'Loading...'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-gray-400 text-sm">Seat</p>
                        <p className="text-white font-semibold">{selectedBooking.selectedSeats?.join(', ') || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-blue-400" />
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
                      <CreditCard className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-gray-400 text-sm">Total Price</p>
                        <p className="text-white font-semibold text-lg">
                          {selectedBooking.grandTotal?.toLocaleString('vi-VN')} VND
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 mt-6">
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

export default BookingList;
