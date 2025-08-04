import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Save, Users, Crown, Monitor, MapPin, DollarSign } from "lucide-react"
import SidebarLayout from "../../components/Sidebar-Admin"
import { Modal, message, Card, Spin, Result, Divider } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { motion } from 'framer-motion';

const CinemaRoomDetail = () => {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const [roomData, setRoomData] = useState(null)
  const [selectMode, setSelectMode] = useState("single"); // "single" | "row"
  const [selectedRows, setSelectedRows] = useState([]); // Chọn theo hàng
  const [selectedSeats, setSelectedSeats] = useState([]); // chỉ dùng cho chế độ "single"
  const [error, setError] = useState('');

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
        setError(err.message);
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

  const getSeatClass = (seat) => {
    const isSelected =
      (selectMode === "row" && selectedRows.includes(seat.row)) ||
      (selectMode === "single" && selectedSeats.includes(seat.label));

    const baseClasses =
      "w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-300 transform hover:scale-110 hover:shadow-lg border-2";

    if (isSelected) {
      return `${baseClasses} bg-gradient-to-br from-red-500 to-red-600 text-white border-red-400 shadow-lg scale-105`;
    }

    if (seat.type === "VIP") {
      return `${baseClasses} bg-gradient-to-br from-amber-400 to-yellow-500 text-gray-900 border-amber-300`;
    }

    return `${baseClasses} bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 border-gray-300`;
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
  const hasSelection = selectMode === 'row' ? selectedRows.length > 0 : selectedSeats.length > 0;
  if (!hasSelection) return;

  const labelString = selectMode === 'row'
    ? selectedRows.map(r => String.fromCharCode(64 + Number(r))).join(", ")
    : selectedSeats.join(", ");

  Modal.confirm({
    title: 'Xác nhận chuyển VIP',
    icon: <ExclamationCircleFilled />,
    content: `Bạn có chắc muốn chuyển ${selectMode === 'row' ? `hàng [${labelString}]` : `ghế [${labelString}]`} thành ghế VIP?`,
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
        const currentNormalPrice = roomData.seats.find(s => s.type === "Normal")?.price || 90000;
        const currentVIPPrice = roomData.seats.find(s => s.type === "VIP")?.price || roomData.vipPrice || 600000;

        const currentVIP = roomData.seats.filter(s => s.type === "VIP").map(s => s.label);
        const newVIP = selectMode === 'row'
          ? roomData.seats.filter(s => selectedRows.includes(s.row)).map(s => s.label)
          : selectedSeats;

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

        message.success("Successfully transferred to VIP seat.");
        setSelectedRows([]);
        setSelectedSeats([]);
        await fetchAndRefreshRoom();
      } catch (err) {
        message.error(`Lỗi khi cập nhật: ${err.message}`);
      }
    },
  });
};


const handleConvertToNormal = () => {
  const hasSelection = selectMode === 'row' ? selectedRows.length > 0 : selectedSeats.length > 0;
  if (!hasSelection) return;

  const labelString = selectMode === 'row'
    ? selectedRows.map(r => String.fromCharCode(64 + Number(r))).join(", ")
    : selectedSeats.join(", ");

  Modal.confirm({
    title: 'Xác nhận chuyển về ghế thường',
    icon: <ExclamationCircleFilled />,
    content: `Bạn có chắc muốn chuyển ${selectMode === 'row' ? `hàng [${labelString}]` : `ghế [${labelString}]`} thành ghế thường không?`,
    okText: 'Xác nhận',
    cancelText: 'Hủy',
    okType: 'danger',
    okButtonProps: {
      style: {
        backgroundColor: '#dc2626',
        color: 'white',
        borderColor: '#dc2626',
      },
    },
    onOk: async () => {
      try {
        const token = localStorage.getItem("token");
        const currentNormalPrice = roomData.seats.find(s => s.type === "Normal")?.price || 90000;
        const currentVIPPrice = roomData.seats.find(s => s.type === "VIP")?.price || 150000;

        const currentVIPSeats = roomData.seats
          .filter((s) => s.type === "VIP")
          .map((s) => s.label);

        const toBeNormalSeats = selectMode === 'row'
          ? roomData.seats.filter(s => selectedRows.includes(s.row)).map(s => s.label)
          : selectedSeats;

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
              vipPrice: currentVIPPrice,
              normalPrice: currentNormalPrice,
            }),
          }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Cập nhật thất bại");

        message.success("Successfully transferred to normal seat.");
        setSelectedRows([]);
        setSelectedSeats([]);
        await fetchAndRefreshRoom();
      } catch (err) {
        message.error(`Cập nhật thất bại: ${err.message}`);
      }
    },
  });
};


  if (error) {
    return (
      <SidebarLayout>
        <Result status="error" title="Error" subTitle={error} />
      </SidebarLayout>
    );
  }

  if (!roomData) {
    return (
      <SidebarLayout>
        <div className="flex justify-center items-center min-h-[70vh] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
          <Spin size="large" data-testid="loading-spinner" />
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between mb-6"
            >
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3 bg-slate-800/70 hover:bg-slate-700/70 rounded-xl transition-all duration-300 backdrop-blur-sm border border-slate-600/40 hover:border-slate-500/60 hover:scale-105 shadow-lg"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
                <span className="text-white font-medium">Back</span>
              </button>

              <h1 className="text-3xl md:text-4xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Cinema Room Management
              </h1>

              <div className="w-24"></div> {/* Spacer for centering */}
            </motion.div>
          </div>

          {/* Stats Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {[
              {
                icon: <Users className="w-6 h-6 text-white" />,
                label: 'Selected Rows',
                value: selectedRows.length,
                color: 'from-blue-500 to-blue-600',
                textColor: 'text-blue-300',
              },
              {
                icon: <DollarSign className="w-6 h-6 text-white" />,
                label: 'Total Price',
                value: `${getTotalPrice().toLocaleString()} VND`,
                color: 'from-green-500 to-green-600',
                textColor: 'text-green-300',
              },
              {
                icon: <MapPin className="w-6 h-6 text-white" />,
                label: 'Room ID',
                value: `#${roomId}`,
                color: 'from-purple-500 to-purple-600',
                textColor: 'text-purple-300',
              },
            ].map((card, idx) => (
              <Card
                key={idx}
                className="bg-slate-800/80 border border-slate-600/50 backdrop-blur-sm transition-all duration-300 hover:border-opacity-50 hover:scale-105"
                style={{ borderRadius: '16px' }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${card.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    {card.icon}
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm font-medium">{card.label}</p>
                    <p className={`${card.textColor} font-bold text-lg`}>{card.value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </motion.div>

          {/* Main Content Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <Card
              className="w-full bg-slate-800/70 backdrop-blur-lg border border-slate-600/40 shadow-2xl overflow-visible"
              style={{ borderRadius: '20px' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/8 via-transparent to-cyan-600/8 pointer-events-none" />
              <div className="relative p-6 lg:p-8">

                {/* Screen */}
                <motion.div
                  className="mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <div className="flex items-center justify-center mb-6">
                    <div className="flex items-center gap-3 px-6 py-3 bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-600/30">
                      <Monitor className="w-6 h-6 text-blue-400" />
                      <span className="text-slate-300 text-lg font-semibold">SCREEN</span>
                    </div>
                  </div>
                  <div className="relative max-w-4xl mx-auto">
                    <div className="h-3 bg-gradient-to-r from-transparent via-white to-transparent rounded-full mb-3 opacity-90 shadow-lg"></div>
                    <div className="h-2 bg-gradient-to-r from-transparent via-slate-300 to-transparent rounded-full opacity-70"></div>
                  </div>
                  <p className="text-center text-slate-400 text-sm mt-4">This way to screen</p>
                </motion.div>

                {/* Mode Selection */}
                <motion.div
                  className="mb-8 flex justify-center gap-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <button
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg ${selectMode === "single"
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white border-2 border-blue-400"
                        : "bg-slate-700/70 text-slate-300 border-2 border-slate-600/50 hover:bg-slate-600/70"
                      }`}
                    onClick={() => setSelectMode("single")}
                  >
                    Single Selection
                  </button>
                  <button
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg ${selectMode === "row"
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white border-2 border-blue-400"
                        : "bg-slate-700/70 text-slate-300 border-2 border-slate-600/50 hover:bg-slate-600/70"
                      }`}
                    onClick={() => setSelectMode("row")}
                  >
                    Row Selection
                  </button>
                </motion.div>

                {/* Seat Grid */}
                <motion.div
                  className="mb-8"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <div className="bg-slate-900/30 backdrop-blur-sm rounded-2xl p-8 border border-slate-600/30">
                    <div className="space-y-4 max-w-5xl mx-auto">
                      {[...Array(roomData.rows)].map((_, rIdx) => {
                        const rowLetter = String.fromCharCode(65 + rIdx)
                        const rowSeats = roomData.seats.filter((s) => Number(s.row) === rIdx + 1)

                        return (
                          <motion.div
                            key={rowLetter}
                            className="flex items-center justify-center gap-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.7 + rIdx * 0.1 }}
                          >
                            <div className="w-10 flex items-center justify-center">
                              <span className="text-slate-300 font-bold text-lg bg-slate-700/50 rounded-lg px-2 py-1">
                                {rowLetter}
                              </span>
                            </div>

                            <div className="flex gap-3 justify-center">
                              {[...Array(roomData.columns)].map((_, cIdx) => {
                                const seat = rowSeats.find((s) => Number(s.column) === cIdx + 1)
                                return seat ? (
                                  <button
                                    key={seat.label}
                                    onClick={() => toggleSeatOrRow(seat)}
                                    title={`Seat ${seat.label} - ${seat.type} - ${seat.price.toLocaleString()} VND`}
                                    className={getSeatClass(seat)}
                                  >
                                    {seat.type === "VIP" && <Crown className="w-4 h-4" />}
                                    {seat.type === "Normal" && <span className="text-xs">{seat.label}</span>}
                                  </button>
                                ) : (
                                  <div key={`empty-${cIdx}`} className="w-10 h-10" />
                                )
                              })}
                            </div>

                            <div className="w-10 flex items-center justify-center">
                              <span className="text-slate-300 font-bold text-lg bg-slate-700/50 rounded-lg px-2 py-1">
                                {rowLetter}
                              </span>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>

                {/* Legend */}
                <motion.div
                  className="mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <div className="bg-slate-900/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30">
                    <h3 className="text-xl font-bold mb-6 text-center text-white">Seating Chart Legend</h3>
                    <Divider className="border-slate-600/50 my-4" />
                    <div className="flex justify-center gap-8 flex-wrap">
                      {[
                        { color: "bg-gradient-to-br from-red-500 to-red-600 border-red-400", label: "Selected", icon: null },
                        { color: "bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300", label: "Normal", icon: null },
                        { color: "bg-gradient-to-br from-amber-400 to-yellow-500 border-amber-300", label: "VIP", icon: <Crown className="w-3 h-3 text-gray-900" /> },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className={`w-8 h-8 ${item.color} rounded-lg border-2 flex items-center justify-center shadow-lg`}>
                            {item.icon}
                          </div>
                          <span className="text-slate-300 text-sm font-medium">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  className="flex justify-center gap-4 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                >
                  <button
                    disabled={
                      (selectMode === "row" && selectedRows.length === 0) ||
                      (selectMode === "single" && selectedSeats.length === 0)
                    }
                    onClick={handleConvertToVIP}
                    className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-black font-bold rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    Convert to VIP
                  </button>

                  <button
                    disabled={
                      (selectMode === "row" && selectedRows.length === 0) ||
                      (selectMode === "single" && selectedSeats.length === 0)
                    }
                    onClick={handleConvertToNormal}
                    className="px-8 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    Convert to Normal
                  </button>
                </motion.div>


                {/* Pricing Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                >
                  <div className="bg-slate-900/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30">
                    <h3 className="text-xl font-bold mb-6 text-center text-white flex items-center justify-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                        <DollarSign className="text-white text-sm" />
                      </div>
                      Pricing Information
                    </h3>
                    <Divider className="border-slate-600/50 my-6" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {(() => {
                        const normalSeat = roomData.seats.find((seat) => seat.type === "Normal")
                        const vipSeat = roomData.seats.find((seat) => seat.type === "VIP")
                        return (
                          <>
                            {normalSeat && (
                              <motion.div
                                className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-slate-600/20 transition-all duration-300 hover:scale-105"
                                whileHover={{ scale: 1.02 }}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                    <Users className="w-5 h-5 text-white" />
                                  </div>
                                  <span className="text-slate-300 font-semibold">Normal Seats</span>
                                </div>
                                <span className="text-green-400 font-bold text-lg">
                                  {normalSeat.price.toLocaleString()} VND
                                </span>
                              </motion.div>
                            )}
                            {vipSeat && (
                              <motion.div
                                className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-slate-600/20 transition-all duration-300 hover:scale-105"
                                whileHover={{ scale: 1.02 }}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-lg flex items-center justify-center">
                                    <Crown className="w-5 h-5 text-white" />
                                  </div>
                                  <span className="text-slate-300 font-semibold">VIP Seats</span>
                                </div>
                                <span className="text-amber-400 font-bold text-lg">
                                  {vipSeat.price.toLocaleString()} VND
                                </span>
                              </motion.div>
                            )}
                          </>
                        )
                      })()}
                    </div>
                  </div>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </SidebarLayout>
  )
}

export default CinemaRoomDetail