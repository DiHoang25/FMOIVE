import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import MovieCard from '../../components/MovieCard';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate


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
    const navigate = useNavigate(); // Initialize useNavigate
    const [startDate, setStartDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(formatDateLabel(new Date()));
    const [movies, setMovies] = useState([]);

    const weekDates = getWeekDates(startDate);

    const handlePrevWeek = () => {
        const newStart = new Date(startDate);
        newStart.setDate(startDate.getDate() - 6); // Go back 6 days
        setStartDate(newStart);
        // Also update selectedDate to the first day of the new week
        setSelectedDate(formatDateLabel(newStart));
    };

    const handleNextWeek = () => {
        const newStart = new Date(startDate);
        newStart.setDate(startDate.getDate() + 6); // Go forward 6 days
        setStartDate(newStart);
        // Also update selectedDate to the first day of the new week
        setSelectedDate(formatDateLabel(newStart));
    };

    useEffect(() => {
        axios.get('http://localhost:5000/api/movies')
            .then(response => {
                const todayParts = selectedDate.split('/');
                // Create a date object for the selected day in the *current year*
                const currentYear = new Date().getFullYear();
                const selectedDayDate = new Date(currentYear, parseInt(todayParts[1]) - 1, parseInt(todayParts[0]));
                selectedDayDate.setHours(0, 0, 0, 0); // Normalize to start of day

                const filtered = response.data.filter(movie => {
                    if (movie.is_deleted) return false;
                    const start = new Date(movie.start_date);
                    const end = new Date(movie.end_date);
                    start.setHours(0, 0, 0, 0);
                    end.setHours(0, 0, 0, 0);

                    // Check if selectedDayDate is within the movie's active date range
                    return selectedDayDate >= start && selectedDayDate <= end;
                });

                setMovies(filtered);
            })
            .catch(error => {
                console.error('❌ Error fetching movies:', error);
            });
    }, [selectedDate]);

    // This function will be passed to MovieCard for its handleShowtimeClick
    const handleMovieCardShowtimeClick = (movieDetails, timeClicked) => {
        // Construct the full date string for navigation
        const todayParts = selectedDate.split('/');
        const currentYear = new Date().getFullYear(); // Assuming current year
        const fullDateObj = new Date(currentYear, parseInt(todayParts[1]) - 1, parseInt(todayParts[0]));
        const formattedDate = formatDateForNavigation(fullDateObj); // e.g., "Monday, May 26, 2025"

        navigate('/select-seats', {
            state: {
                name: movieDetails.name,
                image_url: movieDetails.image_url,
                version: movieDetails.version || '2D', // Default if not provided by API
                running_time: movieDetails.running_time,
                time: `${formattedDate}, ${timeClicked}`, // Combine full date and time
                cinema_room: movieDetails.cinema_room, // Assuming cinema_room is per movie from API
                // If specific showtimes have different rooms, you'll need to adapt API response
            },
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
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out ${
                                isSelected ? 'bg-red-600 text-white' : 'bg-gray-800 hover:bg-gray-700'
                            }`} // Changed selected date to red
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
                            showtimes={movie.showtimes} // showtimes as an array of time strings (e.g., ["10:00", "14:30"])
                            movie={movie} // Pass the full movie object
                            onShowtimeClick={handleMovieCardShowtimeClick} // Pass the new handler
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