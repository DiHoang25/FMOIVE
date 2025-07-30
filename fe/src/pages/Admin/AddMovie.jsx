import React, { useState, useEffect } from 'react';
import SidebarLayout from '../../components/Sidebar-Admin';
import DatePicker from '../../components/DatePicker'; // Assuming this is a custom component
import DropDown from '../../components/DropDown';     // Assuming this is a custom component
import MultiTimePicker from '../../components/TimePicker'; // Assuming this is a custom component
import GenresDropDown from '../../components/GernesPicker'; // Assuming this is a custom component
import { useNavigate } from 'react-router-dom';
import { Modal, message } from 'antd'; // Keeping Ant Design Modal and message for functionality
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import axios from 'axios';
import { motion } from 'framer-motion'; // Import motion for animations
import { Form } from 'antd';
dayjs.extend(isSameOrBefore);


const AddMovie = () => {
    const [formData, setFormData] = useState({
        movieName: '',
        trailerLink: '',
        fromDate: null,
        toDate: null,
        actors: '',
        productionCompany: '',
        director: '',
        runningTime: '',
        moviePoster: '',
        moviePosterPreview: '',
        movieBanner: '',
        movieBannerPreview: '',
        movieDescription: '',
        status: 'coming_soon',
        genres: [],
        version: {
            '2D': false,
            '3D': false,
            'IMAX': false
        },
        cinemaRoom: [],
        showTimes: []
    });

    const navigate = useNavigate();
    const [success, setSuccess] = useState(false);
    const [roomOptions, setRoomOptions] = useState([]);
    const selectedVersions = Object.keys(formData.version).filter(v => formData.version[v]);
    const filteredRooms = roomOptions.filter(room => selectedVersions.includes(room.roomType));
    const [form] = Form.useForm();
    const [selectedRoom, setSelectedRoom] = useState(null);



    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const {
            movieName,
            trailerLink,
            fromDate,
            toDate,
            actors,
            productionCompany,
            director,
            runningTime,
            moviePoster,
            movieBanner,
            movieDescription,
            genres,
            cinemaRoom,
            showTimes,
        } = formData;

        const selectedVersions = Object.keys(formData.version).filter(v => formData.version[v]);

        // === VALIDATION CHECKS ===
        if (!movieName.trim()) return message.error("Vui lòng nhập tên phim.");
        if (!fromDate || !toDate) return message.error("Vui lòng chọn ngày chiếu.");
        if (!actors.trim()) return message.error("Vui lòng nhập tên diễn viên.");
        if (!productionCompany.trim()) return message.error("Vui lòng nhập hãng sản xuất.");
        if (!director.trim()) return message.error("Vui lòng nhập tên đạo diễn.");
        if (!runningTime || isNaN(runningTime) || runningTime <= 0) return message.error("Vui lòng nhập thời lượng phim hợp lệ.");
        if (dayjs(fromDate).isAfter(dayjs(toDate))) return message.error("Ngày bắt đầu không thể sau ngày kết thúc.");
        if (selectedVersions.length === 0) return message.error("Vui lòng chọn ít nhất một định dạng phim.");
        if (!showTimes || showTimes.length === 0) return message.error("Vui lòng chọn ít nhất một suất chiếu.");
        if (!cinemaRoom || cinemaRoom.length === 0) return message.error("Vui lòng chọn phòng chiếu.");
        if (!trailerLink.trim()) return message.error("Vui lòng nhập link trailer.");
        if (!genres || genres.length === 0) return message.error("Vui lòng chọn ít nhất một thể loại.");
        if (!moviePoster) return message.error("Vui lòng chọn poster phim.");
        if (!movieBanner) return message.error("Vui lòng chọn banner phim.");
        if (!movieDescription.trim()) return message.error("Vui lòng nhập mô tả phim.");

        if (!cinemaRoom || cinemaRoom.length === 0) return message.error("Vui lòng chọn phòng chiếu.");
        if (!showTimes || showTimes.length === 0) return message.error("Vui lòng chọn ít nhất một suất chiếu.");





        // === STATUS CALCULATION ===
        const today = dayjs().startOf('day');
        const movieStart = dayjs(fromDate).startOf('day');
        const updatedStatus = movieStart.isSameOrBefore(today) ? 'now_showing' : 'coming_soon';

        const formDataToSend = new FormData();
        formDataToSend.append('name', movieName);
        formDataToSend.append('trailer_link', trailerLink);
        formDataToSend.append('start_date', fromDate.toISOString());
        formDataToSend.append('end_date', toDate.toISOString());
        formDataToSend.append('actors', actors);
        formDataToSend.append('production_company', productionCompany);
        formDataToSend.append('director', director);
        formDataToSend.append('running_time', runningTime);
        formDataToSend.append('description', movieDescription);
        formDataToSend.append('status', updatedStatus);
        formDataToSend.append('version', selectedVersions.join(', '));
        formDataToSend.append('genres', genres.join(', '));
        formDataToSend.append('cinema_room', cinemaRoom[0]?.value);
        formDataToSend.append('showtimes', showTimes.join(', '));

        if (moviePoster) formDataToSend.append('image', moviePoster);
        if (movieBanner) formDataToSend.append('banner', movieBanner);

const hide = message.loading('Đang kiểm tra xung đột...', 0);

const conflictCheck = await checkShowtimeConflict({
  cinema_room: selectedRoom, // ID phòng
  showTimes: form.showtimes, // danh sách suất bạn vừa chọn (quan trọng!)
  startDate: form.start_date,
  endDate: form.end_date,
  runningTime: form.running_time
});


if (conflictCheck.conflict) {
    Modal.error({
        title: "Xung đột suất chiếu",
        content: (
            <div className="max-h-64 overflow-y-auto space-y-4">
                
                {/* 🔶 Gợi ý khung giờ an toàn */}
                {Array.isArray(conflictCheck.suggestedShowtimes) && (
                    <div className="bg-yellow-50 border border-yellow-400 p-3 rounded">
                        <p className="font-medium text-yellow-700">⚠️ Khung giờ gợi ý (an toàn):</p>
                        {conflictCheck.suggestedShowtimes.length > 0 ? (
                            <p className="text-yellow-800">
                                {conflictCheck.suggestedShowtimes.join(", ")}
                            </p>
                        ) : (
                            <i className="text-yellow-600">Không còn khung giờ trống phù hợp</i>
                        )}
                    </div>
                )}

                {/* ❌ Các xung đột với phim đã có */}
                {conflictCheck.conflicts?.length > 0 && (
                    <div>
                        <p className="font-semibold text-red-600">Các suất chiếu bị trùng với phim đã có:</p>
                        <ul className="mt-2 list-disc list-inside text-sm text-red-500">
                            {conflictCheck.conflicts.map((item, index) => (
                                <li key={`db-${index}`}>
                                    Ngày <b>{item.date}</b>:{" "}
                                    {item.existingMovie ? <b>{item.existingMovie}</b> : <i>Phim đã có</i>}{" "}
                                    ({item.existingTime}) trùng với suất mới ({item.newTime})
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* ⚠️ Xung đột nội bộ */}
                {conflictCheck.internalConflicts?.length > 0 && (
                    <div>
                        <p className="font-semibold text-orange-600">Các suất chiếu mới bị trùng với nhau:</p>
                        <ul className="mt-2 list-disc list-inside text-sm text-orange-500">
                            {conflictCheck.internalConflicts.map((item, index) => (
                                <li key={`internal-${index}`}>
                                    Suất <b>{item.newTimeA}</b> trùng với <b>{item.newTimeB}</b>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        )
    });
    hide();
    return;
}

hide(); // ẩn loading xung đột
const hideSubmit = message.loading('Đang thêm phim...', 0);

try {
    await axios.post('http://localhost:5000/api/movies', formDataToSend);
    hideSubmit();
    setSuccess(true);
} catch (error) {
    hideSubmit();
    console.error('Error:', error);
    message.error('Lỗi khi thêm phim.');
}


    };

    useEffect(() => {
        const fetchRooms = async () => {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/theater/rooms', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (data.rooms) {
                const options = data.rooms
                    .filter(room => room.is_actived) // chỉ lấy phòng đang hoạt động
                    .map(room => ({
                        value: room.roomId,
                        label: room.roomName,
                        roomType: room.roomType
                    }));

                setRoomOptions(options);
            }
        };
        fetchRooms();
    }, []);

    const checkShowtimeConflict = async () => {
        try {
            const res = await axios.post('http://localhost:5000/api/movies/check-showtime-conflict', {
                cinema_room: formData.cinemaRoom[0]?.value,
                showTimes: formData.showTimes,
                startDate: formData.fromDate,
                endDate: formData.toDate,
                runningTime: parseInt(formData.runningTime)
            });

            return res.data;
        } catch (err) {
            console.error("Lỗi kiểm tra xung đột:", err);
            message.error("Không thể kiểm tra xung đột suất chiếu.");
            return { conflict: true }; // Ngăn gửi tiếp nếu lỗi server
        }
    };



    const resetForm = () => {
        setFormData({
            movieName: '',
            trailerLink: '',
            fromDate: dayjs().startOf('day'), // Use dayjs object directly
            toDate: dayjs().add(30, 'days').startOf('day'), // Use dayjs object directly
            actors: '',
            productionCompany: '',
            director: '',
            runningTime: '',
            moviePoster: '',
            moviePosterPreview: '',
            movieBanner: '',
            movieBannerPreview: '',
            movieDescription: '',
            status: 'coming_soon',
            genres: [],
            version: {
                '2D': false,
                '3D': false,
                'IMAX': false
            },
            cinemaRoom: [],
            showTimes: []
        });
    };

    return (
        <SidebarLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 p-4 md:p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-6xl mx-auto"
                >
                    <div className="text-center mb-8">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent rounded-20">
                                Add New Movie
                            </h1>
                            <p className="text-slate-300 text-sm md:text-lg">Enter details for the new movie</p>
                        </motion.div>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
                        <div
                            className="w-full max-w-4xl mx-auto px-4 bg-slate-800/70 backdrop-blur-lg border border-slate-600/40 shadow-2xl overflow-visible"
                            style={{ borderRadius: '20px' }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/8 via-transparent to-cyan-600/8 pointer-events-none" />
                            <div className="relative p-5 lg:p-6">
                                <form onSubmit={handleSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Increased gap for better spacing */}
                                        <div className="space-y-6"> {/* Increased space-y for better spacing */}
                                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                                                <label className="block text-gray-300 mb-1 font-medium text-sm">
                                                    Movie Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="movieName"
                                                    value={formData.movieName}
                                                    onChange={handleInputChange}
                                                    className="bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                                                    required
                                                />
                                            </motion.div>

                                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> {/* Responsive grid for dates */}
                                                    <div>
                                                        <label className="block text-gray-300 mb-1 font-medium text-sm">
                                                            From Date <span className="text-red-500">*</span>
                                                        </label>
                                                        <DatePicker
                                                            name="fromDate"
                                                            value={formData.fromDate}
                                                            onChange={(date) => setFormData({ ...formData, fromDate: date })}
                                                            disabledDate={(current) => current && current < dayjs().startOf('day')}
                                                            className=" text-black px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-gray-300 mb-1 font-medium text-sm">
                                                            To Date <span className="text-red-500">*</span>
                                                        </label>
                                                        <DatePicker
                                                            name="toDate"
                                                            value={formData.toDate}
                                                            onChange={(date) => setFormData({ ...formData, toDate: date })}
                                                            disabledDate={(current) => current && current < dayjs().startOf('day')}
                                                            className="text-black px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>

                                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
                                                <label className="block text-gray-300 mb-1 font-medium text-sm">
                                                    Actor(s) <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="actors"
                                                    value={formData.actors}
                                                    onChange={handleInputChange}
                                                    className="bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                                                    required
                                                />
                                            </motion.div>

                                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.4 }}>
                                                <label className="block text-gray-300 mb-1 font-medium text-sm">
                                                    Production Company <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="productionCompany"
                                                    value={formData.productionCompany}
                                                    onChange={handleInputChange}
                                                    className="bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                                                    required
                                                />
                                            </motion.div>

                                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.5 }}>
                                                <label className="block text-gray-300 mb-1 font-medium text-sm">
                                                    Director <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="director"
                                                    value={formData.director}
                                                    onChange={handleInputChange}
                                                    className="bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                                                    required
                                                />
                                            </motion.div>

                                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.6 }}>
                                                <label className="block text-gray-300 mb-1 font-medium text-sm">
                                                    Running Time (minutes) <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    name="runningTime"
                                                    value={formData.runningTime}
                                                    onChange={handleInputChange}
                                                    className="bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                                                    required
                                                />
                                            </motion.div>
                                        </div>

                                        <div className="space-y-6"> {/* Increased space-y for better spacing */}
                                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                                                <label className="block text-gray-300 mb-1 font-medium text-sm">
                                                    Trailer Link <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="url"
                                                    name="trailerLink"
                                                    value={formData.trailerLink}
                                                    onChange={handleInputChange}
                                                    className="bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                                                    required
                                                />
                                            </motion.div>

                                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
                                                <label className="block text-gray-300 mb-1 font-medium text-sm">
                                                    Genres <span className="text-red-500">*</span>
                                                </label>
                                                <GenresDropDown
                                                    value={formData.genres}
                                                    onChange={(val) => setFormData({ ...formData, genres: val })}
                                                    className="bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                                                />
                                            </motion.div>

                                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
                                                <label className="block text-gray-300 mb-1 font-medium text-sm">
                                                    Version <span className="text-red-500">*</span>
                                                </label>
                                                <div className="flex flex-wrap gap-3 mt-2"> {/* Use flex-wrap for mobile */}
                                                    {['2D', '3D', 'IMAX'].map((ver) => (
                                                        <button
                                                            key={ver}
                                                            type="button"
                                                            onClick={() => {
                                                                const newVersion = !formData.version[ver];
                                                                const updatedVersion = {
                                                                    ...formData.version,
                                                                    [ver]: newVersion
                                                                };
                                                                setFormData({
                                                                    ...formData,
                                                                    version: updatedVersion,
                                                                    cinemaRoom: [] // Reset selected room when version changes
                                                                });
                                                            }}
                                                            className={`px-5 py-2 rounded-xl border transition-all duration-300 transform hover:scale-105 ${formData.version[ver]
                                                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-700 shadow-md'
                                                                : 'bg-slate-700 text-gray-300 border-slate-600 hover:bg-slate-600/70'
                                                            }`}
                                                        >
                                                            {ver}
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>

                                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.4 }}>
                                                <label className="block text-gray-300 mb-1 font-medium text-sm">
                                                    Cinema Rooms <span className="text-red-500">*</span>
                                                </label>
                                                <DropDown
                                                    value={formData.cinemaRoom[0]}
                                                    onChange={(selectedRoom) => {
                                                        setFormData({
                                                            ...formData,
                                                            cinemaRoom: [selectedRoom],
                                                        });
                                                    }}
                                                    options={filteredRooms}
                                                    disabled={selectedVersions.length === 0}
                                                    className="bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                                                />
                                            </motion.div>

                                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.5 }}>
                                                <label className="block text-gray-300 mb-1 font-medium text-sm">
                                                    Show Times <span className="text-red-500">*</span>
                                                </label>
                                                <MultiTimePicker
                                                    value={formData.showTimes}
                                                    onChange={(val) => setFormData({ ...formData, showTimes: val })}
                                                    className="bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                                                />
                                            </motion.div>

                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.4, delay: 0.6 }}
                                                className="grid grid-cols-1 sm:grid-cols-2 gap-6" // New grid for these two fields
                                            >
                                                <div> {/* Movie Poster */}
                                                    <label className="block text-gray-300 mb-1 font-medium text-sm">
                                                        Movie Poster <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="file"
                                                        name="moviePoster"
                                                        accept="image/*"
                                                        className="hidden"
                                                        id="poster-upload"
                                                        data-testid="movie-poster-input"
                                                        onChange={(e) => {
                                                            if (e.target.files && e.target.files[0]) {
                                                                const file = e.target.files[0];
                                                                setFormData({
                                                                    ...formData,
                                                                    moviePoster: file,
                                                                    moviePosterPreview: URL.createObjectURL(file)
                                                                });
                                                            }
                                                        }}
                                                    />
                                                    <label htmlFor="poster-upload" className="block cursor-pointer">
                                                        {formData.moviePosterPreview ? (
                                                            <img
                                                                src={formData.moviePosterPreview}
                                                                alt="Poster Preview"
                                                                className="w-full h-32 object-contain rounded-xl border-2 border-dashed border-gray-600 hover:border-blue-500 transition-all duration-200"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-32 border-2 border-dashed border-gray-600 flex items-center justify-center rounded-xl text-gray-400 hover:border-blue-500 transition-all duration-200">
                                                                Click to upload poster
                                                            </div>
                                                        )}
                                                    </label>
                                                </div>

                                                <div> {/* Banner Image */}
                                                    <label className="block text-gray-300 mb-1 font-medium text-sm">
                                                        Banner Image <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="file"
                                                        name="movieBanner"
                                                        accept="image/*"
                                                        className="hidden"
                                                        id="banner-upload"
                                                        data-testid="banner-image-input"
                                                        onChange={(e) => {
                                                            if (e.target.files && e.target.files[0]) {
                                                                const file = e.target.files[0];
                                                                setFormData({
                                                                    ...formData,
                                                                    movieBanner: file,
                                                                    movieBannerPreview: URL.createObjectURL(file)
                                                                });
                                                            }
                                                        }}
                                                    />
                                                    <label htmlFor="banner-upload" className="block cursor-pointer">
                                                        {formData.movieBannerPreview ? (
                                                            <img
                                                                src={formData.movieBannerPreview}
                                                                alt="Banner Preview"
                                                                className="w-full h-32 object-contain rounded-xl border-2 border-dashed border-gray-600 hover:border-blue-500 transition-all duration-200"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-32 border-2 border-dashed border-gray-600 flex items-center justify-center rounded-xl text-gray-400 hover:border-blue-500 transition-all duration-200">
                                                                Click to upload banner
                                                            </div>
                                                        )}
                                                    </label>
                                                </div>
                                            </motion.div>

                                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.7 }}> {/* Adjusted delay */}
                                                <label className="block text-gray-300 mb-1 font-medium text-sm">
                                                    Movie Description <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                    name="movieDescription"
                                                    value={formData.movieDescription}
                                                    onChange={handleInputChange}
                                                    rows="4" // Added rows for better initial height
                                                    className="bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                                                    required
                                                ></textarea>
                                            </motion.div>
                                        </div>
                                    </div>

                                    <motion.div
                                        className="mt-8 flex flex-col sm:flex-row justify-center sm:justify-end gap-3"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.9 }}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => navigate('/admin')}
                                            className="w-full sm:w-auto px-6 py-3 border border-red-500 text-red-400 rounded-xl hover:bg-red-900/20 transition duration-200 text-base font-semibold shadow-md hover:shadow-lg"
                                            style={{ height: '48px' }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-none text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                            style={{ height: '48px', borderRadius: '12px' }}
                                        >
                                            Submit Movie
                                        </button>
                                    </motion.div>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Success Modal */}
            <Modal
                open={success}
                onCancel={() => setSuccess(false)}
                footer={null}
                centered
                width={350}
                className="custom-ant-modal" // Add a custom class for styling the modal itself
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-slate-800/90 backdrop-blur-lg border border-slate-600/40 p-6 rounded-xl shadow-lg w-full"
                >
                    <div className="text-center">
                        <div className="mb-4 flex justify-center">
                            <svg className="w-14 h-14 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Success!</h3>
                        <p className="text-gray-300 mb-6 text-sm">Movie added successfully. Do you want to add another movie?</p>
                        <div className="flex flex-col sm:flex-row gap-4"> {/* Responsive buttons in modal */}
                            <button
                                onClick={() => {
                                    setSuccess(false);
                                    resetForm();
                                }}
                                className="flex-1 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 text-sm font-semibold"
                            >
                                Yes
                            </button>
                            <button
                                onClick={() => {
                                    setSuccess(false);
                                    navigate('/admin/movie-list');
                                }}
                                className="flex-1 px-5 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200 text-sm font-semibold"
                            >
                                No
                            </button>
                        </div>
                    </div>
                </motion.div>
            </Modal>
        </SidebarLayout>
    );
};

export default AddMovie;
