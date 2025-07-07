import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player/youtube';
import { useNavigate, useParams } from 'react-router-dom';

const MovieDetails = () => {
    const { id } = useParams(); // Lấy id từ URL
    const [movie, setMovie] = useState(null);
    const [startDate, setStartDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState('');
    const navigate = useNavigate();

    const getWeekDates = (startDate) => {
        const dates = [];
        for (let i = 0; i < 6; i++) {
            const next = new Date(startDate);
            next.setDate(startDate.getDate() + i);
            dates.push(next);
        }
        return dates;
    };

    const formatDate = (date) => {
        const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        return `${date.getDate().toString().padStart(2, '0')} ${days[date.getDay()]}`;
    };

    useEffect(() => {
        const fetchMovie = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/movies/${id}`);
                const data = await res.json();
                setMovie(data);
            } catch (error) {
                console.error('Lỗi lấy chi tiết phim:', error);
            }
        };
        fetchMovie();
    }, [id]);

    if (!movie) return <div className="text-white text-center mt-20">Loading...</div>;

    return (
        <div className="bg-black text-white px-6 py-10 max-w-full mx-auto">
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-shrink-0 w-full lg:w-1/3">
                    <img src={movie.image_url} alt={movie.name} className="w-80 rounded-lg shadow-lg mx-auto" />
                </div>

                <div className="flex-1 space-y-3">
                    <h1 className="text-2xl font-bold uppercase tracking-wider">{movie.name}</h1>
                    <hr className="border-red-500 w-45 mb-4" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className=" text-xl" >
                            <p><span className="font-semibold text-2xl">Release date:</span> {new Date(movie.start_date).toLocaleDateString('vi-VN')}</p>
                            <p><span className="font-semibold text-2xl">Genre:</span> {movie.genres?.join(', ')}</p>
                            <p><span className="font-semibold text-2xl">Duration Time:</span> {movie.running_time} min</p>
                            <p><span className="font-semibold text-2xl">Director:</span> {movie.director}</p>
                            <p><span className="font-semibold text-2xl">Actor:</span> {movie.actors}</p>
                        </div>
                        <div className=" text-xl">
                            <p><span className="font-semibold text-xl">Distributed by:</span> {movie.production_company}</p>
                        </div>
                    </div>

                    <div className="mt-6 text-xl">
                        <p className="font-semibold mb-1">Summary:</p>
                        <p className="text-gray-300">{movie.description}</p>
                    </div>
                </div>
            </div>

            <div className="mt-10 text-center bg-gray-900 p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-red-500 mb-4">Choose Your Show</h2>
                <div className="flex items-center justify-center gap-2 mb-6">
                    <button onClick={() => setStartDate(prev => new Date(prev.setDate(prev.getDate() - 6)))}
                        className="p-2 rounded-full hover:bg-gray-700">❮</button>

                    {getWeekDates(startDate).map((date, idx) => {
                        const label = formatDate(date);
                        return (
                            <button key={idx}
                                onClick={() => setSelectedDate(label)}
                                className={`px-4 py-2 rounded text-sm font-medium ${selectedDate === label ? 'bg-yellow-400 text-black' : 'bg-gray-800 hover:bg-red-600'}`}>
                                {label}
                            </button>
                        );
                    })}

                    <button onClick={() => setStartDate(prev => new Date(prev.setDate(prev.getDate() + 6)))}
                        className="p-2 rounded-full hover:bg-gray-700">❯</button>
                </div>

                {selectedDate && (
                    <>
                        <div className="flex flex-wrap justify-center gap-3">
                            {movie.showtimes.map((time, idx) => (
                                <button key={idx}
                                    onClick={() => setSelectedTime(time)}
                                    className={`px-4 py-2 rounded text-sm font-medium ${selectedTime === time ? 'bg-yellow-400 text-black' : 'bg-gray-700 hover:bg-red-600'}`}>
                                    {time}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => {
                                if (selectedDate && selectedTime) {
                                    navigate(`/moviedetails/${id}/select-seats`, {
                                        state: {
                                            name: movie.name,
                                            image_url: movie.image_url,
                                            version: movie.version,
                                            running_time: movie.running_time,
                                            time: `${selectedDate}, ${selectedTime}`,
                                            cinema_room: movie.cinema_room || 'Room 1',
                                        }
                                    });
                                }
                            }}
                            className={`mt-4 px-5 py-2 rounded text-base w-fit transition
        ${selectedDate && selectedTime
                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                    : 'bg-gray-500 text-gray-300 cursor-not-allowed'}`}
                            disabled={!selectedDate || !selectedTime}
                        >
                            Book now
                        </button>

                    </>
                )}
            </div>

            <div className="mt-10 flex justify-center">
                <div className="relative w-[50%] h-[50vh]">
                    <ReactPlayer
                        url={movie.trailer_link}
                        controls
                        width="100%"
                        height="100%"
                        className="absolute top-0 left-0"
                    />
                </div>
            </div>
        </div>
    );
};

export default MovieDetails;
