import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; 
import { useDispatch } from 'react-redux';
import { useAuth } from '../../contexts/AuthContext';
import { message } from 'antd';

import GoogleLoginButton from '../../components/GoogleLoginButton';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); 
  const location = useLocation();
  const from = location.state?.from || '/';
  const dispatch = useDispatch(); 

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({ username: '', password: '', general: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = { username: '', password: '', general: '' };
    let isValid = true;

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors(prev => ({ ...prev, general: data.message || 'Login failed' }));
        return;
      }

      
      login(data.token); 

     
      const decoded = jwtDecode(data.token);
      const userInformation = decoded.user; 
      
      

      console.log("DEBUG: Login successful. AuthContext's useEffect will handle Redux dispatch.");

      const role = userInformation.role;

      message.success(`Đăng nhập thành công! Chào mừng ${userInformation.username}`, 3);

      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'employee') {
        navigate('/employee');
      } else {
        navigate(from); 
      }

    } catch (error) {
      console.error('Login error:', error);
      setErrors(prev => ({ ...prev, general: 'Something went wrong. Please try again later.' }));
    }
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
              className={`w-full px-4 py-2 rounded bg-gray-700 text-white border ${errors.username ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:border-red-500`}
            />
            {errors.username && <div className="text-red-500 text-sm mt-1">{errors.username}</div>}
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className={`w-full px-4 py-2 rounded bg-gray-700 text-white border ${errors.password ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:border-red-500`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
            {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
          </div>
          {errors.general && <div className="text-red-500 text-sm">{errors.general}</div>}

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
            <span className="mx-4 text-gray-400">OR</span>
            <div className="flex-1 border-t border-gray-600"></div>
          </div>

          <div className="flex justify-center">
            <GoogleLoginButton />
          </div>

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