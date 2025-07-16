import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import anhnenloginImage from '../../assets/anhnenlogin.jpg';

function ResetPasswordPage() {
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  
  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  useEffect(() => {
    if (!email) {
      console.log("No email found, redirecting to forgot-password");
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleChange = (index, e) => {
    const value = e.target.value;
    
    if (value && !/^[0-9]$/.test(value)) {
      return;
    }
    
    const newVerificationCode = [...verificationCode];
    newVerificationCode[index] = value;
    setVerificationCode(newVerificationCode);
    
    setError('');
    
    if (value && index < 4) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.slice(0, 5).split('');
      
      const newVerificationCode = [...verificationCode];
      digits.forEach((digit, index) => {
        if (index < 5) {
          newVerificationCode[index] = digit;
        }
      });
      
      setVerificationCode(newVerificationCode);
      
      
      const focusIndex = Math.min(digits.length, 4);
      inputRefs[focusIndex].current.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isComplete = verificationCode.every(digit => digit !== '');
    
    if (!isComplete) {
      setError('Please enter the complete 5-digit verification code');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      const resetCode = verificationCode.join('');

      console.log("Verifying code for email:", email);
      console.log("Code entered:", resetCode);

      const response = await fetch('http://localhost:5000/api/auth/verify-reset-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, resetCode }),
      });

      console.log("Verification API response status:", response.status);
      const data = await response.json();
      console.log("Verification API response data:", data);

      if (!response.ok) {
        throw new Error(data.message || 'Invalid verification code');
      }

      
      if (data.resetToken) {
        console.log("Received reset token from API");
        
        localStorage.removeItem('resetToken');
        
        localStorage.setItem('resetToken', data.resetToken);
        console.log("Reset token saved to localStorage");

      navigate('/new-password', { state: { email } });
      } else {
        throw new Error('No reset token received from server');
      }
    } catch (err) {
      console.error('Error verifying code:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const testCodeVerification = async () => {
    console.log("Testing verification with hardcoded values");
    try {
      const testResponse = await fetch('http://localhost:5000/api/auth/verify-reset-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          resetCode: verificationCode.join('')
        }),
      });

      const testData = await testResponse.json();
      console.log("Test verification response:", testData);

      if (testData.resetToken) {
        console.log("Token received in test:", testData.resetToken);
      }
    } catch (error) {
      console.error("Test error:", error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="w-full md:w-1/2 flex flex-col justify-center px-4 sm:px-8 md:px-12 py-6 sm:py-8 bg-gray-900 text-white">
        <div className="max-w-md mx-auto w-full">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 md:mb-8 text-center">Verify Code</h1>
          
          <div className="bg-gray-700 p-4 sm:p-6 rounded-lg shadow">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="text-center">
                <label className="block text-xs sm:text-sm font-medium mb-2 sm:mb-3">
                  Enter Verification Code
                </label>
                <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6 mx-auto max-w-xs">
                  A 5-digit code has been sent to {email}
                </p>
                
                <div className="flex justify-center space-x-2 sm:space-x-4 mb-3 sm:mb-4" onPaste={handlePaste}>
                  {verificationCode.map((digit, index) => (
                    <input
                      key={index}
                      ref={inputRefs[index]}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleChange(index, e)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-8 h-10 sm:w-12 sm:h-12 text-center text-lg sm:text-xl font-bold border rounded-md bg-gray-100 text-black focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
              </div>
              
              {error && (
                <div className="text-red-500 text-xs sm:text-sm mt-2 text-center">{error}</div>
              )}
              
              <div className="flex justify-center mt-4 sm:mt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 sm:px-6 py-1.5 sm:py-2 bg-red-600 text-white rounded text-sm sm:text-base hover:bg-red-700 transition duration-200 disabled:opacity-50"
                >
                  {isSubmitting ? 'Verifying...' : 'Verify Code'}
                </button>
              </div>

              <div className="mt-2 text-center">
                <button
                  type="button"
                  onClick={testCodeVerification}
                  className="text-xs text-gray-400 hover:text-gray-300"
                >
                
                </button>
        </div>
            </form>
      </div>
      
          <div className="mt-4 sm:mt-6 text-center">
          
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

export default ResetPasswordPage;