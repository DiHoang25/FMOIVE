import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const SeatSelection = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const {
    movieDetails = {},
    selectedShowtimeTime = '',
    fullShowtimeDate = '',
    roomId = '',
    userInformation = {},
  } = state || {};

  const [roomData, setRoomData] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/theater/rooms/${roomId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load room data");
        setRoomData(data.room);
      } catch (err) {
        console.error("❌ Error fetching room data:", err.message);
      }
    };

    fetchRoomData();
  }, [roomId]);

  const toggleSeat = (seatLabel) => {
    setSelectedSeats((prev) =>
      prev.includes(seatLabel)
        ? prev.filter((s) => s !== seatLabel)
        : [...prev, seatLabel]
    );
  };

  const getSeatClass = (seat) => {
    const isSelected = selectedSeats.includes(seat.label);
    const base = "w-8 h-8 rounded text-[10px] flex items-center justify-center";

    if (seat.status === "booked") return `${base} bg-gray-600 text-white cursor-not-allowed`;
    if (isSelected) return `${base} bg-red-600 text-white`;
    if (seat.type === "VIP") return `${base} bg-yellow-400 text-yellow-900 opacity-80`;
    return `${base} bg-white text-gray-900 opacity-80`;
  };

  const calculateTotalTicketPrice = () => {
    if (!roomData) return 0;
    return roomData.seats
      .filter((seat) => selectedSeats.includes(seat.label))
      .reduce((total, seat) => total + seat.price, 0);
  };

  const SERVICE_FEE = 2.5;

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat to continue.");
      return;
    }

    const selectedSeatObjects = roomData.seats.filter((seat) =>
      selectedSeats.includes(seat.label)
    );
    const totalPrice = calculateTotalTicketPrice();

    navigate("/employee/counter-combo", {
      state: {
        movieDetails,
        selectedShowtimeTime,
        fullShowtimeDate,
        selectedSeats: selectedSeatObjects,
        ticketPrice: totalPrice,
        serviceFee: SERVICE_FEE,
        userInformation,
      },
    });
  };

  const handleBack = () => navigate(-1);

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

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">{movieDetails.name || "Unknown Movie"}</h2>
          <p className="text-gray-400 text-sm">
            {fullShowtimeDate} • {selectedShowtimeTime} •{" "}
            {roomData?.roomName || 'Cinema N/A'}
          </p>
        </div>

        <h2 className="text-center text-2xl font-bold mb-2">SELECT YOUR SEATS</h2>
        <p className="text-center mb-4 text-sm text-gray-400">Screen this way</p>
        <div className="h-1 w-full bg-white mb-6" />

        {roomData ? (
          <div className="space-y-3">
            {[...Array(roomData.rows)].map((_, rowIndex) => {
              const rowLetter = String.fromCharCode(65 + rowIndex);
              const rowSeats = roomData.seats.filter((s) => Number(s.row) === rowIndex + 1);

              return (
                <div key={rowLetter} className="flex items-center justify-center gap-3">
                  <span className="w-4 text-sm text-slate-300">{rowLetter}</span>

                  <div className="flex gap-2">
                    {[...Array(roomData.columns)].map((_, colIndex) => {
                      const seat = rowSeats.find((s) => Number(s.column) === colIndex + 1);
                      if (!seat) return <div key={`empty-${colIndex}`} className="w-8 h-8" />;

                      return (
                        <button
                          key={seat.label}
                          disabled={seat.status === "booked"}
                          onClick={() => toggleSeat(seat.label)}
                          className={getSeatClass(seat)}
                          title={`Seat ${seat.label} - ${seat.type} - ${seat.price.toLocaleString()} VND`}
                        >
                          {seat.label}
                        </button>
                      );
                    })}
                  </div>

                  <span className="w-4 text-sm text-slate-300">{rowLetter}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-6">Loading seat data...</div>
        )}

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
            <div className="w-4 h-4 bg-gray-600 rounded" /> Booked
          </div>
        </div>

        {/* Total + Continue */}
        <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="bg-gray-700 text-white px-6 py-2 rounded text-sm">
            PRICE: {calculateTotalTicketPrice().toLocaleString()} VND
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
