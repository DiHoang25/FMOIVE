import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SidebarLayout from '../../components/Sidebar-Admin';
import DatePicker from '../../components/DatePicker';
import DropDown from '../../components/DropDown';
import GenresDropDown from '../../components/GernesPicker';
import TimePicker from '../../components/TimePicker';
import { Modal, message } from 'antd';
import dayjs from 'dayjs';


const EditMovie = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        movieName: '',
        trailerLink: '',
        fromDate: '',
        toDate: '',
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

    useEffect(() => {
        const fetchMovie = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/movies/${id}`);
                const data = await response.json();

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
                    cinemaRoom: data.cinema_room ? [data.cinema_room] : [],

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.movieName);
            formDataToSend.append('trailer_link', formData.trailerLink);
            formDataToSend.append('start_date', formData.fromDate?.toISOString());
            formDataToSend.append('end_date', formData.toDate?.toISOString());
            formDataToSend.append('actors', formData.actors);
            formDataToSend.append('production_company', formData.productionCompany);
            formDataToSend.append('director', formData.director);
            formDataToSend.append('running_time', formData.runningTime);
            formDataToSend.append('description', formData.movieDescription);
            formDataToSend.append('genres', formData.genres.join(','));
            formDataToSend.append('cinema_room', formData.cinemaRoom.join(','));
            formData.showTimes.forEach((time) => {
                formDataToSend.append('showtimes[]', time.trim());
            });
            const versions = [];
            if (formData.version['2D']) versions.push('2D');
            if (formData.version['3D']) versions.push('3D');
            if (formData.version['IMAX']) versions.push('IMAX');
            formDataToSend.append('version', versions.join(','));

            if (formData.moviePoster) {
                formDataToSend.append('image', formData.moviePoster);
            }

            if (formData.movieBanner) {
                formDataToSend.append('banner', formData.movieBanner);
            }

            const response = await fetch(`http://localhost:5000/api/movies/${id}`, {
                method: 'PUT',
                body: formDataToSend
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Cập nhật thất bại');
            }

            const result = await response.json();
            message.success('Đã cập nhật thông tin phim thành công!');
            navigate('/admin/movie-list');
        } catch (err) {
            console.error('Error updating movie:', err);
            message.error(`Cập nhật thất bại: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-white p-4">Loading...</div>;

    return (
        <SidebarLayout>
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="bg-slate-800 rounded-lg p-6 mt-6 max-w-6xl mx-auto shadow-xl">
                    <h1 className="text-2xl text-white font-bold text-center mb-4 pb-2 border-b border-gray-700">
                        Edit Movie
                    </h1>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-gray-300 mb-1">
                                        Movie Name <span className="text-red-500">*</span>
                                    </label>
                                    <input type="text" name="movieName" value={formData.movieName} onChange={handleInputChange} className="w-full p-2 rounded bg-slate-700 text-white" required />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-300 mb-1">
                                            From Date <span className="text-red-500">*</span>
                                        </label>
                                        <DatePicker
                                            value={formData.fromDate}
                                            onChange={(date) =>
                                                setFormData((prev) => ({ ...prev, fromDate: date }))
                                            }
                                            disabledDate={(current) => current && current < dayjs().startOf('day')}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 mb-1">
                                            To Date <span className="text-red-500">*</span>
                                        </label>
                                        <DatePicker
                                            value={formData.toDate}
                                            onChange={(date) =>
                                                setFormData((prev) => ({ ...prev, toDate: date }))
                                            }
                                            disabledDate={(current) => current && current < dayjs().startOf('day')}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-1">
                                        Actor(s) <span className="text-red-500">*</span>
                                    </label>
                                    <input type="text" name="actors" value={formData.actors} onChange={handleInputChange} className="w-full p-2 rounded bg-slate-700 text-white" required />
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-1">
                                        Product Company <span className="text-red-500">*</span>
                                    </label>
                                    <input type="text" name="productionCompany" value={formData.productionCompany} onChange={handleInputChange} className="w-full p-2 rounded bg-slate-700 text-white" required />
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-1">
                                        Director <span className="text-red-500">*</span>
                                    </label>
                                    <input type="text" name="director" value={formData.director} onChange={handleInputChange} className="w-full p-2 rounded bg-slate-700 text-white" required />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-300 mb-1">
                                            Running Time (minutes) <span className="text-red-500">*</span>
                                        </label>
                                        <input type="number" name="runningTime" value={formData.runningTime} onChange={handleInputChange} className="w-full p-2 rounded bg-slate-700 text-white" required />
                                    </div>

                                    <div>
                                        <label className="block text-gray-300 mb-1">
                                            Version <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex space-x-3 mt-2">
                                            {['2D', '3D', 'IMAX'].map((ver) => (
                                                <button key={ver} type="button" onClick={() => setFormData({ ...formData, version: { ...formData.version, [ver]: !formData.version[ver] } })} className={`px-4 py-2 rounded-lg border transition ${formData.version[ver] ? 'bg-red-600 text-white border-red-700' : 'bg-slate-700 text-gray-300 border-slate-600 hover:bg-slate-600'}`}>
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
                                            value={formData.cinemaRoom}
                                            onChange={(val) => setFormData({ ...formData, cinemaRoom: val })}
                                        />

                                    </div>

                                    <div>
                                        <label className="block text-gray-300 mb-1">
                                            Show Times <span className="text-red-500">*</span>
                                        </label>
                                        <TimePicker
                                            value={formData.showTimes}
                                            onChange={(times) =>
                                                setFormData({ ...formData, showTimes: times })
                                            }
                                        />

                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-gray-300 mb-1">
                                        Trailer Link <span className="text-red-500">*</span>
                                    </label>
                                    <input type="url" name="trailerLink" value={formData.trailerLink} onChange={handleInputChange} className="w-full p-2 rounded bg-slate-700 text-white" required />
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
                                        required
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-4">
                            <button type="button" onClick={() => navigate('/admin/movie-list')} className="flex items-center px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition">
                                Cancel
                            </button>
                            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition duration-300 transform hover:-translate-y-1">
                                Edit Movie
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </SidebarLayout>
    );
};

export default EditMovie;
