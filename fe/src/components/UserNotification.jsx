"use client"

import { useEffect, useRef, useState } from "react"
import { BellOutlined, CalendarOutlined, FireOutlined, LoadingOutlined } from "@ant-design/icons"
import { Button, Drawer, Spin, Alert } from "antd"
import { motion } from "framer-motion"
import { io } from "socket.io-client"
import { useAuth } from "../contexts/AuthContext"

const UserNotification = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [comingSoon, setComingSoon] = useState([])
    const [hotMovies, setHotMovies] = useState([])
    const [hasNew, setHasNew] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [notifications, setNotifications] = useState([])
    const { user } = useAuth()

    const socket = useRef(null)

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await fetch("http://localhost:5000/api/home")
            if (!res.ok) throw new Error("Failed to fetch")
            const data = await res.json()

            const sortedComing = (data?.comingSoon || []).sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
            const hotList = data?.hotMovies || []

            // Nếu có thêm phim mới thì đánh dấu có thông báo mới
            if (sortedComing.length !== comingSoon.length || hotList.length !== hotMovies.length) {
                setHasNew(true)
            }

            setComingSoon(sortedComing)
            setHotMovies(hotList)
        } catch (err) {
            console.error(err)
            setError("Failed to fetch notifications")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
        const interval = setInterval(fetchData, 60000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (!user?.username) {
            console.warn("⚠️ user.username không tồn tại, không khởi tạo socket.")
            return
        }

        socket.current = io("http://localhost:5000")

        socket.current.on("connect", () => {
            console.log("🟢 Socket connected:", socket.current.id)
            socket.current.emit("register", user.username)
            console.log("✅ Registered user:", user.username)
        })

        socket.current.on("connect_error", (err) => {
            console.error("❌ Socket connection error:", err)
        })

        socket.current.on("disconnect", (reason) => {
            console.warn("🔴 Socket disconnected:", reason)
        })

        // Nhận thông báo
        const handleNotification = (data) => {
            console.log("📬 Notification received:", data)
            if (data) {
                setNotifications((prev) => [...prev, data])
                setHasNew(true)
            }
        }

        socket.current.on("notification", handleNotification)
        socket.current.on("new_reply", handleNotification)

        return () => {
            console.log("🔌 Cleaning up socket listeners...")
            socket.current.off("notification", handleNotification)
            socket.current.off("new_reply", handleNotification)
            socket.current.disconnect()
        }
    }, [user?.username])

    const togglePanel = () => {
        setIsOpen(!isOpen)
        setHasNew(false)
    }

    const formatDate = (str) => {
        return new Date(str).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
        })
    }

    return (
        <>
            <motion.div className="relative">
                <div className="relative">
                    <Button
                        shape="circle"
                        size="small"
                        type="default"
                        className="!w-9 !h-9 !bg-red-600 hover:!bg-red-700 !border-none flex items-center justify-center"
                        onClick={togglePanel}
                        icon={
                            loading ? (
                                <Spin indicator={<LoadingOutlined style={{ color: "white" }} spin />} />
                            ) : (
                                <motion.div
                                    animate={hasNew ? { rotate: [0, -10, 10, -10, 0] } : {}}
                                    transition={{ repeat: hasNew ? Infinity : 0, duration: 0.5 }}
                                >
                                    <BellOutlined className="text-white text-lg" />
                                </motion.div>
                            )
                        }
                    />
                    {hasNew && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border border-white" />
                    )}
                </div>
            </motion.div>

            <Drawer
                title={
                    <div className="flex items-center w-full min-h-[30px] py-0.1">
                        <div
                            className="w-6 h-7 mr-6 rounded-full flex items-center justify-center transition-transform duration-300 ease-in-out hover:scale-110 cursor-pointer"
                            onClick={() => setIsOpen(false)}
                        >
                            <span className="text-white text-3xl font-bold leading-none">×</span>
                        </div>
                        <div className="flex items-center justify-end flex-grow text-white text-2xl font-semibold">
                            <BellOutlined className="mr-2 text-red-500 text-2xl" />
                            Notifications
                        </div>
                    </div>
                }
                closeIcon={false}
                placement="right"
                onClose={() => setIsOpen(false)}
                open={isOpen}
                width={400}
                className="[&_.ant-drawer-content]:!bg-[#2a2a2a] [&_.ant-drawer-header]:!bg-[#2a2a2a] [&_.ant-drawer-header]:!border-gray-700"
                styles={{
                    body: { backgroundColor: "#080808ff", color: "#ffffff", scrollBehavior: "smooth" },
                    header: { backgroundColor: "#030303ff", borderBottom: "1px solid #12161bff" },
                }}
            >
                {error ? (
                    <Alert
                        message={error}
                        type="error"
                        showIcon
                        className="!bg-red-900 !border-red-700 [&_.ant-alert-message]:!text-white [&_.ant-alert-icon]:!text-red-400"
                    />
                ) : (
                    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-700">
                        {comingSoon.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <CalendarOutlined className="text-green-500" />
                                    <h3 className="font-medium text-sm text-white">Coming Soon</h3>
                                </div>
                                {comingSoon.slice(0, 5).map((m) => (
                                    <div
                                        key={m._id}
                                        className="p-3 bg-gray-800 border border-green-500 rounded-lg text-sm mb-3 hover:bg-gray-750 transition-colors duration-200"
                                    >
                                        <p className="font-semibold text-white">{m.name}</p>
                                        <p className="text-green-400 text-xs mt-1">Release: {formatDate(m.start_date)}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {hotMovies.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <FireOutlined className="text-red-500" />
                                    <h3 className="font-medium text-sm text-white">Hot Movies</h3>
                                </div>
                                {hotMovies.slice(0, 5).map((m) => (
                                    <div
                                        key={m._id}
                                        className="p-3 bg-gray-800 border border-red-500 rounded-lg text-sm mb-3 hover:bg-gray-750 transition-colors duration-200"
                                    >
                                        <p className="font-semibold text-white">{m.name}</p>
                                        <p className="text-red-400 text-xs mt-1">🔥 Trending now</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {notifications.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <BellOutlined className="text-blue-400" />
                                    <h3 className="font-medium text-sm text-white">User Replies</h3>
                                </div>
                                {notifications.map((n, idx) => (
                                    <div
                                        key={idx}
                                        className="p-3 bg-gray-800 border border-blue-400 rounded-lg text-sm mb-3 hover:bg-gray-750 transition-colors duration-200"
                                    >
                                        <p className="text-white">{n.message}</p>
                                        {n.reply && (
                                            <p className="text-blue-300 text-xs mt-1 italic">"{n.reply}"</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {comingSoon.length === 0 && hotMovies.length === 0 && notifications.length === 0 && (
                            <div className="text-center py-6 text-gray-400 text-sm">🎬 No notifications available.</div>
                        )}
                    </div>
                )}
            </Drawer>
        </>
    )
}

export default UserNotification
