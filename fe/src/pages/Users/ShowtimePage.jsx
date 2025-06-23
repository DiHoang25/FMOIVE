import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import MovieCard from '../../components/MovieCard';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


function getWeekDates(startDate) {
    const dates = [];
    const start = new Date(startDate);
    for (let i = 0; i < 6; i++) {
        const next = new Date(start);
        next.setDate(start.getDate() + i);
        dates.push(next);
    }
    return dates;
}

function formatDateLabel(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString();
    return `${day}/${month}`;
}

function formatDateForNavigation(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}


function ShowtimePage() {
    const navigate = useNavigate();
    const [startDate, setStartDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(formatDateLabel(new Date()));
    const [movies, setMovies] = useState([]);

    // --- Pagination States ---
    const [currentPage, setCurrentPage] = useState(1);
    const moviesPerPage = 5; // Display 5 movies per page
    // --- End Pagination States ---

    const weekDates = getWeekDates(startDate);

    const handlePrevWeek = () => {
        const newStart = new Date(startDate);
        newStart.setDate(startDate.getDate() - 6);
        setStartDate(newStart);
        setSelectedDate(formatDateLabel(newStart));
        setCurrentPage(1); // Reset to first page when changing week
    };

    const handleNextWeek = () => {
        const newStart = new Date(startDate);
        newStart.setDate(startDate.getDate() + 6);
        setStartDate(newStart);
        setSelectedDate(formatDateLabel(newStart));
        setCurrentPage(1); // Reset to first page when changing week
    };

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
                setCurrentPage(1); // Reset to first page when movies data changes
            })
            .catch(error => {
                console.error('❌ Error fetching movies:', error);
            });
    }, [selectedDate]);

    const handleMovieCardShowtimeClick = (movieDetails, timeClicked) => {
        const todayParts = selectedDate.split('/');
        const currentYear = new Date().getFullYear();
        const fullDateObj = new Date(currentYear, parseInt(todayParts[1]) - 1, parseInt(todayParts[0]));
        const formattedDate = formatDateForNavigation(fullDateObj);

        navigate('/select-seats', {
            state: {
                name: movieDetails.name,
                image_url: movieDetails.image_url,
                version: movieDetails.version || '2D',
                running_time: movieDetails.running_time,
                time: `${formattedDate}, ${timeClicked}`,
                cinema_room: movieDetails.cinema_room,
            },
        });
    };

    // --- Pagination Logic ---
    const indexOfLastMovie = currentPage * moviesPerPage;
    const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
    const currentMovies = movies.slice(indexOfFirstMovie, indexOfLastMovie);

    const totalPages = Math.ceil(movies.length / moviesPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };
    // --- End Pagination Logic ---

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
                {currentMovies.length > 0 ? ( // Use currentMovies for rendering
                    currentMovies.map((movie, index) => (
                        <MovieCard
                            key={movie.id || index} // Use unique movie.id if available for better keying
                            title={movie.name}
                            poster={movie.image_url}
                            info={`${movie.version || '2D'} • ${movie.running_time} min • ${movie.type || 'Movie'}`}
                            showtimes={movie.showtimes}
                            movie={movie}
                            onShowtimeClick={handleMovieCardShowtimeClick}
                        />
                    ))
                ) : (
                    <p className="text-center text-gray-400">No movies available for this day.</p>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && ( // Only show pagination if there's more than 1 page
                <div className="flex justify-center items-center gap-2 mt-10">
                    <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className="p-2 rounded-full hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => paginate(i + 1)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out ${
                                currentPage === i + 1 ? 'bg-red-600 text-white' : 'bg-gray-800 hover:bg-gray-700'
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-full hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRightIcon className="h-5 w-5" />
                    </button>
                </div>
            )}
        </div>
    );
}

export default ShowtimePage;