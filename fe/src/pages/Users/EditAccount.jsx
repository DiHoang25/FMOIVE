import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserDashboardLayout from '../../components/UserDashboardlayout';
import avatar from '../../assets/avatar.png';
import { Modal } from 'antd';

const EditAccount = () => {
    const navigate = useNavigate();
    const [success, setSuccess] = useState(false);


    const [formData, setFormData] = useState({
        name: 'Mr.T',
        account: 'mrt1288',
        email: 'mrt1288@gmail.com',
        dob: '2000-04-12',
        gender: 'Male',
        idNumber: 'Thu Duc Ward, Ho Chi Minh city',
        phoneNumber: '0123456789',
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState({});

    const actualOldPassword = 'password123'; // demo: password cũ 

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handlePasswordChangeSubmit = () => {
        // Nếu không có gì được nhập thì không xử lý
        if (
            !formData.oldPassword &&
            !formData.newPassword &&
            !formData.confirmPassword
        ) {
            setErrors((prev) => ({
                ...prev,
                oldPassword: 'Please enter your current password to change it.',
            }));
            return;
        }

        // Chạy validation
        const foundErrors = validate();

        if (
            foundErrors.oldPassword ||
            foundErrors.newPassword ||
            foundErrors.confirmPassword
        ) {
            setErrors(foundErrors);
        } else {
            console.log('Password changed successfully.');
            setSuccess(true);
        }
    };
    const validate = () => {
        const newErrors = {};


        if (!formData.name) newErrors.name = 'Name is required.';
        if (!formData.account) newErrors.account = 'Account is required.';
        if (!formData.email) newErrors.email = 'Email is required.';
        else if (!formData.email.endsWith('@gmail.com')) newErrors.email = 'Email must end with @gmail.com';
        if (!formData.idNumber) newErrors.idNumber = 'ID Number is required.';
        if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone Number is required.';

        if (formData.oldPassword || formData.newPassword || formData.confirmPassword) {
            if (!formData.oldPassword) newErrors.oldPassword = 'Please enter your current password.';
            else if (formData.oldPassword !== actualOldPassword) newErrors.oldPassword = 'Current password is incorrect.';
            if (!formData.newPassword) {
                newErrors.newPassword = 'New password is required.';
            } else if (formData.newPassword.length < 6) {
                newErrors.newPassword = 'Password must be at least 6 characters.';
            }
            if (formData.newPassword !== formData.confirmPassword)
                newErrors.confirmPassword = 'Passwords do not match.';
        }

        return newErrors;
    };

    const handleSave = () => {
        const foundErrors = validate();
        if (Object.keys(foundErrors).length > 0) {
            setErrors(foundErrors);
        } else {
            console.log('Saved data:', formData);
            setSuccess(true); // Hiển thị popup
        }
    };

    return (
        <UserDashboardLayout>
            <div className="bg-[#0a0f1c] min-h-[100vh] text-white p-8 rounded-md">
                <h1 className="text-3xl font-bold mb-8 text-center text-red-600">Edit Account Information</h1>


                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Avatar */}
                    <div className="bg-[#121826] p-4 rounded-lg shadow-md flex flex-col items-center">
                        <h2 className="font-bold text-2xl mb-4 mt-10 text-red-600">Change Avatar</h2>
                        <img src={avatar} alt="avatar" className="w-28 h-28 rounded-full border-4 mb-4" />
                        <input type="file" accept="image/png, image/jpeg, image/gif" className="mb-4" />
                        <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-semibold">Save</button>
                    </div>

                    {/* Form Thông tin */}
                    <div className="md:col-span-2 bg-[#121826] p-6 rounded-lg shadow-md">
                        <h2 className="font-bold text-lg mb-4">Information Account</h2>
                        <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <input name="name" placeholder="Name" value={formData.name} onChange={handleChange}
                                        className="bg-white text-black px-4 py-2 rounded w-full border border-gray-300" />
                                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                </div>
                                <div>
                                    <input name="account" placeholder="Account" value={formData.account} onChange={handleChange}
                                        className="bg-white text-black px-4 py-2 rounded w-full border border-gray-300" />
                                    {errors.account && <p className="text-red-500 text-sm mt-1">{errors.account}</p>}
                                </div>
                            </div>

                            <div>
                                <input name="email" placeholder="Email" value={formData.email} onChange={handleChange}
                                    className="bg-white text-black px-4 py-2 rounded w-full border border-gray-300" />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <input name="phoneNumber" placeholder="Contact Number" value={formData.phoneNumber} onChange={handleChange}
                                        className="bg-white text-black px-4 py-2 rounded w-full border border-gray-300" />
                                    {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                                </div>
                                <div>
                                    <input name="idNumber" placeholder="Address" value={formData.idNumber} onChange={handleChange}
                                        className="bg-white text-black px-4 py-2 rounded w-full border border-gray-300" />
                                    {errors.idNumber && <p className="text-red-500 text-sm mt-1">{errors.idNumber}</p>}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <input name="dob" type="date" value={formData.dob} onChange={handleChange}
                                    className="bg-white text-black px-4 py-2 rounded w-full border border-gray-300" />
                                <select name="gender" value={formData.gender} onChange={handleChange}
                                    className="bg-white text-black px-4 py-2 rounded w-full border border-gray-300">
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>

                            <div className="flex justify-center items-center gap-4 mt-6">
                                <button onClick={() => navigate('/viewaccount')} className="px-5 py-2 border border-red-500 text-red-500 rounded hover:bg-red-100" > Cancel </button>
                                <button onClick={handleSave} className="px-5 py-2 bg-red-500 text-white rounded hover:bg-red-600" > Save </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Password Section */}
                <div className="mt-10 bg-[#121826] p-6 rounded-lg shadow-md max-w-lg mx-auto">
                    <h2 className="font-bold text-xl mb-4 text-red-500 text-center">Change Password</h2>
                    <div className="flex flex-col gap-4">
                        <div>
                            <input type="password" name="oldPassword" placeholder="Current Password" value={formData.oldPassword} onChange={handleChange} className="bg-white text-black px-4 py-2 rounded w-full border border-gray-300" />
                            {errors.oldPassword && (<p className="text-red-500 text-sm mt-1">{errors.oldPassword}</p>)}
                        </div>
                        <div>
                            <input type="password" name="newPassword" placeholder="New Password" value={formData.newPassword} onChange={handleChange} className="bg-white text-black px-4 py-2 rounded w-full border border-gray-300" />
                            {errors.newPassword && (<p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>)}
                        </div>
                        <div>
                            <input type="password" name="confirmPassword" placeholder="Re-enter Password" value={formData.confirmPassword} onChange={handleChange} className="bg-white text-black px-4 py-2 rounded w-full border border-gray-300" />
                            {errors.confirmPassword && (<p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>)}
                        </div>
                    </div>
                    <div className="flex justify-center items-center gap-4 mt-6">
                        <button onClick={() => navigate('/viewaccount')} className="px-5 py-2 border border-red-500 text-red-500 rounded hover:bg-red-100" > Cancel </button>
                        <button onClick={handlePasswordChangeSubmit} className="px-5 py-2 bg-red-500 text-white rounded hover:bg-red-600" > Save </button>
                    </div>
                </div>
            </div>
            {/* ✅ Modal Success nằm ở đây (phần JSX) */}
            <Modal
                open={success}
                onCancel={() => setSuccess(false)}
                footer={null}
                centered
                width={350}
            >
                <div className="text-center p-6">
                    <div className="text-green-500 text-5xl mb-4">✔️</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Success</h3>
                    <p className="text-sm text-gray-600">Your account has been updated successfully.</p>
                    <button
                        onClick={() => setSuccess(false)}
                        className="mt-4 bg-red-600 text-white px-4 py-2 rounded w-full"
                    >
                        Close
                    </button>
                </div>
            </Modal>

        </UserDashboardLayout>
    );
};

export default EditAccount;