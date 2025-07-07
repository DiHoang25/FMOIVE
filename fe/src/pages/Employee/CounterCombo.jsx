import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Minus, Plus } from 'lucide-react';
import axios from 'axios'; // Import axios for API calls
import { message } from 'antd'; // Import Ant Design message for notifications

// Make sure this path is correct relative to where ComboSelection.jsx is located
import darkknight from '../../assets/darkknight.jpg';

// Define your backend API base URL for combos
const API_COMBO_BASE_URL = 'http://localhost:5000/api/combo';

const ComboSelection = () => {
    const navigate = useNavigate();
    const { state } = useLocation();

    // Destructure data passed from CounterSeatSelectionPage
    const {
        movieDetails = {},
        selectedShowtimeTime = '',
        fullShowtimeDate = '',
        selectedSeats = [],
        ticketPrice = 0,
        serviceFee = 0,
        userInformation = {},
    } = state || {};

    const [combos, setCombos] = useState([]);
    const [loadingCombos, setLoadingCombos] = useState(true);
    const [quantities, setQuantities] = useState({});

    // Fetch Combo Data from API on component mount
    useEffect(() => {
        const fetchCombos = async () => {
            try {
                setLoadingCombos(true);
                const response = await axios.get(API_COMBO_BASE_URL);
                // Filter combos to only show 'active' ones
                const activeCombos = response.data.combos.filter(combo => combo.status === 'active');

                const fetchedCombos = activeCombos.map(combo => ({
                    id: combo._id,
                    name: combo.comboName,
                    price: combo.price,
                    image: combo.image_url || darkknight, // Use image_url from API, fallback to local asset
                    description: combo.description,
                    startDate: combo.startDate,
                    endDate: combo.endDate,
                    items: combo.items,
                    status: combo.status
                }));
                setCombos(fetchedCombos);

                // Initialize quantities based on fetched combos
                const initialQuantities = fetchedCombos.reduce((acc, combo) => {
                    acc[combo.id] = 0;
                    return acc;
                }, {});
                setQuantities(initialQuantities);

            } catch (error) {
                console.error('Error fetching combos:', error);
                message.error('Failed to load combos. Please try again.');
            } finally {
                setLoadingCombos(false);
            }
        };

        fetchCombos();
    }, []); // Empty dependency array means this runs once on mount

    const updateQuantity = (id, delta) => {
        setQuantities((prev) => ({
            ...prev,
            [id]: Math.max(0, prev[id] + delta),
        }));
    };

    const currentCombosTotal = combos.reduce(
        (sum, combo) => sum + combo.price * (quantities[combo.id] || 0), // Use || 0 for safety
        0
    );

    const finalTotal = ticketPrice + serviceFee + currentCombosTotal;

    const handleContinue = () => {
        const selectedCombos = combos.map(combo => ({
            id: combo.id,
            name: combo.name,
            price: combo.price,
            quantity: quantities[combo.id],
            image: combo.image // Use the image path that was set during fetch
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

                {/* Divider */}
                <hr className="border-gray-700 mb-6" />

                {/* Combo List */}
                <h3 className="text-lg font-semibold mb-4">Choose Your Combo</h3>
                {loadingCombos ? (
                    <div className="text-center text-gray-400">Loading combos...</div>
                ) : combos.length === 0 ? (
                    <div className="text-center text-gray-400">No active combos available.</div>
                ) : (
                    <div className="grid sm:grid-cols-2 gap-4 mb-6">
                        {combos.map((combo) => (
                            <div key={combo.id} className="bg-zinc-800 rounded-lg p-4 flex gap-4 items-center shadow">
                                <img
                                    src={combo.image}
                                    alt={combo.name}
                                    className="w-20 h-20 object-cover rounded"
                                    onError={(e) => { // Add onerror for combo list images
                                        console.error(`Failed to load image for combo ${combo.name}:`, combo.image);
                                        e.target.src = 'https://placehold.co/80x80/000000/FFFFFF?text=No+Image'; // Generic placeholder
                                    }}
                                />
                                <div className="flex-1">
                                    <p className="font-medium text-sm">{combo.name}</p>
                                    <p className="text-sm text-gray-300">{combo.price.toLocaleString('vi-VN')} VND</p>
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
                )}

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
