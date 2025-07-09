import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SidebarLayout from '../../components/Sidebar-Employee';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedSeats } from '../../redux/bookingSlice';


const SeatSelection = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const dispatch = useDispatch();
  const selectedSeats = useSelector((state) => state.booking.selectedSeats);


  const {
    movieDetails = {},
    selectedShowtimeTime = '',
    fullShowtimeDate = '',
    roomId = '',
    userInformation = {},
  } = state || {};

  const [roomData, setRoomData] = useState(null);

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
    const updated = selectedSeats.includes(seatLabel)
      ? selectedSeats.filter((s) => s !== seatLabel)
      : [...selectedSeats, seatLabel];

    const selectedSeatObjects = roomData.seats.filter(seat => updated.includes(seat.label));
    const totalPrice = selectedSeatObjects.reduce((sum, s) => sum + s.price, 0);

    dispatch(setSelectedSeats({ seats: updated, totalPrice }));
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
        selectedSeats: roomData.seats.filter(seat => selectedSeats.includes(seat.label)),
        ticketPrice: calculateTotalTicketPrice(),
        userInformation,
      },
    });
  };

  const handleBack = () => navigate(-1);

  return (
    <SidebarLayout>
      <div className="min-h-screen text-white py-6">
        <div className="max-w-6xl mx-auto px-6 py-6 bg-slate-800 rounded-2xl shadow-lg">
          <div className="mb-4">
            <button
              onClick={handleBack}
              className="text-sm bg-gray-700 hover:bg-gray-600 px-4 py-1 rounded"
            >
              ← Back
            </button>
          </div>

          <div className="flex items-center justify-center gap-4 mb-6 bg-slate-800 p-4 rounded-md">
            {movieDetails.image_url && (
              <img
                src={movieDetails.image_url}
                alt={movieDetails.name}
                className="w-28 h-40 object-cover rounded shadow"
              />
            )}
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-1">{movieDetails.name || "Unknown Movie"}</h2>
              <p className="text-gray-400 text-sm">
                {fullShowtimeDate} • {selectedShowtimeTime} • {roomData?.roomName || "Room N/A"}
              </p>
            </div>
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
    </SidebarLayout>
  );
};

export default SeatSelection;