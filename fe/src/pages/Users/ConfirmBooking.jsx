import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios for API calls
import { message } from 'antd'; // Import message for notifications

// Redux imports
import { useSelector, useDispatch } from 'react-redux';
import { updateGrandTotal } from '../../redux/bookingSlice';
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
    const [isProcessing, setIsProcessing] = useState(false); // State để ngăn chặn nhấp đúp
    const [error, setError] = useState(''); // State để hiển thị lỗi từ backend

    // Destructure all the data from Redux store
    const {
        movieDetails,
        selectedSeats,
        totalSeatPrice,
        selectedCombos,
        totalComboPrice,
        serviceFee, // Add serviceFee from Redux state
        user, // Get user from Redux
    } = useSelector((state) => state.booking);

    // Set up variables for display, with fallbacks for direct page access or missing data
    const movie = movieDetails || {
        name: 'Movie Title N/A',
        image_url: defaultPoster,
        version: 'N/A',
        running_time: 'N/A',
        // Use selectedDate, selectedTime, fullShowtime from movieDetails
        selectedDate: 'N/A',
        selectedTime: 'N/A',
        fullShowtime: 'N/A',
        cinema_room: 'N/A',
        genres: [],
    };

    const seats = selectedSeats || [];
    const combos = selectedCombos || [];
    const userData = user || {
        fullName: 'N/A', // Use fullName to match backend User model
        email: 'N/A',
        userId: 'N/A', // Use userId to match backend User model (_id from MongoDB)
        phone: 'N/A',
        username: 'N/A',
        gender: 'N/A',
        address: 'N/A',
        id_card: 'N/A',
    };

    // Calculate the grand total on this page, considering potential voucher discounts
    const calculatedTicketPrice = totalSeatPrice || 0;
    const calculatedCombosTotal = totalComboPrice || 0;
    const calculatedServiceFee = serviceFee || 0; // Use serviceFee from Redux

    const grandTotalAfterDiscount = (calculatedTicketPrice + calculatedServiceFee + calculatedCombosTotal - voucherDiscount);

    // Update Redux store's grandTotal whenever the calculation changes
    useEffect(() => {
        dispatch(updateGrandTotal(grandTotalAfterDiscount));
    }, [grandTotalAfterDiscount, dispatch]);

    // Helper function to format the movie time string for display
    const formatFullShowtime = (isoString) => {
        if (!isoString || isoString === 'N/A') return 'N/A';
        const dateObj = new Date(isoString);
        if (isNaN(dateObj.getTime())) return 'N/A';

        const dateOptions = { weekday: 'long', month: 'long', day: 'numeric' };
        const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };

        const formattedDate = dateObj.toLocaleDateString('en-US', dateOptions);
        const formattedTime = dateObj.toLocaleTimeString('en-US', timeOptions);

        return `${formattedTime}, ${formattedDate}`;
    };
    const displayShowtime = formatFullShowtime(movie.fullShowtime); // Use fullShowtime for display
    const displayCinemaRoomName = formatCinemaRoomName(movie.cinema_room); // Formatted cinema room name

    // Simulate fetching user data from a backend or local storage and dispatching to Redux
    useEffect(() => {
        const fetchAndSetUserData = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await axios.get('http://localhost:5000/api/user/profile', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const fetchedUser = response.data.user;

                    dispatch(setUser({
                        fullName: fetchedUser.fullname, // Match Redux state and Booking model
                        email: fetchedUser.email,
                        userId: fetchedUser.id, // Assuming fetchedUser.id is the _id from DB
                        phone: fetchedUser.phone,
                        username: fetchedUser.username,
                        gender: fetchedUser.gender,
                        address: fetchedUser.address,
                        id_card: fetchedUser.id_card,
                    }));
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    message.error('Failed to load user data.');
                }
            }
        };
        fetchAndSetUserData();
    }, [dispatch]);

    const handleProceedToPayment = async () => {
        if (isProcessing) return; // Ngăn chặn nhấp đúp

        // Basic validation before sending to backend
        // if ( !movieDetails._id || !movieDetails.fullShowtime || !movieDetails.cinema_room ||
        //     !seats || seats.length === 0 || totalSeatPrice === undefined ||
        //     !user || !user.userId) { // Ensure user.userId is available
        //     setError('Missing essential booking details. Please go back and re-select.');
        //     message.error('Missing essential booking details. Please go back and re-select.');
        //     return;
        // }

        setIsProcessing(true);
        setError(''); // Reset lỗi

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication token missing. Please log in again.');
                message.error('Authentication token missing. Please log in again.');
                setIsProcessing(false);
                return;
            }

            // Prepare payload for backend
            const bookingPayload = {
                movieDetails: {
                    movieId: movieDetails._id, // Use _id from movieDetails
                    name: movie.name,
                    imageUrl: movie.image_url,
                    version: movie.version,
                    runningTime: movie.running_time,
                    genres: movie.genres,
                    time: movie.fullShowtime, // Send fullShowtime (ISO string)
                    cinema_room: movie.cinema_room,
                },
                selectedSeats: seats,
                totalSeatPrice: calculatedTicketPrice,
                // Only include combos if selectedCombos is not empty
                ...(selectedCombos && selectedCombos.length > 0 && {
                    selectedCombos: selectedCombos.map(c => ({
                        comboId: c._id, // Send combo _id for backend validation
                        name: c.name,
                        quantity: c.quantity,
                        price: c.price,
                        imageUrl: c.imageUrl // Include image URL if your Booking model stores it
                    })),
                    totalComboPrice: calculatedCombosTotal,
                }),
                serviceFee: calculatedServiceFee,
                grandTotal: grandTotalAfterDiscount,
                // user.userId is automatically picked up by backend from JWT
                // No need to send user info in the body
            };

            const response = await axios.post('http://localhost:5000/api/booking/create', bookingPayload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 201) { // 201 Created
                message.success('Booking created successfully! Redirecting to payment...');
                const createdBooking = response.data.booking;
                // Navigate to payment page, passing the _id of the created booking
                navigate('/payment', { state: { bookingId: createdBooking._id, grandTotal: createdBooking.grandTotal } });
            } else {
                setError(response.data.message || 'Failed to create booking.');
                message.error(response.data.message || 'Failed to create booking.');
            }
        } catch (err) {
            console.error('Error during booking creation:', err);
            setError(err.response?.data?.message || 'An unexpected error occurred. Please try again.');
            message.error(err.response?.data?.message || 'An unexpected error occurred. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white py-10 px-4">
            <div className="max-w-5xl mx-auto bg-neutral-900 rounded-xl p-6 shadow-lg relative">
                <h1 className="text-2xl font-bold text-center mb-8">CONFIRM YOUR BOOKING</h1>

                {error && (
                    <div className="bg-red-800 text-white p-3 rounded mb-4 text-center">
                        {error}
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Left: Movie + Seats + Combos */}
                    <div>
                        {/* Movie info */}
                        <div className="flex gap-4">
                            <img src={movie.image_url || defaultPoster} alt={movie.name} className="w-32 h-48 rounded-md object-cover" />
                            <div>
                                <h2 className="text-xl font-semibold">{movie.name}</h2>
                                <p className="text-gray-400">
                                    {movie.version || 'N/A'} • {movie.running_time} min • {movie.genres && movie.genres.length > 0 ? movie.genres.join(', ') : 'N/A'}
                                </p>
                                <p className="text-gray-400">{displayCinemaRoomName}</p>
                                <p className="text-gray-400">{displayShowtime}</p>
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
                                            key={combo._id}
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
                            <p><span className="text-gray-400">Full Name:</span> {userData.fullName || userData.name}</p> {/* Use fullName or name */}
                            <p><span className="text-gray-400">Email:</span> {userData.email}</p>
                            <p><span className="text-gray-400">ID Number:</span> {userData.id_card || userData.userId || userData.id}</p> {/* Prioritize id_card, then userId, then generic id */}
                            <p><span className="text-gray-400">Phone:</span> {userData.phone}</p>
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
                            <div className="flex justify-between">
                                <span>Service Fee</span>
                                <span>{calculatedServiceFee.toLocaleString('vi-VN')} VND</span>
                            </div>
                            {voucherDiscount > 0 && (
                                <div className="flex justify-between text-green-400">
                                    <span>Voucher Discount</span>
                                    <span>-${voucherDiscount.toLocaleString('vi-VN')} VND</span>
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
                        className={`bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold
                                    ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isProcessing}
                    >
                        {isProcessing ? 'Processing...' : 'PROCEED TO PAYMENT'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmBooking;