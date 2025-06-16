import React from 'react';
import UserSidebar from './Sidebar-User'; // Import Sidebar tại đây

const UserDashboardLayout = ({ children }) => {
  return (
    <div className="flex gap-6 px-6 py-10 bg-black min-h-screen text-white">
      <UserSidebar /> {/* Sidebar nằm bên trái */}
      <div className="flex-1">{children}</div> {/* Nội dung trang */}
    </div>
  );
};

export default UserDashboardLayout;
