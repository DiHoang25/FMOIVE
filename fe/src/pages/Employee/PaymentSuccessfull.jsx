import { CheckCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useLocation and useNavigate

const PaymentSuccess = () => {
    const { state } = useLocation(); // Get the state passed from the previous page
    const navigate = useNavigate(); // For navigating back or to dashboard

    // Destructure the data from the state, providing default empty objects/arrays
    const {
        movieDetails = {},
        selectedShowtimeTime = '',
        fullShowtimeDate = '',
        selectedSeats = [],
        selectedCombos = [],
        ticketPrice = 0,
        serviceFee = 0,
        combosTotal = 0,
        finalTotal = 0,
        // userInformation // Not displayed on confirm or success as per previous request
    } = state || {}; // Ensure state is not null

    // Prepare movie display object using dynamic data
    const movieDisplay = {
        title: movieDetails.name || 'Unknown Movie',
        poster: movieDetails.image_url || 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Movie+Poster', // Fallback image
        time: fullShowtimeDate,
        hour: selectedShowtimeTime,
        screen: movieDetails.cinema_room || 'Screen N/A',
    };

    // Handler to go back to the employee dashboard or a relevant starting point
    const handleGoToDashboard = () => {
        // Replace with your actual employee dashboard path
        navigate('/employee/dashboard');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white py-10 px-4 flex items-center justify-center">
            <div className="max-w-2xl w-full mx-auto bg-neutral-900 rounded-3xl p-8 shadow-2xl border border-green-700 relative overflow-hidden">

                {/* Background gradient overlay for success feel */}
                <div className="absolute inset-0 bg-green-900 opacity-10 blur-xl z-0 pointer-events-none"></div>

                <div className="relative z-10 text-center">
                    {/* Success Icon */}
                    <div className="flex justify-center mb-6">
                        <CheckCircle className="w-28 h-28 text-green-500 animate-scale-in" />
                    </div>

                    <h1 className="text-4xl font-extrabold text-green-400 mb-3 drop-shadow-lg">Payment Successful!</h1>
                    <p className="text-gray-300 text-lg mb-8">Your booking has been confirmed. Enjoy the movie!</p>

                    {/* Ticket Info Section */}
                    <div className="bg-zinc-800 rounded-2xl p-6 text-left space-y-5 text-sm border border-zinc-700">
                        {/* Movie Details */}
                        <div className="flex items-start gap-5 border-b border-zinc-700 pb-5">
                            <img src={movieDisplay.poster} alt={movieDisplay.title} className="w-24 h-36 object-cover rounded-lg shadow-md" />
                            <div>
                                <p className="text-xl font-bold mb-1 text-red-400">{movieDisplay.title}</p>
                                <p className="text-gray-400 text-sm"><span className="font-semibold">Date:</span> {movieDisplay.time}</p>
                                <p className="text-gray-400 text-sm"><span className="font-semibold">Time:</span> {movieDisplay.hour}</p>
                                <p className="text-gray-400 text-sm"><span className="font-semibold">Screen:</span> {movieDisplay.screen}</p>
                            </div>
                        </div>

                        {/* Seats */}
                        <div className="border-b border-zinc-700 pb-5">
                            <p className="font-bold text-red-500 mb-2 text-base">🎫 Selected Seats:</p>
                            <div className="flex flex-wrap gap-2">
                                {selectedSeats.length > 0 ? (
                                    selectedSeats.map(seat => (
                                        <span
                                            key={seat}
                                            className="bg-red-700 text-white px-4 py-1.5 rounded-full text-xs font-medium shadow-sm hover:scale-105 transition-transform"
                                        >
                                            {seat}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-gray-400">No seats selected.</span>
                                )}
                            </div>
                        </div>

                        {/* Combos */}
                        {selectedCombos.length > 0 && (
                            <div className="border-b border-zinc-700 pb-5">
                                <p className="font-bold text-red-500 mb-2 text-base">🍿 Combos & Snacks:</p>
                                <ul className="space-y-1 text-gray-300 text-sm">
                                    {selectedCombos.map(combo => (
                                        <li key={combo.id} className="flex justify-between items-center bg-zinc-700 px-4 py-2 rounded-lg">
                                            <span>{combo.name} <span className="font-semibold">x{combo.quantity}</span></span>
                                            <span className="font-bold">{(combo.price * combo.quantity).toLocaleString('vi-VN')} VND</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Total Summary */}
                        <div>
                            <p className="font-bold text-red-500 mb-2 text-base">💰 Payment Summary:</p>
                            <div className="bg-zinc-700 rounded-lg p-4 space-y-2 text-md">
                                <div className="flex justify-between">
                                    <span>Tickets ({selectedSeats.length}x)</span>
                                    <span>{ticketPrice.toLocaleString('vi-VN')} VND</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Service Fee</span>
                                    <span>{serviceFee.toLocaleString('vi-VN')} VND</span>
                                </div>
                                {selectedCombos.length > 0 && (
                                    <div className="flex justify-between">
                                        <span>Combos</span>
                                        <span>{combosTotal.toLocaleString('vi-VN')} VND</span>
                                    </div>
                                )}  
                                <hr className="border-gray-600 my-2" />
                                <div className="flex justify-between font-extrabold text-xl text-green-300">
                                    <span>Grand Total</span>
                                    <span>{finalTotal.toLocaleString('vi-VN')} VND</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                        <button
                            onClick={handleGoToDashboard}
                            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-semibold text-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
                        >
                            Go to Dashboard
                        </button>
                        {/* You might add a "Print Ticket" button here if desired */}
                        {/* <button
                            onClick={() => window.print()}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold text-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
                        >
                            Print Ticket
                        </button> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;