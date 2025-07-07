import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const CounterConfirmBooking = () => {
    const navigate = useNavigate();
    const { state } = useLocation();

    const [voucherCode, setVoucherCode] = useState('');

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
        userInformation = {},
    } = state || {};

    const movieDisplay = {
        title: movieDetails.name || 'Unknown Movie',
        poster: movieDetails.image_url || 'path/to/default/poster.png',
        time: fullShowtimeDate,
        hour: selectedShowtimeTime,
        screen: movieDetails.cinema_room || 'Screen N/A',
    };

    const seatsDisplay = selectedSeats;
    const combosDisplay = selectedCombos;

    const currentTicketPrice = ticketPrice;
    const currentServiceFee = serviceFee;
    const currentCombosTotal = combosTotal;
    const currentTotal = finalTotal;

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
                movieDetails,
                selectedShowtimeTime,
                fullShowtimeDate,
                selectedSeats,
                selectedCombos,
                ticketPrice: currentTicketPrice, // Pass the total ticket price
                serviceFee: currentServiceFee,
                combosTotal: currentCombosTotal,
                finalTotal: currentTotal, // Pass the grand total
                userInformation, // Pass user information if available
                // Any other relevant data you might want to pass
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
                            <img src={movieDisplay.poster} alt="Movie Poster" className="w-28 h-40 rounded-lg object-cover" />
                            <div>
                                <h2 className="text-xl font-bold">{movieDisplay.title}</h2>
                                <p className="text-gray-400 mt-1 text-base">{movieDisplay.screen}</p>
                                <p className="text-gray-400">{movieDisplay.time} • {movieDisplay.hour}</p>
                            </div>
                        </div>

                        {/* Seats */}
                        <div>
                            <h3 className="text-lg font-semibold text-red-500 mb-2">🎫 Seat Selection</h3>
                            <div className="flex flex-wrap gap-2">
                                {seatsDisplay.length > 0 ? (
                                    seatsDisplay.map(seat => (
                                        <span
                                            key={seat}
                                            className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium"
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
                        {combosDisplay.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-red-500 mb-2">🍿 Popcorn & Drinks</h3>
                                <div className="space-y-2 text-base">
                                    {combosDisplay.map(combo => (
                                        <div key={combo.id} className="flex justify-between bg-zinc-800 px-4 py-2 rounded">
                                            <span>{combo.name} × {combo.quantity}</span>
                                            <span>${(combo.price * combo.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                        {/* Voucher Input */}
                        <h3 className="text-red-700 font-semibold ">Voucher Code</h3>
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
                            >
                                Apply
                            </button>
                        </div>
                        {/* Payment Summary */}
                        <div>
                            <h3 className="text-lg font-semibold text-red-500 mb-2">💳 Payment Summary</h3>
                            <div className="bg-zinc-800 rounded-lg p-4 space-y-2 text-base">
                                <div className="flex justify-between">
                                    <span>Standard Ticket × {seatsDisplay.length}</span>
                                    <span>${currentTicketPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Service Fee</span>
                                    <span>${currentServiceFee.toFixed(2)}</span>
                                </div>
                                {combosDisplay.length > 0 && (
                                    <div className="flex justify-between">
                                        <span>Combos</span>
                                        <span>{currentCombosTotal.toFixed(2)}</span>
                                    </div>
                                )}
                                <hr className="border-gray-700" />
                                <div className="flex justify-between font-bold text-xl">
                                    <span>Total</span>
                                    <span>${currentTotal.toFixed(2)}</span>
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
                        onClick={handleProceedToPayment} // Changed to call the new handler
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