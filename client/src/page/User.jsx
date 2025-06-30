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

  // Initialize userData from the authenticated user
  useEffect(() => {
    if (user) {
      console.log('🔄 User.jsx - Initializing userData from user:', user);
      
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
      
      // Đảm bảo age và address cũng được sao chép
      processedUser.age = user.age !== undefined ? user.age : null;
      processedUser.address = user.address || "";
      
      // Log dữ liệu quan trọng để debug
      console.log('📊 User.jsx - Processed User Data:', {
        name: processedUser.name,
        quitReason: processedUser.quitReason,
        age: processedUser.age,
        address: processedUser.address,
        profile_image: processedUser.profile_image
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

  // Handle avatar change
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      setErrorMessage("");
      
      // Kiểm tra kích thước và loại file
      if (file.size > 5 * 1024 * 1024) { // giới hạn 5MB
        setErrorMessage("Kích thước file quá lớn. Vui lòng chọn file nhỏ hơn 5MB.");
        setIsUploading(false);
        return;
      }
      
      // Kiểm tra loại file
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrorMessage("Loại file không hợp lệ. Chỉ chấp nhận JPEG, PNG, GIF hoặc WEBP.");
        setIsUploading(false);
        return;
      }
      
      // Show local preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserData((prev) => ({
          ...prev,
          avatar: e.target.result
        }));
      };
      reader.readAsDataURL(file);
      
      console.log("🖼️ Bắt đầu tải lên avatar mới...");
      
      // Upload to server sử dụng trực tiếp uploadAvatar từ AuthContext
      const result = await uploadAvatar(file);
      
      if (result.success) {
        console.log("✅ Tải lên avatar thành công:", result.avatarUrl);
        
        // Cập nhật userData với profile_image mới từ kết quả
        setUserData(prev => ({
          ...prev,
          profile_image: result.avatarUrl,
          // Xóa preview local vì đã có URL thật từ server
          avatar: null
        }));
        
        // Thêm class hiệu ứng cập nhật thành công
        const avatarElement = document.querySelector('.user-avatar');
        if (avatarElement) {
          avatarElement.classList.add('avatar-update-success');
          
          // Xóa class sau khi animation hoàn thành
          setTimeout(() => {
            avatarElement.classList.remove('avatar-update-success');
          }, 1000);
        }
        
        setSuccessMessage("Avatar đã được cập nhật thành công");
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } else {
        console.error("❌ Lỗi tải lên avatar:", result.error);
        setErrorMessage("Không thể tải lên ảnh đại diện: " + (result.error || "Lỗi không xác định"));
      }
    } catch (error) {
      console.error("❌ Lỗi khi tải lên avatar:", error);
      setErrorMessage("Đã xảy ra lỗi khi tải lên ảnh đại diện: " + (error.message || "Lỗi không xác định"));
    } finally {
      setIsUploading(false);
    }
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditing) {
      // Cancel editing and revert changes
      setUserData({ ...user });
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
      
      console.log('📊 Final data to update:', dataToUpdate);
      
      // Kiểm tra xem có dữ liệu để cập nhật không
      if (Object.keys(dataToUpdate).length === 0) {
        setSuccessMessage("Không có thông tin nào thay đổi");
        setIsEditing(false);
        setTimeout(() => setSuccessMessage(""), 3000);
        return;
      }
      
      const result = await updateUser(dataToUpdate);
      
      if (result && result.success) {
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
      )}        <div className="avatar-info-layout">        <div className="avatar-section">
        <div className="avatar-container">
          {userData.avatar || userData.profile_image ? (
            <img
              key={userData.avatar || userData.profile_image} // Key helps React recognize when to re-render
              src={
                userData.avatar || 
                (userData.profile_image && userData.profile_image.startsWith('http') 
                  ? userData.profile_image 
                  : `http://localhost:5000${userData.profile_image || ''}`)
              }
              alt="Ảnh đại diện"
              className={`user-avatar ${isUploading ? 'avatar-uploading' : ''}`}
              onError={(e) => {
                console.error("Không thể tải avatar:", e);
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = `<div class="user-avatar-placeholder"><FaUserAlt /></div>`;
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
          {/* Hiển thị ID người dùng dưới avatar */}
          <div className="user-id">
            ID: {userData._id || userData.id || "N/A"}
          </div>

          {userData.membershipType && userData.membershipType !== 'free' && (
            <div className={`membership-badge ${userData.membershipType}`}>
              <FaCrown /> {userData.membershipType === 'premium' ? 'Premium' : 'Pro'}
            </div>
          )}
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