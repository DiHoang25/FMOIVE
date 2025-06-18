import React, { useState } from 'react';
import SidebarLayout from '../../components/Sidebar-Admin';
import { FaSearch } from 'react-icons/fa';

const BookingList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage] = useState(1);
  const bookingsPerPage = 8;

  const bookings = [
    { id: 'SV7FuDAxwX', memberId: '4SqiOzc7Mm', fullName: 'Tran Van Tien', identityCard: '123456789', phoneNumber: '0775335515', movie: 'Doctor Strange: Phù Thủy Tối Thượng', time: '01/12/2018 - 21:00', seat: '2D 2E 2F', status: 'Successful booking' },
    { id: 'GsAGM0bqG5', memberId: '4SqiOzc7Mm', fullName: 'Tran Van Tien', identityCard: '123456789', phoneNumber: '0775335515', movie: 'Doctor Strange: Phù Thủy Tối Thượng', time: '01/12/2018 - 21:00', seat: '1D 1E 1F', status: 'Successful booking' },
    { id: 'rv5v4Mkigb', memberId: '4SqiOzc7Mm', fullName: 'Tran Van Tien', identityCard: '123456789', phoneNumber: '0775335515', movie: 'Doctor Strange: Phù Thủy Tối Thượng', time: '01/12/2018 - 21:00', seat: '8B', status: 'Successful booking' },
    { id: 'IRWNA6P4Ct', memberId: '4SqiOzc7Mm', fullName: 'Tran Van Tien', identityCard: '123456789', phoneNumber: '0775335515', movie: 'Doctor Strange: Phù Thủy Tối Thượng', time: '01/12/2018 - 21:00', seat: '4A 4B 4C', status: 'Successful booking' },
    { id: 'QdUWWGQxJr', memberId: '4SqiOzc7Mm', fullName: 'Tran Van Tien', identityCard: '123456789', phoneNumber: '0775335515', movie: 'Doctor Strange: Phù Thủy Tối Thượng', time: '01/12/2018 - 21:00', seat: '1A 1C 1B', status: 'Successful booking' },
    { id: 'iKtXHDmkll', memberId: '4SqiOzc7Mm', fullName: 'Tran Van Tien', identityCard: '123456789', phoneNumber: '0775335515', movie: 'Doctor Strange: Phù Thủy Tối Thượng', time: '01/12/2018 - 21:00', seat: '1D 1E 1F', status: 'Successful booking' },
  ];

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredBookings = bookings.filter(booking =>
    booking.fullName.trim().toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
    booking.movie.trim().toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
    booking.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);


  return (
    <SidebarLayout>
      <div className="flex h-screen text-gray-300">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Title */}
          <div className="p-2 flex items-center justify-center">
            <h2 className="text-xl text-white font-bold">Booking Management</h2>
          </div>

          {/* Search */}
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

          {/* Booking List Table */}
          <div className="flex-1 overflow-y-auto p-2">
            <div className="text-xs text-gray-400 mb-2">
              Showing {currentBookings.length} bookings
            </div>
            <div className="bg-gray-800 rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-700 text-xs">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Booking ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Full name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Phone number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Movie</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Seat</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {filteredBookings.slice((currentPage - 1) * bookingsPerPage, currentPage * bookingsPerPage).map((booking, index) => (
                    <tr key={booking.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{indexOfFirstBooking + index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{booking.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{booking.fullName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{booking.phoneNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{booking.movie}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{booking.time}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{booking.seat}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button className={`px-3 py-1 rounded-md text-sm text-white ${booking.status === 'Successful booking' ? 'bg-green-500' : 'bg-blue-500'}`}>
                          {booking.status}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default BookingList;