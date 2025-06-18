import React, { useState } from 'react';
import SidebarLayout from '../../components/Sidebar-Admin';
import { Switch, Modal, message } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';

const ViewMembers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const membersPerPage = 5;
  const { confirm } = Modal;

  const initialMembers = [
    { id: 1, fullName: "Tran Van Tan", DOB: "1996-11-21", email: "tantran@gmail.com", phone: "0912345678", address: "Hue", status: "Active" },
    { id: 2, fullName: "Nguyen Thi Hoa", DOB: "1993-05-12", email: "hoanguyen@gmail.com", phone: "0978654321", address: "Da Nang", status: "Active" },
    { id: 3, fullName: "Le Van Long", DOB: "1988-08-30", email: "longvl@yahoo.com", phone: "0903124567", address: "Hanoi", status: "Inactive" },
    { id: 4, fullName: "Pham Thi Mai", DOB: "1985-02-25", email: "maipham@gmail.com", phone: "0834223333", address: "Can Tho", status: "Inactive" },
    { id: 5, fullName: "Do Minh Tuan", DOB: "1990-12-15", email: "tuando@gmail.com", phone: "0981233445", address: "Ho Chi Minh City", status: "Active" },
    { id: 6, fullName: "Nguyen Trung Hieu", DOB: "2004-08-24", email: "hieunguyen@gmail.com", phone: "0369779578", address: "Gia Lai", status: "Active" },
    { id: 7, fullName: "Do Minh Khoa", DOB: "1992-03-11", email: "khoadominh@gmail.com", phone: "0905123456", address: "Ho Chi Minh City", status: "Active" },
    { id: 8, fullName: "Vu Minh Tuan", DOB: "1990-12-16", email: "tuanvu@gmail.com", phone: "0989999888", address: "Bien Hoa", status: "Active" },
    { id: 9, fullName: "Do Van Thanh", DOB: "1991-07-09", email: "thanhdo@gmail.com", phone: "0977333444", address: "Ho Chi Minh City", status: "Active" }
  ];

  const [memberStatusMap, setMemberStatusMap] = useState(() => {
    const saved = localStorage.getItem('memberStatus');
    if (saved) return JSON.parse(saved);

    const initialStatus = {};
    initialMembers.forEach(member => {
      initialStatus[member.id] = member.status === 'Active';
    });
    return initialStatus;
  });

  const [memberRoles, setMemberRoles] = useState(() => {
    const saved = localStorage.getItem('memberRoles');
    if (saved) return JSON.parse(saved);

    const initialRoles = {};
    initialMembers.forEach(member => {
      initialRoles[member.id] = 'User';
    });
    return initialRoles;
  });

  const handleStatusChange = (memberId, checked) => {
    const member = initialMembers.find(m => m.id === memberId);

    confirm({
      title: 'Confirm Status Change',
      icon: <ExclamationCircleFilled />,
      content: `Do you want to ${checked ? 'activate' : 'deactivate'} member "${member.fullName}"?`,
      okText: 'Yes',
      cancelText: 'No',
      okType: 'primary',
      okButtonProps: {
        style: {
          backgroundColor: '#1677ff',
          color: 'white',
          borderColor: '#1677ff',
        },
      },
      onOk() {
        const updatedStatus = {
          ...memberStatusMap,
          [memberId]: checked,
        };
        setMemberStatusMap(updatedStatus);
        localStorage.setItem('memberStatus', JSON.stringify(updatedStatus));
        message.success(`Member "${member.fullName}" is now ${checked ? 'active' : 'inactive'}.`);
      },
    });
  };

  const handleRoleChange = (memberId, newRole) => {
    const member = initialMembers.find(m => m.id === memberId);

    confirm({
      title: 'Confirm Role Change',
      icon: <ExclamationCircleFilled />,
      content: `Do you want to change role of "${member.fullName}" to "${newRole}"?`,
      okText: 'Yes',
      cancelText: 'No',
      okType: 'primary',
      okButtonProps: {
        style: {
          backgroundColor: '#1677ff',
          color: 'white',
          borderColor: '#1677ff',
        },
      },
      onOk() {
        const updatedRoles = {
          ...memberRoles,
          [memberId]: newRole,
        };
        setMemberRoles(updatedRoles);
        localStorage.setItem('memberRoles', JSON.stringify(updatedRoles));
        message.success(`Role of "${member.fullName}" changed to "${newRole}".`);
      },
    });
  };

  const members = initialMembers.map(member => ({
    ...member,
    status: memberStatusMap[member.id] ? 'Active' : 'Inactive',
    role: memberRoles[member.id] || 'User'
  }));

  const filteredMembers = members.filter(member =>
    member.id.toString().includes(searchTerm) ||
    member.fullName.trim().toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
    member.email.trim().toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
    member.address.trim().toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <SidebarLayout>
      <div className="flex h-screen">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 flex items-center justify-between">
<<<<<<< HEAD
            <h2 className="text-2xl text-white font-bold text-center w-full">Member Management </h2>
=======
            <h2 className="text-2xl text-white font-bold text-center w-full">Account Management</h2>
>>>>>>> cfdbb9eab46a79e50d6c19f1626fea39c4d1bc45
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-4 flex items-center justify-between">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 text-gray-300 pl-4 pr-10 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-700 w-64"
              />
            </div>

            <div className="text-sm text-gray-400 mb-2">
              Showing {filteredMembers.length} members
            </div>

            <div className="bg-gray-800 rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">ID #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Full Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">DOB</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Role</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {filteredMembers
                    .slice((currentPage - 1) * membersPerPage, currentPage * membersPerPage)
                    .map(member => (
                      <tr key={member.id} className="hover:bg-gray-700">
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
                              borderColor: member.status === 'Active' ? 'green' : 'red',
                            }}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <select
                            className="bg-gray-700 text-gray-300 rounded p-1 focus:outline-none focus:ring-1 focus:ring-gray-600"
                            value={member.role}
                            onChange={(e) => handleRoleChange(member.id, e.target.value)}
                          >
                            <option value="Admin">Admin</option>
                            <option value="User">User</option>
                            <option value="Employee">Employee</option>
                          </select>
                        </td>                       
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-center items-center space-x-2 mt-4">
              <button
                className="p-2 rounded-md text-red-500 hover:bg-gray-800"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {Array.from({ length: Math.ceil(filteredMembers.length / membersPerPage) }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`w-8 h-8 rounded-md flex items-center justify-center ${currentPage === page ? 'bg-red-500 text-white' : 'text-gray-400 hover:bg-gray-800'
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
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default ViewMembers;
