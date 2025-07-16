// import React, { createContext, useState, useContext, useEffect } from 'react';
// import authApi from '../utils/authApi';

// // Tạo context cho xác thực
// const AuthContext = createContext(null);

// // Hook tùy chỉnh để sử dụng AuthContext
// export const useAuth = () => useContext(AuthContext);

// // Hardcoded coach accounts
// const COACH_ACCOUNTS = [
//   {
//     id: 1,
//     name: 'Nguyên Văn A',
//     email: 'coach1@nosmoke.com',
//     password: 'coach123',
//     role: 'coach',
//     specialization: 'Coach cai thuốc chuyên nghiệp',
//     rating: 4.8,
//     avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
//   },
//   {
//     id: 2,
//     name: 'Trần Thị B',
//     email: 'coach2@nosmoke.com',
//     password: 'coach123',
//     role: 'coach',
//     specialization: 'Chuyên gia tâm lý',
//     rating: 4.9,
//     avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
//   },
//   {
//     id: 3,
//     name: 'Phạm Minh C',
//     email: 'coach3@nosmoke.com',
//     password: 'coach123',
//     role: 'coach',
//     specialization: 'Bác sĩ phục hồi chức năng',
//     rating: 4.7,
//     avatar: 'https://randomuser.me/api/portraits/men/64.jpg'
//   }
// ];

// // Provider component
// export const AuthProvider = ({ children }) => {
//   // Khởi tạo trạng thái từ localStorage (nếu có)
//   const [user, setUser] = useState(() => {
//     const storedUser = localStorage.getItem('nosmoke_user');
//     return storedUser ? JSON.parse(storedUser) : null;
//   });
  
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Lưu user vào localStorage khi thay đổi
//   useEffect(() => {
//     if (user) {
//       localStorage.setItem('nosmoke_user', JSON.stringify(user));
//     }
//   }, [user]);

//   // Hàm kiểm tra tài khoản đã tồn tại
//   const checkUserExists = (email) => {
//     const users = JSON.parse(localStorage.getItem('nosmoke_users') || '[]');
//     return users.some(user => user.email === email);
//   };

//   // Hàm đăng ký tài khoản mới
//   const register = async (userData) => {
//     setLoading(true);
//     setError(null);
    
//     try {
//       // Gọi API đăng ký
//       const response = await authApi.register(userData);
      
//       if (!response.success) {
//         throw new Error(response.message || 'Đăng ký không thành công');
//       }
      
//       // Lấy dữ liệu người dùng từ response
//       const { user: registeredUser, token } = response.data;
      
//       // Đặt user hiện tại
//       setUser(userWithoutPassword);
//       setLoading(false);
      
//       return { success: true, user: userWithoutPassword };
//     } catch (err) {
//       setError(err.message);
//       setLoading(false);
//       return { success: false, error: err.message };
//     }
//   };

//   // Hàm đăng nhập
//   const login = async (email, password, rememberMe) => {
//     setLoading(true);
//     setError(null);
    
//     try {
//       // Thử đăng nhập với API
//       let apiSuccess = false;
      
//       try {
//         // Log để debug
//         console.log('Attempting API login with:', { email });

//         // Gọi API đăng nhập
//         const response = await authApi.login(email, password);
        
//         // Log full response for debugging
//         console.log('API login response:', response);
        
//         if (response.success && response.data?.user) {
//           // Lấy dữ liệu người dùng từ response
//           const { user: loggedInUser } = response.data;
          
//           console.log('Login successful, user data:', loggedInUser);
          
//           setUser(loggedInUser);
//           setLoading(false);
//           apiSuccess = true;
          
//           return { success: true, user: loggedInUser };
//         }
        
//         // Nếu response không success, log message để debug
//         if (!response.success) {
//           console.error('API login returned error:', response.message);
//           throw new Error(response.message || 'Đăng nhập không thành công');
//         }
//       } catch (apiError) {
//         console.error('API login failed:', apiError);
//         throw apiError; // Throw lại lỗi để hiển thị cho người dùng
//       }
      
//       // Nếu API không thành công, thử sử dụng hardcoded accounts
//       if (!apiSuccess) {
//         console.log('Trying hardcoded coach accounts');
//         const foundCoach = COACH_ACCOUNTS.find(coach => coach.email === email && coach.password === password);
//         if (foundCoach) {
//           console.log('Found matching coach account:', foundCoach.email);
//           // Không lưu mật khẩu vào coach session
//           const { password, ...coachWithoutPassword } = foundCoach;
          
//           // Đặt user là coach và lưu vào localStorage
//           const coachUser = { ...coachWithoutPassword, role: 'coach' };
//           setUser(coachUser);
//           localStorage.setItem('nosmoke_user', JSON.stringify(coachUser));
//           setLoading(false);
          
//           // Redirect coach đến dashboard ngay lập tức
//           window.location.href = '/coach';
          
//           return { success: true, user: coachUser };
//         }
        
//         // Nếu không tìm thấy tài khoản coach phù hợp
//         console.error('No matching coach account found');
//         throw new Error('Email hoặc mật khẩu không đúng');
//       }
//     } catch (err) {
//       console.error('Login error (final catch):', err);
//       setError(err.message);
//       setLoading(false);
//       return { success: false, error: err.message };
//     }
//   };

//   // Hàm đăng xuất
//   const logout = async () => {
//     try {
//       // Gọi API đăng xuất
//       await authApi.logout();
      
//       setUser(null);
//       return { success: true };
//     } catch (error) {
//       console.error('Logout error:', error);
//       // Đảm bảo người dùng vẫn đăng xuất ngay cả khi API gặp lỗi
//       setUser(null);
//       return { success: true };
//     }
//   };
//     // Đảm bảo rằng membership luôn là một giá trị hợp lệ
//   useEffect(() => {
//     if (user) {
//       let needUpdate = false;
//       let updates = {};
      
//       // Kiểm tra và đảm bảo membership hợp lệ
//       if (!user.membership || !['free', 'premium', 'pro'].includes(user.membership)) {
//         // Nếu membership không hợp lệ, kiểm tra membershipType
//         if (user.membershipType && ['free', 'premium', 'pro'].includes(user.membershipType)) {
//           updates.membership = user.membershipType;
//         } else {
//           updates.membership = 'free';
//         }
//         needUpdate = true;
//       }
      
//       // Kiểm tra và đảm bảo membershipType hợp lệ và đồng bộ với membership
//       if (!user.membershipType || user.membershipType !== user.membership) {
//         updates.membershipType = user.membership || 'free';
//         needUpdate = true;
//       }
      
//       // Cập nhật nếu cần
//       if (needUpdate) {
//         console.log('Đồng bộ dữ liệu membership:', updates);
//         setUser({...user, ...updates});
//       }
//     }
    
//     // Kiểm tra nếu cần refresh membership
//     if (user && window.sessionStorage && window.sessionStorage.getItem('membership_refresh_needed') === 'true') {
//       refreshMembership();
//       window.sessionStorage.removeItem('membership_refresh_needed');
//     }
//   }, [user]);
  
//   // Hàm refresh thông tin membership từ localStorage
//   const refreshMembership = () => {
//     if (!user) return { success: false, error: 'Không có người dùng để cập nhật' };
    
//     try {
//       // Lấy thông tin user từ localStorage
//       const users = JSON.parse(localStorage.getItem('nosmoke_users') || '[]');
//       const storedUser = users.find(u => u.id === user.id);
      
//       if (storedUser && storedUser.membership !== user.membership) {
//         // Cập nhật thông tin membership nếu có sự khác biệt
//         setUser({ ...user, membership: storedUser.membership });
//         return { success: true, user: { ...user, membership: storedUser.membership } };
//       }
      
//       return { success: true, user };
//     } catch (err) {
//       console.error('Lỗi khi refresh membership:', err);
//       return { success: false, error: err.message };
//     }
//   };
//     // Hàm cập nhật thông tin người dùng
//   const updateUser = async (updatedData) => {
//     if (!user) return { success: false, error: 'Không có người dùng để cập nhật' };
    
//     try {
//       // Đảm bảo membership hợp lệ nếu đang cập nhật membership
//       if (updatedData.hasOwnProperty('membership') && 
//           !['free', 'premium', 'pro'].includes(updatedData.membership)) {
//         updatedData.membership = 'free';
//       }
      
//       // Đảm bảo đồng bộ giữa membership và membershipType
//       if (updatedData.hasOwnProperty('membership') && !updatedData.hasOwnProperty('membershipType')) {
//         updatedData.membershipType = updatedData.membership;
//         console.log('Tự động đồng bộ membershipType:', updatedData.membershipType);
//       }
      
//       if (updatedData.hasOwnProperty('membershipType') && !updatedData.hasOwnProperty('membership')) {
//         updatedData.membership = updatedData.membershipType;
//         console.log('Tự động đồng bộ membership:', updatedData.membership);
//       }
      
//       // Gọi API cập nhật thông tin người dùng
//       const response = await authApi.updateProfile(updatedData);
      
//       if (!response.success) {
//         throw new Error(response.message || 'Cập nhật thông tin không thành công');
//       }
      
//       // Lấy dữ liệu người dùng đã cập nhật từ response
//       const { user: updatedUserData } = response.data;
      
//       // Cập nhật user hiện tại trong state
//       const updatedUser = { ...user, ...updatedUserData };
//       setUser(updatedUser);
      
//       return { success: true, user: updatedUser };
//     } catch (err) {
//       setError(err.message);
//       return { success: false, error: err.message };
//     }
//   };
//   // Giá trị context
//   const value = {
//     user,
//     loading,
//     error,
//     login,
//     logout,
//     register,
//     updateUser,
//     refreshMembership,
//     setUser,
//     isAuthenticated: !!user
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

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
  // Khởi tạo trạng thái từ localStorage hoặc sessionStorage
  const [user, setUser] = useState(() => {
    // Kiểm tra localStorage trước (remember me), sau đó sessionStorage
    const storedUser = localStorage.getItem('nosmoke_user') || sessionStorage.getItem('nosmoke_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(() => {
    // Kiểm tra localStorage trước (remember me), sau đó sessionStorage
    return localStorage.getItem('nosmoke_token') || sessionStorage.getItem('nosmoke_token');
  });
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('nosmoke_remember') === 'true';
  });
  // Xóa localStorage cũ và sync với sessionStorage
  useEffect(() => {
    // Không xóa localStorage nữa vì cần cho remember me
    console.log('🔧 AuthContext initialized with remember me support');
  }, []);

  // Lưu user và token vào storage khi thay đổi
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
  const login = async (email, password, rememberMeOption = false) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔑 Đăng nhập với email:', email);
      
      const data = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (data.success) {
        // Kiểm tra và log thông tin user nhận được từ API
        console.log('📊 Thông tin user từ API:', data.data.user);
        console.log('📋 Chi tiết các trường quan trọng:');
        console.log('- full_name:', data.data.user.full_name);
        console.log('- quit_reason:', data.data.user.quit_reason);
        console.log('- quitReason:', data.data.user.quitReason);
        console.log('- age:', data.data.user.age);
        console.log('- profile_image:', data.data.user.profile_image);
        
        // Đảm bảo các trường camelCase và snake_case đều được lưu
        const processedUser = {
          ...data.data.user,
          // Đồng bộ các trường camelCase và snake_case
          quitReason: data.data.user.quitReason || data.data.user.quit_reason,
          quit_reason: data.data.user.quitReason || data.data.user.quit_reason,
          dateOfBirth: data.data.user.dateOfBirth || data.data.user.date_of_birth,
          date_of_birth: data.data.user.dateOfBirth || data.data.user.date_of_birth,
          fullName: data.data.user.fullName || data.data.user.full_name,
          full_name: data.data.user.fullName || data.data.user.full_name,
          profileImage: data.data.user.profileImage || data.data.user.profile_image,
          profile_image: data.data.user.profileImage || data.data.user.profile_image,
          // Đảm bảo các trường mới (address, age) được giữ lại
          address: data.data.user.address,
          age: data.data.user.age
        };
        
        // Kiểm tra xem các trường đã được xử lý đúng chưa
        console.log('🔍 Processed user fields:');
        console.log('- address:', processedUser.address, typeof processedUser.address);
        console.log('- age:', processedUser.age, typeof processedUser.age);
        console.log('- quit_reason:', processedUser.quit_reason, typeof processedUser.quit_reason);
        
        // Cập nhật rememberMe trước khi set user và token
        setRememberMe(rememberMeOption);
        setUser(processedUser);
        setToken(data.data.token);
        
        // Lưu thông tin user vào localStorage hoặc sessionStorage
        if (rememberMeOption) {
          localStorage.setItem('nosmoke_user', JSON.stringify(processedUser));
          localStorage.setItem('nosmoke_token', data.data.token);
          localStorage.setItem('token', data.data.token); // Backup key
          localStorage.setItem('nosmoke_remember', 'true');
          console.log('💾 Token saved to localStorage:', data.data.token.substring(0, 20) + '...');
        } else {
          sessionStorage.setItem('nosmoke_user', JSON.stringify(processedUser));
          sessionStorage.setItem('nosmoke_token', data.data.token);
          sessionStorage.setItem('token', data.data.token); // Backup key
          // Also save to localStorage for API compatibility
          localStorage.setItem('nosmoke_token', data.data.token);
          localStorage.setItem('token', data.data.token);
          console.log('💾 Token saved to sessionStorage and localStorage:', data.data.token.substring(0, 20) + '...');
        }

        // Cập nhật membership ngay sau khi đăng nhập thành công
        try {
          console.log('🔄 Đang lấy thông tin membership sau khi đăng nhập...');
          
          // Tạo một function để gọi API lấy membership
          const fetchMembershipAfterLogin = async () => {
            try {
              // Import API từ membershipApi.js
              const membershipApiModule = await import('../utils/membershipApi');
              const membershipApi = membershipApiModule.default;
              
              // Gọi API lấy membership hiện tại
              const membershipResponse = await membershipApi.getCurrentMembership();
              
              console.log('📊 Thông tin membership từ API:', membershipResponse);
              
              if (membershipResponse.success && membershipResponse.data) {
                // Lấy giá trị membership dựa trên tên gói
                let membershipValue = 'free';
                if (membershipResponse.data.package_name) {
                  const packageName = membershipResponse.data.package_name.toLowerCase();
                  if (packageName.includes('pro')) {
                    membershipValue = 'pro';
                  } else if (packageName.includes('premium')) {
                    membershipValue = 'premium';
                  } else if (membershipResponse.data.package_id !== 1) {
                    membershipValue = 'premium';
                  }
                }
                
                console.log('📊 Membership value xác định được:', membershipValue);
                
                // Cập nhật user với thông tin membership
                const updatedUser = {
                  ...processedUser,
                  membership: membershipValue,
                  membershipType: membershipValue,
                  packageDetails: membershipResponse.data
                };
                
                // Cập nhật state và storage
                setUser(updatedUser);
                
                if (rememberMeOption) {
                  localStorage.setItem('nosmoke_user', JSON.stringify(updatedUser));
                } else {
                  sessionStorage.setItem('nosmoke_user', JSON.stringify(updatedUser));
                }
                
                console.log('✅ Đã cập nhật membership sau khi đăng nhập:', updatedUser);
                
                // Phát ra sự kiện để thông báo cho các component khác
                window.dispatchEvent(new CustomEvent('user-updated', { 
                  detail: { user: updatedUser }
                }));
              }
            } catch (membershipErr) {
              console.error('❌ Lỗi khi lấy thông tin membership:', membershipErr);
            }
          };
          
          // Gọi hàm lấy membership
          fetchMembershipAfterLogin();
        } catch (membershipErr) {
          console.error('❌ Lỗi khi cập nhật membership sau đăng nhập:', membershipErr);
          // Không làm gián đoạn quá trình đăng nhập nếu có lỗi membership
        }

        console.log(`✅ User logged in - ${rememberMeOption ? 'persistent across browser sessions' : 'session only'}`);
        return { success: true, user: processedUser };
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error('❌ Lỗi đăng nhập:', err);
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
      console.error('Logout error:', err);
    } finally {
      // Xóa hoàn toàn state và cả localStorage và sessionStorage
      setUser(null);
      setToken(null);
      setRememberMe(false);
      sessionStorage.removeItem('nosmoke_user');
      sessionStorage.removeItem('nosmoke_token');
      localStorage.removeItem('nosmoke_user');
      localStorage.removeItem('nosmoke_token');
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
      console.log('🔄 Cập nhật thông tin người dùng:', updatedData);
      
      // Chuyển đổi dữ liệu từ camelCase sang snake_case nếu cần
      const processedData = { ...updatedData };
      
      // Xử lý trường name/full_name
      if (processedData.name) {
        // Nếu có name, sử dụng name như là full_name
        processedData.name = processedData.name;
        // Không cần đổi tên trường vì backend đã được cập nhật để nhận cả name và full_name
      }
      
      // Đảm bảo formatData đúng cho backend
      if (processedData.dateOfBirth) {
        processedData.date_of_birth = processedData.dateOfBirth;
        delete processedData.dateOfBirth;
      }
      
      // Đảm bảo xử lý đúng các trường camelCase thành snake_case
      if (processedData.quitReason !== undefined) {
        processedData.quit_reason = processedData.quitReason;
        delete processedData.quitReason;
        console.log('📝 Frontend sending quit_reason:', processedData.quit_reason, typeof processedData.quit_reason);
      }
      
      // Đảm bảo address được gửi đúng
      if (processedData.address !== undefined) {
        console.log('📝 Frontend sending address:', processedData.address, typeof processedData.address);
      }
      
      // Đảm bảo age được gửi đúng
      if (processedData.age !== undefined) {
        // Đảm bảo age là số hoặc null
        if (processedData.age === '' || processedData.age === null) {
          processedData.age = null;
        } else {
          const parsedAge = parseInt(processedData.age);
          if (!isNaN(parsedAge)) {
            processedData.age = parsedAge;
          } else {
            processedData.age = null;
          }
        }
        console.log('📝 Frontend sending age:', processedData.age, typeof processedData.age);
      }
      
      console.log('📦 Final data for API request:', processedData);
      
      console.log('📦 Processed data for API:', processedData);
      
      const data = await apiCall('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(processedData)
      });

      if (data.success) {
        // API trả về user trong data (không phải data.user)
        console.log('✅ Cập nhật thông tin thành công:', data.data);
        
        // Cập nhật state user với dữ liệu mới từ server
        setUser(data.data);
        
        // Chuyển đổi dữ liệu snake_case sang camelCase để sử dụng trong frontend
        const formattedUser = {
          ...data.data,
          // Thêm các field mà frontend có thể cần với định dạng camelCase
          dateOfBirth: data.data.date_of_birth,
          quitReason: data.data.quit_reason,
          profileImage: data.data.profile_image,
          // Đảm bảo các trường address, age được giữ nguyên
          address: data.data.address,
          age: data.data.age
        };
        
        console.log('🔍 Formatted user after update:', formattedUser);
        console.log('- address:', formattedUser.address);
        console.log('- age:', formattedUser.age);
        console.log('- quit_reason/quitReason:', formattedUser.quit_reason, formattedUser.quitReason);
        
        // Lưu trạng thái user mới vào localStorage/sessionStorage
        if (rememberMe) {
          localStorage.setItem('nosmoke_user', JSON.stringify(formattedUser));
        } else {
          sessionStorage.setItem('nosmoke_user', JSON.stringify(formattedUser));
        }
        
        // Thông báo cho toàn bộ ứng dụng về việc cập nhật thông tin người dùng
        window.dispatchEvent(new CustomEvent('user-updated', { 
          detail: { user: formattedUser }
        }));
        
        return { 
          success: true, 
          user: formattedUser, 
          message: data.message || 'Cập nhật thông tin thành công'
        };
      } else {
        throw new Error(data.message || 'Có lỗi xảy ra khi cập nhật thông tin');
      }
    } catch (err) {
      console.error('❌ Lỗi khi cập nhật thông tin người dùng:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Hàm tải lên avatar người dùng
  const uploadAvatar = async (file) => {
    if (!user || !token) return { success: false, error: 'Không có người dùng để cập nhật avatar' };

    try {
      setLoading(true);
      console.log('📤 Bắt đầu tải lên avatar mới');
      
      const formData = new FormData();
      formData.append('avatar', file);
      
      // Sử dụng fetch trực tiếp vì FormData không hoạt động tốt với apiCall
      const response = await fetch(`${API_BASE_URL}/users/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      console.log('📥 Kết quả tải lên avatar:', data);
      
      if (data.success) {
        // Lấy URL avatar từ response
        const avatarUrl = data.data.avatarUrl;
        console.log('✅ Avatar URL từ server:', avatarUrl);
        
        // Tạo object user mới với avatar đã cập nhật
        const updatedUser = {
          ...user,
          profile_image: avatarUrl
        };
        
        console.log('🖼️ Cập nhật user state với avatar mới:', updatedUser);
        
        // Cập nhật state user - điều này sẽ trigger re-render cho cả User.jsx và Header.jsx
        setUser(updatedUser);
        
        // Lưu trạng thái user mới vào localStorage/sessionStorage
        if (rememberMe) {
          localStorage.setItem('nosmoke_user', JSON.stringify(updatedUser));
        } else {
          sessionStorage.setItem('nosmoke_user', JSON.stringify(updatedUser));
        }
        
        // Thông báo tới cả application là avatar đã được cập nhật
        window.dispatchEvent(new CustomEvent('avatar-updated', { 
          detail: { avatarUrl, userId: user.id || user._id }
        }));
        
        return { success: true, avatarUrl };
      } else {
        throw new Error(data.message || 'Không thể tải lên avatar');
      }
    } catch (err) {
      console.error('❌ Lỗi khi tải lên avatar:', err);
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
      console.log('🔄 Refreshing user data from server...');
      const data = await apiCall('/auth/profile');

      if (data.success) {
        console.log('✅ User data refreshed successfully:', data.data);
        console.log('📋 Key fields:');
        console.log('- address:', data.data.address);
        console.log('- age:', data.data.age);
        console.log('- quit_reason:', data.data.quit_reason);
        
        // Tạo user object với đầy đủ cả camelCase và snake_case
        const processedUser = {
          ...data.data,
          // Đồng bộ cả 2 kiểu
          quitReason: data.data.quitReason || data.data.quit_reason,
          quit_reason: data.data.quitReason || data.data.quit_reason,
          dateOfBirth: data.data.dateOfBirth || data.data.date_of_birth,
          date_of_birth: data.data.dateOfBirth || data.data.date_of_birth,
          fullName: data.data.fullName || data.data.full_name,
          full_name: data.data.fullName || data.data.full_name
        };
        
        // Cập nhật thông tin membership từ backend
        try {
          console.log('🔄 Đang lấy thông tin membership khi refresh user...');
          
          // Import API từ membershipApi.js
          const membershipApiModule = await import('../utils/membershipApi');
          const membershipApi = membershipApiModule.default;
          
          // Gọi API lấy membership hiện tại
          const membershipResponse = await membershipApi.getCurrentMembership();
          
          if (membershipResponse.success && membershipResponse.data) {
            console.log('📊 Thông tin membership từ API:', membershipResponse.data);
            
            // Lấy giá trị membership dựa trên tên gói
            let membershipValue = 'free';
            if (membershipResponse.data.package_name) {
              const packageName = membershipResponse.data.package_name.toLowerCase();
              if (packageName.includes('pro')) {
                membershipValue = 'pro';
              } else if (packageName.includes('premium')) {
                membershipValue = 'premium';
              } else if (membershipResponse.data.package_id !== 1) {
                membershipValue = 'premium';
              }
            }
            
            console.log('📊 Membership value xác định được:', membershipValue);
            
            // Cập nhật user với thông tin membership
            processedUser.membership = membershipValue;
            processedUser.membershipType = membershipValue;
            processedUser.packageDetails = membershipResponse.data;
            
            console.log('✅ Đã cập nhật membership trong refreshUser:', processedUser);
          }
        } catch (membershipErr) {
          console.error('❌ Lỗi khi lấy thông tin membership trong refreshUser:', membershipErr);
          // Tiếp tục với user data đã có
        }
        
        // Cập nhật state và storage
        setUser(processedUser);
        
        // Lưu thông tin user vào localStorage hoặc sessionStorage
        if (rememberMe) {
          localStorage.setItem('nosmoke_user', JSON.stringify(processedUser));
        } else {
          sessionStorage.setItem('nosmoke_user', JSON.stringify(processedUser));
        }
        
        // Phát sự kiện để thông báo user đã cập nhật
        window.dispatchEvent(new CustomEvent('user-updated', { 
          detail: { user: processedUser }
        }));
        
        return { success: true, user: processedUser };
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
  const refreshMembership = refreshUser;  // Giá trị context
  const value = {
    user,
    loading,
    error,
    token,
    login,
    logout,
    register,
    verifyEmail,
    resendVerificationCode,
    updateUser,
    uploadAvatar, // Thêm function upload avatar
    changePassword,
    refreshUser,
    refreshMembership,
    setUser,
    isAuthenticated: !!user && !!token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
