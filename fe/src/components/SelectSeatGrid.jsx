import { useState } from "react";
import { useNavigate } from "react-router-dom"; // optional if using routing

const SeatSelection = () => {
  const seatRows = "ABCDEFGH".split("");
  const seatCols = 13;
  const [selectedSeats, setSelectedSeats] = useState([]);
  const occupiedSeats = ["B4", "C4", "C5"];
  const navigate = useNavigate(); // optional if using routing

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

  // Pricing logic
  const calculateTotal = () =>
    selectedSeats.reduce((total, seat) => {
      const row = seat[0];
      const price = ["A", "B"].includes(row) ? 15 : 20;
      return total + price;
    }, 0);

  const handleContinue = () => {
    navigate('/combo');
    console.log("Selected Seats:", selectedSeats);
    // navigate('/payment') or any logic
  };

  const handleBack = () => {
    navigate(-1); // or navigate('/previous-page') depending on your routing
  };

  return (
    <div className="">
      <div className="h-0.5  w-full bg-gray-700 mb-2 my-2" />
      <div>
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={handleBack}
            className="text-sm text-white bg-gray-700 hover:bg-gray-600 px-4 py-1 rounded"
          >
            ← Back
          </button>
        </div>

        <h2 className="text-center text-xl font-bold mb-4">
          SELECT YOUR SEATS
        </h2>
        <p className="mb-2">Number of Seats: {selectedSeats.length}</p>
        <div className="h-1 w-full bg-white mb-2" />
        <p className="text-center text-sm mb-6">Screen This Way</p>

        {/* Seat Grid */}
        <div className="space-y-2">
          {seatRows.map((row) => (
            <div
              key={row}
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${seatCols + 1}, minmax(0, 1fr))`,
              }}
            >
              <span className="text-sm flex items-center justify-center">
                {row}
              </span>
              {[...Array(seatCols)].map((_, colIndex) => {
                const seatId = `${row}${colIndex + 1}`;
                return (
                  <button
                    key={seatId}
                    onClick={() => toggleSeat(seatId)}
                    className={`w-8 h-8 rounded relative flex items-center justify-center ${getSeatClass(
                      row,
                      colIndex + 1
                    )}`}
                  >
                    {/* Display seat numbers on low opacity  */}
                    <span
                      className={`text-[10px] font-semibold ${
                        selectedSeats.includes(seatId) ||
                        occupiedSeats.includes(seatId)
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

        {/* Price and Continue */}
        <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="bg-gray-700 text-white px-6 py-2 rounded text-sm">
            PRICE: {calculateTotal()} $
          </div>
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold"
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
