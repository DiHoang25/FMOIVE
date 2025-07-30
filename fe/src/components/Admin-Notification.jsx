import React, { useState, useEffect } from 'react';
import { Button, Drawer, Spin, Alert, Badge } from 'antd';
import { 
    BellOutlined, 
    DeleteOutlined, 
    LoadingOutlined, 
    PlusOutlined, 
    CalendarOutlined,
    ClockCircleOutlined 
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';

const AdminNotification = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [upcomingMovies, setUpcomingMovies] = useState([]);
    const [newMovies, setNewMovies] = useState([]);
    const [deletedMovies, setDeletedMovies] = useState([]);
    const [hasNew, setHasNew] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getCalculatedStatus = (start, end) => {
        const today = dayjs();
        if (today.isBefore(start)) return 'coming_soon';
        if (today.isAfter(end)) return 'ended';
        return 'now_showing';
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [moviesRes, deletedRes] = await Promise.all([
                fetch('http://localhost:5000/api/movies'),
                fetch('http://localhost:5000/api/movies/deleted/all')
            ]);
            
            if (!moviesRes.ok) throw new Error('Failed to fetch movies');
            if (!deletedRes.ok) throw new Error('Failed to fetch deleted movies');
            
            const movies = await moviesRes.json();
            const deletedMovies = await deletedRes.json();
            
            // Filter movies with ended status
            const ended = movies.filter(movie => {
                const status = getCalculatedStatus(dayjs(movie.start_date), dayjs(movie.end_date));
                return status === 'ended';
            });

            // Check for new movies (added in last 24 hours)
            const recentlyAdded = movies.filter(movie =>
                new Date(movie.createdAt) > Date.now() - 24 * 60 * 60 * 1000
            );

            const filteredDeleted = deletedMovies.filter(movie => 
                getCalculatedStatus(dayjs(movie.start_date), dayjs(movie.end_date)) === 'ended'
            );
            
            // Check if there are new notifications
            if (ended.length !== upcomingMovies.length || 
                recentlyAdded.length !== newMovies.length || 
                filteredDeleted.length !== deletedMovies.length) {
                setHasNew(true);
            }

            setUpcomingMovies(ended);
            setNewMovies(recentlyAdded);
            setDeletedMovies(filteredDeleted);
        } catch (error) {
            console.error('Error fetching movies:', error);
            setError('Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        
        // Set interval to check for updates every minute
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    const togglePanel = () => {
        setIsOpen(!isOpen);
        setHasNew(false);
    };

    const formatDate = (dateStr) => {
        return dayjs(dateStr).format('DD/MM/YYYY');
    };

    const formatDateTime = (dateStr) => {
        return dayjs(dateStr).format('DD/MM/YYYY HH:mm');
    };

    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInMinutes = Math.floor((now - time) / (1000 * 60));

        if (diffInMinutes < 1) return "Just now";
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    const totalNotifications = upcomingMovies.length + newMovies.length + deletedMovies.length;

    return (
        <>
            <motion.div className="absolute right-6 z-50">
                <div className="relative">
                    <Badge dot={hasNew} offset={[-2, 2]}>
                        <Button
                            shape="circle"
                            size="small"
                            type="default"
                            className="!w-10 !h-10 !bg-gradient-to-br !from-orange-500 !to-orange-600 hover:!from-orange-600 hover:!to-orange-700 !border-none flex items-center justify-center shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-110"
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
                            Admin Notifications
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
                            {deletedMovies.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-700">
                                        <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                                            <DeleteOutlined className="text-white text-sm" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-base text-white">Recently Deleted Movies</h3>
                                            <p className="text-xs text-gray-400">{deletedMovies.length} movies removed</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {deletedMovies.slice(0, 5).map((movie, idx) => (
                                            <motion.div
                                                key={movie._id}
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
                                                                <div className="w-2 h-2 bg-red-400 rounded-full" />
                                                                <span className="text-xs text-red-300 font-medium">Deleted</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                                <ClockCircleOutlined className="text-[10px]" />
                                                                {formatTimeAgo(movie.deletedAt || Date.now())}
                                                            </div>
                                                        </div>

                                                        <p className="font-semibold text-white text-sm mb-1">{movie.name}</p>
                                                        <p className="text-red-400 text-xs">Ended on: {formatDate(movie.end_date)}</p>
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

                            {upcomingMovies.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.1 }}
                                >
                                    <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-700">
                                        <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                                            <CalendarOutlined className="text-white text-sm" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-base text-white">Movies That Have Ended</h3>
                                            <p className="text-xs text-gray-400">{upcomingMovies.length} movies ended</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {upcomingMovies.slice(0, 5).map((movie, idx) => (
                                            <motion.div
                                                key={movie._id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="group relative overflow-hidden"
                                            >
                                                <div className="relative p-4 bg-gradient-to-r from-gray-800/50 to-gray-800/30 border border-orange-500/20 rounded-xl hover:border-orange-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 hover:transform hover:scale-[1.02]">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />

                                                    <div className="relative z-10">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 bg-orange-400 rounded-full" />
                                                                <span className="text-xs text-orange-300 font-medium">Ended</span>
                                                            </div>
                                                            <div className="px-2 py-1 bg-orange-500/20 rounded-full">
                                                                <span className="text-xs text-orange-300 font-medium">{formatDate(movie.end_date)}</span>
                                                            </div>
                                                        </div>

                                                        <p className="font-semibold text-white text-sm mb-1">{movie.name}</p>
                                                        <p className="text-orange-400 text-xs">Show ended</p>
                                                    </div>

                                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                        <div className="w-1 h-8 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full" />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {newMovies.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.2 }}
                                >
                                    <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-700">
                                        <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                                            <PlusOutlined className="text-white text-sm" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-base text-white">New Movies Added</h3>
                                            <p className="text-xs text-gray-400">{newMovies.length} new additions</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {newMovies.slice(0, 5).map((movie, idx) => (
                                            <motion.div
                                                key={movie._id}
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
                                                                <motion.div
                                                                    className="w-2 h-2 bg-green-400 rounded-full"
                                                                    animate={{ scale: [1, 1.2, 1] }}
                                                                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                                                                />
                                                                <span className="text-xs text-green-300 font-medium">New</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                                <ClockCircleOutlined className="text-[10px]" />
                                                                {formatTimeAgo(movie.createdAt)}
                                                            </div>
                                                        </div>

                                                        <p className="font-semibold text-white text-sm mb-1">{movie.name}</p>
                                                        <p className="text-green-400 text-xs">Added: {formatDateTime(movie.createdAt)}</p>
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
                        </AnimatePresence>

                        {totalNotifications === 0 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
                                    <BellOutlined className="text-gray-500 text-2xl" />
                                </div>
                                <p className="text-gray-400 text-sm mb-2">No notifications yet</p>
                                <p className="text-gray-500 text-xs">We'll notify you when movies are added, ended, or deleted</p>
                            </motion.div>
                        )}
                    </div>
                )}
            </Drawer>
        </>
    );
};

export default AdminNotification;