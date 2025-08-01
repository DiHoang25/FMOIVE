import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckSquareOutlined
} from '@ant-design/icons';
import { RxAvatar } from 'react-icons/rx';
import { Button, Layout, Menu, Drawer } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { message } from 'antd';

const { Header, Sider, Content } = Layout;

const UserDashboardLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    message.success('Đăng xuất thành công!', 3);
    navigate('/login');
  };


  const menuItems = [
    {
      key: '/viewaccount',
      icon: <UserOutlined />,
      label: <Link to="/viewaccount">Account Information</Link>,
    },
    // {
    //   key: '/viewscorehistory',
    //   icon: <CalendarOutlined />,
    //   label: <Link to="/viewscorehistory">History of Score</Link>,
    // },
    {
      key: '/viewbookedticket',
      icon: <CheckSquareOutlined />,
      label: <Link to="/viewbookedticket">Booked Ticket</Link>,
    },
  ];

  return (
    <Layout className="min-h-screen bg-[#0f172a]">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sider
          width={220}
          collapsedWidth={80}
          trigger={null}
          collapsible
          collapsed={collapsed}
        >
          <header className="mt-4 px-8 py-2 flex justify-center items-center border-b border-gray-600">
            <Link to="/viewaccount" className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold hover:scale-105 transition">
              <RxAvatar className="text-2xl" />
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
      )}

      {/* Mobile Drawer */}
      <Drawer
        title="Member Menu"
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
        <Header style={{ padding: 0, background: '#001529', position: 'relative', marginTop: '16px' }}>
          <div className="flex items-center px-5 py-3 border-b border-gray-600 relative">
            <Button
              type="text"
              icon={
                isMobile
                  ? <MenuUnfoldOutlined />
                  : collapsed
                  ? <MenuUnfoldOutlined />
                  : <MenuFoldOutlined />
              }
              onClick={() => {
                if (isMobile) {
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
              USER DASHBOARD
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

export default UserDashboardLayout;
