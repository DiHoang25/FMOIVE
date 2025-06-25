import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SidebarLayout from '../../components/Sidebar-Admin';
import DatePicker from '../../components/DatePicker';
import DropDown from '../../components/DropDown';
import TimePicker from '../../components/TimePicker';
import GernesPicker from '../../components/GernesPicker';
import MultiTimePicker from '../../components/TimePicker';

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
        movieDescription: '',
        genres: {},
        version: {},
        showTimes: [],
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
                    fromDate: data.start_date || '',
                    toDate: data.end_date || '',
                    actors: data.actors || '',
                    productionCompany: data.production_company || '',
                    director: data.director || '',
                    runningTime: data.running_time || '',
                    moviePoster: '',
                    movieDescription: data.description || '',
                    genres: data.genres || {},
                    version: data.version || {}
                });
            } catch (error) {
                console.error('Failed to fetch movie:', error);
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

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Submitted movie data:', formData);
        // Call API to update movie here
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
                                    <label className="block text-gray-300 mb-1">Movie Name *</label>
                                    <input type="text" name="movieName" value={formData.movieName} onChange={handleInputChange} className="w-full p-3 rounded-lg bg-slate-700 text-white" required />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-300 mb-1">From Date *</label>
                                        <DatePicker name="fromDate" value={formData.fromDate} onChange={(date, dateString) => handleInputChange({ target: { name: 'fromDate', value: dateString } })} className="w-full" required />
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 mb-1">To Date *</label>
                                        <DatePicker name="toDate" value={formData.toDate} onChange={(date, dateString) => handleInputChange({ target: { name: 'toDate', value: dateString } })} className="w-full" required />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-1">Actor(s) *</label>
                                    <input type="text" name="actors" value={formData.actors} onChange={handleInputChange} className="w-full p-2 rounded bg-slate-700 text-white" required />
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-1">Production Company *</label>
                                    <input type="text" name="productionCompany" value={formData.productionCompany} onChange={handleInputChange} className="w-full p-2 rounded bg-slate-700 text-white" required />
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-1">Director *</label>
                                    <input type="text" name="director" value={formData.director} onChange={handleInputChange} className="w-full p-2 rounded bg-slate-700 text-white" required />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-300 mb-1">Running Time (minutes) *</label>
                                        <input type="number" name="runningTime" value={formData.runningTime} onChange={handleInputChange} className="w-full p-2 rounded bg-slate-700 text-white" required />
                                    </div>

                                    <div>
                                        <label className="block text-gray-300 mb-1">Version *</label>
                                        <div className="flex space-x-3 mt-2">
                                            {['2D', '3D', 'IMAX'].map((ver) => (
                                                <button key={ver} type="button" onClick={() => setFormData({ ...formData, version: { ...formData.version, [ver]: !formData.version[ver] } })} className={`px-4 py-2 rounded-lg border transition ${formData.version[ver] ? 'bg-red-600 text-white border-red-700' : 'bg-slate-700 text-gray-300 border-slate-600 hover:bg-slate-600'}`}>
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
                                    <label className="block text-gray-300 mb-1">Trailer Link *</label>
                                    <input type="url" name="trailerLink" value={formData.trailerLink} onChange={handleInputChange} className="w-full p-2 rounded bg-slate-700 text-white" required />
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-1">Genres *</label>
                                    <GernesPicker />
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-1">Movie Poster *</label>
                                    <input type="file" name="moviePoster" accept="image/*" className="hidden" id="poster-upload" onChange={(e) => console.log(e.target.files[0])} required />
                                    <label htmlFor="poster-upload" className="w-full h-32 border-2 border-dashed border-gray-600 flex items-center justify-center cursor-pointer rounded">
                                        <div className="text-center text-gray-400">
                                            <p>Click to upload poster</p>
                                        </div>
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-1">Movie Description *</label>
                                    <textarea name="movieDescription" value={formData.movieDescription} onChange={handleInputChange} className="w-full p-2 rounded bg-slate-700 text-white" required></textarea>
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
