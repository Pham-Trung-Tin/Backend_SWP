// React Hook cho Authentication - useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';
import api from './api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (api.isAuthenticated()) {
        const response = await api.getCurrentUser();
        if (response.success) {
          setUser(response.data.user);
        }
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      api.removeToken();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      const response = await api.login(credentials);
      if (response.success) {
        setUser(response.data.user);
        return response;
      }
    } catch (err) {
      setError(api.formatError(err));
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await api.register(userData);
      if (response.success) {
        setUser(response.data.user);
        return response;
      }
    } catch (err) {
      setError(api.formatError(err));
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
