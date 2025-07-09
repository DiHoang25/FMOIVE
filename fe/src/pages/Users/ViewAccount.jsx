import React, { useState, useEffect } from 'react';
import UserDashboardLayout from '../../components/UserDashboardlayout';
import avatar from '../../assets/monk.png';
import { useNavigate } from 'react-router-dom';

const ViewAccount = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Not authenticated.');
                return;
            }


            try {
                const response = await fetch('http://localhost:5000/api/user/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();
                if (!response.ok) {
                    setError(data.message || 'Failed to fetch user data.');
                } else {
                    setUser(data.user);
                }
            } catch (err) {
                console.error('Error fetching user:', err);
                setError('Failed to fetch user data.');
            }
        };

        fetchUser();
    }, []);

    if (error) {
        return (
            <UserDashboardLayout>
                <div className="text-center text-red-500 mt-10">{error}</div>
            </UserDashboardLayout>
        );
    }

    if (!user) {
        return (
            <UserDashboardLayout>
                <div className="text-center text-white mt-10">Loading...</div>
            </UserDashboardLayout>
        );
    }

    // Format date_of_birth (dd/mm/yyyy)
    const formatDate = (isoString) => {
        const date = new Date(isoString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
        };
        
        const formattedDOB = user.date_of_birth
        ? formatDate(user.date_of_birth)
        : 'Not provided';

    return (
        <UserDashboardLayout>
            <div className="bg-[#0a0f1c] text-white py-10 px-6 rounded-md min-h-[80vh] flex items-center justify-center">
                <div className="flex flex-col md:flex-row items-center gap-10 w-full max-w-5xl bg-[#121826] p-8 rounded-xl shadow-lg">
                    {/* Avatar và Tên */}
                    <div className="justify-center flex flex-col items-center" style={{ marginLeft: '250px' }}>
                        <img src={avatar} alt="Avatar" className="w-32 h-32 rounded-full mb-3 border-4" />
                        <h2 className="text-2xl font-bold mb-2">{user.fullname}</h2>
                        <button
                            onClick={() => navigate('/editaccount')}
                            className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition font-semibold"
                        >
                            Edit Profile
                        </button>
                        <button
                            onClick={() => navigate('/changepassword')}
                            className="bg-red-600 mt-4 px-4 py-2 rounded hover:bg-red-700 transition font-semibold"
                        >
                            Change Password
                        </button>
                    </div>


                    {/* Thông tin người dùng */}
                    <div className="text-left text-base space-y-2">
                        <h1 className="text-3xl font-bold mb-4 text-red-600">Information Account</h1>
                        <p><span className="font-semibold text-white">Name:</span> {user.fullname}</p>
                        <p><span className="font-semibold text-white">Account:</span> {user.username}</p>
                        <p><span className="font-semibold text-white">Email:</span> {user.email}</p>
                        <p><span className="font-semibold text-white">DOB:</span> {formattedDOB}</p>
                        <p><span className="font-semibold text-white">Phone number:</span> {user.phone || 'Not provided'}</p>
                    </div>
                </div>
            </div>
        </UserDashboardLayout>
    );
};

export default ViewAccount;