import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SidebarLayout from '../../components/Sidebar-Admin';
import { FaEdit } from 'react-icons/fa';

const CinemaRooms = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cinemaRooms, setCinemaRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/theater/rooms', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Lỗi khi gọi API');
        }

        const data = await res.json();
        setCinemaRooms(data.rooms || []);
        setLoading(false);
      } catch (err) {
        setError('Lỗi khi tải danh sách phòng chiếu.');
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredRooms = cinemaRooms.filter(room =>
    room.roomId.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <SidebarLayout>
      <div className="p-6 text-white">
        <div className="p-4 flex items-center justify-between">
          <div className="flex-1 text-center">
            <h2 className="text-2xl font-bold">Cinema Room Management</h2>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <Link
            to="/admin/cinema-rooms/add-new-cinema-room"
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md shadow flex items-center"
          >
            <span className="mr-2">+</span> Add new
          </Link>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearch}
            className="bg-gray-800 text-gray-300 pl-4 pr-10 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-700 w-64"
          />
        </div>

        <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
          {loading ? (
            <div className="p-6 text-center text-gray-300">Đang tải dữ liệu...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-400">{error}</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900 text-gray-300 text-sm uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Cinema room ID</th>
                  <th className="px-4 py-3 text-left">Cinema room</th>
                  <th className="px-4 py-3 text-left">Room type</th> {/* 👈 Thêm dòng này */}
                  <th className="px-4 py-3 text-left">Seat quantity</th>
                  <th className="px-4 py-3 text-left">Seat detail</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-700 text-white text-base font-medium">
                {filteredRooms.map((room, index) => (
  <tr key={room.roomId} className="hover:bg-gray-700 transition">
    <td className="px-4 py-2 font-semibold">{index + 1}</td>
    <td className="px-4 py-2 font-semibold">{room.roomId}</td>
    <td className="px-4 py-2 font-semibold">{room.roomName}</td>
    <td className="px-4 py-2 font-semibold">{room.roomType}</td> {/* 👈 Thêm dòng này */}
    <td className="px-4 py-2 font-semibold">{room.quantity}</td>
    <td className="px-4 py-2 font-semibold">
      <td className="px-4 py-2">
  <Link
    to={`/admin/room/${room.roomId}`}
    className="bg-blue-600 hover:bg-blue-700 text-white text-sm p-2 rounded shadow flex items-center justify-center"
    title="Edit seats"
  >
    <FaEdit className="w-4 h-4" />
  </Link>
</td>

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
          )}
        </div>
      </div>
    </SidebarLayout>
  );
};

export default CinemaRooms;
