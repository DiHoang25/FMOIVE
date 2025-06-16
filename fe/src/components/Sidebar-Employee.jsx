import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import { FaUserFriends } from "react-icons/fa";
import { IoTicketOutline } from "react-icons/io5";
import { GiConfirmed } from "react-icons/gi";
import { AiOutlineBook } from "react-icons/ai";
import { RiInformation2Line } from "react-icons/ri";
import { Button, Layout, Menu, theme } from 'antd';

const { Header, Sider, Content } = Layout;


const SidebarLayoutEmployee = ({ children }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout className="min-h-screen bg-[#0f172a]">
      <Sider
        width={260}             // rộng hơn mặc định (200px)
        collapsedWidth={80}     // giữ collapsed nhỏ gọn
        trigger={null}
        collapsible
        collapsed={collapsed}
      >
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={[
            {
              key: '/employee',
              icon: <DashboardOutlined />,
              label: <Link to="/employee">Dashboard Overview</Link>,
            },
            {
              key: '/employee/members-list',
              icon: <FaUserFriends />,
              label: <Link to="/employee/members-list">View Members</Link>,
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
              key: '5',
              icon: <AiOutlineBook />,
              label: 'Booking List',
            },
            {
              key: '6',
              icon: <RiInformation2Line />,
              label: 'Ticket Information',
            },          
            
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: '#001529' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '20px',
              width: 64,
              height: 64,
              color: 'white', // nút toggle màu trắng
            }}
          />
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

export default SidebarLayoutEmployee;
