import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './PaymentSuccess.css';
import { FaCheckCircle, FaCheck, FaCrown, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import ReactConfetti from 'react-confetti';
import axios from 'axios';

// Component hiển thị thông báo trạng thái
const StatusMessage = ({ status, message }) => {
  // Chọn icon và style dựa vào status
  const getStatusInfo = () => {
    switch (status) {
      case 'completed':
        return {
          icon: <FaCheckCircle style={{marginRight: '8px', color: '#2e7d32'}} />,
          className: 'payment-status completed'
        };
      case 'pending':
        return {
          icon: <FaClock style={{marginRight: '8px', color: '#f57c00'}} />,
          className: 'payment-status pending'
        };
      case 'failed':
        return {
          icon: <FaExclamationTriangle style={{marginRight: '8px', color: '#c62828'}} />,
          className: 'payment-status failed'
        };
      case 'refunded':
        return {
          icon: <FaExclamationTriangle style={{marginRight: '8px', color: '#1565c0'}} />,
          className: 'payment-status refunded'
        };
      default:
        return {
          icon: <FaExclamationTriangle style={{marginRight: '8px', color: '#9e9e9e'}} />,
          className: 'payment-status'
        };
    }
  };

  const { icon, className } = getStatusInfo();

  return (
    <div className={className}>
      {icon}
      {message || `Trạng thái: ${status}`}
    </div>
  );
};

const PaymentSuccess = () => {
  // Hooks and state
  const location = useLocation();
  const navigate = useNavigate();
  const [packageInfo, setPackageInfo] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const { user, updateUser } = useAuth();
  const [countdown, setCountdown] = useState(5);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [windowDimension, setWindowDimension] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  // Thêm state để theo dõi trạng thái từ backend
  const [paymentStatus, setPaymentStatus] = useState('unknown'); // 'completed', 'pending', 'failed', 'refunded'
  const [isLoadingBackend, setIsLoadingBackend] = useState(true);
  const [paymentId, setPaymentId] = useState(null);
  const [transactionId, setTransactionId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Redirect function using React Router Navigate for SPA navigation
  const forceRedirect = useCallback(() => {
    console.log("Redirecting to home...");
    setIsRedirecting(true);
    // Clear any payment data from session storage
    sessionStorage.removeItem('paymentData');
    sessionStorage.removeItem('pendingPayment');
    // Use React Router for single page navigation
    navigate('/', { replace: true });
  }, [navigate]);
  
  // Hàm kiểm tra trạng thái thanh toán từ backend
  const checkPaymentStatus = async (paymentId) => {
    setIsLoadingBackend(true);
    try {
      // Lấy token xác thực từ localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.warn('Token không tồn tại, không thể kiểm tra trạng thái thanh toán');
        setIsLoadingBackend(false);
        setErrorMessage('Không thể xác thực người dùng');
        return;
      }
      
      // Gọi API kiểm tra trạng thái thanh toán
      console.log(`Đang kiểm tra trạng thái thanh toán với ID: ${paymentId}`);
      const response = await axios.get(`/api/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Thông tin thanh toán từ API:', response.data);
      
      // Kiểm tra trạng thái thanh toán
      if (response.data.success && response.data.data) {
        const payment = response.data.data;
        setPaymentStatus(payment.payment_status);
        
        // Nếu thanh toán chưa hoàn tất, hiển thị thông báo
        if (payment.payment_status !== 'completed') {
          console.warn(`Trạng thái thanh toán: ${payment.payment_status}`);
          setErrorMessage(`Trạng thái thanh toán hiện tại: ${payment.payment_status}`);
        }
      }
    } catch (error) {
      console.error('Lỗi khi kiểm tra trạng thái thanh toán:', error);
      
      if (error.response && error.response.status === 404) {
        setErrorMessage('Không tìm thấy thông tin thanh toán');
      } else if (error.response && error.response.data) {
        setErrorMessage(error.response.data.message || 'Lỗi khi kiểm tra thanh toán');
      } else {
        setErrorMessage('Không thể kết nối đến máy chủ');
      }
    } finally {
      setIsLoadingBackend(false);
    }
  };
  
  // Initialize component with payment data
  useEffect(() => {
    // Try to get data from location state first
    if (location.state?.package) {
      setPackageInfo(location.state.package);
      setPaymentMethod(location.state.paymentMethod);
      setPaymentId(location.state.paymentId);
      setTransactionId(location.state.transactionId);
      
      // Lưu thông tin giao dịch
      const transactionInfo = {
        package: location.state.package,
        paymentMethod: location.state.paymentMethod,
        paymentId: location.state.paymentId,
        transactionId: location.state.transactionId,
        orderId: location.state.orderId,
        timestamp: new Date().getTime()
      };
      
      // Store in session storage as backup
      sessionStorage.setItem('paymentData', JSON.stringify(transactionInfo));
      
      // Kiểm tra trạng thái thanh toán từ backend nếu có paymentId
      if (location.state.paymentId) {
        checkPaymentStatus(location.state.paymentId);
      }
    } else {
      // If no location state, try to get from session storage
      const storedData = sessionStorage.getItem('paymentData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setPackageInfo(parsedData.package);
        setPaymentMethod(parsedData.paymentMethod);
        setPaymentId(parsedData.paymentId);
        setTransactionId(parsedData.transactionId);
        
        // Kiểm tra trạng thái thanh toán từ backend nếu có paymentId
        if (parsedData.paymentId) {
          checkPaymentStatus(parsedData.paymentId);
        }
      } else {
        // No data available, redirect to home
        navigate('/', { replace: true });
      }
    }
  }, [location, navigate]);
  
  // Update user membership if package info is available
  useEffect(() => {
    if (user && packageInfo && paymentStatus === 'completed') {
      // Lấy loại membership từ package
      const membershipType = packageInfo.name.toLowerCase();
      
      // Kiểm tra thông tin membership từ backend
      const fetchUserMembership = async () => {
        try {
          // Lấy token xác thực từ localStorage
          const token = localStorage.getItem('token');
          
          if (token) {
            // Gọi API kiểm tra thông tin người dùng
            console.log('Đang lấy thông tin người dùng từ API...');
            const response = await axios.get('/api/users/me', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.data.success && response.data.data) {
              const userData = response.data.data;
              
              // Nếu backend đã cập nhật membership, sử dụng thông tin từ backend
              if (userData.membership || userData.membershipType) {
                console.log('Đã lấy thông tin membership từ backend:', userData.membership || userData.membershipType);
                
                // Cập nhật context với thông tin từ backend
                updateUser({ 
                  membership: userData.membership || userData.membershipType,
                  membershipType: userData.membership || userData.membershipType
                });
              } else {
                // Backend chưa cập nhật, sử dụng thông tin từ frontend
                updateUser({ 
                  membership: membershipType,
                  membershipType: membershipType 
                });
                console.log('Đã cập nhật membership từ frontend:', membershipType);
              }
            }
          } else {
            // Không có token, cập nhật từ frontend
            updateUser({ 
              membership: membershipType,
              membershipType: membershipType 
            });
            console.log('Không có token, đã cập nhật membership từ frontend:', membershipType);
          }
        } catch (error) {
          console.error('Lỗi khi kiểm tra thông tin membership từ backend:', error);
          
          // Xảy ra lỗi, cập nhật từ frontend
          updateUser({ 
            membership: membershipType,
            membershipType: membershipType 
          });
        }
      };
      
      // Gọi hàm kiểm tra
      fetchUserMembership();
      
      // Đánh dấu hiển thị thông báo thành công
      window.sessionStorage.setItem('membership_updated', 'true');
    }
  }, [packageInfo, user, updateUser, paymentStatus]);
  
  // Countdown timer effect
  useEffect(() => {
    // Chỉ bắt đầu đếm ngược khi đã load xong từ backend và thanh toán thành công
    if (!packageInfo || isRedirecting || isLoadingBackend || paymentStatus !== 'completed') return;
    
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
  }, [packageInfo, forceRedirect, isRedirecting, countdown, isLoadingBackend, paymentStatus]);
  
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
  
  // If no package info or still loading, show loading screen
  if (!packageInfo || isLoadingBackend) {
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
      {/* Hiển thị confetti nếu thanh toán thành công */}
      {paymentStatus === 'completed' && (
        <ReactConfetti
          width={windowDimension.width}
          height={windowDimension.height}
          recycle={false}
          numberOfPieces={200}
          tweenDuration={10000}
        />
      )}
      
      <div className="success-card">
        <div className="success-icon">
          {paymentStatus === 'completed' ? (
            <FaCheckCircle style={{color: '#34c759'}} />
          ) : (
            <FaExclamationTriangle style={{color: '#ff9500'}} />
          )}
        </div>
        
        <h1>
          {paymentStatus === 'completed' ? 'Thanh toán thành công!' : 'Đang xử lý thanh toán'}
        </h1>
        
        {paymentStatus === 'completed' ? (
          <p>Cảm ơn bạn đã đăng ký sử dụng dịch vụ của chúng tôi.</p>
        ) : (
          <>
            <p>Thanh toán của bạn đang được xử lý.</p>
            {errorMessage && (
              <div className="warning-message">
                <FaExclamationTriangle style={{marginRight: '8px'}} /> 
                {errorMessage}
              </div>
            )}
          </>
        )}
        
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
          {transactionId && (
            <div className="summary-item">
              <span>Mã giao dịch:</span>
              <span className="transaction-id">{transactionId}</span>
            </div>
          )}
          <div className="summary-item">
            <span>Trạng thái:</span>
            <StatusMessage status={paymentStatus} />
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
          <span>
            {paymentStatus === 'completed' 
              ? `Tài khoản của bạn đã được nâng cấp lên gói ${packageInfo.name}` 
              : `Tài khoản của bạn sẽ được nâng cấp lên gói ${packageInfo.name} sau khi xác minh thanh toán`
            }
          </span>
        </div>
        
        <div className="next-steps">
          {paymentStatus === 'completed' ? (
            <>
              <p>Tài khoản của bạn đã được nâng cấp. Bạn có thể bắt đầu sử dụng ngay các tính năng mới!</p>
              <div className="auto-redirect">
                <FaClock style={{marginRight: '8px'}} /> 
                Tự động chuyển về trang chủ sau <span className="countdown">{countdown}</span> giây
              </div>
            </>
          ) : (
            <button 
              onClick={() => navigate('/', { replace: true })} 
              className="back-home-button"
            >
              Quay về trang chủ
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
