import React from 'react';
import { Link } from 'react-router-dom';
import SidebarLayout from '../../components/Sidebar-Admin';

function AdminDashboard() {
  const stats = [
    { value: 24, label: 'Total Movies' },
    { value: 18, label: 'Now Showing' },
    { value: 6, label: 'Coming Soon' },
    { value: 156, label: "Today's Shows" }
  ];

  const topFilms = [
    { name: 'Nhà Bà Nữ', revenue: 459.6 },
    { name: 'Lật Mặt 6', revenue: 279.1 },
    { name: 'Đất Rừng Phương Nam', revenue: 140.4 },
    { name: 'Siêu Lừa Gặp Siêu Lầy', revenue: 121.6 },
    { name: 'Chị Chị Em Em 2', revenue: 121.1 },
    { name: 'Người Vợ Cuối Cùng', revenue: 100 }
  ];

  const calculateBarWidth = (revenue) => {
    const maxRevenue = Math.max(...topFilms.map(film => film.revenue));
    return (revenue / maxRevenue) * 100;
  };

  return (
    <SidebarLayout>
      <div className="p-1">
        

        {/* Dashboard Content */}
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

          {/* Quick Actions Section */}
          <div className="bg-slate-800 p-4 rounded-md mb-6">
            <h2 className="text-xl text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/admin/add-movie" className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-md text-center">
                Add Movie
              </Link>
              <button className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-md">
                View Members
              </button>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-slate-800 p-2 rounded-md mt-1">
            <h2 className="text-base text-white mb-1 ">
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
