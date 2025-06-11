import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar-Admin';
// import { FaSearch, FaPlus, FaUsers } from 'react-icons/fa';

function AdminDashboard() {
  // Sample data for stats and chart
  const stats = [
    { value: 24, label: 'Total Movies' },
    { value: 18, label: 'Now Showing' },
    { value: 6, label: 'Coming Soon' },
    { value: 156, label: 'Today\'s Shows' }
  ];

  const topFilms = [
    { name: 'Nhà Bà Nữ', revenue: 459.6 },
    { name: 'Lật Mặt 6', revenue: 279.1 },
    { name: 'Đất Rừng Phương Nam', revenue: 140.4 },
    { name: 'Siêu Lừa Gặp Siêu Lầy', revenue: 121.6 },
    { name: 'Chị Chị Em Em 2', revenue: 121.1 },
    { name: 'Người Vợ Cuối Cùng', revenue: 100 }
  ];

  // Function to calculate bar width percentage
  const calculateBarWidth = (revenue) => {
    const maxRevenue = Math.max(...topFilms.map(film => film.revenue));
    return (revenue / maxRevenue) * 100;
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar Component */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="p-4 flex justify-between items-center border-b border-gray-800">
          <h1 className="text-2xl text-gray-300">Admin</h1>
          
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
            <Link to="/admin/admin-profile">
              <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">
                A
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
            <div className="grid grid-cols-2 gap-4">
              <button className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-md flex items-center justify-center">
                <div className="mr-2" /> Add Movie
              </button>
              <button className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-md flex items-center justify-center">
                <div className="mr-2" /> View Members
              </button>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-gray-800 p-6 rounded-md">
            <h2 className="text-xl text-white mb-6">Top 6 Domestic Films with Box Office Revenue Over 100 Billion VND</h2>
            
            <div className="space-y-4">
              {topFilms.map((film, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-1/3 text-right pr-4 text-gray-300">
                    {film.name}
                  </div>
                  <div className="w-2/3">
                    <div className="relative h-8">
                      <div 
                        className="absolute top-0 left-0 h-8 bg-blue-500 rounded-sm"
                        style={{ width: `${calculateBarWidth(film.revenue)}%` }}
                      ></div>
                      <div className="absolute top-0 right-0 h-8 flex items-center pr-2 text-white font-medium">
                        {film.revenue}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-right text-xs text-gray-400">
              Doanh thu (tỷ đồng)
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;