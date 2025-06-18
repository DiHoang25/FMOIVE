import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserDashboardLayout from '../../components/UserDashboardlayout';
import { Modal } from 'antd';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});

  const actualOldPassword = 'password123'; // Demo password cũ

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.oldPassword) {
      newErrors.oldPassword = 'Please enter your current password.';
    } else if (formData.oldPassword !== actualOldPassword) {
      newErrors.oldPassword = 'Current password is incorrect.';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required.';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password.';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    return newErrors;
  };

  const handlePasswordChangeSubmit = () => {
    const foundErrors = validate();
    if (Object.keys(foundErrors).length > 0) {
      setErrors(foundErrors);
    } else {
      console.log('Password changed successfully.');
      setSuccess(true);
    }
  };

  return (
    <UserDashboardLayout>
      <div className="bg-[#0a0f1c] text-white p-8 rounded-md">
        <h1 className="text-3xl font-bold mb-8 text-center text-red-600">Change Password</h1>

        <div className="bg-[#121826] p-6 rounded-lg shadow-md max-w-lg mx-auto">
          <div className="flex flex-col gap-4">
            <div>
              <input
                type="password"
                name="oldPassword"
                placeholder="Current Password"
                value={formData.oldPassword}
                onChange={handleChange}
                className="bg-white text-black px-4 py-2 rounded w-full border border-gray-300"
              />
              {errors.oldPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.oldPassword}</p>
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
                name="confirmPassword"
                placeholder="Re-enter Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="bg-white text-black px-4 py-2 rounded w-full border border-gray-300"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => navigate('/viewaccount')}
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

      <Modal
        open={success}
        onCancel={() => setSuccess(false)}
        footer={null}
        centered
        width={350}
      >
        <div className="text-center p-6">
          <div className="text-green-500 text-5xl mb-4">✔️</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Success</h3>
          <p className="text-sm text-gray-600">Your password has been updated successfully.</p>
          <button
            onClick={() => setSuccess(false)}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded w-full"
          >
            Close
          </button>
        </div>
      </Modal>
    </UserDashboardLayout>
  );
};

export default ChangePassword;
