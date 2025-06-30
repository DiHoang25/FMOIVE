import { useState, useEffect } from "react"; // Import useEffect
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation

const SeatSelection = () => {
  const navigate = useNavigate();
  const { state } = useLocation(); // Get state from previous navigation

  // Destructure data passed from CounterShowtimesPage
  const {
    movieDetails = {}, // Full movie object
    selectedShowtimeTime = '',
    fullShowtimeDate = '',
    // movieTitle, // No longer directly needed as we use movieDetails
    // movieImage, // No longer directly needed as we use movieDetails
    // selectedMovieId, // No longer directly needed
    // selectedShowtimeDetails // No longer directly needed
  } = state || {}; // Provide default empty object if state is null

  const seatRows = "ABCDEFGH".split("");
  const seatColsPerSide = 6;
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [occupiedSeats, setOccupiedSeats] = useState(["B4", "C4", "C5"]); // You might fetch these dynamically later

  // Optional: Display movie info for context
  const movieDisplay = {
    title: movieDetails.name || 'Unknown Movie',
    poster: movieDetails.image_url || 'path/to/default/poster.png', // Fallback image
    time: fullShowtimeDate,
    hour: selectedShowtimeTime,
    screen: movieDetails.cinema_room || 'Screen N/A',
  };

  const toggleSeat = (seatId) => {
    if (occupiedSeats.includes(seatId)) return;
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((s) => s !== seatId)
        : [...prev, seatId]
    );
  };

  const getSeatClass = (row, col) => {
    const seatId = `${row}${col}`;
    if (selectedSeats.includes(seatId)) return "bg-red-600";
    if (occupiedSeats.includes(seatId)) return "bg-gray-600";
    return ["A", "B"].includes(row) ? "bg-white" : "bg-yellow-400";
  };

  const calculateTotalTicketPrice = () =>
    selectedSeats.reduce((total, seat) => {
      const row = seat[0];
      const price = ["A", "B"].includes(row) ? 15 : 20; // Example pricing
      return total + price;
    }, 0);

  const SERVICE_FEE = 2.50; // Define a service fee

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat to continue.");
      return;
    }

    const ticketPrice = calculateTotalTicketPrice();

    navigate("/employee/counter-combo", {
      state: {
        movieDetails, // Pass the full movie details object
        selectedShowtimeTime,
        fullShowtimeDate,
        selectedSeats,
        ticketPrice: ticketPrice, // Pass the calculated ticket price
        serviceFee: SERVICE_FEE, // Pass a default service fee
        userInformation: state?.userInformation || {}, // Pass through user info if it exists
      },
    });
    console.log("Selected Seats:", selectedSeats);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-black text-white py-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-4">
          <button
            onClick={handleBack}
            className="text-sm bg-gray-700 hover:bg-gray-600 px-4 py-1 rounded"
          >
            ← Back
          </button>
        </div>

        {/* Movie Info (for context on this page) */}
        <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">{movieDisplay.title}</h2>
            <p className="text-gray-400 text-sm">
                {movieDisplay.time} • {movieDisplay.hour} • {movieDisplay.screen}
            </p>
        </div>

        <h2 className="text-center text-2xl font-bold mb-2">SELECT YOUR SEATS</h2>
        <p className="text-center mb-6 text-sm">Screen This Way</p>
        <div className="h-1 w-full bg-white mb-6" />

        {/* Seat Grid */}
        <div className="space-y-3">
          {seatRows.map((row) => (
            <div key={row} className="flex items-center gap-3 justify-center">
              <span className="w-4 text-sm">{row}</span>
              <div className="flex gap-2">
                {/* Left column */}
                {Array.from({ length: seatColsPerSide }).map((_, i) => {
                  const seatId = `${row}${i + 1}`;
                  return (
                    <button
                      key={seatId}
                      onClick={() => toggleSeat(seatId)}
                      className={`w-8 h-8 rounded text-[10px] flex items-center justify-center ${getSeatClass(row, i + 1)}`}
                      disabled={occupiedSeats.includes(seatId)} // Disable occupied seats
                    >
                      <span
                        className={`font-semibold ${
                          selectedSeats.includes(seatId) || occupiedSeats.includes(seatId)
                            ? "text-white"
                            : ["A", "B"].includes(row)
                            ? "text-gray-900 opacity-50"
                            : "text-yellow-900 opacity-50"
                        }`}
                      >
                        {seatId}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Aisle */}
              <div className="w-6" />

              <div className="flex gap-2">
                {/* Right column */}
                {Array.from({ length: seatColsPerSide }).map((_, i) => {
                  const seatId = `${row}${i + 1 + seatColsPerSide}`;
                  return (
                    <button
                      key={seatId}
                      onClick={() => toggleSeat(seatId)}
                      className={`w-8 h-8 rounded text-[10px] flex items-center justify-center ${getSeatClass(
                        row,
                        i + 1 + seatColsPerSide
                      )}`}
                      disabled={occupiedSeats.includes(seatId)} // Disable occupied seats
                    >
                      <span
                        className={`font-semibold ${
                          selectedSeats.includes(seatId) || occupiedSeats.includes(seatId)
                            ? "text-white"
                            : ["A", "B"].includes(row)
                            ? "text-gray-900 opacity-50"
                            : "text-yellow-900 opacity-50"
                        }`}
                      >
                        {seatId}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-around text-sm mt-6 flex-wrap gap-y-2">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-red-600 rounded" /> Selected
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-white rounded" /> Normal
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-yellow-400 rounded" /> VIP
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-gray-600 rounded" /> Occupied
          </div>
        </div>

        {/* Total and Continue */}
        <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="bg-gray-700 text-white px-6 py-2 rounded text-sm">
            PRICE: {calculateTotalTicketPrice().toFixed(2)} $
          </div>
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold disabled:opacity-50"
            disabled={selectedSeats.length === 0}
            onClick={handleContinue}
          >
            CONTINUE
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;