import React, { useState, useEffect } from "react";
import {
  FaUserAlt,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaTransgender,
  FaCalendarAlt,
  FaLock,
  FaEdit,
  FaSave,
  FaTimes,
  FaCrown,
  FaImage,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/User.css";
import "../styles/AvatarUploader.css";

// Component UserProfile có thể được sử dụng độc lập hoặc nhúng vào các trang khác
const UserProfile = ({ isStandalone = false }) => {
  const { user, updateUser, uploadAvatar, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null); // Lưu file avatar đã chọn
  const [originalAvatar, setOriginalAvatar] = useState(null); // Lưu avatar gốc để phục hồi khi cần

  // Initialize userData from the authenticated user
  useEffect(() => {
    if (user) {
      console.log('🔄 User.jsx - Initializing userData from user:', user);
      
      // Reset avatar error when user changes
      setAvatarError(false);
      
      // Xử lý mapping giữa full_name và name
      const processedUser = { ...user };
      
      // Nếu có full_name trong user nhưng không có name, gán full_name cho name
      if (user.full_name && !user.name) {
        processedUser.name = user.full_name;
      } else if (user.fullName && !user.name) {
        processedUser.name = user.fullName;
      }
      
      // Tương tự với các trường khác
      if (user.date_of_birth && !user.dateOfBirth) {
        processedUser.dateOfBirth = user.date_of_birth;
      } else if (user.dateOfBirth && !user.date_of_birth) {
        processedUser.date_of_birth = user.dateOfBirth;
      }
      
      if (user.quit_reason && !user.quitReason) {
        processedUser.quitReason = user.quit_reason;
      } else if (user.quitReason && !user.quit_reason) {
        processedUser.quit_reason = user.quitReason;
      }
      
      // Đảm bảo đồng bộ membership và membershipType
      if (user.membership && (!user.membershipType || user.membershipType !== user.membership)) {
        processedUser.membershipType = user.membership;
      } else if (user.membershipType && (!user.membership || user.membership !== user.membershipType)) {
        processedUser.membership = user.membershipType;
      }

      // Đảm bảo xử lý role và membership đồng bộ với nhau
      if (user.role === 'premium' || user.role === 'pro') {
        // Nếu user có role premium hoặc pro, nhưng membership không phù hợp, cập nhật membership
        if (!processedUser.membership || processedUser.membership === 'free') {
          processedUser.membership = user.role;
          processedUser.membershipType = user.role;
        }
      }
      
      // Đảm bảo age và address cũng được sao chép
      processedUser.age = user.age !== undefined ? user.age : null;
      processedUser.address = user.address || "";
      
      // Log dữ liệu quan trọng để debug
      console.log('📊 User.jsx - Processed User Data:', {
        name: processedUser.name,
        quitReason: processedUser.quitReason,
        age: processedUser.age,
        address: processedUser.address,
        profile_image: processedUser.profile_image,
        membership: processedUser.membership,
        membershipType: processedUser.membershipType,
        role: processedUser.role
      });
      
      setUserData(processedUser);
      console.log('📊 Processed user data:', processedUser);
    }
  }, [user]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle avatar change - chỉ lưu preview và file, không upload ngay
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setErrorMessage("");
      setAvatarError(false); // Reset avatar error khi có file mới
      
      // Lưu avatar gốc nếu chưa được lưu (chỉ lưu lần đầu khi thay đổi)
      if (!originalAvatar && userData.profile_image) {
        setOriginalAvatar(userData.profile_image);
      }
      
      // Kiểm tra kích thước và loại file
      if (file.size > 5 * 1024 * 1024) { // giới hạn 5MB
        setErrorMessage("Kích thước file quá lớn. Vui lòng chọn file nhỏ hơn 5MB.");
        return;
      }
      
      // Kiểm tra loại file
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrorMessage("Loại file không hợp lệ. Chỉ chấp nhận JPEG, PNG, GIF hoặc WEBP.");
        return;
      }
      
      // Lưu file để upload sau khi người dùng nhấn "Lưu"
      setSelectedAvatarFile(file);
      
      // Show local preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserData((prev) => ({
          ...prev,
          avatar: e.target.result
        }));
      };
      reader.readAsDataURL(file);
      
      console.log("🖼️ Đã chọn avatar mới, đợi người dùng xác nhận lưu...");
    } catch (error) {
      console.error("❌ Lỗi khi xử lý avatar:", error);
      setErrorMessage("Đã xảy ra lỗi khi xử lý ảnh đại diện: " + (error.message || "Lỗi không xác định"));
    }
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditing) {
      // Cancel editing and revert changes
      setUserData({ ...user });
      
      // Reset avatar changes
      setSelectedAvatarFile(null);
      setAvatarError(false);
      
      if (originalAvatar) {
        // Khôi phục avatar gốc nếu đã lưu
        setUserData(prev => ({
          ...prev,
          profile_image: originalAvatar,
          avatar: null // Xóa avatar preview
        }));
      } else if (user && user.profile_image) {
        // Khôi phục từ user object nếu không có originalAvatar
        setUserData(prev => ({
          ...prev,
          profile_image: user.profile_image,
          avatar: null
        }));
      } else {
        // Nếu không có avatar nào, đảm bảo xóa hết để hiển thị avatar mặc định
        setUserData(prev => ({
          ...prev,
          profile_image: null,
          avatar: null
        }));
      }
      
      setOriginalAvatar(null);
    } else {
      // Entering edit mode, save original avatar for potential restore
      setOriginalAvatar(userData.profile_image || null);
    }
    
    setIsEditing(!isEditing);
    setSuccessMessage("");
    setErrorMessage("");
  };

  // We're using uploadAvatar directly from AuthContext, no need for a wrapper function

  // Validate form fields
  const validateForm = () => {
    const errors = {};
    
    // Validate phone number (if provided)
    if (userData.phone && !/^[0-9]{10}$/.test(userData.phone)) {
      errors.phone = "Số điện thoại phải có đúng 10 chữ số";
    }
    
    // Validate name (required)
    if (!userData.name || userData.name.trim() === "") {
      errors.name = "Họ tên không được để trống";
    }
    
    // Validate age (if provided)
    if (userData.age && (isNaN(userData.age) || userData.age < 0 || userData.age > 120)) {
      errors.age = "Tuổi phải là số hợp lệ từ 0-120";
    }
    
    // Validate dateOfBirth (if provided)
    if (userData.dateOfBirth) {
      const birthDate = new Date(userData.dateOfBirth);
      const today = new Date();
      if (birthDate > today) {
        errors.dateOfBirth = "Ngày sinh không thể là ngày trong tương lai";
      }
    }
    
    // Validate address (if provided)
    if (userData.address && userData.address.length > 255) {
      errors.address = "Địa chỉ không được vượt quá 255 ký tự";
    }
    
    // Validate quitReason (if provided)
    if (userData.quitReason && userData.quitReason.length > 500) {
      errors.quitReason = "Lý do cai thuốc không được vượt quá 500 ký tự";
    }
    
    // Validate password (if provided - optional field)
    if (userData.password && userData.password.length < 8) {
      errors.password = "Mật khẩu phải có ít nhất 8 ký tự";
    }
    
    // Set errors and return validation result
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save user data changes
  const saveChanges = async () => {
    // First validate form
    if (!validateForm()) {
      setErrorMessage("Vui lòng kiểm tra lại thông tin đã nhập");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setErrorMessage("");
      
      // Prepare data for submission
      const dataToSubmit = { ...userData };
      console.log('📝 Preparing data to submit:', dataToSubmit);
      
      // Không cần chuyển đổi từ camelCase sang snake_case cho backend nữa
      // AuthContext đã xử lý việc này

      // Xóa các trường không cần thiết
      if (!dataToSubmit.password) {
        delete dataToSubmit.password;
      }
      
      // Xóa các trường không thay đổi để giảm lượng dữ liệu gửi đi
      const fieldsToCompare = ['name', 'email', 'phone', 'age', 'gender', 'address', 'dateOfBirth', 'quitReason'];
      const dataToUpdate = {};
      
      fieldsToCompare.forEach(field => {
        // Nếu trường này có thay đổi, thêm vào dữ liệu cập nhật
        if (dataToSubmit[field] !== user[field]) {
          dataToUpdate[field] = dataToSubmit[field];
        }
      });
      
      // Kiểm tra nếu có file avatar mới được chọn
      let avatarUploaded = false;
      let avatarUrl = null;
      
      if (selectedAvatarFile) {
        console.log('�️ Phát hiện avatar mới, bắt đầu tải lên...');
        setIsUploading(true);
        try {
          // Upload avatar trước
          const avatarResult = await uploadAvatar(selectedAvatarFile);
          if (avatarResult.success) {
            avatarUploaded = true;
            avatarUrl = avatarResult.avatarUrl;
            console.log('✅ Avatar đã được tải lên thành công:', avatarUrl);
          } else {
            throw new Error(avatarResult.error || 'Không thể tải lên avatar');
          }
        } catch (avatarError) {
          console.error('❌ Lỗi khi tải lên avatar:', avatarError);
          setErrorMessage('Lỗi khi tải lên avatar: ' + (avatarError.message || 'Lỗi không xác định'));
          setIsUploading(false);
          return;
        } finally {
          setIsUploading(false);
        }
      }
      
      console.log('�📊 Final data to update:', dataToUpdate);
      
      // Kiểm tra xem có dữ liệu để cập nhật không (bao gồm cả avatar)
      if (Object.keys(dataToUpdate).length === 0 && !avatarUploaded) {
        setSuccessMessage("Không có thông tin nào thay đổi");
        setIsEditing(false);
        setTimeout(() => setSuccessMessage(""), 3000);
        return;
      }
      
      let result = { success: true };
      
      // Chỉ gọi updateUser nếu có dữ liệu cần cập nhật
      if (Object.keys(dataToUpdate).length > 0) {
        result = await updateUser(dataToUpdate);
      }
      
      if (result && result.success) {
        // Reset trạng thái avatar
        setSelectedAvatarFile(null);
        setOriginalAvatar(null);
        
        // Cập nhật userData với avatar mới nếu có
        if (avatarUploaded && avatarUrl) {
          setUserData(prev => ({
            ...prev,
            profile_image: avatarUrl,
            avatar: null // xóa preview avatar
          }));
        }
        
        setSuccessMessage(result.message || "Thông tin đã được cập nhật thành công.");
        setIsEditing(false);
        setValidationErrors({});

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } else {
        setErrorMessage(result?.error || "Có lỗi xảy ra khi cập nhật thông tin.");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);
      setErrorMessage(error?.message || "Có lỗi xảy ra khi cập nhật thông tin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lắng nghe sự kiện membership-updated từ API
  useEffect(() => {
    const handleMembershipUpdate = (event) => {
      if (event.detail && event.detail.membership) {
        console.log('User.jsx - Membership update event received:', event.detail);
        
        // Cập nhật userData với thông tin membership mới
        setUserData(prev => ({
          ...prev,
          membership: event.detail.membership,
          membershipType: event.detail.membership,
          packageDetails: event.detail.packageDetails
        }));
      }
    };
    
    // Đăng ký lắng nghe sự kiện
    window.addEventListener('membership-updated', handleMembershipUpdate);
    
    // Hủy đăng ký khi component unmount
    return () => {
      window.removeEventListener('membership-updated', handleMembershipUpdate);
    };
  }, []);

  // Lắng nghe sự kiện user-updated từ AuthContext
  useEffect(() => {
    const handleUserUpdate = (event) => {
      if (event.detail && event.detail.user) {
        console.log('User.jsx - User update event received:', event.detail);
        
        // Xử lý dữ liệu user mới
        const updatedUser = event.detail.user;
        const processedUser = { ...updatedUser };
        
        // Đảm bảo đồng bộ các trường cần thiết
        if (updatedUser.full_name && !updatedUser.name) {
          processedUser.name = updatedUser.full_name;
        }
        
        if (updatedUser.date_of_birth && !updatedUser.dateOfBirth) {
          processedUser.dateOfBirth = updatedUser.date_of_birth;
        }
        
        if (updatedUser.quit_reason && !updatedUser.quitReason) {
          processedUser.quitReason = updatedUser.quit_reason;
        }
        
        // Đảm bảo đồng bộ membership và membershipType
        if (updatedUser.membership && (!updatedUser.membershipType || updatedUser.membershipType !== updatedUser.membership)) {
          processedUser.membershipType = updatedUser.membership;
        } else if (updatedUser.membershipType && (!updatedUser.membership || updatedUser.membership !== updatedUser.membershipType)) {
          processedUser.membership = updatedUser.membershipType;
        }
        
        // Đảm bảo xử lý role và membership đồng bộ với nhau
        if (updatedUser.role === 'premium' || updatedUser.role === 'pro') {
          // Nếu user có role premium hoặc pro, nhưng membership không phù hợp, cập nhật membership
          if (!processedUser.membership || processedUser.membership === 'free') {
            processedUser.membership = updatedUser.role;
            processedUser.membershipType = updatedUser.role;
          }
        }
        
        // Cập nhật userData
        setUserData(processedUser);
      }
    };
    
    // Đăng ký lắng nghe sự kiện
    window.addEventListener('user-updated', handleUserUpdate);
    
    // Hủy đăng ký khi component unmount
    return () => {
      window.removeEventListener('user-updated', handleUserUpdate);
    };
  }, []);

  // Tự động lấy thông tin membership từ backend khi component mount
  useEffect(() => {
    const fetchMembership = async () => {
      if (user && user.id) {
        try {
          console.log('User.jsx - Fetching membership data from backend...');
          
          // Import API từ membershipApi.js
          const membershipApiModule = await import('../utils/membershipApi');
          const membershipApi = membershipApiModule.default;
          
          // Gọi API lấy membership hiện tại
          const response = await membershipApi.getCurrentMembership();
          console.log('User.jsx - Membership API response:', response);
          
          if (response.success && response.data) {
            // Xác định membership value từ tên gói
            let membershipValue = 'free';
            if (response.data.package_name) {
              const packageName = response.data.package_name.toLowerCase();
              if (packageName.includes('pro')) {
                membershipValue = 'pro';
              } else if (packageName.includes('premium')) {
                membershipValue = 'premium';
              } else if (response.data.package_id !== 1) {
                membershipValue = 'premium';
              }
            }
            
            console.log('User.jsx - Membership value determined:', membershipValue);
            
            // Kiểm tra nếu user có role premium hoặc pro
            if (user?.role === 'premium' || user?.role === 'pro') {
              if (membershipValue === 'free') {
                membershipValue = user.role;
              }
            }
            
            // Cập nhật userData với thông tin membership mới
            setUserData(prev => {
              const updatedData = {
                ...prev,
                membership: membershipValue,
                membershipType: membershipValue,
                packageDetails: response.data
              };
              
              // Đảm bảo role được đồng bộ nếu có
              if (user?.role && (user.role === 'premium' || user.role === 'pro')) {
                updatedData.role = user.role;
              }
              
              return updatedData;
            });
          }
        } catch (error) {
          console.error('User.jsx - Error fetching membership:', error);
        }
      }
    };
    
    fetchMembership();
  }, [user]);

  // If no user data is available, show loading state
  if (!user) {
    return <div className="loading-container">Đang tải...</div>;
  } return (
    <div className="user-profile-container">
      <div className="user-profile-header">
        <h1>Thông tin cá nhân</h1>
        {!isEditing ? (
          <button className="edit-button" onClick={toggleEditMode}>
            <FaEdit /> Chỉnh sửa
          </button>
        ) : (
          <div className="editing-buttons">
            <button 
              className="save-button" 
              onClick={saveChanges} 
              disabled={isSubmitting || loading}
            >
              {isSubmitting || loading ? (
                <>
                  <FaSpinner className="loading-spinner" /> Đang lưu...
                </>
              ) : (
                <>
                  <FaSave /> Lưu
                </>
              )}
            </button>
            <button 
              className="cancel-button" 
              onClick={toggleEditMode} 
              disabled={isSubmitting || loading}
            >
              <FaTimes /> Hủy
            </button>
          </div>
        )}
      </div>

      {successMessage && (
        <div className="success-message animate-feedback">
          <FaCheckCircle /> {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="error-message animate-feedback">
          <FaExclamationTriangle /> {errorMessage}
        </div>
      )}
      
      {(isSubmitting || loading) && (
        <div className="loading-message animate-feedback">
          <FaSpinner className="loading-spinner" /> Đang xử lý, vui lòng đợi...
        </div>
      )}        <div className="avatar-info-layout">
        <div className="avatar-section">
          <div className="avatar-container">
          {(userData.avatar || userData.profile_image) && !avatarError ? (
            <img
              key={userData.avatar || userData.profile_image}
              src={
                userData.avatar || 
                (userData.profile_image && userData.profile_image.startsWith('http') 
                  ? userData.profile_image 
                  : userData.profile_image && userData.profile_image.startsWith('/')
                    ? `http://localhost:5000${userData.profile_image}`
                    : userData.profile_image || '/default-user-avatar.svg')
              }
              alt="Ảnh đại diện"
              className={`user-avatar ${isUploading ? 'avatar-uploading' : ''}`}
              onError={(e) => {
                console.error("Không thể tải avatar:", e);
                setAvatarError(true);
                
                // Thử tải avatar mặc định nếu có lỗi
                if (!userData.avatar) {
                  e.target.onerror = null; // Tránh loop vô hạn
                  e.target.src = '/image/default-user-avatar.svg'; // Đường dẫn tới avatar mặc định
                }
              }}
            />
          ) : (
            <div className="user-avatar-placeholder">
              <FaUserAlt />
            </div>
          )}

          {isEditing && (
            <div className="avatar-edit">
              <label htmlFor="avatar-input" className="avatar-edit-button" style={{ cursor: isUploading ? 'wait' : 'pointer' }}>
                {isUploading ? 'Đang tải...' : <FaImage />}
              </label>
              <input
                type="file"
                id="avatar-input"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={isUploading}
                style={{ display: "none" }}
              />
            </div>
          )}
          {/* Hiển thị ID người dùng dưới avatar - Hiển thị đầy đủ các ID có thể có */}
          <div className="user-id">
            ID: {userData._id || userData.id || user?._id || user?.id || "N/A"}
          </div>

          {/* Hiển thị nhãn thành viên - kiểm tra nhiều nguồn dữ liệu */}
          {(() => {
            // Xác định membership từ các nguồn khác nhau
            const membershipValue = 
              userData.membership || 
              userData.membershipType || 
              user?.membership || 
              user?.membershipType || 
              (localStorage.getItem('nosmoke_user') ? 
                JSON.parse(localStorage.getItem('nosmoke_user'))?.membership : null) ||
              (sessionStorage.getItem('nosmoke_user') ? 
                JSON.parse(sessionStorage.getItem('nosmoke_user'))?.membership : null);
            
            // Kiểm tra nếu user có role premium hoặc pro
            const userRole = 
              userData.role || 
              user?.role || 
              (localStorage.getItem('nosmoke_user') ? 
                JSON.parse(localStorage.getItem('nosmoke_user'))?.role : null) ||
              (sessionStorage.getItem('nosmoke_user') ? 
                JSON.parse(sessionStorage.getItem('nosmoke_user'))?.role : null);
                
            // Xác định membership từ role nếu không có membership
            let finalMembership = membershipValue;
            if (!finalMembership || finalMembership === 'free') {
              if (userRole === 'premium' || userRole === 'pro') {
                finalMembership = userRole;
              }
            }
                
            // Chỉ hiển thị khi có membership và khác free
            if (finalMembership && finalMembership !== 'free') {
              return (
                <div className={`membership-badge ${finalMembership}`}>
                  <FaCrown /> {finalMembership === 'premium' ? 'Premium' : 'Pro'}
                </div>
              );
            }
            return null;
          })()}
        </div>
      </div>

        <div className="info-section">
          {/* Thông tin cơ bản */}
          <div className="profile-section basic-info">
            <h2>Thông tin cơ bản</h2>
            <div className={`info-field ${validationErrors.name ? 'field-error' : ''}`}>
              <label><FaUserAlt /> Họ và tên <span className="required-field">*</span></label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    name="name"
                    value={userData.name || ""}
                    onChange={handleChange}
                    placeholder="Nhập họ tên"
                    className={validationErrors.name ? 'input-error' : ''}
                  />
                  {validationErrors.name && (
                    <div className="field-error-message">{validationErrors.name}</div>
                  )}
                </>
              ) : (
                <p>{userData.name || "Chưa cập nhật"}</p>
              )}
            </div>

            <div className={`info-field ${validationErrors.age ? 'field-error' : ''}`}>
              <label><FaCalendarAlt /> Tuổi</label>
              {isEditing ? (
                <>
                  <input
                    type="number"
                    name="age"
                    value={userData.age || ""}
                    onChange={handleChange}
                    placeholder="Nhập tuổi"
                    className={validationErrors.age ? 'input-error' : ''}
                    min="0" 
                    max="120"
                  />
                  {validationErrors.age && (
                    <div className="field-error-message">{validationErrors.age}</div>
                  )}
                </>
              ) : (
                <p>{userData.age || "Chưa cập nhật"}</p>
              )}
            </div>            <div className="info-field">
              <label><FaTransgender /> Giới tính</label>
              {isEditing ? (
                <select
                  name="gender"
                  value={userData.gender || ""}
                  onChange={handleChange}
                >
                  <option value="">-- Chọn giới tính --</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              ) : (
                <p>{userData.gender === "male" ? "Nam" : userData.gender === "female" ? "Nữ" : userData.gender === "other" ? "Khác" : "Chưa cập nhật"}</p>
              )}
            </div>

            <div className={`info-field ${validationErrors.dateOfBirth ? 'field-error' : ''}`}>
              <label><FaCalendarAlt /> Ngày sinh</label>
              {isEditing ? (
                <>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={userData.dateOfBirth || ""}
                    onChange={handleChange}
                    placeholder="Chọn ngày sinh"
                    className={validationErrors.dateOfBirth ? 'input-error' : ''}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {validationErrors.dateOfBirth && (
                    <div className="field-error-message">{validationErrors.dateOfBirth}</div>
                  )}
                </>
              ) : (
                <p>{userData.dateOfBirth ? new Date(userData.dateOfBirth).toLocaleDateString("vi-VN") : "Chưa cập nhật"}</p>
              )}
            </div>
          </div>

          {/* Thông tin liên hệ */}
          <div className="profile-section contact-section">
            <h2>Thông tin liên hệ</h2>

            <div className={`info-field ${validationErrors.address ? 'field-error' : ''}`}>
              <label><FaMapMarkerAlt /> Địa chỉ</label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    name="address"
                    value={userData.address || ""}
                    onChange={handleChange}
                    placeholder="Nhập địa chỉ"
                    className={validationErrors.address ? 'input-error' : ''}
                    maxLength={255}
                  />
                  {validationErrors.address && (
                    <div className="field-error-message">{validationErrors.address}</div>
                  )}
                </>
              ) : (
                <p>{userData.address || "Chưa cập nhật"}</p>
              )}
            </div>

            <div className="info-field">
              <label><FaEnvelope /> Email</label>
              <p><strong>{userData.email}</strong></p>
              <small className="field-note">Email không thể thay đổi</small>
            </div>

            <div className={`info-field ${validationErrors.phone ? 'field-error' : ''}`}>
              <label><FaPhone /> Số điện thoại</label>
              {isEditing ? (
                <>
                  <input
                    type="tel"
                    name="phone"
                    value={userData.phone || ""}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại (10 chữ số)"
                    className={validationErrors.phone ? 'input-error' : ''}
                    pattern="[0-9]{10}"
                  />
                  {validationErrors.phone && (
                    <div className="field-error-message">{validationErrors.phone}</div>
                  )}
                </>
              ) : (
                <p>{userData.phone || "Chưa cập nhật"}</p>
              )}
            </div>
          </div>

          {/* Bảo mật */}
          <div className="profile-section security-section">
            <h2>Bảo mật</h2>

            <div className={`info-field ${validationErrors.password ? 'field-error' : ''}`}>
              <label><FaLock /> Mật khẩu</label>
              {isEditing ? (
                <>
                  <input
                    type="password"
                    name="password"
                    value={userData.password || ""}
                    onChange={handleChange}
                    placeholder="Nhập mật khẩu mới hoặc để trống"
                    className={validationErrors.password ? 'input-error' : ''}
                    minLength="8"
                  />
                  {validationErrors.password ? (
                    <div className="field-error-message">{validationErrors.password}</div>
                  ) : (
                    <small className="field-note">Để trống nếu không muốn thay đổi mật khẩu</small>
                  )}
                </>
              ) : (
                <p className="censored-field">••••••••</p>
              )}
            </div>
          </div>

          {/* Lý do cai thuốc */}
          <div className="profile-section quit-reason-section">
            <h2>Lý do cai thuốc</h2>

            <div className={`info-field quit-reason-field ${validationErrors.quitReason ? 'field-error' : ''}`}>
              {isEditing ? (
                <>
                  <textarea
                    name="quitReason"
                    value={userData.quitReason || ""}
                    onChange={handleChange}
                    placeholder="Nhập lý do bạn muốn cai thuốc lá"
                    rows={3}
                    className={validationErrors.quitReason ? 'input-error' : ''}
                    maxLength={500}
                  />
                  {validationErrors.quitReason && (
                    <div className="field-error-message">{validationErrors.quitReason}</div>
                  )}
                </>
              ) : (
                <p className="quit-reason-text">{userData.quitReason || "Chưa cập nhật"}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;