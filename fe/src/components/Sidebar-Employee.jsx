import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// import {
//   FaHome,
//   FaUsers,
//   FaFilm,
//   FaCouch,
//   FaTicketAlt,
//   FaClipboardList,
//   FaInfoCircle,
//   FaUserTie,
//   FaList,
//   FaDoorOpen,
//   FaPercentage,
//   FaBars
// } from 'react-icons/fa';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    { name: 'Dashboard Overview', path: '/employee' },
    { name: 'Confirm Tickets', path: '/confirm' },
    { name: 'Booking List', path: '/bookings' },
    { name: 'Ticket Information', path: '/tickets' },
    { name: 'View Members', path: '/employee/members-list' },
  ];

  return (
    <div className="h-screen bg-gray-900 text-gray-300 flex flex-col w-64">
      {/* Header */}
      <div className="p-3 border-b border-gray-800 bg-gray-800">
        <h1 className="text-xl font-bold text-white">Cinema Management</h1>
        <p className="text-sm text-gray-400">Employee Dashboard</p>
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="flex items-center justify-center gap-2 m-3 p-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
      >
        Toggle Menu
      </button>
      {/* Collapsible Menu */}
      {!isOpen && (
        <div className="p-3 border-b border-gray-800 bg-gray-800">
          <ul>
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 ${item.active
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-700'
                    }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Sidebar;