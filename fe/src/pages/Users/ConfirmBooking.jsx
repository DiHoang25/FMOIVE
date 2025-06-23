import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Use a placeholder image if movie.image_url is not available
import defaultPoster from '../../assets/batman.png'; // Make sure this path is correct

const ConfirmBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [voucherCode, setVoucherCode] = useState('');

  // Destructure all the data passed from the ComboSelectionPage
  const {
    movie: movieDetails,        // Contains name, image_url, version, running_time, time, cinema_room
    selectedSeats,      // Array of seat IDs, e.g., ['A1', 'B2']
    totalSeatPrice,     // Total price calculated for selected seats
    selectedCombos,     // Array of combo objects with name, quantity, price
    totalComboPrice,    // Total price for all selected combos
  } = location.state || {}; // Fallback to an empty object for safety

  // Define service fee (can be static or dynamic based on total)
  const serviceFee = 2.5;

  // Set up variables for display, with fallbacks for direct page access or missing data
  const movie = movieDetails || {
    name: 'Movie Title N/A',
    image_url: defaultPoster, // Default poster if none is provided
    version: 'N/A',
    running_time: 'N/A',
    time: 'N/A', // This should already contain the full date and hour from ShowtimePage
    cinema_room: 'N/A',
  };

  const seats = selectedSeats || []; // Default to empty array if no seats selected
  const combos = selectedCombos || []; // Default to empty array if no combos selected

  // --- IMPORTANT: User data should ideally come from an authentication context or prop ---
  // For now, we'll keep it as a mock, but you should replace this.
  const user = {
    name: 'John Doe', // Replace with dynamic user data
    email: 'john.doe@example.com', // Replace with dynamic user data
    id: 'A12345678', // Replace with dynamic user data
    phone: '+1 (555) 123-4567', // Replace with dynamic user data
  };

  // Calculate the grand total
  const calculatedTicketPrice = totalSeatPrice || 0; // Use the passed totalSeatPrice
  const calculatedCombosTotal = totalComboPrice || 0; // Use the passed totalComboPrice
  const grandTotal = calculatedTicketPrice + serviceFee + calculatedCombosTotal;

  // Optional: Add a useEffect to log missing data or redirect if essential data is not present
  useEffect(() => {
    if (!movieDetails || !selectedSeats || totalSeatPrice === undefined || !selectedCombos || totalComboPrice === undefined) {
      console.warn("ConfirmBooking: Missing essential booking details. Showing default data.");
      // In a production app, you might want to redirect the user
      // navigate('/'); // Example: Redirect to home or an error page
    }
  }, [movieDetails, selectedSeats, totalSeatPrice, selectedCombos, totalComboPrice, navigate]);

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4">
      <div className="max-w-5xl mx-auto bg-neutral-900 rounded-xl p-6 shadow-lg relative">
        <h1 className="text-2xl font-bold text-center mb-8">CONFIRM YOUR BOOKING</h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Movie + Seats + Combos */}
          <div>
            {/* Movie info */}
            <div className="flex gap-4">
              {/* Use movie.image_url and movie.name for dynamic data */}
              <img src={movie.image_url} alt={movie.name} className="w-32 h-48 rounded-md object-cover" />
              <div>
                <h2 className="text-xl font-semibold">{movie.name}</h2> {/* Display movie name */}
                <p className="text-gray-400">{movie.version} • {movie.running_time} min</p> {/* Display version and running time */}
                <p className="text-gray-400">{movie.cinema_room}</p> {/* Display cinema room */}
                <p className="text-gray-400">{movie.time}</p> {/* Display full time string (e.g., "Today, 7:30 PM") */}
              </div>
            </div>

            {/* Seat selection */}
            <h3 className="text-red-500 font-semibold mt-6">Seat Selection</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {seats.length > 0 ? (
                seats.map((seat) => (
                  <span
                    key={seat}
                    className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold"
                  >
                    {seat}
                  </span>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No seats selected.</p>
              )}
            </div>

            {/* Popcorn & Drinks */}
            {combos.length > 0 && ( // Only render this section if there are selected combos
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
                {/* Dynamically show ticket count and calculate price if needed, or just show totalSeatPrice */}
                <span>Tickets ({seats.length} {seats.length === 1 ? 'ticket' : 'tickets'})</span>
                <span>${calculatedTicketPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Fee</span>
                <span>${serviceFee.toFixed(2)}</span>
              </div>
              {combos.length > 0 && ( // Only show combos line if there are combos
                <div className="flex justify-between">
                  <span>Combos</span>
                  <span>${calculatedCombosTotal.toFixed(2)}</span>
                </div>
              )}
              {/* Add a line for voucher discount if implemented */}
              {/*
              {voucherDiscount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Voucher Discount</span>
                  <span>-${voucherDiscount.toFixed(2)}</span>
                </div>
              )}
              */}
              <hr className="my-2 border-gray-700" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${grandTotal.toFixed(2)}</span>
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
            onClick={() => navigate('/payment', { // Assuming /payment leads to /ticket-detail on success
                state: {
                    movie: movieDetails,        // Full movie object
                    selectedSeats: selectedSeats, // Array of seat IDs
                    totalSeatPrice: calculatedTicketPrice, // Total price for seats
                    selectedCombos: selectedCombos, // Array of combo objects
                    totalComboPrice: calculatedCombosTotal, // Total price for combos
                    serviceFee: serviceFee,     // Service fee
                    grandTotal: grandTotal,     // Grand total
                    user: user,                 // User details (mock for now)
                    // Add a bookingId here, as it's generated *after* successful booking/payment
                    bookingId: `CIN-${Math.floor(Math.random() * 100000) + 100000}-${new Date().getFullYear()}`, // Example: generate a simple mock booking ID
                }
            })}
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