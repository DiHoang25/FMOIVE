import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { ArrowUpIcon } from "@heroicons/react/24/solid";
import MovieCard from "../../components/MovieCard";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  setMovieAndDateTime,
  setSelectedSeats,
} from "../../redux/bookingSlice";

function getWeekDates(startDate) {
  const dates = [];
  const start = new Date(startDate);
  for (let i = 0; i < 7; i++) {
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
  return `${day}/${month}/${year}`;
}

function isBeforeToday(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const check = new Date(date);
  check.setHours(0, 0, 0, 0);
  return check < today;
}

function ShowtimePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [startDate, setStartDate] = useState(new Date());
  const [movies, setMovies] = useState([]);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const hasRestoredScroll = useRef(false);
  const prevWeekStart = new Date(startDate);
  prevWeekStart.setDate(startDate.getDate() - 6);

  const getInitialSelectedDate = () => {
    const stored = sessionStorage.getItem("selectedShowtimeDate");
    return stored || formatDateLabel(new Date());
  };
  const [selectedDate, setSelectedDate] = useState(getInitialSelectedDate());


  const weekDates = getWeekDates(startDate);

  const handlePrevWeek = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
    const newStart = new Date(startDate);
    newStart.setDate(startDate.getDate() - 6);

    if (isBeforeToday(newStart)) return;

    setStartDate(newStart);
    setSelectedDate(formatDateLabel(newStart));
    sessionStorage.setItem("selectedShowtimeDate", formatDateLabel(newStart));


    sessionStorage.removeItem("shouldRestoreScroll");
    sessionStorage.removeItem("showtimeScrollPosition");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  const handleNextWeek = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
    const newStart = new Date(startDate);
    newStart.setDate(startDate.getDate() + 6);
    setStartDate(newStart);
    setSelectedDate(formatDateLabel(newStart));
    sessionStorage.setItem("selectedShowtimeDate", formatDateLabel(newStart));

    sessionStorage.removeItem("shouldRestoreScroll");
    sessionStorage.removeItem("showtimeScrollPosition");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectDate = (label) => {
    setSelectedDate(label);
    sessionStorage.setItem("selectedShowtimeDate", label);
    sessionStorage.removeItem("shouldRestoreScroll");
    sessionStorage.removeItem("showtimeScrollPosition");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    dispatch(setSelectedSeats({ seats: [], totalPrice: 0 }));
  }, [dispatch]);

  useEffect(() => {
    const shouldRestore = sessionStorage.getItem("shouldRestoreScroll");
    if (shouldRestore === "true" || hasRestoredScroll.current) return;

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [selectedDate, startDate, location.key]);


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
    const shouldRestore = sessionStorage.getItem("shouldRestoreScroll");

    if (
      shouldRestore === "true" &&
      savedScroll &&
      movies.length > 0 &&
      !hasRestoredScroll.current
    ) {
      window.scrollTo({ top: parseInt(savedScroll, 10), behavior: "smooth" });
      sessionStorage.removeItem("showtimeScrollPosition");
      sessionStorage.removeItem("shouldRestoreScroll");
      hasRestoredScroll.current = true;
    }
  }, [movies]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

    sessionStorage.setItem("showtimeScrollPosition", window.scrollY.toString());



    const parsedGenres = Array.isArray(movieDetailsFromCard.genres)
      ? movieDetailsFromCard.genres.flatMap((genre) =>
        typeof genre === "string" ? genre.split(",").map((s) => s.trim()) : []
      )
      : [];

    const movieInfo = {
      name: movieDetailsFromCard.name,
      image_url: movieDetailsFromCard.image_url,
      version: movieDetailsFromCard.version || "2D",
      running_time: movieDetailsFromCard.running_time,
      cinema_room: cinemaRoom,
      genres: parsedGenres,
      rating: movieDetailsFromCard.rating,
      time: `${formattedDate}, ${timeClicked}`,
    };

    dispatch(setMovieAndDateTime({ movieDetails: movieInfo }));

    navigate(`/select-seats`, {
      state: {
        movieId: movieDetailsFromCard._id,
        roomId: cinemaRoom,
        movieDetails: movieInfo,
        restoreScroll: true,
      },
    });
  };



  return (
    <div className="bg-black min-h-screen text-white">
      <div className="px-7 invisible">Spacer cho navbar</div>

      <div className="fixed top-[100px] left-0 right-0 z-20 bg-black shadow-md">
        <div className="px-6 py-4">
          <h1 className="text-3xl font-bold text-center mb-4">SHOWTIMES</h1>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-2 max-w-[90vw] mx-auto">

            {!isBeforeToday(prevWeekStart) && (
              <button
                onClick={handlePrevWeek}
                className="p-2 rounded-full hover:bg-gray-700"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
            )}
            {weekDates.map((date, index) => {
              const label = formatDateLabel(date);
              const isSelected = label === selectedDate;
              return (
                <button
                  key={index}
                  onClick={() => handleSelectDate(label)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out ${isSelected
                    ? "bg-red-600 text-white"
                    : "bg-gray-800 hover:bg-gray-700"
                    }`}
                >
                  {label}
                </button>
              );
            })}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {movies.length > 0 ? (
            movies.map((movie, index) => (
              <MovieCard
                key={index}
                title={movie.name}
                poster={movie.image_url}
                info={`${movie.version || "2D"} • ${movie.running_time} min • ${movie.type || "Movie"}`}
                showtimes={movie.showtimes}
                movie={movie}
                onShowtimeClick={handleMovieCardShowtimeClick}
              />
            ))
          ) : (
            <p className="text-center text-gray-400">No movies available for this day.</p>
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
