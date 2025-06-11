import React from 'react';
import darkknight from '../assets/darkknight.jpg'; // Example image import
import { useNavigate } from 'react-router-dom';
const MovieCard = ({ title, poster, info, showtimes }) => {
    const navigate = useNavigate();
    const handleSelectTime = (time) => {
    navigate('/select-seats', {
      state: {
        title,
        poster,
        info,
        time,
        screen: 'Screen 5', // You can make this dynamic later
      },
    });
  };
  return (
    <div className="flex bg-[#1a1a1a] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="relative w-[150px] h-[250px] flex-shrink-0">
        <img
          src={ poster} // Fallback to darkknight if poster is not provided
          alt={title}
          className="w-full h-full object-cover"
        />
        {/* Rating badge overlay */}
        <div className="absolute top-2 left-2 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-1 rounded">
          8.5/10
        </div>
      </div>
      
      <div className="p-4 flex flex-col justify-between flex-grow">
        <div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <p className="text-sm text-gray-300 mt-1">{info}</p>
          
          <div className="mt-3">
            <span className="inline-block bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded mr-2">
              Action
            </span>
            <span className="inline-block bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">
              Adventure
            </span>
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-red-400 text-sm font-medium mb-2">Available Showtimes</p>
          <div className="flex flex-wrap gap-2">
            {showtimes.map((time, i) => (
              <button
                key={i}
                 onClick={() => handleSelectTime(time)}
                className="bg-gray-800 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;