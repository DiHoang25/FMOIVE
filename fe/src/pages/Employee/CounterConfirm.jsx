import { useNavigate } from 'react-router-dom';
import batman from '../../assets/batman.png'; 

const CounterConfirmBooking = () => {
  const navigate = useNavigate();

  const movie = {
    title: 'The Dark Knight',
    poster: batman,
    time: 'Today, May 26',
    hour: '7:30 PM',
    screen: 'Screen 5',
  };

  const seats = ['A2', 'A3', 'A5'];
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    id: 'A12345678',
    phone: '+1 (555) 123-4567',
  };

  const combos = [
    { id: 1, name: 'Combo A', quantity: 1, price: 5 },
    { id: 2, name: 'Combo B', quantity: 2, price: 9 },
  ];

  const ticketPrice = 15 * seats.length;
  const serviceFee = 2.5;
  const combosTotal = combos.reduce((acc, combo) => acc + combo.price * combo.quantity, 0);
  const total = ticketPrice + serviceFee + combosTotal;

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4">
      <div className="max-w-5xl mx-auto bg-neutral-900 rounded-2xl p-8 shadow-lg">

        <h1 className="text-3xl font-bold text-center mb-10">🎟️ Confirm Your Booking</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">

            {/* Movie Info */}
            <div className="flex gap-4 items-center">
              <img src={movie.poster} alt="Poster" className="w-28 h-40 rounded-lg object-cover" />
              <div>
                <h2 className="text-xl font-bold">{movie.title}</h2>
                <p className="text-gray-400 mt-1 text-base">{movie.screen}</p>
                <p className="text-gray-400">{movie.time} • {movie.hour}</p>
              </div>
            </div>

            {/* Seats */}
            <div>
              <h3 className="text-lg font-semibold text-red-500 mb-2">🎫 Seat Selection</h3>
              <div className="flex flex-wrap gap-2">
                {seats.map(seat => (
                  <span
                    key={seat}
                    className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {seat}
                  </span>
                ))}
              </div>
            </div>

            {/* Combos */}
            {combos.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-red-500 mb-2">🍿 Popcorn & Drinks</h3>
                <div className="space-y-2 text-base">
                  {combos.map(combo => (
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
            {/* User Info */}
            <div>
              <h3 className="text-lg font-semibold text-red-500 mb-2">🧍 Your Information</h3>
              <div className="space-y-1 text-base">
                <p><span className="text-gray-400">Full Name:</span> {user.name}</p>
                <p><span className="text-gray-400">Email:</span> {user.email}</p>
                <p><span className="text-gray-400">ID Number:</span> {user.id}</p>
                <p><span className="text-gray-400">Phone:</span> {user.phone}</p>
              </div>
            </div>

            {/* Payment Summary */}
            <div>
              <h3 className="text-lg font-semibold text-red-500 mb-2">💳 Payment Summary</h3>
              <div className="bg-zinc-800 rounded-lg p-4 space-y-2 text-base">
                <div className="flex justify-between">
                  <span>Standard Ticket × {seats.length}</span>
                  <span>${ticketPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Fee</span>
                  <span>${serviceFee.toFixed(2)}</span>
                </div>
                {combos.length > 0 && (
                  <div className="flex justify-between">
                    <span>Combos</span>
                    <span>${combosTotal.toFixed(2)}</span>
                  </div>
                )}
                <hr className="border-gray-700" />
                <div className="flex justify-between font-bold text-xl">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
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
            onClick={() => navigate('/employee/counter-payment')}
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
