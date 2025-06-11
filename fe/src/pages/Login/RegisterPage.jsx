import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import anhnenloginImage from '../../assets/anhnenlogin.jpg';

function RegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    watch
  } = useForm({
    defaultValues: {
      gender: 'male',
      agreeToTerms: false
    }
  });

  // Lấy giá trị password hiện tại để kiểm tra match
  const password = watch('password');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    // Thông thường bạn sẽ gửi data lên API
    console.log('Form submitted:', data);
    
    // Giả lập API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    // Hiển thị modal thành công thay vì alert
    setShowSuccessModal(true);
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    navigate('/login');
  };

  const validateForm = (data) => {
    const errors = {};

    if (!data.account || data.account.length < 3) {
      errors.account = 'Tài khoản phải có ít nhất 3 ký tự';
    }

    if (!data.password || data.password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (data.password !== data.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (!data.fullName) {
      errors.fullName = 'Họ tên là bắt buộc';
    }

    if (!data.dateOfBirth) {
      errors.dateOfBirth = 'Ngày sinh là bắt buộc';
    }

    if (!data.agreeToTerms) {
      errors.agreeToTerms = 'Bạn phải đồng ý với điều khoản và điều kiện';
    }

    return errors;
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-1/2 flex flex-col justify-center px-12 py-8 bg-gray-900 text-white">
        <div className="max-w-md mx-auto w-full">
          <h1 className="text-4xl font-bold mb-4">Register account</h1>
          
          <div className="mb-8">
            Already a member? <Link to="/login" className="text-red-500 hover:underline">Login Now!</Link>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2 p-4 bg-gray-700 rounded-lg overflow-y-auto max-h-[60vh]">
              <div>
                <label htmlFor="account" className="block text-sm font-medium mb-1">
                  Account
                </label>
                <input
                  id="account"
                  type="text"
                  className="w-full px-3 py-2 border rounded-md text-black"
                  {...register('account', { required: 'Account is required', minLength: { value: 3, message: 'Account must be at least 3 characters' } })}
                />
                {errors.account && (
                  <p className="text-red-500 text-sm mt-1">{errors.account.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="w-full px-3 py-2 border rounded-md text-black"
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="w-full px-3 py-2 border rounded-md text-black"
                  {...register('confirmPassword', { 
                    required: 'Please confirm your password',
                    validate: value => value === password || 'Passwords do not match'
                  })}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="fullName" className="block text-sm font-medium mb-1">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  className="w-full px-3 py-2 border rounded-md text-black"
                  {...register('fullName', { required: 'Full name is required' })}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium mb-1">
                  Date of Birth
                </label>
                <input
                  id="dateOfBirth"
                  type="date"
                  className="w-full px-3 py-2 border rounded-md text-black"
                  {...register('dateOfBirth', { required: 'Date of birth is required' })}
                />
                {errors.dateOfBirth && (
                  <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth.message}</p>
                )}
              </div>

              <div className="flex space-x-6 mt-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="male"
                    className="form-radio"
                    {...register('gender')}
                  />
                  <span className="ml-2">Male</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="female"
                    className="form-radio"
                    {...register('gender')}
                  />
                  <span className="ml-2">Female</span>
                </label>
              </div>

              {/* Thêm các trường mới */}
              <div>
                <label htmlFor="identityCard" className="block text-sm font-medium mb-1">
                  Identity Card
                </label>
                <input
                  id="identityCard"
                  type="text"
                  className="w-full px-3 py-2 border rounded-md text-black"
                  {...register('identityCard', {
                    required: 'Identity card number is required',
                    pattern: {
                      value: /^[0-9]{9,12}$/,
                      message: 'Please enter a valid identity card number (9-12 digits)'
                    }
                  })}
                />
                {errors.identityCard && (
                  <p className="text-red-500 text-sm mt-1">{errors.identityCard.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full px-3 py-2 border rounded-md text-black"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: 'Please enter a valid email address'
                    }
                  })}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  className="w-full px-3 py-2 border rounded-md text-black"
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[0-9]{10,11}$/,
                      message: 'Please enter a valid phone number (10-11 digits)'
                    }
                  })}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium mb-1">
                  Address
                </label>
                <textarea
                  id="address"
                  className="w-full px-3 py-2 border rounded-md text-black resize-none"
                  rows="3"
                  {...register('address', { required: 'Address is required' })}
                ></textarea>
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="agreeToTerms"
                  type="checkbox"
                  className="form-checkbox h-4 w-4"
                  {...register('agreeToTerms', {
                    required: 'You must agree to terms and conditions'
                  })}
                />
              </div>
              <label htmlFor="agreeToTerms" className="ml-2 text-sm">
                I agree with{' '}
                <Link to="/terms" className="text-red-500 hover:underline">
                  Terms & Conditions
                </Link>
                . I hereby confirm that the information provided is accurate, complete, and up-to-date.
              </label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-red-500 text-sm">{errors.agreeToTerms.message}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </div>
      </div>

      <div className="w-1/2 bg-gray-900">
        <img
          src={anhnenloginImage}
          alt="Cinema"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Registration Successful!</h3>
              <p className="text-gray-300 mb-6">Your account has been successfully created. You can now login with your credentials.</p>
              <button
                onClick={handleSuccessConfirm}
                className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200"
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

export default RegisterPage;