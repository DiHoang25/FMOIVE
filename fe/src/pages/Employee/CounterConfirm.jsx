import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Helper function to format cinema room name (e.g., "ROOM000000016" to "Cinema 16")
const formatCinemaRoomName = (roomName) => {
  if (!roomName) return 'N/A';
  const match = roomName.match(/ROOM0*(\d+)/);
  if (match && match[1]) {
    return `Cinema ${parseInt(match[1], 10)}`;
  }
  return roomName;
};

// Helper function to format the movie time string for display (adapted from ConfirmBooking)
const formatMovieTime = (timeString) => {
    if (!timeString || timeString === 'N/A') return { display: 'N/A' };

    const dateObj = new Date(timeString);

    if (isNaN(dateObj.getTime())) {
        // Fallback for unparseable strings (e.g., "Monday, May 26, 2025, 7:30 PM")
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


const CounterConfirmBooking = () => {
    const navigate = useNavigate();
    const { state } = useLocation();

    const [voucherCode, setVoucherCode] = useState('');
    const [voucherDiscount, setVoucherDiscount] = useState(0); // Add state for voucher discount

    const {
        movieDetails = {},
        selectedSeats = [],        // Expecting an array of seat objects {label, price, type, ...}
        selectedCombos = [],
        ticketPrice = 0,           // This should be the total calculated ticket price
        serviceFee = 0, // Keep for destructuring, but won't be displayed or used in total
        combosTotal = 0,
        finalTotal = 0,            // This should be the grand total before voucher
        userInformation = {}, // Keep for destructuring, but won't be displayed
    } = state || {};

    // Fallback for movie details
    const movie = movieDetails || {
        name: 'Unknown Movie',
        image_url: 'https://placehold.co/120x180/000000/FFFFFF?text=No+Poster', // Default poster
        version: 'N/A',
        running_time: 'N/A',
        time: 'N/A', // Assuming this holds the full date and time string
        cinema_room: 'N/A',
        genres: [],
    };

    // Format movie time and cinema room for display
    const formattedMovieTimeDisplay = formatMovieTime(movie.time);
    const displayCinemaRoomName = formatCinemaRoomName(movie.cinema_room);

    // Ensure seatsDisplay and combosDisplay are arrays for mapping
    const seatsDisplay = selectedSeats; // Now expecting array of seat objects
    const combosDisplay = selectedCombos;

    // Use the passed totals directly, as they should be pre-calculated
    const currentTicketPrice = ticketPrice;
    // currentServiceFee is removed from display and total calculation
    const currentCombosTotal = combosTotal;
    
    // Calculate the actual grand total, applying voucher discount, and excluding serviceFee
    const currentGrandTotal = (ticketPrice + combosTotal) - voucherDiscount;

    useEffect(() => {
        if (!state) {
            console.warn('No state found in useLocation. Ensure data is passed from previous page.');
        } else {
            console.log('Received state in CounterConfirmBooking:', state); // For debugging
        }
    }, [state]);

    // Function to navigate to payment page and pass all data
    const handleProceedToPayment = () => {
        navigate('/employee/counter-payment', {
            state: {
                movieDetails: movie, // Pass the possibly fallback movie object
                selectedSeats: seatsDisplay, // Pass the seat objects
                selectedCombos: combosDisplay,
                ticketPrice: currentTicketPrice,
                serviceFee: 0, // Pass 0 for service fee as it's removed
                combosTotal: currentCombosTotal,
                finalTotal: currentGrandTotal, // Pass the grand total after voucher
                userInformation, // Still pass userInformation even if not displayed
            },
        });
    };

    return (
        <div className="min-h-screen bg-black text-white py-10 px-4">
            <div className="max-w-5xl mx-auto bg-neutral-900 rounded-2xl p-8 shadow-lg">

                <h1 className="text-3xl font-bold text-center mb-10">🎟️ Confirm Your Booking</h1>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-8">

                        {/* Movie Info */}
                        <div className="flex gap-4 items-center">
                            <img src={movie.image_url} alt="Movie Poster" className="w-28 h-40 rounded-lg object-cover" />
                            <div>
                                <h2 className="text-xl font-bold">{movie.name}</h2>
                                <p className="text-gray-400 mt-1 text-base">{displayCinemaRoomName}</p> {/* Use formatted cinema room name */}
                                <p className="text-gray-400">{formattedMovieTimeDisplay.display}</p> {/* Use formatted time display */}
                                <p className="text-gray-400">{movie.version || 'N/A'} • {movie.running_time} min • {movie.genres && movie.genres.length > 0 ? movie.genres.join(', ') : 'N/A'}</p>
                            </div>
                        </div>

                        {/* Seats */}
                        <div>
                            <h3 className="text-lg font-semibold text-red-500 mb-2">🎫 Seat Selection</h3>
                            <div className="flex flex-wrap gap-2">
                                {seatsDisplay.length > 0 ? (
                                    seatsDisplay.map(seat => (
                                        <span
                                            key={seat.label} // Use seat.label for the key
                                            className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium"
                                        >
                                            {seat.label} {/* Render seat.label instead of the entire object */}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-gray-400">No seats selected.</span>
                                )}
                            </div>
                        </div>

                        {/* Combos */}
                        {combosDisplay.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-red-500 mb-2">🍿 Popcorn & Drinks</h3>
                                <div className="space-y-2 text-base">
                                    {combosDisplay.map(combo => (
                                        <div key={combo.id} className="flex justify-between bg-zinc-800 px-4 py-2 rounded">
                                            <span>{combo.name} × {combo.quantity}</span>
                                            <span>{(combo.price * combo.quantity).toLocaleString('vi-VN')} VND</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                        {/* User Information section removed */}

                        {/* Voucher Input */}
                        <div>
                            <h3 className="text-lg font-semibold text-red-500 mb-2">🏷️ Voucher Code</h3>
                            <div className="flex mt-1 gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter voucher code"
                                    value={voucherCode}
                                    onChange={(e) => setVoucherCode(e.target.value)}
                                    className="bg-zinc-800 text-white px-4 py-2 rounded w-full text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                                />
                                <button
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium"
                                    // You'll need to implement the actual voucher application logic here
                                    // This would typically involve an API call to validate the voucher
                                    // and then update the `voucherDiscount` state.
                                >
                                    Apply
                                </button>
                            </div>
                            {voucherDiscount > 0 && (
                                <p className="text-green-400 text-sm mt-2">Discount applied: {voucherDiscount.toLocaleString('vi-VN')} VND</p>
                            )}
                        </div>

                        {/* Payment Summary */}
                        <div>
                            <h3 className="text-lg font-semibold text-red-500 mb-2">💳 Payment Summary</h3>
                            <div className="bg-zinc-800 rounded-lg p-4 space-y-2 text-base">
                                <div className="flex justify-between">
                                    <span>Tickets ({seatsDisplay.length})</span>
                                    <span>{currentTicketPrice.toLocaleString('vi-VN')} VND</span>
                                </div>
                                {/* Service Fee line removed */}
                                {combosDisplay.length > 0 && (
                                    <div className="flex justify-between">
                                        <span>Combos</span>
                                        <span>{currentCombosTotal.toLocaleString('vi-VN')} VND</span>
                                    </div>
                                )}
                                {voucherDiscount > 0 && (
                                    <div className="flex justify-between text-green-400">
                                        <span>Voucher Discount</span>
                                        <span>-{voucherDiscount.toLocaleString('vi-VN')} VND</span>
                                    </div>
                                )}
                                <hr className="border-gray-700" />
                                <div className="flex justify-between font-bold text-xl">
                                    <span>Total</span>
                                    <span>{currentGrandTotal.toLocaleString('vi-VN')} VND</span>
                                </div>
                            </div>

                            <p className="text-xs text-gray-300 mt-3 bg-zinc-800 rounded px-3 py-2">
                                💡 You will be redirected to our secure payment gateway after confirmation.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-center gap-6 mt-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2 rounded text-base font-medium"
                    >
                        ← Back
                    </button>
                    <button
                        onClick={handleProceedToPayment}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded text-base font-semibold"
                    >
                        Proceed to Payment →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CounterConfirmBooking;
