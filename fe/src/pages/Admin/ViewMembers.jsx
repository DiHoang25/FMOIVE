import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar-Admin';
// import { FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const ViewMembers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const membersPerPage = 5;

  // Sample member data
  const members = [
    { 
      id: 1, 
      fullName: "Tran Van Tan", 
      DOB: "1996-11-21", 
      email: "tantran@gmail.com", 
      phone: "0912345678", 
      address: "Hue", 
      status: "Active" 
    },
    { 
      id: 2, 
      fullName: "Nguyen Thi Hoa", 
      DOB: "1993-05-12", 
      email: "hoanguyen@gmail.com", 
      phone: "0978654321", 
      address: "Da Nang", 
      status: "Active" 
    },
    { 
      id: 3, 
      fullName: "Le Van Long", 
      DOB: "1988-08-30", 
      email: "longvl@yahoo.com", 
      phone: "0903124567", 
      address: "Hanoi", 
      status: "Inactive" 
    },
    { 
      id: 4, 
      fullName: "Pham Thi Mai", 
      DOB: "1985-02-25", 
      email: "maipham@gmail.com", 
      phone: "0834223333", 
      address: "Can Tho", 
      status: "Inactive" 
    },
    { 
      id: 5, 
      fullName: "Do Minh Tuan", 
      DOB: "1990-12-15", 
      email: "tuando@gmail.com", 
      phone: "0981233445", 
      address: "Ho Chi Minh City", 
      status: "Active" 
    },
    { 
      id: 6, 
      fullName: "Nguyen Trung Hieu", 
      DOB: "2004-08-24", 
      email: "hieunguyen@gmail.com", 
      phone: "0369779578", 
      address: "Gia Lai", 
      status: "Active" 
    },
    { 
      id: 7, 
      fullName: "Do Minh Khoa", 
      DOB: "1992-03-11", 
      email: "khoadominh@gmail.com", 
      phone: "0905123456", 
      address: "Ho Chi Minh City", 
      status: "Active" 
    },
    { 
      id: 8, 
      fullName: "Vu Minh Tuan", 
      DOB: "1990-12-16", 
      email: "tuanvu@gmail.com", 
      phone: "0989999888", 
      address: "Bien Hoa", 
      status: "Active" 
    },
    { 
      id: 9, 
      fullName: "Do Van Thanh", 
      DOB: "1991-07-09", 
      email: "thanhdo@gmail.com", 
      phone: "0977333444", 
      address: "Ho Chi Minh City", 
      status: "Active" 
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
            <h1 className="text-2xl text-gray-300">Admin</h1>
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
            <h2 className="text-2xl text-white font-bold">Member Management</h2>
          </div>
        </div>

        {/* Members Table */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Search within members */}
          <div className="mb-4 relative w-64">
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
                    DOB
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
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredMembers
    .slice((currentPage - 1) * membersPerPage, currentPage * membersPerPage)
    .map((member) => (
                  <tr key={member.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {member.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {member.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {member.DOB}
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
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member.status === 'Active' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-red-500 text-white'
                      }`}>
                        {member.status}
                      </span>
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
               disabled={currentPage === 1}
            >
              <div className="mr-1" /> Previous            
            </button>
            {Array.from({length: Math.ceil(filteredMembers.length / membersPerPage)}, (_, i) => i + 1).map((page) => (
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
              onClick={() => setCurrentPage(Math.min(
                 Math.ceil(filteredMembers.length / membersPerPage), 
                 currentPage + 1
               ))}
               disabled={currentPage === Math.ceil(filteredMembers.length / membersPerPage)}
            >
              <div className="mr-1" /> Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewMembers;