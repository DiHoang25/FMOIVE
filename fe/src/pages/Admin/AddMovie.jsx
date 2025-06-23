import React, { useState } from 'react';
import SidebarLayout from '../../components/Sidebar-Admin';
import DatePicker from '../../components/DatePicker';
import DropDown from '../../components/DropDown';
import MultiTimePicker from '../../components/TimePicker';
import GenresDropDown from '../../components/GernesPicker';
import { useNavigate } from 'react-router-dom';
import { Modal } from 'antd';

const AddMovie = () => {
    const [formData, setFormData] = useState({
        movieName: '',
        trailerLink: '',
        fromDate: new Date().toISOString(),
        toDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        actors: '',
        productionCompany: '',
        director: '',
        runningTime: '',
        moviePoster: '',
        movieBanner: '',
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.cinemaRoom || formData.cinemaRoom.length === 0) {
            alert('Vui lòng chọn ít nhất một phòng chiếu!');
            return;
        }

        const selectedVersions = Object.keys(formData.version).filter(v => formData.version[v]);

        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.movieName);
        formDataToSend.append('trailer_link', formData.trailerLink);
        formDataToSend.append('start_date', formData.fromDate);
        formDataToSend.append('end_date', formData.toDate);
        formDataToSend.append('actors', formData.actors);
        formDataToSend.append('production_company', formData.productionCompany);
        formDataToSend.append('director', formData.director);
        formDataToSend.append('running_time', formData.runningTime);
        formDataToSend.append('description', formData.movieDescription);
        formDataToSend.append('status', formData.status);
        formDataToSend.append('version', selectedVersions.join(', '));
        formDataToSend.append('genres', formData.genres.join(', '));
        formDataToSend.append('cinema_room', formData.cinemaRoom[0]);
        formDataToSend.append('showtimes', formData.showTimes.join(', '));

        if (formData.moviePoster) {
            formDataToSend.append('image', formData.moviePoster);
        }
        if (formData.movieBanner) {
            formDataToSend.append('banner', formData.movieBanner);
        }

        try {
            const response = await fetch('http://localhost:5000/api/movies', {
                method: 'POST',
                body: formDataToSend
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            await response.json();
            setSuccess(true);
        } catch (error) {
            console.error('Error:', error);
            alert('Error adding movie');
        }
    };


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
            movieBanner: '',
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
                                    <label className="block text-gray-300 mb-1">Movie Name *</label>
                                    <input
                                        type="text"
                                        name="movieName"
                                        value={formData.movieName}
                                        onChange={handleInputChange}
                                        className="w-full p-3 rounded-lg bg-slate-700 text-white"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-300 mb-1">From Date *</label>
                                        <DatePicker
                                            name="fromDate"
                                            value={formData.fromDate}
                                            onChange={(date, dateString) => handleInputChange({ target: { name: 'fromDate', value: dateString } })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 mb-1">To Date *</label>
                                        <DatePicker
                                            name="toDate"
                                            value={formData.toDate}
                                            onChange={(date, dateString) => handleInputChange({ target: { name: 'toDate', value: dateString } })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-1">Actor(s) *</label>
                                    <input
                                        type="text"
                                        name="actors"
                                        value={formData.actors}
                                        onChange={handleInputChange}
                                        className="w-full p-2 rounded bg-slate-700 text-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-1">Production Company *</label>
                                    <input
                                        type="text"
                                        name="productionCompany"
                                        value={formData.productionCompany}
                                        onChange={handleInputChange}
                                        className="w-full p-2 rounded bg-slate-700 text-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-1">Director *</label>
                                    <input
                                        type="text"
                                        name="director"
                                        value={formData.director}
                                        onChange={handleInputChange}
                                        className="w-full p-2 rounded bg-slate-700 text-white"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-300 mb-1">Running Time (minutes) *</label>
                                        <input
                                            type="number"
                                            name="runningTime"
                                            value={formData.runningTime}
                                            onChange={handleInputChange}
                                            className="w-full p-2 rounded bg-slate-700 text-white"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-300 mb-1">Version *</label>
                                        <div className="flex space-x-3 mt-2">
                                            {['2D', '3D', 'IMAX'].map((ver) => (
                                                <button
                                                    key={ver}
                                                    type="button"
                                                    onClick={() => setFormData({
                                                        ...formData,
                                                        version: {
                                                            ...formData.version,
                                                            [ver]: !formData.version[ver]
                                                        }
                                                    })}
                                                    className={`px-4 py-2 rounded-lg border transition ${formData.version[ver] ? 'bg-red-600 text-white border-red-700' : 'bg-slate-700 text-gray-300 border-slate-600 hover:bg-slate-600'}`}
                                                >
                                                    {ver}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-gray-300 mb-1">Cinema Rooms *</label>
                                        <DropDown
                                            value={formData.cinemaRoom}
                                            onChange={(val) => setFormData({ ...formData, cinemaRoom: val })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-300 mb-1">Show Times *</label>
                                        <MultiTimePicker
                                            value={formData.showTimes}
                                            onChange={(val) => setFormData({ ...formData, showTimes: val })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-gray-300 mb-1">Trailer Link *</label>
                                    <input
                                        type="url"
                                        name="trailerLink"
                                        value={formData.trailerLink}
                                        onChange={handleInputChange}
                                        className="w-full p-2 rounded bg-slate-700 text-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-1">Genres *</label>
                                    <GenresDropDown
                                        value={formData.genres}
                                        onChange={(val) => setFormData({ ...formData, genres: val })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-1">Movie Poster *</label>
                                    <input
                                        type="file"
                                        name="moviePoster"
                                        accept="image/*"
                                        className="hidden"
                                        id="poster-upload"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setFormData({ ...formData, moviePoster: e.target.files[0] });
                                            }
                                        }}
                                        required
                                    />
                                    <label htmlFor="poster-upload" className="w-full h-32 border-2 border-dashed border-gray-600 flex items-center justify-center cursor-pointer rounded">
                                        <div className="text-center text-gray-400">
                                            <p>Click to upload poster</p>
                                        </div>
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-1">Banner Image *</label>
                                    <input
                                        type="file"
                                        name="movieBanner"
                                        accept="image/*"
                                        className="hidden"
                                        id="banner-upload"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setFormData({ ...formData, movieBanner: e.target.files[0] });
                                            }
                                        }}
                                        required
                                    />
                                    <label htmlFor="banner-upload" className="w-full h-32 border-2 border-dashed border-gray-600 flex items-center justify-center cursor-pointer rounded">
                                        <div className="text-center text-gray-400">
                                            <p>Click to upload banner</p>
                                        </div>
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-1">Movie Description *</label>
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
                                navigate('/admin');
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
