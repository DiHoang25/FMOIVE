import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError('User / password is invalid. Please try again!');
      return;
    }
    console.log('Login attempt:', formData);
  };

  const handleGoogleLogin = () => {
    // Implement Google login logic here
    console.log('Google login clicked');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-red-500"
            />
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-red-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          <div className="text-center">
            <Link to="/forgot-password" className="text-red-500 text-sm hover:text-red-400">Forgot Password?</Link>
          </div>
          <button
            type="submit"
            className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition duration-200"
          >
            Login
          </button>
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-gray-600"></div>
            
            <div className="flex-1 border-t border-gray-600"></div>
          </div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-gray-700 text-white py-2 rounded hover:bg-gray-600 transition duration-200 flex items-center justify-center space-x-2"
          >
            <span>Continue with Google</span>
          </button>
        </form>
        <div className="mt-4 text-center text-gray-400">
          <span>Not a member yet? </span>
          <Link to="/register" className="text-red-500 hover:text-red-400">Register Now!</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;