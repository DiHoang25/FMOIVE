import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios for API calls
import { message } from 'antd'; // Import message for notifications

// Redux imports
import { useSelector, useDispatch } from 'react-redux';
import { updateGrandTotal } from '../../redux/bookingSlice';
import { setUser } from '../../redux/bookingSlice';

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
    const [voucherDiscount, setVoucherDiscount] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    const {
        movieDetails,
        selectedSeats,
        totalSeatPrice,
        selectedCombos,
        totalComboPrice,
        user, // Get user from Redux
    } = useSelector((state) => state.booking);

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
    const userData = user || { // Make sure userData always has a structure, even if default
        name: 'N/A',
        email: 'N/A',
        phone: 'N/A',
        username: 'N/A',
        gender: 'N/A',
        address: 'N/A',
        id_card: 'N/A',
        _id: null, // It's crucial that user._id is available if you want to include it.
    };

    const calculatedTicketPrice = totalSeatPrice || 0;
    const calculatedCombosTotal = totalComboPrice || 0;
    const grandTotalAfterDiscount = (calculatedTicketPrice + calculatedCombosTotal - voucherDiscount);

    useEffect(() => {
        dispatch(updateGrandTotal(grandTotalAfterDiscount));
    }, [grandTotalAfterDiscount, dispatch]);

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

    const [roomName, setRoomName] = useState('Loading...');
    useEffect(() => {
        const fetchRoomName = async () => {
            if (!movie.cinema_room) return;
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`http://localhost:5000/api/theater/rooms/${movie.cinema_room}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Failed to fetch room');
                setRoomName(data.room?.roomName || movie.cinema_room);
            } catch (error) {
                console.error('❌ Error fetching room name:', error.message);
                setRoomName(movie.cinema_room);
            }
        };
        fetchRoomName();
    }, [movie.cinema_room]);

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
                        name: fetchedUser.fullname,
                        email: fetchedUser.email,
                        _id: fetchedUser._id, // Quan trọng: lấy _id của user từ backend
                        phone: fetchedUser.phone,
                        username: fetchedUser.username,
                        gender: fetchedUser.gender,
                        address: fetchedUser.address,
                        id_card: fetchedUser.id_card,
                    }));
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            }
        };
        fetchAndSetUserData();
    }, [dispatch]);

    const handleProceedToPayment = async () => {
        if (isProcessing) return;

        // Ensure movieDetails has _id, not just 'id' for movieDetails.movieId
        // if (!movieDetails || !movieDetails._id || !movieDetails.time || !movieDetails.cinema_room ||
        //     !seats || seats.length === 0 || totalSeatPrice === undefined || totalSeatPrice < 0 ||
        //     !userData || !userData._id || !userData.email) { // Ensure full userData is available
        //     setError('Missing essential booking or user details. Please go back and re-select.');
        //     message.error('Missing essential booking or user details. Please go back and re-select.');
        //     return;
        // }

        setIsProcessing(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication token missing. Please log in again.');
                message.error('Authentication token missing. Please log in again.');
                setIsProcessing(false);
                return;
            }

            const bookingPayload = {
                bookingId: null, // Will be set by backend
                movieDetails: {
                    movieId: movieDetails._id, // Use _id from movieDetails
                    name: movieDetails.name,
                    imageUrl: movieDetails.image_url,
                    version: movieDetails.version,
                    runningTime: movieDetails.running_time,
                    genres: movieDetails.genres,
                    time: movieDetails.time,
                    cinema_room: movieDetails.cinema_room,
                },
                selectedSeats: seats,
                totalSeatPrice: calculatedTicketPrice,
                ...(selectedCombos && selectedCombos.length > 0 && {
                    selectedCombos: selectedCombos.map(c => ({
                        comboId: c._id,
                        name: c.name,
                        quantity: c.quantity,
                        price: c.price,
                        imageUrl: c.image_url
                    })),
                    totalComboPrice: calculatedCombosTotal,
                }),
                grandTotal: grandTotalAfterDiscount,
                // GỬI TOÀN BỘ THÔNG TIN NGƯỜI DÙNG TỪ REDUX
                user: { // Đảm bảo cấu trúc này khớp với schema của bạn ở backend
                    _id: userData._id, // _id của người dùng từ MongoDB
                    name: userData.name,
                    email: userData.email,
                    phone: userData.phone,
                    username: userData.username,
                    gender: userData.gender,
                    address: userData.address,
                    id_card: userData.id_card,
                }
            };

            const response = await axios.post('http://localhost:5000/api/booking/create', bookingPayload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 201) {
                message.success('Booking created successfully! Redirecting to payment...');
                const createdBooking = response.data.booking;
                navigate('/payment', { state: { bookingId: createdBooking.bookingId, grandTotal: createdBooking.grandTotal } });
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
                                <p className="text-gray-400">{roomName}</p>
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
                            <p><span className="text-gray-400">Full Name:</span> {userData.name}</p>
                            <p><span className="text-gray-400">Email:</span> {userData.email}</p>
                            <p><span className="text-gray-400">ID Number:</span> {userData.id_card || 'N/A'}</p>
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