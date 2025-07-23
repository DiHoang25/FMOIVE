import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SidebarLayout from "../../components/Sidebar-Employee";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedSeats } from "../../redux/bookingSlice";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useMediaQuery } from "react-responsive";
import { Crown } from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const SeatSelection = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const dispatch = useDispatch();
  const selectedSeats = useSelector((state) => state.booking.selectedSeats);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const {
    movieDetails = {},
    selectedShowtimeTime = "",
    fullShowtimeDate = "",
    roomId = "",
    userInformation = {},
  } = state || {};

  const [roomData, setRoomDataState] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [selectedSeatsState, setSelectedSeatsState] = useState(
    selectedSeats || []
  );

  // DEBUG: Log incoming data
  useEffect(() => {
    console.log("🔍 DEBUG - Incoming state data:");
    console.log("movieDetails:", movieDetails);
    console.log("selectedShowtimeTime:", selectedShowtimeTime);
    console.log("fullShowtimeDate:", fullShowtimeDate);
    console.log("roomId:", roomId);
  }, [movieDetails, selectedShowtimeTime, fullShowtimeDate, roomId]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const token = localStorage.getItem("token");

        console.log("🚀 Fetching data for roomId:", roomId);

        // Fetch room data and occupied seats in parallel
        const [roomRes, occupiedRes] = await Promise.all([
          fetch(`http://localhost:5000/api/theater/rooms/${roomId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:5000/api/theater/rooms/${roomId}/occupied-seats`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        const roomData = await roomRes.json();
        const occupiedData = await occupiedRes.json();

        console.log("📦 Raw API responses:");
        console.log("roomData:", roomData);
        console.log("occupiedData:", occupiedData);

        if (!roomRes.ok) {
          throw new Error(roomData.message || "Failed to load room data");
        }
        if (!occupiedRes.ok) {
          throw new Error(occupiedData.message || "Failed to fetch occupied seats");
        }

        setRoomDataState(roomData.room);
        setOccupiedSeats(occupiedData.occupiedSeats || []);

        console.log("✅ Data set to state:");
        console.log("roomData.room:", roomData.room);
        console.log("occupiedSeats:", occupiedData.occupiedSeats);

      } catch (err) {
        console.error("❌ Error fetching data:", err.message);
      }
    };

    if (roomId) {
      fetchAllData();
    }
  }, [roomId]);

  // Create standardized movie time for comparison
  const standardizedMovieTime = (() => {
    if (!selectedShowtimeTime || !fullShowtimeDate) {
      console.log("⚠️ Missing time data:", { selectedShowtimeTime, fullShowtimeDate });
      return "Invalid Time";
    }

    console.log("🕐 Input data:", {
      fullShowtimeDate,
      selectedShowtimeTime
    });

    // Clean and normalize the inputs
    const cleanDate = fullShowtimeDate.trim();
    const cleanTime = selectedShowtimeTime.trim();

    // Try different date-time combination approaches
    const combinationAttempts = [
      // Direct combination with comma
      `${cleanDate}, ${cleanTime}`,
      // Direct combination with space
      `${cleanDate} ${cleanTime}`,
      // ISO-like format
      `${cleanDate}T${cleanTime}`,
    ];

    const formats = [
      "DD/MM/YYYY, HH:mm",
      "DD/MM/YYYY HH:mm",
      "DD/MM/YYYYTHH:mm",
      "YYYY-MM-DD, HH:mm",
      "YYYY-MM-DD HH:mm",
      "YYYY-MM-DDTHH:mm",
      "MM/DD/YYYY, HH:mm",
      "MM/DD/YYYY HH:mm",
      "MM/DD/YYYYTHH:mm",
      "DD-MM-YYYY, HH:mm",
      "DD-MM-YYYY HH:mm",
      "DD-MM-YYYYTHH:mm"
    ];

    // Try all combinations
    for (const attempt of combinationAttempts) {
      console.log("🔄 Trying combination:", attempt);

      for (const format of formats) {
        const parsed = dayjs(attempt, format, true);
        if (parsed.isValid()) {
          const result = parsed.tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DDTHH:mm");
          console.log(`✅ SUCCESS! Format: "${format}" -> Result: "${result}"`);
          return result;
        }
      }
    }

    // If all specific formats fail, try dayjs auto-parsing
    console.log("🔄 Trying dayjs auto-parsing...");
    for (const attempt of combinationAttempts) {
      const parsed = dayjs(attempt);
      if (parsed.isValid()) {
        const result = parsed.tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DDTHH:mm");
        console.log(`✅ AUTO-PARSE SUCCESS! Input: "${attempt}" -> Result: "${result}"`);
        return result;
      }
    }

    console.log("❌ All parsing attempts failed");
    console.log("📋 Available data:", { cleanDate, cleanTime });
    return "Invalid Time";
  })();

  // Also improve the occupied seats filtering logic:
  const occupiedLabels = occupiedSeats
    ?.filter((os) => {
      console.log("🔍 Processing occupied seat:", os);

      if (!os.showtime) {
        console.log("⚠️ No showtime in occupied seat data");
        return false;
      }

      // Handle the showtime conversion more robustly
      let occupiedTimeVN;
      try {
        // Parse the UTC time and convert to Vietnam timezone
        occupiedTimeVN = dayjs.utc(os.showtime).tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DDTHH:mm");
        console.log(`🕒 Occupied seat time (VN): "${occupiedTimeVN}"`);
        console.log(`🕒 Movie time (standardized): "${standardizedMovieTime}"`);

        const isMatch = occupiedTimeVN === standardizedMovieTime;
        console.log(`🔍 Times match: ${isMatch}`);

        if (isMatch) {
          console.log("✅ MATCH found for seat:", os.seatLabel);
        }

        return isMatch;
      } catch (error) {
        console.error("❌ Error processing occupied seat time:", error);
        return false;
      }
    })
    .map((os) => os.seatLabel) || [];

  console.log("🪑 Final occupied seats for current showtime:", occupiedLabels);

  const handleToggleSeat = (seat) => {
    // Check if seat is occupied for current showtime
    const isOccupied = occupiedLabels.includes(seat.label);
    if (isOccupied) {
      console.log("🚫 Seat is occupied:", seat.label);
      return;
    }

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
    const isOccupied = occupiedLabels.includes(seat.label);

    // DEBUG: Log seat status
    if (isOccupied) {
      console.log(`🔴 Seat ${seat.label} is OCCUPIED`);
    }

    const base = `
      w-10 h-10 text-xs rounded-lg flex items-center justify-center 
      font-bold border-2 ${isMobile ? '' : 'transition-all duration-200 transform hover:scale-110 hover:shadow-lg'}
    `;

    if (isOccupied) return `${base} bg-slate-700 text-white border-slate-600 cursor-not-allowed opacity-90`;
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
      console.warn("Please select at least one seat to continue.");
      return;
    }

    navigate("/employee/counter-combo", {
      state: {
        movieDetails,
        selectedShowtimeTime,
        fullShowtimeDate,
        selectedSeats: roomData.seats.filter(seat => selectedSeatsState.includes(seat.label)),
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
                <Crown className="w-2 h-2" />
              </div>
              <span className="text-slate-300 font-medium">VIP</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-slate-700 rounded-lg border-2 border-slate-600" />
              <span className="text-slate-300 font-medium">Occupied</span>
            </div>
          </div>

          {/* Total + Continue - Responsive Styling */}
          <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-x-2 md:gap-4">
            <div className="bg-gray-700 text-white px-4 py-2 rounded text-xs sm:px-6 sm:text-sm flex-shrink-0">
              PRICE: {calculateTotalTicketPrice().toLocaleString("vi-VN")} VND
            </div>
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold disabled:opacity-50 flex-shrink-0 mt-4 md:mt-0"
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