import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import SidebarLayout from '../../components/Sidebar-Admin';

const initialSeats = [
  // Example seat data - you'll likely fetch this from an API
  { id: '1A', type: 'normal', status: 'available' },
  { id: '1B', type: 'normal', status: 'available' },
  { id: '1C', type: 'normal', status: 'available' },
  { id: '1D', type: 'vip', status: 'available' },
  { id: '1E', type: 'vip', status: 'available' },
  { id: '1F', type: 'vip', status: 'available' },
  { id: '2A', type: 'normal', status: 'available' },
  { id: '2B', type: 'normal', status: 'available' },
  { id: '2C', type: 'normal', status: 'available' },
  { id: '2D', type: 'normal', status: 'available' },
  { id: '2E', type: 'normal', status: 'available' },
  { id: '2F', type: 'normal', status: 'available' },
  { id: '3A', type: 'normal', status: 'available' },
  { id: '3B', type: 'normal', status: 'available' },
  { id: '3C', type: 'normal', status: 'available' },
  { id: '3D', type: 'normal', status: 'available' },
  { id: '3E', type: 'normal', status: 'available' },
  { id: '3F', type: 'normal', status: 'available' },
  { id: '4A', type: 'normal', status: 'available' },
  { id: '4B', type: 'normal', status: 'available' },
  { id: '4C', type: 'normal', status: 'available' },
  { id: '4D', type: 'normal', status: 'available' },
  { id: '4E', type: 'normal', status: 'available' },
  { id: '4F', type: 'normal', status: 'available' },
  { id: '5A', type: 'normal', status: 'available' },
  { id: '5B', type: 'normal', status: 'available' },
  { id: '5C', type: 'normal', status: 'available' },
  { id: '5D', type: 'normal', status: 'available' },
  { id: '5E', type: 'normal', status: 'available' },
  { id: '5F', type: 'normal', status: 'available' },
  { id: '6A', type: 'normal', status: 'available' },
  { id: '6B', type: 'normal', status: 'available' },
  { id: '6C', type: 'normal', status: 'available' },
  { id: '6D', type: 'normal', status: 'available' },
  { id: '6E', type: 'normal', status: 'available' },
  { id: '6F', type: 'normal', status: 'available' },
  { id: '7A', type: 'normal', status: 'available' },
  { id: '7B', type: 'normal', status: 'available' },
  { id: '7C', type: 'normal', status: 'available' },
  { id: '7D', type: 'normal', status: 'available' },
  { id: '7E', type: 'normal', status: 'available' },
  { id: '7F', type: 'normal', status: 'available' },
  { id: '8A', type: 'normal', status: 'available' },
  { id: '8B', type: 'normal', status: 'available' },
  { id: '8C', type: 'normal', status: 'available' },
  { id: '8D', type: 'normal', status: 'available' },
  { id: '8E', type: 'normal', status: 'available' },
  { id: '8F', type: 'normal', status: 'available' },
  { id: '9A', type: 'normal', status: 'available' },
  { id: '9B', type: 'normal', status: 'available' },
  { id: '9C', type: 'normal', status: 'available' },
  { id: '9D', type: 'normal', status: 'available' },
  { id: '9E', type: 'normal', status: 'available' },
  { id: '9F', type: 'normal', status: 'available' },
  { id: '10A', type: 'vip', status: 'available' },
  { id: '10B', type: 'vip', status: 'available' },
  { id: '10C', type: 'vip', status: 'available' },
  { id: '10D', type: 'vip', status: 'available' },
  { id: '10E', type: 'vip', status: 'available' },
  { id: '10F', type: 'vip', status: 'available' },
];

const CinemaRoomSeats = () => {
  const { roomId } = useParams();
  const [seats, setSeats] = useState(initialSeats);
  const [cinemaRoomName, setCinemaRoomName] = useState(`Cinema room ${roomId}`); // Placeholder

  useEffect(() => {
    // In a real application, you would fetch seat data for the given roomId
    // and update cinemaRoomName here.
    // For now, we'll use the initialSeats and a placeholder name.
  }, [roomId]);

  const handleSeatClick = (seatId) => {
    setSeats(prevSeats =>
      prevSeats.map(seat =>
        seat.id === seatId
          ? { ...seat, type: seat.type === 'normal' ? 'vip' : 'normal' } // Toggle seat type
          : seat
      )
    );
  };

  const handleSave = () => {
    // Implement save logic here, e.g., send updated seat data to an API
    console.log('Saving seat changes:', seats);
    alert('Changes saved successfully!');
    // After saving, you might want to navigate back or refresh data
  };

  return (
    <SidebarLayout>
      <div className="p-6 text-white">
        <h2 className="text-2xl font-bold mb-6">Seat detail: {cinemaRoomName}</h2>

        <div className="flex flex-col items-center mb-8">
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' }}>
            {seats.map(seat => (
              <div
                key={seat.id}
                className={`w-12 h-12 flex items-center justify-center rounded-md cursor-pointer
                  ${seat.type === 'normal' ? 'bg-gray-400 hover:bg-gray-500' : 'bg-blue-500 hover:bg-blue-600'}
                  ${seat.status === 'available' ? 'text-white' : 'text-gray-300 opacity-50'}
                  ${seat.type === 'vip' ? 'bg-blue-500 hover:bg-blue-600' : ''} // Blue for VIP as per image
                `}
                onClick={() => handleSeatClick(seat.id)}
              >
                {seat.id}
              </div>
            ))}
          </div>
          <div className="w-full h-1 bg-gray-600 my-8"></div>
          <p className="text-lg">Screen</p>
        </div>

        <div className="flex justify-center items-center mb-8">
          <label className="inline-flex items-center mr-4">
            <input type="checkbox" className="form-checkbox text-gray-600" checked={true} disabled />
            <span className="ml-2 text-gray-300">Seat Normal</span>
          </label>
          <label className="inline-flex items-center">
            <input type="checkbox" className="form-checkbox text-blue-600" checked={true} disabled />
            <span className="ml-2 text-gray-300">Seat VIP</span>
          </label>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={handleSave}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md shadow flex items-center"
          >
            <span className="mr-1">Save</span>
          </button>
          <Link
            to="/admin/cinema-rooms"
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md shadow flex items-center"
          >
            <span className="mr-1">Back</span>
          </Link>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default CinemaRoomSeats;