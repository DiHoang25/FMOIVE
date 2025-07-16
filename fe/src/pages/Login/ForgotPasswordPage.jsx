import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import anhnenloginImage from '../../assets/anhnenlogin.jpg'; 

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setEmail(e.target.value);
    setMessage('');
    setError('');
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset code');
      }

      setMessage('Verification code sent! Please check your email.');
      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 1500);
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again later.');
      console.error('Error sending reset code:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    window.history.back();
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="w-full md:w-1/2 flex flex-col justify-center px-4 sm:px-8 md:px-12 py-6 sm:py-8 bg-gray-900 text-white">
        <div className="max-w-md mx-auto w-full">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 md:mb-8">Forgot Password</h1>
          
          <div className="bg-gray-700 p-4 sm:p-6 rounded-lg shadow">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs sm:text-sm font-medium mb-1">
                  Input your Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 sm:py-2 border rounded-md text-black text-sm"
                  placeholder="your@email.com"
                />
                <div className="text-xs text-gray-400 mt-1">
                  Please enter your registered email address
                </div>
              </div>
              
              {error && (
                <div className="text-red-500 text-xs sm:text-sm mt-1">{error}</div>
              )}
              
              {message && (
                <div className="text-green-500 text-xs sm:text-sm mt-1">{message}</div>
              )}

              <div className="flex justify-between space-x-4 mt-4 sm:mt-6">
                
                <button
                  type="submit"
                  disabled={isSubmitting || !email}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition duration-200 flex-1 disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Send Code'}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-4 sm:mt-6 text-center">
            <Link to="/login" className="text-red-400 hover:text-white text-xs sm:text-sm">Back to Login</Link>
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
    </div>
  );
}

export default ForgotPasswordPage;
