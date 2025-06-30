import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Save, Users, Crown, Monitor, MapPin, DollarSign } from "lucide-react"
import SidebarLayout from "../../components/Sidebar-Admin"

const CinemaRoomDetail = () => {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const [roomData, setRoomData] = useState(null)
  const [selectedSeats, setSelectedSeats] = useState([])

  // Fetch room data from API
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`http://localhost:5000/api/theater/rooms/${roomId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || "Lỗi khi fetch dữ liệu phòng")
        setRoomData(data.room)
      } catch (err) {
        console.error("❌ Lỗi khi tải dữ liệu phòng:", err.message)
      }
    }

    fetchRoom()
  }, [roomId])

  const toggleSeat = (seatLabel) => {
    setSelectedSeats((prev) => (prev.includes(seatLabel) ? prev.filter((s) => s !== seatLabel) : [...prev, seatLabel]))
  }

  const getSeatClass = (seat) => {
    const isSelected = selectedSeats.includes(seat.label)
    const baseClasses =
      "w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-200 transform hover:scale-110 hover:shadow-lg border-2"

    if (isSelected) {
      return `${baseClasses} bg-gradient-to-br from-red-500 to-red-600 text-white border-red-400 shadow-lg scale-105`
    }

    if (seat.type === "VIP") {
      return `${baseClasses} bg-gradient-to-br from-amber-400 to-yellow-500 text-gray-900 border-amber-300 hover:from-amber-300 hover:to-yellow-400`
    }

    return `${baseClasses} bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 border-gray-300 hover:from-gray-50 hover:to-gray-100`
  }

  const handleSave = () => {
    console.log("Selected seats:", selectedSeats)
    alert("Seats saved successfully!")
    setSelectedSeats([])
  }

  const handleBack = () => navigate(-1)

  const getTotalPrice = () => {
    if (!roomData) return 0
    return selectedSeats.reduce((total, seatLabel) => {
      const seat = roomData.seats.find((s) => s.label === seatLabel)
      return total + (seat ? seat.price : 0)
    }, 0)
  }

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
                    <p className="text-2xl font-bold text-white">{selectedSeats.length}</p>
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
                    <p className="text-2xl font-bold text-white">${getTotalPrice().toLocaleString()}</p>
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

            {/* Seat Grid */}
            {roomData ? (
              <div className="mb-8">
                <div className="space-y-3 max-w-4xl mx-auto">
                  {[...Array(roomData.rows)].map((_, rIdx) => {
                    const rowLetter = String.fromCharCode(65 + rIdx)
                    const rowSeats = roomData.seats.filter((s) => Number(s.row) === rIdx + 1)

                    return (
                      <div key={rowLetter} className="flex items-center justify-center gap-2">
                        <div className="w-8 flex items-center justify-center">
                          <span className="text-slate-400 font-bold text-sm">{rowLetter}</span>
                        </div>

                        <div className="flex gap-2 justify-center">
                          {[...Array(roomData.columns)].map((_, cIdx) => {
                            const seat = rowSeats.find((s) => Number(s.column) === cIdx + 1)
                            return seat ? (
                              <button
                                key={seat.label}
                                onClick={() => toggleSeat(seat.label)}
                                title={`Seat ${seat.label} - ${seat.type} - $${seat.price.toLocaleString()}`}
                                className={getSeatClass(seat)}
                              >
                                {seat.type === "VIP" && <Crown className="w-3 h-3" />}
                                {seat.type === "Normal" && seat.label}
                              </button>
                            ) : (
                              <div key={`empty-${cIdx}`} className="w-10 h-10" />
                            )
                          })}
                        </div>

                        <div className="w-8 flex items-center justify-center">
                          <span className="text-slate-400 font-bold text-sm">{rowLetter}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="ml-4 text-slate-400">Loading room data...</p>
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
                                ${normalSeat.price.toLocaleString()}
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
                                ${vipSeat.price.toLocaleString()}
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
            <div className="flex justify-center gap-4">
              <button
                onClick={handleSave}
                disabled={selectedSeats.length === 0}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <Save className="w-4 h-4" />
                Save Selection
              </button>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default CinemaRoomDetail
