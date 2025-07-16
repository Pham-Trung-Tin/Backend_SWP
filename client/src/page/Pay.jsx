
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Pay.css';
import axios from '../utils/axiosConfig.js';

const Pay = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');

  useEffect(() => {
    console.log('Pay.jsx useEffect - Kiểm tra dữ liệu gói');
    
    // Thử lấy package từ location.state
    let pkg = location.state?.package;
    console.log('Dữ liệu từ location.state:', pkg);
    
    // Nếu không có trong location.state, thử lấy từ localStorage
    if (!pkg) {
      try {
        const storedPackage = localStorage.getItem('selectedPackage');
        console.log('Dữ liệu raw từ localStorage:', storedPackage);
        
        if (storedPackage) {
          pkg = JSON.parse(storedPackage);
          console.log('Dữ liệu parsed từ localStorage:', pkg);
        }
      } catch (e) {
        console.error('Failed to parse selectedPackage from localStorage:', e);
      }
    }

    // Nếu không có dữ liệu package, chuyển về trang membership
    if (!pkg) {
      console.log('Không tìm thấy dữ liệu gói, chuyển về trang membership');
      navigate('/membership');
      return;
    }
    
    console.log('Dữ liệu gói trước khi xử lý:', pkg);

    // Đảm bảo id luôn là số nguyên
    let packageId;
    
    if (pkg.id !== undefined && pkg.id !== null) {
      // Nếu có id, chuyển đổi sang number nếu cần
      packageId = typeof pkg.id === 'string' ? parseInt(pkg.id) : pkg.id;
      console.log('Package ID từ dữ liệu:', packageId);
    } else {
      // Nếu không có id, xác định dựa vào membershipType
      packageId = pkg.membershipType === 'premium' ? 2 : 
                 pkg.membershipType === 'pro' ? 3 : 1;
      console.log('Package ID được xác định từ membershipType:', packageId);
    }
    
    // Cập nhật đối tượng gói với ID đã xác nhận
    const updatedPkg = {
      ...pkg,
      id: packageId
    };
    
    console.log('Dữ liệu gói sau khi xử lý:', updatedPkg);
    
    setSelectedPackage(updatedPkg);
    localStorage.setItem('selectedPackage', JSON.stringify(updatedPkg));
  }, [location, navigate]);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!termsAccepted) return alert('Vui lòng đồng ý với điều khoản sử dụng.');
    if (!selectedPackage) return navigate('/membership');
    
    // Kiểm tra và đảm bảo thông tin gói hợp lệ
    if (!selectedPackage.id || !selectedPackage.membershipType || !selectedPackage.name) {
      console.error('Thông tin gói không đầy đủ:', selectedPackage);
      alert('Thông tin gói không hợp lệ. Vui lòng chọn lại gói thành viên.');
      return navigate('/membership');
    }
    
    // Log thông tin gói trước khi xử lý
    console.log('Thông tin gói thanh toán:', {
      id: selectedPackage.id,
      name: selectedPackage.name,
      membershipType: selectedPackage.membershipType,
      price: selectedPackage.price
    });

    setIsProcessing(true);
    setProcessingMessage('Đang xử lý thanh toán qua ZaloPay...');

    // Get token from both localStorage and sessionStorage to match AuthContext storage pattern
    const token = localStorage.getItem('nosmoke_token') || sessionStorage.getItem('nosmoke_token');
    console.log('Token status:', token ? 'Token found' : 'No token found');
    if (!token) return alert('Bạn cần đăng nhập để thanh toán.');

    try {
      console.log('Bắt đầu xử lý thanh toán ZaloPay với gói:', selectedPackage);
        
        // Xác định packageId từ selectedPackage
        let packageId = selectedPackage.id;
        
        console.log('Package ID trước khi xử lý:', packageId, 'type:', typeof packageId);
        
        // Đảm bảo packageId là số
        if (typeof packageId === 'string') {
          packageId = parseInt(packageId);
          console.log('Package ID sau khi parse:', packageId);
        }
        
        // Kiểm tra lại tính hợp lệ của packageId
        if (isNaN(packageId) || packageId <= 0) {
          console.warn('Package ID không hợp lệ:', packageId);
          
          // Xác định packageId dựa trên membershipType
          if (selectedPackage.membershipType === 'premium') {
            packageId = 2;
          } else if (selectedPackage.membershipType === 'pro') {
            packageId = 3;
          } else {
            packageId = 1; // Fallback là gói free
          }
          console.log('Package ID được gán lại dựa trên membershipType:', packageId);
        }
        
        console.log(`Gói thanh toán: ${selectedPackage.name} (ID: ${packageId}, Type: ${selectedPackage.membershipType})`);
        
        // Không cho phép thanh toán gói free
        if (packageId === 1 || selectedPackage.membershipType === 'free') {
          alert('Không thể thanh toán gói miễn phí');
          navigate('/membership');
          return;
        }
        
        // Đảm bảo packageId là số nguyên hợp lệ trước khi gửi lên server
        const validPackageId = Number.isInteger(packageId) ? packageId : (
          selectedPackage.membershipType === 'premium' ? 2 : 
          selectedPackage.membershipType === 'pro' ? 3 : 1
        );
        
        console.log(`PackageId trước khi gửi lên server: ${validPackageId} (${typeof validPackageId})`);
        
        const zaloPayData = {
          packageId: validPackageId,
          amount: selectedPackage.price,
          redirectUrl: `${window.location.origin}/payment/success` // URL để chuyển hướng sau khi thanh toán
        };

        console.log('Gọi API ZaloPay với dữ liệu:', zaloPayData);
        
        const zaloPayRes = await axios.post('/api/payments/zalopay/create', zaloPayData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('ZaloPay API response:', zaloPayRes.data);

        if (zaloPayRes.data.success) {
          // Lấy order_url từ đúng vị trí trong response
          // Có thể order_url nằm trực tiếp trong data hoặc trong data.data
          const order_url = zaloPayRes.data.order_url || (zaloPayRes.data.data && zaloPayRes.data.data.order_url);
          
          if (order_url) {
            console.log('Chuyển hướng đến ZaloPay URL:', order_url);
            // Đảm bảo thông tin gói có ID đúng trước khi lưu
            const packageToSave = {
              ...selectedPackage,
              id: zaloPayRes.data.data?.packageId || packageId || selectedPackage.id // Lấy ID từ response, packageId đã xác định, hoặc từ selectedPackage
            };
            
            // Đảm bảo ID là số
            if (typeof packageToSave.id === 'string') {
              packageToSave.id = parseInt(packageToSave.id);
            }
            
            console.log('Lưu thông tin gói trước khi chuyển hướng:', packageToSave);
            console.log('Chi tiết gói thanh toán:', {
              id: packageToSave.id,
              type: typeof packageToSave.id,
              membershipType: packageToSave.membershipType,
              name: packageToSave.name,
              price: packageToSave.price
            });
            
            // Lưu thông tin gói để sau khi thanh toán quay lại
            const packageJson = JSON.stringify(packageToSave);
            console.log('Chuỗi JSON trước khi lưu:', packageJson);
            
            localStorage.setItem('pendingPaymentPackage', packageJson);
            localStorage.setItem('selectedPackage', packageJson);
            
            // Kiểm tra lại dữ liệu đã lưu
            const savedPackage = localStorage.getItem('selectedPackage');
            console.log('Dữ liệu đã lưu trong localStorage:', savedPackage);
            
            // Chuyển hướng người dùng đến trang thanh toán ZaloPay
            window.location.href = order_url;
            return;
          } else {
            console.error('ZaloPay response không có order_url:', zaloPayRes.data);
            throw new Error('Không nhận được URL thanh toán từ ZaloPay');
          }
        } else {
          throw new Error(zaloPayRes.data.message || 'Tạo thanh toán ZaloPay thất bại');
        }
    } catch (err) {
      console.error('Payment error:', err);
      alert(`Thanh toán thất bại: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoBack = () => navigate('/membership');

  if (!selectedPackage) return <div>Đang tải thông tin gói...</div>;

  if (isProcessing) return <div>{processingMessage}</div>;

  const totalAmount = selectedPackage.price || 0;

  return (
    <div className="payment-container">
      <div className="payment-content">
        <div className="payment-methods-section">
          <h2>Phương thức thanh toán</h2>
          <div className="zalopay-option">
            <div className="zalopay-info">
              <img 
                src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png" 
                alt="ZaloPay Logo" 
                className="zalopay-logo"
              />
              <div className="zalopay-details">
                <h3>ZaloPay</h3>
                <p>Thanh toán an toàn và nhanh chóng qua ZaloPay</p>
              </div>
            </div>
          </div>
        </div>

        <div className="payment-summary-section">
          <h2>Tóm tắt đơn hàng</h2>
          <div className="package-details">
            <div className="package-info">
              <span>Gói {selectedPackage.name}</span>
              <span>{totalAmount.toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="total-amount">
              <span>Tổng cộng</span>
              <span>{totalAmount.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>

          <div className="payment-agreement">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={() => setTermsAccepted(!termsAccepted)}
            />
            <label htmlFor="terms">Tôi đồng ý với điều khoản và điều kiện sử dụng dịch vụ</label>
          </div>

          <div className="payment-actions">
            <button onClick={handlePayment} disabled={!termsAccepted}>Thanh toán ngay</button>
            <button onClick={handleGoBack}>Quay lại</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pay;