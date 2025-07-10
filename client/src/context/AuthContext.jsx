import React, { createContext, useState, useContext, useEffect } from 'react';

// Tạo context cho xác thực
const AuthContext = createContext(null);

// Hook tùy chỉnh để sử dụng AuthContext
export const useAuth = () => useContext(AuthContext);

// Hardcoded coach accounts
const COACH_ACCOUNTS = [
  {
    id: 1,
    name: 'Nguyên Văn A',
    email: 'coach1@nosmoke.com',
    password: 'coach123',
    role: 'coach',
    specialization: 'Coach cai thuốc chuyên nghiệp',
    rating: 4.8,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    id: 2,
    name: 'Trần Thị B',
    email: 'coach2@nosmoke.com',
    password: 'coach123',
    role: 'coach',
    specialization: 'Chuyên gia tâm lý',
    rating: 4.9,
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    id: 3,
    name: 'Phạm Minh C',
    email: 'coach3@nosmoke.com',
    password: 'coach123',
    role: 'coach',
    specialization: 'Bác sĩ phục hồi chức năng',
    rating: 4.7,
    avatar: 'https://randomuser.me/api/portraits/men/64.jpg'
  }
];

// Provider component
export const AuthProvider = ({ children }) => {
  // Khởi tạo trạng thái từ localStorage hoặc sessionStorage (nếu có)
  const [user, setUser] = useState(() => {
    // Ưu tiên localStorage (ghi nhớ), sau đó mới sessionStorage (không ghi nhớ)
    const storedUser = localStorage.getItem('nosmoke_user') || sessionStorage.getItem('nosmoke_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      // Normalize user data
      return {
        ...userData,
        name: userData.name || userData.fullName || userData.username,
        fullName: userData.fullName || userData.name || userData.username
      };
    }
    return null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lưu user vào storage khi thay đổi
  useEffect(() => {
    if (user) {
      // Kiểm tra xem có token trong localStorage không (tức là có ghi nhớ)
      const hasRememberMe = localStorage.getItem('auth_token');
      if (hasRememberMe) {
        localStorage.setItem('nosmoke_user', JSON.stringify(user));
      } else {
        sessionStorage.setItem('nosmoke_user', JSON.stringify(user));
      }
    }
  }, [user]);

  // Hàm kiểm tra tài khoản đã tồn tại
  const checkUserExists = (email) => {
    const users = JSON.parse(localStorage.getItem('nosmoke_users') || '[]');
    return users.some(user => user.email === email);
  };

  // Hàm đăng ký tài khoản mới
  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        setLoading(false);
        return {
          success: true,
          message: data.message,
          email: userData.email
        };
      } else {
        throw new Error(data.message || 'Đăng ký thất bại');
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Hàm đăng nhập
  const login = async (email, password, rememberMe = false) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        const { user: userData, token, refreshToken } = data.data;

        // Normalize user data để đảm bảo có cả name và fullName
        const normalizedUser = {
          ...userData,
          name: userData.name || userData.fullName || userData.username,
          fullName: userData.fullName || userData.name || userData.username
        };

        // Lưu token và user data
        if (rememberMe) {
          localStorage.setItem('auth_token', token);
          localStorage.setItem('refresh_token', refreshToken);
          localStorage.setItem('nosmoke_user', JSON.stringify(normalizedUser));
        } else {
          sessionStorage.setItem('auth_token', token);
          sessionStorage.setItem('refresh_token', refreshToken);
          sessionStorage.setItem('nosmoke_user', JSON.stringify(normalizedUser));
        }

        setUser(normalizedUser);
        setLoading(false);

        return { success: true, user: normalizedUser };
      } else {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Hàm đăng xuất
  const logout = () => {
    setUser(null);
    // Xóa thông tin user và token khỏi cả localStorage và sessionStorage
    localStorage.removeItem('nosmoke_user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('nosmoke_user');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('refresh_token');
    return { success: true };
  };
  // Đảm bảo rằng membership luôn là một giá trị hợp lệ
  useEffect(() => {
    if (user) {
      let needUpdate = false;
      let updates = {};

      // Kiểm tra và đảm bảo membership hợp lệ
      if (!user.membership || !['free', 'premium', 'pro'].includes(user.membership)) {
        // Nếu membership không hợp lệ, kiểm tra membershipType
        if (user.membershipType && ['free', 'premium', 'pro'].includes(user.membershipType)) {
          updates.membership = user.membershipType;
        } else {
          updates.membership = 'free';
        }
        needUpdate = true;
      }

      // Kiểm tra và đảm bảo membershipType hợp lệ và đồng bộ với membership
      if (!user.membershipType || user.membershipType !== user.membership) {
        updates.membershipType = user.membership || 'free';
        needUpdate = true;
      }

      // Cập nhật nếu cần
      if (needUpdate) {
        console.log('Đồng bộ dữ liệu membership:', updates);
        setUser({ ...user, ...updates });
      }
    }

    // Kiểm tra nếu cần refresh membership
    if (user && window.sessionStorage && window.sessionStorage.getItem('membership_refresh_needed') === 'true') {
      refreshMembership();
      window.sessionStorage.removeItem('membership_refresh_needed');
    }
  }, [user]);

  // Hàm refresh thông tin membership từ localStorage
  const refreshMembership = () => {
    if (!user) return { success: false, error: 'Không có người dùng để cập nhật' };

    try {
      // Lấy thông tin user từ localStorage
      const users = JSON.parse(localStorage.getItem('nosmoke_users') || '[]');
      const storedUser = users.find(u => u.id === user.id);

      if (storedUser && storedUser.membership !== user.membership) {
        // Cập nhật thông tin membership nếu có sự khác biệt
        setUser({ ...user, membership: storedUser.membership });
        return { success: true, user: { ...user, membership: storedUser.membership } };
      }

      return { success: true, user };
    } catch (err) {
      console.error('Lỗi khi refresh membership:', err);
      return { success: false, error: err.message };
    }
  };
  // Hàm cập nhật thông tin người dùng
  const updateUser = (updatedData) => {
    if (!user) return { success: false, error: 'Không có người dùng để cập nhật' };

    try {
      // Lấy danh sách người dùng từ localStorage
      const users = JSON.parse(localStorage.getItem('nosmoke_users') || '[]');
      // Đảm bảo membership hợp lệ nếu đang cập nhật membership
      if (updatedData.hasOwnProperty('membership') &&
        !['free', 'premium', 'pro'].includes(updatedData.membership)) {
        updatedData.membership = 'free';
      }

      // Đảm bảo đồng bộ giữa membership và membershipType
      if (updatedData.hasOwnProperty('membership') && !updatedData.hasOwnProperty('membershipType')) {
        updatedData.membershipType = updatedData.membership;
        console.log('Tự động đồng bộ membershipType:', updatedData.membershipType);
      }

      if (updatedData.hasOwnProperty('membershipType') && !updatedData.hasOwnProperty('membership')) {
        updatedData.membership = updatedData.membershipType;
        console.log('Tự động đồng bộ membership:', updatedData.membership);
      }

      // Tìm và cập nhật người dùng
      const updatedUsers = users.map(u => {
        if (u.id === user.id) {
          return { ...u, ...updatedData };
        }
        return u;
      });

      // Lưu danh sách cập nhật vào localStorage
      localStorage.setItem('nosmoke_users', JSON.stringify(updatedUsers));

      // Cập nhật user hiện tại trong state
      const updatedUser = { ...user, ...updatedData };
      setUser(updatedUser);

      // Cập nhật user trong localStorage cho phiên hiện tại
      localStorage.setItem('nosmoke_user', JSON.stringify(updatedUser));

      return { success: true, user: updatedUser };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };
  // Hàm xác nhận email
  const verifyEmail = async (email, verificationCode) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, verificationCode }),
      });

      const data = await response.json();

      if (data.success) {
        setLoading(false);
        return { success: true, message: data.message };
      } else {
        throw new Error(data.message || 'Xác nhận email thất bại');
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Hàm gửi lại mã xác nhận
  const resendVerificationCode = async (email) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setLoading(false);
        return { success: true, message: data.message };
      } else {
        throw new Error(data.message || 'Gửi lại mã xác nhận thất bại');
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Giá trị context
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    updateUser,
    refreshMembership,
    setUser,
    verifyEmail,
    resendVerificationCode,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
