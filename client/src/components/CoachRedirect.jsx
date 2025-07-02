import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Component này sẽ redirect coach đến dashboard của họ
const CoachRedirect = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Nếu user có role là coach, redirect đến /coach
    if (user && user.role === 'coach') {
      navigate('/coach', { replace: true });
    }
  }, [user, navigate]);

  // Nếu không phải coach, render children bình thường
  if (user && user.role === 'coach') {
    return null; // Không render gì cả khi đang redirect
  }

  return children;
};

export default CoachRedirect;
