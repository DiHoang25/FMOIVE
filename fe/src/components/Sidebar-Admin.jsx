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
import { IoTicketOutline } from "react-icons/io5";
import { GiConfirmed } from "react-icons/gi";
import { AiOutlineBook } from "react-icons/ai";
import { RiInformation2Line } from "react-icons/ri";
import { FaUsers } from "react-icons/fa6";
import { SlPresent } from "react-icons/sl";
import { Button, Layout, Menu, theme } from 'antd';
import { RxAvatar } from "react-icons/rx";

const { Header, Sider, Content } = Layout;


const SidebarLayout = ({ children }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout className="min-h-screen bg-[#0f172a]">
      <Sider
        width={220}             // rộng hơn mặc định (200px)
        collapsedWidth={80}     // giữ collapsed nhỏ gọn
        trigger={null}
        collapsible
        collapsed={collapsed}
      >
        {/* Top Header */}
        <header className="px-8 py-2 flex justify-center items-center border-b border-gray-600">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold">
          <RxAvatar className="text-9xl" />
          </div>
        </header>

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
              label: <Link to="/admin/view-members">View Members</Link>,
            },
            {
              key: '3',
              icon: <IoTicketOutline />,
              label: 'Movie & Showtime',
            },
            {
              key: '4',
              icon: <GiConfirmed />,
              label: 'Confirm Tickets',
            },
            {
              key: '/admin/booking-list',
              icon: <AiOutlineBook />,
              label: <Link to="/admin/booking-list">Booking List</Link>,
            },
            {
              key: '6',
              icon: <RiInformation2Line />,
              label: 'Ticket Information',
            },
            {
              key: '7',
              icon: <FaUsers />,
              label: 'View Employees',
            },
            {
              key: '/admin/movie-list',
              icon: <FaClipboardList />,
              label: <Link to="/admin/movie-list">Movie List</Link>,
            },
            {
              key: '9',
              icon: <FaRegBuilding />,
              label: 'Cinema Rooms',
            },
            {
              key: '/admin/promotions',
              icon: <SlPresent />,
              label: <Link to="/admin/promotions">Promotions</Link>,
            },
          ]}
        />
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
            background: '#0d1a2d', // màu nền dark hơn một chút
            overflowY: 'auto',
            color: 'white', // văn bản màu trắng
          }}
        >
          {children}
        </Content>

      </Layout>
    </Layout>
  );
};

export default SidebarLayout;
