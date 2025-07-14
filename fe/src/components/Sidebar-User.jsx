import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { label: 'Account Information', path: '/viewaccount' },
  { label: 'History of Score', path: '/viewscorehistory' },
  { label: 'Booked Ticket', path: '/viewbookedticket' },
];

const UserSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActiveItem = (path) => {
    if (path === '/viewaccount') {
      return location.pathname.startsWith('/viewaccount') || location.pathname.startsWith('/editaccount');
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="bg-[#0a0f1c] text-white p-4 rounded-md w-64 min-h-[300px] flex flex-col justify-between">
      <div>
        <h2 className="text-base font-bold mb-4 flex items-center gap-2">
          <span className="text-xl">👤</span> Member Dashboard
        </h2>

        {navItems.map((item, idx) => (
          <NavLink
            key={idx}
            to={item.path}
            className={`block px-4 py-2 rounded transition ${
              isActiveItem(item.path)
                ? 'bg-red-800 text-white font-semibold'
                : 'hover:bg-gray-800'
            }`}
          >
            {item.label}
          </NavLink>
        ))}
      </div>

      <button
        onClick={handleLogout}
        className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded"
      >
        Logout
      </button>
    </div>
  );
};

export default UserSidebar;
