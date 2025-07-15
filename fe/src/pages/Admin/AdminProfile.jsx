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
            <div className="p-6 flex justify-center items-center min-h-[80vh]">
                <Card
                    bordered={false}
                    style={{ width: '100%', maxWidth: '800px' }}
                    className="shadow-lg bg-slate-800"
                >
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="flex flex-col items-center">
                            <Avatar
                                size={128}
                                src={avatar}
                                icon={<UserOutlined />}
                            />
                            <h2 className="text-xl font-semibold mt-4 text-white">{user.fullname}</h2>
                            <div className="flex flex-col gap-2 mt-4 w-full">
                                <Button
                                    onClick={() => navigate('/admin/admin-profile/edit-profile')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                                >
                                    Edit Profile
                                </Button>

                                <Button
                                    onClick={() => navigate('/admin/admin-profile/change-admin-password')}
                                    className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                                >
                                    Change Password
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1">
                            <h1 className="text-2xl font-bold mb-6 text-red-600 text-center">
                                Account Information
                            </h1>
                            <Descriptions
                                column={1}
                                bordered
                                size="middle"
                                className="custom-descriptions"
                            >
                                <Descriptions.Item label="Name">{user.fullname}</Descriptions.Item>
                                <Descriptions.Item label="Account">{user.username}</Descriptions.Item>
                                <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
                                <Descriptions.Item label="DOB">{formattedDOB}</Descriptions.Item>
                                <Descriptions.Item label="Phone Number">{user.phone || 'Not provided'}</Descriptions.Item>
                            </Descriptions>
                        </div>
                    </div>
                </Card>
            </div>
        </SidebarLayout>
    );
};

export default AdminProfile;
