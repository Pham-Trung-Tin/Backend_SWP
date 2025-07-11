// export default AuthContext;

import React, { createContext, useState, useContext, useEffect } from 'react';

// Base API URL - change this to your backend URL
const API_BASE_URL = 'http://localhost:5000/api';

// Tạo context cho xác thực
const AuthContext = createContext(null);

// Hook tùy chỉnh để sử dụng AuthContext
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('nosmoke_user') || sessionStorage.getItem('nosmoke_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(() => {
    return localStorage.getItem('nosmoke_token') || sessionStorage.getItem('nosmoke_token');
  });
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('nosmoke_remember') === 'true';
  });

  useEffect(() => {
    console.log('🔧 AuthContext initialized with remember me support');
  }, []);

  useEffect(() => {
    if (user) {
      if (rememberMe) {
        localStorage.setItem('nosmoke_user', JSON.stringify(user));
        localStorage.setItem('nosmoke_remember', 'true');
      } else {
        sessionStorage.setItem('nosmoke_user', JSON.stringify(user));
        localStorage.removeItem('nosmoke_user');
        localStorage.removeItem('nosmoke_remember');
      }
    } else {
      sessionStorage.removeItem('nosmoke_user');
      localStorage.removeItem('nosmoke_user');
      localStorage.removeItem('nosmoke_remember');
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

  // Hàm đăng nhập
  const login = async (email, password, rememberMeOption = false) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      const processedUser = {
        ...data.data.user,
        quitReason: data.data.user.quitReason || data.data.user.quit_reason,
        quit_reason: data.data.user.quitReason || data.data.user.quit_reason,
        dateOfBirth: data.data.user.dateOfBirth || data.data.user.date_of_birth,
        date_of_birth: data.data.user.dateOfBirth || data.data.user.date_of_birth,
        fullName: data.data.user.fullName || data.data.user.full_name,
        full_name: data.data.user.fullName || data.data.user.full_name
      };

      setRememberMe(rememberMeOption);
      setUser(processedUser);
      setToken(data.data.token);

      if (rememberMeOption) {
        localStorage.setItem('nosmoke_user', JSON.stringify(processedUser));
        localStorage.setItem('nosmoke_token', data.data.token);
        localStorage.setItem('nosmoke_remember', 'true');
      } else {
        sessionStorage.setItem('nosmoke_user', JSON.stringify(processedUser));
        sessionStorage.setItem('nosmoke_token', data.data.token);
      }

      return { success: true, user: processedUser };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Hàm đăng xuất
  const logout = () => {
    setUser(null);
    setToken(null);
    setRememberMe(false);
    sessionStorage.clear();
    localStorage.removeItem('nosmoke_user');
    localStorage.removeItem('nosmoke_token');
    localStorage.removeItem('nosmoke_remember');
    return { success: true };
  };

  // Hàm cập nhật thông tin người dùng
  const updateUser = async (updatedData) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 AuthContext - updateUser called with:', updatedData);
      
      const currentToken = token || localStorage.getItem('nosmoke_token') || sessionStorage.getItem('nosmoke_token');
      
      if (!currentToken) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify(updatedData)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Update failed');
      }

      // Process the updated user data
      const processedUser = {
        ...data.data,
        quitReason: data.data.quitReason || data.data.quit_reason,
        quit_reason: data.data.quitReason || data.data.quit_reason,
        dateOfBirth: data.data.dateOfBirth || data.data.date_of_birth,
        date_of_birth: data.data.dateOfBirth || data.data.date_of_birth,
        fullName: data.data.fullName || data.data.full_name,
        full_name: data.data.fullName || data.data.full_name
      };

      setUser(processedUser);

      // Update storage
      if (rememberMe) {
        localStorage.setItem('nosmoke_user', JSON.stringify(processedUser));
      } else {
        sessionStorage.setItem('nosmoke_user', JSON.stringify(processedUser));
      }

      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent('user-updated', {
        detail: { user: processedUser }
      }));

      console.log('✅ AuthContext - User updated successfully:', processedUser);
      return { success: true, message: data.message, user: processedUser };
    } catch (err) {
      console.error('❌ AuthContext - Update user error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Hàm tải lên avatar người dùng
  const uploadAvatar = async (file) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🖼️ AuthContext - uploadAvatar called with file:', file.name);
      
      const currentToken = token || localStorage.getItem('nosmoke_token') || sessionStorage.getItem('nosmoke_token');
      
      if (!currentToken) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`${API_BASE_URL}/users/upload-avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Avatar upload failed');
      }

      // Update user with new avatar URL
      const updatedUser = {
        ...user,
        profile_image: data.data.avatarUrl
      };

      setUser(updatedUser);

      // Update storage
      if (rememberMe) {
        localStorage.setItem('nosmoke_user', JSON.stringify(updatedUser));
      } else {
        sessionStorage.setItem('nosmoke_user', JSON.stringify(updatedUser));
      }

      console.log('✅ AuthContext - Avatar uploaded successfully:', data.data.avatarUrl);
      return { success: true, avatarUrl: data.data.avatarUrl, message: data.message };
    } catch (err) {
      console.error('❌ AuthContext - Upload avatar error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      error, 
      login, 
      logout, 
      setUser, 
      updateUser, 
      uploadAvatar,
      isAuthenticated: !!user && !!token 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
