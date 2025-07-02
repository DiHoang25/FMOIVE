import { useLocation, useNavigate } from 'react-router-dom';
import SelectSeatGrid from '../../components/SelectSeatGrid';

// Redux imports
import { useSelector, useDispatch } from 'react-redux';
// User's specified Redux import path
import { setSelectedSeats } from '../../redux/bookingSlice'; 

// Helper function to format minutes into "Xh Ym"
const formatMinutesToHoursMinutes = (minutes) => {
  if (typeof minutes !== 'number' || minutes < 0) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

function SeatSelectionPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get movie details from Redux store
  const movieDetails = useSelector((state) => state.booking.movieDetails);
  
  // Use a fallback if movieDetails is not yet in Redux (e.g., direct navigation)
  // Ensure cinema_room is in fallback for display consistency
  const movie = movieDetails || {
    name: 'Movie Title N/A',
    image_url: 'https://placehold.co/120x180/000000/FFFFFF?text=No+Poster', // Placeholder
    version: 'N/A', 
    running_time: 'N/A',
    time: 'N/A',
    cinema_room: 'N/A', // Crucial for display, ensure it's here
    rating: 'N/A', 
    genres: [],
  };

  // This function will be called by SelectSeatGrid when its "Continue" button is clicked
  const handleSeatSelectionContinue = (selectedSeats, totalSeatPrice) => {
    // Dispatch selected seats and their total price to Redux
    dispatch(setSelectedSeats({
      seats: selectedSeats,
      totalPrice: totalSeatPrice,
    }));

    // Navigate to combo selection page without passing state via navigate
    navigate('/combo-selection');
  };

  const handleBack = () => {
    navigate(-1); // Go back to the previous page (ShowtimePage)
  };

  const formattedRunningTime = formatMinutesToHoursMinutes(movie.running_time);

  return (
    <div className="bg-black min-h-screen text-white px-6 py-10">
      <div className="bg-[#1a1a1a] max-w-xl mx-auto p-6 rounded">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="text-sm text-white bg-gray-700 hover:bg-gray-600 px-4 py-1 rounded"
          >
            ← Back
          </button>
        </div>

        <h1 className="text-2xl font-bold text-center mb-8">SELECT YOUR SEATS</h1>

        {/* Movie Info - Poster size increased and added details */}
        <div className="flex gap-4 mb-6 items-center">
          <img
            src={movie.image_url}
            alt={movie.name}
            className="w-[120px] h-[180px] object-cover rounded"
          />
          <div className="flex-1 space-y-1"> 
            {/* Movie Title */}
            <h2 className="text-2xl font-bold text-white">{movie.name}</h2> 
            
            {/* Combined Version, Running Time, and Genres (or N/A) as in Figma */}
            <p className="text-gray-300 text-sm"> 
                {movie.version} • {formattedRunningTime} • {movie.genres && movie.genres.length > 0 ? movie.genres.join(', ') : 'N/A'}
            </p>
            
            {/* Showtime (Time) and Cinema Room */}
            <p className="text-gray-300 text-sm">
              {movie.time} • {movie.cinema_room} 
            </p>
          </div>
        </div>

        {/* Seat selection grid component */}
        <SelectSeatGrid onContinue={handleSeatSelectionContinue} />
      </div>
    </div>
  );
}

export default SeatSelectionPage;
