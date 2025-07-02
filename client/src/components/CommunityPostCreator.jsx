import React, { useState, useRef } from 'react';
import { FaImage, FaTrophy, FaCamera, FaTimes, FaSmile, FaHeart, FaComment, FaShare, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import '../styles/CommunityPostCreator.css';

/**
 * Component hiển thị trạng thái rỗng
 */
export const EmptyState = ({ 
  icon = "📝", 
  title = "Chưa có bài viết nào", 
  description = "Hãy là người đầu tiên chia sẻ câu chuyện của bạn!", 
  actionText = "Tạo bài viết đầu tiên",
  onAction 
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {onAction && (
        <button className="empty-state-action" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
};

/**
 * Modal xác nhận xóa bài viết
 */
export const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, title = "Xóa bài viết" }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="delete-confirm-modal">
        <div className="modal-header">
          <div className="modal-icon">
            <FaTrash />
          </div>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-content">
          <h3 className="modal-title">{title}</h3>
          <p className="modal-description">
            Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.
          </p>
        </div>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>
            Hủy
          </button>
          <button className="confirm-btn" onClick={onConfirm}>
            <FaTrash />
            Xóa bài viết
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Component tạo bài viết cộng đồng với hình ảnh và huy hiệu
 */
const CommunityPostCreator = ({ achievements = [], onPostCreated }) => {
  const { user } = useAuth();
  const [postText, setPostText] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedAchievements, setSelectedAchievements] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const fileInputRef = useRef(null);

  // Cảnh báo khi rời trang nếu đang soạn bài
  React.useEffect(() => {
    const hasContent = postText.trim() || selectedImages.length > 0 || selectedAchievements.length > 0;
    
    if (hasContent) {
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = 'Bạn có chắc chắn muốn rời trang? Nội dung bài viết sẽ bị mất.';
        return e.returnValue;
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [postText, selectedImages, selectedAchievements]);  // Lấy danh sách huy hiệu đã đạt được, đảm bảo achievements luôn là mảng
  const earnedAchievements = Array.isArray(achievements) 
    ? achievements.filter(achievement => achievement && achievement.completed === true) 
    : [];

  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setSelectedImages(prev => [...prev, {
            id: Date.now() + Math.random(),
            url: e.target.result,
            file: file
          }]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (imageId) => {
    setSelectedImages(prev => prev.filter(img => img.id !== imageId));
  };

  const toggleAchievement = (achievement) => {
    setSelectedAchievements(prev => {
      const isSelected = prev.find(a => a.id === achievement.id);
      if (isSelected) {
        return prev.filter(a => a.id !== achievement.id);
      } else {
        return [...prev, achievement];
      }
    });
  };
  const handlePostSubmit = () => {
    if (!postText.trim() && selectedImages.length === 0) {
      alert('Vui lòng nhập nội dung hoặc chọn hình ảnh để đăng bài!');
      return;
    }

    const newPost = {
      id: Date.now(),
      user: {
        name: user?.fullName || user?.name || 'Người dùng',
        avatar: user?.avatar || '/image/hero/quit-smoking-2.png',
        id: user?.id
      },
      content: postText,
      images: selectedImages,
      achievements: selectedAchievements,
      timestamp: new Date(),
      likes: 0,
      comments: 0,
      shares: 0,
      likedBy: []  // Thêm mảng likedBy rỗng để tránh lỗi undefined
    };

    // Callback để thông báo bài viết mới được tạo
    if (typeof onPostCreated === 'function') {
      onPostCreated(newPost);
    } else {
      console.error('onPostCreated is not a function:', onPostCreated);
    }

    // Reset form
    setPostText('');
    setSelectedImages([]);
    setSelectedAchievements([]);
    setIsExpanded(false);
    setShowAchievements(false);
  };

  const handleInputFocus = () => {
    setIsExpanded(true);
  };

  return (
    <div className="community-post-creator">
      <div className="post-creator-header">
        <div className="user-avatar">
          <img 
            src={user?.avatar || '/image/hero/quit-smoking-2.png'} 
            alt={user?.fullName || 'User'} 
          />
        </div>
        <div className="post-input-container">
          <textarea
            className="post-input"
            placeholder="Chia sẻ hành trình hôm nay của bạn..."
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            onFocus={handleInputFocus}
            rows={isExpanded ? 4 : 2}
          />
        </div>
      </div>

      {isExpanded && (
        <div className="post-creator-expanded">
          {/* Hiển thị hình ảnh đã chọn */}
          {selectedImages.length > 0 && (
            <div className="selected-images">
              {selectedImages.map(image => (
                <div key={image.id} className="image-preview">
                  <img src={image.url} alt="Preview" />
                  <button 
                    className="remove-image"
                    onClick={() => removeImage(image.id)}
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Hiển thị huy hiệu đã chọn */}
          {selectedAchievements.length > 0 && (
            <div className="selected-achievements">
              <h4>Huy hiệu đã chọn:</h4>
              <div className="achievement-tags">
                {selectedAchievements.map(achievement => (
                  <div key={achievement.id} className="achievement-tag">
                    <span className="achievement-icon">{achievement.icon}</span>
                    <span className="achievement-name">{achievement.name}</span>
                    <button 
                      className="remove-achievement"
                      onClick={() => toggleAchievement(achievement)}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Panel huy hiệu */}
          {showAchievements && (
            <div className="achievements-panel">
              <h4>Chọn huy hiệu để chia sẻ:</h4>
              <div className="achievements-list">
                {earnedAchievements.length > 0 ? (
                  earnedAchievements.map(achievement => (                    <div 
                      key={achievement.id}
                      className={`achievement-item ${selectedAchievements.find(a => a.id === achievement.id) ? 'selected' : ''}`}
                      onClick={() => toggleAchievement(achievement)}
                    >
                      <span className="achievement-icon">{achievement.icon}</span>
                      <div className="achievement-info">
                        <span className="achievement-name">{achievement.name}</span>
                        <span className="achievement-date">{achievement.completed ? "Đã hoàn thành" : ""}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-achievements">Bạn chưa có huy hiệu nào để chia sẻ.</p>
                )}
              </div>
            </div>
          )}

          {/* Toolbar */}
          <div className="post-creator-toolbar">
            <div className="toolbar-left">
              <button 
                className="toolbar-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Thêm hình ảnh"
              >
                <FaImage /> Hình ảnh
              </button>
                <button 
                className="toolbar-btn"
                onClick={() => setShowAchievements(!showAchievements)}
                title={earnedAchievements.length > 0 ? "Chia sẻ huy hiệu" : "Bạn chưa có huy hiệu nào để chia sẻ"}
                disabled={earnedAchievements.length === 0}
              >
                <FaTrophy /> Huy hiệu ({earnedAchievements.length})
              </button>

              <button className="toolbar-btn" title="Thêm cảm xúc">
                <FaSmile /> Cảm xúc
              </button>
            </div>

            <div className="toolbar-right">
              <button 
                className="cancel-btn"
                onClick={() => {
                  setIsExpanded(false);
                  setPostText('');
                  setSelectedImages([]);
                  setSelectedAchievements([]);
                  setShowAchievements(false);
                }}
              >
                Hủy
              </button>
              
              <button 
                className="submit-btn"
                onClick={handlePostSubmit}
                disabled={!postText.trim() && selectedImages.length === 0}
              >
                Đăng bài
              </button>
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />
        </div>
      )}
    </div>
  );
};

export default CommunityPostCreator;
