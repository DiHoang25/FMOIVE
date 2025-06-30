import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Minus, Plus } from 'lucide-react';
import big1e from '../../assets/1bigextra.jpg';
import big2e from '../../assets/2bigextra.webp';
import big1 from '../../assets/Combo1big.jpg';
import big2 from '../../assets/Combo2big.png';

const ComboSelection = () => {
    const navigate = useNavigate();
    const { state } = useLocation();

    // Destructure data passed from CounterSeatSelectionPage
    const {
        movieDetails = {}, // Full movie object (still passed, but not displayed here)
        selectedShowtimeTime = '',
        fullShowtimeDate = '',
        selectedSeats = [],
        ticketPrice = 0,
        serviceFee = 0,
        userInformation = {},
    } = state || {};

    const combos = [
        { id: 1, name: 'Combo 2 big', price: 20, image: big1 },
        { id: 2, name: 'Combo 2 big Extra', price: 30, image: big2e },
        { id: 3, name: 'Combo 1 big', price: 15, image: big2 },
        { id: 4, name: 'Combo 1 big Extra', price: 25, image: big1e },
    ];

    const [quantities, setQuantities] = useState(
        combos.reduce((acc, combo) => ({ ...acc, [combo.id]: 0 }), {})
    );

    const updateQuantity = (id, delta) => {
        setQuantities((prev) => ({
            ...prev,
            [id]: Math.max(0, prev[id] + delta),
        }));
    };

    const currentCombosTotal = combos.reduce(
        (sum, combo) => sum + combo.price * quantities[combo.id],
        0
    );

    const finalTotal = ticketPrice + serviceFee + currentCombosTotal;

    const handleContinue = () => {
        const selectedCombos = combos.map(combo => ({
            id: combo.id,
            name: combo.name,
            price: combo.price,
            quantity: quantities[combo.id],
            image: combo.image
        })).filter(combo => combo.quantity > 0);

        navigate('/employee/counter-confirm', {
            state: {
                movieDetails, // Still pass the full movie details object
                selectedShowtimeTime,
                fullShowtimeDate,
                selectedSeats,
                selectedCombos,
                ticketPrice,
                serviceFee,
                combosTotal: currentCombosTotal,
                finalTotal,
                userInformation, // Still pass user information
            },
        });
    };

    return (
        <div className="min-h-screen bg-black text-white py-8 px-4">
            <div className="max-w-4xl mx-auto bg-neutral-900 rounded-2xl p-6 shadow-md relative">

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 text-white bg-gray-700 hover:bg-gray-600 px-4 py-1 rounded"
                >
                    ← Back
                </button>

                {/* Header */}
                <h1 className="text-2xl font-bold text-center mb-6">COMBO POPCORN & DRINKS</h1>

                {/* --- Movie Info section removed from here --- */}

                {/* Divider */}
                <hr className="border-gray-700 mb-6" />

                {/* Combo List */}
                <h3 className="text-lg font-semibold mb-4">Choose Your Combo</h3>
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    {combos.map((combo) => (
                        <div key={combo.id} className="bg-zinc-800 rounded-lg p-4 flex gap-4 items-center shadow">
                            <img src={combo.image} alt={combo.name} className="w-20 h-20 object-cover rounded" />
                            <div className="flex-1">
                                <p className="font-medium text-sm">{combo.name}</p>
                                <p className="text-sm text-gray-300">{combo.price}$</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => updateQuantity(combo.id, -1)}
                                    className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center"
                                >
                                    <Minus className="w-4 h-4 text-white" />
                                </button>
                                <span className="w-6 text-center">{quantities[combo.id]}</span>
                                <button
                                    onClick={() => updateQuantity(combo.id, 1)}
                                    className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center"
                                >
                                    <Plus className="w-4 h-4 text-white" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Price & Continue */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                    <div className="bg-gray-700 px-6 py-2 rounded text-sm font-medium">
                        TOTAL: {currentCombosTotal.toFixed(2)} $
                    </div>
                    <button
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold"
                        onClick={handleContinue}
                    >
                        CONTINUE
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ComboSelection;