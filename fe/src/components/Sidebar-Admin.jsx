import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import {
  FaUserFriends,
  FaClipboardList,
  FaRegBuilding
} from "react-icons/fa";
import { AiOutlineBook } from "react-icons/ai";
import { SlPresent } from "react-icons/sl";
import { RxAvatar } from "react-icons/rx";
import { RiInformation2Line } from "react-icons/ri";
import { Button, Layout, Menu, theme, Drawer } from 'antd';
import AdminNotification from './Admin-Notification';
import { useAuth } from '../contexts/AuthContext';

const { Header, Sider, Content } = Layout;

const SidebarLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const { token: { colorBgContainer } } = theme.useToken();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
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
      key: '/admin/view-employees',
      icon: <FaUserFriends />,
      label: <Link to="/admin/view-employees">View Employees</Link>,
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
    {
      key: '/admin/movienews-list',
      icon: <RiInformation2Line />,
      label: <Link to="/admin/movienews-list">Movie News</Link>,
    }
  ];

  return (
    <Layout className="min-h-screen bg-[#0f172a]">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sider
          width={220}
          collapsedWidth={80}
          trigger={null}
          collapsible
          collapsed={collapsed}
        >
          <header className="px-8 py-2 flex justify-center items-center border-b border-gray-600">
            <Link to="/admin/admin-profile" className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold hover:scale-105 transition">
              <RxAvatar className="text-9xl" />
            </Link>
          </header>

          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
          />

          <div className="p-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded text-base"
            >
              <LogoutOutlined />
            </button>
          </div>
        </Sider>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        title="Admin Menu"
        placement="left"
        onClose={() => setIsMobileDrawerOpen(false)}
        open={isMobileDrawerOpen}
        className="md:hidden"
        bodyStyle={{ padding: 0, backgroundColor: "#001529" }}
      >
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded text-base"
          >
            <LogoutOutlined />
          </button>
        </div>
      </Drawer>

      <Layout>
        <Header style={{ padding: 0, background: '#001529', position: 'relative' }}>
          <div className="flex items-center px-5 py-3 border-b border-gray-600 relative">
            {/* Collapse or open drawer */}
            <Button
              type="text"
              icon={
                window.innerWidth < 768
                  ? <MenuUnfoldOutlined />
                  : collapsed
                  ? <MenuUnfoldOutlined />
                  : <MenuFoldOutlined />
              }
              onClick={() => {
                if (window.innerWidth < 768) {
                  setIsMobileDrawerOpen(true);
                } else {
                  setCollapsed(!collapsed);
                }
              }}
              style={{
                fontSize: '20px',
                width: 40,
                height: 40,
                color: 'white',
              }}
            />
            <h1 className="text-xl text-white absolute left-1/2 transform -translate-x-1/2">
              ADMIN
            </h1>
            <AdminNotification />
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
