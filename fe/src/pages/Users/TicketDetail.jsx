import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useLocation

// Use a default poster if movie.image_url is not available
import defaultPoster from '../../assets/batman.png'; // Make sure this path is correct

const TicketDetail = () => {
  const location = useLocation(); // Get the location object to access state
  const navigate = useNavigate(); // Use navigate for navigation actions
  // Destructure data passed from the previous page (ConfirmBooking or Payment Success)
  const {
    movie: movieDetails,        // Full movie object: name, image_url, version, running_time, time, cinema_room
    selectedSeats,      // Array of seat IDs, e.g., ['A1', 'B2']
    totalSeatPrice,     // Total price calculated for selected seats
    selectedCombos,     // Array of combo objects with name, quantity, price, id
    totalComboPrice,    // Total price for all selected combos
    serviceFee,         // Service fee (passed from ConfirmBooking)
    grandTotal,         // Grand total (passed from ConfirmBooking)
    user: userData,     // User details (passed from ConfirmBooking, or from auth context)
    bookingId,          // The booking ID (mock generated in ConfirmBooking or from backend)
  } = location.state || {}; // Fallback to an empty object for safety

  // Define fallbacks for display if data is missing (e.g., direct page access)
  const movie = movieDetails || {
    name: 'Movie Title N/A',
    image_url: defaultPoster, // Default poster if none is provided
    version: 'N/A',
    running_time: 'N/A',
    time: 'N/A', // This should already contain the full date and hour from previous steps
    cinema_room: 'N/A',
  };

  const seats = selectedSeats || [];
  const combos = selectedCombos || [];
  const user = userData || { // Fallback for user data (replace with actual user data logic)
    name: 'N/A',
    email: 'N/A',
    id: 'N/A',
    phone: 'N/A',
  };

  // Use the actual calculated prices received, provide fallbacks
  const actualTotalSeatPrice = totalSeatPrice || 0;
  const actualTotalComboPrice = totalComboPrice || 0;
  const actualServiceFee = serviceFee || 0;
  const actualGrandTotal = grandTotal || 0; // The final total confirmed on the previous page

  // Optional: useEffect to handle cases where essential data might be missing
  useEffect(() => {
    if (!movieDetails || !selectedSeats || totalSeatPrice === undefined || !selectedCombos || totalComboPrice === undefined || !bookingId || grandTotal === undefined) {
      console.warn("TicketDetail: Missing essential booking confirmation data. Displaying default/empty values.");
      // In a real application, you might redirect to a booking history page or error page if data is crucial
      // Example: navigate('/booking-history');
    }
  }, [movieDetails, selectedSeats, totalSeatPrice, selectedCombos, totalComboPrice, bookingId, grandTotal]);

  // Helper function to format the movie time string for display
  const formatMovieTime = (timeString) => {
      if (!timeString || timeString === 'N/A') return { date: 'N/A', time: 'N/A' };
      // Assuming timeString is like "Today, 7:30 PM" or "Monday, May 26, 7:30 PM"
      const parts = timeString.split(', ');
      if (parts.length > 1) {
          const datePart = parts.slice(0, -1).join(', '); // All parts except the last one (which is time)
          const timePart = parts[parts.length - 1];      // The last part is the time
          return { date: datePart, time: timePart };
      }
      return { date: timeString, time: '' }; // Fallback if no comma (might just be a date or just a time)
  };

  const formattedTime = formatMovieTime(movie.time);


  return (
    <div className="min-h-screen bg-black text-white py-10 px-4 flex justify-center">
      <div className="bg-neutral-900 rounded-xl max-w-3xl w-full p-6 shadow-lg space-y-6">
        {/* Title */}
        <h1 className="text-center text-white text-xl font-bold mb-4 tracking-wide border-b border-red-500 pb-2">
          BOOKING CONFIRMATION
        </h1>

        {/* Movie Info */}
        <div className="flex items-center gap-4">
          {/* Use dynamic movie data */}
          <img src={movie.image_url} alt={movie.name} className="w-28 h-40 rounded-md object-cover" />
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">{movie.name}</h2> {/* Movie Title */}
            <p className="text-gray-400">{movie.cinema_room}</p> {/* Screen */}
            <p className="text-gray-400">{formattedTime.date}</p> {/* Formatted Date */}
            <p className="text-xl">{formattedTime.time}</p> {/* Formatted Time */}
          </div>
        </div>

        {/* Booking ID */}
        <div className="bg-zinc-800 rounded px-4 py-2 text-sm tracking-wide">
          Booking ID: <span className="text-white font-semibold">{bookingId || 'N/A'}</span> {/* Display dynamic bookingId */}
        </div>

        {/* Seat Selection */}
        <div>
          <h3 className="text-red-500 font-semibold">Seat Selection</h3>
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
        </div>

        {/* Popcorn & Drinks (Combos) */}
        {combos.length > 0 && ( // Only show this section if there are selected combos
          <div>
            <h3 className="text-red-500 font-semibold mb-2">Popcorn & Drinks</h3>
            <div className="bg-zinc-800 p-4 rounded text-sm space-y-2">
              {combos.map((combo) => ( // Iterate through dynamic combos
                <div className="flex justify-between" key={combo.id || combo.name}> {/* Use combo.id if available, otherwise combo.name */}
                  <span>{combo.name} x{combo.quantity}</span>
                  <span>${(combo.quantity * combo.price).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Summary */}
        <div>
          <h3 className="text-red-500 font-semibold mb-2">Pricing</h3>
          <div className="bg-zinc-800 p-4 rounded text-sm space-y-2">
            <div className="flex justify-between">
              {/* Display total seat price, not hardcoded per seat price */}
              <span>Tickets ({seats.length} {seats.length === 1 ? 'ticket' : 'tickets'})</span>
              <span>${actualTotalSeatPrice.toFixed(2)}</span>
            </div>
            {combos.length > 0 && ( // Only show combos line if there are combos
                <div className="flex justify-between">
                  <span>Combos</span>
                  <span>${actualTotalComboPrice.toFixed(2)}</span>
                </div>
            )}
            <div className="flex justify-between">
              <span>Service Fee</span>
              <span>${actualServiceFee.toFixed(2)}</span>
            </div>
            {/* Add voucher discount here if applicable (e.g., if you pass it from ConfirmBooking) */}
            {/* <div className="flex justify-between text-green-400">
                <span>Voucher Discount</span>
                <span>-${voucherDiscount.toFixed(2)}</span>
            </div> */}
            <hr className="border-gray-700" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${actualGrandTotal.toFixed(2)}</span>
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
            onClick={() =>navigate('/viewbookedticket')} // Navigate to booking history page
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