import { useState } from 'react';
import darkknight from '../../assets/darkknight.jpg';
import { useNavigate } from 'react-router-dom';
const movies = [
  {
    id: 1,
    title: 'The Dark Knight',
    image: darkknight,
    times: ['08:00', '12:00', '15:00', '18:30'],
    genre: 'Action, Crime, Drama',
    duration: 152, // in minutes
    ageRestriction: 'C16',
  },
  {
    id: 2,
    title: 'Inside Out 2',
    image: darkknight,
    times: ['09:00', '13:30', '16:00', '20:00'],
    genre: 'Animation, Comedy, Family',
    duration: 96,
    ageRestriction: 'P',
  },
  {
    id: 3,
    title: 'Outside In 2',
    image: darkknight,
    times: ['09:00', '13:30', '16:00', '20:00'],
    genre: 'Animation, Comedy, Family',
    duration: 96,
    ageRestriction: 'P',
  },
  {
    id: 4,
    title: 'Mission Impossible 7',
    image: darkknight,
    times: ['09:00', '13:30', '16:00', '20:00'],
    genre: 'Animation, Comedy, Family',
    duration: 96,
    ageRestriction: 'P',
  },
];

const CounterShowtimesPage = ({ onSelect }) => {
  const [selected, setSelected] = useState({ movieId: null, time: null });
  const navigate = useNavigate();

  const handleSelect = (movieId, time) => {
  setSelected({ movieId, time });
  navigate(`/employee/counter-seat`);
};

  return (
    <div className="p-4 bg-black text-white min-h-screen">
      <h2 className="text-xl font-bold mb-4">Select Movie & Showtime</h2>

      <div className="grid grid-cols-1 gap-3">
        {movies.map((movie) => (
          <div key={movie.id} className="bg-gray-800 p-4 rounded">
            <div className="flex items-center gap-6">
              <img
                src={movie.image}
                alt={movie.title}
                className="w-24 h-32 object-cover rounded"
              />

              <div className="flex-1">
                <h3 className="text-lg font-semibold">{movie.title}</h3>

                <div className="text-sm text-gray-300 mt-1">
                  <span className="inline-block mr-4">
                    🎬 <span className="font-medium">Genre:</span> {movie.genre}
                  </span>
                  <span className="inline-block mr-4">
                    ⏱️ <span className="font-medium">Duration:</span> {movie.duration} mins
                  </span>
                  <span className="inline-block">
                    🔞 <span className="font-medium">Rated:</span> {movie.ageRestriction}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {movie.times.map((time) => (
                    <button
                      key={time}
                      className={`px-3 py-1 rounded ${
                        selected.movieId === movie.id && selected.time === time
                          ? 'bg-yellow-500 text-black'
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                      onClick={() => handleSelect(movie.id, time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CounterShowtimesPage;
