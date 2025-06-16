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

  
  const isValidGmail = (email) => {
    
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return gmailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    // Kiểm tra địa chỉ Gmail
    if (!isValidGmail(email)) {
      setError('Please enter a valid Gmail address (example@gmail.com)');
      return;
    }

    setIsSubmitting(true);

    try {
     
      await new Promise(resolve => setTimeout(resolve, 1000));

      
      navigate('/reset-password');
    } catch (err) {
      setError('An error occurred. Please try again later.');
      console.error('Error sending reset code:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    
    window.history.back();
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-1/2 flex flex-col justify-center px-12 py-8 bg-gray-900 text-white">
        <div className="max-w-md mx-auto w-full">
          <h1 className="text-4xl font-bold mb-8">Forgot Password</h1>
          
          <div className="bg-gray-700 p-6 rounded-lg shadow">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Input your Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md text-black"
                  placeholder="example@gmail.com"
                />
                <div className="text-xs text-gray-400 mt-1">
                  Please enter a valid Gmail address
                </div>
              </div>
              
              {error && (
                <div className="text-red-500 text-sm mt-1">{error}</div>
              )}
              
              {message && (
                <div className="text-green-500 text-sm mt-1">{message}</div>
              )}

              <div className="flex justify-between space-x-4 mt-6">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition duration-200 flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !email}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200 flex-1 disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Send Code'}
                </button>
              </div>
            </form>
          </div>
          
          <div className="mt-6 text-center">
            
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

export default ForgotPasswordPage;

