import React from 'react';
import { Link } from 'react-router-dom';
import SidebarLayout from '../../components/Sidebar-Admin';

const AdminProfile = () => {
  return (
    <SidebarLayout>
    <div className="flex h-screen">

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="p-4 flex justify-between items-center border-b border-gray-800">
          <div className="flex items-center">
            <h1 className="text-2xl text-gray-300">Admin Profile</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* User Avatar */}
              <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">
                A
              </div>
          </div>
        </header>


        <div className="flex-1 overflow-y-auto p-4">
          <div className="bg-gray-800 rounded-lg p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-6 pb-2 border-b border-gray-700">Profile Information</h2>
            <div className="space-y-4">
              <div className="flex items-center p-3 hover:bg-gray-700 rounded-md transition-colors duration-200">
                <div className="w-24 text-gray-400 font-medium">Name:</div>
                <div className="text-gray-300 font-semibold">Admin User</div>
              </div>
              <div className="flex items-center p-3 hover:bg-gray-700 rounded-md transition-colors duration-200">
                <div className="w-24 text-gray-400 font-medium">Email:</div>
                <div className="text-gray-300 font-semibold">admin@example.com</div>
              </div>
              <div className="flex items-center p-3 hover:bg-gray-700 rounded-md transition-colors duration-200">
                <div className="w-24 text-gray-400 font-medium">Role:</div>
                <div className="text-gray-300 font-semibold">Administrator</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </SidebarLayout>
  );
};

export default AdminProfile;