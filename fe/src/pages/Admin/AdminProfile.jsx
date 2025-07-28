import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Button,
  Card,
  Spin,
  Result,
  Badge,
  Divider,
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  KeyOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  CrownOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
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
            Authorization: `Bearer ${token}`,
          },
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
        <Result status="error" title="Error" subTitle={error} />
      </SidebarLayout>
    );
  }

  if (!user) {
    return (
      <SidebarLayout>
        <div className="flex justify-center items-center min-h-[70vh] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-8">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent rounded-20">
                Admin Profile
              </h1>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
            <Card
              className="w-full max-w-4xl mx-auto px-4 bg-slate-800/70 backdrop-blur-lg border border-slate-600/40 shadow-2xl overflow-visible"
              style={{ borderRadius: '20px' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/8 via-transparent to-cyan-600/8 pointer-events-none" />
              <div className="relative p-5 lg:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                  {/* Avatar section */}
                  <motion.div
                    className="flex flex-col items-center text-center relative z-10"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <div className="relative mb-5 z-20">
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-cyan-400 rounded-full blur-lg opacity-25 animate-pulse" />
                      <Badge.Ribbon
                        text={
                          <span className="flex items-center gap-1">
                            <CrownOutlined /> Admin
                          </span>
                        }
                        color="orange"
                        placement="start"
                        style={{ zIndex: 1000, position: 'absolute', top: '-8px', left: '-8px' }}
                      >
                        <div style={{ position: 'relative', zIndex: 50 }}>
                          <Avatar
                            src={avatar}
                            icon={<UserOutlined />}
                            className="border-3 border-white/30 shadow-xl w-[100px] h-[100px] md:w-[120px] md:h-[120px]"
                          />
                        </div>
                      </Badge.Ribbon>
                    </div>

                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                      <h2 className="text-xl md:text-2xl font-bold text-white mb-2">{user.fullname}</h2>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <SafetyOutlined className="text-blue-400" />
                        <span className="text-slate-300 text-sm md:text-base">System Administrator</span>
                      </div>
                      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full px-4 py-2 border border-blue-400/30">
                        <span className="text-blue-300 text-xs md:text-sm font-medium">@{user.username}</span>
                      </div>
                    </motion.div>

                    {/* Buttons */}
                    <motion.div
                      className="w-full mt-8 flex flex-col gap-3 sm:justify-center sm:gap-4"
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Button
                        onClick={() => navigate('/admin/admin-profile/edit-profile')}
                        icon={<EditOutlined />}
                        size="large"
                        className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-none text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        style={{ height: '48px', borderRadius: '12px' }}
                      >
                        Edit Profile
                      </Button>

                      <Button
                        onClick={() => navigate('/admin/admin-profile/change-admin-password')}
                        icon={<KeyOutlined />}
                        size="large"
                        className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-none text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        style={{ height: '48px', borderRadius: '12px' }}
                      >
                        Change Password
                      </Button>
                    </motion.div>
                  </motion.div>

                  {/* Info Section */}
                  <motion.div
                    className="md:col-span-1 lg:col-span-2"
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                  >
                    <div className="bg-slate-900/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30">
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <UserOutlined className="text-white text-sm" />
                        </div>
                        Account Information
                      </h3>
                      <Divider className="border-slate-600/50 my-6" />

                      <div className="space-y-6">
                        {[
                          {
                            icon: <UserOutlined />,
                            label: 'Full Name',
                            value: user.fullname,
                            color: 'from-blue-500 to-blue-600',
                          },
                          {
                            icon: <SafetyOutlined />,
                            label: 'Username',
                            value: `@${user.username}`,
                            color: 'from-green-500 to-green-600',
                          },
                          {
                            icon: <MailOutlined />,
                            label: 'Email Address',
                            value: user.email,
                            color: 'from-purple-500 to-purple-600',
                          },
                          {
                            icon: <CalendarOutlined />,
                            label: 'Date of Birth',
                            value: formattedDOB,
                            color: 'from-orange-500 to-orange-600',
                          },
                          {
                            icon: <PhoneOutlined />,
                            label: 'Phone Number',
                            value: user.phone || 'Not provided',
                            color: 'from-cyan-500 to-cyan-600',
                          },
                        ].map((item, idx) => (
                          <motion.div
                            key={idx}
                            className={`flex items-center gap-4 p-4 bg-slate-800/40 rounded-xl border border-slate-600/20 transition-all duration-300 hover:scale-105 hover:border-opacity-50`}
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className={`w-10 h-10 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center`}>
                              {item.icon}
                            </div>
                            <div className="flex-1">
                              <p className="text-slate-400 text-xs md:text-sm font-medium">{item.label}</p>
                              {/* Added break-all to ensure long email addresses wrap correctly */}
                              <p className="text-white text-sm md:text-lg font-semibold break-all">{item.value}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Stats cards */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {[
              {
                icon: <SafetyOutlined className="text-white text-xl" />,
                label: 'Security Level',
                value: 'Administrator',
                color: 'from-blue-500 to-blue-600',
                textColor: 'text-blue-300',
              },
              {
                icon: <CrownOutlined className="text-white text-xl" />,
                label: 'Account Status',
                value: 'Active',
                color: 'from-green-500 to-green-600',
                textColor: 'text-green-300',
              },
              {
                icon: <UserOutlined className="text-white text-xl" />,
                label: 'Role',
                value: 'System Admin',
                color: 'from-purple-500 to-purple-600',
                textColor: 'text-purple-300',
              },
            ].map((card, idx) => (
              <Card key={idx} className="bg-slate-800/80 border border-slate-600/50 backdrop-blur-sm transition-all duration-300 hover:border-opacity-50">
                <div className="text-center">
                  <div className={`w-12 h-12 bg-gradient-to-r ${card.color} rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                    {card.icon}
                  </div>
                  <h4 className="text-white font-semibold text-base md:text-lg mb-1">{card.label}</h4>
                  <p className={`${card.textColor} font-medium text-sm md:text-base`}>{card.value}</p>
                </div>
              </Card>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </SidebarLayout>
  );
};

export default AdminProfile;
