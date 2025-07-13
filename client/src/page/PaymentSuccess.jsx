import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './PaymentSuccess.css';
import { FaCheckCircle, FaCheck, FaCrown, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import ReactConfetti from 'react-confetti';
import axios from '../utils/axiosConfig.js';

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
  const { user, updateUser, refreshUserFromAPI } = useAuth();
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
      // Lấy token xác thực từ localStorage hoặc sessionStorage
      const token = localStorage.getItem('nosmoke_token') || sessionStorage.getItem('nosmoke_token');
      console.log('Token status:', token ? 'Token found' : 'No token found');
      
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
  
  // Hàm cập nhật thủ công trạng thái thanh toán khi callback từ ZaloPay thất bại
  const manuallyUpdatePaymentStatus = async (transactionId) => {
    try {
      const token = localStorage.getItem('nosmoke_token') || sessionStorage.getItem('nosmoke_token');
      if (!token) {
        console.warn('Token không tồn tại, không thể cập nhật trạng thái thanh toán');
        return false;
      }
      
      console.log(`Đang gọi API cập nhật thủ công trạng thái thanh toán: ${transactionId}`);
      const response = await axios.post(`/api/payments/zalopay/manual-update/${transactionId}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Kết quả cập nhật thủ công:', response.data);
      
      if (response.data.success) {
        console.log('Đã cập nhật thành công trạng thái thanh toán thành completed');
        return true;
      } else {
        console.error('Không thể cập nhật trạng thái thanh toán:', response.data.message);
        return false;
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật thủ công trạng thái thanh toán:', error);
      return false;
    }
  };

  // Hàm kiểm tra trạng thái thanh toán ZaloPay
  const checkZaloPayStatus = async (transactionId) => {
    setIsLoadingBackend(true);
    try {
      const token = localStorage.getItem('nosmoke_token') || sessionStorage.getItem('nosmoke_token');
      if (!token) {
        console.warn('Token không tồn tại, không thể kiểm tra trạng thái thanh toán ZaloPay');
        setIsLoadingBackend(false);
        setErrorMessage('Không thể xác thực người dùng');
        return;
      }
      
      // Bước 1: Kiểm tra trạng thái trong database local trước
      console.log(`Đang kiểm tra trạng thái trong database với transaction_id: ${transactionId}`);
      try {
        const localStatusResponse = await axios.get(`/api/payments/transaction/${transactionId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (localStatusResponse.data.success && localStatusResponse.data.data) {
          const payment = localStatusResponse.data.data;
          console.log('Trạng thái payment trong database:', payment.payment_status);
          
          if (payment.payment_status === 'completed') {
            setPaymentStatus('completed');
            // Cập nhật membership context với thông tin mới nhất từ server
            try {
              await refreshUserFromAPI(); // Refresh user info to get latest membership from API
              console.log('User membership updated successfully after payment completion');
              // Lấy thông tin gói
              const savedPackage = JSON.parse(localStorage.getItem('pendingPaymentPackage') || '{}');
              if (savedPackage) {
                setPackageInfo(savedPackage);
                setPaymentMethod('zalopay');
                localStorage.removeItem('pendingPaymentPackage');
              }
            } catch (e) {
              console.error('Lỗi khi refresh user info:', e);
            }
            setIsLoadingBackend(false);
            return;
          }
        }
      } catch (localError) {
        console.log('Không tìm thấy payment trong database hoặc có lỗi, tiếp tục kiểm tra ZaloPay API');
      }
      
      // Bước 2: Gọi API kiểm tra trạng thái thanh toán ZaloPay
      console.log(`Đang kiểm tra trạng thái thanh toán ZaloPay với transaction_id: ${transactionId}`);
      const response = await axios.get(`/api/payments/zalopay/status/${transactionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Kết quả kiểm tra ZaloPay:', response.data);
      
      if (response.data.success) {
        // Nếu ZaloPay xác nhận thanh toán thành công
        if (response.data.data.return_code === 1) {
          console.log('ZaloPay xác nhận thanh toán thành công');
          
          // Bước 3: Cập nhật thủ công nếu chưa được cập nhật
          console.log('Tiến hành cập nhật thủ công trạng thái thanh toán');
          const updateResult = await manuallyUpdatePaymentStatus(transactionId);
          if (updateResult) {
            console.log('Đã cập nhật thủ công thành công');
            setPaymentStatus('completed');
            
            // Refresh user info to get latest membership from API
            try {
              await refreshUserFromAPI();
              console.log('User membership updated successfully after manual payment update');
            } catch (userUpdateError) {
              console.error('Lỗi khi refresh user info:', userUpdateError);
            }
            
            // Lấy thông tin gói
            try {
              const savedPackage = JSON.parse(localStorage.getItem('pendingPaymentPackage') || '{}');
              if (savedPackage && savedPackage.id) {
                setPackageInfo(savedPackage);
                setPaymentMethod('zalopay');
                localStorage.removeItem('pendingPaymentPackage');
              } else {
                // Fallback: lấy từ API membership
                const membershipResponse = await axios.get('/api/users/membership', {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                });
                if (membershipResponse.data.success && membershipResponse.data.data.package) {
                  setPackageInfo(membershipResponse.data.data.package);
                  setPaymentMethod('zalopay');
                }
              }
            } catch (e) {
              console.error('Lỗi khi lấy thông tin gói:', e);
            }
          } else {
            setPaymentStatus('pending');
            setErrorMessage('Thanh toán thành công nhưng không thể cập nhật trạng thái trong hệ thống');
          }
        } else {
          // ZaloPay báo thanh toán thất bại hoặc chưa thành công
          if (response.data.data.return_code === 2) {
            setPaymentStatus('failed');
            setErrorMessage('Thanh toán thất bại trên ZaloPay');
          } else if (response.data.data.return_code === 3) {
            setPaymentStatus('pending');
            setErrorMessage('Thanh toán đang được xử lý');
          } else {
            setPaymentStatus('failed');
            setErrorMessage('Thanh toán không thành công: ' + response.data.data.return_message);
          }
        }
      } else {
        setPaymentStatus('failed');
        setErrorMessage('Không thể kiểm tra trạng thái thanh toán');
      }
    } catch (error) {
      console.error('Lỗi khi kiểm tra trạng thái ZaloPay:', error);
      setPaymentStatus('unknown');
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.message || 'Lỗi khi kiểm tra thanh toán');
      } else {
        setErrorMessage('Lỗi kết nối khi kiểm tra thanh toán');
      }
    } finally {
      setIsLoadingBackend(false);
    }
  };
  
  // Initialize component with payment data
  useEffect(() => {      // Kiểm tra URL params từ ZaloPay redirect
    const urlParams = new URLSearchParams(window.location.search);
    const appTransId = urlParams.get('apptransid');
    
    if (appTransId) {
      // Nếu có transaction ID từ URL, kiểm tra trạng thái ZaloPay
      setTransactionId(appTransId);
      checkZaloPayStatus(appTransId);
      
      // Lấy thông tin gói từ localStorage
      try {
        const savedPackage = JSON.parse(localStorage.getItem('selectedPackage'));
        if (savedPackage) {
          setPackageInfo(savedPackage);
          setPaymentMethod('zalopay');
        }
      } catch (e) {
        console.error('Lỗi khi lấy thông tin gói từ localStorage:', e);
      }
    }
    // Nếu không có params, sử dụng location state như trước
    else if (location.state?.package) {
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
      // Refresh user data from API to get latest membership information
      const updateUserMembership = async () => {
        try {
          console.log('Refreshing user data from API to get latest membership...');
          await refreshUserFromAPI();
          console.log('User membership updated successfully from API');
          
          // Đánh dấu hiển thị thông báo thành công
          window.sessionStorage.setItem('membership_updated', 'true');
        } catch (error) {
          console.error('Lỗi khi refresh user info từ API:', error);
          
          // Fallback: cập nhật membership type từ package info
          const membershipType = packageInfo.name.toLowerCase();
          updateUser({ 
            membership: membershipType,
            membershipType: membershipType 
          });
          console.log('Fallback: đã cập nhật membership từ package info:', membershipType);
          
          // Đánh dấu hiển thị thông báo thành công
          window.sessionStorage.setItem('membership_updated', 'true');
        }
      };
      
      // Gọi hàm cập nhật
      updateUserMembership();
    }
  }, [packageInfo, user, refreshUserFromAPI, updateUser, paymentStatus]);
  
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
        ) : paymentStatus === 'pending' ? (
          <>
            <p>Thanh toán của bạn đang được xử lý. Chúng tôi đang kiểm tra trạng thái từ ZaloPay...</p>
            {isLoadingBackend && (
              <div className="loading-status">
                <div className="spinner"></div>
                <span>Đang kiểm tra trạng thái thanh toán...</span>
              </div>
            )}
            {!isLoadingBackend && errorMessage && (
              <div className="warning-message">
                <FaExclamationTriangle style={{marginRight: '8px'}} /> 
                {errorMessage}
              </div>
            )}
          </>
        ) : (
          <>
            <p>Đang kiểm tra trạng thái thanh toán...</p>
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
            <>
              <p>Đã thanh toán thành công nhưng trạng thái chưa được cập nhật? Hãy thử bấm vào nút dưới đây:</p>
              <div className="payment-action-buttons">
                <button 
                  onClick={async () => {
                    if (transactionId) {
                      setIsLoadingBackend(true);
                      const success = await manuallyUpdatePaymentStatus(transactionId);
                      if (success) {
                        setPaymentStatus('completed');
                        alert('Đã cập nhật thành công trạng thái thanh toán!');
                      } else {
                        alert('Không thể cập nhật trạng thái thanh toán, vui lòng liên hệ hỗ trợ.');
                      }
                      setIsLoadingBackend(false);
                    }
                  }}
                  className="update-payment-button"
                  disabled={!transactionId || isLoadingBackend}
                >
                  Cập nhật trạng thái thanh toán
                </button>
                <button 
                  onClick={() => navigate('/', { replace: true })} 
                  className="back-home-button"
                >
                  Quay về trang chủ
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
