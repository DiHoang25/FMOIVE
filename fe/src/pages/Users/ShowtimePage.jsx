import { useEffect, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import MovieCard from '../../components/MovieCard';
import axios from 'axios';

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

function formatDate(date) {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  const day = days[date.getDay()];
  const dateNum = date.getDate().toString().padStart(2, '0');
  const month = months[date.getMonth()];

  return `${dateNum} ${month} (${day})`;  // e.g., "18 JUN (TUE)"
}

function ShowtimePage() {
  const [startDate, setStartDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const weekDates = getWeekDates(startDate);

  const handlePrevWeek = () => {
    const newStart = new Date(startDate);
    newStart.setDate(startDate.getDate() - 6);
    setStartDate(newStart);
  };

  const handleNextWeek = () => {
    const newStart = new Date(startDate);
    newStart.setDate(startDate.getDate() + 6);
    setStartDate(newStart);
  };

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:5000/api/movies');
        setMovies(res.data);
      } catch (err) {
        setError('Failed to load movies');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  return (
    <div className="bg-black min-h-screen text-white px-6 py-10">
      <h1 className="text-3xl font-bold text-center mb-6">SHOWTIMES</h1>

      {/* Date Selector */}
      <div className="flex items-center justify-center gap-2 mb-10">
        <button onClick={handlePrevWeek} className="p-2 rounded-full hover:bg-gray-700">
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        {weekDates.map((date, index) => {
          const label = formatDate(date);
          const isSelected = label === selectedDate;
          return (
            <button
              key={index}
              onClick={() => setSelectedDate(label)}
              className={`px-4 py-2 rounded-md text-sm font-medium
                ${isSelected ? 'bg-yellow-500 text-black' : 'bg-gray-800 hover:bg-red-600'}`}
            >
              {label}
            </button>
          );
        })}
        <button onClick={handleNextWeek} className="p-2 rounded-full hover:bg-gray-700">
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Movie Cards */}
      {loading ? (
        <div className="text-center text-gray-400">Loading movies...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {movies.map((movie, index) => (
            <MovieCard
              key={index}
              title={movie.name}
              poster={movie.image_url}
              info={`${movie.running_time} min • ${movie.type}`}
              showtimes={movie.showtimes || []}
            />
          ))}
        </div>
      )}

      {/* Pagination Placeholder */}
      <div className="flex justify-center items-center gap-4 mt-10">
        <button className="p-2 rounded-full hover:bg-gray-700">
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <span className="text-sm text-gray-300">Page 1 of 5</span>
        <button className="p-2 rounded-full hover:bg-gray-700">
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export default ShowtimePage;
