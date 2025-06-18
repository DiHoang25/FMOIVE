import React, { useState } from 'react';
import { message, Modal, Switch } from 'antd';
import SidebarLayout from '../../components/Sidebar-Employee';
import { ExclamationCircleFilled } from '@ant-design/icons';

const ViewMembers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const membersPerPage = 5;
   const { confirm } = Modal;

  // Dữ liệu thành viên gốc
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

  // Lấy trạng thái từ localStorage hoặc khởi tạo mới
  const [memberStatusMap, setMemberStatusMap] = useState(() => {
    const saved = localStorage.getItem('memberStatus');
    if (saved) return JSON.parse(saved);

    const initialStatus = {};
    initialMembers.forEach(member => {
      initialStatus[member.id] = member.status === 'Active';
    });
    return initialStatus;
  });

  // Cập nhật trạng thái member khi bật/tắt switch
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

  // Tạo mảng thành viên hiển thị với trạng thái cập nhật từ localStorage
  const members = initialMembers.map(member => ({
    ...member,
    status: memberStatusMap[member.id] ? 'Active' : 'Inactive',
  }));

  // Lọc theo từ khóa tìm kiếm
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
            <div className="flex-1 text-center">
              <h2 className="text-2xl text-white font-bold">Member Management</h2>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-4 relative w-64">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 text-gray-300 pl-4 pr-10 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-700 w-full"
              />
            </div>

            <div className="text-sm text-gray-400 mb-2">
              Showing {filteredMembers.length} members
            </div>

            {/* Table */}
            <div className="bg-gray-800 rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Full Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">DOB</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {filteredMembers
                    .slice((currentPage - 1) * membersPerPage, currentPage * membersPerPage)
                    .map(member => (
                      <tr key={member.id} className="hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{member.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{member.fullName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{member.DOB}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{member.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{member.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{member.address}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Switch
                            checkedChildren="Active"
                            unCheckedChildren="Inactive"
                            checked={memberStatusMap[member.id]}
                            onChange={(checked) => handleStatusChange(member.id, checked)}
                            style={{
                              backgroundColor: memberStatusMap[member.id] ? 'green' : 'red',
                              borderColor: memberStatusMap[member.id] ? 'green' : 'red',
                            }}
                          />
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
