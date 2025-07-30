"use client"

import { useEffect, useRef, useState } from "react"
import io from "socket.io-client"
import { useAuth } from "../../contexts/AuthContext"
import SidebarLayout from "../../components/Sidebar-Employee"

const socket = io("http://10.88.54.29:5000", {
    transports: ["websocket"],
    withCredentials: true,
})

const ChatWithUser = () => {
    const { user } = useAuth()
    const [userList, setUserList] = useState([])
    const [selectedUser, setSelectedUser] = useState(null)
    const [messages, setMessages] = useState({})
    const [input, setInput] = useState("")
    const [onlineUsers, setOnlineUsers] = useState(new Set())
    const messagesEndRef = useRef(null)

    useEffect(() => {
        if (!user?.username) return

        socket.emit("register", {
            username: user.username,
            role: user.role,
        })


        socket.on("receiveMessage", ({ sender, message }) => {
            setMessages((prev) => ({
                ...prev,
                [sender]: [
                    ...(prev[sender] || []),
                    {
                        sender,
                        message,
                        timestamp: new Date().toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                        }),
                    },
                ],
            }))

            if (!userList.includes(sender)) {
                setUserList((prev) => [...prev, sender])
            }
        })

        socket.on("userOnline", (username) => {
            setOnlineUsers((prev) => new Set([...prev, username]))
        })

        socket.on("userOffline", (username) => {
            setOnlineUsers((prev) => {
                const newSet = new Set(prev)
                newSet.delete(username)
                return newSet
            })
        })

        return () => {
            socket.off("receiveMessage")
            socket.off("userOnline")
            socket.off("userOffline")
        }
    }, [user?.username, userList])

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages, selectedUser])

    if (user?.role !== "employee") {
        return (
            <SidebarLayout>
                <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-6">
                    <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                        <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Truy cập bị từ chối</h3>
                        <p className="text-gray-400">Bạn không có quyền truy cập trang này.</p>
                    </div>
                </div>
            </SidebarLayout>
        )
    }

    const sendMessage = () => {
        if (!input.trim() || !selectedUser) return

        const newMessage = {
            sender: user.username,
            message: input,
            timestamp: new Date().toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
            }),
        }

        socket.emit("sendMessage", {
            sender: user.username,
            receiver: selectedUser,
            message: input,
        })

        setMessages((prev) => ({
            ...prev,
            [selectedUser]: [...(prev[selectedUser] || []), newMessage],
        }))

        setInput("")
    }

    const getInitials = (name) => {
        return name ? name.charAt(0).toUpperCase() : "U"
    }

    const getLastMessage = (username) => {
        const userMessages = messages[username] || []
        return userMessages.length > 0 ? userMessages[userMessages.length - 1] : null
    }

    return (
        <SidebarLayout>
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-white mb-2">Customer Support</h1>
                        <p className="text-gray-300">Customer Message Management</p>
                    </div>

                    {/* Main Chat Container */}
                    <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden h-[calc(100vh-200px)] border border-gray-700">
                        <div className="flex h-full">
                            {/* User List Sidebar */}
                            <div className="w-80 border-r border-gray-700 bg-gray-900">
                                {/* Sidebar Header */}
                                <div className="p-6 border-b border-gray-700 bg-gray-800">
                                    <h2 className="text-lg font-semibold text-white mb-1">Customer</h2>
                                    <p className="text-sm text-gray-400">{userList.length} messages</p>
                                </div>

                                {/* User List */}
                                <div className="overflow-y-auto h-full">
                                    {userList.length === 0 ? (
                                        <div className="p-6 text-center">
                                            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                                    />
                                                </svg>
                                            </div>
                                            <p className="text-gray-400 text-sm">Chưa có tin nhắn nào</p>
                                            <p className="text-gray-500 text-xs mt-1">Tin nhắn từ khách hàng sẽ xuất hiện ở đây</p>
                                        </div>
                                    ) : (
                                        <div className="p-2">
                                            {userList.map((username, index) => {
                                                const lastMessage = getLastMessage(username)
                                                const isOnline = onlineUsers.has(username)
                                                const isSelected = selectedUser === username

                                                return (
                                                    <div
                                                        key={index}
                                                        className={`relative p-4 rounded-xl mb-2 cursor-pointer transition-all duration-200 hover:bg-gray-800 hover:shadow-lg ${isSelected
                                                                ? "bg-blue-900/50 border-2 border-blue-500/50 shadow-lg"
                                                                : "bg-transparent hover:bg-gray-800"
                                                            }`}
                                                        onClick={() => setSelectedUser(username)}
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            {/* Avatar */}
                                                            <div className="relative">
                                                                <div
                                                                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${isSelected ? "bg-blue-600" : "bg-gradient-to-br from-blue-600 to-purple-700"
                                                                        }`}
                                                                >
                                                                    {getInitials(username)}
                                                                </div>
                                                                {/* Online Status */}
                                                                {isOnline && (
                                                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-800 rounded-full"></div>
                                                                )}
                                                            </div>

                                                            {/* User Info */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between">
                                                                    <h3 className={`font-medium truncate ${isSelected ? "text-blue-300" : "text-white"}`}>
                                                                        {username}
                                                                    </h3>
                                                                    {lastMessage && (
                                                                        <span className="text-xs text-gray-400 ml-2">{lastMessage.timestamp}</span>
                                                                    )}
                                                                </div>
                                                                {lastMessage && (
                                                                    <p className="text-sm text-gray-300 truncate mt-1">
                                                                        {lastMessage.sender === user.username ? "Bạn: " : ""}
                                                                        {lastMessage.message}
                                                                    </p>
                                                                )}
                                                                <div className="flex items-center mt-1">
                                                                    <div
                                                                        className={`w-2 h-2 rounded-full mr-2 ${isOnline ? "bg-green-500" : "bg-gray-600"}`}
                                                                    ></div>
                                                                    <span className="text-xs text-gray-400">
                                                                        {isOnline ? "Online" : "Offline"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Chat Area */}
                            <div className="flex-1 flex flex-col">
                                {selectedUser ? (
                                    <>
                                        {/* Chat Header */}
                                        <div className="p-6 border-b border-gray-700 bg-gray-800">
                                            <div className="flex items-center space-x-4">
                                                <div className="relative">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-700 rounded-full flex items-center justify-center text-white font-semibold">
                                                        {getInitials(selectedUser)}
                                                    </div>
                                                    {onlineUsers.has(selectedUser) && (
                                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full"></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h2 className="text-lg font-semibold text-white">{selectedUser}</h2>
                                                    <p className="text-sm text-gray-400">
                                                        {onlineUsers.has(selectedUser) ? "Đang hoạt động" : "Không hoạt động"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Messages */}
                                        <div className="flex-1 overflow-y-auto p-6 bg-gray-900">
                                            <div className="space-y-4">
                                                {(messages[selectedUser] || []).map((msg, index) => (
                                                    <div
                                                        key={index}
                                                        className={`flex ${msg.sender === user.username ? "justify-end" : "justify-start"}`}
                                                    >
                                                        <div
                                                            className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg ${msg.sender === user.username
                                                                    ? "bg-blue-600 text-white rounded-br-md"
                                                                    : "bg-gray-700 text-gray-100 rounded-bl-md border border-gray-600"
                                                                }`}
                                                        >
                                                            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{msg.message}</p>
                                                            <p
                                                                className={`text-xs mt-2 ${msg.sender === user.username ? "text-blue-200" : "text-gray-400"
                                                                    }`}
                                                            >
                                                                {msg.timestamp}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                                <div ref={messagesEndRef} />
                                            </div>
                                        </div>

                                        {/* Message Input */}
                                        <div className="p-6 bg-gray-800 border-t border-gray-700">
                                            <div className="flex items-end space-x-4">
                                                <div className="flex-1">
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                            value={input}
                                                            onChange={(e) => setInput(e.target.value)}
                                                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                                            placeholder="Nhập tin nhắn..."
                                                        />
                                                        <button
                                                            onClick={sendMessage}
                                                            disabled={!input.trim()}
                                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors duration-200"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                                                />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    /* Empty State */
                                    <div className="flex-1 flex items-center justify-center bg-gray-900">
                                        <div className="text-center">
                                            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                                    />
                                                </svg>
                                            </div>
                                            <h3 className="text-xl font-semibold text-white mb-2">Select a conversation</h3>
                                            <p className="text-gray-400 max-w-sm">
                                                Choose a customer from the left to start chatting and provide support
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SidebarLayout>
    )
}

export default ChatWithUser
