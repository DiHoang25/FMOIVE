import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios for API calls
import { message } from 'antd'; // Import message for notifications

// Redux imports
import { useSelector, useDispatch } from 'react-redux';
import { updateGrandTotal } from '../../redux/bookingSlice'; // Keeping your specified path
import { setUser } from '../../redux/bookingSlice'; // Assuming you add a setUser action to your bookingSlice

// Use a placeholder image if movie.image_url is not available
import defaultPoster from '../../assets/batman.png'; // Make sure this path is correct

// Helper function to format cinema room name (e.g., "ROOM000000016" to "Cinema 16")
const formatCinemaRoomName = (roomName) => {
  if (!roomName) return 'N/A';
  const match = roomName.match(/ROOM0*(\d+)/);
  if (match && match[1]) {
    return `Cinema ${parseInt(match[1], 10)}`;
  }
  return roomName;
};

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
    user, // Get user from Redux
  } = useSelector((state) => state.booking);

  // Set up variables for display, with fallbacks for direct page access or missing data
  const movie = movieDetails || {
    name: 'Movie Title N/A',
    image_url: defaultPoster,
    version: 'N/A',
    running_time: 'N/A',
    time: 'N/A',
    cinema_room: 'N/A',
    genres: [],
  };

  const seats = selectedSeats || [];
  const combos = selectedCombos || [];
  const userData = user || {
    name: 'N/A',
    email: 'N/A',
    id: 'N/A',
    phone: 'N/A',
    // Add other user fields from your database if needed
    username: 'N/A',
    gender: 'N/A',
    address: 'N/A',
    id_card: 'N/A',
  };

  // Calculate the grand total on this page, considering potential voucher discounts
  const calculatedTicketPrice = totalSeatPrice || 0;
  const calculatedCombosTotal = totalComboPrice || 0;


  const grandTotalAfterDiscount = (calculatedTicketPrice +  calculatedCombosTotal - voucherDiscount);

  // Update Redux store's grandTotal whenever the calculation changes
  useEffect(() => {
    dispatch(updateGrandTotal(grandTotalAfterDiscount));
  }, [grandTotalAfterDiscount, dispatch]);

  // Helper function to format the movie time string for display (Updated)
  const formatMovieTime = (timeString) => {
      if (!timeString || timeString === 'N/A') return { display: 'N/A' };

      const dateObj = new Date(timeString);

      if (isNaN(dateObj.getTime())) {
          const parts = timeString.split(', ');
          const timePart = parts[parts.length - 1].trim();
          const datePartArray = parts.slice(0, parts.length - 1).filter(part => !/\d{4}/.test(part.trim()));
          const datePart = datePartArray.join(', ').trim();
          return { display: `${timePart}, ${datePart}` };
      }

      const dateOptions = { weekday: 'long', month: 'long', day: 'numeric' };
      const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };

      const formattedDate = dateObj.toLocaleDateString('en-US', dateOptions);
      const formattedTime = dateObj.toLocaleTimeString('en-US', timeOptions);

      return { display: `${formattedTime}, ${formattedDate}` };
  };
  const formattedTime = formatMovieTime(movie.time);
  const displayCinemaRoomName = formatCinemaRoomName(movie.cinema_room); // Formatted cinema room name

  // Simulate fetching user data from a backend or local storage and dispatching to Redux
  // In a real app, this might happen on login or a dedicated user profile page
  useEffect(() => {
    const fetchAndSetUserData = async () => {
      const token = localStorage.getItem('token'); // Get token if available
      if (token) {
        try {
          // Replace with your actual API endpoint for fetching user details
          const response = await axios.get('http://localhost:5000/api/user/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const fetchedUser = response.data.user; // Assuming user data is in response.data.user

          // Dispatch the fetched user data to Redux
          dispatch(setUser({
            name: fetchedUser.fullname,
            email: fetchedUser.email,
            id: fetchedUser.id_card, // Using id_card as ID
            phone: fetchedUser.phone,
            username: fetchedUser.username,
            gender: fetchedUser.gender,
            address: fetchedUser.address,
            // Add other necessary fields
          }));
        } catch (error) {
          console.error('Error fetching user data:', error);
          // message.error('Failed to load user data.');
        }
      }
    };
    fetchAndSetUserData();
  }, [dispatch]); // Only run once on component mount

  const handleProceedToPayment = async () => {
    // Simulate updating user info in the database
    // This is a placeholder for your actual backend API call to update user profile
    try {
      const token = localStorage.getItem('token');
      if (token && user && user.id) { // Ensure user data and ID are available
        const userId = user.id; // Or user.userId if that's the ID for your user update endpoint

        // Example: Only update fields that might change or need to be consistent
        const userUpdatePayload = {
          fullname: userData.name,
          email: userData.email,
          phone: userData.phone,
          address: userData.address,
          // Add other fields you want to update
        };

        // Replace with your actual user update API endpoint
        // Assuming your user update endpoint is something like /api/users/{userId}
        await axios.patch(`http://localhost:5000/api/users/${userId}`, userUpdatePayload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        message.success('User information updated successfully in database!');
      }
    } catch (error) {
      console.error('Error updating user info in database:', error);
      message.error('Failed to update user information in database.');
      // Decide if you want to stop the payment process here or allow it to continue
      // For now, it will continue to payment page even if user update fails.
    }

    // Navigate to payment page
    navigate('/payment');
  };

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
                <p className="text-gray-400">{displayCinemaRoomName}</p> {/* Using formatted cinema room name */}
                <p className="text-gray-400">{formattedTime.display}</p>
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
                      <span>{(combo.price * combo.quantity).toLocaleString('vi-VN')} VND</span>
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
              {/* Add other user details from Redux/fetched data */}
              <p><span className="text-gray-400">Username:</span> {userData.username}</p>
              <p><span className="text-gray-400">Gender:</span> {userData.gender}</p>
              <p><span className="text-gray-400">Address:</span> {userData.address}</p>
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
                <span>{calculatedTicketPrice.toLocaleString('vi-VN')} VND</span>
              </div>
            
              {combos.length > 0 && (
                <div className="flex justify-between">
                  <span>Combos</span>
                  <span>{calculatedCombosTotal.toLocaleString('vi-VN')} VND</span>
                </div>
              )}
              {voucherDiscount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Voucher Discount</span>
                  <span>-{voucherDiscount.toLocaleString('vi-VN')} VND</span>
                </div>
              )}
              <hr className="my-2 border-gray-700" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{grandTotalAfterDiscount.toLocaleString('vi-VN')} VND</span>
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
