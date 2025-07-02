import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, initializing, user, token } = useAuth();
  const location = useLocation();

  // Debug authentication state
  console.log('ProtectedRoute Debug:', {
    isAuthenticated,
    loading,
    initializing,
    user: user ? { id: user.id, email: user.email } : null,
    token: token ? 'Present' : 'Null',
    pathname: location.pathname
  });

  // Show loading state while authentication is being initialized or checked
  if (initializing || loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{initializing ? 'Đang khởi tạo...' : 'Đang xác thực...'}</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page and save the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default ProtectedRoute;
