import React, { createContext, useState, useContext, useEffect } from 'react';

// Base API URL - change this to your backend URL
const API_BASE_URL = 'http://localhost:5000/api';

// Tạo context cho xác thực
const AuthContext = createContext(null);

// Hook tùy chỉnh để sử dụng AuthContext
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
  // Khởi tạo trạng thái từ sessionStorage (giữ khi reload, mất khi đóng browser)
  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem('nosmoke_user') || localStorage.getItem('nosmoke_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(() => {
    return sessionStorage.getItem('nosmoke_token') || localStorage.getItem('nosmoke_token');
  });
  const [refreshToken, setRefreshToken] = useState(() => {
    return localStorage.getItem('nosmoke_refresh_token');
  });
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('nosmoke_remember') === 'true';
  });
  // Xóa localStorage cũ và sync với sessionStorage
  useEffect(() => {
    // Không xóa localStorage nữa vì cần cho Remember Me
    console.log('🔄 AuthContext initialized');
  }, []);

  // Lưu user và token vào storage khi thay đổi
  useEffect(() => {
    if (user) {
      if (rememberMe) {
        localStorage.setItem('nosmoke_user', JSON.stringify(user));
      } else {
        sessionStorage.setItem('nosmoke_user', JSON.stringify(user));
        localStorage.removeItem('nosmoke_user');
      }
    } else {
      sessionStorage.removeItem('nosmoke_user');
      localStorage.removeItem('nosmoke_user');
    }
  }, [user, rememberMe]);

  useEffect(() => {
    if (token) {
      if (rememberMe) {
        localStorage.setItem('nosmoke_token', token);
      } else {
        sessionStorage.setItem('nosmoke_token', token);
        localStorage.removeItem('nosmoke_token');
      }
    } else {
      sessionStorage.removeItem('nosmoke_token');
      localStorage.removeItem('nosmoke_token');
    }
  }, [token, rememberMe]);

  useEffect(() => {
    if (refreshToken && rememberMe) {
      localStorage.setItem('nosmoke_refresh_token', refreshToken);
    } else {
      localStorage.removeItem('nosmoke_refresh_token');
    }
  }, [refreshToken, rememberMe]);

  useEffect(() => {
    localStorage.setItem('nosmoke_remember', rememberMe.toString());
  }, [rememberMe]);
  // API helper function
  const apiCall = async (endpoint, options = {}) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      };

      // Add authorization header if token exists
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const url = `${API_BASE_URL}${endpoint}`;
      console.log('🌐 Fetching:', url, 'with config:', config); const response = await fetch(url, config);

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      // Xử lý trường hợp server error (500)
      if (response.status === 500) {
        console.error('❌ Server error (500)');
        throw new Error('Lỗi máy chủ nội bộ. Vui lòng thử lại sau.');
      }

      const data = await response.json();
      console.log('📡 Response data:', data);

      if (!response.ok) {
        console.error('❌ API Error:', data);
        throw new Error(data.message || 'Yêu cầu thất bại');
      }

      return data;
    } catch (error) {
      // Log chi tiết lỗi bao gồm stack trace
      console.error('🚨 API call error details:', error);
      console.error('🚨 apiCall error:', error);
      throw error;
    }
  };  // Hàm đăng ký tài khoản mới - Bước 1: Gửi mã xác nhận
  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🚀 AuthContext register called with:', userData);
      console.log('📡 Making API call to:', `${API_BASE_URL}/auth/register`);

      const data = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      console.log('✅ API response:', data);

      if (data.success) {
        // Registration successful, verification code sent
        return {
          success: true,
          message: data.message,
          email: data.data.email,
          needsVerification: true
        };
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };  // Hàm xác nhận email
  const verifyEmail = async (email, verificationCode) => {
    setLoading(true);
    setError(null);

    try {
      console.log(`🔍 Xác thực email: ${email} với mã: ${verificationCode}`);
      console.log(`🌐 API URL: ${API_BASE_URL}/auth/verify-email`);

      // Đảm bảo mã xác thực luôn là string và loại bỏ khoảng trắng
      const formattedCode = String(verificationCode).trim();

      console.log(`📤 Gửi request với dữ liệu:`, { email, verificationCode: formattedCode });

      const data = await apiCall('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({
          email,
          verificationCode: formattedCode
        })
      });

      console.log(`📥 Nhận response:`, data); if (data.success) {
        setUser(data.data.user);
        setToken(data.data.token);
        console.log('✅ Email verified and user registered');
        return { success: true, user: data.data.user };
      } else {
        console.error('❌ Verification failed:', data.message);
        throw new Error(data.message || 'Xác thực email không thành công');
      }
    } catch (err) {
      console.error('🔴 Lỗi khi xác thực email:', err);
      console.error('❌ Verification error:', err);
      setError(err.message || 'Không thể kết nối đến server');
      return { success: false, error: err.message || 'Không thể kết nối đến server' };
    } finally {
      setLoading(false);
    }
  };

  // Hàm gửi lại mã xác nhận
  const resendVerificationCode = async (email) => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiCall('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email })
      });

      if (data.success) {
        return { success: true, message: data.message };
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };
  // Hàm đăng nhập
  const login = async (email, password, remember = false) => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }); if (data.success) {
        setRememberMe(remember);
        setUser(data.data.user);
        setToken(data.data.token);
        
        // Lưu refresh token nếu có
        if (data.data.refreshToken) {
          setRefreshToken(data.data.refreshToken);
        }
        
        console.log(`✅ User logged in${remember ? ' with remember me' : ' - session only'}`);
        return { success: true, user: data.data.user };
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };
  // Hàm đăng xuất
  const logout = async () => {
    try {
      if (token) {
        await apiCall('/auth/logout', {
          method: 'POST'
        });
      }
    } catch (err) {
      console.error('Logout error:', err);    } finally {
      // Xóa tất cả dữ liệu đăng nhập
      setUser(null);
      setToken(null);
      setRefreshToken(null);
      setRememberMe(false);
      
      // Xóa khỏi storage
      sessionStorage.removeItem('nosmoke_user');
      sessionStorage.removeItem('nosmoke_token');
      localStorage.removeItem('nosmoke_user');
      localStorage.removeItem('nosmoke_token');
      localStorage.removeItem('nosmoke_refresh_token');
      localStorage.removeItem('nosmoke_remember');
      
      console.log('🔐 User logged out - all session data cleared');
      return { success: true };
    }
  };

  // Hàm cập nhật thông tin người dùng
  const updateUser = async (updatedData) => {
    if (!user || !token) return { success: false, error: 'Không có người dùng để cập nhật' };

    try {
      setLoading(true);
      const data = await apiCall('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(updatedData)
      });

      if (data.success) {
        setUser(data.data.user);
        return { success: true, user: data.data.user };
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Hàm đổi mật khẩu
  const changePassword = async (currentPassword, newPassword, confirmPassword) => {
    if (!user || !token) return { success: false, error: 'Không có người dùng để cập nhật' };

    try {
      setLoading(true);
      const data = await apiCall('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
      });

      if (data.success) {
        return { success: true };
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Hàm refresh thông tin user từ server
  const refreshUser = async () => {
    if (!token) return { success: false, error: 'Không có token' };

    try {
      const data = await apiCall('/auth/profile');

      if (data.success) {
        setUser(data.data.user);
        return { success: true, user: data.data.user };
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      // If token is invalid, logout
      if (err.message.includes('token') || err.message.includes('401')) {
        logout();
      }
      return { success: false, error: err.message };
    }
  };
  // Legacy functions for backward compatibility
  const refreshMembership = refreshUser;

  // Hàm refresh token tự động
  const refreshAccessToken = async () => {
    if (!refreshToken) {
      console.log('❌ No refresh token available');
      return false;
    }

    try {
      console.log('🔄 Refreshing access token...');
      const data = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken })
      });

      const result = await data.json();

      if (result.success) {
        setToken(result.data.token);
        if (result.data.refreshToken) {
          setRefreshToken(result.data.refreshToken);
        }
        console.log('✅ Access token refreshed successfully');
        return true;
      } else {
        console.log('❌ Failed to refresh token:', result.message);
        logout(); // Logout if refresh fails
        return false;
      }
    } catch (error) {
      console.error('❌ Refresh token error:', error);
      logout(); // Logout if refresh fails
      return false;
    }
  };

  // Auto refresh token khi khởi động app (nếu có remember me)
  useEffect(() => {
    const initializeAuth = async () => {
      if (refreshToken && rememberMe && !token) {
        console.log('🔄 Auto refreshing token on app startup...');
        await refreshAccessToken();
      }
    };

    initializeAuth();
  }, []); // Chỉ chạy một lần khi component mount  // Giá trị context
  const value = {
    user,
    loading,
    error,
    token,
    refreshToken,
    rememberMe,
    login,
    logout,
    register,
    verifyEmail,
    resendVerificationCode,
    updateUser,
    changePassword,
    refreshUser,
    refreshMembership,
    refreshAccessToken,
    setUser,
    setRememberMe,
    isAuthenticated: !!user && !!token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
