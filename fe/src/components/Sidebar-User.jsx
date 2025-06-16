import React from 'react';
import { NavLink } from 'react-router-dom';

// Danh sách các mục điều hướng trong sidebar
const navItems = [
    // { label: 'Account Information', path: '/member/account' },
    { label: 'History of Score', path: '/viewscorehistory' },
    { label: 'Booked Ticket', path: '/viewbookedticket' },
    // { label: 'Canceled Ticket', path: '/member/canceled' },
];

const UserSidebar = () => {
    return (
        <div className="bg-[#0a0f1c] text-white p-4 rounded-md w-64" style={{ height: '200px' }}>
            <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                <span className="text-xl">👤</span> Member Dashboard
            </h2>

            {/* Vòng lặp để hiển thị các mục điều hướng được kích hoạt */}
            {navItems.map((item, idx) => (
                <NavLink
                    key={idx}
                    to={item.path}
                    className={({ isActive }) =>
                        `block px-4 py-2 rounded transition ${isActive
                            ? 'bg-red-800 text-white font-semibold'
                            : 'hover:bg-gray-800'
                        }`
                    }
                >
                    {item.label}
                </NavLink>
            ))}

            {/* Các mục bên dưới đang được comment vì chưa có trang tương ứng */}
            {/*
  <NavLink
    to="/member/account"
    className={({ isActive }) =>
      `block px-4 py-2 rounded transition ${
        isActive
          ? 'bg-red-800 text-white font-semibold'
          : 'hover:bg-gray-800'
      }`
    }
  >
    Account Information
  </NavLink>

  <NavLink
    to="/member/history"
    className={({ isActive }) =>
      `block px-4 py-2 rounded transition ${
        isActive
          ? 'bg-red-800 text-white font-semibold'
          : 'hover:bg-gray-800'
      }`
    }
  >
    History
  </NavLink>
  */}
        </div>
    );
};

export default UserSidebar;
