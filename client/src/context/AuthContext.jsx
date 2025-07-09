
// // export default AuthContext;

// import React, { createContext, useState, useContext, useEffect } from 'react';

// // Base API URL - change this to your backend URL
// const API_BASE_URL = 'http://localhost:5000/api';

// // Tạo context cho xác thực
// const AuthContext = createContext(null);

// // Hook tùy chỉnh để sử dụng AuthContext
// export const useAuth = () => useContext(AuthContext);

// // Provider component
// export const AuthProvider = ({ children }) => {
//   // Khởi tạo trạng thái từ localStorage hoặc sessionStorage
//   const [user, setUser] = useState(() => {
//     // Kiểm tra localStorage trước (remember me), sau đó sessionStorage
//     const storedUser = localStorage.getItem('nosmoke_user') || sessionStorage.getItem('nosmoke_user');
//     return storedUser ? JSON.parse(storedUser) : null;
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [token, setToken] = useState(() => {
//     // Kiểm tra localStorage trước (remember me), sau đó sessionStorage
//     return localStorage.getItem('nosmoke_token') || sessionStorage.getItem('nosmoke_token');
//   });
//   const [rememberMe, setRememberMe] = useState(() => {
//     return localStorage.getItem('nosmoke_remember') === 'true';
//   });
//   // Xóa localStorage cũ và sync với sessionStorage
//   useEffect(() => {
//     // Không xóa localStorage nữa vì cần cho remember me
//     console.log('🔧 AuthContext initialized with remember me support');
//   }, []);

//   // Lưu user và token vào storage khi thay đổi
//   useEffect(() => {
//     if (user) {
//       if (rememberMe) {
//         localStorage.setItem('nosmoke_user', JSON.stringify(user));
//         localStorage.setItem('nosmoke_remember', 'true');
//       } else {
//         sessionStorage.setItem('nosmoke_user', JSON.stringify(user));
//         localStorage.removeItem('nosmoke_user');
//         localStorage.removeItem('nosmoke_remember');
//       }
//     } else {
//       sessionStorage.removeItem('nosmoke_user');
//       localStorage.removeItem('nosmoke_user');
//       localStorage.removeItem('nosmoke_remember');
//     }
//   }, [user, rememberMe]);

//   useEffect(() => {
//     if (token) {
//       if (rememberMe) {
//         localStorage.setItem('nosmoke_token', token);
//       } else {
//         sessionStorage.setItem('nosmoke_token', token);
//         localStorage.removeItem('nosmoke_token');
//       }
//     } else {
//       sessionStorage.removeItem('nosmoke_token');
//       localStorage.removeItem('nosmoke_token');
//     }
//   }, [token, rememberMe]);
//   // API helper function
//   const apiCall = async (endpoint, options = {}) => {
//     try {
//       const config = {
//         headers: {
//           'Content-Type': 'application/json',
//           ...options.headers
//         },
//         ...options
//       };

//       // Add authorization header if token exists
//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//       }

//       const url = `${API_BASE_URL}${endpoint}`;
//       console.log('🌐 Fetching:', url, 'with config:', config); const response = await fetch(url, config);

//       console.log('📡 Response status:', response.status);
//       console.log('📡 Response ok:', response.ok);

//       // Xử lý trường hợp server error (500)
//       if (response.status === 500) {
//         console.error('❌ Server error (500)');
//         throw new Error('Lỗi máy chủ nội bộ. Vui lòng thử lại sau.');
//       }

//       const data = await response.json();
//       console.log('📡 Response data:', data);

//       if (!response.ok) {
//         console.error('❌ API Error:', data);
//         throw new Error(data.message || 'Yêu cầu thất bại');
//       }

//       return data;
//     } catch (error) {
//       // Log chi tiết lỗi bao gồm stack trace
//       console.error('🚨 API call error details:', error);
//       console.error('🚨 apiCall error:', error);
//       throw error;
//     }
//   };  // Hàm đăng ký tài khoản mới - Bước 1: Gửi mã xác nhận
//   const register = async (userData) => {
//     setLoading(true);
//     setError(null);

//     try {
//       console.log('🚀 AuthContext register called with:', userData);
//       console.log('📡 Making API call to:', `${API_BASE_URL}/auth/register`);

//       const data = await apiCall('/auth/register', {
//         method: 'POST',
//         body: JSON.stringify(userData)
//       });

//       console.log('✅ API response:', data);

//       if (data.success) {
//         // Registration successful, verification code sent
//         return {
//           success: true,
//           message: data.message,
//           email: data.data.email,
//           needsVerification: true
//         };
//       } else {
//         throw new Error(data.message);
//       }
//     } catch (err) {
//       setError(err.message);
//       return { success: false, error: err.message };
//     } finally {
//       setLoading(false);
//     }
//   };  // Hàm xác nhận email
//   const verifyEmail = async (email, verificationCode) => {
//     setLoading(true);
//     setError(null);

//     try {
//       console.log(`🔍 Xác thực email: ${email} với mã: ${verificationCode}`);
//       console.log(`🌐 API URL: ${API_BASE_URL}/auth/verify-email`);

//       // Đảm bảo mã xác thực luôn là string và loại bỏ khoảng trắng
//       const formattedCode = String(verificationCode).trim();

//       console.log(`📤 Gửi request với dữ liệu:`, { email, verificationCode: formattedCode });

//       const data = await apiCall('/auth/verify-email', {
//         method: 'POST',
//         body: JSON.stringify({
//           email,
//           verificationCode: formattedCode
//         })
//       });

//       console.log(`📥 Nhận response:`, data); if (data.success) {
//         setUser(data.data.user);
//         setToken(data.data.token);
//         console.log('✅ Email verified and user registered');
//         return { success: true, user: data.data.user };
//       } else {
//         console.error('❌ Verification failed:', data.message);
//         throw new Error(data.message || 'Xác thực email không thành công');
//       }
//     } catch (err) {
//       console.error('🔴 Lỗi khi xác thực email:', err);
//       console.error('❌ Verification error:', err);
//       setError(err.message || 'Không thể kết nối đến server');
//       return { success: false, error: err.message || 'Không thể kết nối đến server' };
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Hàm gửi lại mã xác nhận
//   const resendVerificationCode = async (email) => {
//     setLoading(true);
//     setError(null);

//     try {
//       const data = await apiCall('/auth/resend-verification', {
//         method: 'POST',
//         body: JSON.stringify({ email })
//       });

//       if (data.success) {
//         return { success: true, message: data.message };
//       } else {
//         throw new Error(data.message);
//       }
//     } catch (err) {
//       setError(err.message);
//       return { success: false, error: err.message };
//     } finally {
//       setLoading(false);
//     }
//   };
//   // Hàm đăng nhập
//   const login = async (email, password, rememberMeOption = false) => {
//     setLoading(true);
//     setError(null);

//     try {
//       console.log('🔑 Đăng nhập với email:', email);
      
//       const data = await apiCall('/auth/login', {
//         method: 'POST',
//         body: JSON.stringify({ email, password })
//       });

//       if (data.success) {
//         // Kiểm tra và log thông tin user nhận được từ API
//         console.log('📊 Thông tin user từ API:', data.data.user);
//         console.log('📋 Chi tiết các trường quan trọng:');
//         console.log('- full_name:', data.data.user.full_name);
//         console.log('- quit_reason:', data.data.user.quit_reason);
//         console.log('- quitReason:', data.data.user.quitReason);
//         console.log('- age:', data.data.user.age);
//         console.log('- profile_image:', data.data.user.profile_image);
        
//         // Đảm bảo các trường camelCase và snake_case đều được lưu
//         const processedUser = {
//           ...data.data.user,
//           // Đồng bộ các trường camelCase và snake_case
//           quitReason: data.data.user.quitReason || data.data.user.quit_reason,
//           quit_reason: data.data.user.quitReason || data.data.user.quit_reason,
//           dateOfBirth: data.data.user.dateOfBirth || data.data.user.date_of_birth,
//           date_of_birth: data.data.user.dateOfBirth || data.data.user.date_of_birth,
//           fullName: data.data.user.fullName || data.data.user.full_name,
//           full_name: data.data.user.fullName || data.data.user.full_name,
//           profileImage: data.data.user.profileImage || data.data.user.profile_image,
//           profile_image: data.data.user.profileImage || data.data.user.profile_image,
//           // Đảm bảo các trường mới (address, age) được giữ lại
//           address: data.data.user.address,
//           age: data.data.user.age
//         };
        
//         // Kiểm tra xem các trường đã được xử lý đúng chưa
//         console.log('🔍 Processed user fields:');
//         console.log('- address:', processedUser.address, typeof processedUser.address);
//         console.log('- age:', processedUser.age, typeof processedUser.age);
//         console.log('- quit_reason:', processedUser.quit_reason, typeof processedUser.quit_reason);
        
//         // Cập nhật rememberMe trước khi set user và token
//         setRememberMe(rememberMeOption);
//         setUser(processedUser);
//         setToken(data.data.token);
        
//         // Lưu thông tin user vào localStorage hoặc sessionStorage
//         if (rememberMeOption) {
//           localStorage.setItem('nosmoke_user', JSON.stringify(processedUser));
//           localStorage.setItem('nosmoke_token', data.data.token);
//           localStorage.setItem('nosmoke_remember', 'true');
//         } else {
//           sessionStorage.setItem('nosmoke_user', JSON.stringify(processedUser));
//           sessionStorage.setItem('nosmoke_token', data.data.token);
//         }

//         // Cập nhật membership ngay sau khi đăng nhập thành công
//         try {
//           console.log('🔄 Đang lấy thông tin membership sau khi đăng nhập...');
          
//           // Tạo một function để gọi API lấy membership
//           const fetchMembershipAfterLogin = async () => {
//             try {
//               // Import API từ membershipApi.js
//               const membershipApiModule = await import('../utils/membershipApi');
//               const membershipApi = membershipApiModule.default;
              
//               // Gọi API lấy membership hiện tại
//               const membershipResponse = await membershipApi.getCurrentMembership();
              
//               console.log('📊 Thông tin membership từ API:', membershipResponse);
              
//               if (membershipResponse.success && membershipResponse.data) {
//                 // Lấy giá trị membership dựa trên tên gói
//                 let membershipValue = 'free';
//                 if (membershipResponse.data.package_name) {
//                   const packageName = membershipResponse.data.package_name.toLowerCase();
//                   if (packageName.includes('pro')) {
//                     membershipValue = 'pro';
//                   } else if (packageName.includes('premium')) {
//                     membershipValue = 'premium';
//                   } else if (membershipResponse.data.package_id !== 1) {
//                     membershipValue = 'premium';
//                   }
//                 }
                
//                 console.log('📊 Membership value xác định được:', membershipValue);
                
//                 // Cập nhật user với thông tin membership
//                 const updatedUser = {
//                   ...processedUser,
//                   membership: membershipValue,
//                   membershipType: membershipValue,
//                   packageDetails: membershipResponse.data
//                 };
                
//                 // Cập nhật state và storage
//                 setUser(updatedUser);
                
//                 if (rememberMeOption) {
//                   localStorage.setItem('nosmoke_user', JSON.stringify(updatedUser));
//                 } else {
//                   sessionStorage.setItem('nosmoke_user', JSON.stringify(updatedUser));
//                 }
                
//                 console.log('✅ Đã cập nhật membership sau khi đăng nhập:', updatedUser);
                
//                 // Phát ra sự kiện để thông báo cho các component khác
//                 window.dispatchEvent(new CustomEvent('user-updated', { 
//                   detail: { user: updatedUser }
//                 }));
//               }
//             } catch (membershipErr) {
//               console.error('❌ Lỗi khi lấy thông tin membership:', membershipErr);
//             }
//           };
          
//           // Gọi hàm lấy membership
//           fetchMembershipAfterLogin();
//         } catch (membershipErr) {
//           console.error('❌ Lỗi khi cập nhật membership sau đăng nhập:', membershipErr);
//           // Không làm gián đoạn quá trình đăng nhập nếu có lỗi membership
//         }

//         console.log(`✅ User logged in - ${rememberMeOption ? 'persistent across browser sessions' : 'session only'}`);
//         return { success: true, user: processedUser };
//       } else {
//         throw new Error(data.message);
//       }
//     } catch (err) {
//       console.error('❌ Lỗi đăng nhập:', err);
//       setError(err.message);
//       return { success: false, error: err.message };
//     } finally {
//       setLoading(false);
//     }
//   };
//   // Hàm đăng xuất
//   const logout = async () => {
//     try {
//       if (token) {
//         await apiCall('/auth/logout', {
//           method: 'POST'
//         });
//       }
//     } catch (err) {
//       console.error('Logout error:', err);
//     } finally {
//       // Xóa hoàn toàn state và cả localStorage và sessionStorage
//       setUser(null);
//       setToken(null);
//       setRememberMe(false);
//       sessionStorage.removeItem('nosmoke_user');
//       sessionStorage.removeItem('nosmoke_token');
//       localStorage.removeItem('nosmoke_user');
//       localStorage.removeItem('nosmoke_token');
//       localStorage.removeItem('nosmoke_remember');
//       console.log('🔐 User logged out - all session data cleared');
//       return { success: true };
//     }
//   };

//   // Hàm cập nhật thông tin người dùng
//   const updateUser = async (updatedData) => {
//     if (!user || !token) return { success: false, error: 'Không có người dùng để cập nhật' };

//     try {
//       setLoading(true);
//       console.log('🔄 Cập nhật thông tin người dùng:', updatedData);
      
//       // Chuyển đổi dữ liệu từ camelCase sang snake_case nếu cần
//       const processedData = { ...updatedData };
      
//       // Xử lý trường name/full_name
//       if (processedData.name) {
//         // Nếu có name, sử dụng name như là full_name
//         processedData.name = processedData.name;
//         // Không cần đổi tên trường vì backend đã được cập nhật để nhận cả name và full_name
//       }
      
//       // Đảm bảo formatData đúng cho backend
//       if (processedData.dateOfBirth) {
//         processedData.date_of_birth = processedData.dateOfBirth;
//         delete processedData.dateOfBirth;
//       }
      
//       // Đảm bảo xử lý đúng các trường camelCase thành snake_case
//       if (processedData.quitReason !== undefined) {
//         processedData.quit_reason = processedData.quitReason;
//         delete processedData.quitReason;
//         console.log('📝 Frontend sending quit_reason:', processedData.quit_reason, typeof processedData.quit_reason);
//       }
      
//       // Đảm bảo address được gửi đúng
//       if (processedData.address !== undefined) {
//         console.log('📝 Frontend sending address:', processedData.address, typeof processedData.address);
//       }
      
//       // Đảm bảo age được gửi đúng
//       if (processedData.age !== undefined) {
//         // Đảm bảo age là số hoặc null
//         if (processedData.age === '' || processedData.age === null) {
//           processedData.age = null;
//         } else {
//           const parsedAge = parseInt(processedData.age);
//           if (!isNaN(parsedAge)) {
//             processedData.age = parsedAge;
//           } else {
//             processedData.age = null;
//           }
//         }
//         console.log('📝 Frontend sending age:', processedData.age, typeof processedData.age);
//       }
      
//       console.log('📦 Final data for API request:', processedData);
      
//       console.log('📦 Processed data for API:', processedData);
      
//       const data = await apiCall('/users/profile', {
//         method: 'PUT',
//         body: JSON.stringify(processedData)
//       });

//       if (data.success) {
//         // API trả về user trong data (không phải data.user)
//         console.log('✅ Cập nhật thông tin thành công:', data.data);
        
//         // Cập nhật state user với dữ liệu mới từ server
//         setUser(data.data);
        
//         // Chuyển đổi dữ liệu snake_case sang camelCase để sử dụng trong frontend
//         const formattedUser = {
//           ...data.data,
//           // Thêm các field mà frontend có thể cần với định dạng camelCase
//           dateOfBirth: data.data.date_of_birth,
//           quitReason: data.data.quit_reason,
//           profileImage: data.data.profile_image,
//           // Đảm bảo các trường address, age được giữ nguyên
//           address: data.data.address,
//           age: data.data.age
//         };
        
//         console.log('🔍 Formatted user after update:', formattedUser);
//         console.log('- address:', formattedUser.address);
//         console.log('- age:', formattedUser.age);
//         console.log('- quit_reason/quitReason:', formattedUser.quit_reason, formattedUser.quitReason);
        
//         // Lưu trạng thái user mới vào localStorage/sessionStorage
//         if (rememberMe) {
//           localStorage.setItem('nosmoke_user', JSON.stringify(formattedUser));
//         } else {
//           sessionStorage.setItem('nosmoke_user', JSON.stringify(formattedUser));
//         }
        
//         // Thông báo cho toàn bộ ứng dụng về việc cập nhật thông tin người dùng
//         window.dispatchEvent(new CustomEvent('user-updated', { 
//           detail: { user: formattedUser }
//         }));
        
//         return { 
//           success: true, 
//           user: formattedUser, 
//           message: data.message || 'Cập nhật thông tin thành công'
//         };
//       } else {
//         throw new Error(data.message || 'Có lỗi xảy ra khi cập nhật thông tin');
//       }
//     } catch (err) {
//       console.error('❌ Lỗi khi cập nhật thông tin người dùng:', err);
//       setError(err.message);
//       return { success: false, error: err.message };
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Hàm tải lên avatar người dùng
//   const uploadAvatar = async (file) => {
//     if (!user || !token) return { success: false, error: 'Không có người dùng để cập nhật avatar' };

//     try {
//       setLoading(true);
//       console.log('📤 Bắt đầu tải lên avatar mới');
      
//       const formData = new FormData();
//       formData.append('avatar', file);
      
//       // Sử dụng fetch trực tiếp vì FormData không hoạt động tốt với apiCall
//       const response = await fetch(`${API_BASE_URL}/users/avatar`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`
//         },
//         body: formData
//       });
      
//       const data = await response.json();
//       console.log('📥 Kết quả tải lên avatar:', data);
      
//       if (data.success) {
//         // Lấy URL avatar từ response
//         const avatarUrl = data.data.avatarUrl;
//         console.log('✅ Avatar URL từ server:', avatarUrl);
        
//         // Tạo object user mới với avatar đã cập nhật
//         const updatedUser = {
//           ...user,
//           profile_image: avatarUrl
//         };
        
//         console.log('🖼️ Cập nhật user state với avatar mới:', updatedUser);
        
//         // Cập nhật state user - điều này sẽ trigger re-render cho cả User.jsx và Header.jsx
//         setUser(updatedUser);
        
//         // Lưu trạng thái user mới vào localStorage/sessionStorage
//         if (rememberMe) {
//           localStorage.setItem('nosmoke_user', JSON.stringify(updatedUser));
//         } else {
//           sessionStorage.setItem('nosmoke_user', JSON.stringify(updatedUser));
//         }
        
//         // Thông báo tới cả application là avatar đã được cập nhật
//         window.dispatchEvent(new CustomEvent('avatar-updated', { 
//           detail: { avatarUrl, userId: user.id || user._id }
//         }));
        
//         return { success: true, avatarUrl };
//       } else {
//         throw new Error(data.message || 'Không thể tải lên avatar');
//       }
//     } catch (err) {
//       console.error('❌ Lỗi khi tải lên avatar:', err);
//       setError(err.message);
//       return { success: false, error: err.message };
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Hàm đổi mật khẩu
//   const changePassword = async (currentPassword, newPassword, confirmPassword) => {
//     if (!user || !token) return { success: false, error: 'Không có người dùng để cập nhật' };

//     try {
//       setLoading(true);
//       const data = await apiCall('/auth/change-password', {
//         method: 'POST',
//         body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
//       });

//       if (data.success) {
//         return { success: true };
//       } else {
//         throw new Error(data.message);
//       }
//     } catch (err) {
//       setError(err.message);
//       return { success: false, error: err.message };
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Hàm refresh thông tin user từ server
//   const refreshUser = async () => {
//     if (!token) return { success: false, error: 'Không có token' };

//     try {
//       console.log('🔄 Refreshing user data from server...');
//       const data = await apiCall('/auth/profile');

//       if (data.success) {
//         console.log('✅ User data refreshed successfully:', data.data);
//         console.log('📋 Key fields:');
//         console.log('- address:', data.data.address);
//         console.log('- age:', data.data.age);
//         console.log('- quit_reason:', data.data.quit_reason);
        
//         // Tạo user object với đầy đủ cả camelCase và snake_case
//         const processedUser = {
//           ...data.data,
//           // Đồng bộ cả 2 kiểu
//           quitReason: data.data.quitReason || data.data.quit_reason,
//           quit_reason: data.data.quitReason || data.data.quit_reason,
//           dateOfBirth: data.data.dateOfBirth || data.data.date_of_birth,
//           date_of_birth: data.data.dateOfBirth || data.data.date_of_birth,
//           fullName: data.data.fullName || data.data.full_name,
//           full_name: data.data.fullName || data.data.full_name
//         };
        
//         // Cập nhật thông tin membership từ backend
//         try {
//           console.log('🔄 Đang lấy thông tin membership khi refresh user...');
          
//           // Import API từ membershipApi.js
//           const membershipApiModule = await import('../utils/membershipApi');
//           const membershipApi = membershipApiModule.default;
          
//           // Gọi API lấy membership hiện tại
//           const membershipResponse = await membershipApi.getCurrentMembership();
          
//           if (membershipResponse.success && membershipResponse.data) {
//             console.log('📊 Thông tin membership từ API:', membershipResponse.data);
            
//             // Lấy giá trị membership dựa trên tên gói
//             let membershipValue = 'free';
//             if (membershipResponse.data.package_name) {
//               const packageName = membershipResponse.data.package_name.toLowerCase();
//               if (packageName.includes('pro')) {
//                 membershipValue = 'pro';
//               } else if (packageName.includes('premium')) {
//                 membershipValue = 'premium';
//               } else if (membershipResponse.data.package_id !== 1) {
//                 membershipValue = 'premium';
//               }
//             }
            
//             console.log('📊 Membership value xác định được:', membershipValue);
            
//             // Cập nhật user với thông tin membership
//             processedUser.membership = membershipValue;
//             processedUser.membershipType = membershipValue;
//             processedUser.packageDetails = membershipResponse.data;
            
//             console.log('✅ Đã cập nhật membership trong refreshUser:', processedUser);
//           }
//         } catch (membershipErr) {
//           console.error('❌ Lỗi khi lấy thông tin membership trong refreshUser:', membershipErr);
//           // Tiếp tục với user data đã có
//         }
        
//         // Cập nhật state và storage
//         setUser(processedUser);
        
//         // Lưu thông tin user vào localStorage hoặc sessionStorage
//         if (rememberMe) {
//           localStorage.setItem('nosmoke_user', JSON.stringify(processedUser));
//         } else {
//           sessionStorage.setItem('nosmoke_user', JSON.stringify(processedUser));
//         }
        
//         // Phát sự kiện để thông báo user đã cập nhật
//         window.dispatchEvent(new CustomEvent('user-updated', { 
//           detail: { user: processedUser }
//         }));
        
//         return { success: true, user: processedUser };
//       } else {
//         throw new Error(data.message);
//       }
//     } catch (err) {
//       // If token is invalid, logout
//       if (err.message.includes('token') || err.message.includes('401')) {
//         logout();
//       }
//       return { success: false, error: err.message };
//     }
//   };

//   // Legacy functions for backward compatibility
//   const refreshMembership = refreshUser;  // Giá trị context
//   const value = {
//     user,
//     loading,
//     error,
//     token,
//     login,
//     logout,
//     register,
//     verifyEmail,
//     resendVerificationCode,
//     updateUser,
//     uploadAvatar, // Thêm function upload avatar
//     changePassword,
//     refreshUser,
//     refreshMembership,
//     setUser,
//     isAuthenticated: !!user && !!token
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// export default AuthContext;


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

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, logout, setUser, isAuthenticated: !!user && !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
