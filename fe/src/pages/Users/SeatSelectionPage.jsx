import { useLocation, useNavigate } from 'react-router-dom';
import SelectSeatGrid from '../../components/SelectSeatGrid'; // Ensure this path is correct

function SeatSelectionPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Destructure movie details from location.state
  // Assuming 'time' and 'cinema_room' are already part of the movie object passed from ShowtimePage
  const {
    name,
    image_url,
    version,
    running_time,
    time, // e.g., "Today, 14:00"
    cinema_room, // e.g., "Screen 5"
  } = state || {};

  // This function will be called by SelectSeatGrid when its "Continue" button is clicked
  const handleSeatSelectionContinue = (selectedSeats, totalSeatPrice) => {
    navigate('/combo-selection', {
      state: {
        movie: { // Pass all relevant movie details
          name,
          image_url,
          version,
          running_time,
          time,
          cinema_room,
        },
        selectedSeats: selectedSeats,      // Pass selected seats array
        totalSeatPrice: totalSeatPrice,    // Pass total price of seats
      },
    });
  };

  const handleBack = () => {
    navigate(-1); // Go back to the previous page (ShowtimePage)
  };

  return (
    <div className="bg-black min-h-screen text-white px-6 py-10">
      <div className="bg-[#1a1a1a] max-w-xl mx-auto p-6 rounded">
        {/* Back Button - Moved to be directly above movie info */}
        <div className="mb-6"> {/* Added margin-bottom for spacing */}
          <button
            onClick={handleBack}
            className="text-sm text-white bg-gray-700 hover:bg-gray-600 px-4 py-1 rounded"
          >
            ← Back
          </button>
        </div>

        <h1 className="text-2xl font-bold text-center mb-8">SELECT YOUR SEATS</h1>


        {/* Movie Info - Poster size increased and added details */}
        <div className="flex gap-4 mb-6 items-center"> {/* Added items-center for vertical alignment */}
          <img
            src={image_url}
            alt={name}
            className="w-[120px] h-[180px] object-cover rounded" /* Increased size: w-[120px] h-[180px] */
          />
          <div>
            <h2 className="text-xl font-semibold">{name}</h2>
            <p className="text-gray-400 text-sm">{version} • {running_time} min</p>
            {/* Added time and cinema_room below movie details */}
            <p className="text-sm mt-2">
              {time} <span className="text-gray-500">• {cinema_room}</span>
            </p>
          </div>
        </div>

        {/* Seat selection grid component */}
        {/* This component will handle its own "SELECT YOUR SEATS" heading, number of seats, and grid */}
        <SelectSeatGrid onContinue={handleSeatSelectionContinue} />
      </div>
    </div>
  );
}

export default SeatSelectionPage;