import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './PaymentSuccess.css';
import { FaCheckCircle, FaCheck, FaCrown, FaClock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import ReactConfetti from 'react-confetti';

const PaymentSuccess = () => {
  // Hooks and state
  const location = useLocation();
  const navigate = useNavigate();  const [packageInfo, setPackageInfo] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const { user, updateUser } = useAuth();
  const [countdown, setCountdown] = useState(5);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [windowDimension, setWindowDimension] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
    // Redirect function using React Router Navigate for SPA navigation
  const forceRedirect = useCallback(() => {
    console.log("Redirecting to home...");
    setIsRedirecting(true);
    // Clear any payment data from session storage
    sessionStorage.removeItem('paymentData');
    // Use React Router for single page navigation
    navigate('/', { replace: true });
  }, [navigate]);
  
  // Initialize component with payment data
  useEffect(() => {
    // Try to get data from location state first
    if (location.state?.package) {
      setPackageInfo(location.state.package);
      setPaymentMethod(location.state.paymentMethod);
      
      // Store in session storage as backup
      sessionStorage.setItem('paymentData', JSON.stringify({
        package: location.state.package,
        paymentMethod: location.state.paymentMethod,
        timestamp: new Date().getTime()
      }));
    } else {
      // If no location state, try to get from session storage
      const storedData = sessionStorage.getItem('paymentData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setPackageInfo(parsedData.package);
        setPaymentMethod(parsedData.paymentMethod);
      } else {
        // No data available, redirect to home
        navigate('/', { replace: true });
      }
    }
  }, [location, navigate]);
  // Update user membership if package info is available
  useEffect(() => {
    if (user && packageInfo) {
      // Lấy loại membership từ package
      const membershipType = packageInfo.name.toLowerCase();
      
      // Cập nhật cả hai trường để đảm bảo tính nhất quán
      updateUser({ 
        membership: membershipType,
        membershipType: membershipType 
      });
      console.log('Đã cập nhật membership và membershipType:', membershipType);
      
      // Đánh dấu hiển thị thông báo thành công
      window.sessionStorage.setItem('membership_updated', 'true');
    }
  }, [packageInfo, user, updateUser]);    // Countdown timer effect
  useEffect(() => {
    if (!packageInfo || isRedirecting) return;
    
    let isMounted = true;
    
    console.log(`Starting countdown from ${countdown}`);
    
    const timer = setInterval(() => {
      if (isMounted) {
        setCountdown(prevCount => {
          const newCount = prevCount - 1;
          console.log(`Countdown: ${newCount}`);
          
          if (newCount <= 0) {
            clearInterval(timer);
            forceRedirect();
          }
          
          return newCount;
        });
      }
    }, 1000);
    
    // Cleanup function to prevent memory leaks and double redirects
    return () => {
      isMounted = false;
      clearInterval(timer);
      console.log("Countdown cleared");
    };
  }, [packageInfo, forceRedirect, isRedirecting, countdown]);
  
  // Effect to detect window resize for confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowDimension({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // If no package info, show loading or return null
  if (!packageInfo) {
    return (
      <div className="payment-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải thông tin thanh toán...</p>
      </div>
    );
  }
  
  // Render successful payment view
  return (
    <div className="payment-success-container">
      <div className="success-card">
        <div className="success-icon">
          <FaCheckCircle />
        </div>
          <h1>Thanh toán thành công!</h1>
        <p>Cảm ơn bạn đã đăng ký sử dụng dịch vụ của chúng tôi.</p>
        
        <div className="success-trophy-container">
          <img src="/image/hero/winners-two-color.png" alt="Trophy" className="success-trophy-image" />
          <div className="success-message">
            Cam kết bỏ thuốc - Bước tới cuộc sống khỏe mạnh
          </div>
        </div>
        
        <div className="package-summary">
          <h2>Thông tin gói</h2>
          <div className="summary-item">
            <span>Tên gói:</span>
            <span>{packageInfo.name}</span>
          </div>
          <div className="summary-item">
            <span>Giá:</span>
            <span>{packageInfo.price.toLocaleString()}đ/{packageInfo.period}</span>
          </div>
          <div className="summary-item">
            <span>Phương thức thanh toán:</span>
            <span className={`payment-method ${paymentMethod}`}>
              {paymentMethod === 'creditCard' && '💳 Thẻ tín dụng/ghi nợ'}
              {paymentMethod === 'momo' && '📱 Ví Momo'}
              {paymentMethod === 'zalopay' && '📲 ZaloPay'}
              {paymentMethod === 'paypal' && '🌐 PayPal'}
            </span>
          </div>
        </div>
        
        <div className="features-list">
          <h3>Tính năng bạn có thể sử dụng</h3>
          <ul>
            {packageInfo.features.map((feature, index) => (
              <li key={index}>
                <FaCheck style={{color: '#34c759', marginRight: '8px'}} /> 
                {feature}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="membership-status-notification">
          <FaCrown style={{color: packageInfo.name === 'Premium' ? '#34a853' : '#6f42c1', marginRight: '10px'}} />
          <span>Tài khoản của bạn đã được nâng cấp lên gói <strong>{packageInfo.name}</strong></span>
        </div>
        
        <div className="next-steps">
          <p>Tài khoản của bạn đã được nâng cấp. Bạn có thể bắt đầu sử dụng ngay các tính năng mới!</p>
          <div className="auto-redirect">
            <FaClock style={{marginRight: '8px'}} /> 
            Tự động chuyển về trang chủ sau <span className="countdown">{countdown}</span> giây
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
