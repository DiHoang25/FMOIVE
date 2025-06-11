import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // If using React Router
import { Minus, Plus } from 'lucide-react';
import darkknight from '../../assets/darkknight.jpg'; // Replace with actual image path
import big1e from '../../assets/1bigextra.jpg'; // Replace with actual image path
import big2e from '../../assets/2bigextra.webp'; // Replace with actual image path
import big1 from '../../assets/Combo1big.jpg'; // Replace with actual image path
import big2 from '../../assets/Combo2big.png'; 
const ComboSelection = () => {
  const navigate = useNavigate();

  // Mock movie data (replace with actual props/context)
  const movie = {
    title: 'The Dark Knight',
    poster: darkknight, // Replace with actual image path
    rating: 'PG-13',
    duration: '2h 32m',
    genres: 'Action, Crime, Drama',
    time: 'Today, 7:30 PM',
    screen: 'Screen 5',
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

  const totalPrice = combos.reduce((sum, combo) => sum + combo.price * quantities[combo.id], 0);

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
            src={movie.poster}
            alt="Movie Poster"
            className="w-32 h-48 object-cover rounded-md"
          />
          <div className="text-sm flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-semibold">{movie.title}</h2>
              <p className="text-gray-400 text-xl">{movie.rating} • {movie.duration}</p>
              <p className="text-gray-400">{movie.genres}</p>
            </div>
            <div className="mt-2">
              <p className="text-gray-200 text-2xl">{movie.time}</p>
              <p className="text-gray-200 text-2xl">{movie.screen}</p>
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
            PRICE: {totalPrice} $
          </div>
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold"
            disabled={totalPrice === 0}
            onClick={() => navigate('/confirm-booking')}
          >
            CONTINUE
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComboSelection;
