// src/components/GoogleLoginButton.jsx
import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import { message } from 'antd'; // Nếu bạn muốn dùng message của antd
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Để giải mã token nếu cần

const BACKEND_URL = 'http://localhost:5000'; // URL của backend của bạn

const GoogleLoginButton = () => {
  const { login } = useAuth(); // Lấy hàm login từ AuthContext
  const navigate = useNavigate(); // Nếu bạn muốn navigate sau login

  const handleSuccess = async (credentialResponse) => {
    console.log('Google login success:', credentialResponse);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/google`, {
        idToken: credentialResponse.credential,
      });
      console.log('Backend response:', response.data);

      if (response.data.token) {
        login(response.data.token); // Gọi hàm login từ AuthContext
        const decoded = jwtDecode(response.data.token); // Giải mã token của backend nếu cần
        message.success(`Đăng nhập Google thành công! Chào mừng ${decoded.user.fullname}`, 3);
        // Có thể chuyển hướng dựa trên role hoặc về trang chủ/dashboard
        const role = decoded.user.role; // Giả sử role nằm trong token của backend

        if (role === 'admin') {
            navigate('/admin');
        } else if (role === 'employee') {
            navigate('/employee');
        } else {
            navigate('/');
        }
      } else {
        message.error('Backend did not return a valid token.');
      }
    } catch (error) {
      console.error('Error sending ID token to backend:', error.response?.data || error.message);
      message.error(error.response?.data?.message || 'Google login failed. Please try again.');
    }
  };

  const handleError = () => {
    console.log('Google login failed');
    message.error('Google login failed. Please try again.');
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={handleError}
      useOneTap // Tùy chọn, để hiển thị "One Tap" nếu người dùng đã đăng nhập Google
      // Các thuộc tính khác như theme, size, text có thể thêm vào nếu bạn không dùng useOneTap
      // Nếu không dùng useOneTap, bạn có thể custom button bằng cách render content bên trong GoogleLogin
    />
  );
};

export default GoogleLoginButton;