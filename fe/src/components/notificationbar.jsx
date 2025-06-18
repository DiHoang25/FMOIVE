import React, { useState, useEffect } from 'react';
import bgImage from '../assets/bg.jpg';
import logo from '../assets/logo.png';
import user from '../assets/user.png';
import { Link } from 'react-router-dom';

const NotificationBar = () => {
  // const [isLoggedIn, setIsLoggedIn] = useState(false);

  // useEffect(() => {
  //   const token = localStorage.getItem('token');
  //   setIsLoggedIn(!!token);
  // }, []);



  return (
    <div
      className="static top-0 left-0 right-0 z-50 shadow-lg px-0"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '60px',
      }}
    >
      <div className="flex items-center justify-between h-full px-4">
        <Link to="/">
          <img src={logo} alt="Logo" className="h-12 object-contain" />
        </Link>

        <div className="flex items-center space-x-4">
         

          <img src={user} alt="User Icon" className="h-10 w-10 object-contain" />

          <Link to="/login">
            <button className="bg-red-600 px-4 py-2 rounded text-white text-sm hover:bg-red-700 border-2 border-white">
              Login
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotificationBar;