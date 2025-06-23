import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Minus, Plus } from 'lucide-react';

// Make sure these paths are correct relative to where ComboSelection.jsx is located
import darkknight from '../../assets/darkknight.jpg';
import big1e from '../../assets/1bigextra.jpg';
import big2e from '../../assets/2bigextra.webp';
import big1 from '../../assets/Combo1big.jpg';
import big2 from '../../assets/Combo2big.png';

const ComboSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Destructure movie details, selectedSeats, and totalSeatPrice from location.state
  const { movie: movieDetails, selectedSeats, totalSeatPrice } = location.state || {};

  // Fallback for movie details if page is accessed directly (for development/testing)
  const movie = movieDetails || {
    name: 'Movie Title N/A',
    image_url: darkknight,
    version: 'N/A',
    running_time: 'N/A',
    time: 'N/A',
    cinema_room: 'N/A',
  };

  const combos = [
    { id: 1, name: 'Combo 2 big', price: 20, image: big1 },
    { id: 2, name: 'Combo 2 big Extra', price: 30, image: big2e },
    { id: 3, name: 'Combo 1 big', price: 15, image: big2 },
    { id: 4, name: 'Combo 1 big Extra', price: 25, image: big1e },
  ];

  const [quantities, setQuantities] = useState(
    combos.reduce((acc, combo) => {
      acc[combo.id] = 0;
      return acc;
    }, {})
  );

  const updateQuantity = (id, delta) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, prev[id] + delta),
    }));
  };

  const totalComboPrice = combos.reduce((sum, combo) => sum + combo.price * quantities[combo.id], 0);

  // Optional: Redirect if essential data is missing
  useEffect(() => {
    if (!movieDetails || !selectedSeats || totalSeatPrice === undefined) {
      console.warn("Missing essential booking details. Redirecting or using default.");
      // navigate('/'); // Uncomment to redirect to home or an error page
    }
  }, [movieDetails, selectedSeats, totalSeatPrice, navigate]);


  return (
    <div className="min-h-screen bg-black text-white py-10 px-4">
      <div className="max-w-4xl mx-auto bg-neutral-900 rounded-xl p-6 shadow-lg relative">

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 text-white bg-gray-700 hover:bg-gray-600 px-4 py-1 rounded"
        >
          ← Back
        </button>

        {/* Movie Info */}
        <h1 className="text-2xl font-bold text-center mb-6">COMBO POPCORN & DRINKS</h1>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <img
            src={movie.image_url}
            alt={movie.name}
            className="w-32 h-48 object-cover rounded-md"
          />
          <div className="text-sm flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-semibold">{movie.name}</h2>
              <p className="text-gray-400 text-xl">{movie.version} • {movie.running_time} min</p>
            </div>
            <div className="mt-2">
              <p className="text-gray-200 text-2xl">Today, {movie.time}</p>
              <p className="text-gray-200 text-2xl">{movie.cinema_room}</p>
              <p className="text-gray-200 text-2xl">Seats: {selectedSeats ? selectedSeats.join(', ') : 'N/A'}</p> {/* Display selected seats */}
              <p className="text-gray-200 text-2xl">Seat Price: {totalSeatPrice !== undefined ? totalSeatPrice : 'N/A'}$</p> {/* Display seat price */}
            </div>
          </div>
        </div>

        <hr className="border-gray-600 mb-6" />

        <h3 className="text-white font-semibold mb-4">The List of popcorn and drinks</h3>
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {combos.map((combo) => (
            <div key={combo.id} className="bg-zinc-800 rounded-md p-4 flex items-center gap-4">
              <img
                src={combo.image}
                alt={combo.name}
                className="w-24 h-24 object-cover rounded"
              />
              <div className="flex-1">
                <p className="font-semibold">{combo.name}</p>
                <p className="text-sm">{combo.price}$</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(combo.id, -1)}
                  className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center"
                >
                  <Minus className="w-4 h-4 text-white" />
                </button>
                <span className="w-6 text-center">{quantities[combo.id]}</span>
                <button
                  onClick={() => updateQuantity(combo.id, 1)}
                  className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-700"
                >
                  <Plus className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Total and Continue */}
        <div className="flex justify-between items-center mt-6">
          <div className="bg-gray-700 text-white px-6 py-2 rounded text-sm">
            COMBO PRICE: {totalComboPrice} $
          </div>
            <button
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold"
            onClick={() => navigate('/confirm-booking', {
                state: {
                    movie: movieDetails,        // The movie details object
                    selectedSeats: selectedSeats, // The array of selected seat IDs (e.g., ['A1', 'B2'])
                    totalSeatPrice: totalSeatPrice, // The calculated total price for seats
                    selectedCombos: combos.filter(combo => quantities[combo.id] > 0).map(combo => ({
                        ...combo,
                        quantity: quantities[combo.id]
                    })),
                    totalComboPrice: totalComboPrice, // The calculated total price for combos
                    // You might also pass the user info from a context or a login flow later
                }
            })}
          >
            CONTINUE
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComboSelection;