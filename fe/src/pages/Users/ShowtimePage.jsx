import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { ArrowUpIcon } from "@heroicons/react/24/solid";
import MovieCard from "../../components/MovieCard";
import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useMediaQuery } from "react-responsive";
import { useRef } from "react";
import { useDispatch } from "react-redux";
import {
  setMovieAndDateTime,
  setSelectedSeats,
} from "../../redux/bookingSlice";
import LoadingSpinner from "../../components/LoadingSpinner";
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
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString();
  return `${day}/${month}`;
}

function formatDateForNavigation(date) {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`; // trả về "17/07/2025"
}


function ShowtimePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrollPosition, setScrollPosition] = useState(0);

  // Add this ref to track if we've restored scroll
  const hasRestoredScroll = useRef(false);
  
  const dispatch = useDispatch();

  const [startDate, setStartDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(formatDateLabel(new Date()));
  const [movies, setMovies] = useState([]);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const weekDates = getWeekDates(startDate);

  const handlePrevWeek = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
    const newStart = new Date(startDate);
    newStart.setDate(startDate.getDate() - 6);
    setStartDate(newStart);
    setSelectedDate(formatDateLabel(newStart));

    
  };

  const handleNextWeek = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
    const newStart = new Date(startDate);
    newStart.setDate(startDate.getDate() + 6);
    setStartDate(newStart);
    setSelectedDate(formatDateLabel(newStart));
     
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  dispatch(setSelectedSeats({ seats: [], totalPrice: 0 }));

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/movies")
      .then((response) => {
        const todayParts = selectedDate.split("/");
        const currentYear = new Date().getFullYear();
        const selectedDayDate = new Date(
          currentYear,
          parseInt(todayParts[1]) - 1,
          parseInt(todayParts[0])
        );
        selectedDayDate.setHours(0, 0, 0, 0);

        const filtered = response.data.filter((movie) => {
          if (movie.is_deleted) return false;
          const start = new Date(movie.start_date);
          const end = new Date(movie.end_date);
          start.setHours(0, 0, 0, 0);
          end.setHours(0, 0, 0, 0);

          return selectedDayDate >= start && selectedDayDate <= end;
        });

        setMovies(filtered);
      })
      .catch((error) => {
        console.error("❌ Error fetching movies:", error);
      });
  }, [selectedDate]);

  useEffect(() => {
    const savedScroll = sessionStorage.getItem("showtimeScrollPosition");
    if (savedScroll) {
      const scrollValue = parseInt(savedScroll, 10);

      // Delay to ensure DOM is ready
      const timeout = setTimeout(() => {
        window.requestAnimationFrame(() => {
          window.scrollTo({
            top: scrollValue,
            behavior: "smooth", // You can try "smooth" for nicer experience
          });
        });
      }, 10); // or even 100ms if needed

      return () => clearTimeout(timeout);
    }
  }, [movies]); 

  const handleMovieCardShowtimeClick = (movieDetailsFromCard, timeClicked) => {
    const todayParts = selectedDate.split("/");
    const currentYear = new Date().getFullYear();
    const fullDateObj = new Date(
      currentYear,
      parseInt(todayParts[1]) - 1,
      parseInt(todayParts[0])
    );
    const formattedDate = formatDateForNavigation(fullDateObj);

    const cinemaRoom = movieDetailsFromCard.cinema_room;

    sessionStorage.setItem(
      "showtimeScrollPosition",
      window.pageYOffset.toString()
    );

    const parsedGenres = Array.isArray(movieDetailsFromCard.genres)
      ? movieDetailsFromCard.genres.flatMap((genre) =>
          typeof genre === "string" ? genre.split(",").map((s) => s.trim()) : []
        )
      : [];

    dispatch(
      setMovieAndDateTime({
        movieDetails: {
          name: movieDetailsFromCard.name,
          image_url: movieDetailsFromCard.image_url,
          version: movieDetailsFromCard.version || "2D",
          running_time: movieDetailsFromCard.running_time,
          cinema_room: cinemaRoom,
          genres: parsedGenres,
          rating: movieDetailsFromCard.rating,
          time: `${formattedDate}, ${timeClicked}`,
        },
      })
    );

    navigate(`/select-seats`, {
      state: {
        movieId: movieDetailsFromCard._id,
        roomId: cinemaRoom,
        movieDetails: {
          name: movieDetailsFromCard.name,
          image_url: movieDetailsFromCard.image_url,
          version: movieDetailsFromCard.version || "2D",
          running_time: movieDetailsFromCard.running_time,
          cinema_room: cinemaRoom,
          genres: parsedGenres,
          rating: movieDetailsFromCard.rating,
          time: `${formattedDate}, ${timeClicked}`,
        },
      },
    });
  };

  

  return (
    <div className="pt-[60px] bg-black min-h-screen text-white"> {/* Add padding-top equal to NotificationBar height */}
     

      <div className="fixed top-[100px] left-0 right-0 z-20 bg-black shadow-md">
        <div className="px-6 py-4">
          <h1 className="text-3xl font-bold text-center mb-4">SHOWTIMES</h1>

          <div className="flex items-center justify-center mb-4">
            {/* Previous Week Button */}
            <button
              onClick={handlePrevWeek}
              className="p-2 rounded-full hover:bg-gray-700/50 transition-colors mr-1 sm:mr-2"
              aria-label="Previous week"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>

            {/* Date Buttons */}
            <div className="flex gap-1 sm:gap-2">
              {weekDates.map((date, index) => {
                const label = formatDateLabel(date);
                const isSelected = label === selectedDate;
                return (
                  <button
                    key={index}
                    onClick={() => {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      setSelectedDate(label);
                    }}
                    className={`px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                      isSelected
                        ? "bg-red-600 text-white shadow-md"
                        : "bg-gray-800 hover:bg-gray-700 text-gray-200"
                    }`}
                    aria-current={isSelected ? "date" : undefined}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Next Week Button */}
            <button
              onClick={handleNextWeek}
              className="p-2 rounded-full hover:bg-gray-700/50 transition-colors ml-1 sm:ml-2"
              aria-label="Next week"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="pt-44 px-6 pb-10" style={{ zIndex: 10 }}>
        {" "}
        {/* Giảm z-index của phần nội dung */}
        <div className="grid grid-cols-1 gap-6">
          {movies.length > 0 ? (
            movies.map((movie, index) => (
              <MovieCard
                key={index}
                title={movie.name}
                poster={movie.image_url}
                info={`${movie.version || "2D"} • ${movie.running_time} min • ${
                  movie.type || "Movie"
                }`}
                showtimes={movie.showtimes}
                movie={movie} // Pass the full movie object so handleMovieCardShowtimeClick can access all its properties
                onShowtimeClick={handleMovieCardShowtimeClick}
              />
            ))
          ) : (
            <p className="text-center text-gray-400">
              No movies available for this day.
            </p>
          )}
        </div>
      </div>

      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-50"
          aria-label="Back to top"
        >
          <ArrowUpIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

export default ShowtimePage;
