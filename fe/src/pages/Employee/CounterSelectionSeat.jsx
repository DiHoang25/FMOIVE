import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SeatSelection = () => {
  const seatRows = "ABCDEFGH".split("");
  const seatColsPerSide = 6; // Two columns of 6 (total 12 seats with a gap in the middle)
  const [selectedSeats, setSelectedSeats] = useState([]);
  const occupiedSeats = ["B4", "C4", "C5"];
  const navigate = useNavigate();

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

  const calculateTotal = () =>
    selectedSeats.reduce((total, seat) => {
      const row = seat[0];
      const price = ["A", "B"].includes(row) ? 15 : 20;
      return total + price;
    }, 0);

  const handleContinue = () => {
    navigate("/employee/counter-combo");
    console.log("Selected Seats:", selectedSeats);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-4">
          <button
            onClick={handleBack}
            className="text-sm bg-gray-700 hover:bg-gray-600 px-4 py-1 rounded"
          >
            ← Back
          </button>
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
            PRICE: {calculateTotal()} $
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
