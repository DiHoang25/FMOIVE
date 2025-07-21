import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Save, Users, Crown, Monitor, MapPin, DollarSign } from "lucide-react"
import SidebarLayout from "../../components/Sidebar-Admin"
import { Modal, message } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useMediaQuery } from "react-responsive";
import { useDispatch } from "react-redux";


const CinemaRoomDetail = () => {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const [roomData, setRoomData] = useState(null)
  const [selectMode, setSelectMode] = useState("single"); // "single" | "row"
  const [selectedRows, setSelectedRows] = useState([]); // Chọn theo hàng
  const [selectedSeats, setSelectedSeats] = useState([]); // chỉ dùng cho chế độ "single"
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const dispatch = useDispatch();

  const [selectedSeatsState, setSelectedSeatsState] = useState(
    selectedSeats || []
  );

  
  // Fetch room data from API
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/theater/rooms/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Lỗi khi fetch dữ liệu phòng");
        setRoomData(data.room);
      } catch (err) {
        Modal.error({ title: "Lỗi", content: err.message });
      }
    };

    fetchRoom();
  }, [roomId]);

  const toggleSeatOrRow = (seat) => {
    if (selectMode === "row") {
      const rowNumber = seat.row;
      setSelectedRows((prev) =>
        prev.includes(rowNumber)
          ? prev.filter((r) => r !== rowNumber)
          : [...prev, rowNumber]
      );
    } else {
      setSelectedSeats((prev) =>
        prev.includes(seat.label)
          ? prev.filter((s) => s !== seat.label)
          : [...prev, seat.label]
      );
    }
  };


  const toggleRow = (rowNumber) => {
    setSelectedRows((prev) =>
      prev.includes(rowNumber)
        ? prev.filter((r) => r !== rowNumber)
        : [...prev, rowNumber]
    );
  };



  const getSeatClass = (seat) => {
    const isSelected =
      (selectMode === "row" && selectedRows.includes(seat.row)) ||
      (selectMode === "single" && selectedSeats.includes(seat.label));

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





  const handleBack = () => navigate(-1)

  const getTotalPrice = () => {
    if (!roomData) return 0;

    if (selectMode === "row") {
      return roomData.seats
        .filter((seat) => selectedRows.includes(seat.row))
        .reduce((total, seat) => total + seat.price, 0);
    } else {
      return roomData.seats
        .filter((seat) => selectedSeats.includes(seat.label))
        .reduce((total, seat) => total + seat.price, 0);
    }
  };


  const fetchAndRefreshRoom = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:5000/api/theater/rooms/${roomId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setRoomData(data.room);
  };

  const handleConvertToVIP = () => {
  const vipCount = selectedRows.length;
  if (vipCount === 0) return;

  const selectedRowLabels = selectedRows.map(r => String.fromCharCode(64 + Number(r))).join(", ");

  Modal.confirm({
    title: 'Xác nhận chuyển VIP',
    icon: <ExclamationCircleFilled />,
    content: `Bạn có chắc muốn chuyển hàng [${selectedRowLabels}] thành ghế VIP?`,
    okText: 'Xác nhận',
    cancelText: 'Hủy',
    okType: 'primary',
    okButtonProps: {
      style: {
        backgroundColor: '#f59e0b',
        color: 'white',
        borderColor: '#f59e0b',
      },
    },
    onOk: async () => {
      try {
        const token = localStorage.getItem("token");

        // ✅ Tìm giá ghế thường (lấy từ 1 ghế bất kỳ)
        const currentNormalPrice = roomData.seats.find(s => s.type === "Normal")?.price || 90000;

        // ✅ Tìm giá ghế VIP từ `roomData` nếu có
        // Nếu chưa có ghế VIP, dùng fallback `roomData.seats[0].vipPrice` nếu bạn đã lưu theo dạng này
        const currentVIPPrice =
          roomData.seats.find(s => s.type === "VIP")?.price ||
          roomData.vipPrice || 600000; // fallback cuối nếu không có gì

        const currentVIP = roomData.seats.filter(s => s.type === "VIP").map(s => s.label);
        const newVIP = roomData.seats.filter(s => selectedRows.includes(s.row)).map(s => s.label);
        const updatedVIP = Array.from(new Set([...currentVIP, ...newVIP]));
        const updatedNormal = roomData.seats.map(s => s.label).filter(l => !updatedVIP.includes(l));

        const res = await fetch(`http://localhost:5000/api/theater/rooms/${roomId}/update-seat-types`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            vipSeats: updatedVIP,
            normalSeats: updatedNormal,
            vipPrice: currentVIPPrice,
            normalPrice: currentNormalPrice,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Cập nhật thất bại");

        message.success("Đã chuyển thành công hàng sang VIP.");
        setSelectedRows([]);
        await fetchAndRefreshRoom();
      } catch (err) {
        message.error(`Lỗi khi cập nhật: ${err.message}`);
      }
    },
  });
};




  const handleSave = async () => {
  try {
    const token = localStorage.getItem("token");

    const vipSeats = roomData.seats
      .filter((seat) => selectedRows.includes(seat.row))
      .map((seat) => seat.label);

    const normalSeats = roomData.seats
      .filter((seat) => !selectedRows.includes(seat.row))
      .map((seat) => seat.label);

    // 👇 Lấy giá từ roomData thay vì hardcode
    const currentNormalPrice = roomData.seats.find(s => s.type === "Normal")?.price || 90000;
    const currentVIPPrice = roomData.seats.find(s => s.type === "VIP")?.price || 150000;

    const res = await fetch(`http://localhost:5000/api/theater/rooms/${roomId}/update-seat-types`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        vipSeats,
        normalSeats,
        vipPrice: currentVIPPrice,
        normalPrice: currentNormalPrice,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Lưu thất bại");

    alert("Đã lưu lựa chọn ghế VIP thành công!");
    setSelectedRows([]);

    // Refetch lại dữ liệu phòng
    const updated = await fetch(`http://localhost:5000/api/theater/rooms/${roomId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const updatedData = await updated.json();
    setRoomData(updatedData.room);
  } catch (err) {
    console.error("❌ Lỗi khi lưu:", err.message);
    alert("Lưu thất bại!");
  }
};


  const handleConvertToNormal = () => {
    const selectedRowLabels = selectedRows.map(r => String.fromCharCode(64 + Number(r))).join(", ");
    const currentNormalPrice = roomData.seats.find(s => s.type === "Normal")?.price || 90000;
    const currentVIPPrice = roomData.seats.find(s => s.type === "VIP")?.price || 150000;

    Modal.confirm({
      title: 'Xác nhận chuyển về ghế thường',
      icon: <ExclamationCircleFilled />,
      content: `Bạn có chắc muốn chuyển hàng [${selectedRowLabels}] thành ghế thường không?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      okType: 'danger',
      okButtonProps: {
        style: {
          backgroundColor: '#dc2626', // Tailwind red-600
          color: 'white',
          borderColor: '#dc2626',
        },
      },
      onOk: async () => {
        try {
          const token = localStorage.getItem("token");

          // Lấy danh sách ghế VIP hiện tại từ dữ liệu
          const currentVIPSeats = roomData.seats
            .filter((s) => s.type === "VIP")
            .map((s) => s.label);

          // Lấy danh sách ghế thuộc hàng đang chọn (muốn gỡ khỏi VIP)
          const toBeNormalSeats = roomData.seats
            .filter((s) => selectedRows.includes(s.row))
            .map((s) => s.label);

          // Danh sách VIP sau khi loại bỏ các ghế chuyển về thường
          const updatedVIPSeats = currentVIPSeats.filter(
            (label) => !toBeNormalSeats.includes(label)
          );

          const res = await fetch(
            `http://localhost:5000/api/theater/rooms/${roomId}/update-seat-types`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            body: JSON.stringify({
              vipSeats: updatedVIPSeats,
              normalSeats: toBeNormalSeats,
              vipPrice: currentVIPPrice,     // ✅ dùng giá hiện tại
              normalPrice: currentNormalPrice, // ✅ dùng giá hiện tại
            }),
              
            }
          );

          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Cập nhật thất bại");

          message.success("Đã chuyển thành công hàng sang ghế thường.");
          setSelectedRows([]);

          // Refetch lại dữ liệu phòng
          const updated = await fetch(`http://localhost:5000/api/theater/rooms/${roomId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const updatedData = await updated.json();
          setRoomData(updatedData.room);
        } catch (err) {
          console.error("❌ Lỗi:", err.message);
          message.error(`Cập nhật thất bại: ${err.message}`);
        }
      },
    });
  };



  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <h2 className="text-2xl font-bold">Cinema Room Management</h2>
              <div className="w-20"></div> {/* Spacer for centering */}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Selected Seats</p>
                    <p className="text-2xl font-bold text-white">{selectedRows.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Total Price</p>
                    <p className="text-2xl font-bold text-white">{getTotalPrice().toLocaleString()} VND</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <MapPin className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Room ID</p>
                    <p className="text-2xl font-bold text-white">#{roomId}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 shadow-2xl">
            {/* Screen */}
            <div className="mb-8">
              <div className="flex items-center justify-center mb-4">
                <Monitor className="w-6 h-6 text-slate-400 mr-2" />
                <span className="text-slate-400 text-sm font-medium">SCREEN</span>
              </div>
              <div className="relative">
                <div className="h-2 bg-gradient-to-r from-transparent via-white to-transparent rounded-full mb-2 opacity-80"></div>
                <div className="h-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent rounded-full opacity-60"></div>
              </div>
              <p className="text-center text-slate-400 text-sm mt-2">This way to screen</p>
            </div>
            <div className="mb-6 flex justify-center gap-4">
              <button
                className={`px-4 py-2 rounded-lg font-semibold ${selectMode === "single"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-600 text-slate-300"
                  }`}
                onClick={() => setSelectMode("single")}
              >
                Single
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-semibold ${selectMode === "row"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-600 text-slate-300"
                  }`}
                onClick={() => setSelectMode("row")}
              >
                Multiple
              </button>
            </div>


            {/* Seat Grid */}
            {roomData ? (
            isMobile ? (
              <div className="relative w-full overflow-hidden rounded-lg border border-gray-600">
                <TransformWrapper
                  initialScale={0.8}
                  minScale={0.5}
                  maxScale={2}
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
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-center text-slate-300">Seating chart </h3>
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
            </div>

            <div className="flex justify-center mt-6 mb-8">
              <button
                disabled={selectedRows.length === 0}
                onClick={handleConvertToVIP}
                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg shadow-lg mx-2"
              >
                Convert to VIP
              </button>

              <button
                disabled={selectedRows.length === 0}
                onClick={handleConvertToNormal}
                className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-black font-bold rounded-lg shadow-lg mx-2"
              >
                Convert to Normal
              </button>
            </div>




            {/* Pricing Info */}
            {roomData && (
              <div className="mb-8">
                <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                  <h3 className="text-lg font-semibold mb-4 text-center text-slate-300">Pricing Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(() => {
                      const normalSeat = roomData.seats.find((seat) => seat.type === "Normal")
                      const vipSeat = roomData.seats.find((seat) => seat.type === "VIP")
                      return (
                        <>
                          {normalSeat && (
                            <div className="flex items-center justify-between p-3 bg-slate-600/50 rounded-lg">
                              <span className="text-slate-300 font-medium">Normal Seats</span>
                              <span className="text-green-400 font-bold text-lg">
                                {normalSeat.price.toLocaleString()} VND
                              </span>
                            </div>
                          )}
                          {vipSeat && (
                            <div className="flex items-center justify-between p-3 bg-slate-600/50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Crown className="w-4 h-4 text-amber-400" />
                                <span className="text-slate-300 font-medium">VIP Seats</span>
                              </div>
                              <span className="text-amber-400 font-bold text-lg">
                                {vipSeat.price.toLocaleString()} VND
                              </span>
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {/* <div className="flex justify-center gap-4">
              <button
                onClick={handleSave}
                disabled={selectedRows.length === 0}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div> */}
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default CinemaRoomDetail
