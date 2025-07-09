import React, { useState } from 'react';
import SidebarLayout from '../../components/Sidebar-Admin';
import { FaEye, FaTrash, FaSpinner } from 'react-icons/fa';
import Pagination from '../../components/PaginationHomepage';

const BookingList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const bookingsPerPage = 8;

  const bookings = [
    {
      id: 'SV7FuDAxwX',
      memberId: '4SqiOzc7Mm',
      fullName: 'Tran Van Tien',
      identityCard: '123456789',
      phoneNumber: '0775335515',
      movie: 'Doctor Strange: Phù Thủy Tối Thượng',
      time: '01/12/2018 - 21:00',
      seat: '2D 2E 2F',
      status: 'Successful booking'
    },
    {
      id: 'GsAGM0bqG5',
      memberId: '4SqiOzc7Mm',
      fullName: 'Tran Van Tien',
      identityCard: '123456789',
      phoneNumber: '0775335515',
      movie: 'Doctor Strange: Phù Thủy Tối Thượng',
      time: '01/12/2018 - 21:00',
      seat: '1D 1E 1F',
      status: 'Successful booking'
    },
    // ... Thêm dữ liệu nếu cần
  ];

  const filteredBookings = bookings.filter((booking) =>
    booking.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.movie.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);
  const visibleBookings = filteredBookings.slice(
    currentPage * bookingsPerPage,
    (currentPage + 1) * bookingsPerPage
  );

  const handleSearch = (e) => setSearchTerm(e.target.value);
  const handlePageChange = (page) => {
    if (page < 0 || page >= totalPages) return;
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
            placeholder="Search bookings..."
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
              {visibleBookings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-gray-400">No bookings found.</td>
                </tr>
              ) : (
                visibleBookings.map((booking, index) => (
                  <tr key={booking.id} className="hover:bg-gray-700 transition">
                    <td className="px-4 py-2">{currentPage * bookingsPerPage + index + 1}</td>
                    <td className="px-4 py-2">{booking.id}</td>
                    <td className="px-4 py-2">{booking.fullName}</td>
                    <td className="px-4 py-2">{booking.phoneNumber}</td>
                    <td className="px-4 py-2">{booking.movie}</td>
                    <td className="px-4 py-2">{booking.time}</td>
                    <td className="px-4 py-2">{booking.seat}</td>
                    <td className="px-4 py-2">
                      <span className={`px-3 py-1 rounded-md font-medium text-sm ${booking.status === 'Successful booking' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'}`}>
                        {booking.status}
                      </span>
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

export default BookingList;
