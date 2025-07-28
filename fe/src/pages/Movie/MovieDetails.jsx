    import React, { useState, useEffect } from 'react';
    import ReactPlayer from 'react-player/youtube';
    import { useNavigate, useParams } from 'react-router-dom';
    import { useDispatch } from 'react-redux';
    import { setMovieAndDateTime } from '../../redux/bookingSlice';
    import dayjs from 'dayjs';
    import CommentSection from '../../components/CommentSection';
    import { useLocation } from 'react-router-dom'; // ⬅️ thêm import này



    const getWeekDates = (startDate) => {
        const dates = [];
        for (let i = 0; i < 6; i++) {
            const next = new Date(startDate);
            next.setDate(startDate.getDate() + i);
            dates.push(next);
        }
        return dates;
    };

    const formatDateLabel = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString();
        return `${day}/${month}`;
    };

    const formatDateForNavigation = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };


    const MovieDetails = () => {
        const { id } = useParams();
        const [movie, setMovie] = useState(null);
        const [startDate, setStartDate] = useState(new Date());
        const [selectedDate, setSelectedDate] = useState(null);
        const [selectedTime, setSelectedTime] = useState('');
        const navigate = useNavigate();
        const dispatch = useDispatch();
        


        useEffect(() => {
            const fetchMovie = async () => {
                try {
                    const res = await fetch(`http://localhost:5000/api/movies/${id}`);
                    const data = await res.json();
                    setMovie(data);
                } catch (error) {
                    console.error('❌ Lỗi lấy chi tiết phim:', error);
                }
            };
            fetchMovie();
        }, [id]);

        const location = useLocation();

 useEffect(() => {
    const scrollToId = location.state?.scrollToCommentId;

    if (scrollToId) {
        const checkExist = setInterval(() => {
            const el = document.getElementById(`comment-${scrollToId}`);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
                el.style.backgroundColor = "#273c75";
                setTimeout(() => {
                    el.style.backgroundColor = "";
                }, 2000);
                clearInterval(checkExist);
            }
        }, 300); // kiểm tra mỗi 300ms

        // stop sau 5s nếu không tìm thấy
        setTimeout(() => clearInterval(checkExist), 5000);
    }
}, [location.state?.scrollToCommentId]);




        const handleDateSelect = (date) => {
            setSelectedDate(date);
            setSelectedTime('');
        };




        const handleBookNow = () => {
            if (!movie || !selectedDate || !selectedTime) return;

            const formattedDate = formatDateForNavigation(selectedDate);
            const parsedGenres = Array.isArray(movie.genres)
                ? movie.genres.flatMap(genre =>
                    typeof genre === 'string' ? genre.split(',').map(s => s.trim()) : []
                )
                : [];

            const cinemaRoom = movie.cinema_room || 'ROOM000000001';

            dispatch(setMovieAndDateTime({
                movieDetails: {
                    name: movie.name,
                    image_url: movie.image_url,
                    version: movie.version || '2D',
                    running_time: movie.running_time,
                    cinema_room: cinemaRoom,
                    genres: parsedGenres,
                    rating: movie.rating,
                    time: `${formattedDate}, ${selectedTime}`,
                }
            }));

            

            navigate(`/select-seats`, {
                state: {
                    movieId: movie._id, // ✅ THÊM movieId (rất quan trọng)
                    roomId: cinemaRoom,
                    movieDetails: {
                        name: movie.name,
                        image_url: movie.image_url,
                        version: movie.version || '2D',
                        running_time: movie.running_time,
                        cinema_room: cinemaRoom,
                        genres: parsedGenres,
                        rating: movie.rating,
                        time: dayjs(`${formattedDate}, ${selectedTime}`, "DD/MM/YYYY, HH:mm").toISOString(),
                    }
                }
            });
        };

        if (!movie) return <div className="text-white text-center mt-20">Loading...</div>;

        return (
            <div className="bg-black text-white px-4 py-8 md:px-6 md:py-10 max-w-full mx-auto">
                {/* Responsive layout */}
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-shrink-0 w-full lg:w-1/3">
                        <img src={movie.image_url} alt={movie.name} className="w-full max-w-xs lg:w-80 mx-auto rounded-lg shadow-lg" />
                    </div>

                    <div className="flex-1 space-y-3">
                        <h1 className="text-2xl font-bold uppercase tracking-wider text-center lg:text-left">{movie.name}</h1>
                        <hr className="border-red-500 w-20 mb-4 mx-auto lg:mx-0" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div className="text-base md:text-xl">
                                <p><span className="font-semibold">Release date:</span> {new Date(movie.start_date).toLocaleDateString('vi-VN')}</p>
                                <p><span className="font-semibold">Genre:</span> {movie.genres?.join(', ')}</p>
                                <p><span className="font-semibold">Duration:</span> {movie.running_time} min</p>
                                <p><span className="font-semibold">Director:</span> {movie.director}</p>
                                <p><span className="font-semibold">Actor:</span> {movie.actors}</p>
                            </div>
                            <div className="text-base md:text-xl">
                                <p><span className="font-semibold">Distributed by:</span> {movie.production_company}</p>
                            </div>
                        </div>

                        <div className="mt-6 text-base md:text-xl">
                            <p className="font-semibold mb-1">Summary:</p>
                            <p className="text-gray-300">{movie.description}</p>
                        </div>
                    </div>
                </div>

                {/* Date and time selection */}
                <div className="mt-10 text-center bg-gray-900 p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-red-500 mb-4">Choose Your Show</h2>
                    <div className="flex items-center justify-center gap-2 flex-wrap mb-6">
                        <button onClick={() => setStartDate(prev => {
                            const newDate = new Date(prev);
                            newDate.setDate(prev.getDate() - 6);
                            return newDate;
                        })} className="p-2 rounded-full hover:bg-gray-700">❮</button>

                        {getWeekDates(startDate).map((date, idx) => {
                            const label = formatDateLabel(date);
                            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                            return (
                                <button key={idx}
                                    onClick={() => handleDateSelect(date)}
                                    className={`px-4 py-2 rounded text-sm font-medium ${isSelected ? 'bg-yellow-400 text-black' : 'bg-gray-800 hover:bg-red-600'}`}>
                                    {label}
                                </button>
                            );
                        })}

                        <button onClick={() => setStartDate(prev => {
                            const newDate = new Date(prev);
                            newDate.setDate(prev.getDate() + 6);
                            return newDate;
                        })} className="p-2 rounded-full hover:bg-gray-700">❯</button>
                    </div>

                    {selectedDate && (
                        <>
                            <div className="flex flex-wrap justify-center gap-3">
                                {movie.showtimes?.map((time, idx) => (
                                    <button key={idx}
                                        onClick={() => setSelectedTime(time)}
                                        className={`px-4 py-2 rounded text-sm font-medium ${selectedTime === time ? 'bg-yellow-400 text-black' : 'bg-gray-700 hover:bg-red-600'}`}>
                                        {time}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleBookNow}
                                className={`mt-4 px-5 py-2 rounded text-base w-fit transition
                                ${selectedTime ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-500 text-gray-300 cursor-not-allowed'}`}
                                disabled={!selectedTime}>
                                Book now
                            </button>
                        </>
                    )}
                </div>

                {/* Trailer */}
                <div className="mt-10 flex justify-center">
                    <div className="relative w-[90%] md:w-[70%] lg:w-[50%] h-[50vh]">
                        <ReactPlayer
                            url={movie.trailer_link}
                            controls
                            width="100%"
                            height="100%"
                            className="absolute top-0 left-0"
                        />
                    </div>
                </div>
                <CommentSection movieName={movie.name} movieId={movie._id} />

            </div>
        );
    };

    export default MovieDetails;
