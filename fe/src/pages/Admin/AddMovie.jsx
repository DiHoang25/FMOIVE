import React, { useState, useEffect } from 'react';
import SidebarLayout from '../../components/Sidebar-Admin';
import DatePicker from '../../components/DatePicker';
import DropDown from '../../components/DropDown';
import MultiTimePicker from '../../components/TimePicker';
import GenresDropDown from '../../components/GernesPicker';
import { useNavigate } from 'react-router-dom';
import { Modal, message } from 'antd';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import axios from 'axios';
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

        const hide = message.loading('Đang thêm phim...', 0);

        try {
            await axios.post('http://localhost:5000/api/movies', formDataToSend);
            hide();
            setSuccess(true);
        } catch (error) {
            hide();
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
                const options = data.rooms.map(room => ({
                    value: room.roomId,
                    label: room.roomName,
                    roomType: room.roomType
                }));
                setRoomOptions(options);
            }
        };
        fetchRooms();
    }, []);


    const resetForm = () => {
        setFormData({
            movieName: '',
            trailerLink: '',
            fromDate: new Date().toISOString(),
            toDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="bg-slate-800 rounded-lg p-6 mt-6 max-w-6xl mx-auto shadow-xl">
                    <h1 className="text-2xl text-white font-bold text-center mb-4 pb-2 border-b border-gray-700">
                        Add new movie
                    </h1>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-gray-300 mb-1">
                                        Movie Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="movieName"
                                        value={formData.movieName}
                                        onChange={handleInputChange}
                                        className="w-full p-2 rounded bg-slate-700 text-white"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-300 mb-1">
                                            From Date <span className="text-red-500">*</span>
                                        </label>
                                        <DatePicker
                                            name="fromDate"
                                            value={formData.fromDate}
                                            onChange={(date) => setFormData({ ...formData, fromDate: date })}
                                            disabledDate={(current) => current && current < dayjs().startOf('day')}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 mb-1">
                                            To Date <span className="text-red-500">*</span>
                                        </label>
                                        <DatePicker
                                            name="toDate"
                                            value={formData.toDate}
                                            onChange={(date) => setFormData({ ...formData, toDate: date })}
                                            disabledDate={(current) => current && current < dayjs().startOf('day')}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-1">
                                        Actor(s) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="actors"
                                        value={formData.actors}
                                        onChange={handleInputChange}
                                        className="w-full p-2 rounded bg-slate-700 text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-1">
                                        Production Company <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="productionCompany"
                                        value={formData.productionCompany}
                                        onChange={handleInputChange}
                                        className="w-full p-2 rounded bg-slate-700 text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-1">
                                        Director <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="director"
                                        value={formData.director}
                                        onChange={handleInputChange}
                                        className="w-full p-2 rounded bg-slate-700 text-white"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-300 mb-1">
                                            Running Time (minutes) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="runningTime"
                                            value={formData.runningTime}
                                            onChange={handleInputChange}
                                            className="w-full p-2 rounded bg-slate-700 text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-300 mb-1">
                                            Version <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex space-x-3 mt-2">
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
                                                            cinemaRoom: [] // ✅ Reset phòng đã chọn khi thay version
                                                        });
                                                    }}
                                                    className={`px-4 py-2 rounded-lg border transition ${formData.version[ver]
                                                        ? 'bg-red-600 text-white border-red-700'
                                                        : 'bg-slate-700 text-gray-300 border-slate-600 hover:bg-slate-600'
                                                        }`}
                                                >
                                                    {ver}
                                                </button>
                                            ))}
                                        </div>

                                    </div>

                                    <div>
                                        <label className="block text-gray-300 mb-1">
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
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-300 mb-1">
                                            Show Times <span className="text-red-500">*</span>
                                        </label>
                                        <MultiTimePicker
                                            value={formData.showTimes}
                                            onChange={(val) => setFormData({ ...formData, showTimes: val })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-gray-300 mb-1">
                                        Trailer Link <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="url"
                                        name="trailerLink"
                                        value={formData.trailerLink}
                                        onChange={handleInputChange}
                                        className="w-full p-2 rounded bg-slate-700 text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-1">
                                        Genres <span className="text-red-500">*</span>
                                    </label>
                                    <GenresDropDown
                                        value={formData.genres}
                                        onChange={(val) => setFormData({ ...formData, genres: val })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-1">
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
                                                className="w-full h-32 object-contain rounded border-2 border-dashed border-gray-600"
                                            />
                                        ) : (
                                            <div className="w-full h-32 border-2 border-dashed border-gray-600 flex items-center justify-center rounded text-gray-400">
                                                Click to upload poster
                                            </div>
                                        )}
                                    </label>
                                </div>



                                <div>
                                    <label className="block text-gray-300 mb-1">
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
                                                className="w-full h-32 object-contain rounded border-2 border-dashed border-gray-600"
                                            />
                                        ) : (
                                            <div className="w-full h-32 border-2 border-dashed border-gray-600 flex items-center justify-center rounded text-gray-400">
                                                Click to upload banner
                                            </div>
                                        )}
                                    </label>
                                </div>


                                <div>
                                    <label className="block text-gray-300 mb-1">
                                        Movie Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="movieDescription"
                                        value={formData.movieDescription}
                                        onChange={handleInputChange}
                                        className="w-full p-2 rounded bg-slate-700 text-white"
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => navigate('/admin')}
                                className="flex items-center px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition duration-300 transform hover:-translate-y-1"
                            >
                                Submit Movie
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <Modal
                open={success}
                onCancel={() => setSuccess(false)}
                footer={null}
                centered
                width={350}
            >
                <div className="text-center p-6">
                    <div className="text-green-500 text-5xl mb-4">✔️</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Success</h3>
                    <p className="text-sm text-gray-600 mb-4">Movie added successfully. Do you want to add another movie?</p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => {
                                setSuccess(false);
                                resetForm();
                            }}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                        >
                            Yes
                        </button>
                        <button
                            onClick={() => {
                                setSuccess(false);
                                navigate('/admin/movie-list');
                            }}
                            className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                        >
                            No
                        </button>
                    </div>
                </div>
            </Modal>
        </SidebarLayout>
    );
};

export default AddMovie;
