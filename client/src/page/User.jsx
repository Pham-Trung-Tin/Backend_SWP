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
  FaCheckCircle
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/User.css";

// Component UserProfile có thể được sử dụng độc lập hoặc nhúng vào các trang khác
const UserProfile = ({ isStandalone = false }) => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Initialize userData from the authenticated user
  useEffect(() => {
    if (user) {
      setUserData({ ...user });
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
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserData((prev) => ({
          ...prev,
          avatar: e.target.result
        }));
      };
      reader.readAsDataURL(file);
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

  // Save user data changes
  const saveChanges = async () => {
    try {
      const result = await updateUser(userData);
      if (result && result.success) {
        setSuccessMessage("Thông tin đã được cập nhật thành công.");
        setIsEditing(false);

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } else {
        setErrorMessage("Có lỗi xảy ra khi cập nhật thông tin.");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);
      setErrorMessage("Có lỗi xảy ra khi cập nhật thông tin.");
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
            <button className="save-button" onClick={saveChanges}>
              <FaSave /> Lưu
            </button>
            <button className="cancel-button" onClick={toggleEditMode}>
              <FaTimes /> Hủy
            </button>
          </div>
        )}
      </div>

      {successMessage && (
        <div className="success-message">
          <FaCheckCircle /> {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="error-message">
          <FaTimes /> {errorMessage}
        </div>
      )}        <div className="avatar-info-layout">        <div className="avatar-section">
        <div className="avatar-container">
          {userData.avatar ? (
            <img
              src={userData.avatar}
              alt="Ảnh đại diện"
              className="user-avatar"
            />
          ) : (
            <div className="user-avatar-placeholder">
              <FaUserAlt />
            </div>
          )}

          {isEditing && (
            <div className="avatar-edit">
              <label htmlFor="avatar-input" className="avatar-edit-button">
                <FaImage />
              </label>
              <input
                type="file"
                id="avatar-input"
                accept="image/*"
                onChange={handleAvatarChange}
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
            <div className="info-field">
              <label><FaUserAlt /> Họ và tên</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={userData.name || ""}
                  onChange={handleChange}
                  placeholder="Nhập họ tên"
                />
              ) : (
                <p>{userData.name || "Chưa cập nhật"}</p>
              )}
            </div>

            <div className="info-field">
              <label><FaCalendarAlt /> Tuổi</label>
              {isEditing ? (
                <input
                  type="number"
                  name="age"
                  value={userData.age || ""}
                  onChange={handleChange}
                  placeholder="Nhập tuổi"
                />
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

            <div className="info-field">
              <label><FaCalendarAlt /> Ngày sinh</label>
              {isEditing ? (
                <input
                  type="date"
                  name="dateOfBirth"
                  value={userData.dateOfBirth || ""}
                  onChange={handleChange}
                  placeholder="Chọn ngày sinh"
                />
              ) : (
                <p>{userData.dateOfBirth ? new Date(userData.dateOfBirth).toLocaleDateString("vi-VN") : "Chưa cập nhật"}</p>
              )}
            </div>
          </div>

          {/* Thông tin liên hệ */}
          <div className="profile-section contact-section">
            <h2>Thông tin liên hệ</h2>

            <div className="info-field">
              <label><FaMapMarkerAlt /> Địa chỉ</label>
              {isEditing ? (
                <input
                  type="text"
                  name="address"
                  value={userData.address || ""}
                  onChange={handleChange}
                  placeholder="Nhập địa chỉ"
                />
              ) : (
                <p>{userData.address || "Chưa cập nhật"}</p>
              )}
            </div>

            <div className="info-field">
              <label><FaEnvelope /> Email</label>
              <p><strong>{userData.email}</strong></p>
              <small className="field-note">Email không thể thay đổi</small>
            </div>

            <div className="info-field">
              <label><FaPhone /> Số điện thoại</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={userData.phone || ""}
                  onChange={handleChange}
                  placeholder="Nhập số điện thoại"
                />
              ) : (
                <p>{userData.phone || "Chưa cập nhật"}</p>
              )}
            </div>
          </div>

          {/* Bảo mật */}
          <div className="profile-section security-section">
            <h2>Bảo mật</h2>

            <div className="info-field">
              <label><FaLock /> Mật khẩu</label>
              {isEditing ? (
                <input
                  type="password"
                  name="password"
                  value={userData.password || ""}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu mới"
                />
              ) : (
                <p className="censored-field">••••••••</p>
              )}
            </div>
          </div>

          {/* Lý do cai thuốc */}
          <div className="profile-section quit-reason-section">
            <h2>Lý do cai thuốc</h2>

            <div className="info-field quit-reason-field">
              {isEditing ? (
                <textarea
                  name="quitReason"
                  value={userData.quitReason || ""}
                  onChange={handleChange}
                  placeholder="Nhập lý do bạn muốn cai thuốc lá"
                  rows={3}
                />
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