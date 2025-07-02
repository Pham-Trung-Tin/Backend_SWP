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
  // Khởi tạo trạng thái từ localStorage (nếu có)
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('nosmoke_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lưu user vào localStorage khi thay đổi
  useEffect(() => {
    if (user) {
      localStorage.setItem('nosmoke_user', JSON.stringify(user));
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
      // Mô phỏng độ trễ của API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Kiểm tra email đã tồn tại chưa
      if (checkUserExists(userData.email)) {
        throw new Error('Email này đã được đăng ký');
      }
      
      // Lấy danh sách người dùng từ localStorage
      const users = JSON.parse(localStorage.getItem('nosmoke_users') || '[]');
      
      // Tạo user mới với ID ngẫu nhiên
      const newUser = {
        ...userData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      
      // Thêm user mới vào danh sách
      users.push(newUser);
      
      // Lưu danh sách user cập nhật vào localStorage
      localStorage.setItem('nosmoke_users', JSON.stringify(users));
      
      // Không lưu mật khẩu vào user session
      const { password, ...userWithoutPassword } = newUser;
      
      // Đặt user hiện tại
      setUser(userWithoutPassword);
      setLoading(false);
      
      return { success: true, user: userWithoutPassword };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Hàm đăng nhập
  const login = async (email, password, rememberMe) => {
    setLoading(true);
    setError(null);
    
    try {
      // Mô phỏng API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Lấy danh sách user từ localStorage
      const users = JSON.parse(localStorage.getItem('nosmoke_users') || '[]');
      
      // Tìm user với email và password tương ứng
      const foundUser = users.find(user => user.email === email && user.password === password);
        if (foundUser) {
        // Không lưu mật khẩu vào user session
        const { password, ...userWithoutPassword } = foundUser;
          // Đảm bảo user có trường membership và đó là một giá trị hợp lệ
        if (!userWithoutPassword.membership || !['free', 'premium', 'pro'].includes(userWithoutPassword.membership)) {
          userWithoutPassword.membership = 'free';
          
          // Cập nhật lại danh sách users
          const updatedUsers = users.map(user => 
            user.email === email ? { ...user, membership: 'free' } : user
          );
          localStorage.setItem('nosmoke_users', JSON.stringify(updatedUsers));
        }
        
        // Lưu vào localStorage để đảm bảo tính nhất quán
        localStorage.setItem('nosmoke_user', JSON.stringify(userWithoutPassword));
        
        setUser(userWithoutPassword);
        setLoading(false);
        return { success: true, user: userWithoutPassword };
      } else {
        // Kiểm tra trong danh sách coach hardcoded
        const foundCoach = COACH_ACCOUNTS.find(coach => coach.email === email && coach.password === password);
        if (foundCoach) {
          // Không lưu mật khẩu vào coach session
          const { password, ...coachWithoutPassword } = foundCoach;
          
          // Đặt user là coach và lưu vào localStorage
          const coachUser = { ...coachWithoutPassword, role: 'coach' };
          setUser(coachUser);
          localStorage.setItem('nosmoke_user', JSON.stringify(coachUser));
          setLoading(false);
          
          // Redirect coach đến dashboard ngay lập tức
          window.location.href = '/coach';
          
          return { success: true, user: coachUser };
        }
        
        throw new Error('Email hoặc mật khẩu không đúng');
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
    // Xóa thông tin user khỏi localStorage
    localStorage.removeItem('nosmoke_user');
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
        setUser({...user, ...updates});
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
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
