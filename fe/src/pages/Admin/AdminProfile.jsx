import React, { useState, useEffect } from 'react';
import avatar from '../../assets/avatar.png';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../../components/Sidebar-Admin';

const AdminProfile = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdmin = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated.');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (!response.ok) {
          setError(data.message || 'Failed to fetch admin data.');
        } else {
          setAdmin(data.user);
        }
      } catch (err) {
        console.error('Error fetching admin:', err);
        setError('Failed to fetch admin data.');
      }
    };

    fetchAdmin();
  }, []);

  if (error) {
    return (
      <SidebarLayout>
        <div className="text-center text-red-500 mt-10">{error}</div>
      </SidebarLayout>
    );
  }

  if (!admin) {
    return (
      <SidebarLayout>
        <div className="text-center text-white mt-10">Loading...</div>
      </SidebarLayout>
    );
  }

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formattedDOB = admin.date_of_birth
    ? formatDate(admin.date_of_birth)
    : 'Not provided';

  return (
    <SidebarLayout>
      <div className="text-white py-10 px-6 min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col md:flex-row items-center gap-10 w-full max-w-5xl bg-[#121826] p-8 rounded-xl shadow-xl">
          {/* Avatar và Tên */}
          <div className="flex flex-col items-center md:ml-24">
            <img
              src={avatar}
              alt="Avatar"
              className="w-32 h-32 rounded-full mb-3 border-4 border-slate-600"
            />
            <h2 className="text-2xl font-bold mb-2 text-white">{admin.fullname}</h2>
            {/* <button
              onClick={() => navigate('/admin/editprofile')}
              className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition font-semibold"
            >
              Edit Profile
            </button>
            <button
              onClick={() => navigate('/admin/changepassword')}
              className="bg-red-600 mt-4 px-4 py-2 rounded hover:bg-red-700 transition font-semibold"
            >
              Change Password
            </button> */}
          </div>

          {/* Thông tin người dùng */}
          <div className="text-left text-base space-y-2">
            <h1 className="text-3xl font-bold mb-4 text-red-600 border-b border-slate-600 pb-2">
              Account Information
            </h1>
            <p><span className="font-semibold text-slate-300">Name:</span> {admin.fullname}</p>
            <p><span className="font-semibold text-slate-300">Account:</span> {admin.username}</p>
            <p><span className="font-semibold text-slate-300">Email:</span> {admin.email}</p>
            <p><span className="font-semibold text-slate-300">DOB:</span> {formattedDOB}</p>
            <p><span className="font-semibold text-slate-300">Phone number:</span> {admin.phone || 'Not provided'}</p>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default AdminProfile;
