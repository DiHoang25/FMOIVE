import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SidebarLayout from '../../components/Sidebar-Admin';
import { getMoviesFromLocalStorage } from '../../data/movieData';

function AdminDashboard() {
  const [topFilms, setTopFilms] = useState([]);

  const parseRevenue = (revenueStr) => {
    if (!revenueStr) return 0;
    if (revenueStr.includes('M')) {
      return parseFloat(revenueStr.replace('M', '')) * 100; // 1M = 100 tỷ
    }
    return parseInt(revenueStr.replace(/\D/g, '')); // ví dụ '250 tỷ'
  };

  useEffect(() => {
    const allMovies = getMoviesFromLocalStorage();

    const filtered = allMovies
      .filter(movie => movie.revenue && parseRevenue(movie.revenue) >= 100)
      .map(movie => ({
        name: movie.name,
        revenue: parseRevenue(movie.revenue),
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    setTopFilms(filtered);
  }, []);

  const stats = [
    { value: 24, label: 'Total Movies' },
    { value: 18, label: 'Now Showing' },
    { value: 6, label: 'Coming Soon' },
    { value: 156, label: "Today's Shows" }
  ];

  const calculateBarWidth = (revenue) => {
    const maxRevenue = Math.max(...topFilms.map(film => film.revenue));
    return (revenue / maxRevenue) * 100;
  };

  return (
    <SidebarLayout>
      <div className="p-1">
        <main className="mt-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-2 mb-2">
            {stats.map((stat, index) => (
              <div key={index} className="bg-slate-800 p-1 rounded-md text-center">
                <h2 className="text-2xl font-bold text-white">{stat.value}</h2>
                <p className="text-gray-300 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-800 p-4 rounded-md mb-6">
            <h2 className="text-xl text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/admin/add-movie" className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-md text-center">
                Add Movie
              </Link>
              <Link to="/admin/view-members" className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-md text-center">
                View Accounts
              </Link>            
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-slate-800 p-2 rounded-md mt-1">
          <h2 className="text-base text-white mb-4 text-center font-semibold">
            Top 6 Domestic Films with Box Office Revenue Over 100 Billion VND
          </h2>
            <div className="space-y-4">
              {topFilms.map((film, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-1/3 text-right pr-4 text-gray-300">{film.name}</div>
                  <div className="w-2/3 relative h-8">
                    <div 
                      className="absolute top-0 left-0 h-8 bg-blue-500 rounded-sm"
                      style={{ width: `${calculateBarWidth(film.revenue)}%` }}
                    ></div>
                    <div className="absolute top-0 right-0 h-8 flex items-center pr-2 text-white font-medium">
                      {film.revenue}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-right text-xs text-gray-400">Doanh thu (tỷ đồng)</div>
          </div>
        </main>
      </div>
    </SidebarLayout>
  );
}

export default AdminDashboard;