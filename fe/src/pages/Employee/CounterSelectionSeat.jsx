import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SidebarLayout from "../../components/Sidebar-Employee";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedSeats } from "../../redux/bookingSlice";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useMediaQuery } from "react-responsive";
import { Crown } from "lucide-react";
import { notification } from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { message } from "antd";

dayjs.extend(utc);
dayjs.extend(timezone);

const SeatSelection = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const dispatch = useDispatch();
  const selectedSeats = useSelector((state) => state.booking.selectedSeats);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  // Lấy thông tin user từ Redux store (quan trọng nhất!)
  const user = useSelector((state) => state.booking.user);
  console.log("🔍 DEBUG - User from Redux store on SeatSelection:", user);

  const {
    movieDetails = {},
    selectedShowtimeTime = "",
    fullShowtimeDate = "",
    roomId = "",
    // userInformation = {}, // <--- XÓA DÒNG NÀY, không còn cần nữa
  } = state || {};

  const [roomData, setRoomDataState] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [selectedSeatsState, setSelectedSeatsState] = useState(
    selectedSeats || []
  );

  // DEBUG: Log incoming data (cần kiểm tra xem movieDetails, time, roomId có đầy đủ không)
  useEffect(() => {
    console.log("🔍 DEBUG - Incoming state data to SeatSelection:");
    console.log("movieDetails:", movieDetails);
    console.log("selectedShowtimeTime:", selectedShowtimeTime);
    console.log("fullShowtimeDate:", fullShowtimeDate);
    console.log("roomId:", roomId);
  }, [movieDetails, selectedShowtimeTime, fullShowtimeDate, roomId]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("❌ No token found. User might not be logged in.");
          // Có thể điều hướng về trang login nếu không có token
          // navigate('/employee/login');
          return;
        }

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
        notification.error({
          message: 'Error',
          description: `Failed to load seat data: ${err.message}. Please try again.`,
          placement: 'topRight'
        });
      }
    };

    if (roomId) {
      fetchAllData();
    } else {
      console.warn("Room ID is missing. Cannot fetch room data.");
      // Điều hướng trở lại trang chọn suất chiếu nếu không có roomId
      navigate('/employee/counter-showtimes');
    }
  }, [roomId, navigate]); // Thêm navigate vào dependency array

  const hasLonelySeat = (rowSeats, newSelectedLabels) => {
    const seatStatus = rowSeats.map((seat) => {
      if (occupiedLabels.includes(seat.label)) return "occupied";
      if (newSelectedLabels.includes(seat.label)) return "selected";
      return "empty";
    });

    for (let i = 1; i < seatStatus.length - 1; i++) {
      if (
        seatStatus[i] === "empty" &&
        (seatStatus[i - 1] === "selected" || seatStatus[i - 1] === "occupied") &&
        (seatStatus[i + 1] === "selected" || seatStatus[i + 1] === "occupied")
      ) {
        return true;
      }
    }
    return false;
  };


  // Tạo standardized movie time (improved version)
  const standardizedMovieTime = (() => {
    if (!selectedShowtimeTime || !fullShowtimeDate) {
      console.log("⚠️ Missing time data:", { selectedShowtimeTime, fullShowtimeDate });
      return null;
    }

    console.log("🕐 Input data:", {
      fullShowtimeDate,
      selectedShowtimeTime,
      roomId
    });

    // Thử parse với các format khác nhau
    const cleanDate = fullShowtimeDate.trim();
    const cleanTime = selectedShowtimeTime.trim();

    const attempts = [
      `${cleanDate} ${cleanTime}`,
      `${cleanDate}, ${cleanTime}`,
      `${cleanDate}T${cleanTime}`
    ];

    for (const attempt of attempts) {
      const parsed = dayjs(attempt);
      if (parsed.isValid()) {
        const result = parsed.tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DDTHH:mm");
        console.log(`✅ Parsed successfully: "${attempt}" -> "${result}"`);
        return result;
      }
    }

    console.log("❌ Could not parse time");
    return null;
  })();

  // Lọc ghế occupied theo BOTH suất chiếu và phòng
  const occupiedLabels = occupiedSeats
    ?.filter((os) => {
      // console.log("🔍 Processing occupied seat:", {
      //   seatLabel: os.seatLabel,
      //   showtime: os.showtime,
      //   roomId: os.roomId || 'No roomId in data'
      // });

      // Kiểm tra có showtime không
      if (!os.showtime) {
        // console.log("⚠️ No showtime for seat:", os.seatLabel);
        return false;
      }

      // Kiểm tra có roomId không (nếu API trả về roomId)
      if (os.roomId && os.roomId !== roomId) {
        // console.log(`🏠 Different room: seat ${os.seatLabel} is in room ${os.roomId}, current room is ${roomId}`);
        return false;
      }

      // Kiểm tra standardizedMovieTime có hợp lệ không
      if (!standardizedMovieTime) {
        // console.log("⚠️ Invalid standardizedMovieTime, cannot compare");
        return false;
      }

      try {
        // Convert occupied seat time to Vietnam timezone
        const occupiedTimeVN = dayjs.utc(os.showtime).tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DDTHH:mm");

        // console.log(`🕒 Time comparison for seat ${os.seatLabel}:`);
        // console.log(`   Occupied: "${occupiedTimeVN}"`);
        // console.log(`   Target:   "${standardizedMovieTime}"`);

        const isTimeMatch = occupiedTimeVN === standardizedMovieTime;
        // if (isTimeMatch) {
        //   console.log(`✅ OCCUPIED SEAT FOUND: ${os.seatLabel} for showtime ${standardizedMovieTime}`);
        // }

        return isTimeMatch;

      } catch (error) {
        console.error("❌ Error processing occupied seat time:", error);
        return false;
      }
    })
    .map((os) => os.seatLabel) || [];

  console.log("🎯 FINAL RESULTS for occupied seats:");
  console.log(`   Room ID: ${roomId}`);
  console.log(`   Target showtime: ${standardizedMovieTime}`);
  console.log(`   Total occupied seats in room (raw): ${occupiedSeats?.length || 0}`);
  console.log(`   Occupied seats for this showtime after filtering: ${occupiedLabels.length}`);
  console.log(`   Seat labels for this showtime: [${occupiedLabels.join(', ')}]`);

  const showOccupiedSeatModal = (seatLabel) => {
    notification.warning({
      message: (
        <span className="font-semibold text-red-500 flex items-center gap-2">
          <ExclamationCircleOutlined className="text-red-500" />
          Seat Already Booked
        </span>
      ),
      description: (
        <div className="text-sm text-gray-700 leading-relaxed">
          Seat <strong>{seatLabel}</strong> has already been booked for this showtime.
          <br />
          Please choose a different seat.
        </div>
      ),
      duration: 2,
      placement: 'topRight',
      className: 'custom-notification',
    });
  };



  const handleToggleSeat = (seat) => {
    const isOccupied = occupiedLabels.includes(seat.label);
    if (isOccupied) {
      console.log("🚫 Seat is occupied for this showtime:", seat.label);
      showOccupiedSeatModal(seat.label); // Sử dụng modal thay vì alert
      return;
    }

    setSelectedSeatsState((prev) => {
      const updated = prev.includes(seat.label)
        ? prev.filter((s) => s !== seat.label)
        : [...prev, seat.label];

      const rowSeats = roomData?.seats?.filter((s) => s.row === seat.row).sort((a, b) => a.column - b.column);

      if (hasLonelySeat(rowSeats, updated)) {
        message.destroy(); // Xóa các thông báo cũ
        message.warning("You cannot leave a single empty seat between selected or occupied seats.");
        return prev;
      }

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

    const base = `
      w-10 h-10 text-xs rounded-lg flex items-center justify-center
      font-bold border-2 ${isMobile ? '' : 'transition-all duration-200 transform hover:scale-110 hover:shadow-lg'}
    `;

    if (isOccupied) return `${base} bg-gray-600 text-white border-gray-500 cursor-not-allowed`;
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
      notification.warning({
        message: 'No Seats Selected',
        description: 'Please select at least one seat to continue.',
        placement: 'topRight'
      });
      return;
    }

    // Kiểm tra xem thông tin user có đủ không trước khi điều hướng
    if (!user || !user.role) {
      notification.error({
        message: 'User Information Missing',
        description: 'Cannot proceed. User information is not available. Please log in again.',
        placement: 'topRight'
      });
      console.error("🔴 User information missing when attempting to continue from SeatSelection:", user);
      // Có thể điều hướng về trang đăng nhập hoặc trang trước đó
      // navigate('/employee/login');
      return;
    }

    navigate("/employee/counter-combo", {
      state: {
        movieDetails,
        selectedShowtimeTime,
        fullShowtimeDate,
        selectedSeats: roomData.seats.filter(seat => selectedSeatsState.includes(seat.label)),
        ticketPrice: calculateTotalTicketPrice(),
        userInformation: user, // <-- Truyền user từ Redux store
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
              <div className="w-4 h-4 bg-slate-500 rounded-lg border-2 border-slate-600" />
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