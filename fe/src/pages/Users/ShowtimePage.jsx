import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import MovieCard from '../../components/MovieCard';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { setSelectedSeats } from '../../redux/bookingSlice';

// Redux imports
import { useDispatch } from 'react-redux';
import { setMovieAndDateTime } from '../../redux/bookingSlice'; // Adjusted path to match your structure


function getWeekDates(startDate) {
    const dates = [];
    const start = new Date(startDate);
    for (let i = 0; i < 6; i++) { // Get 6 days including the start date
        const next = new Date(start);
        next.setDate(start.getDate() + i);
        dates.push(next);
    }
    return dates;
}

function formatDateLabel(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString(); // 0-indexed
    return `${day}/${month}`;
}

// Helper to get full date string for passing to next page
function formatDateForNavigation(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}


function ShowtimePage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [startDate, setStartDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(formatDateLabel(new Date()));
    const [movies, setMovies] = useState([]);

    const weekDates = getWeekDates(startDate);

    const handlePrevWeek = () => {
        const newStart = new Date(startDate);
        newStart.setDate(startDate.getDate() - 6);
        setStartDate(newStart);
        setSelectedDate(formatDateLabel(newStart));
    };

    const handleNextWeek = () => {
        const newStart = new Date(startDate);
        newStart.setDate(startDate.getDate() + 6);
        setStartDate(newStart);
        setSelectedDate(formatDateLabel(newStart));
    };

    useEffect(() => {
        dispatch(setSelectedSeats({ seats: [], totalPrice: 0 }));
    }, []);

    useEffect(() => {
        axios.get('http://localhost:5000/api/movies')
            .then(response => {
                const todayParts = selectedDate.split('/');
                const currentYear = new Date().getFullYear();
                const selectedDayDate = new Date(currentYear, parseInt(todayParts[1]) - 1, parseInt(todayParts[0]));
                selectedDayDate.setHours(0, 0, 0, 0);

                const filtered = response.data.filter(movie => {
                    if (movie.is_deleted) return false;
                    const start = new Date(movie.start_date);
                    const end = new Date(movie.end_date);
                    start.setHours(0, 0, 0, 0);
                    end.setHours(0, 0, 0, 0);

                    return selectedDayDate >= start && selectedDayDate <= end;
                });

                setMovies(filtered);
            })
            .catch(error => {
                console.error('❌ Error fetching movies:', error);
            });
    }, [selectedDate]);

    const handleMovieCardShowtimeClick = (movieDetailsFromCard, timeClicked) => {
        const todayParts = selectedDate.split('/');
        const currentYear = new Date().getFullYear();
        const fullDateObj = new Date(currentYear, parseInt(todayParts[1]) - 1, parseInt(todayParts[0]));
        const formattedDate = formatDateForNavigation(fullDateObj);

        const payload = {
            movieDetails: {
                name: movieDetailsFromCard.name,
                image_url: movieDetailsFromCard.image_url,
                version: movieDetailsFromCard.version || '2D',
                running_time: movieDetailsFromCard.running_time,
                cinema_room: movieDetailsFromCard.cinema_room,
                production_company: movieDetailsFromCard.production_company,
                director: movieDetailsFromCard.director,
                actors: movieDetailsFromCard.actors,
                genres: movieDetailsFromCard.genres,
                rating: movieDetailsFromCard.rating,
                description: movieDetailsFromCard.description,
                time: `${formattedDate}, ${timeClicked}`, // Full date and selected time
            }
        };
        console.log("ShowtimePage: Dispatching setMovieAndDateTime with payload:", payload);
        dispatch(setMovieAndDateTime(payload));

        // Pass roomId via navigation state
        navigate('/select-seats', {
            state: {
                roomId: movieDetailsFromCard.cinema_room // Assuming cinema_room directly provides the room ID
            }
        });
    };


    return (
        <div className="bg-black min-h-screen text-white px-6 py-10">
            <h1 className="text-3xl font-bold text-center mb-6">SHOWTIMES</h1>

            {/* Date Selection Carousel */}
            <div className="flex items-center justify-center gap-2 mb-10">
                <button onClick={handlePrevWeek} className="p-2 rounded-full hover:bg-gray-700">
                    <ChevronLeftIcon className="h-5 w-5" />
                </button>
                {weekDates.map((date, index) => {
                    const label = formatDateLabel(date);
                    const isSelected = label === selectedDate;
                    return (
                        <button
                            key={index}
                            onClick={() => setSelectedDate(label)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out ${isSelected ? 'bg-red-600 text-white' : 'bg-gray-800 hover:bg-gray-700'
                                }`}
                        >
                            {label}
                        </button>
                    );
                })}
                <button onClick={handleNextWeek} className="p-2 rounded-full hover:bg-gray-700">
                    <ChevronRightIcon className="h-5 w-5" />
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {movies.length > 0 ? (
                    movies.map((movie, index) => (
                        <MovieCard
                            key={index}
                            title={movie.name}
                            poster={movie.image_url}
                            info={`${movie.version || '2D'} • ${movie.running_time} min • ${movie.type || 'Movie'}`}
                            showtimes={movie.showtimes}
                            movie={movie} // Pass the full movie object so handleMovieCardShowtimeClick can access all its properties
                            onShowtimeClick={handleMovieCardShowtimeClick}
                        />
                    ))
                ) : (
                    <p className="text-center text-gray-400">No movies available for this day.</p>
                )}
            </div>
        </div>
    );
}

export default ShowtimePage;
