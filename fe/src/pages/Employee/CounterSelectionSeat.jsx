import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SidebarLayout from "../../components/Sidebar-Employee";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedSeats } from "../../redux/bookingSlice";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useMediaQuery } from "react-responsive";
import { Crown } from "lucide-react";

const SeatSelection = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const dispatch = useDispatch();
  const selectedSeats = useSelector((state) => state.booking.selectedSeats);
  const isMobile = useMediaQuery({ maxWidth: 768 });

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
  
   const handleToggleSeat = (seat) => {
    setSelectedSeatsState((prev) =>
      prev.includes(seat.label)
        ? prev.filter((s) => s !== seat.label)
        : [...prev, seat.label]
    );
  };

  const getSeatClass = (seat) => {
  const isSelected = selectedSeatsState.includes(seat.label);
  const isOccupied = roomData?.occupiedSeats?.some(os => os.seatLabel === seat.label);
  
  const base = `
    w-10 h-10 text-xs rounded-lg flex items-center justify-center 
    font-bold border-2 ${isMobile ? '' : 'transition-all duration-200 transform hover:scale-110 hover:shadow-lg'}
  `;

  if (isOccupied) return `${base} bg-gray-600 text-white border-gray-500 cursor-not-allowed opacity-70`;
  if (isSelected) return `${base} bg-gradient-to-br from-red-500 to-red-600 text-white border-red-400 ${isMobile ? '' : 'shadow-lg scale-105'}`;
  if (seat.type === "VIP") return `${base} bg-gradient-to-br from-amber-400 to-yellow-500 text-gray-900 border-amber-300`;
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
            isMobile ? (
              <div className="relative w-full overflow-hidden rounded-lg border border-gray-600">
                <TransformWrapper
                  initialScale={0.5}
                  minScale={0.3}
                  maxScale={2.5}
                  wheel={{ step: 0.1 }}
                  doubleClick={{ disabled: true }}
                >
                  {({ zoomIn, zoomOut, resetTransform }) => (
                    <>
                      <div className="absolute top-2 right-2 z-10 flex gap-2">
                        <button 
                          onClick={() => zoomIn()} 
                          className="bg-gray-700/80 text-white p-1 rounded"
                        >
                          +
                        </button>
                        <button 
                          onClick={() => zoomOut()} 
                          className="bg-gray-700/80 text-white p-1 rounded"
                        >
                          -
                        </button>
                        <button 
                          onClick={() => resetTransform()} 
                          className="bg-gray-700/80 text-white p-1 rounded"
                        >
                          Reset
                        </button>
                      </div>
                      <TransformComponent wrapperClass="!w-full !h-full">
                        <div className="w-max mx-auto p-4">
                          {[...Array(roomData.rows)].map((_, rIdx) => {
                            const rowLetter = String.fromCharCode(65 + rIdx);
                            const rowSeats = roomData.seats.filter((s) => Number(s.row) === rIdx + 1);

                            return (
                              <div key={rowLetter} className="flex items-center justify-center gap-1 sm:gap-2 mb-1">
                                <div className="w-6 sm:w-8 flex items-center justify-center">
                                  <span className="text-slate-400 font-bold text-xs sm:text-sm">{rowLetter}</span>
                                </div>
                                <div className="flex gap-1 sm:gap-2">
                                  {[...Array(roomData.columns)].map((_, cIdx) => {
                                    const seat = rowSeats.find((s) => Number(s.column) === cIdx + 1);
                                    return seat ? (
                                      <button
                                        key={seat.label}
                                        onClick={() => handleToggleSeat(seat)}
                                        className={getSeatClass(seat)}
                                        title={`Seat ${seat.label} - ${seat.type} - ${seat.price.toLocaleString('vi-VN')} VND`}
                                      >
                                        {seat.type === "VIP" ? (
                                          <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                        ) : (
                                          <span className="text-xs sm:text-sm">{seat.label}</span>
                                        )}
                                      </button>
                                    ) : (
                                      <div key={`empty-${cIdx}`} className="w-8 h-8 sm:w-10 sm:h-10" />
                                    );
                                  })}
                                </div>
                                <div className="w-6 sm:w-8 flex items-center justify-center">
                                  <span className="text-slate-400 font-bold text-xs sm:text-sm">{rowLetter}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </TransformComponent>
                    </>
                  )}
                </TransformWrapper>
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <div className="w-max mx-auto">
                  {[...Array(roomData.rows)].map((_, rIdx) => {
                    const rowLetter = String.fromCharCode(65 + rIdx);
                    const rowSeats = roomData.seats.filter((s) => Number(s.row) === rIdx + 1);

                    return (
                      <div key={rowLetter} className="flex items-center justify-center gap-2 mb-2">
                        <div className="w-8 flex items-center justify-center">
                          <span className="text-slate-400 font-bold text-sm">{rowLetter}</span>
                        </div>
                        <div className="flex gap-2">
                          {[...Array(roomData.columns)].map((_, cIdx) => {
                            const seat = rowSeats.find((s) => Number(s.column) === cIdx + 1);
                            return seat ? (
                              <button
                                key={seat.label}
                                onClick={() => handleToggleSeat(seat)}
                                className={getSeatClass(seat)}
                                title={`Seat ${seat.label} - ${seat.type} - ${seat.price.toLocaleString('vi-VN')} VND`}
                              >
                                {seat.type === "VIP" ? (
                                  <Crown className="w-3 h-3" />
                                ) : (
                                  seat.label
                                )}
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
              </div>
            )
          ) : (
            <div className="text-center py-8 sm:py-12 text-slate-400">
              Loading seats...
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