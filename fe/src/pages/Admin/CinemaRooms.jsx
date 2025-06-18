import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SidebarLayout from '../../components/Sidebar-Admin';

const initialCinemaRooms = [
  { id: 1, cinemaRoomId: 1, cinemaRoom: 'Cinema room 1', seatQuantity: 60 },
  { id: 2, cinemaRoomId: 2, cinemaRoom: 'Cinema room 2', seatQuantity: 60 },
  { id: 3, cinemaRoomId: 3, cinemaRoom: 'Cinema room 3', seatQuantity: 60 },
  { id: 4, cinemaRoomId: 4, cinemaRoom: 'Cinema room 4', seatQuantity: 60 },
  { id: 5, cinemaRoomId: 23, cinemaRoom: 'Test', seatQuantity: 60 },
  { id: 6, cinemaRoomId: 25, cinemaRoom: 'Test', seatQuantity: 55 },
];

const CinemaRooms = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cinemaRooms, setCinemaRooms] = useState(initialCinemaRooms);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredRooms = cinemaRooms.filter(
    room =>
      String(room.cinemaRoomId).trim().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <SidebarLayout>
      <div className="p-6 text-white">
        <div className="p-4 flex items-center justify-between">
          <div className="flex-1 text-center">
            <h2 className="text-2xl text-white font-bold">Cinema Room Management</h2>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <Link to="/admin/add-cinema-room" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow flex items-center">
            <span className="mr-2">+</span> Add new
          </Link>
          <div className="flex items-center">
          <div className="mb-4 flex items-center justify-between">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearch}
                className="bg-gray-800 text-gray-300 pl-4 pr-10 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-700 w-64"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900 text-gray-300 text-sm uppercase">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Cinema room ID</th>
                <th className="px-4 py-3 text-left">Cinema room</th>
                <th className="px-4 py-3 text-left">Seat quantity</th>
                <th className="px-4 py-3 text-left">Seat detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 text-gray-300 text-sm">
              {filteredRooms.map((room, index) => (
                <tr key={room.id} className="hover:bg-gray-700 transition">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{room.cinemaRoomId}</td>
                  <td className="px-4 py-2">{room.cinemaRoom}</td>
                  <td className="px-4 py-2">{room.seatQuantity}</td>
                  <td className="px-4 py-2 text-blue-400 hover:text-blue-600">
                    <Link to={`/admin/room-detail/${room.id}`} className="flex items-center">
                      <span className="mr-1">ⓘ</span> Seat detail
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredRooms.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-400">
                    No cinema rooms found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default CinemaRooms;