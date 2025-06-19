import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import anhnenloginImage from '../../assets/anhnenlogin.jpg';

function RegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm({
    defaultValues: {
      gender: 'male',
      agreeToTerms: false
    }
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setServerError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: data.account,
          password: data.password,
          fullname: data.fullName,
          email: data.email,
          phone: data.phone,
          gender: data.gender,
          date_of_birth: data.dateOfBirth,
          // address: '',
          // id_card: '',
          role: 'customer',
          is_deleted: false,
          is_actived: true
        })
      });

      const result = await response.json();

      if (response.ok) {
        setShowSuccessModal(true);
        reset();
      } else {
        setServerError(result.message || 'Registration failed.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setServerError('Server error. Please try again.');
    }

    setIsSubmitting(false);
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-1/2 flex flex-col justify-center px-12 py-8 bg-gray-900 text-white">
        <div className="max-w-md mx-auto w-full">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold mb-4">Register account</h1>
            <div>
              Already a member? <Link to="/login" className="text-red-500 hover:underline">Login Now!</Link>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label htmlFor="account">Account</label>
                <input
                  id="account"
                  type="text"
                  className="w-full px-3 py-2 border rounded-md text-black"
                  {...register('account', { required: 'Account is required', minLength: { value: 3, message: 'Account must be at least 3 characters' } })}
                />
                {errors.account && <p className="text-red-500 text-sm">{errors.account.message}</p>}
              </div>

              <div>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className="w-full px-3 py-2 border rounded-md text-black"
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
                />
                {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="w-full px-3 py-2 border rounded-md text-black"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: value => value === password || 'Passwords do not match'
                  })}
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
              </div>

              <div>
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  className="w-full px-3 py-2 border rounded-md text-black"
                  {...register('fullName', { required: 'Full name is required' })}
                />
                {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="dateOfBirth"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Date of Birth
                </label>
                <input
                  id="dateOfBirth"
                  type="date"
                  className={`w-full px-3 py-2 border ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                    } rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  {...register('dateOfBirth', {
                    required: 'Date of birth is required',
                    validate: value => {
                      const selectedDate = new Date(value);
                      const today = new Date();
                      if (selectedDate > today) {
                        return 'Date of birth cannot be in the future';
                      }
                      return true;
                    }
                  })}
                />
                {errors.dateOfBirth && (
                  <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth.message}</p>
                )}
              </div>


              <div className="flex space-x-6">
                <label className="inline-flex items-center">
                  <input type="radio" value="male" className="form-radio" {...register('gender')} />
                  <span className="ml-2">Male</span>
                </label>
                <label className="inline-flex items-center">
                  <input type="radio" value="female" className="form-radio" {...register('gender')} />
                  <span className="ml-2">Female</span>
                </label>
              </div>

              <div>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  className="w-full px-3 py-2 border rounded-md text-black"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: 'Invalid email address'
                    }
                  })}
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
              </div>

              <div>
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  className="w-full px-3 py-2 border rounded-md text-black"
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[0-9]{10,11}$/,
                      message: 'Enter a valid phone number'
                    }
                  })}
                />
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
              </div>

              <div className="flex items-start mt-4">
                <input
                  id="agreeToTerms"
                  type="checkbox"
                  className="form-checkbox h-4 w-4 mt-1"
                  {...register('agreeToTerms', {
                    required: 'You must agree to terms and conditions'
                  })}
                />
                <label htmlFor="agreeToTerms" className="ml-2 text-sm">
                  I agree with <Link to="/terms" className="text-red-500 hover:underline">Terms & Conditions</Link>
                </label>
              </div>
              {errors.agreeToTerms && <p className="text-red-500 text-sm">{errors.agreeToTerms.message}</p>}
              {serverError && <p className="text-red-500 text-sm mt-2">{serverError}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md disabled:opacity-50 mt-4"
              >
                {isSubmitting ? 'Submitting...' : 'Register'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="w-1/2 bg-gray-900">
        <img src={anhnenloginImage} alt="Cinema" className="h-full w-full object-cover" />
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Registration Successful!</h3>
              <p className="text-gray-300 mb-6">Your account has been successfully created. You can now login with your credentials.</p>
              <button onClick={handleSuccessConfirm} className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200">
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
