// Sidebar-Admin.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import { FaUserFriends, FaClipboardList, FaRegBuilding } from "react-icons/fa";
import { GiConfirmed } from "react-icons/gi";
import { AiOutlineBook } from "react-icons/ai";
import { RiInformation2Line } from "react-icons/ri";
import { SlPresent } from "react-icons/sl";
import { Button, Layout, Menu, theme } from 'antd';
import { RxAvatar } from "react-icons/rx";
import { LogoutOutlined } from '@ant-design/icons';

const { Header, Sider, Content } = Layout;


const SidebarLayout = ({ children }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <Layout className="min-h-screen bg-[#0f172a]">
      <Sider
        width={220}
        collapsedWidth={80}
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="flex flex-col justify-between"
      >
        {/* Top Header */}
        <header className="px-8 py-2 flex justify-center items-center border-b border-gray-600">
          <Link to="/admin/admin-profile" className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold hover:scale-105 transition">
            <RxAvatar className="text-9xl" />
          </Link>
        </header>

        {/* Menu Items */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={[
            {
              key: '/admin',
              icon: <DashboardOutlined />,
              label: <Link to="/admin">Dashboard Overview</Link>,
            },
            {
              key: '/admin/view-members',
              icon: <FaUserFriends />,
              label: <Link to="/admin/view-members">View Account</Link>,
            },
            {
              key: '/admin/booking-list',
              icon: <AiOutlineBook />,
              label: <Link to="/admin/booking-list">Booking List</Link>,
            },
            {
              key: '/admin/movie-list',
              icon: <FaClipboardList />,
              label: <Link to="/admin/movie-list">Movie List</Link>,
            },
            {
              key: '/admin/cinema-rooms',
              icon: <FaRegBuilding />,
              label: <Link to="/admin/cinema-rooms">Cinema Rooms</Link>,
            },
            {
              key: '/admin/promotions',
              icon: <SlPresent />,
              label: <Link to="/admin/promotions">Promotions</Link>,
            },
          ]}
        />

        {/* Logout Button */}
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded text-base"
          >
            <LogoutOutlined />
          </button>
        </div>
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: '#001529', position: 'relative' }}>
          <div className="flex items-center px-5 py-3 border-b border-gray-600 relative">
            {/* Nút collapse bên trái */}
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '20px',
                width: 40,
                height: 40,
                color: 'white',
              }}
            />

            {/* Chữ Admin canh giữa tuyệt đối */}
            <h1 className="text-xl text-white absolute left-1/2 transform -translate-x-1/2">
              ADMIN
            </h1>
          </div>
        </Header>

        <Content
          style={{
            padding: 24,
            minHeight: 280,
            background: '#0d1a2d',
            overflowY: 'auto',
            color: 'white',
          }}
        >
          {children}
        </Content>

      </Layout>
    </Layout>
  );
};

export default SidebarLayout;
