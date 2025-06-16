import React from 'react';
import batman from '../../assets/batman.png'; // Replace with actual image path

const TicketDetail = () => {
  // Dummy data for illustration
  const movie = {
    title: 'Doctor Strange',
    poster: batman,
    screen: 'Screen 5',
    date: 'Monday, May 26, 2025',
    time: '7:30 PM',
    bookingId: 'CIN-78945-2023',
  };

  const seats = ['A2', 'A3', 'A5'];

  const combos = [
    { name: 'Combo A', quantity: 1, price: 5 },
    { name: 'Combo B', quantity: 2, price: 9 },
  ];
  const comboTotal = combos.reduce((sum, c) => sum + c.quantity * c.price, 0);

  const ticketPrice = 15 * seats.length;
  const serviceFee = 2.5;
  const total = ticketPrice + serviceFee + comboTotal;

  const user = {
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    id: '123456789',
    phone: '+84 123 456 789',
  };

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4 flex justify-center">
      <div className="bg-neutral-900 rounded-xl max-w-3xl w-full p-6 shadow-lg space-y-6">
        {/* Title */}
        <h1 className="text-center text-white text-xl font-bold mb-4 tracking-wide border-b border-red-500 pb-2">
          BOOKING CONFIRMATION
        </h1>

        {/* Movie Info */}
        <div className="flex items-center gap-4">
          <img src={movie.poster} alt="Poster" className="w-28 h-40 rounded-md object-cover" />
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">{movie.title}</h2>
            <p className="text-gray-400">{movie.screen}</p>
            <p className="text-gray-400">{movie.date}</p>
            <p className="text-xl">{movie.time}</p>
          </div>
        </div>

        {/* Booking ID */}
        <div className="bg-zinc-800 rounded px-4 py-2 text-sm tracking-wide">
          Booking ID: <span className="text-white font-semibold">{movie.bookingId}</span>
        </div>

        {/* Seat Selection */}
        <div>
          <h3 className="text-red-500 font-semibold">Seat Selection</h3>
          <div className="flex gap-2 mt-2">
            {seats.map((seat) => (
              <span
                key={seat}
                className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold"
              >
                {seat}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div>
          <h3 className="text-red-500 font-semibold mb-2">Pricing</h3>
          <div className="bg-zinc-800 p-4 rounded text-sm space-y-2">
            <div className="flex justify-between">
              <span>Standard Ticket x{seats.length}</span>
              <span>${ticketPrice.toFixed(2)}</span>
            </div>
            {combos.map((combo, index) => (
              <div className="flex justify-between" key={index}>
                <span>
                  {combo.name} x{combo.quantity}
                </span>
                <span>${(combo.quantity * combo.price).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between">
              <span>Service Fee</span>
              <span>${serviceFee.toFixed(2)}</span>
            </div>
            <hr className="border-gray-700" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Your Information */}
        <div>
          <h3 className="text-red-500 font-semibold mb-2">Your Information</h3>
          <div className="text-sm grid grid-cols-1 sm:grid-cols-2 gap-y-1">
            <p><span className="text-gray-400">Full Name:</span> {user.name}</p>
            <p><span className="text-gray-400">Email:</span> {user.email}</p>
            <p><span className="text-gray-400">ID Number:</span> {user.id}</p>
            <p><span className="text-gray-400">Phone:</span> {user.phone}</p>
          </div>
        </div>

        {/* Final Buttons */}
        <div className="flex justify-center mt-6">
          <button
            onClick={() => alert('Ticket saved!')}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold"
          >
            CONFIRM & SAVE TICKET
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
