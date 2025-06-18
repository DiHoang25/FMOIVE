import React, { useState } from 'react';
import SidebarLayout from '../../components/Sidebar-Admin';
import DatePicker from '../../components/DatePicker'
import DropDown from '../../components/DropDown'
import TimePicker from '../../components/TimePicker'
import GernesPicker from '../../components/GernesPicker'
import { useNavigate } from 'react-router-dom';

const EditMovie = () => {
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
        movieDescription: '',
        genres: {
            action: false,
            comedy: false,
            drama: false,
            horror: false,
            romance: false,
            sciFi: false,
            thriller: false,
            animation: false
        },
        version: {
            '2D': false,
            '3D': false,
            'IMAX': false
        }
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };
    const navigate = useNavigate();
    // const handleGenreChange = (e) => {
    //     const { name, checked } = e.target;
    //     setFormData({
    //         ...formData,
    //         genres: {
    //             ...formData.genres,
    //             [name]: checked
    //         }
    //     });
    // };

    // const handleVersionChange = (e) => {
    //     const { name, checked } = e.target;
    //     setFormData({
    //         ...formData,
    //         version: {
    //             ...formData.version,
    //             [name]: checked
    //         }
    //     });
    // };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Submitted movie data:', formData);
        // Add API call to submit movie data here
    };


    return (
        <SidebarLayout>
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Main Form Container */}
                <div className="bg-slate-800 rounded-lg p-6 mt-6 max-w-6xl mx-auto shadow-xl">
                    <h1 className="text-2xl text-white font-bold text-center mb-4 pb-2 border-b border-gray-700">
                        Edit Movie
                    </h1>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Left Column */}
                            <div className="space-y-3">
                                {/* Movie Name */}
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

                                {/* From Date and To Date */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-300 mb-1 ">From Date *</label>
                                        <DatePicker
                                            name="fromDate"
                                            value={formData.fromDate}
                                            onChange={(date, dateString) => handleInputChange({
                                                target: {
                                                    name: 'fromDate',
                                                    value: dateString
                                                }
                                            })}
                                            className="w-full"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 mb-1">To Date *</label>
                                        <DatePicker
                                            name="toDate"
                                            value={formData.toDate}
                                            onChange={(date, dateString) => handleInputChange({
                                                target: {
                                                    name: 'toDate',
                                                    value: dateString
                                                }
                                            })}
                                            className="w-full"
                                            required
                                        />
                                    </div>
                                </div>
                                {/* Actors */}
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

                                {/* Production Company */}
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

                                {/* Director */}
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

                                {/* Running Time and Version */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-300 mb-1">Running Time (minutes) *</label>
                                        <input
                                            type="number"
                                            name="runningTime"
                                            value={formData.runningTime}
                                            onChange={handleInputChange}
                                            className="w-full p-2 rounded bg-slate-700 text-white"
                                            placeholder="120"
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
                                                    onClick={() =>
                                                        setFormData({
                                                            ...formData,
                                                            version: {
                                                                ...formData.version,
                                                                [ver]: !formData.version[ver],
                                                            },
                                                        })
                                                    }
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
                                        <label className="block text-gray-300 mb-1">Cinema Rooms</label>
                                        <DropDown />
                                    </div>

                                    <div>
                                        <label className="block text-gray-300 mb-1">Show Times</label>
                                        <TimePicker />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-3">
                                {/* Trailer Link */}
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

                                {/* Genres */}
                                <div>
                                    <label className="block text-gray-300 mb-1">Genres * (Select all that apply)</label>
                                    <GernesPicker />
                                </div>

                                {/* Movie Poster */}
                                <div>
                                    <label className="block text-gray-300 mb-1">Movie Poster *</label>
                                    <input
                                        type="file"
                                        name="moviePoster"
                                        accept="image/*"
                                        className="hidden"
                                        id="poster-upload"
                                        onChange={(e) => {
                                            // Handle file upload
                                            console.log(e.target.files[0]);
                                        }}
                                        required
                                    />
                                    <label
                                        htmlFor="poster-upload"
                                        className="w-full h-32 border-2 border-dashed border-gray-600 flex items-center justify-center cursor-pointer rounded"
                                    >
                                        <div className="text-center text-gray-400">
                                            <p>Click to upload poster</p>
                                        </div>
                                    </label>
                                </div>

                                {/* Movie Description */}
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

                        {/* Form Buttons */}
                        <div className="mt-6 flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/movie-list')}
                                className="flex items-center px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition duration-300 transform hover:-translate-y-1"
                            >
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