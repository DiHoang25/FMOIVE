"use client"

import { useState, useEffect } from "react"
import { Modal } from "antd"
import axios from "axios"
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CreditCard,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  RefreshCw,
  Ticket,
  AlertCircle,
  Loader2,
} from "lucide-react"
import UserDashboardLayout from "../../components/UserDashboardlayout"
import PaginationControls from "../../components/PaginationHomepage"
import avengers from "../../assets/avengers.jpg"

const ITEMS_PER_PAGE = 4

const formatCurrency = (amount) => {
  const number = Number(amount);
  return !isNaN(number) ? `${number.toLocaleString("vi-VN")} VND` : "Không xác định";
};



const generateCaptcha = (length = 6) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

const ViewsBookedTicket = () => {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [viewModal, setViewModal] = useState(null)
  const [cancelModal, setCancelModal] = useState(null)
  const [success, setSuccess] = useState(false)
  const [captcha, setCaptcha] = useState(generateCaptcha())
  const [inputCaptcha, setInputCaptcha] = useState("")
  const [captchaError, setCaptchaError] = useState("")

  useEffect(() => {
    const fetchBookedTickets = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("Người dùng chưa xác thực. Vui lòng đăng nhập lại.")
        }

        const response = await axios.get("http://localhost:5000/api/feature/my-bookings", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setTickets(response.data)
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || "Không thể tải danh sách vé."
        setError(errorMessage)
        console.error("Lỗi khi tải vé:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchBookedTickets()
  }, [])


  const maxPage = Math.ceil(tickets.length / ITEMS_PER_PAGE) - 1
  const currentTickets = tickets.slice(pageIndex * ITEMS_PER_PAGE, (pageIndex + 1) * ITEMS_PER_PAGE)

  // Loading Component
  const LoadingComponent = () => (
    <UserDashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-red-500 animate-spin mx-auto" />
          <h3 className="text-xl font-semibold text-white">Đang tải danh sách vé</h3>
          <p className="text-gray-400">Vui lòng chờ trong giây lát...</p>
        </div>
      </div>
    </UserDashboardLayout>
  )

  // Error Component
  const ErrorComponent = () => (
    <UserDashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-8">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h3 className="text-2xl font-bold text-white">Có lỗi xảy ra</h3>
          <p className="text-red-400 bg-red-900/20 p-4 rounded-lg border border-red-800">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
          >
            Thử lại
          </button>
        </div>
      </div>
    </UserDashboardLayout>
  )

  // Empty State Component
  const EmptyState = () => (
    <div className="col-span-full flex flex-col items-center justify-center py-16 space-y-6">
      <div className="relative">
        <Ticket className="w-24 h-24 text-gray-600" />
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
          <XCircle className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-white">Chưa có vé nào</h3>
        <p className="text-gray-400 max-w-md">
          Bạn chưa đặt vé nào cả. Hãy khám phá các bộ phim đang chiếu và đặt vé ngay!
        </p>
      </div>
      <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
        Đặt vé ngay
      </button>
    </div>
  )

  if (loading) return <LoadingComponent />
  if (error) return <ErrorComponent />

  return (
    <UserDashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-3 mb-4">
              <Ticket className="w-8 h-8 text-red-500" />
              <h1 className="text-4xl font-bold text-white">Booked Tickets</h1>
            </div>
            <p className="text-gray-400 text-lg">Manage and track your movie tickets</p>
            <div className="w-24 h-1 bg-red-600 mx-auto mt-4 rounded-full"></div>
          </div>

          {/* Tickets Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[400px]">
            {tickets.length === 0 ? (
              <EmptyState />
            ) : (
              currentTickets.map((ticket, idx) => (
                <div
                  key={ticket.id || idx}
                  className="group bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl overflow-hidden shadow-2xl hover:shadow-red-500/10 transition-all duration-300 transform hover:-translate-y-2"
                >
                  {/* Ticket Header */}
                  <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="relative z-10">
                      <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{ticket.movie}</h3>
                      <div className="flex items-center space-x-2 text-red-100">
                        <Ticket className="w-4 h-4" />
                        <span className="text-sm font-medium">#{ticket.id}</span>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Content */}
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3 text-gray-300">
                        <Calendar className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Release date</p>
                          <p className="font-semibold text-white">{ticket.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 text-gray-300">
                        <Clock className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Showtime</p>
                          <p className="font-semibold text-white">{ticket.time}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3 text-gray-300">
                        <Users className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Seat</p>
                          <p className="font-semibold text-white">{ticket.seats}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 text-gray-300">
                        <MapPin className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Cinema Room</p>
                          <p className="font-semibold text-white">{ticket.roomName}</p>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                      <div className="flex items-center space-x-2">
                        {ticket.status === "CONFIRMED" ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Clock className="w-5 h-5 text-yellow-500" />
                        )}
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            ticket.status === "CONFIRMED"
                              ? "bg-green-900/30 text-green-400 border border-green-800"
                              : "bg-yellow-900/30 text-yellow-400 border border-yellow-800"
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={() => setViewModal(ticket)}
                        className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 group"
                      >
                        <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span>More Details</span>
                      </button>
                      
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {tickets.length > ITEMS_PER_PAGE && (
            <div className="mt-12 flex justify-center">
              <PaginationControls
                currentPage={pageIndex}
                totalPages={Math.ceil(tickets.length / ITEMS_PER_PAGE)}
                onPageChange={setPageIndex}
              />
            </div>
          )}
        </div>
      </div>

      {/* View Details Modal */}
      <Modal
        open={!!viewModal}
        onCancel={() => setViewModal(null)}
        footer={null}
        centered
        width={800}
        className="custom-modal"
      >
        {viewModal && (
          <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Movie Poster */}
              <div className="flex-shrink-0">
                <img
                  src={avengers || "/placeholder.svg"}
                  alt="Poster"
                  className="w-64 h-96 rounded-xl object-cover shadow-2xl border-2 border-gray-700"
                />
              </div>

              {/* Movie Details */}
              <div className="flex-1 space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{viewModal.movie}</h2>
                  <div className="w-16 h-1 bg-red-600 rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="text-gray-400 text-sm">Release date</p>
                        <p className="text-white font-semibold">{viewModal.date}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="text-gray-400 text-sm">Showtime</p>
                        <p className="text-white font-semibold">{viewModal.time}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="text-gray-400 text-sm">Cinema Room</p>
                        <p className="text-white font-semibold">{viewModal.roomName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="text-gray-400 text-sm">Seat</p>
                        <p className="text-white font-semibold">{viewModal.seats}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="text-gray-400 text-sm">Booking date</p>
                        <p className="text-white font-semibold">{viewModal.bookingDate}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="text-gray-400 text-sm">Total Price</p>
                        <p className="text-white font-semibold text-lg">
  {formatCurrency(
    typeof viewModal.ticketPrice === "string"
      ? viewModal.ticketPrice.replace(/[^\d.-]/g, "")
      : viewModal.ticketPrice
  )}
</p>

                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="text-gray-400 text-sm">Duration</p>
                      <p className="text-white font-semibold">{viewModal.duration}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setViewModal(null)}
              className="mt-8 w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.02]"
            >
              Đóng
            </button>
          </div>
        )}
      </Modal>

      {/* Cancel Ticket Modal */}
      <Modal open={!!cancelModal && !success} onCancel={() => setCancelModal(null)} footer={null} centered width={500}>
        <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Xác nhận hủy vé</h3>
              <p className="text-gray-400">Bạn có chắc chắn muốn hủy vé này không?</p>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 space-y-4">
              <div className="text-left">
                <label className="block text-sm font-medium text-gray-300 mb-2">Nhập mã xác thực:</label>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 bg-gray-700 px-4 py-3 font-mono rounded-lg text-white text-center text-lg tracking-widest select-none border border-gray-600">
                    {captcha}
                  </div>
                  <button
                    onClick={() => setCaptcha(generateCaptcha())}
                    className="p-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Tải lại mã"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
                <input
                  type="text"
                  value={inputCaptcha}
                  onChange={(e) => setInputCaptcha(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 px-4 py-3 rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                  placeholder="Nhập mã ở trên"
                />
                {captchaError && (
                  <p className="text-red-400 text-sm mt-2 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{captchaError}</span>
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                if (inputCaptcha.toLowerCase() !== captcha.toLowerCase()) {
                  setCaptchaError("Mã xác thực không chính xác.")
                  return
                }
                setSuccess(true)
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.02]"
            >
              Xác nhận hủy vé
            </button>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        open={success}
        onCancel={() => {
          setSuccess(false)
          setCancelModal(null)
          window.location.reload()
        }}
        footer={null}
        centered
        width={450}
      >
        <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl text-center">
          <div className="w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>

          <h3 className="text-2xl font-bold text-white mb-4">Hủy vé thành công!</h3>

          <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 mb-6">
            <p className="text-green-400 text-sm">
              80% giá trị vé sẽ được hoàn lại vào tài khoản của bạn trong vài ngày tới.
            </p>
          </div>

          <button
            onClick={() => {
              setSuccess(false)
              setCancelModal(null)
              window.location.reload()
            }}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.02]"
          >
            Đóng
          </button>
        </div>
      </Modal>
    </UserDashboardLayout>
  )
}

export default ViewsBookedTicket
