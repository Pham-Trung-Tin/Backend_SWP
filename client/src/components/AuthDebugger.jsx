import React from 'react';
import { useAuth } from '../context/AuthContext';

const AuthDebugger = () => {
  const { user, isAuthenticated } = useAuth();
  
  // Only show in development
  if (import.meta.env.MODE === 'production') return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <div><strong>🔍 Auth Debug</strong></div>
      <div>URL: {window.location.pathname}</div>
      <div>Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
      <div>User: {user ? `${user.name || user.email}` : 'null'}</div>
      <div>Role: {user?.role || 'none'}</div>
      <div>LocalStorage: {localStorage.getItem('nosmoke_user') ? '✅' : '❌'}</div>
    </div>
  );
};

export default AuthDebugger;
