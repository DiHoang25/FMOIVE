import { useState, useEffect } from 'react';
import axios from 'axios';
import darkknight from '../../assets/darkknight.jpg'; // fallback image
import { useNavigate } from 'react-router-dom';
import EmployeeSidebarLayout from '../../components/Sidebar-Employee';

// Helper to format date
function formatDateForNavigation(date) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

const CounterShowtimesPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState({ movieId: null, time: null });
  const navigate = useNavigate();

  useEffect(() => {
  const fetchMovies = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const res = await axios.get('http://localhost:5000/api/movies');
      const filtered = res.data.filter(movie => {
        if (movie.is_deleted) return false;
        const start = new Date(movie.start_date);
        const end = new Date(movie.end_date);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        return today >= start && today <= end;
      });

      const detailedMovies = await Promise.all(
        filtered.map(async (movie) => {
          const detailRes = await axios.get(`http://localhost:5000/api/movies/${movie._id}`);
          return detailRes.data;
        })
      );

      const formatted = detailedMovies.map(movie => ({
        id: movie._id,
        title: movie.name,
        image: movie.image_url || darkknight,
        times: movie.showtimes || [],
        genre: Array.isArray(movie.genres) ? movie.genres.join(', ') : 'Unknown',
        duration: movie.running_time,
        movieDetails: movie,
      }));

      setMovies(formatted);
    } catch (err) {
      console.error("❌ Error fetching movies:", err);
      setError("Failed to fetch movie details.");
    } finally {
      setLoading(false);
    }
  };

  fetchMovies();
}, []);


  const handleSelect = (movieId, time) => {
    setSelected({ movieId, time });

    const movie = movies.find(m => m.id === movieId);
    if (!movie) return;

    const today = new Date();
    const formattedDate = formatDateForNavigation(today);
    const cinemaRoom = movie.movieDetails.cinema_room;

    navigate(`/employee/counter-seat/${cinemaRoom}`, {
      state: {
        selectedMovieId: movieId,
        selectedShowtimeTime: time,
        fullShowtimeDate: formattedDate,
        movieDetails: movie.movieDetails,
        roomId: cinemaRoom,
      },
    });
  };

  if (loading) {
    return (
      <EmployeeSidebarLayout>
        <div className="p-4 text-white min-h-screen flex justify-center items-center">
          <p>Loading movies...</p>
        </div>
      </EmployeeSidebarLayout>
    );
  }

  if (error) {
    return (
      <EmployeeSidebarLayout>
        <div className="p-4 text-white min-h-screen flex justify-center items-center">
          <p className="text-red-500">{error}</p>
        </div>
      </EmployeeSidebarLayout>
    );
  }

  if (movies.length === 0) {
    return (
      <EmployeeSidebarLayout>
        <div className="p-4 text-white min-h-screen flex justify-center items-center">
          <p>No movies available for today.</p>
        </div>
      </EmployeeSidebarLayout>
    );
  }

  return (
    <EmployeeSidebarLayout>
      <div className="p-4 text-white min-h-screen">
        <h2 className="text-xl font-bold mb-4">Select Movie & Showtime</h2>
        <div className="grid grid-cols-1 gap-3">
          {movies.map(movie => (
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
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {movie.times.length > 0 ? (
                      movie.times.map(time => (
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
                      ))
                    ) : (
                      <span className="text-gray-400">No showtimes available</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </EmployeeSidebarLayout>
  );
};

export default CounterShowtimesPage;
