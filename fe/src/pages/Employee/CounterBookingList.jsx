import React, { useState, useEffect } from "react";
import { FaSearch, FaEye } from "react-icons/fa";
import EmployeeSidebarLayout from "../../components/Sidebar-Employee";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Modal, message } from "antd";
import Pagination from "../../components/PaginationHomepage";

const CounterBookingList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [allBookings, setAllBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const bookingsPerPage = 5;
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
    setCurrentPage(0);
  }, [searchTerm]);

  const filteredBookings = allBookings.filter((booking) => {
    const name = booking.user?.name?.toLowerCase() || "";
    const phone = booking.user?.phone || "";
    const movie = booking.movieDetails?.name?.toLowerCase() || "";
    const term = searchTerm.toLowerCase();
    return name.includes(term) || phone.includes(term) || movie.includes(term);
  });

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
        title="Booking Details"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <button
            key="close"
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
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
    </EmployeeSidebarLayout>
  );
};

export default CounterBookingList;
