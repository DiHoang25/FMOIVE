import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import EmployeeSidebarLayout from "../../components/Sidebar-Employee";
import { Navigate, useNavigate } from "react-router-dom";
import { use } from "react";

const CounterBookingList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage] = useState(1);
  const bookingsPerPage = 8;
  const navigate = useNavigate();

  const bookings = [
    {
      id: "SV7FuDAxwX",
      memberId: "4SqiOzc7Mm",
      fullName: "Tran Van Tien",
      identityCard: "123456789",
      phoneNumber: "0775335515",
      movie: "Doctor Strange: Phù Thủy Tối Thượng",
      time: "01/12/2018 - 21:00",
      seat: "2D 2E 2F",
      status: true,
    },
    {
      id: "GsAGM0bqG5",
      memberId: "4SqiOzc7Mm",
      fullName: "Tran Van Tien",
      identityCard: "123456789",
      phoneNumber: "0775335515",
      movie: "Doctor Strange: Phù Thủy Tối Thượng",
      time: "01/12/2018 - 21:00",
      seat: "1D 1E 1F",
      status: false,
    },
    {
      id: "rv5v4Mkigb",
      memberId: "4SqiOzc7Mm",
      fullName: "Tran Van Tien",
      identityCard: "123456789",
      phoneNumber: "0775335515",
      movie: "Doctor Strange: Phù Thủy Tối Thượng",
      time: "01/12/2018 - 21:00",
      seat: "8B",
      status: true,
    },
    {
      id: "IRWNA6P4Ct",
      memberId: "4SqiOzc7Mm",
      fullName: "Tran Van Tien",
      identityCard: "123456789",
      phoneNumber: "0775335515",
      movie: "Doctor Strange: Phù Thủy Tối Thượng",
      time: "01/12/2018 - 21:00",
      seat: "4A 4B 4C",
      status: true,
    },
    {
      id: "QdUWWGQxJr",
      memberId: "4SqiOzc7Mm",
      fullName: "Tran Van Tien",
      identityCard: "123456789",
      phoneNumber: "0775335515",
      movie: "Doctor Strange: Phù Thủy Tối Thượng",
      time: "01/12/2018 - 21:00",
      seat: "1A 1C 1B",
      status: true,
    },
    {
      id: "iKtXHDmkll",
      memberId: "4SqiOzc7Mm",
      fullName: "Tran Van Tien",
      identityCard: "123456789",
      phoneNumber: "0775335515",
      movie: "Doctor Strange: Phù Thủy Tối Thượng",
      time: "01/12/2018 - 21:00",
      seat: "1D 1E 1F",
      status: true,
    },
    {
      id: "testFail123",
      memberId: "fail123",
      fullName: "Nguyen Van A",
      identityCard: "999999999",
      phoneNumber: "0888888888",
      movie: "The Matrix",
      ime: "01/01/2025 - 19:00",
      seat: "3C",
      status: false,
    },
  ];

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleGetTicket = (bookingId) => {
    navigate(`/employee/counter-get-ticket`);
    // Optional: Call API to confirm ticket, update status, etc.
  };

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.fullName
        .trim()
        .toLowerCase()
        .includes(searchTerm.toLowerCase().trim()) ||
      booking.movie
        .trim()
        .toLowerCase()
        .includes(searchTerm.toLowerCase().trim()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = filteredBookings.slice(
    indexOfFirstBooking,
    indexOfLastBooking
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
                  className="py-1 px-2 text-sm bg-gray-800 text-gray-300 pl-4 pr-10 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-700 w-64"
                  type="text"
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <FaSearch className="absolute right-3 top-3 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <div className="text-xs text-gray-400 mb-2">
              Showing {currentBookings.length} bookings
            </div>
            <div className="bg-gray-800 rounded-md overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700 text-xs">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Booking ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Full name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Phone number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Movie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Seat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {currentBookings.map((booking, index) => (
                    <tr key={booking.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {indexOfFirstBooking + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {booking.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {booking.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {booking.phoneNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300 whitespace-normal break-words max-w-xs">
                        {booking.movie}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {booking.time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {booking.seat}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-md text-sm font-medium ${
                            booking.status === true
                              ? "bg-green-500 text-white"
                              : "bg-red-500 text-white"
                          }`}
                        >
                          {booking.status === true ? "Successful" : "Failed"}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {booking.status === true ? (
                            <button
                              className="px-3 py-1 rounded-md text-sm bg-yellow-500 text-black hover:bg-yellow-600"
                              onClick={() => handleGetTicket(booking.id)}
                            >
                              Get Ticket
                            </button>
                          ) : (
                            <span className="text-gray-500">—</span>
                          )}
                        </td>
                      </td>
                    </tr>
                  ))}
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
