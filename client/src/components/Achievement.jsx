import React, { useState, useEffect, useRef } from "react";
import { FaTrophy, FaShare, FaFacebook, FaTwitter, FaCopy, FaTimes } from "react-icons/fa";
import "../styles/Achievement.css";
import { useMembership } from "../context/MembershipContext";
import RequireMembership from "./RequireMembership";

const Achievement = ({ achievements, title = "Huy hiệu đã đạt", showViewAll = true }) => {
  const [showShareMenu, setShowShareMenu] = useState(null);
  const [shareStatus, setShareStatus] = useState({ show: false, message: '' });
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  const [displayedAchievements, setDisplayedAchievements] = useState(achievements);
  const { membershipTiers, currentMembership } = useMembership();
  
  const shareMenuRef = useRef(null);
  
  // Cập nhật danh sách huy hiệu hiển thị khi có thay đổi
  useEffect(() => {
    setDisplayedAchievements(achievements);
  }, [achievements]);
  
  // Đóng menu share khi nhấn ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
        setShowShareMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Đóng thông báo chia sẻ sau 3 giây
  useEffect(() => {
    if (shareStatus.show) {
      const timer = setTimeout(() => {
        setShareStatus({ show: false, message: '' });
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [shareStatus]);
  
  // Hiển thị thông báo chia sẻ thành công
  const showShareNotification = (message) => {
    setShareStatus({
      show: true,
      message: message
    });
  };
  
  // Hàm để chia sẻ huy hiệu đạt được
  const handleShareAchievement = (achievement, platform = null) => {
    // Đóng menu chia sẻ
    setShowShareMenu(null);
    
    // Tạo nội dung chia sẻ
    const shareContent = `
🏆 Tôi đã đạt được huy hiệu "${achievement.name}" trong hành trình cai thuốc lá!
📅 Ngày đạt được: ${achievement.date}
💪 Hãy tham gia cùng tôi trong hành trình hướng tới một cuộc sống khỏe mạnh hơn!
    `;
    
    // Xử lý chia sẻ dựa trên nền tảng được chọn
    if (platform === 'facebook') {
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareContent)}`;
      window.open(facebookUrl, '_blank');
      showShareNotification('Đã mở cửa sổ chia sẻ Facebook');
    } 
    else if (platform === 'twitter') {
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareContent)}`;
      window.open(twitterUrl, '_blank');
      showShareNotification('Đã mở cửa sổ chia sẻ Twitter');
    }
    else if (platform === 'copy') {
      try {
        navigator.clipboard.writeText(shareContent);
        showShareNotification('Đã sao chép thông tin huy hiệu!');
      } catch (err) {
        console.log('Lỗi khi sao chép vào clipboard:', err);
        showShareNotification('Không thể sao chép tự động.');
      }
    }
    else if (platform === null && navigator.share) {
      // Sử dụng Web Share API nếu có sẵn
      navigator.share({
        title: `Huy hiệu: ${achievement.name}`,
        text: shareContent,
      })
      .then(() => showShareNotification('Đã chia sẻ thành công!'))
      .catch((error) => {
        console.log('Lỗi khi chia sẻ:', error);
        showShareNotification('Không thể chia sẻ. Vui lòng thử lại.');
      });
    } 
    else if (platform === null) {
      // Fallback cho các trình duyệt không hỗ trợ Web Share API
      // Hiển thị menu chia sẻ tùy chỉnh
      setShowShareMenu(achievement.id);
    }
  };

  // Đóng menu chia sẻ
  const closeShareMenu = (e) => {
    e.stopPropagation();
    setShowShareMenu(null);
  };
  
  // Xử lý hiển thị tất cả huy hiệu
  const handleViewAllAchievements = () => {
    // Mở modal hiển thị tất cả huy hiệu
    setShowAllAchievements(true);
  };

  // Content component
  const AchievementContent = () => (
    <div className="achievements-section">
      <h1 style={{ color: "#333", fontWeight: "700" }}>{title}</h1>

      {shareStatus.show && (
        <div className="share-notification">
          <p>{shareStatus.message}</p>
        </div>
      )}

      <div className="achievements-grid">
        {displayedAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`achievement-card ${
              !achievement.date ? "locked" : ""
            }`}
          >
            <div className="achievement-icon">{achievement.icon}</div>
            <h3>{achievement.name}</h3>
            <p>{achievement.date || "Đạt khi đủ điều kiện"}</p>
            
            {achievement.date && (
              <div className="share-container">
                <button 
                  className="share-achievement-btn"
                  onClick={() => handleShareAchievement(achievement)}
                >
                  <FaShare /> Chia sẻ
                </button>
                
                {showShareMenu === achievement.id && (
                  <div className="share-menu" ref={shareMenuRef}>
                    <button className="close-share-menu" onClick={closeShareMenu}>
                      <FaTimes />
                    </button>
                    <h4>Chia sẻ huy hiệu</h4>
                    <button 
                      className="share-option" 
                      onClick={() => handleShareAchievement(achievement, 'facebook')}
                    >
                      <FaFacebook className="facebook-icon" /> Facebook
                    </button>
                    <button 
                      className="share-option" 
                      onClick={() => handleShareAchievement(achievement, 'twitter')}
                    >
                      <FaTwitter className="twitter-icon" /> Twitter
                    </button>
                    <button 
                      className="share-option" 
                      onClick={() => handleShareAchievement(achievement, 'copy')}
                    >
                      <FaCopy /> Sao chép liên kết
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {showViewAll && (
        <h2 
          style={{ color: '#2570e8', cursor: 'pointer' }}
          onClick={handleViewAllAchievements}
        >
          Xem tất cả huy hiệu
        </h2>
      )}
      
      {/* Modal hiển thị tất cả huy hiệu */}
      {showAllAchievements && (
        <div className="all-achievements-modal">
          <div className="all-achievements-content">
            <button 
              className="close-all-achievements" 
              onClick={() => setShowAllAchievements(false)}
            >
              <FaTimes />
            </button>
            <h2>Tất cả huy hiệu</h2>
            
            <div className="all-achievements-grid">
              {/* Huy hiệu thời gian */}
              <div className="achievement-category">
                <h3>Thời gian cai thuốc</h3>
                <div className="category-achievements">
                  <div className="achievement-card">
                    <div className="achievement-icon">⭐</div>
                    <h3>24 giờ đầu tiên</h3>
                    <p>Không hút thuốc trong 24 giờ đầu tiên</p>
                  </div>
                  <div className="achievement-card">
                    <div className="achievement-icon">🏅</div>
                    <h3>1 tuần không hút</h3>
                    <p>Đạt mốc 1 tuần không hút thuốc</p>
                  </div>
                  <div className="achievement-card">
                    <div className="achievement-icon">🏆</div>
                    <h3>2 tuần không hút</h3>
                    <p>Đạt mốc 2 tuần không hút thuốc</p>
                  </div>
                  <div className="achievement-card">
                    <div className="achievement-icon">👑</div>
                    <h3>1 tháng không hút</h3>
                    <p>Đạt mốc 1 tháng không hút thuốc</p>
                  </div>
                  <div className="achievement-card locked">
                    <div className="achievement-icon">🌟</div>
                    <h3>3 tháng không hút</h3>
                    <p>Đạt khi đủ điều kiện</p>
                  </div>
                  <div className="achievement-card locked">
                    <div className="achievement-icon">💎</div>
                    <h3>6 tháng không hút</h3>
                    <p>Đạt khi đủ điều kiện</p>
                  </div>
                  <div className="achievement-card locked">
                    <div className="achievement-icon">🔮</div>
                    <h3>1 năm không hút</h3>
                    <p>Đạt khi đủ điều kiện</p>
                  </div>
                </div>
              </div>
              
              {/* Huy hiệu sức khỏe */}
              <div className="achievement-category">
                <h3>Cải thiện sức khỏe</h3>
                <div className="category-achievements">
                  <div className="achievement-card">
                    <div className="achievement-icon">❤️</div>
                    <h3>Huyết áp ổn định</h3>
                    <p>Huyết áp trở lại bình thường sau 20 phút</p>
                  </div>
                  <div className="achievement-card locked">
                    <div className="achievement-icon">🫁</div>
                    <h3>Phổi khỏe mạnh hơn</h3>
                    <p>Đạt khi đủ điều kiện</p>
                  </div>
                  <div className="achievement-card locked">
                    <div className="achievement-icon">🧠</div>
                    <h3>Não bộ tỉnh táo</h3>
                    <p>Đạt khi đủ điều kiện</p>
                  </div>
                </div>
              </div>
              
              {/* Huy hiệu tài chính */}
              <div className="achievement-category">
                <h3>Tiết kiệm tài chính</h3>
                <div className="category-achievements">
                  <div className="achievement-card locked">
                    <div className="achievement-icon">💰</div>
                    <h3>Tiết kiệm 500K</h3>
                    <p>Đạt khi đủ điều kiện</p>
                  </div>
                  <div className="achievement-card locked">
                    <div className="achievement-icon">💸</div>
                    <h3>Tiết kiệm 1 triệu</h3>
                    <p>Đạt khi đủ điều kiện</p>
                  </div>
                  <div className="achievement-card locked">
                    <div className="achievement-icon">🏦</div>
                    <h3>Tiết kiệm 5 triệu</h3>
                    <p>Đạt khi đủ điều kiện</p>
                  </div>
                </div>
              </div>
              
              {/* Huy hiệu đặc biệt */}
              <div className="achievement-category">
                <h3>Thành tựu đặc biệt</h3>
                <div className="category-achievements">
                  <div className="achievement-card locked">
                    <div className="achievement-icon">🔥</div>
                    <h3>Vượt qua cám dỗ</h3>
                    <p>Đạt khi đủ điều kiện</p>
                  </div>
                  <div className="achievement-card locked">
                    <div className="achievement-icon">🌱</div>
                    <h3>Thói quen mới</h3>
                    <p>Đạt khi đủ điều kiện</p>
                  </div>
                  <div className="achievement-card locked">
                    <div className="achievement-icon">🤝</div>
                    <h3>Người truyền cảm hứng</h3>
                    <p>Đạt khi đủ điều kiện</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Return the component with RequireMembership
  return (
    <RequireMembership
      allowedMemberships={['premium', 'pro']}
      showModal={true}
      featureName="huy hiệu"
    >
      <AchievementContent />
    </RequireMembership>
  );
};

export default Achievement;
