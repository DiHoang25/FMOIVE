import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Monitor, Crown } from "lucide-react";
import { useSelector, useDispatch } from 'react-redux';
import {
  setSelectedSeats,
  setSelectedCombos,
  setMovieDetails,
} from '../../redux/bookingSlice';
import LoadingSpinner from '../../components/LoadingSpinner'; // import đầu file

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

  const roomId = state?.roomId;
  const movieId = state?.movieId;

  const bookingState = useSelector((state) => state.booking);
  const movieDetails = bookingState.movieDetails;
  const [isLoading, setIsLoading] = useState(true);

  const [roomData, setRoomDataState] = useState(null);
  const [selectedSeatsState, setSelectedSeatsState] = useState(bookingState.selectedSeats || []);

  const movie = movieDetails?.name
    ? movieDetails
    : {
        name: 'Movie Title N/A',
        image_url: 'https://placehold.co/120x180/000000/FFFFFF?text=No+Poster',
        version: 'N/A',
        running_time: 'N/A',
        time: 'N/A',
        cinema_room: 'N/A',
        rating: 'N/A',
        genres: [],
      };

  useEffect(() => {
    dispatch(setSelectedCombos({ combos: [], totalPrice: 0 }));
  }, [dispatch]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const token = localStorage.getItem('token');

        const [roomRes, movieRes] = await Promise.all([
          fetch(`http://localhost:5000/api/theater/rooms/${roomId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:5000/api/movies/${movieId}`)
        ]);

        const roomData = await roomRes.json();
        const movieData = await movieRes.json();

        if (!roomRes.ok) throw new Error(roomData.message || 'Failed to fetch room');
        if (!movieRes.ok) throw new Error(movieData.message || 'Failed to fetch movie');

        setRoomDataState(roomData.room);
        dispatch(setMovieDetails(movieData));
      } catch (error) {
        console.error('❌ Error fetching data:', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (roomId && movieId) {
      fetchAllData();
    }
  }, [roomId, movieId, dispatch]);

  const handleToggleSeat = (seat) => {
    setSelectedSeatsState((prev) =>
      prev.includes(seat.label)
        ? prev.filter((s) => s !== seat.label)
        : [...prev, seat.label]
    );
  };

  const getSeatClass = (seat) => {
    const isSelected = selectedSeatsState.includes(seat.label);
    const base = "w-9 h-9 text-xs sm:w-8 sm:h-8 sm:text-[10px] md:w-10 md:h-10 md:text-xs rounded-lg flex items-center justify-center font-bold transition-all duration-200 transform hover:scale-110 hover:shadow-lg border-2";

    if (isSelected) return `${base} bg-gradient-to-br from-red-500 to-red-600 text-white border-red-400 shadow-lg scale-105`;
    if (seat.type === "VIP") return `${base} bg-gradient-to-br from-amber-400 to-yellow-500 text-gray-900 border-amber-300`;

    return `${base} bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 border-gray-300`;
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
    localStorage.setItem('selectedSeats', JSON.stringify(selectedSeatsState));
    localStorage.setItem('totalSeatPrice', getTotalPrice().toString());

    if (movieDetails) {
      localStorage.setItem('movieDetails', JSON.stringify(movieDetails));
    }

    navigate(`/combo-selection`);
  };

  const formattedRunningTime = formatMinutesToHoursMinutes(movie.running_time);
  const displayCinemaRoomName = formatCinemaRoomName(movie.cinema_room);

  if (isLoading) {
  return <LoadingSpinner />;
}

  return (
    <div className="bg-black min-h-screen text-white px-4 sm:px-6 py-8">
      <div className="bg-[#1a1a1a] max-w-4xl mx-auto p-4 sm:p-6 rounded">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-white bg-gray-700 hover:bg-gray-600 px-4 py-1 rounded"
          >
            ← Back
          </button>
        </div>

        <h1 className="text-2xl font-bold text-center mb-8">SELECT YOUR SEATS</h1>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6 p-4 rounded-md text-center sm:text-left">
          <img
            src={movie.image_url}
            alt={movie.name}
            className="w-28 h-40 object-cover rounded shadow"
          />
          <div>
            <h2 className="text-2xl font-bold mb-1">{movie.name}</h2>
            <p className="text-gray-400 text-sm">{movie.time}  {roomData?.roomName || 'Cinema N/A'}</p>
            <p className="text-gray-400 text-sm">{movie.version} • {formattedRunningTime} • {movie.genres?.join(', ') || 'N/A'}</p>
          </div>
        </div>

        <div className="bg-gray-800/30 rounded-xl p-4 sm:p-6 border border-gray-700">
          <div className="mb-6 text-center">
            <Monitor className="inline w-6 h-6 text-slate-400 mr-2" />
            <span className="text-slate-400 text-sm font-medium">SCREEN</span>
            <div className="h-2 bg-gradient-to-r from-transparent via-white to-transparent rounded-full mt-2 mb-4 opacity-80" />
          </div>


          {roomData ? (
            <div className="overflow-x-auto text-center">
              <div className="inline-block space-y-3 min-w-[320px] mx-auto">
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
                              className={getSeatClass(seat)}
                              title={`Seat ${seat.label} - ${seat.type} - ${seat.price.toLocaleString('vi-VN')} VND`}
                            >
                              {seat.type === "VIP" ? <Crown className="w-3 h-3" /> : seat.label}
                            </button>
                          ) : (
                            <div key={`empty-${cIdx}`} className="w-9 h-9 sm:w-8 sm:h-8 md:w-10 md:h-10" />
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
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">Loading seats...</div>
          )}

          <div className="mt-10 space-y-6">
            <div className="flex justify-center gap-4 sm:gap-8 flex-wrap text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 rounded-lg border-2 border-red-400"></div>
                <span className="text-slate-300 font-medium">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border-2 border-gray-300"></div>
                <span className="text-slate-300 font-medium">Normal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg border-2 border-amber-300 flex items-center justify-center">
                  <Crown className="w-3 h-3" />
                </div>
                <span className="text-slate-300 font-medium">VIP</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-lg font-semibold">
                Total: {getTotalPrice().toLocaleString('vi-VN')} VND
              </p>
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
