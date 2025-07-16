import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import anhnenloginImage from '../../assets/anhnenlogin.jpg';

function NewPasswordPage() {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [passwordResetComplete, setPasswordResetComplete] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const resetToken = localStorage.getItem('resetToken');

  useEffect(() => {
    if (!resetToken && !passwordResetComplete && !showSuccessModal) {
      navigate('/forgot-password');
    }
  }, [resetToken, navigate, passwordResetComplete, showSuccessModal]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.newPassword) {
      setError('Please enter a new password');
      return;
    }

    if (formData.newPassword.length < 5) {
      setError('Password must be at least 5 characters long');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resetToken}`
        },
        body: JSON.stringify({
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      setPasswordResetComplete(true);

      localStorage.removeItem('resetToken');

      setShowSuccessModal(true);

    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

   const handleSuccessConfirm = () => {
    navigate('/login');
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="w-full md:w-1/2 flex flex-col justify-center px-4 sm:px-8 md:px-12 py-6 sm:py-8 bg-gray-900 text-white">
        <div className="max-w-md mx-auto w-full">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 md:mb-8">Reset Password</h1>

          <div className="bg-gray-700 p-4 sm:p-6 rounded-lg shadow">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-xs sm:text-sm font-medium mb-1">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 sm:py-2 border rounded-md text-black text-sm"
                  autoComplete="new-password"
                />
                <div className="text-xs text-gray-400 mt-1">
                  Password must be at least 5 characters
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 sm:py-2 border rounded-md text-black text-sm"
                  autoComplete="new-password"
                />
              </div>

              {error && (
                <div className="text-red-500 text-xs sm:text-sm mt-1">{error}</div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-1.5 sm:py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md disabled:opacity-50 text-sm sm:text-base"
              >
                {isSubmitting ? 'Processing...' : 'Reset Password'}
              </button>
            </form>
          </div>

          <div className="mt-4 sm:mt-6 text-center">
            <Link to="/login" className="text-red-500 hover:text-red-400 text-xs sm:text-sm">
              Back to Login
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden md:block md:w-1/2 bg-gray-900">
        <img
          src={anhnenloginImage}
          alt="Cinema"
          className="h-full w-full object-cover"
        />
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 px-4">
          <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg max-w-sm sm:max-w-md w-full">
            <div className="text-center">
              <div className="mb-3 sm:mb-4 flex justify-center">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Password Reset Successful!</h3>
              <p className="text-gray-300 mb-4 sm:mb-6 text-sm">Your password has been successfully reset. You can now login with your new password.</p>
              <button
                onClick={handleSuccessConfirm}
                className="px-4 sm:px-6 py-1.5 sm:py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200 text-sm sm:text-base"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NewPasswordPage;
