import React from 'react';
import { Link } from 'react-router-dom';
import SidebarLayoutEmployee from '../../components/Sidebar-Employee';

function EmployeeDashboard() {
  const stats = [
    { value: 24, label: 'Total Movies' },
    { value: 18, label: 'Now Showing' },
    { value: 6, label: 'Coming Soon' },
    { value: 156, label: 'Today\'s Shows' }
  ];

  return (
    <SidebarLayoutEmployee>
    <div className="flex h-screen">


      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">

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
              <Link to="/employee/add-combo" className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-md text-center">
                Add Combo Popcorn & Drinks
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
    </SidebarLayoutEmployee>
  );
}

export default EmployeeDashboard;
