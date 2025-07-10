import React, { useState } from 'react';
import './MembershipPackage.css';
import { FaCheck, FaTimes, FaCrown, FaLeaf, FaRocket, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MembershipPackage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [toasts, setToasts] = useState([]);
  
  // Hàm tạo toast notification
  const addToast = (message, type = 'error') => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type };
    setToasts(prev => [...prev, newToast]);
    
    // Tự động xóa toast sau 5 giây
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  };
  
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
    // Kiểm tra xem người dùng có thể mua gói này hay không
  const canPurchasePackage = (packageType) => {
    if (!user) return true; // Người dùng chưa đăng nhập có thể xem tất cả các gói
    
    const currentMembership = user.membership || 'free';
    
    // Nếu đang dùng gói miễn phí, luôn cho phép mua gói premium và pro
    if (currentMembership === 'free') {
      // Gói free không cần làm mờ khi đang dùng free
      if (packageType === 'free') return true;
      // Cho phép mua các gói cao hơn
      return true;
    }
    
    // Xác định giá trị của các gói để so sánh
    const membershipValue = {
      'free': 0,
      'premium': 1,
      'pro': 2
    };
    
    // Nếu giá trị gói hiện tại lớn hơn hoặc bằng giá trị gói đang xét, không thể mua
    return membershipValue[currentMembership] < membershipValue[packageType];
  };
    // Xử lý chuyển hướng khi người dùng chọn gói
  const handlePackageSelection = (packageType) => {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (!user) {
      addToast('Bạn cần đăng nhập để mua gói thành viên!', 'error');
      setTimeout(() => {
        navigate('/login');
      }, 1000);
      return;
    }

    // Nếu gói free, chuyển đến trang đăng ký
    if (packageType === 'free') {
      navigate('/signup');
      return;
    }

    // Chuyển hướng đến trang thanh toán với thông tin gói đã chọn
    navigate('/payment', { state: { package: packageDetails[packageType] } });  };
  
  // Component Toast
  const Toast = ({ toast, onClose }) => (
    <div className={`toast toast-${toast.type}`}>
      <span className="toast-message">{toast.message}</span>
      <button className="toast-close" onClick={() => onClose(toast.id)}>×</button>
    </div>
  );

  // Component ToastContainer
  const ToastContainer = () => (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast 
          key={toast.id} 
          toast={toast} 
          onClose={(id) => setToasts(prev => prev.filter(t => t.id !== id))}
        />
      ))}
    </div>
  );

  return (
    <>
      <section className="pricing-section">
        <div className="container">
          <h2>Gói thành viên</h2>
          <p className="pricing-subtitle">Chọn gói phù hợp với nhu cầu của bạn</p>
          <div className="pricing-particles"></div>
  
          <div className="pricing-grid">            <div className={`pricing-card free ${!canPurchasePackage('free') && user?.membership !== 'free' ? 'disabled-package' : ''}`}>
              {!canPurchasePackage('free') && user?.membership !== 'free' && <div className="package-owned"><FaLock /> Đã sở hữu</div>}
              <div className="pricing-header">
                <h3><FaRocket /> Free</h3>
                <p className="pricing-desc">Bắt đầu miễn phí</p>
                <div className="pricing-price">
                  <span className="price">0đ</span>
                  <span className="period">/tháng</span>
                </div>
              </div><div className="pricing-features">
                <div className="feature-item">
                  <FaCheck />
                  <span>Theo dõi cai thuốc</span>
                </div>
                <div className="feature-item">
                  <FaCheck />
                  <span>Lập kế hoạch cá nhân</span>
                </div>
                <div className="feature-item disabled">
                  <FaTimes />
                  <span>Huy hiệu & cộng đồng</span>
                </div>
                <div className="feature-item disabled">
                  <FaTimes />
                  <span>Chat huấn luyện viên</span>
                </div>
                <div className="feature-item disabled">
                  <FaTimes />
                  <span>Video call tư vấn</span>
                </div>              </div><button 
                onClick={() => handlePackageSelection('free')} 
                className="pricing-btn"
              >
                Bắt đầu miễn phí
              </button>
            </div>            <div className={`pricing-card premium highlight ${!canPurchasePackage('premium') ? 'disabled-package' : ''}`}>              <div className="best-value">Phổ biến nhất</div>
              {!canPurchasePackage('premium') && <div className="package-owned"><FaLock /> Đã sở hữu</div>}
              <div className="pricing-header">
                <h3><FaLeaf /> Premium</h3>
                <p className="pricing-desc">Hỗ trợ toàn diện</p>
                <div className="pricing-price">
                  <span className="price">99.000đ</span>
                  <span className="period">/tháng</span>
                </div>
              </div>
              <div className="pricing-features">
                <div className="feature-item">
                  <FaCheck />
                  <span>Theo dõi cai thuốc</span>
                </div>
                <div className="feature-item">
                  <FaCheck />
                  <span>Lập kế hoạch cá nhân</span>
                </div>
                <div className="feature-item">
                  <FaCheck />
                  <span>Huy hiệu & cộng đồng</span>
                </div>
                <div className="feature-item">
                  <FaCheck />
                  <span>Chat huấn luyện viên</span>
                </div>
                <div className="feature-item">
                  <FaCheck />
                  <span>Video call tư vấn</span>
                </div>              </div>
              <button 
                onClick={() => canPurchasePackage('premium') && handlePackageSelection('premium')} 
                className={`pricing-btn ${!canPurchasePackage('premium') ? 'disabled-btn' : ''}`}
                disabled={!canPurchasePackage('premium')}
              >
                {canPurchasePackage('premium') ? 'Đăng ký ngay' : 'Đã sở hữu'}
              </button>
            </div>            <div className={`pricing-card pro ${!canPurchasePackage('pro') ? 'disabled-package' : ''}`}>              {!canPurchasePackage('pro') && <div className="package-owned"><FaLock /> Đã sở hữu</div>}
              <div className="pricing-header">
                <h3><FaCrown /> Pro</h3>
                <p className="pricing-desc">Hỗ trợ toàn diện</p>
                <div className="pricing-price">
                  <span className="price">999.000đ</span>
                  <span className="period">/năm</span>
                </div>
              </div>
              <div className="pricing-features">
                <div className="feature-item">
                  <FaCheck />
                  <span>Theo dõi cai thuốc</span>
                </div>
                <div className="feature-item">
                  <FaCheck />
                  <span>Lập kế hoạch cá nhân</span>
                </div>
                <div className="feature-item">
                  <FaCheck />
                  <span>Huy hiệu & cộng đồng</span>
                </div>
                <div className="feature-item">
                  <FaCheck />
                  <span>Chat huấn luyện viên</span>
                </div>
                <div className="feature-item">
                  <FaCheck />
                  <span>Video call tư vấn</span>
                </div>              </div>
              <button 
                onClick={() => canPurchasePackage('pro') && handlePackageSelection('pro')} 
                className={`pricing-btn ${!canPurchasePackage('pro') ? 'disabled-btn' : ''}`}
                disabled={!canPurchasePackage('pro')}
              >
                {canPurchasePackage('pro') ? 'Đăng ký Pro' : 'Đã sở hữu'}
              </button>
            </div>          </div>
        </div>
      </section>
      <ToastContainer />
    </>
  );
}