import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // Import motion for animations
import SidebarLayout from '../../components/Sidebar-Admin';
import {
  Result, // For error display, if needed, similar to AdminProfile
  Spin,   // For loading state, if needed, similar to AdminProfile
} from 'antd'; // Import Ant Design components as needed

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

  // Handles changes to input fields and clears associated errors
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' })); // Clear specific field error
    setServerError(''); // Clear general server error
  };

  // Validates the form fields before submission
  const validate = () => {
    const newErrors = {};
    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Please enter your current password.';
    }
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'Please enter your new password.';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'New password must be at least 6 characters.';
    }
    if (!formData.confirmNewPassword.trim()) {
      newErrors.confirmNewPassword = 'Please confirm your new password.';
    } else if (formData.newPassword !== formData.confirmNewPassword) {
      newErrors.confirmNewPassword = 'New passwords do not match.';
    }
    return newErrors;
  };

  // Handles the password change submission
  const handlePasswordChangeSubmit = async () => {
    const foundErrors = validate();
    if (Object.keys(foundErrors).length > 0) {
      setErrors(foundErrors); // Set validation errors
      return;
    }

    try {
      const token = localStorage.getItem('token');
      // Check if token exists before making the API call
      if (!token) {
        setServerError('Authentication token not found. Please log in again.');
        navigate('/login'); // Redirect to login
        return;
      }

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
        // Handle server-side errors (e.g., incorrect current password)
        setServerError(data.message || 'Failed to change password.');
        return;
      }

      setSuccess(true); // Show success modal
      // Clear form data on successful password change
      setFormData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      setServerError('Something went wrong. Please try again. (Network error)');
    }
  };

  // Handles confirmation from the success modal
  const handleSuccessConfirm = () => {
    setSuccess(false);
    navigate('/admin/admin-profile'); // Navigate back to profile page
  };

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-6 flex justify-center items-start">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto w-full"
        >
          <div className="text-center mb-8">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent rounded-20">
                Change Admin Password
              </h1>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
            <div
              className="w-full max-w-lg mx-auto px-4 bg-slate-800/70 backdrop-blur-lg border border-slate-600/40 shadow-2xl overflow-visible"
              style={{ borderRadius: '20px' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/8 via-transparent to-cyan-600/8 pointer-events-none" />
              <div className="relative p-5 lg:p-6">
                {serverError && (
                  <p className="text-red-400 text-center mb-4 text-sm md:text-base">{serverError}</p>
                )}

                <div className="space-y-6">
                  {/* Current Password Input */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    <label htmlFor="currentPassword" className="block mb-1 font-medium text-sm text-gray-300">Current Password</label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      placeholder="Enter your current password"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                    />
                    {errors.currentPassword && (
                      <p className="text-red-400 text-sm mt-1">{errors.currentPassword}</p>
                    )}
                  </motion.div>

                  {/* New Password Input */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <label htmlFor="newPassword" className="block mb-1 font-medium text-sm text-gray-300">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      placeholder="Enter your new password"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                    />
                    {errors.newPassword && (
                      <p className="text-red-400 text-sm mt-1">{errors.newPassword}</p>
                    )}
                  </motion.div>

                  {/* Confirm New Password Input */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <label htmlFor="confirmNewPassword" className="block mb-1 font-medium text-sm text-gray-300">Confirm New Password</label>
                    <input
                      type="password"
                      id="confirmNewPassword"
                      name="confirmNewPassword"
                      placeholder="Re-enter your new password"
                      value={formData.confirmNewPassword}
                      onChange={handleChange}
                      className="bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                    />
                    {errors.confirmNewPassword && (
                      <p className="text-red-400 text-sm mt-1">{errors.confirmNewPassword}</p>
                    )}
                  </motion.div>
                </div>

                {/* Buttons */}
                <motion.div
                  className="flex flex-col sm:flex-row justify-center sm:justify-end gap-3 mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <button
                    onClick={() => navigate('/admin/admin-profile')}
                    className="w-full sm:w-auto px-6 py-3 border border-red-500 text-red-400 rounded-xl hover:bg-red-900/20 transition duration-200 text-base font-semibold shadow-md hover:shadow-lg"
                    style={{ height: '48px' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePasswordChangeSubmit}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-none text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    style={{ height: '48px', borderRadius: '12px' }}
                  >
                    Change Password
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Success Modal */}
      {success && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 px-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-slate-800/90 backdrop-blur-lg border border-slate-600/40 p-6 rounded-xl shadow-lg max-w-md w-full"
          >
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <svg className="w-14 h-14 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Password Changed!</h3>
              <p className="text-gray-300 mb-6 text-sm">Your password has been updated successfully.</p>
              <button
                onClick={handleSuccessConfirm}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 text-sm font-semibold"
              >
                OK
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </SidebarLayout>
  );
};

export default ChangeAdminPassword;
