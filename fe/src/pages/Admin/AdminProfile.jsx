import React from 'react';
import avatar from '../../assets/avatar.png'; // avatar mặc định
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../../components/Sidebar-Admin';

const AdminProfile = () => {
  const navigate = useNavigate();

  return (
    <SidebarLayout>
      <div className="text-white py-10 px-6 min-h-[80vh] flex items-center justify-center">
      <div className="flex flex-col md:flex-row items-center gap-10 w-full max-w-5xl bg-slate-800 p-8 rounded-xl shadow-xl">
          {/* Avatar và Tên */}
          <div className="flex flex-col items-center md:ml-24">
            <img
              src={avatar}
              alt="Avatar"
              className="w-32 h-32 rounded-full mb-3 border-4 border-slate-600"
            />
            <h2 className="text-2xl font-bold mb-2 text-white">Mr.T</h2>
            <button
              // onClick={() => navigate('/editaccount')}
              className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition font-semibold"
            >
              Edit Profile
            </button>
          </div>

          {/* Thông tin người dùng */}
          <div className="text-left text-base space-y-2">
            <h1 className="text-3xl font-bold mb-4 text-red-600 border-b border-slate-600 pb-2">
              Account Information
            </h1>
            <p><span className="font-semibold text-slate-300">Name:</span> Mr.T</p>
            <p><span className="font-semibold text-slate-300">Account:</span> mrt1288</p>
            <p><span className="font-semibold text-slate-300">Email:</span> mrt1288@gmail.com</p>
            <p><span className="font-semibold text-slate-300">DOB:</span> 12/04/2000</p>
            <p><span className="font-semibold text-slate-300">Address:</span> Thu Duc Ward, Ho Chi Minh City</p>
            <p><span className="font-semibold text-slate-300">ID number:</span> 0123456789</p>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default AdminProfile;
