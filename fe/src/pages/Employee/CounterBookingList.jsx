import React, { useState, useEffect } from "react";
import { FaSearch, FaEye } from "react-icons/fa";
import EmployeeSidebarLayout from "../../components/Sidebar-Employee";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Modal, message } from "antd";
import Pagination from "../../components/PaginationHomepage";
import { Calendar, Clock, MapPin, Users, CreditCard } from "lucide-react";

const CounterBookingList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [allBookings, setAllBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const bookingsPerPage = 5;
  const [roomMap, setRoomMap] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllBookings = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/booking-management", {
          params: { limit: 1000 },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const sortedBookings = (res.data.bookings || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setAllBookings(sortedBookings);
      } catch (error) {
        console.error("Lỗi khi tải danh sách đặt vé:", error.message);
        message.error("Không thể tải danh sách đặt vé.");
      }
    };
    fetchAllBookings();
  }, []);

  useEffect(() => {
    axios.get("http://localhost:5000/api/theater/rooms")
      .then(res => {
        const map = {};
        res.data.forEach(r => { map[r.roomId] = r.roomName });
        setRoomMap(map);
      })
      .catch(err => console.error("Room fetch error:", err));
  }, []);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm]);

  const filteredBookings = allBookings.filter((booking) => {
    const name = booking.user?.name?.toLowerCase() || "";
    const phone = booking.user?.phone || "";
    const movie = booking.movieDetails?.name?.toLowerCase() || "";
    const term = searchTerm.toLowerCase();
    return name.includes(term) || phone.includes(term) || movie.includes(term);
  });

  const getRoomName = (roomName) => {
    const key = roomName?.trim().toUpperCase();
    return roomMap[key] || (key?.match(/ROOM0*(\d+)/) ? `Cinema ${+key.match(/ROOM0*(\d+)/)[1]}` : key || 'N/A');
  };

  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const handlePageChange = (page) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  const showBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setModalVisible(true);
  };

  const paginatedBookings = filteredBookings.slice(
    currentPage * bookingsPerPage,
    (currentPage + 1) * bookingsPerPage
  );

  return (
    <EmployeeSidebarLayout>
      <div className="flex h-screen text-gray-300">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-2 flex items-center justify-center">
            <h2 className="text-xl text-white font-bold">Booking Management</h2>
          </div>

          <div className="flex justify-between items-center p-2">
            <div className="relative">
              <input
                className="py-2 px-3 text-sm bg-gray-800 text-gray-300 pl-4 pr-10 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-700 w-64"
                type="text"
                placeholder="Search by name, phone, movie..."
                value={searchTerm}
                onChange={handleSearch}
              />
              <FaSearch className="absolute right-3 top-3 text-gray-400" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <div className="text-xs text-gray-400 mb-2">
              Showing {filteredBookings.length} bookings
            </div>

            <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-900 text-gray-300 text-sm uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Full name</th>
                    <th className="px-4 py-3 text-left">Phone number</th>
                    <th className="px-4 py-3 text-left">Movie</th>
                    <th className="px-4 py-3 text-left">Time</th>
                    <th className="px-4 py-3 text-left">Seat</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700 text-gray-300 text-sm">
                  {paginatedBookings.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4 text-gray-400">
                        No bookings found.
                      </td>
                    </tr>
                  ) : (
                    paginatedBookings.map((booking, index) => (
                      <tr key={booking._id} className="hover:bg-gray-700">
                        <td className="px-4 py-2">{currentPage * bookingsPerPage + index + 1}</td>
                        <td className="px-4 py-2">{booking.user?.name || "N/A"}</td>
                        <td className="px-4 py-2">{booking.user?.phone || "N/A"}</td>
                        <td className="px-4 py-2">{booking.movieDetails?.name || "N/A"}</td>
                        <td className="px-4 py-2">
                          {booking.movieDetails?.time
                            ? new Date(booking.movieDetails.time).toLocaleString("vi-VN")
                            : "N/A"}
                        </td>
                        <td className="px-4 py-2">{booking.selectedSeats?.join(", ") || "N/A"}</td>
                        <td className="px-4 py-2">
                          {booking.status?.toUpperCase() === "PAID" ? (
                            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-200 text-green-700 border border-green-600">
                              Success
                            </span>
                          ) : booking.status?.toUpperCase() === "PENDING_PAYMENT" ? (
                            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-200 text-yellow-800 border border-yellow-600">
                              Pending
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-200 text-red-700 border border-red-600">
                              {booking.status}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => showBookingDetails(booking)}
                            className="text-blue-400 hover:text-blue-600 text-xl"
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
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal hiển thị chi tiết booking */}
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
    </EmployeeSidebarLayout>
  );
};

export default CounterBookingList;
