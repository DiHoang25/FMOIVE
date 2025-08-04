"use client"

import { useEffect, useRef, useState } from "react"
import {
    BellOutlined,
    CalendarOutlined,
    FireOutlined,
    LoadingOutlined,
    MessageOutlined,
    ClockCircleOutlined,
} from "@ant-design/icons"
import { Button, Drawer, Spin, Alert, Badge } from "antd"
import { motion, AnimatePresence } from "framer-motion"
import { io } from "socket.io-client"
import { useAuth } from "../contexts/AuthContext"
import { notification } from "antd"
import { useNavigate } from "react-router-dom"



const UserNotification = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [comingSoon, setComingSoon] = useState([])
    const [hotMovies, setHotMovies] = useState([])
    const [hasNew, setHasNew] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [notifications, setNotifications] = useState([])
    const { user } = useAuth()
    const navigate = useNavigate()
    const socket = useRef(null)


    const fetchData = async () => {
        setLoading(true);
        try {
            // Gọi song song 2 API
            const [homeRes, moviesRes] = await Promise.all([
                fetch("http://localhost:5000/api/home"),
                fetch("http://localhost:5000/api/movies"),
            ]);

            if (!homeRes.ok || !moviesRes.ok) throw new Error("Failed to fetch");

            const homeData = await homeRes.json();
            const moviesData = await moviesRes.json();

            // Sắp xếp danh sách coming soon theo ngày chiếu
            const sortedComing = (homeData?.comingSoon || []).sort(
                (a, b) => new Date(a.start_date) - new Date(b.start_date)
            );

            // Lọc các phim hot đang còn hoạt động
            const activeHotMovies = moviesData
                .filter((movie) => checkHotMovie(movie))
                .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

            // So sánh để kiểm tra có dữ liệu mới không
            if (
                sortedComing.length !== comingSoon.length ||
                activeHotMovies.length !== hotMovies.length
            ) {
                setHasNew(true);
            }

            setComingSoon(sortedComing);
            setHotMovies(activeHotMovies);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch notifications");
        } finally {
            setLoading(false);
        }
    };

    const checkHotMovie = (movie) => {
        const now = new Date();
        return (
            movie.is_hot &&
            new Date(movie.start_date) <= now &&
            new Date(movie.end_date) >= now
        );
    };



    const fetchUserReplies = async () => {
        if (!user?.username) return;

        try {
            const res = await fetch(`http://localhost:5000/api/replies?username=${user.username}`);
            if (!res.ok) throw new Error("Failed to fetch user replies");

            const data = await res.json();

            const sorted = data
                .sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt)) // ưu tiên timestamp nếu có
                .slice(0, 5)
                .map((item) => ({
                    ...item,
                    message: `Bạn có phản hồi từ ${item.sender || item.author}`,
                    reply: item.reply || item.message,
                    timestamp: item.timestamp || new Date(item.createdAt).getTime(),
                    link: item.link, // ✅ đã có sẵn từ backend, không cần tự tạo
                }));

            setNotifications(sorted);
            localStorage.setItem("userReplies", JSON.stringify(sorted));
        } catch (err) {
            console.error("❌ Error fetching user replies:", err);
        }
    };

    useEffect(() => {
        if (user?.username) {
            console.log("👤 Detected user login, fetching latest replies...")
            fetchUserReplies() // ✅ gọi API để load reply mới
        }
    }, [user?.username])


    useEffect(() => {
        const storedReplies = localStorage.getItem("userReplies")
        if (storedReplies) {
            setNotifications(JSON.parse(storedReplies))
        }
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

        const handleNotification = (data) => {
            console.log("📬 Notification received:", data)

            if (data) {
                const withTimestamp = {
                    ...data,
                    timestamp: Date.now(),
                }

                setNotifications((prev) => {
                    const updated = [withTimestamp, ...prev].slice(0, 5)
                    localStorage.setItem("userReplies", JSON.stringify(updated))
                    return updated
                })

                setHasNew(true)

                notification.open({
                    message: <span style={{ color: "white" }}>{data.message || "Bạn có phản hồi mới"}</span>,
                    description: <span style={{ color: "#ccc" }}>{data.reply || "Ai đó vừa trả lời bình luận của bạn."}</span>,
                    icon: <MessageOutlined style={{ color: "#1890ff" }} />,
                    duration: 5,
                    placement: "topRight",
                    style: {
                        backgroundColor: "#001529",
                        border: "1px solid #1890ff",
                        borderRadius: 8,
                        cursor: "pointer",
                    },
                    onClick: () => {
                        if (data.link) {
                            const [pathname, hash] = data.link.split("#");
                            const commentId = hash?.replace("comment-", "");

                            if (pathname && commentId) {
                                navigate(pathname, {
                                    state: { scrollToCommentId: commentId },
                                });
                            }
                        }
                    }



                })
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
        setIsOpen((prev) => {
            const newState = !prev
            if (newState) fetchUserReplies() // 👉 Fetch mới mỗi khi mở panel
            return newState
        })
        setHasNew(false)
    }


    const formatDate = (str) => {
        return new Date(str).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
        })
    }

    const formatTimeAgo = (timestamp) => {
        const now = new Date()
        const time = new Date(timestamp)
        const diffInMinutes = Math.floor((now - time) / (1000 * 60))

        if (diffInMinutes < 1) return "Just now"
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
        return `${Math.floor(diffInMinutes / 1440)}d ago`
    }

    return (
        <>
            <motion.div className="relative">
                <div className="relative">
                    <Badge dot={hasNew} offset={[-2, 2]}>
                        <Button
                            shape="circle"
                            size="small"
                            type="default"
                            className="!w-9 !h-9 !bg-gradient-to-br !from-red-600 !to-red-700 hover:!from-red-700 hover:!to-red-800 !border-none flex items-center justify-center shadow-lg transition-all duration-300"
                            onClick={togglePanel}
                            icon={
                                loading ? (
                                    <Spin indicator={<LoadingOutlined style={{ color: "white" }} spin />} />
                                ) : (
                                    <motion.div
                                        animate={hasNew ? { rotate: [0, -10, 10, -10, 0] } : {}}
                                        transition={{ repeat: hasNew ? Number.POSITIVE_INFINITY : 0, duration: 0.5 }}
                                    >
                                        <BellOutlined className="text-white text-lg" />
                                    </motion.div>
                                )
                            }
                        />
                    </Badge>
                </div>
            </motion.div>

            <Drawer
                title={
                    <div className="flex items-center w-full min-h-[30px] py-0.1">
                        <div
                            className="w-6 h-7 mr-6 rounded-full flex items-center justify-center transition-transform duration-300 ease-in-out hover:scale-110 cursor-pointer hover:bg-gray-700"
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
                width={420}
                className="[&_.ant-drawer-content]:!bg-[#1a1a1a] [&_.ant-drawer-header]:!bg-[#1a1a1a] [&_.ant-drawer-header]:!border-gray-700"
                styles={{
                    body: {
                        backgroundColor: "#0f0f0f",
                        color: "#ffffff",
                        scrollBehavior: "smooth",
                        padding: "16px",
                    },
                    header: {
                        backgroundColor: "#1a1a1a",
                        borderBottom: "1px solid #333",
                    },
                }}
            >
                {error ? (
                    <Alert
                        message={error}
                        type="error"
                        showIcon
                        className="!bg-red-900/20 !border-red-500/30 [&_.ant-alert-message]:!text-white [&_.ant-alert-icon]:!text-red-400"
                    />
                ) : (
                    <div className="space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                        <AnimatePresence>
                            {notifications.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-700">
                                        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                                            <MessageOutlined className="text-white text-sm" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-base text-white">User Replies</h3>
                                            <p className="text-xs text-gray-400">{notifications.length} new messages</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {notifications.map((n, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="group relative overflow-hidden"
                                            >
                                                <div
                                                    className="relative p-4 bg-gradient-to-r from-gray-800/50 to-gray-800/30 border border-blue-500/20 rounded-xl hover:border-blue-400/40 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-blue-500/10 hover:transform hover:scale-[1.02]"
                                                    onClick={() => {
                                                        if (n.link) {
                                                            const [pathname, hash] = n.link.split("#");
                                                            const commentId = hash?.replace("comment-", "");

                                                            if (pathname && commentId) {
                                                                navigate(pathname, {
                                                                    state: { scrollToCommentId: commentId },
                                                                });
                                                            } else {
                                                                // Fallback: nếu không có commentId, vẫn navigate bình thường
                                                                navigate(n.link);
                                                            }
                                                        }
                                                    }}

                                                >
                                                    {/* Gradient overlay */}
                                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />

                                                    {/* Content */}
                                                    <div className="relative z-10">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                                                                <span className="text-xs text-blue-300 font-medium">New Reply</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                                <ClockCircleOutlined className="text-[10px]" />
                                                                {formatTimeAgo(n.timestamp || Date.now())}
                                                            </div>
                                                        </div>

                                                        <p className="text-white text-sm font-medium mb-2 leading-relaxed">{n.message}</p>

                                                        {n.reply && (
                                                            <div className="mt-3 p-3 bg-blue-500/10 border-l-2 border-blue-400 rounded-r-lg">
                                                                <p className="text-blue-200 text-xs italic leading-relaxed">"{n.reply}"</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Hover indicator */}
                                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                        <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full" />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {comingSoon.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.1 }}
                                >
                                    <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-700">
                                        <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                                            <CalendarOutlined className="text-white text-sm" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-base text-white">Coming Soon</h3>
                                            <p className="text-xs text-gray-400">{comingSoon.length} upcoming releases</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {comingSoon.slice(0, 5).map((m, idx) => (
                                            <motion.div
                                                key={m._id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="group relative overflow-hidden"
                                            >
                                                <div className="relative p-4 bg-gradient-to-r from-gray-800/50 to-gray-800/30 border border-green-500/20 rounded-xl hover:border-green-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 hover:transform hover:scale-[1.02]">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />

                                                    <div className="relative z-10">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 bg-green-400 rounded-full" />
                                                                <span className="text-xs text-green-300 font-medium">Upcoming</span>
                                                            </div>
                                                            <div className="px-2 py-1 bg-green-500/20 rounded-full">
                                                                <span className="text-xs text-green-300 font-medium">{formatDate(m.start_date)}</span>
                                                            </div>
                                                        </div>

                                                        <p className="font-semibold text-white text-sm mb-1">{m.name}</p>
                                                        <p className="text-green-400 text-xs">Release Date</p>
                                                    </div>

                                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                        <div className="w-1 h-8 bg-gradient-to-b from-green-400 to-green-600 rounded-full" />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {hotMovies.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.2 }}
                                >
                                    <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-700">
                                        <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                                            <FireOutlined className="text-white text-sm" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-base text-white">Hot Movies</h3>
                                            <p className="text-xs text-gray-400">{hotMovies.length} trending now</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {hotMovies.slice(0, 5).map((m, idx) => (
                                            <motion.div
                                                key={m._id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="group relative overflow-hidden"
                                            >
                                                <div className="relative p-4 bg-gradient-to-r from-gray-800/50 to-gray-800/30 border border-red-500/20 rounded-xl hover:border-red-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10 hover:transform hover:scale-[1.02]">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />

                                                    <div className="relative z-10">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <motion.div
                                                                    className="w-2 h-2 bg-red-400 rounded-full"
                                                                    animate={{ scale: [1, 1.2, 1] }}
                                                                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                                                                />
                                                                <span className="text-xs text-red-300 font-medium">Trending</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 rounded-full">
                                                                <FireOutlined className="text-red-400 text-xs" />
                                                                <span className="text-xs text-red-300 font-medium">Hot</span>
                                                            </div>
                                                        </div>

                                                        <p className="font-semibold text-white text-sm mb-1">{m.name}</p>
                                                        <p className="text-red-400 text-xs">🔥 Trending now</p>
                                                    </div>

                                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                        <div className="w-1 h-8 bg-gradient-to-b from-red-400 to-red-600 rounded-full" />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {comingSoon.length === 0 && hotMovies.length === 0 && notifications.length === 0 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
                                    <BellOutlined className="text-gray-500 text-2xl" />
                                </div>
                                <p className="text-gray-400 text-sm mb-2">No notifications yet</p>
                                <p className="text-gray-500 text-xs">We'll notify you when something interesting happens</p>
                            </motion.div>
                        )}
                    </div>
                )}
            </Drawer>
        </>
    )
}

export default UserNotification