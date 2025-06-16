
import { CheckCircle } from 'lucide-react'; // ✅ Add this icon
import batman from '../../assets/batman.png'; // Replace with actual poster

const PaymentSuccess = () => {
  

  const movie = {
    title: 'The Dark Knight',
    poster: batman,
    time: 'Today, May 26',
    hour: '7:30 PM',
    screen: 'Screen 5',
  };

  const seats = ['A2', 'A3', 'A5'];
  const combos = [
    { id: 1, name: 'Combo A', quantity: 1 },
    { id: 2, name: 'Combo B', quantity: 2 },
  ];

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4">
      <div className="max-w-2xl mx-auto bg-neutral-900 rounded-2xl p-8 shadow-lg text-center">

        {/* ✅ Success Icon */}
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-24 h-24 text-green-500" />
        </div>

        <h1 className="text-3xl font-bold text-green-500 mb-4">Payment Successful!</h1>
        <p className="text-gray-300 text-base mb-6">Your booking has been confirmed. Thank you for choosing us!</p>

        {/* Ticket Info */}
        <div className="bg-zinc-800 rounded-xl p-6 text-left space-y-4 text-sm">
          <div className="flex gap-4">
            <img src={movie.poster} alt="Poster" className="w-20 h-28 object-cover rounded" />
            <div>
              <p className="text-lg font-semibold">{movie.title}</p>
              <p className="text-gray-400">{movie.time} • {movie.hour}</p>
              <p className="text-gray-400">{movie.screen}</p>
            </div>
          </div>

          <div>
            <p className="font-semibold text-red-500 mt-2">Seats:</p>
            <div className="flex gap-2 mt-1">
              {seats.map(seat => (
                <span
                  key={seat}
                  className="bg-red-600 text-white px-3 py-1 rounded-full text-xs"
                >
                  {seat}
                </span>
              ))}
            </div>
          </div>

          {combos.length > 0 && (
            <div>
              <p className="font-semibold text-red-500 mt-2">Combos:</p>
              <ul className="list-disc list-inside text-gray-300 text-sm mt-1">
                {combos.map(combo => (
                  <li key={combo.id}>
                    {combo.name} x{combo.quantity}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        
      </div>
    </div>
  );
};

export default PaymentSuccess;
