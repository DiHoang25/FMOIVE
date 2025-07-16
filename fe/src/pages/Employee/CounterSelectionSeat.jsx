import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SidebarLayout from "../../components/Sidebar-Employee";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedSeats } from "../../redux/bookingSlice";


const SeatSelection = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const dispatch = useDispatch();
  const selectedSeats = useSelector((state) => state.booking.selectedSeats);

  // isMobile flag is no longer needed as TransformWrapper and useMediaQuery are removed.

  const {
    movieDetails = {},
    selectedShowtimeTime = "",
    fullShowtimeDate = "",
    roomId = "",
    userInformation = {},
  } = state || {};

  const [roomData, setRoomDataState] = useState(null);
  const [selectedSeatsState, setSelectedSeatsState] = useState(
    selectedSeats || []
  );

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:5000/api/theater/rooms/${roomId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        if (!res.ok)
          throw new Error(data.message || "Failed to load room data");
        setRoomDataState(data.room);
      } catch (err) {
        console.error("❌ Error fetching room data:", err.message);
      }
    };

    fetchRoomData();
  }, [roomId]);

  const toggleSeat = (seat) => {
    setSelectedSeatsState((prev) => {
      const updated = prev.includes(seat.label)
        ? prev.filter((s) => s !== seat.label)
        : [...prev, seat.label];

      const selectedSeatObjects =
        roomData?.seats?.filter((s) => updated.includes(s.label)) || [];
      const totalPrice = selectedSeatObjects.reduce(
        (sum, s) => sum + s.price,
        0
      );

      dispatch(setSelectedSeats({ seats: updated, totalPrice }));
      return updated;
    });
  };

  const getSeatClass = (seat) => {
    const isSelected = selectedSeatsState.includes(seat.label);
    // Base classes for all seats, simplified as mobile-specific scaling classes are removed
    const base =
      "w-10 h-10 text-xs rounded-lg flex items-center justify-center font-bold transition-all duration-200 transform hover:scale-110 hover:shadow-lg border-2";

    if (seat.status === "booked")
      return `${base} bg-gray-600 text-white cursor-not-allowed opacity-70`;
    if (isSelected)
      return `${base} bg-gradient-to-br from-red-500 to-red-600 text-white border-red-400 shadow-lg scale-105`;
    if (seat.type === "VIP")
      return `${base} bg-gradient-to-br from-amber-400 to-yellow-500 text-gray-900 border-amber-300`;
    return `${base} bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 border-gray-300`;
  };

  const calculateTotalTicketPrice = () => {
    if (!roomData) return 0;
    return roomData.seats
      .filter((seat) => selectedSeatsState.includes(seat.label))
      .reduce((total, seat) => total + seat.price, 0);
  };

  const handleContinue = () => {
    if (selectedSeatsState.length === 0) {
      console.warn("Please select at least one seat to continue."); // Replaced message.warning
      return;
    }

    const selectedSeatObjects = roomData.seats.filter((seat) =>
      selectedSeatsState.includes(seat.label)
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

          <h2 className="text-center text-2xl font-bold mb-2">
            SELECT YOUR SEATS
          </h2>
          <p className="text-center mb-4 text-sm text-gray-400">
            Screen this way
          </p>
          <div className="h-1 w-full bg-white mb-6" />

          {roomData ? (
            // Unified view for both mobile and desktop with horizontal scrolling
            <div className="overflow-x-auto text-center">
              <div className="inline-block space-y-3 min-w-[320px] mx-auto">
                {" "}
                {/* min-w to ensure content width, inline-block to allow centering with mx-auto */}
                {[...Array(roomData.rows)].map((_, rowIndex) => {
                  const rowLetter = String.fromCharCode(65 + rowIndex);
                  const rowSeats = roomData.seats.filter(
                    (s) => Number(s.row) === rowIndex + 1
                  );

                  return (
                    <div
                      key={rowLetter}
                      className="flex items-center justify-center gap-2"
                    >
                      {" "}
                      {/* Adjusted gap for consistent look */}
                      <div className="w-8 flex items-center justify-center">
                        <span className="text-slate-400 font-bold text-sm">
                          {rowLetter}
                        </span>
                      </div>
                      <div className="flex gap-2 justify-center">
                        {" "}
                        {/* Adjusted gap for consistent look */}
                        {[...Array(roomData.columns)].map((_, colIndex) => {
                          const seat = rowSeats.find(
                            (s) => Number(s.column) === colIndex + 1
                          );
                          if (!seat)
                            return (
                              <div
                                key={`empty-${colIndex}`}
                                className="w-10 h-10"
                              />
                            ); // Keep consistent size

                          return (
                            <button
                              key={seat.label}
                              disabled={seat.status === "booked"}
                              onClick={() => toggleSeat(seat)}
                              className={getSeatClass(seat)}
                              title={`Seat ${seat.label} - ${
                                seat.type
                              } - ${seat.price.toLocaleString("vi-VN")} VND`}
                            >
                              {/* Replaced Crown icon with text for VIP seats */}
                              {seat.type === "VIP" ? (
                                <>
                                  <span className="text-xs">{seat.label}</span>
                                  
                                </>
                              ) : (
                                seat.label
                              )}
                            </button>
                          );
                        })}
                      </div>
                      <div className="w-8 flex items-center justify-center">
                        <span className="text-slate-400 font-bold text-sm">
                          {rowLetter}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-6">
              Loading seat data...
            </div>
          )}

          {/* Legend */}
          <div className="flex justify-around text-sm mt-6 flex-wrap gap-y-2">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-gradient-to-br from-red-500 to-red-600 rounded-lg border-2 border-red-400"></div>
              <span className="text-slate-300 font-medium">Selected</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border-2 border-gray-300"></div>
              <span className="text-slate-300 font-medium">Normal</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg border-2 border-amber-300 flex items-center justify-center">
                {/* Replaced Crown icon with text for VIP legend */}
                <span className="text-gray-900 font-bold text-[8px]"></span>
              </div>
              <span className="text-slate-300 font-medium">VIP</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-gray-600 rounded" /> Booked
            </div>
          </div>

          {/* Total + Continue - Responsive Styling */}
          <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-x-2 md:gap-4">
            <div className="bg-gray-700 text-white px-4 py-2 rounded text-xs sm:px-6 sm:text-sm flex-shrink-0">
              PRICE: {calculateTotalTicketPrice().toLocaleString("vi-VN")} VND
            </div>
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold disabled:opacity-50 flex-shrink-0 mt-4 md:mt-0" /* Added mt-4 for mobile spacing */
              disabled={selectedSeatsState.length === 0}
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