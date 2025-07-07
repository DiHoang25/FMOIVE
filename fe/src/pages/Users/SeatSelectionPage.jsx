import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Monitor, Crown } from "lucide-react";
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedSeats } from '../../redux/bookingSlice';

const formatMinutesToHoursMinutes = (minutes) => {
  if (typeof minutes !== 'number' || minutes < 0) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

const formatCinemaRoomName = (roomName) => {
  if (!roomName) return 'N/A';
  const match = roomName.match(/ROOM0*(\d+)/);
  if (match && match[1]) {
    return `Cinema ${parseInt(match[1], 10)}`;
  }
  return roomName;
};

function SeatSelectionPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { state } = useLocation();

  // ✅ Lấy dữ liệu từ state
  const roomId = state?.roomId;
  const movieDetails = useSelector((state) => state.booking.movieDetails);

  const movie = movieDetails || {
    name: 'Movie Title N/A',
    image_url: 'https://placehold.co/120x180/000000/FFFFFF?text=No+Poster',
    version: 'N/A',
    running_time: 'N/A',
    time: 'N/A',
    cinema_room: 'N/A',
    rating: 'N/A',
    genres: [],
  };

  const [roomData, setRoomDataState] = useState(null);
  const [selectedSeatsState, setSelectedSeatsState] = useState([]);

  useEffect(() => {
    const fetchRoomData = async () => {
      if (!roomId) return;

      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/theater/rooms/${roomId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load seat data");
        setRoomDataState(data.room);
      } catch (err) {
        console.error("❌ Error fetching room:", err.message);
      }
    };

    fetchRoomData();
  }, [roomId]);

  const handleToggleSeat = (seat) => {
    setSelectedSeatsState((prev) =>
      prev.includes(seat.label)
        ? prev.filter((s) => s !== seat.label)
        : [...prev, seat.label]
    );
  };

  const getSeatClass = (seat) => {
    const isSelected = selectedSeatsState.includes(seat.label);
    const baseClasses =
      "w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-200 transform hover:scale-110 hover:shadow-lg border-2";

    if (isSelected) {
      return `${baseClasses} bg-gradient-to-br from-red-500 to-red-600 text-white border-red-400 shadow-lg scale-105`;
    }

    if (seat.type === "VIP") {
      return `${baseClasses} bg-gradient-to-br from-amber-400 to-yellow-500 text-gray-900 border-amber-300`;
    }

    return `${baseClasses} bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 border-gray-300`;
  };

  const getTotalPrice = () => {
    if (!roomData) return 0;
    return roomData.seats
      .filter((seat) => selectedSeatsState.includes(seat.label))
      .reduce((total, seat) => total + seat.price, 0);
  };

  const handleSeatSelectionContinue = () => {
    dispatch(setSelectedSeats({
      seats: selectedSeatsState,
      totalPrice: getTotalPrice(),
    }));

    navigate('/combo-selection');
  };

  const handleBack = () => {
    navigate(-1);
  };

  const formattedRunningTime = formatMinutesToHoursMinutes(movie.running_time);
  const displayCinemaRoomName = formatCinemaRoomName(movie.cinema_room);

  return (
    <div className="bg-black min-h-screen text-white px-6 py-10">
      <div className="bg-[#1a1a1a] max-w-4xl mx-auto p-6 rounded">
        <div className="mb-6">
          <button onClick={handleBack} className="text-sm text-white bg-gray-700 hover:bg-gray-600 px-4 py-1 rounded">
            ← Back
          </button>
        </div>

        <h1 className="text-2xl font-bold text-center mb-8">SELECT YOUR SEATS</h1>

        <div className="flex gap-4 mb-6 items-center">
          <img src={movie.image_url} alt={movie.name} className="w-[120px] h-[180px] object-cover rounded" />
          <div className="flex-1 space-y-1">
            <h2 className="text-2xl font-bold text-white">{movie.name}</h2>
            <p className="text-gray-300 text-sm">
              {movie.version} • {formattedRunningTime} • {movie.genres?.join(', ') || 'N/A'}
            </p>
            <p className="text-gray-300 text-sm">
              {movie.time} • {displayCinemaRoomName}
            </p>
          </div>
        </div>

        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
          <div className="mb-6 text-center">
            <Monitor className="inline w-6 h-6 text-slate-400 mr-2" />
            <span className="text-slate-400 text-sm font-medium">SCREEN</span>
            <div className="h-2 bg-gradient-to-r from-transparent via-white to-transparent rounded-full mt-2 mb-4 opacity-80" />
          </div>

          {roomData ? (
            <div className="space-y-3">
              {[...Array(roomData.rows)].map((_, rIdx) => {
                const rowLetter = String.fromCharCode(65 + rIdx);
                const rowSeats = roomData.seats.filter((s) => Number(s.row) === rIdx + 1);

                return (
                  <div key={rowLetter} className="flex items-center justify-center gap-2">
                    <div className="w-8 flex items-center justify-center">
                      <span className="text-slate-400 font-bold text-sm">{rowLetter}</span>
                    </div>
                    <div className="flex gap-2 justify-center">
                      {[...Array(roomData.columns)].map((_, cIdx) => {
                        const seat = rowSeats.find((s) => Number(s.column) === cIdx + 1);
                        return seat ? (
                          <button
                            key={seat.label}
                            onClick={() => handleToggleSeat(seat)}
                            title={`Seat ${seat.label} - ${seat.type} - ${seat.price.toLocaleString('vi-VN')} VND`}
                            className={getSeatClass(seat)}
                          >
                            {seat.type === "VIP" ? <Crown className="w-3 h-3" /> : seat.label}
                          </button>
                        ) : (
                          <div key={`empty-${cIdx}`} className="w-10 h-10" />
                        );
                      })}
                    </div>
                    <div className="w-8 flex items-center justify-center">
                      <span className="text-slate-400 font-bold text-sm">{rowLetter}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">Loading seats...</div>
          )}

          <div className="mt-10 space-y-6">
            <div className="flex justify-center gap-8 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 rounded-lg border-2 border-red-400"></div>
                <span className="text-slate-300 text-sm font-medium">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border-2 border-gray-300"></div>
                <span className="text-slate-300 text-sm font-medium">Normal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg border-2 border-amber-300 flex items-center justify-center">
                  <Crown className="w-3 h-3 text-gray-900" />
                </div>
                <span className="text-slate-300 text-sm font-medium">VIP</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-lg font-semibold">Total: {getTotalPrice().toLocaleString('vi-VN')} VND</p>
              <button
                onClick={handleSeatSelectionContinue}
                disabled={selectedSeatsState.length === 0}
                className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SeatSelectionPage;
