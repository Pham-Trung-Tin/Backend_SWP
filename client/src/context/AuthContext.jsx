import React, { createContext, useState, useContext, useEffect } from 'react';

// Define API base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Create the context
const AuthContext = createContext(null);

// Custom hook for using the auth context
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export named exports
export { AuthContext, useAuth };

// Provider component
export const AuthProvider = ({ children }) => {
  // State hooks
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  // Debug Effect
  useEffect(() => {
    console.log('AuthContext Debug:', {
      user: user ? { id: user.id, email: user.email } : null,
      token: token ? 'Present' : 'Null',
      loading,
      initializing,
      isAuthenticated: !!user && !!token
    });
  }, [user, token, loading, initializing]);

  // Auto-restore session
  useEffect(() => {
    const restoreSession = () => {
      console.log('AuthContext: Attempting to restore session...');

      // Check storage for credentials
      const storedUser = localStorage.getItem('nosmoke_user') || sessionStorage.getItem('nosmoke_user');
      const storedToken = localStorage.getItem('nosmoke_token') || sessionStorage.getItem('nosmoke_token');
      const storedRefreshToken = localStorage.getItem('nosmoke_refresh_token') || sessionStorage.getItem('nosmoke_refresh_token');

      console.log('AuthContext: Stored data found:', {
        hasUser: !!storedUser,
        hasToken: !!storedToken,
        hasRefreshToken: !!storedRefreshToken
      });

      if (storedUser && storedToken) {
        try {
          const userData = JSON.parse(storedUser);
          console.log('AuthContext: Restoring session for user:', userData.email);

          setUser(userData);
          setToken(storedToken);
          if (storedRefreshToken) {
            setRefreshToken(storedRefreshToken);
          }

          console.log('AuthContext: Session restored successfully');
        } catch (error) {
          console.error('AuthContext: Error restoring session:', error);
          clearAllStoredData();
        }
      } else {
        console.log('AuthContext: No stored credentials found');
      }

      setInitializing(false);
    };

    restoreSession();
  }, []);

  // Helper function to clear all stored data
  const clearAllStoredData = () => {
    localStorage.removeItem('nosmoke_token');
    localStorage.removeItem('nosmoke_refresh_token');
    localStorage.removeItem('nosmoke_user');
    sessionStorage.removeItem('nosmoke_token');
    sessionStorage.removeItem('nosmoke_refresh_token');
    sessionStorage.removeItem('nosmoke_user');
    setUser(null);
    setToken(null);
    setRefreshToken(null);
  };

  // Helper for API headers
  const setAuthHeader = (token) => ({
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  });

  // Token refresh function
  const refreshAccessToken = async () => {
    if (!refreshToken) throw new Error('No refresh token available');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.message);

      const { token: newToken, refreshToken: newRefreshToken } = data.data;

      localStorage.setItem('nosmoke_token', newToken);
      localStorage.setItem('nosmoke_refresh_token', newRefreshToken);

      setToken(newToken);
      setRefreshToken(newRefreshToken);

      return newToken;
    } catch (error) {
      clearAllStoredData();
      throw error;
    }
  };

  // Login function
  const login = async (email, password, rememberMe = false) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Login attempt:', { email, rememberMe });

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Invalid credentials');
      }

      const { token: newToken, refreshToken: newRefreshToken, user: userData } = data.data;
      const storage = rememberMe ? localStorage : sessionStorage;

      // Save to selected storage
      storage.setItem('nosmoke_token', newToken);
      storage.setItem('nosmoke_refresh_token', newRefreshToken);
      storage.setItem('nosmoke_user', JSON.stringify(userData));

      setToken(newToken);
      setRefreshToken(newRefreshToken);
      setUser(userData);

      console.log('Login successful:', { email: userData.email });
      return { success: true, user: userData };

    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);

    try {
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: setAuthHeader(token),
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearAllStoredData();
      setLoading(false);
    }

    return { success: true };
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      // Generate username from email
      const generateUsername = (email) => {
        const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
        const timestamp = Date.now().toString().slice(-4);
        return `${baseUsername}${timestamp}`.substring(0, 50);
      };

      const requestBody = {
        username: generateUsername(userData.email),
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.password,
        fullName: userData.full_name,
        phone: userData.phone || ''
      };

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!data.success) {
        const errorMessage = data.message ||
          (data.errors && data.errors.join(', ')) ||
          'Registration failed';
        throw new Error(errorMessage);
      }

      return { success: true, email: userData.email };

    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Value object for context
  const value = {
    user,
    loading,
    error,
    token,
    initializing,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    register,
    refreshAccessToken,
    setUser,
    clearAllStoredData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
