import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  // Ẩn navbar và footer khi trang này được hiển thị
  useEffect(() => {
    // Lưu trạng thái hiện tại của body
    const originalOverflow = document.body.style.overflow;
    
    // Ẩn tất cả các phần tử khác
    document.body.style.overflow = 'hidden';
    
    // Khôi phục lại khi component unmount
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-800">404</h1>
        <h2 className="text-4xl font-bold text-gray-800 mt-4 mb-6">Page Not Found</h2>
        <p className="text-lg text-gray-600 mb-8">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <Link 
          to="/" 
          className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-black font-medium rounded-lg transition-colors duration-300"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;