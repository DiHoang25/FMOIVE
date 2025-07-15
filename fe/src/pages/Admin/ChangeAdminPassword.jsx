import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../../components/Sidebar-Admin';

const ChangeAdminPassword = () => {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.currentPassword) newErrors.currentPassword = 'Please enter your current password.';
    if (!formData.newPassword) newErrors.newPassword = 'Please enter your new password.';
    else if (formData.newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters.';
    if (!formData.confirmNewPassword) newErrors.confirmNewPassword = 'Please confirm your new password.';
    else if (formData.newPassword !== formData.confirmNewPassword)
      newErrors.confirmNewPassword = 'Passwords do not match.';
    return newErrors;
  };

  const handlePasswordChangeSubmit = async () => {
    const foundErrors = validate();
    if (Object.keys(foundErrors).length > 0) {
      setErrors(foundErrors);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setServerError(data.message || 'Failed to change password.');
        return;
      }

      setSuccess(true);
      setFormData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      setServerError('Something went wrong. Please try again.');
    }
  };

  const handleSuccessConfirm = () => {
    setSuccess(false);
    navigate('/viewaccount');
  };

  return (
    <SidebarLayout>
      <div className=" text-white p-8 rounded-md">
        <h1 className="text-3xl font-bold mb-8 text-center text-red-600">Change Password</h1>

        <div className="bg-slate-800 p-6 rounded-lg shadow-md max-w-lg mx-auto">
          <div className="flex flex-col gap-4">
            <div>
              <input
                type="password"
                name="currentPassword"
                placeholder="Current Password"
                value={formData.currentPassword}
                onChange={handleChange}
                className="bg-white text-black px-4 py-2 rounded w-full border border-gray-300"
              />
              {errors.currentPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
              )}
            </div>
            <div>
              <input
                type="password"
                name="newPassword"
                placeholder="New Password"
                value={formData.newPassword}
                onChange={handleChange}
                className="bg-white text-black px-4 py-2 rounded w-full border border-gray-300"
              />
              {errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
              )}
            </div>
            <div>
              <input
                type="password"
                name="confirmNewPassword"
                placeholder="Re-enter New Password"
                value={formData.confirmNewPassword}
                onChange={handleChange}
                className="bg-white text-black px-4 py-2 rounded w-full border border-gray-300"
              />
              {errors.confirmNewPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmNewPassword}</p>
              )}
            </div>
            {serverError && <p className="text-red-400 text-sm text-center">{serverError}</p>}
          </div>
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => navigate('/admin/admin-profile')}
              className="px-5 py-2 border border-red-500 text-red-500 rounded hover:bg-red-100"
            >
              Cancel
            </button>
            <button
              onClick={handlePasswordChangeSubmit}
              className="px-5 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {success && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Password Changed!</h3>
              <p className="text-gray-300 mb-6">Your password has been updated successfully.</p>
              <button
                onClick={handleSuccessConfirm}
                className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
};

export default ChangeAdminPassword;
