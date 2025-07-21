import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { memo } from "react";
const MovieCard = ({
  title,
  poster,
  info,
  showtimes = [],
  movie,
  onShowtimeClick,
}) => {
  const navigate = useNavigate();

  const handleShowtimeClick = (time) => {
    if (onShowtimeClick) {
      onShowtimeClick(movie, time);
    } else {
      // Fallback navigation if onShowtimeClick is not provided (less ideal for this flow)
      navigate("/select-seats", {
        state: {
          ...movie,
          time: time,
        },
      });
    }
  };

  return (
    <div className="bg-neutral-800 p-6 rounded-xl shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-6">
      {/* Poster Section */}
      <div className="bg-neutral-800 p-6 rounded-xl shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Poster Section - Now wrapped with Link */}
        <Link to={`/moviedetails/${movie._id}`} className="flex-shrink-0">
          <img
            src={poster}
            alt={title}
            className="w-40 h-60 object-cover rounded-lg shadow-md"
          />
        </Link>
      </div>

      {/* Movie Details and Showtimes Section */}
      <div className="flex-1 text-center sm:text-left">
        <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
        <p className="text-lg text-gray-300 mb-4">{info}</p>
        {/* AVAILABLE SHOWTIMES Heading - Smaller, but NOT a rounded rectangle */}
        <h3 className="text-gray-400 text-base font-semibold mb-3">
          AVAILABLE SHOWTIMES
        </h3>{" "}
        {/* Changed to gray-400, text-base (smaller) */}
        <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
          {showtimes.length > 0 ? (
            showtimes.map((time, index) => (
              <button
                key={index}
                onClick={() => handleShowtimeClick(time)}
                className="px-5 py-2 text-lg rounded-md bg-red-600 text-white font-semibold
                                           hover:bg-red-700 transition duration-200 ease-in-out" // Applied rounded-md here
              >
                {time}
              </button>
            ))
          ) : (
            <p className="text-gray-400 text-sm">
              No showtimes available for this movie today.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
