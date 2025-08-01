import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import bgImage from '../assets/bg.jpg';
import logo from '../assets/logo.png';
import avatar from '../assets/avatar.png';
import { useAuth } from '../contexts/AuthContext';
import { message } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import UserNotification from './UserNotification';
import socket from '../utils/socket';

const NotificationBar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    message.success('Đăng xuất thành công!', 3);
    navigate('/login');
  };

  useEffect(() => {
    if (user?.username && socket) {
      socket.emit('register', {
        username: user.username,
        role: user.role || 'customer',
      });

      const handleForceLogout = (data) => {
        message.error(data?.message || 'Tài khoản đã đăng nhập ở thiết bị khác.');
        handleLogout();
      };

      const handleDisconnect = (reason) => {
        // Chỉ logout nếu chưa phải tự logout (tránh lặp)
        if (user?.username) {
          message.error('Phiên đăng nhập đã kết thúc hoặc bị ngắt kết nối.');
          handleLogout();
        }
      };

      socket.on('forceLogout', handleForceLogout);
      socket.on('disconnect', handleDisconnect);

      return () => {
        socket.off('forceLogout', handleForceLogout);
        socket.off('disconnect', handleDisconnect);
      };
    }
  }, [user]);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-30 shadow-lg px-4 sm:px-6 bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})`, height: '60px' }}
    >
      <div className="flex items-center justify-between h-full relative">
        <img
          src={logo}
          alt="Logo"
          className="h-10 object-contain cursor-pointer"
          onClick={() => navigate('/')}
        />

        {user ? (
          <div className="flex items-center gap-6">
            <UserNotification />
            <div className="relative group">
              <div className="flex items-center space-x-2 cursor-pointer">
                <img src={avatar} alt="User" className="h-10 w-10 object-contain" />
                <span className="text-white hidden sm:inline font-semibold">Hi {user.fullname}</span>
              </div>

              <div className="absolute right-0 mt-2 w-56 bg-gradient-to-br from-black via-gray-900 to-black text-white rounded-lg shadow-lg z-50 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200">
                <div className="p-4 border-b border-gray-600">
                  <p className="flex justify-center items-center font-semibold text-sm">{user.fullname}</p>
                </div>
                <div className="flex flex-col py-2 text-sm">
                  <button
                    onClick={() => navigate('/viewaccount')}
                    className="text-left px-3 py-2 hover:bg-gray-700 flex items-center gap-2 transition-colors duration-200"
                  >
                    <span role="img" aria-label="profile">🧑‍💼</span> Account
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-red-500 hover:text-white hover:bg-red-600 rounded-md transition-all duration-200 flex items-center gap-2"
                  >
                    <LogoutOutlined />
                    Log out
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Link to="/login">
            <button className="bg-red-600 px-3 py-1 rounded text-white text-sm hover:bg-red-700 border border-white">
              Login
            </button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default NotificationBar;
