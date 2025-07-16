import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  
  useEffect(() => {
    
    const originalOverflow = document.body.style.overflow;
    
   
    document.body.style.overflow = 'hidden';
    
    
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="text-center">
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-gray-800">404</h1>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mt-2 sm:mt-4 mb-3 sm:mb-6">Page Not Found</h2>
        <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <Link 
          to="/" 
          className="px-4 sm:px-6 py-2 sm:py-3 bg-primary-600 hover:bg-primary-700 text-black font-medium rounded-lg transition-colors duration-300 text-sm sm:text-base"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;