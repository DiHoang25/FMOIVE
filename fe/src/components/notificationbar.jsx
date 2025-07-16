import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import bgImage from '../assets/bg.jpg';
import logo from '../assets/logo.png';
import avatar from '../assets/monk1.png';
import { useAuth } from '../contexts/AuthContext';
import { message } from 'antd';
import { MenuOutlined } from '@ant-design/icons';

const NotificationBar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    message.success('Đăng xuất thành công!', 3);
    navigate('/login');
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 z-30 shadow-lg px-4 sm:px-6 bg-cover bg-center"
      style={{
        backgroundImage: `url(${bgImage})`,
        height: '60px',
      }}
    >
      <div className="flex items-center justify-between h-full">
        <Link to="/">
          <img src={logo} alt="Logo" className="h-10 object-contain" />
        </Link>

        <div className="flex items-center space-x-3">
          {/* Mobile Menu Icon */}
          <div className="sm:hidden">
            <MenuOutlined
              className="text-white text-xl cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
            />
          </div>

          {/* User info - Desktop */}
          <div className="hidden sm:flex items-center space-x-4">
            {user ? (
              <>
                <div
                  onClick={() => navigate('/viewaccount')}
                  className="cursor-pointer hover:scale-105 transition"
                  title="View Account"
                >
                  <img src={avatar} alt="User" className="h-10 w-10 object-contain" />
                </div>
                <span className="text-white font-semibold">Hello {user.fullname}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 px-3 py-1 rounded text-white text-sm hover:bg-red-700 border border-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login">
                <button className="bg-red-600 px-3 py-1 rounded text-white text-sm hover:bg-red-700 border border-white">
                  Login
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="sm:hidden bg-black bg-opacity-80 mt-1 rounded text-white absolute right-4 top-[60px] w-48 shadow-lg z-50">
          {user ? (
            <div className="flex flex-col items-start px-4 py-2 space-y-2">
              <span className="flex items-center">
                <img src={avatar} alt="Avatar" className="w-6 h-6 rounded-full mr-2" />
                <span className="font-semibold">{user.fullname}</span>
              </span>
              <button
                onClick={() => {
                  navigate('/viewaccount');
                  setMenuOpen(false);
                }}
                className="hover:text-blue-400"
              >
                View Account
              </button>
              <button
                onClick={handleLogout}
                className="text-red-400 hover:text-red-500"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="px-4 py-2">
              <Link
                to="/login"
                className="block hover:text-blue-400"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBar;
