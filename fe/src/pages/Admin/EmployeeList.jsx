import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar-Admin';
// import { FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const EmployeeList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Sample member data
  const members = [
    { 
      id: 5, 
      fullName: 'Do Minh Tuan', 
      idCard: '1990-12-15', 
      email: 'tuando@gmail.com', 
      phone: '0981233445', 
      address: 'Ho Chi Minh City', 
    },
    { 
      id: 3, 
      fullName: 'Le Van Long', 
      idCard: '1988-08-30', 
      email: 'longvl@yahoo.com', 
      phone: '0903124567', 
      address: 'Hanoi', 
    },
    { 
      id: 2, 
      fullName: 'Nguyen Thi Hoa', 
      idCard: '1993-05-12', 
      email: 'hoanguyen@gmail.com', 
      phone: '0978654321', 
      address: 'Da Nang', 
    },
    { 
      id: 4, 
      fullName: 'Pham Thi Mai', 
      idCard: '1985-02-25', 
      email: 'maipham@gmail.com', 
      phone: '0834223333', 
      address: 'Can Tho',  
    },
    { 
      id: 1, 
      fullName: 'Tran Van Tan', 
      idCard: '1996-11-21', 
      email: 'tantran@gmail.com', 
      phone: '0912345678', 
      address: 'Hue', 
    },
    { 
      id: 6, 
      fullName: 'Nguyen Trung Hieu', 
      idCard: '2004-08-24', 
      email: 'hieunguyen@gmail.com', 
      phone: '0369779578', 
      address: 'Gia Lai', 
    }
  ];

  // Function to handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter members based on search term
  const filteredMembers = members.filter(member => 
    member.id.toString().includes(searchTerm) ||
    member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar Component */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="p-4 flex justify-between items-center border-b border-gray-800">
          <div className="flex items-center">
            <h1 className="text-2xl text-gray-300">Employee</h1>
          </div>
          
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

        {/* Back Button and Title */}
        <div className="bg-gray-900 p-4 flex items-center justify-between">
          <Link to="/admin" className="text-gray-400 hover:text-gray-300 flex items-center mr-4">
            <div className="mr-1" /> Back
          </Link>
          <div className="flex-1 text-center">
            <h2 className="text-2xl text-white font-bold">Employee List</h2>
          </div>
        </div>

        {/* Members Table */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Search within members */}
          <div className="mb-4 flex items-center justify-between">
            <div className="relative w-64">
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={handleSearch}
                className="bg-gray-800 text-gray-300 pl-4 pr-10 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-700 w-full"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              </button>
            </div>
            
            <button 
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              onClick={() => console.log("Add Employee clicked")}
            >
              Add Employee
            </button>
          </div>
          
          <div className="text-sm text-gray-400 mb-2">
            Showing {filteredMembers.length} members
          </div>
          
          {/* Table */}
          <div className="bg-gray-800 rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr className="bg-gray-800">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    ID #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Full Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    ID Card
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {member.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {member.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {member.idCard}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {member.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {member.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {member.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button 
                          className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs"
                          onClick={() => handleEdit(member.id)}
                        >
                          Edit
                        </button>
                        <button 
                          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs"
                          onClick={() => handleDelete(member.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="flex justify-center items-center space-x-2 mt-4">
            <button 
              className="p-2 rounded-md text-red-500 hover:bg-gray-800"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            >
            </button>
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                className={`w-8 h-8 rounded-md flex items-center justify-center ${
                  currentPage === page
                    ? 'bg-red-500 text-white'
                    : 'text-gray-400 hover:bg-gray-800'
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button 
              className="p-2 rounded-md text-red-500 hover:bg-gray-800"
              onClick={() => setCurrentPage(Math.min(3, currentPage + 1))}
            >
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeList;

const handleEdit = (id) => {
  // Xử lý chỉnh sửa ở đây
  console.log(`Edit member with id: ${id}`);
};

const handleDelete = (id) => {
  // Xử lý xóa ở đây
  console.log(`Delete member with id: ${id}`);
};