import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const RequireRole = ({ allowedRoles, children }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const userRole = decoded.user.role;

    // ❌ Không đúng vai trò được cấp phép
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/not-found" replace />;
    }

    // ✅ Admin: chỉ được vào /admin/**
    if (
      userRole === 'admin' &&
      !location.pathname.startsWith('/admin')
    ) {
      return <Navigate to="/admin" replace />;
    }

    // ✅ Employee: chỉ được vào /employee/**
    if (
      userRole === 'employee' &&
      !location.pathname.startsWith('/employee')
    ) {
      return <Navigate to="/employee" replace />;
    }

    // ✅ Customer: chỉ bị chặn khi cố vào /admin hoặc /employee
    if (
      userRole === 'customer' &&
      (location.pathname.startsWith('/admin') || location.pathname.startsWith('/employee'))
    ) {
      return <Navigate to="/not-found" replace />;
    }

    // ✅ Tất cả điều kiện hợp lệ
    return children;
  } catch (error) {
    console.error('Token decode error:', error);
    return <Navigate to="/login" replace />;
  }
};

export default RequireRole;
