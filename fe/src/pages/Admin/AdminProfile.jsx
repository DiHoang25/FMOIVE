import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Button, Card, Descriptions, Spin, Result } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import SidebarLayout from '../../components/Sidebar-Admin';
import avatar from '../../assets/avatar.png';

const AdminProfile = () => {
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
                const response = await fetch('http://localhost:5000/api/auth/profile', {
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

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    if (error) {
        return (
            <SidebarLayout>
                <Result
                    status="error"
                    title="Error"
                    subTitle={error}
                />
            </SidebarLayout>
        );
    }

    if (!user) {
        return (
            <SidebarLayout>
                <div className="flex justify-center items-center min-h-[70vh]">
                    <Spin size="large" />
                </div>
            </SidebarLayout>
        );
    }

    const formattedDOB = user.date_of_birth
        ? formatDate(user.date_of_birth)
        : 'Not provided';

    return (
        <SidebarLayout>
            <div className="p-4 md:p-6 flex justify-center items-center min-h-[80vh]">
                <Card
                    bordered={false}
                    style={{ width: '100%', maxWidth: '900px' }}
                    className="shadow-lg bg-slate-800 w-full"
                >
                    <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 items-center lg:items-start">
                        {/* Avatar and actions */}
                        <div className="flex flex-col items-center w-full sm:w-auto">
                            <Avatar
                                size={128}
                                src={avatar}
                                icon={<UserOutlined />}
                            />
                            <h2 className="text-xl font-semibold mt-4 text-white text-center">{user.fullname}</h2>
                            <div className="flex flex-col gap-3 mt-4 w-full sm:w-[200px]">
                                <Button
                                    onClick={() => navigate('/admin/admin-profile/edit-profile')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold w-full"
                                >
                                    Edit Profile
                                </Button>

                                <Button
                                    onClick={() => navigate('/admin/admin-profile/change-admin-password')}
                                    className="bg-red-600 hover:bg-red-700 text-white font-semibold w-full"
                                >
                                    Change Password
                                </Button>
                            </div>
                        </div>

                        {/* Information */}
                        <div className="w-full">
                            <Descriptions
                                title={
                                    <div className="text-center text-xl sm:text-2xl font-bold text-white">
                                        Account Information
                                    </div>
                                }
                                column={1}
                                bordered
                                size="middle"
                                className="custom-descriptions rounded-md overflow-hidden"
                            >
                                <Descriptions.Item label="Name">{user.fullname}</Descriptions.Item>
                                <Descriptions.Item label="Account">{user.username}</Descriptions.Item>
                                <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
                                <Descriptions.Item label="DOB">{formattedDOB}</Descriptions.Item>
                                <Descriptions.Item label="Phone Number">
                                    {user.phone || 'Not provided'}
                                </Descriptions.Item>
                            </Descriptions>
                        </div>
                    </div>
                </Card>
            </div>
        </SidebarLayout>
    );
};

export default AdminProfile;
