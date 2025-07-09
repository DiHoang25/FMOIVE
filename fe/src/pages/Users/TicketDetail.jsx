// fe_team_3/src/pages/TicketDetail.jsx

import React, { useEffect, useState } from 'react'; // Import useState
import { useNavigate, useLocation } from 'react-router-dom';

// Redux imports
import { useSelector, useDispatch } from 'react-redux';
import { resetBooking } from '../../redux/bookingSlice'; // Keeping your specified path

// Use a default poster if movie.image_url is not available
import defaultPoster from '../../assets/batman.png'; // Make sure this path is correct

const TicketDetail = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation(); // Lấy location để đọc query params

    const [paymentStatusMessage, setPaymentStatusMessage] = useState('');
    const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);

    // Destructure data directly from Redux store using useSelector
    const {
        movieDetails,
        selectedSeats,
        totalSeatPrice,
        selectedCombos,
        totalComboPrice,
        serviceFee,
        grandTotal,
        user,
        bookingId, // The booking ID from Redux state
    } = useSelector((state) => state.booking);


    // Define fallbacks for display if data is missing (e.g., direct page access or incomplete flow)
    const movie = movieDetails || {
        name: 'Movie Title N/A',
        image_url: defaultPoster, // Default poster if none is provided
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
    };

    const actualTotalSeatPrice = totalSeatPrice || 0;
    const actualTotalComboPrice = totalComboPrice || 0;
    const actualServiceFee = serviceFee || 0;
    const actualGrandTotal = grandTotal || 0;

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

    // Xử lý query parameters từ VNPAY redirect
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const status = queryParams.get('status');
        const message = queryParams.get('message');
        const vnpayBookingId = queryParams.get('bookingId'); // Lấy bookingId từ URL
        
        // Bạn có thể dùng bookingId từ Redux hoặc từ URL, tùy theo nguồn đáng tin cậy hơn
        // Hiện tại, Redux `bookingId` sẽ là ID chính của booking đã tạo.
        // `vnpayBookingId` từ URL chỉ là để kiểm tra và xác nhận.

        if (status) {
            setPaymentStatusMessage(decodeURIComponent(message || ''));
            setIsPaymentSuccess(status === 'success');

            // Optionally, you might want to clear specific query params from the URL
            // This prevents them from being re-processed if the user navigates back and forth
            // navigate(location.pathname, { replace: true });
        }
    }, [location.search]); // Chạy lại khi query params thay đổi

    // Optional: Reset booking state when user confirms or leaves this page
    useEffect(() => {
        return () => {
            // Khi component unmount, reset Redux booking state
            // dispatch(resetBooking()); // Uncomment nếu muốn xóa dữ liệu booking sau khi xem chi tiết
        };
    }, [dispatch]);

    return (
        <div className="min-h-screen bg-black text-white py-10 px-4 flex justify-center">
            <div className="bg-neutral-900 rounded-xl max-w-3xl w-full p-6 shadow-lg space-y-6">
                {/* Title */}
                <h1 className="text-center text-white text-xl font-bold mb-4 tracking-wide border-b border-red-500 pb-2">
                    BOOKING CONFIRMATION
                </h1>

                {/* Payment Status Message (NEW) */}
                {paymentStatusMessage && (
                    <div className={`p-3 rounded text-center font-semibold ${isPaymentSuccess ? 'bg-green-600' : 'bg-red-600'}`}>
                        {paymentStatusMessage}
                    </div>
                )}

                {/* Movie Info */}
                <div className="flex items-center gap-4">
                    <img src={movie.image_url} alt={movie.name} className="w-28 h-40 rounded-md object-cover" />
                    <div className="space-y-1">
                        <h2 className="text-lg font-semibold">{movie.name}</h2>
                        <p className="text-gray-400">
                            {movie.version || 'N/A'} • {movie.running_time} min • {movie.genres && movie.genres.length > 0 ? movie.genres.join(', ') : 'N/A'}
                        </p>
                        <p className="text-gray-400">{movie.cinema_room || 'N/A'}</p>
                        <p className="text-xl">{formattedTime.display}</p>
                    </div>
                </div>

                {/* Booking ID */}
                <div className="bg-zinc-800 rounded px-4 py-2 text-sm tracking-wide">
                    Booking ID: <span className="text-white font-semibold">{bookingId || 'N/A'}</span>
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
                {combos.length > 0 && (
                    <div>
                        <h3 className="text-red-500 font-semibold mb-2">Popcorn & Drinks</h3>
                        <div className="bg-zinc-800 p-4 rounded text-sm space-y-2">
                            {combos.map((combo) => (
                                <div className="flex justify-between" key={combo.id || combo.name}>
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
                            <span>Tickets ({seats.length} {seats.length === 1 ? 'ticket' : 'tickets'})</span>
                            <span>${actualTotalSeatPrice.toFixed(2)}</span>
                        </div>
                        {combos.length > 0 && (
                            <div className="flex justify-between">
                                <span>Combos</span>
                                <span>${actualTotalComboPrice.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span>Service Fee</span>
                            <span>${actualServiceFee.toFixed(2)}</span>
                        </div>
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
                        <p><span className="text-gray-400">Full Name:</span> {userData.name}</p>
                        <p><span className="text-gray-400">Email:</span> {userData.email}</p>
                        <p><span className="text-gray-400">ID Number:</span> {userData.id}</p>
                        <p><span className="text-gray-400">Phone:</span> {userData.phone}</p>
                    </div>
                </div>

                {/* Final Buttons */}
                <div className="flex justify-center mt-6">
                    <button
                        onClick={() => navigate('/viewbookedticket')} // Navigate to booking history page
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