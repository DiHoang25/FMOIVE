    import React, { useState, useEffect } from 'react';
    import { useForm } from 'react-hook-form';
    import { useNavigate } from 'react-router-dom';
    import axios from 'axios';
    import SidebarLayout from '../../components/Sidebar-Admin'; // Assuming this path is correct
    import { Modal, message, Select } from 'antd'; // Import Ant Design components
    import { ExclamationCircleFilled } from '@ant-design/icons'; // Import for confirm icon

    const { Option } = Select;
    const { confirm } = Modal;

    // Define your backend base URL for admin actions
    const API_ADMIN_BASE_URL = 'http://localhost:5000/api/admin/employees'; 

    function AddEmployeePage() {
        const [isSubmitting, setIsSubmitting] = useState(false);
        const [serverError, setServerError] = useState('');
        const [token, setToken] = useState('');
        const navigate = useNavigate();

        // Use React Hook Form for validation and form state
        const {
            register,
            handleSubmit,
            formState: { errors },
            watch,
            reset,
            setValue // To set role value programmatically
        } = useForm({
            defaultValues: {
                gender: 'male',
                role: 'employee', // Default role for a new employee
                is_actived: true, // Default active status for new employee
                is_deleted: false // Default not deleted status for new employee
            }
        });

        const password = watch('password'); // Watch password field for confirmation

        useEffect(() => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                setToken(storedToken);
            } else {
                message.error('No authentication token found. Please log in as admin.');
                navigate('/login'); // Redirect to login if no token
            }
        }, [navigate]);

        const onSubmit = async (data) => {
            setIsSubmitting(true);
            setServerError('');

            try {
                // Confirm the action before sending to API
                confirm({
                    title: 'Confirm Add Employee',
                    icon: <ExclamationCircleFilled />,
                    content: `Do you want to add new employee "${data.fullName}" with role "${data.role}"?`,
                    okText: 'Yes',
                    cancelText: 'No',
                    okButtonProps: {
                        style: {
                            backgroundColor: '#dc2626',
                            color: 'white',
                            borderColor: '#dc2626',
                        },
                    },
                    onOk: async () => {
                        try {
                            const response = await axios.post(`${API_ADMIN_BASE_URL}/new_employee`, {
                                username: data.account,
                                password: data.password,
                                fullname: data.fullName,
                                email: data.email,
                                phone: data.phone,
                                gender: data.gender,
                                date_of_birth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString() : null,
                                address: data.address,
                                id_card: data.idCard,
                                role: data.role,
                                is_deleted: false,
                                is_actived: true
                            }, {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            });

                            message.success(response.data.message || 'Employee added successfully!');
                            console.log('Employee added successfully. Attempting to reset form...');
                            // Temporarily comment out reset() to debug blank page issue
                            // reset(); 
                            
                        } catch (error) {
                            console.error('Error adding employee:', error);
                            setServerError(error.response?.data?.message || 'Failed to add employee. Please try again.');
                            message.error(error.response?.data?.message || 'Failed to add employee.');
                        } finally {
                            setIsSubmitting(false);
                        }
                    },
                    onCancel() {
                        setIsSubmitting(false); // Stop submitting if canceled
                    }
                });
            } catch (error) {
                setIsSubmitting(false); // This catch handles errors from the confirm dialog itself.
            }
        };

        return (
            <SidebarLayout>
                <div className="flex flex-col min-h-screen text-white bg-gray-900 p-4">
                    <div className="p-4 flex items-center justify-between shadow-md mb-6">
                        <h2 className="text-2xl text-white-500 font-bold text-center w-full">Add New Employee</h2>
                    </div>

                    <div className="max-w-xl mx-auto w-full bg-gray-800 p-8 rounded-lg shadow-lg border border-zinc-700">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {/* Account (Username) */}
                            <div>
                                <label htmlFor="account" className="block text-sm font-medium text-gray-300 mb-1">Account (Username)</label>
                                <input
                                    id="account"
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-1 focus:ring-red-700"
                                    {...register('account', { required: 'Account is required', minLength: { value: 3, message: 'Account must be at least 3 characters' } })}
                                />
                                {errors.account && <p className="text-red-500 text-sm mt-1">{errors.account.message}</p>}
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-1 focus:ring-red-700"
                                    {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
                                />
                                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-1 focus:ring-red-700"
                                    {...register('confirmPassword', {
                                        required: 'Please confirm your password',
                                        validate: value => value === password || 'Passwords do not match'
                                    })}
                                />
                                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
                            </div>

                            {/* Full Name */}
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                                <input
                                    id="fullName"
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-1 focus:ring-red-700"
                                    {...register('fullName', { required: 'Full name is required' })}
                                />
                                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
                            </div>

                            {/* Date of Birth */}
                            <div>
                                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-300 mb-1">Date of Birth</label>
                                <input
                                    id="dateOfBirth"
                                    type="date"
                                    className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-1 focus:ring-red-700"
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
                                {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth.message}</p>}
                            </div>

                            {/* Gender */}
                            <div className="flex space-x-6">
                                <label className="inline-flex items-center text-gray-300">
                                    <input type="radio" value="male" className="form-radio text-red-600" {...register('gender')} />
                                    <span className="ml-2">Male</span>
                                </label>
                                <label className="inline-flex items-center text-gray-300">
                                    <input type="radio" value="female" className="form-radio text-red-600" {...register('gender')} />
                                    <span className="ml-2">Female</span>
                                </label>
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-1 focus:ring-red-700"
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                            message: 'Invalid email address'
                                        }
                                    })}
                                />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
                                <input
                                    id="phone"
                                    type="tel"
                                    className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-1 focus:ring-red-700"
                                    {...register('phone', {
                                        required: 'Phone number is required',
                                        pattern: {
                                            value: /^[0-9]{10,11}$/,
                                            message: 'Enter a valid phone number (10-11 digits)'
                                        }
                                    })}
                                />
                                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                            </div>

                            {/* Address */}
                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-1">Address</label>
                                <input
                                    id="address"
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-1 focus:ring-red-700"
                                    {...register('address', { required: 'Address is required' })}
                                />
                                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
                            </div>

                            {/* ID Card */}
                            <div>
                                <label htmlFor="idCard" className="block text-sm font-medium text-gray-300 mb-1">ID Card</label>
                                <input
                                    id="idCard"
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-1 focus:ring-red-700"
                                    {...register('idCard', { required: 'ID Card is required' })}
                                />
                                {errors.idCard && <p className="text-red-500 text-sm mt-1">{errors.idCard.message}</p>}
                            </div>

                            {/* Role Selection */}
                        

                            {serverError && <p className="text-red-500 text-sm mt-2 text-center">{serverError}</p>}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md disabled:opacity-50 mt-6 transition-colors duration-200"
                            >
                                {isSubmitting ? 'Adding Employee...' : 'Add Employee'}
                            </button>
                        </form>
                    </div>
                </div>
            </SidebarLayout>
        );
    }

    export default AddEmployeePage;
