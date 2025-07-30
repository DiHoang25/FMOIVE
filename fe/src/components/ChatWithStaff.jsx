"use client"

import { useEffect, useRef, useState } from "react"
import io from "socket.io-client"
import { useAuth } from "../contexts/AuthContext"
import {
  MessageCircle,
  X,
  Send,
  Minimize2,
  Maximize2,
  Paperclip,
  Smile,
  Phone,
  Mail,
  Clock,
  CheckCheck,
  AlertCircle,
} from "lucide-react"

const socket = io("http://10.88.54.29:5000", {
  transports: ["websocket"],
  withCredentials: true,
})

const ChatWithStaff = () => {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOnline, setIsOnline] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [waitingForResponse, setWaitingForResponse] = useState(false)
  const [lastUserMessageTime, setLastUserMessageTime] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)

  const emojis = ["😊", "😂", "❤️", "👍", "👎", "😢", "😮", "😡", "🙏", "👏", "🎉", "🔥"]

  useEffect(() => {
    if (user?.username && user?.role) {
      socket.emit("register", {
        username: user.username,
        role: user.role,
      })

      socket.on("receiveMessage", ({ sender, message, type = "text" }) => {
        const newMessage = {
          id: Date.now(),
          sender,
          message,
          type,
          timestamp: new Date().toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isStaff: sender !== user.username,
          status: "delivered",
        }
        setMessages((prev) => [...prev, newMessage])
        setWaitingForResponse(false)

        if (!open) {
          setUnreadCount((prev) => prev + 1)
        }
      })

      socket.on("chatMessage", ({ from, message, type = "text" }) => {
        const newMessage = {
          id: Date.now(),
          sender: from,
          message,
          type,
          timestamp: new Date().toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isStaff: from !== user.username,
          status: "delivered",
        }
        setMessages((prev) => [...prev, newMessage])
        setWaitingForResponse(false)

        if (!open) {
          setUnreadCount((prev) => prev + 1)
        }
      })

      socket.on("staffOnline", () => {
        setIsOnline(true)
      })

      socket.on("staffOffline", () => {
        setIsOnline(false)
      })

      socket.on("staffTyping", () => {
        setIsTyping(true)
        setWaitingForResponse(false)
        setTimeout(() => setIsTyping(false), 3000)
      })
    }

    return () => {
      socket.off("receiveMessage")
      socket.off("chatMessage")
      socket.off("staffOnline")
      socket.off("staffOffline")
      socket.off("staffTyping")
    }
  }, [user, open])

  // Check if waiting for response
  useEffect(() => {
    if (lastUserMessageTime && !isTyping) {
      const timer = setTimeout(() => {
        setWaitingForResponse(true)
      }, 30000) // 30 seconds

      return () => clearTimeout(timer)
    }
  }, [lastUserMessageTime, isTyping, messages])

  const sendMessage = (messageText = input, messageType = "text") => {
    if (!messageText.trim() && messageType === "text") return

    const newMessage = {
      id: Date.now(),
      sender: user.username,
      message: messageText,
      type: messageType,
      timestamp: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isStaff: false,
      status: "sent",
    }

    socket.emit("sendMessageToEmployee", {
      sender: user.username,
      message: messageText,
      type: messageType,
    })

    setMessages((prev) => [...prev, newMessage])
    setInput("")
    setLastUserMessageTime(Date.now())
    setWaitingForResponse(false)
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          sendMessage(e.target.result, "image")
        }
        reader.readAsDataURL(file)
      } else {
        sendMessage(`📎 ${file.name}`, "file")
      }
    }
  }

  const handleEmojiClick = (emoji) => {
    setInput((prev) => prev + emoji)
    setShowEmojiPicker(false)
    inputRef.current?.focus()
  }

  const handleOpen = () => {
    setOpen(true)
    setUnreadCount(0)
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  const handleClose = () => {
    setOpen(false)
    setMinimized(false)
    setShowEmojiPicker(false)
  }

  const handleMinimize = () => {
    setMinimized(!minimized)
    setShowEmojiPicker(false)
  }

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  if (!user?.username) return null

  const quickReplies = ["Xin chào! Tôi cần hỗ trợ", "Cảm ơn bạn", "Tôi hiểu rồi", "Có thể giúp tôi không?"]

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {open ? (
        <div
          className={`bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 transition-all duration-300 ${minimized ? "w-80 h-16" : "w-96 h-[600px]"
            }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div
                  className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${isOnline ? "bg-green-500" : "bg-green-500"
                    }`}
                ></div>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Customer Support</h3>
                {/* <p className="text-xs text-red-100 flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${isOnline ? "bg-green-400" : "bg-gray-400"}`}></div>
                  {isOnline ? "Đang hoạt động" : "Không hoạt động"}
                </p> */}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => window.open("tel:+84123456789")}
                className="w-8 h-8 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                title="Gọi điện"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                onClick={handleMinimize}
                className="w-8 h-8 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                {minimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={handleClose}
                className="w-8 h-8 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-900 h-[380px] overflow-x-hidden">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <p className="text-gray-300 text-sm font-medium">Chào mừng bạn đến với hỗ trợ khách hàng!</p>
                    <p className="text-gray-500 text-xs mt-2">Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7</p>

                    {/* Quick Contact Options */}
                    <div className="flex justify-center space-x-4 mt-6">
                      <button
                        onClick={() => window.open("tel:+84123456789")}
                        className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        <span>Gọi ngay</span>
                      </button>
                      <button
                        onClick={() => window.open("mailto:support@company.com")}
                        className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-xs transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Email</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, index) => (
                      <div key={msg.id} className={`flex ${msg.isStaff ? "justify-start" : "justify-end"}`}>
                        <div className={`${msg.isStaff ? "max-w-[80%]" : "max-w-[85%] ml-auto"}`}>
                          {msg.isStaff && (
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="w-7 h-7 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                                <span className="text-xs text-white font-bold">CS</span>
                              </div>
                              <span className="text-xs text-gray-400 font-medium">Customer Support</span>
                              <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                            </div>
                          )}
                          <div
                            className={`w-full px-4 py-3 rounded-2xl shadow-lg relative break-words ${msg.isStaff
                                ? "bg-gray-700 text-gray-100 rounded-bl-md border-l-4 border-red-500 mr-auto"
                                : "bg-red-600 text-white rounded-br-md ml-auto"
                              }`}
                            style={{
                              wordWrap: "break-word",
                              wordBreak: "break-word",
                              overflowWrap: "break-word",
                              hyphens: "auto",
                            }}
                          >
                            {msg.type === "image" ? (
                              <img
                                src={msg.message || "/placeholder.svg"}
                                alt="Uploaded image"
                                className="max-w-full h-auto rounded-lg"
                                style={{ maxWidth: "100%", height: "auto" }}
                              />
                            ) : (
                              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <p className={`text-xs ${msg.isStaff ? "text-gray-400" : "text-red-200"}`}>
                                {msg.timestamp}
                              </p>
                              {!msg.isStaff && (
                                <div className="flex items-center">
                                  {msg.status === "sent" && <CheckCheck className="w-3 h-3 text-red-200" />}
                                  {msg.status === "delivered" && <CheckCheck className="w-3 h-3 text-green-400" />}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Waiting Message */}
                    {waitingForResponse && !isTyping && (
                      <div className="flex justify-center">
                        <div className="bg-yellow-900/50 border border-yellow-600/50 text-yellow-300 px-4 py-3 rounded-xl flex items-center space-x-2 text-sm">
                          <Clock className="w-4 h-4" />
                          <span>Please wait a moment. A support agent will be with you shortly.</span>
                        </div>
                      </div>
                    )}

                    {/* Typing Indicator */}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-7 h-7 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-bold">CS</span>
                          </div>
                          <span className="text-xs text-gray-400">Đang soạn tin...</span>
                        </div>
                        <div className="bg-gray-700 px-4 py-3 rounded-2xl rounded-bl-md ml-2 border-l-4 border-red-500">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-red-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-red-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies */}
              {messages.length === 0 && (
                <div className="px-4 py-2 bg-gray-800 border-t border-gray-700">
                  <p className="text-xs text-gray-400 mb-2">Câu hỏi thường gặp:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickReplies.map((reply, index) => (
                      <button
                        key={index}
                        onClick={() => sendMessage(reply)}
                        className="text-xs bg-gray-700 hover:bg-red-600 text-gray-300 hover:text-white px-3 py-1 rounded-full transition-colors"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="absolute bottom-20 right-4 bg-gray-700 rounded-lg p-3 shadow-xl border border-gray-600">
                  <div className="grid grid-cols-6 gap-2">
                    {emojis.map((emoji, index) => (
                      <button
                        key={index}
                        onClick={() => handleEmojiClick(emoji)}
                        className="w-8 h-8 hover:bg-gray-600 rounded flex items-center justify-center transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4 bg-gray-800 rounded-b-2xl border-t border-gray-700">
                <div className="flex items-end space-x-2">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-9 h-9 bg-gray-700 hover:bg-red-600 text-gray-300 hover:text-white rounded-full flex items-center justify-center transition-colors"
                      title="Đính kèm file"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="w-9 h-9 bg-gray-700 hover:bg-red-600 text-gray-300 hover:text-white rounded-full flex items-center justify-center transition-colors"
                      title="Emoji"
                    >
                      <Smile className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <div className="relative">
                      <textarea
                        ref={inputRef}
                        className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none min-h-[48px] max-h-[120px] scrollbar-hide break-all"
                        style={{
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                          wordBreak: "break-all", // Thêm dòng này để xử lý văn bản không có khoảng trắng
                          scrollbarWidth: "none",
                          msOverflowStyle: "none",
                        }}
                        value={input}
                        onChange={(e) => {
                          setInput(e.target.value)
                          // Auto-resize textarea
                          e.target.style.height = "auto"
                          e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            sendMessage()
                          }
                        }}
                        placeholder="Enter your message... "
                        rows={1}
                      />

                      <button
                        onClick={() => sendMessage()}
                        disabled={!input.trim()}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors duration-200"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">Enter để gửi, Shift+Enter để xuống hàng</p>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <AlertCircle className="w-3 h-3" />
                    <span>Bảo mật & riêng tư</span>
                  </div>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </>
          )}
        </div>
      ) : (
        <button
          className="group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-4 rounded-full shadow-2xl transition-all duration-300 flex items-center space-x-3 hover:scale-105 hover:shadow-red-500/25"
          onClick={handleOpen}
        >
          <div className="relative">
            <MessageCircle className="w-6 h-6" />
            {unreadCount > 0 && (
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-500 text-black text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </div>
            )}
          </div>
          <div className="hidden group-hover:block transition-all duration-200">
            <span className="font-medium">Hỗ trợ 24/7</span>
          </div>
        </button>
      )}
    </div>
  )
}

export default ChatWithStaff
