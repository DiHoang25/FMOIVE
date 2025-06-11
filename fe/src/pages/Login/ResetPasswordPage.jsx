import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import anhnenloginImage from '../../assets/anhnenlogin.jpg';

function ResetPasswordPage() {
  const [verificationCode, setVerificationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setVerificationCode(e.target.value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!verificationCode) {
      setError('Please enter verification code');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call to verify code
      // In a real application, this would validate the code with backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to new password page
      navigate('/new-password');
    } catch (err) {
      setError('An error occurred. Please try again later.');
      console.error('Error verifying code:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-1/2 flex flex-col justify-center px-12 py-8 bg-gray-900 text-white">
        <div className="max-w-md mx-auto w-full">
          <h1 className="text-4xl font-bold mb-8">Forgot Password</h1>
          
          <div className="bg-gray-700 p-6 rounded-lg shadow">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="verificationCode" className="block text-sm font-medium mb-1">
                  Enter Verification code
                </label>
                <input
                  id="verificationCode"
                  type="text"
                  value={verificationCode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md text-black"
                  placeholder="Enter code sent to your email"
                />
              </div>
              
              {error && (
                <div className="text-red-500 text-sm mt-1">{error}</div>
              )}
              
              <div className="flex justify-center mt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200 disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
          
          <div className="mt-6 text-center">
            <Link to="/login" className="text-red-500 hover:text-red-400">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
      
      <div className="w-1/2 bg-gray-900">
        <img
          src={anhnenloginImage}
          alt="Cinema"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}

export default ResetPasswordPage;