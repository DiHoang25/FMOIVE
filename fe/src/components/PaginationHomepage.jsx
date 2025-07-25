import React from 'react';
import nextbanner from '../assets/nextbanner.png';
import prevbanner from '../assets/prevbanner.png';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-center items-center gap-4 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="disabled:opacity-30"
      >
        <div className="bg-red-600 rounded-full p-1 hover:bg-red-700 transition">
          <img src={prevbanner} alt="Prev" className="w-7 h-7 object-contain" />
        </div>
      </button>

      <span className="text-red text-lg font-semibold">
        Page {currentPage + 1} / {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        className="disabled:opacity-30"
      >
        <div className="bg-red-600 rounded-full p-1 hover:bg-red-700 transition">
          <img src={nextbanner} alt="Next" className="w-7 h-7 object-contain" />
        </div>
      </button>
    </div>
  );
};

export default Pagination;
