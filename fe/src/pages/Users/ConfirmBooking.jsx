import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import batman from '../../assets/batman.png'; 

const ConfirmBooking = () => {
  const navigate = useNavigate();
  const [voucherCode, setVoucherCode] = useState('');

  const movie = {
    title: 'The Dark Knight',
    poster: batman,
    time: 'Today, May 26',
    hour: '7:30 PM',
    screen: 'Screen 5',
  };

  const seats = ['A2', 'A3', 'A5'];
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    id: 'A12345678',
    phone: '+1 (555) 123-4567',
  };

  const combos = [
    { id: 1, name: 'Combo A', quantity: 1, price: 5 },
    { id: 2, name: 'Combo B', quantity: 2, price: 9 },
  ];

  const ticketPrice = 15 * seats.length;
  const serviceFee = 2.5;
  const combosTotal = combos.reduce((acc, combo) => acc + combo.price * combo.quantity, 0);
  const total = ticketPrice + serviceFee + combosTotal;

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4">
      <div className="max-w-5xl mx-auto bg-neutral-900 rounded-xl p-6 shadow-lg relative">
        <h1 className="text-2xl font-bold text-center mb-8">CONFIRM YOUR BOOKING</h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Movie + Seats + Combos */}
          <div>
            {/* Movie info */}
            <div className="flex gap-4">
              <img src={movie.poster} alt="Poster" className="w-32 h-48 rounded-md object-cover" />
              <div>
                <h2 className="text-lg font-semibold">{movie.title}</h2>
                <p className="text-gray-400">{movie.screen}</p>
                <p className="text-gray-400">{movie.time} &nbsp; {movie.hour}</p>
              </div>
            </div>

            {/* Seat selection */}
            <h3 className="text-red-500 font-semibold mt-6">Seat Selection</h3>
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

            {/* Popcorn & Drinks */}
            {combos.length > 0 && (
              <>
                <h3 className="text-red-500 font-semibold mt-6">Popcorn & Drinks</h3>
                <ul className="mt-2 space-y-2 text-sm">
                  {combos.map((combo) => (
                    <li
                      key={combo.id}
                      className="flex justify-between bg-zinc-800 px-4 py-2 rounded"
                    >
                      <span>{combo.name} x{combo.quantity}</span>
                      <span>${(combo.price * combo.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Right: Info + Summary */}
          <div>
            {/* User info */}
            <h3 className="text-red-500 font-semibold">Your Information</h3>
            <div className="text-sm border-t border-gray-600 mt-1 pt-2 space-y-1">
              <p><span className="text-gray-400">Full Name:</span> {user.name}</p>
              <p><span className="text-gray-400">Email:</span> {user.email}</p>
              <p><span className="text-gray-400">ID Number:</span> {user.id}</p>
              <p><span className="text-gray-400">Phone:</span> {user.phone}</p>
            </div>

            {/* Voucher Input */}
            <h3 className="text-red-500 font-semibold mt-6">Voucher Code</h3>
            <div className="flex mt-2 gap-2">
              <input
                type="text"
                placeholder="Enter voucher code"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                className="bg-zinc-800 text-white px-4 py-2 rounded w-full text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
              />
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium"
              >
                Apply
              </button>
            </div>

            {/* Payment summary */}
            <h3 className="text-red-500 font-semibold mt-6">Payment Summary</h3>
            <div className="bg-zinc-800 rounded p-4 mt-2 text-sm space-y-1">
              <div className="flex justify-between">
                <span>Standard Ticket x{seats.length}</span>
                <span>${ticketPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Fee</span>
                <span>${serviceFee.toFixed(2)}</span>
              </div>
              {combos.length > 0 && (
                <div className="flex justify-between">
                  <span>Combos</span>
                  <span>${combosTotal.toFixed(2)}</span>
                </div>
              )}
              <hr className="my-2 border-gray-700" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <p className="text-xs text-gray-300 mt-2 bg-zinc-800 rounded p-3">
              You will be redirected to our secure payment gateway after confirmation
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4 mt-10">
          <button
            onClick={() => navigate(-1)}
            className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2 rounded"
          >
            BACK
          </button>
          <button
            onClick={() =>  navigate('/payment')}
           
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold"
          >
            PROCEED TO PAYMENT
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmBooking;
