import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import MovieCard from '../../components/MovieCard';
import { useState } from 'react';
import darkknight from '../../assets/darkknight.jpg';
import finalDestinationBloodlines from '../../assets/finaldestination.jpg'; 
import avengerEndgame from '../../assets/avengerEG.jpg'; // Example image import
import inception from '../../assets/inception.jpg'; // Example image import
const showtimes = ['08:00', '12:00', '14:30', '15:00', '17:00', '19:30', '20:00', '21:00']; // Example image import

const movies = [
  {
    title: 'The Dark Knight',
    poster: darkknight ,
    info: 'PG-13 • 152 min • Action, Crime, Drama',
    showtimes,
  },
{
    title: 'Final Destination Bloodlines',
    poster: finalDestinationBloodlines, 
    info: 'PG-18 • 252 min • Action, Horror, Drama',
    showtimes,
  },
  {
    title: 'Avengers: Endgame',
    poster: avengerEndgame, // Example image import
    info: 'PG-13 • 281 min • Action, Sci-Fi',
    showtimes,
  },
  {
    title: 'Inception',
    poster: inception,
    info: 'PG-13 • 148 min • Sci-Fi, Thriller',
    showtimes,
  },];

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
  const day = days[date.getDay()];
  const dateNum = date.getDate().toString().padStart(2, '0');
  return `${dateNum} ${day}`;
}




function ShowtimePage() {
  const [startDate, setStartDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

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
      <div className="grid grid-cols-1 gap-6">
        {movies.map((movie, index) => (
          <MovieCard key={index} {...movie} />
        ))}
      </div>

      {/* Pagination with Arrows */}
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