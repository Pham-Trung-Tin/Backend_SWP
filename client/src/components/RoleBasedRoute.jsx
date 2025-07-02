import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * RoleBasedRoute - Component bảo vệ route dựa trên vai trò người dùng
 */
function RoleBasedRoute({ children, allowedRoles = [], redirectTo = '/' }) {
  const { user, isAuthenticated } = useAuth();

  // Nếu chưa đăng nhập, chuyển hướng về trang chủ
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Nếu không có vai trò được phép, cho phép tất cả user đã đăng nhập
  if (allowedRoles.length === 0) {
    return children;
  }

  // Kiểm tra vai trò của user
  const userRole = user.role || 'user'; // Mặc định là 'user' nếu không có role
  
  if (allowedRoles.includes(userRole)) {
    return children;
  }

  // Nếu không có quyền, chuyển hướng về trang access denied hoặc trang chủ
  return <Navigate to="/access-denied" replace />;
}

export default RoleBasedRoute;
