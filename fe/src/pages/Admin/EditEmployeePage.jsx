import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom'; // Import useParams
import axios from 'axios';
import SidebarLayout from '../../components/Sidebar-Admin';
import { Modal, message, Select, Spin } from 'antd'; // Import Spin for loading indicator
import { ExclamationCircleFilled } from '@ant-design/icons';

const { Option } = Select;
const { confirm } = Modal;

// Define your backend base URL for admin actions on employees
const API_ADMIN_BASE_URL = 'http://localhost:5000/api/admin/employees';

function EditEmployeePage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true); // New state for initial data loading
    const [serverError, setServerError] = useState('');
    const [token, setToken] = useState('');
    const navigate = useNavigate();
    const { employeeId } = useParams(); // Get employeeId from URL parameters

    // Use React Hook Form for validation and form state
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        reset, // To populate form with fetched data
        setValue // To programmatically set values, especially for Select
    } = useForm({
        defaultValues: {
            // These will be overridden by fetched data
            gender: 'male',
            role: 'employee',
            is_actived: true,
            is_deleted: false
        }
    });

    const password = watch('password'); // Watch password field for confirmation

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
        } else {
            message.error('No authentication token found. Please log in as admin.');
            setIsLoadingData(false); // Stop loading if no token
            navigate('/login'); // Redirect to login if no token
        }
    }, [navigate]);

    useEffect(() => {
        const fetchEmployeeData = async () => {
            if (!token || !employeeId) return; // Don't fetch if no token or ID

            setIsLoadingData(true);
            try {
                const response = await axios.get(`${API_ADMIN_BASE_URL}/${employeeId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const employeeData = response.data; // Assuming the API returns the employee object directly

                // Reset form with fetched data
                // Map API response fields to form field names
                reset({
                    account: employeeData.username,
                    // Passwords are not usually fetched for security reasons, leave blank for edit
                    password: '',
                    confirmPassword: '',
                    fullName: employeeData.fullname,
                    dateOfBirth: employeeData.date_of_birth ? new Date(employeeData.date_of_birth).toISOString().split('T')[0] : '', // Format for input type="date"
                    gender: employeeData.gender,
                    email: employeeData.email,
                    phone: employeeData.phone,
                    address: employeeData.address,
                    idCard: employeeData.id_card,
                    role: employeeData.role,
                    is_actived: employeeData.is_actived,
                    is_deleted: employeeData.is_deleted
                });

                // Manually set Ant Design Select values if needed
                setValue('role', employeeData.role);


            } catch (error) {
                console.error('Error fetching employee data:', error);
                message.error(error.response?.data?.message || 'Failed to fetch employee data. Please try again.');
                navigate('/admin/employees'); // Redirect back if data fetch fails
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchEmployeeData();
    }, [token, employeeId, reset, navigate, setValue]); // Add setValue to dependency array

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setServerError('');

        // Prepare payload for update
        const payload = {
            username: data.account,
            fullname: data.fullName,
            email: data.email,
            phone: data.phone,
            gender: data.gender,
            date_of_birth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString() : null,
            address: data.address,
            id_card: data.idCard,
            role: data.role,
            is_deleted: data.is_deleted, // Keep existing values or allow modification
            is_actived: data.is_actived // Keep existing values or allow modification
        };

        // Only include password if it was entered
        if (data.password) {
            payload.password = data.password;
        }

        try {
            // Confirm the action before sending to API
            confirm({
                title: 'Confirm Update Employee',
                icon: <ExclamationCircleFilled />,
                content: `Do you want to update employee "${data.fullName}"?`,
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
                        const response = await axios.patch(`${API_ADMIN_BASE_URL}/${employeeId}`, payload, { // Use PATCH for update
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        });

                        message.success(response.data.message || 'Employee updated successfully!');
                        navigate('/admin/employees'); // Navigate back to employee list
                    } catch (error) {
                        console.error('Error updating employee:', error);
                        setServerError(error.response?.data?.message || 'Failed to update employee. Please try again.');
                        message.error(error.response?.data?.message || 'Failed to update employee.');
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

    if (isLoadingData) {
        return (
            <SidebarLayout>
                <div className="flex flex-col min-h-screen text-white bg-gray-900 p-4 items-center justify-center">
                    <Spin size="large" />
                    <p className="mt-4 text-gray-400">Loading employee details...</p>
                </div>
            </SidebarLayout>
        );
    }

    return (
        <SidebarLayout>
            <style>
                {`
                /* Custom styles for Ant Design Select dropdown for consistency */
                .ant-select-selector .ant-select-selection-item {
                    color: white !important;
                }
                .ant-select-selector .ant-select-selection-placeholder {
                    color: rgba(255, 255, 255, 0.6) !important;
                }
                .ant-select-dropdown.ant-select-dropdown-dark-theme-override .ant-select-item-option {
                    color: white;
                    background-color: #1f2937;
                }
                .ant-select-dropdown.ant-select-dropdown-dark-theme-override .ant-select-item-option-active {
                    background-color: #374151;
                }
                .ant-select-dropdown.ant-select-dropdown-dark-theme-override .ant-select-item-option-selected {
                    background-color: #dc2626;
                    color: white;
                }
                `}
            </style>
            <div className="flex flex-col min-h-screen text-white bg-gray-900 p-4">
                <div className="p-4 flex items-center justify-between shadow-md mb-6">
                    <h2 className="text-2xl text-white-500 font-bold text-center w-full">Edit Employee</h2> {/* Changed title */}
                </div>

                <div className="max-w-xl mx-auto w-full bg-gray-800 p-8 rounded-lg shadow-lg border border-zinc-700">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Account (Username) - Often read-only for edit */}
                        <div>
                            <label htmlFor="account" className="block text-sm font-medium text-gray-300 mb-1">Account (Username)</label>
                            <input
                                id="account"
                                type="text"
                                className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-1 focus:ring-red-700 cursor-not-allowed"
                                {...register('account', { required: 'Account is required', minLength: { value: 3, message: 'Account must be at least 3 characters' } })}
                                readOnly // Make username read-only for edits
                            />
                            {errors.account && <p className="text-red-500 text-sm mt-1">{errors.account.message}</p>}
                        </div>

                        {/* Password (Optional for Edit) */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">New Password (leave blank to keep current)</label>
                            <input
                                id="password"
                                type="password"
                                className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-1 focus:ring-red-700"
                                {...register('password', { minLength: { value: 6, message: 'Password must be at least 6 characters' } })} // Make it optional
                            />
                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                        </div>

                        {/* Confirm Password (Conditional based on password entry) */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">Confirm New Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-1 focus:ring-red-700"
                                {...register('confirmPassword', {
                                    validate: value => (!password || value === password) || 'Passwords do not match' // Validate only if new password is typed
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
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                            <Select
                                id="role"
                                defaultValue="employee"
                                className="w-full ant-select-dark-theme-override" // Apply custom theme class
                                style={{ width: '100%', color: 'white', backgroundColor: '#1f2937', borderRadius: '0.375rem', borderColor: '#374151' }} // Tailwind rounded-md, bg-gray-900, border-gray-700
                                onChange={(value) => setValue('role', value)}
                                value={watch('role')} // Ensure Ant Design Select reflects React Hook Form state
                                dropdownClassName="ant-select-dropdown-dark-theme-override"
                                bordered={false}
                            >
                                <Option value="employee">Employee</Option>
                                <Option value="admin">Admin</Option>
                            </Select>
                            {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>}
                        </div>


                        {serverError && <p className="text-red-500 text-sm mt-2 text-center">{serverError}</p>}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md disabled:opacity-50 mt-6 transition-colors duration-200"
                        >
                            {isSubmitting ? 'Updating Employee...' : 'Update Employee'} {/* Changed button text */}
                        </button>
                    </form>
                </div>
            </div>
        </SidebarLayout>
    );
}

export default EditEmployeePage;
