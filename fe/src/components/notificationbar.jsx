import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bgImage from '../assets/bg.jpg';
import logo from '../assets/logo.png';
import avatar from '../assets/avatar.png';
import { useAuth } from '../contexts/AuthContext';
import { message } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';

const NotificationBar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    message.success('Đăng xuất thành công!', 3);
    navigate('/login');
  };

  const handleAvatarClick = () => {
    setMenuOpen(prev => !prev);
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 z-30 shadow-lg px-4 sm:px-6 bg-cover bg-center"
      style={{
        backgroundImage: `url(${bgImage})`,
        height: '60px',
      }}
    >
      <div className="flex items-center justify-between h-full relative">
        <img src={logo} alt="Logo" className="h-10 object-contain cursor-pointer" onClick={() => navigate('/')} />

        {user && (
          <div className="relative">
            <div
              className="cursor-pointer flex items-center space-x-2"
              onClick={handleAvatarClick}
              title="Account Menu"
            >
              <img src={avatar} alt="User" className="h-10 w-10 object-contain" />
              <span className="text-white hidden sm:inline font-semibold">Hi {user.fullname}</span>
            </div>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-gradient-to-br from-black via-gray-900 to-black text-white rounded-lg shadow-lg z-50">
                <div className="p-4 border-b">
                  <p className="font-semibold text-sm text-white">{user.fullname}</p>
                </div>
                <div className="flex flex-col py-2 text-sm text-white">
                  <button
                    onClick={() => {
                      navigate('/viewaccount');
                      setMenuOpen(false);
                    }}
                    className="text-left px-4 py-2 hover:bg-gray-400 flex items-center gap-2"
                  >
                    <span role="img" aria-label="profile">🧑‍💼</span> Account
                  </button>

                  <button
                    onClick={handleLogout}
                    className=" px-5 py-1 rounded text-red-500 text-sm hover:bg-gray-400 flex items-center gap-2"
                  >
                    <LogoutOutlined />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationBar;
