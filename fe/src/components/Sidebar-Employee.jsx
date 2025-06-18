// Sidebar-Admin.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
} from "@ant-design/icons";

import { IoTicketOutline } from "react-icons/io5";
import { AiOutlineBook } from "react-icons/ai";
import { Button, Layout, Menu, theme } from "antd";
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
        width={220} // rộng hơn mặc định (200px)
        collapsedWidth={80} // giữ collapsed nhỏ gọn
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
              key: "/employee",
              icon: <DashboardOutlined />,
              label: <Link to="/employee">Dashboard Overview</Link>,
            },
            {
              key: "/employee/counter-showtimes",
              icon: <IoTicketOutline />,
              label: <Link to="/employee/counter-showtimes">Movie & Showtime</Link>,
            },
           
            
            
            {
              key: "/employee/booking-list",
              icon: <AiOutlineBook />,
              label: <Link to="/employee/counter-booking-list">Booking List</Link>,
            },
            
          ]}
        />
      </Sider>
      <Layout>
        <Header
          style={{ padding: 0, background: "#001529", position: "relative" }}
        >
          <div className="flex items-center px-5 py-3 border-b border-gray-600 relative">
            {/* Nút collapse bên trái */}
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "20px",
                width: 40,
                height: 40,
                color: "white",
              }}
            />

            {/* Chữ Employee canh giữa tuyệt đối */}
            <h1 className="text-xl text-white absolute left-1/2 transform -translate-x-1/2">
              EMPLOYEE
            </h1>
          </div>
        </Header>

        <Content
          style={{
            padding: 24,
            minHeight: 280,
            background: "#0d1a2d", // màu nền dark hơn một chút
            overflowY: "auto",
            color: "white", // văn bản màu trắng
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default SidebarLayout;
