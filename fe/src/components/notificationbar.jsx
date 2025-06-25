import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import bgImage from '../assets/bg.jpg';
import logo from '../assets/logo.png';
import userIcon from '../assets/user.png';

const NotificationBar = () => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('username');
    if (token && name) {
      setUsername(name);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUsername('');
    navigate('/login');
  };

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
        {/* Logo */}
        <Link to="/">
          <img src={logo} alt="Logo" className="h-12 object-contain" />
        </Link>


        {/* User section */}
        {/* User section */}
        <div className="flex items-center space-x-4">
          {username ? (
            <>
              <div
                onClick={() => navigate('/viewaccount')}
                className="cursor-pointer hover:scale-105 transition-transform duration-200"
                title="View Account"
              >
                <img src={userIcon} alt="User Icon" className="h-10 w-10 object-contain" />
              </div>
              <span className="text-white font-semibold">Hello {username}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 px-3 py-2 rounded text-white text-sm hover:bg-red-700 border-2 border-white"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login">
              <button className="bg-red-600 px-3 py-2 rounded text-white text-sm hover:bg-red-700 border-2 border-white">
                Login
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationBar;