import React, { useState, useEffect } from "react";
import { FaSearch, FaSpinner } from "react-icons/fa";
import EmployeeSidebarLayout from "../../components/Sidebar-Employee";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { message } from "antd";

const CounterBookingList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage] = useState(1);
  const bookingsPerPage = 8;
  const navigate = useNavigate();

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/booking-management", {
        params: {
          page: currentPage,
          limit: bookingsPerPage,
          userName: searchTerm || undefined,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setBookings(res.data.bookings || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách đặt vé:", error.message);
      message.error("Không thể tải danh sách đặt vé.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [currentPage]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchBookings();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleGetTicket = (bookingId) => {
    navigate(`/employee/counter-get-ticket/${bookingId}`);
  };

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user?.phone?.includes(searchTerm) ||
      booking.movieDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <EmployeeSidebarLayout>
      <div className="flex h-screen text-gray-300">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-2 flex items-center justify-center">
            <h2 className="text-xl text-white font-bold">Booking Management</h2>
          </div>

          <div className="flex justify-between items-center p-2">
            <div className="flex space-x-2">
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
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <div className="text-xs text-gray-400 mb-2">
              Showing {filteredBookings.length} bookings
            </div>

            <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-900 text-gray-300 text-sm uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Booking ID</th>
                    <th className="px-4 py-3 text-left">Full name</th>
                    <th className="px-4 py-3 text-left">Phone number</th>
                    <th className="px-4 py-3 text-left">Movie</th>
                    <th className="px-4 py-3 text-left">Time</th>
                    <th className="px-4 py-3 text-left">Seat</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700 text-gray-300 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="text-center py-4">
                        <FaSpinner className="animate-spin inline mr-2" />
                        Loading bookings...
                      </td>
                    </tr>
                  ) : filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-4 text-gray-400">
                        No bookings found.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((booking, index) => (
                      <tr key={booking._id} className="hover:bg-gray-700">
                        <td className="px-4 py-2">{index + 1}</td>
                        <td className="px-4 py-2">{booking.bookingId}</td>
                        <td className="px-4 py-2">{booking.user?.name || 'N/A'}</td>
                        <td className="px-4 py-2">{booking.user?.phone || 'N/A'}</td>
                        <td className="px-4 py-2">{booking.movieDetails?.name || 'N/A'}</td>
                        <td className="px-4 py-2">
                          {booking.movieDetails?.time
                            ? new Date(booking.movieDetails.time).toLocaleString("vi-VN")
                            : "N/A"}
                        </td>
                        <td className="px-4 py-2">
                          {booking.selectedSeats?.join(", ") || "N/A"}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-3 py-1 rounded-md text-sm font-medium ${
                              booking.status === "Agree"
                                ? "bg-green-500 text-white"
                                : booking.status === "Pending"
                                ? "bg-yellow-500 text-black"
                                : "bg-red-500 text-white"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          {booking.status === "Agree" ? (
                            <button
                              className="px-3 py-1 rounded-md text-sm bg-yellow-500 text-black hover:bg-yellow-600"
                              onClick={() => handleGetTicket(booking.bookingId)}
                            >
                              Get Ticket
                            </button>
                          ) : (
                            <span className="text-gray-500">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </EmployeeSidebarLayout>
  );
};

export default CounterBookingList;
