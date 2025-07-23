import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SidebarLayout from '../../components/Sidebar-Admin';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { Modal, message, Switch } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';

const { confirm } = Modal;

const CinemaRooms = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cinemaRooms, setCinemaRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
          throw new Error('Failed to fetch API');
        }

        const data = await res.json();
        setCinemaRooms(data.rooms || []);
        setLoading(false);
      } catch (err) {
        setError('Failed to load cinema room list.');
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleToggleStatus = (roomId, currentStatus, roomName) => {
    const newStatus = !currentStatus;

    confirm({
      title: newStatus ? 'Confirm Activation' : 'Confirm Deactivation',
      icon: <ExclamationCircleFilled />,
      content: newStatus
        ? `Do you want to activate the cinema room "${roomName}"?`
        : `Do you want to deactivate the cinema room "${roomName}"?`,
      okText: 'Yes',
      cancelText: 'No',
      okButtonProps: {
        style: {
          backgroundColor: '#dc2626',
          color: 'white',
          borderColor: '#dc2626',
        },
      },
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`http://localhost:5000/api/theater/rooms/${roomId}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ is_actived: newStatus }),
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.message);
          message.success(`Room "${roomName}" is now ${newStatus ? 'activated' : 'deactivated'}.`);

          setCinemaRooms(prev =>
            prev.map(room =>
              room.roomId === roomId ? { ...room, is_actived: newStatus } : room
            )
          );
        } catch (err) {
          message.error(`Failed to update status: ${err.message}`);
        }
      },
    });
  };

  const handleHardDelete = (roomId, roomName) => {
    confirm({
      title: 'Confirm Permanent Deletion',
      icon: <ExclamationCircleFilled />,
      content: `Are you sure you want to permanently delete room "${roomName}"? This action cannot be undone.`,
      okText: 'Yes, Delete Permanently',
      cancelText: 'No',
      okType: 'danger',
      okButtonProps: {
        style: {
          backgroundColor: '#dc2626',
          color: 'white',
          borderColor: '#dc2626',
        },
      },
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`http://localhost:5000/api/theater/rooms/${roomId}/hard_delete`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message);
          message.success(`Room "${roomName}" permanently deleted.`);
          setCinemaRooms(prev => prev.filter(room => room.roomId !== roomId));
        } catch (err) {
          message.error(`Delete failed: ${err.message}`);
        }
      },
    });
  };

  const filteredRooms = cinemaRooms
    .filter(room => !room.isDeleted) // Exclude soft-deleted rooms
    .filter(room =>
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

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
          <input
            type="text"
            placeholder="Search cinema room..."
            value={searchTerm}
            onChange={handleSearch}
            className="bg-gray-700 text-white px-4 py-2 rounded-md w-full sm:w-64 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
          />
          <Link
            to="/admin/cinema-rooms/add-new-cinema-room"
            className="bg-red-600 hover:bg-red-700 text-white hover:text-white px-5 py-2.5 rounded-md text-center font-semibold shadow-sm transition-all duration-200 w-full sm:w-auto"
          >
            + Add New Cinema Room
          </Link>
        </div>

        <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
          {loading ? (
            <div className="p-6 text-center text-gray-300">Loading data...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-400">{error}</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900 text-gray-300 text-sm uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Cinema room</th>
                  <th className="px-4 py-3 text-left">Room type</th>
                  <th className="px-4 py-3 text-left">Seat quantity</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700 text-white text-base font-medium">
                {filteredRooms.map((room, index) => (
                  <tr key={room.roomId} className="hover:bg-gray-700 transition">
                    <td className="px-4 py-2 font-semibold">{index + 1}</td>
                    <td className="px-4 py-2 font-semibold">{room.roomName}</td>
                    <td className="px-4 py-2 font-semibold">{room.roomType}</td>
                    <td className="px-4 py-2 font-semibold">{room.quantity}</td>
                    <td className="px-4 py-2">
                      <Switch
                        checkedChildren="Active"
                        unCheckedChildren="Inactive"
                        checked={room.is_actived}
                        onChange={() => handleToggleStatus(room.roomId, room.is_actived, room.roomName)}
                        style={{
                          backgroundColor: room.is_actived ? 'green' : 'red',
                          borderColor: room.is_actived ? 'green' : 'red',
                        }}
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex justify-center gap-4">
                        <Link
                          to={`/admin/room/${room.roomId}`}
                          className="text-blue-400 hover:text-blue-600 text-xl"
                          title="Edit seats"
                        >
                          <FaEye />
                        </Link>
                        <button
                          onClick={() => navigate(`/admin/edit-cinema-room/${room.roomId}`)}
                          className="text-yellow-400 hover:text-yellow-600 text-xl"
                          title="Edit room"
                        >
                          <FaEdit />
                        </button>

                        <button
                          onClick={() => handleHardDelete(room.roomId, room.roomName)}
                          className="text-red-400 hover:text-red-600 text-xl"
                          title="Delete room"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredRooms.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-gray-400">
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
