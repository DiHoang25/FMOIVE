import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SidebarLayout from '../../components/Sidebar-Admin';
import DatePicker from '../../components/DatePicker';
import DropDown from '../../components/DropDown';
import GenresDropDown from '../../components/GernesPicker'; // Corrected typo: GenresPicker
import MultiTimePicker from '../../components/TimePicker'; // Changed to MultiTimePicker for consistency
import { Modal, message } from 'antd';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'; // Import for consistency in date validation
import axios from 'axios';
import { motion } from 'framer-motion'; // Import motion for animations

dayjs.extend(isSameOrBefore); // Extend dayjs for date comparison

const EditMovie = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        movieName: '',
        trailerLink: '',
        fromDate: null, // Changed to null for consistency
        toDate: null,   // Changed to null for consistency
        actors: '',
        productionCompany: '',
        director: '',
        runningTime: '',
        moviePoster: '',
        moviePosterPreview: '',
        movieBanner: '',
        movieBannerPreview: '',
        movieDescription: '',
        status: '',
        genres: [],
        version: {
            '2D': false,
            '3D': false,
            'IMAX': false
        },
        cinemaRoom: [],
        showTimes: []
    });

    const [loading, setLoading] = useState(true);
    const [roomOptions, setRoomOptions] = useState([]);

    const selectedVersions = Object.keys(formData.version).filter(v => formData.version[v]);
    const filteredRooms = roomOptions.filter(room => selectedVersions.includes(room.roomType));

    useEffect(() => {
        const fetchMovie = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/movies/${id}`);
                const data = response.data;

                setFormData({
                    movieName: data.name || '',
                    trailerLink: data.trailer_link || '',
                    fromDate: data.start_date ? dayjs(data.start_date) : null,
                    toDate: data.end_date ? dayjs(data.end_date) : null,
                    actors: data.actors || '',
                    productionCompany: data.production_company || '',
                    director: data.director || '',
                    runningTime: data.running_time || '',
                    movieDescription: data.description || '',
                    moviePosterPreview: data.image_url || '',
                    movieBannerPreview: data.banner_url || '',
                    cinemaRoom: data.cinema_room
                        ? [{
                                value: data.cinema_room.roomId,
                                label: data.cinema_room.roomName,
                                roomType: data.cinema_room.roomType
                            }]
                        : [],
                    genres: data.genres || [],
                    version: {
                        '2D': data.version?.includes('2D'),
                        '3D': data.version?.includes('3D'),
                        'IMAX': data.version?.includes('IMAX'),
                    },
                    showTimes: Array.isArray(data.showtimes) ? data.showtimes : [],
                });
            } catch (err) {
                console.error('Failed to fetch movie:', err);
                message.error('Lỗi khi tải thông tin phim');
            } finally {
                setLoading(false);
            }
        };

        fetchMovie();
    }, [id]);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/theater/rooms', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const options = res.data.rooms
                    .filter(room => room.is_actived && !room.is_deleted)
                    .map(room => ({
                        value: room.roomId,
                        label: room.roomName,
                        roomType: room.roomType
                    }));

                setRoomOptions(options);
            } catch (err) {
                console.error('Failed to fetch rooms:', err);
            }
        };

        fetchRooms();
    }, []);

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

        // === VALIDATION CHECKS (Copied from AddMovie for consistency) ===
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
        if (!formData.moviePosterPreview && !moviePoster) return message.error("Vui lòng chọn poster phim."); // Check for existing preview or new file
        if (!formData.movieBannerPreview && !movieBanner) return message.error("Vui lòng chọn banner phim."); // Check for existing preview or new file
        if (!movieDescription.trim()) return message.error("Vui lòng nhập mô tả phim.");


        // === STATUS CALCULATION (Copied from AddMovie for consistency) ===
        const today = dayjs().startOf('day');
        const movieStart = dayjs(fromDate).startOf('day');
        const updatedStatus = movieStart.isSameOrBefore(today) ? 'now_showing' : 'coming_soon';


        const formDataToSend = new FormData();
        formDataToSend.append('name', movieName);
        formDataToSend.append('trailer_link', trailerLink);
        formDataToSend.append('start_date', fromDate?.toISOString());
        formDataToSend.append('end_date', toDate?.toISOString());
        formDataToSend.append('actors', actors);
        formDataToSend.append('production_company', productionCompany);
        formDataToSend.append('director', director);
        formDataToSend.append('running_time', runningTime);
        formDataToSend.append('description', movieDescription);
        formDataToSend.append('status', updatedStatus); // Include status
        formDataToSend.append('version', selectedVersions.join(', '));
        formDataToSend.append('genres', genres.join(', '));
        formDataToSend.append('cinema_room', cinemaRoom[0]?.value);
        formDataToSend.append('showtimes', showTimes.join(', '));

        if (moviePoster) formDataToSend.append('image', moviePoster);
        if (movieBanner) formDataToSend.append('banner', movieBanner);

        const hide = message.loading('Đang cập nhật phim...', 0); // Loading message

        try {
            await axios.put(`http://localhost:5000/api/movies/${id}`, formDataToSend);
            hide();
            message.success('Đã cập nhật thông tin phim thành công!');
            navigate('/admin/movie-list');
        } catch (err) {
            hide();
            console.error('Error updating movie:', err);
            message.error(`Cập nhật thất bại: ${err.message || 'Unknown error'}`);
        }
    };

    if (loading) return <div className="text-white p-4">Loading...</div>;

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
                                Edit Movie
                            </h1>
                            <p className="text-slate-300 text-sm md:text-lg">Update movie details</p>
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-6">
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
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-gray-300 mb-1 font-medium text-sm">
                                                            From Date <span className="text-red-500">*</span>
                                                        </label>
                                                        <DatePicker
                                                            name="fromDate"
                                                            value={formData.fromDate}
                                                            onChange={(date) => setFormData({ ...formData, fromDate: date })}
                                                            disabledDate={(current) => current && current < dayjs().startOf('day')}
                                                            className="bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
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
                                                            className="bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
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

                                        <div className="space-y-6">
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
                                                <div className="flex flex-wrap gap-3 mt-2">
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
                                                                    cinemaRoom: []
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
                                                <MultiTimePicker // Use MultiTimePicker here
                                                    value={formData.showTimes}
                                                    onChange={(val) => setFormData({ ...formData, showTimes: val })}
                                                    className="bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                                                />
                                            </motion.div>

                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.4, delay: 0.6 }}
                                                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                                            >
                                                <div>
                                                    <label className="block text-gray-300 mb-1 font-medium text-sm">
                                                        Movie Poster <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="file"
                                                        name="moviePoster"
                                                        accept="image/*"
                                                        className="hidden"
                                                        id="poster-upload"
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

                                                <div>
                                                    <label className="block text-gray-300 mb-1 font-medium text-sm">
                                                        Banner Image <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="file"
                                                        name="movieBanner"
                                                        accept="image/*"
                                                        className="hidden"
                                                        id="banner-upload"
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

                                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.7 }}>
                                                <label className="block text-gray-300 mb-1 font-medium text-sm">
                                                    Movie Description <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                    name="movieDescription"
                                                    value={formData.movieDescription}
                                                    onChange={handleInputChange}
                                                    rows="4"
                                                    className="bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                                                    required
                                                ></textarea>
                                            </motion.div>
                                        </div>
                                    </div>

                                    <motion.div
                                        className="mt-8 flex flex-col sm:flex-row justify-center gap-3"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.9 }}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => navigate('/admin/movie-list')}
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
                                            Edit Movie
                                        </button>
                                    </motion.div>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </SidebarLayout>
    );
};

export default EditMovie;