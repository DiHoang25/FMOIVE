import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import anhnenloginImage from '../../assets/anhnenlogin.jpg';

function ResetPasswordPage() {
  //  mảng với 5 ô nhập 
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // Tạo refs 
  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  // Xử lý khi nhập vào ô input
  const handleChange = (index, e) => {
    const value = e.target.value;
    
    // Chỉ cho phép nhập số
    if (value && !/^[0-9]$/.test(value)) {
      return;
    }
    
    // Cập nhật giá trị trong mảng
    const newVerificationCode = [...verificationCode];
    newVerificationCode[index] = value;
    setVerificationCode(newVerificationCode);
    
    // Xóa thông báo lỗi khi người dùng nhập
    setError('');
    
    // Tự động chuyển đến ô tiếp theo khi nhập xong
    if (value && index < 4) {
      inputRefs[index + 1].current.focus();
    }
  };

  // Xử lý khi nhấn phím trong ô input
  const handleKeyDown = (index, e) => {
    // Khi nhấn Backspace và ô hiện tại trống, focus vào ô trước đó
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  // Xử lý khi paste vào ô input
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    // Chỉ xử lý khi dữ liệu dán vào là số và có độ dài hợp lệ
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.slice(0, 5).split('');
      
      // Điền vào các ô tương ứng
      const newVerificationCode = [...verificationCode];
      digits.forEach((digit, index) => {
        if (index < 5) {
          newVerificationCode[index] = digit;
        }
      });
      
      setVerificationCode(newVerificationCode);
      
      // Focus vào ô cuối cùng được điền hoặc ô tiếp theo
      const focusIndex = Math.min(digits.length, 4);
      inputRefs[focusIndex].current.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra tất cả các ô đã được điền chưa
    const isComplete = verificationCode.every(digit => digit !== '');
    
    if (!isComplete) {
      setError('Please enter the complete 5-digit verification code');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Chuyển mảng thành chuỗi để gửi đi
      const codeString = verificationCode.join('');
      console.log('Verification code:', codeString);
      
      // Mô phỏng API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Chuyển hướng đến trang đặt mật khẩu mới
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
          <h1 className="text-4xl font-bold mb-8 text-center">Forgot Password</h1>
          
          <div className="bg-gray-700 p-6 rounded-lg shadow">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center">
                <label className="block text-sm font-medium mb-3">
                  Enter Verification code
                </label>
                <p className="text-sm text-gray-400 mb-6 mx-auto max-w-xs">
                  A 5-digit code has been sent to your email
                </p>
                
                <div className="flex justify-center space-x-4 mb-4" onPaste={handlePaste}>
                  {verificationCode.map((digit, index) => (
                    <input
                      key={index}
                      ref={inputRefs[index]}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleChange(index, e)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-12 text-center text-xl font-bold border rounded-md bg-gray-100 text-black focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
              </div>
              
              {error && (
                <div className="text-red-500 text-sm mt-2 text-center">{error}</div>
              )}
              
              <div className="flex justify-center mt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200 disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Verify Code'}
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