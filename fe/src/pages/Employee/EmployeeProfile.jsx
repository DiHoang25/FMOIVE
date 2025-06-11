import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar-Employee';

const EmployeeProfile = () => {
  // Sample employee data
  const employee = {
    id: 5,
    fullName: 'Do Minh Tuan',
    idCard: '1990-12-15',
    email: 'tuando@gmail.com',
    phone: '0981233445',
    address: 'Ho Chi Minh City',
  };

  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="p-4 flex justify-between items-center border-b border-gray-800">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-white mr-4"
            >
              <i className="fas fa-arrow-left text-xl"></i>
            </button>
            <h1 className="text-2xl text-gray-300">Employee Profile</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* User Avatar */}
            <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">
              E
            </div>
          </div>
        </header>

        <div className="bg-gray-900 p-4 flex items-center justify-between">
          <Link to="/employee" className="text-gray-400 hover:text-gray-300 flex items-center mr-4">
            <div className="mr-1" /> Back
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="bg-gray-800 rounded-lg p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-6 pb-2 border-b border-gray-700">Employee Information</h2>
            <div className="space-y-4">
              <div className="flex items-center p-3 hover:bg-gray-700 rounded-md transition-colors duration-200">
                <div className="w-24 text-gray-400 font-medium">ID:</div>
                <div className="text-gray-300 font-semibold">{employee.id}</div>
              </div>
              <div className="flex items-center p-3 hover:bg-gray-700 rounded-md transition-colors duration-200">
                <div className="w-24 text-gray-400 font-medium">Full Name:</div>
                <div className="text-gray-300 font-semibold">{employee.fullName}</div>
              </div>
              <div className="flex items-center p-3 hover:bg-gray-700 rounded-md transition-colors duration-200">
                <div className="w-24 text-gray-400 font-medium">ID Card:</div>
                <div className="text-gray-300 font-semibold">{employee.idCard}</div>
              </div>
              <div className="flex items-center p-3 hover:bg-gray-700 rounded-md transition-colors duration-200">
                <div className="w-24 text-gray-400 font-medium">Email:</div>
                <div className="text-gray-300 font-semibold">{employee.email}</div>
              </div>
              <div className="flex items-center p-3 hover:bg-gray-700 rounded-md transition-colors duration-200">
                <div className="w-24 text-gray-400 font-medium">Phone:</div>
                <div className="text-gray-300 font-semibold">{employee.phone}</div>
              </div>
              <div className="flex items-center p-3 hover:bg-gray-700 rounded-md transition-colors duration-200">
                <div className="w-24 text-gray-400 font-medium">Address:</div>
                <div className="text-gray-300 font-semibold">{employee.address}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;