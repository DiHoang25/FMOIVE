import { useState, useEffect } from "react";

const SeatSelection = ({ onContinue }) => {
  const seatRows = "ABCDEFGH".split("");
  const seatCols = 13; // Number of columns

  const [selectedSeats, setSelectedSeats] = useState([]);
  const occupiedSeats = ["B4", "C4", "C5"]; // Example occupied seats

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
    if (occupiedSeats.includes(seatId)) return "bg-gray-600 cursor-not-allowed"; // Add cursor-not-allowed for occupied
    return ["A", "B"].includes(row) ? "bg-white text-gray-900" : "bg-yellow-400 text-yellow-900"; // Ensure text color for legibility
  };

  // Pricing logic
  const calculateTotal = () =>
    selectedSeats.reduce((total, seat) => {
      const row = seat[0];
      const price = ["A", "B"].includes(row) ? 15 : 20; // Example: A/B rows are $15, others are $20
      return total + price;
    }, 0);

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat.");
      return;
    }
    onContinue(selectedSeats, calculateTotal());
  };

  return (
    <div className="">
      <div className="h-0.5 w-full bg-gray-700 mb-2 my-2" />
      <div>
        <h2 className="text-center text-xl font-bold mb-4">
          SELECT YOUR SEATS
        </h2>
        <p className="mb-2">Number of Seats: {selectedSeats.length}</p>
        <div className="h-1 w-full bg-white mb-2" />
        <p className="text-center text-sm mb-6">Screen This Way</p>

        {/* Seat Grid */}
        <div className="pb-4"> {/* */}
          <div className="space-y-2 inline-block"> {/* Use inline-block to allow overflow-x-auto to work */}

            {/* Column Numbers Row (Top) */}
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: `minmax(0, 1fr) repeat(${seatCols}, minmax(0, 1fr))` }} /* Adjust for empty first cell */
            >
              {/* Empty cell for the row letters column */}
              <div className="w-8 h-8 flex items-center justify-center"></div>
              {/* Column numbers */}
              {[...Array(seatCols)].map((_, colIndex) => (
                <div
                  key={`col-num-${colIndex}`}
                  className="w-8 h-8 flex items-center justify-center text-sm font-bold text-gray-400"
                >
                  {colIndex + 1}
                </div>
              ))}
            </div>

            {/* Seat Rows with Row Letters */}
            {seatRows.map((row) => (
              <div
                key={row}
                className="grid gap-2"
                style={{
                  gridTemplateColumns: `minmax(0, 1fr) repeat(${seatCols}, minmax(0, 1fr))`, // First column for row letter
                }}
              >
                {/* Row Letter */}
                <span className="w-8 h-8 text-sm flex items-center justify-center font-bold text-gray-400">
                  {row}
                </span>
                {/* Individual Seats */}
                {[...Array(seatCols)].map((_, colIndex) => {
                  const seatId = `${row}${colIndex + 1}`;
                  const isOccupied = occupiedSeats.includes(seatId);

                  return (
                    <button
                      key={seatId}
                      onClick={() => toggleSeat(seatId)}
                      className={`w-8 h-8 rounded relative flex items-center justify-center text-[10px] font-semibold ${getSeatClass(
                        row,
                        colIndex + 1
                      )} ${isOccupied ? 'cursor-not-allowed' : ''}`}
                      disabled={isOccupied} // Disable occupied seats
                    >
                      {seatId} {/* Display seat ID directly on the seat */}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
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
            PRICE: {calculateTotal().toFixed(2)} $ {/* Added toFixed(2) for currency */}
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