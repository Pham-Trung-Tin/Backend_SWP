import React from 'react';
import './MembershipPackage.css';
import { FaCheck } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function MembershipPackage() {
  const navigate = useNavigate();
  
  // Định nghĩa thông tin cho từng gói (đặt ngoài hàm để có thể truy cập từ bất kỳ đâu trong component)
  const packageDetails = {
    free: {
      name: "Free",
      price: 0,
      period: "tháng",
      membershipType: "free",
      features: [
        "Theo dõi cai thuốc",
        "Lập kế hoạch cá nhân"
      ]
    },
    premium: {
      name: "Premium",
      price: 99000,
      period: "tháng",
      membershipType: "premium",
      features: [
        "Theo dõi cai thuốc",
        "Lập kế hoạch cá nhân",
        "Huy hiệu & cộng đồng",
        "Chat huấn luyện viên",
        "Video call tư vấn"
      ]
    },
    pro: {
      name: "Pro",
      price: 999000,
      period: "năm",
      membershipType: "pro",
      features: [
        "Theo dõi cai thuốc",
        "Lập kế hoạch cá nhân",
        "Huy hiệu & cộng đồng",
        "Chat huấn luyện viên",
        "Video call tư vấn"
      ]
    }
  };
  
  // Xử lý chuyển hướng khi người dùng chọn gói
  const handlePackageSelection = (packageType) => {

    // Nếu gói free, chuyển đến trang đăng ký
    if (packageType === 'free') {
      navigate('/signup');
      return;
    }

    // Chuyển hướng đến trang thanh toán với thông tin gói đã chọn
    navigate('/payment', { state: { package: packageDetails[packageType] } });
  };

  return (
      <section className="pricing-section">
        <div className="container">          <div className="hero-image-container">
            <img src="/image/hero/winners-two-color.png" alt="Cai thuốc thành công" className="membership-hero-image" />
            <h1 className="hero-title">Cam kết bỏ thuốc - Bước tới cuộc sống khỏe mạnh</h1>
          </div>
          <h2>Gói thành viên</h2>
          <p className="pricing-subtitle">Chọn gói phù hợp với nhu cầu của bạn</p>
  
          <div className="pricing-grid">
            <div className="pricing-card free">
              <div className="pricing-header">
                <h3>Free</h3>
                <p className="pricing-desc">Bắt đầu miễn phí</p>
                <div className="pricing-price">
                  <span className="price">0đ</span>
                  <span className="period">/tháng</span>
                </div>
              </div>
              <div className="pricing-features">
                <div className="feature-item">
                  <i className="fas fa-check feature-check"></i>
                  <span>Theo dõi cai thuốc</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-check feature-check"></i>
                  <span>Lập kế hoạch cá nhân</span>
                </div>
                <div className="feature-item disabled">
                  <i className="fas fa-times feature-times"></i>
                  <span>Huy hiệu & cộng đồng</span>
                </div>
                <div className="feature-item disabled">
                  <i className="fas fa-times feature-times"></i>
                  <span>Chat huấn luyện viên</span>
                </div>
                <div className="feature-item disabled">
                  <i className="fas fa-times feature-times"></i>
                  <span>Video call tư vấn</span>
                </div>
              </div>              <button onClick={() => handlePackageSelection('free')} className="pricing-btn">Bắt đầu miễn phí</button>
            </div>
  
            <div className="pricing-card premium highlight">
              <div className="best-value">Phổ biến nhất</div>
              <div className="pricing-header">
                <h3>Premium</h3>
                <p className="pricing-desc">Hỗ trợ toàn diện</p>
                <div className="pricing-price">
                  <span className="price">99.000đ</span>
                  <span className="period">/tháng</span>
                </div>
              </div>
              <div className="pricing-features">
                <div className="feature-item">
                  <i className="fas fa-check feature-check"></i>
                  <span>Theo dõi cai thuốc</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-check feature-check"></i>
                  <span>Lập kế hoạch cá nhân</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-check feature-check"></i>
                  <span>Huy hiệu & cộng đồng</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-check feature-check"></i>
                  <span>Chat huấn luyện viên</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-check feature-check"></i>
                  <span>Video call tư vấn</span>
                </div>
              </div>
              <button onClick={() => handlePackageSelection('premium')} className="pricing-btn">Đăng ký ngay</button>
            </div>
            <div className="pricing-card pro">
              <div className="pricing-header">
                <h3>Pro</h3>
                <p className="pricing-desc">Hỗ trợ toàn diện</p>
                <div className="pricing-price">
                  <span className="price">999.000đ</span>
                  <span className="period">/năm</span>
                </div>
              </div>
              <div className="pricing-features">
                <div className="feature-item">
                  <i className="fas fa-check feature-check"></i>
                  <span>Theo dõi cai thuốc</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-check feature-check"></i>
                  <span>Lập kế hoạch cá nhân</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-check feature-check"></i>
                  <span>Huy hiệu & cộng đồng</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-check feature-check"></i>
                  <span>Chat huấn luyện viên</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-check feature-check"></i>
                  <span>Video call tư vấn</span>
                </div>
              </div>
              <button onClick={() => handlePackageSelection('pro')} className="pricing-btn">Đăng ký Pro</button>
            </div>
          </div>
        </div>
      </section>
    );
}