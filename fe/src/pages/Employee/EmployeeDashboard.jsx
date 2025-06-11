import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar-Employee';

function EmployeeDashboard() {
  const stats = [
    { value: 24, label: 'Total Movies' },
    { value: 18, label: 'Now Showing' },
    { value: 6, label: 'Coming Soon' },
    { value: 156, label: 'Today\'s Shows' }
  ];

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar Component */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="p-4 flex justify-between items-center border-b border-gray-800">
          <h1 className="text-2xl text-gray-300">Employee</h1>
          
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-gray-800 text-gray-300 pl-4 pr-10 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-700"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              </button>
            </div>
            
            {/* User Avatar */}
            <Link to="/Employee/employee-profile">
              <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">
                E
              </div>
            </Link>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-gray-800 p-6 rounded-md text-center">
                <h2 className="text-3xl font-bold text-white">{stat.value}</h2>
                <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions Section */}
          <div className="bg-gray-800 p-4 rounded-md mb-6">
            <h2 className="text-xl text-gray-300 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4">
              <button className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-md flex items-center justify-center">
                <div className="mr-2" /> View Members
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default EmployeeDashboard;
