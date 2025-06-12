import { useLocation, useNavigate } from 'react-router-dom';

const BookingConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { movie, selectedSeats, totalPrice } = location.state;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8">BOOKING CONFIRMATION</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">{movie.title}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Showtime Information</h3>
            <p>{movie.showtime}</p>
            <p>{movie.screen}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Seats</h3>
            <p>{selectedSeats.join(', ')}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Price</h3>
            <p>${totalPrice}</p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold"
        >
          BACK TO HOME
        </button>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;