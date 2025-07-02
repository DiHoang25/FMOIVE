import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Redux imports
import { useSelector, useDispatch } from 'react-redux';
import { updateGrandTotal } from '../../redux/bookingSlice'; // Keeping your specified path

// Use a placeholder image if movie.image_url is not available
import defaultPoster from '../../assets/batman.png'; // Make sure this path is correct

const ConfirmBooking = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [voucherCode, setVoucherCode] = useState('');
  const [voucherDiscount, setVoucherDiscount] = useState(0); // State for voucher discount

  // Destructure all the data from Redux store
  const {
    movieDetails,
    selectedSeats,
    totalSeatPrice,
    selectedCombos,
    totalComboPrice,
    serviceFee, // Comes from initial state in slice
    user,       // Comes from initial state in slice (mock)
    // grandTotal is re-calculated here based on current values and discount
  } = useSelector((state) => state.booking);


  // Set up variables for display, with fallbacks for direct page access or missing data
  const movie = movieDetails || {
    name: 'Movie Title N/A',
    image_url: defaultPoster,
    version: 'N/A',
    running_time: 'N/A',
    time: 'N/A',
    cinema_room: 'N/A',
    genres: [], // Ensure genres is in fallback
  };

  const seats = selectedSeats || [];
  const combos = selectedCombos || [];
  const userData = user || { // Use userData to avoid naming conflict with the 'user' prop in the slice
    name: 'N/A',
    email: 'N/A',
    id: 'N/A',
    phone: 'N/A',
  };

  // Calculate the grand total on this page, considering potential voucher discounts
  const calculatedTicketPrice = totalSeatPrice || 0;
  const calculatedCombosTotal = totalComboPrice || 0;
  const calculatedServiceFee = serviceFee || 0; // Use serviceFee from Redux

  // Grand total calculation that includes the voucher discount
  const grandTotalAfterDiscount = (calculatedTicketPrice + calculatedServiceFee + calculatedCombosTotal - voucherDiscount);

  // Update Redux store's grandTotal whenever the calculation changes (e.g., if a voucher is applied)
  useEffect(() => {
    dispatch(updateGrandTotal(grandTotalAfterDiscount));
  }, [grandTotalAfterDiscount, dispatch]); // Depend on grandTotalAfterDiscount to dispatch when it changes

  // **REMOVED:** The useEffect that redirects if essential data is not present.
  // This means the page will no longer automatically navigate away if Redux state is incomplete.
  // Some information might display as 'N/A' if the flow is not followed from ShowtimePage.
  // useEffect(() => {
  //   if (!movieDetails || !movieDetails.time || !movieDetails.cinema_room) {
  //     console.warn("ConfirmBooking: Missing essential movie or showtime details in Redux. Redirecting to Showtime page.");
  //     navigate('/showtime');
  //   } else if (!selectedSeats || totalSeatPrice === undefined) {
  //       console.warn("ConfirmBooking: Missing seat selection details in Redux. Redirecting to Seat Selection page.");
  //       navigate('/select-seats');
  //   } else if (!selectedCombos || totalComboPrice === undefined) {
  //       console.warn("ConfirmBooking: Missing combo selection details in Redux. Redirecting to Combo Selection page.");
  //       navigate('/combo-selection');
  //   }
  // }, [movieDetails, selectedSeats, totalSeatPrice, selectedCombos, totalComboPrice, navigate]);


  const handleProceedToPayment = () => {
    // All data is in Redux, so no need to pass state via navigate
    navigate('/payment');
  };

  // Helper function to format the movie time string for display (Updated)
  const formatMovieTime = (timeString) => {
      if (!timeString || timeString === 'N/A') return { display: 'N/A' };

      const dateObj = new Date(timeString);

      if (isNaN(dateObj.getTime())) {
          // Fallback for unparseable strings
          const parts = timeString.split(', ');
          const timePart = parts[parts.length - 1].trim(); // Get the last part as time
          // Reconstruct date part, excluding year if present
          const datePartArray = parts.slice(0, parts.length - 1).filter(part => !/\d{4}/.test(part.trim()));
          const datePart = datePartArray.join(', ').trim();
          return { display: `${timePart}, ${datePart}` };
      }

      // Options for date formatting (excluding year)
      const dateOptions = { weekday: 'long', month: 'long', day: 'numeric' };
      const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };

      const formattedDate = dateObj.toLocaleDateString('en-US', dateOptions); // e.g., "Monday, June 30"
      const formattedTime = dateObj.toLocaleTimeString('en-US', timeOptions); // e.g., "3:00 PM"

      // Construct the desired display string: "TIME, DATE"
      return { display: `${formattedTime}, ${formattedDate}` };
  };
  const formattedTime = formatMovieTime(movie.time);

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4">
      <div className="max-w-5xl mx-auto bg-neutral-900 rounded-xl p-6 shadow-lg relative">
        <h1 className="text-2xl font-bold text-center mb-8">CONFIRM YOUR BOOKING</h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Movie + Seats + Combos */}
          <div>
            {/* Movie info */}
            <div className="flex gap-4">
              <img src={movie.image_url} alt={movie.name} className="w-32 h-48 rounded-md object-cover" />
              <div>
                <h2 className="text-xl font-semibold">{movie.name}</h2>
                <p className="text-gray-400">
                  {movie.version || 'N/A'} • {movie.running_time} min • {movie.genres && movie.genres.length > 0 ? movie.genres.join(', ') : 'N/A'}
                </p>
                <p className="text-gray-400">{movie.cinema_room || 'N/A'}</p>
                <p className="text-gray-400">{formattedTime.display}</p> {/* Using the new 'display' property */}
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
              <p><span className="text-gray-400">Full Name:</span> {userData.name}</p>
              <p><span className="text-gray-400">Email:</span> {userData.email}</p>
              <p><span className="text-gray-400">ID Number:</span> {userData.id}</p>
              <p><span className="text-gray-400">Phone:</span> {userData.phone}</p>
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
                // Implement voucher application logic here, updating voucherDiscount state
              >
                Apply
              </button>
            </div>

            {/* Payment summary */}
            <h3 className="text-red-500 font-semibold mt-6">Payment Summary</h3>
            <div className="bg-zinc-800 rounded p-4 mt-2 text-sm space-y-1">
              <div className="flex justify-between">
                <span>Tickets ({seats.length} {seats.length === 1 ? 'ticket' : 'tickets'})</span>
                <span>${calculatedTicketPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Fee</span>
                <span>${calculatedServiceFee.toFixed(2)}</span>
              </div>
              {combos.length > 0 && ( // Only show combos line if there are combos
                <div className="flex justify-between">
                  <span>Combos</span>
                  <span>${calculatedCombosTotal.toFixed(2)}</span>
                </div>
              )}
              {voucherDiscount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Voucher Discount</span>
                  <span>-${voucherDiscount.toFixed(2)}</span>
                </div>
              )}
              <hr className="my-2 border-gray-700" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${grandTotalAfterDiscount.toFixed(2)}</span>
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
            onClick={handleProceedToPayment}
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
