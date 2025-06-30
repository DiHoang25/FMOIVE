import React, { useState, useEffect } from 'react';
import SidebarLayout from '../../components/Sidebar-Admin';
import { Switch, Modal, message } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import axios from 'axios'; // Import axios for API calls

// Define your backend base URL here
// IMPORTANT: Replace 5000 with the actual port your backend is running on
const API_BASE_URL = 'http://localhost:5000/api/admin'; // Base URL for admin-specific customer fetches/actions
const AUTH_API_BASE_URL = 'http://localhost:5000/api/auth'; // New base URL for auth-related actions (like status updates)

const ViewMembers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [members, setMembers] = useState([]); // State to hold fetched members
  const [loading, setLoading] = useState(true); // Loading state
  const { confirm } = Modal;

  const membersPerPage = 5;

  // State to manage member status (active/inactive)
  const [memberStatusMap, setMemberStatusMap] = useState({});
  // memberRoles state and handleRoleChange function are removed as requested.

  useEffect(() => {
    fetchMembers();
  }, []); // Fetch members on component mount

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token'); // Assuming token is stored in localStorage after admin login
      if (!token) {
        message.error('Authentication token not found. Please log in as admin.');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/customers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const fetchedMembers = response.data.customers.map(user => ({
        id: user.userId, // Use userId as the unique ID for frontend display and API calls
        _id: user._id, // Keep MongoDB _id for potential future use if needed
        fullName: user.fullname,
        DOB: user.date_of_birth ? new Date(user.date_of_birth).toISOString().split('T')[0] : 'N/A',
        email: user.email,
        phone: user.phone,
        address: user.address,
        status: user.is_actived ? 'Active' : 'Inactive',
        role: user.role, // Keep role for display if needed, but not for changing
      }));

      setMembers(fetchedMembers);

      // Initialize status map based on fetched data
      const initialStatus = {};
      fetchedMembers.forEach(member => {
        initialStatus[member.id] = member.status === 'Active';
      });
      setMemberStatusMap(initialStatus);

      message.success('Customer list fetched successfully!');
    } catch (error) {
      console.error('Error fetching members:', error);
      message.error(`Failed to fetch customer list: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (memberId, checked) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    confirm({
      title: 'Confirm Status Change',
      icon: <ExclamationCircleFilled />,
      content: `Do you want to ${checked ? 'activate' : 'deactivate'} member "${member.fullName}"?`,
      okText: 'Yes',
      cancelText: 'No',
      okType: 'primary',
      okButtonProps: {
        style: {
          backgroundColor: '#dc2626', // Tailwind red-600
          color: 'white',
          borderColor: '#dc2626',
        },
      },
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            message.error('Authentication token not found. Please log in as admin.');
            return;
          }

          // Use AUTH_API_BASE_URL for status updates to be consistent with employee status changes
          await axios.patch(
            `${AUTH_API_BASE_URL}/${member.id}/status`, // Use member.id which is userId
            { status: checked.toString() }, // Backend expects status as string 'true' or 'false'
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          // Update local state only after successful API call
          setMemberStatusMap(prevStatus => ({
            ...prevStatus,
            [memberId]: checked,
          }));
          message.success(`Member "${member.fullName}" is now ${checked ? 'active' : 'inactive'}.`);
        } catch (error) {
          console.error('Error changing member status:', error);
          message.error(`Failed to update status for "${member.fullName}": ${error.response?.data?.message || error.message}`);
        }
      },
    });
  };

  // handleRoleChange function has been removed.

  const membersToDisplay = members.map(member => ({
    ...member,
    status: memberStatusMap[member.id] ? 'Active' : 'Inactive',
    // Role is now just for display, no longer mutable from this component
  }));

  const filteredMembers = membersToDisplay.filter(member =>
    member.id.toString().includes(searchTerm) ||
    member.fullName.trim().toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
    member.email.trim().toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
    member.address.trim().toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const totalPages = Math.ceil(filteredMembers.length / membersPerPage);
  const currentMembers = filteredMembers.slice((currentPage - 1) * membersPerPage, currentPage * membersPerPage);

  return (
    <SidebarLayout>
      <div className="flex h-screen text-white">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 flex items-center justify-between  shadow-md">
            <h2 className="text-2xl text-white-500 font-bold text-center w-full">Account Management</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-4 flex items-center justify-between">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 text-gray-300 pl-4 pr-10 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-red-700 w-64"
              />
            </div>

            {loading ? (
              <div className="text-center text-gray-400">Loading members...</div>
            ) : (
              <>
                <div className="text-sm text-gray-400 mb-2">
                  Showing {filteredMembers.length} members
                </div>

                <div className="bg-gray-800 rounded-md overflow-hidden border border-zinc-700">
                  <table className="min-w-full divide-y divide-zinc-700">
                    <thead>
                      <tr className="bg-gray-800">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">ID #</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Full Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">DOB</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Address</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                        {/* Role column header removed */}
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-zinc-700">
                      {currentMembers.map(member => (
                        <tr key={member.id} className="hover:bg-gray-700 transition-colors duration-200">
                          <td className="px-6 py-4 text-sm text-gray-300">{member.id}</td>
                          <td className="px-6 py-4 text-sm text-gray-300">{member.fullName}</td>
                          <td className="px-6 py-4 text-sm text-gray-300">{member.DOB}</td>
                          <td className="px-6 py-4 text-sm text-gray-300">{member.email}</td>
                          <td className="px-6 py-4 text-sm text-gray-300">{member.phone}</td>
                          <td className="px-6 py-4 text-sm text-gray-300">{member.address}</td>
                          <td className="px-6 py-4">
                            <Switch
                              checkedChildren="Active"
                              unCheckedChildren="Inactive"
                              checked={member.status === 'Active'}
                              onChange={(checked) => handleStatusChange(member.id, checked)}
                              style={{
                                backgroundColor: member.status === 'Active' ? 'green' : 'red',
                                borderColor: member.status === 'Active' ? '#dc2626' : '#4b5563',
                              }}
                            />
                          </td>
                          {/* Role column data removed */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-center items-center space-x-2 mt-4">
                  <button
                    className="p-2 rounded-md text-red-500 hover:bg-zinc-800"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      className={`w-8 h-8 rounded-md flex items-center justify-center ${
                        currentPage === page ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-zinc-800'
                      }`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    className="p-2 rounded-md text-red-500 hover:bg-zinc-800"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default ViewMembers;