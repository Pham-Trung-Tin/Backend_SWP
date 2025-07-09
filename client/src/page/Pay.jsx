import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Pay.css';
import { FaCreditCard, FaWallet, FaMoneyBillWave, FaPaypal } from 'react-icons/fa';
import axios from 'axios';

const Pay = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('zalopay'); // Default payment method
  const [cardInfo, setCardInfo] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');

  useEffect(() => {
    console.log('Pay.jsx useEffect - Kiểm tra dữ liệu gói');
    console.log('Location state:', location.state);
    
    // Kiểm tra nếu có dữ liệu từ trang chọn gói qua location.state
    if (location.state && location.state.package) {
      console.log('Nhận dữ liệu từ location.state:', location.state.package);
      
      // Kiểm tra xem dữ liệu package có hợp lệ không
      if (location.state.package && typeof location.state.package === 'object') {
        const packageData = location.state.package;
        
        // Đảm bảo gói có các thuộc tính cần thiết
        if (!packageData.name) {
          console.warn('Package is missing name property:', packageData);
          packageData.name = packageData.membershipType === 'free' ? 'Free' : 
                             packageData.membershipType === 'premium' ? 'Premium' : 
                             packageData.membershipType === 'pro' ? 'Pro' : 'Unknown Package';
        }
        
        if (!packageData.id) {
          console.warn('Package is missing id property:', packageData);
          packageData.id = packageData.membershipType === 'free' ? '1' : 
                          packageData.membershipType === 'premium' ? '2' : 
                          packageData.membershipType === 'pro' ? '3' : '1';
        }
        
        if (typeof packageData.price !== 'number') {
          console.warn('Package price is not a number:', packageData.price);
          packageData.price = Number(packageData.price) || 0;
        }
        
        console.log('Dữ liệu gói đã được chuẩn hóa:', packageData);
        setSelectedPackage(packageData);
        
        // Lưu vào localStorage để bảo hiểm nếu trang bị refresh
        try {
          const packageJson = JSON.stringify(packageData);
          console.log('Dữ liệu JSON trước khi lưu:', packageJson);
          localStorage.setItem('selectedPackage', packageJson);
          console.log('Đã sao lưu gói vào localStorage từ location.state');
        } catch (error) {
          console.error('Lỗi khi lưu gói vào localStorage:', error);
        }
        return;
      } else {
        console.error('Dữ liệu package từ location.state không hợp lệ:', location.state.package);
      }
    } 
    
    // Nếu không có trong location.state, thử lấy từ localStorage
    try {
      const storedPackage = localStorage.getItem('selectedPackage');
      if (storedPackage && storedPackage !== 'undefined' && storedPackage !== 'null') {
        console.log('Raw stored package data:', storedPackage);
        const packageData = JSON.parse(storedPackage);
        console.log('Nhận dữ liệu từ localStorage:', packageData);
        setSelectedPackage(packageData);
        return;
      } else {
        console.log('Không có dữ liệu gói hợp lệ trong localStorage, giá trị nhận được:', storedPackage);
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu từ localStorage:', error);
    }
    
    // Nếu không có dữ liệu từ cả hai nguồn, chuyển về trang chọn gói
    console.log('Không tìm thấy dữ liệu gói, chuyển hướng về trang membership');
    navigate('/membership');
    
    // Không xóa dữ liệu ngay trong cleanup function để tránh mất dữ liệu khi chuyển trang
    // Chỉ cần dọn dẹp khi thực sự cần thiết (sau khi thanh toán hoàn tất)
    return () => {
      // Kiểm tra xem có đang chuyển đến trang thành công không
      if (window.location.pathname === '/payment/success') {
        try {
          localStorage.removeItem('selectedPackage');
          console.log('Đã xóa dữ liệu gói khỏi localStorage khi thanh toán thành công');
        } catch (e) {
          console.error('Lỗi khi xóa dữ liệu từ localStorage:', e);
        }
      } else {
        console.log('Giữ lại dữ liệu gói trong localStorage khi chuyển trang');
      }
    };
  }, [location, navigate]);

  // Xử lý thay đổi phương thức thanh toán
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  // Xử lý thay đổi thông tin thẻ
  const handleCardInfoChange = (e) => {
    const { name, value } = e.target;
    setCardInfo({
      ...cardInfo,
      [name]: value
    });
  };  // Xử lý khi nhấn nút thanh toán
  const handlePayment = async (e) => {
    e.preventDefault();
    console.log('Bắt đầu xử lý thanh toán với gói:', selectedPackage);
    
    if (!termsAccepted) {
      alert('Vui lòng đồng ý với điều khoản sử dụng dịch vụ');
      return;
    }
    
    if (!selectedPackage) {
      console.error('Lỗi: Không có thông tin gói được chọn!');
      alert('Không tìm thấy thông tin gói. Vui lòng thử lại.');
      navigate('/membership');
      return;
    }
    
    // Kiểm tra xem gói có đủ thông tin cần thiết không
    if (!selectedPackage.price || !selectedPackage.name) {
      console.error('Lỗi: Gói không có đủ thông tin cần thiết:', selectedPackage);
      alert('Thông tin gói không đầy đủ. Vui lòng thử lại.');
      navigate('/membership');
      return;
    }
    
    // Đảm bảo gói có ID
    if (!selectedPackage.id) {
      console.log('Thiếu ID gói, đang thêm ID dựa vào loại membership:', selectedPackage.membershipType);
      const membershipTypeToId = {
        'free': '1',
        'premium': '2', 
        'pro': '3'
      };
      selectedPackage.id = membershipTypeToId[selectedPackage.membershipType] || '1';
    }
    
    console.log('Thông tin gói hợp lệ, tiếp tục xử lý thanh toán...');

    // Hiển thị loading hoặc thông báo đang xử lý thanh toán dựa trên phương thức thanh toán
    setIsProcessing(true);
    
    // Hiển thị thông báo xử lý dựa vào phương thức thanh toán
    let message = '';
    switch(paymentMethod) {
      case 'creditCard':
        message = 'Đang xác thực thông tin thẻ...';
        break;
      case 'momo':
        message = 'Đang chờ thanh toán từ ví Momo...';
        break;
      case 'zalopay':
        message = 'Đang chờ thanh toán từ ZaloPay...';
        break;
      case 'paypal':
        message = 'Đang chuyển hướng đến PayPal...';
        break;
      default:
        message = 'Đang xử lý thanh toán...';
    }
    
    console.log(`Phương thức thanh toán: ${paymentMethod}, Thông báo: ${message}`);
    
    setProcessingMessage(message);
    
    console.log(`Đang xử lý thanh toán gói ${selectedPackage.name} với giá ${selectedPackage.price.toLocaleString()}đ qua ${paymentMethod}`);
    
    try {
      // Lấy token xác thực từ localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Bạn cần đăng nhập để thực hiện thanh toán');
      }
      
      // Map phương thức thanh toán frontend sang backend
      const backendPaymentMethod = {
        'creditCard': 'credit_card',
        'momo': 'momo',
        'zalopay': 'vnpay', // Giả định zalopay trên frontend map sang vnpay trên backend
        'paypal': 'other'
      }[paymentMethod] || 'other';
      
      // Chuẩn bị dữ liệu thanh toán
      const paymentData = {
        packageId: selectedPackage.id,
        amount: totalAmount,
        paymentMethod: backendPaymentMethod,
        paymentStatus: 'pending',
        paymentDetails: {
          packageName: selectedPackage.name,
          price: selectedPackage.price,
          vat: vat,
          totalAmount: totalAmount,
          paymentTime: new Date().toISOString()
        }
      };
      
      // Thêm thông tin thẻ nếu phương thức thanh toán là thẻ tín dụng
      if (paymentMethod === 'creditCard') {
        paymentData.paymentDetails.cardInfo = {
          cardName: cardInfo.cardName,
          cardNumberLast4: cardInfo.cardNumber.slice(-4) // Chỉ lưu 4 số cuối vì lý do bảo mật
        };
      }
      
      // Gọi API tạo thanh toán
      console.log('Gọi API tạo thanh toán với dữ liệu:', paymentData);
      const response = await axios.post('/api/payments/create', paymentData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Kết quả API tạo thanh toán:', response.data);
      
      if (response.data.success) {
        const paymentId = response.data.data.id;
        // Lưu transaction ID để sử dụng trong bước xác minh
        // Nếu backend không trả về transaction_id, tạo một cái tạm thời
        const transactionId = response.data.data.transaction_id || `${backendPaymentMethod}_${Date.now()}`;
        
        // Lưu thông tin giao dịch vào sessionStorage để dùng khi cần
        sessionStorage.setItem('pendingPayment', JSON.stringify({
          paymentId,
          transactionId,
          packageInfo: selectedPackage,
          paymentMethod,
          amount: totalAmount,
          timestamp: new Date().toISOString()
        }));
        
        // Mô phỏng gọi API xác minh thanh toán (trong thực tế sẽ do cổng thanh toán callback)
        // Trong production, đoạn này sẽ được thực hiện bởi cổng thanh toán và gọi API backend trực tiếp
        try {
          console.log('Mô phỏng xác minh thanh toán với transactionId:', transactionId);
          
          // Tạo mã đơn hàng ngẫu nhiên
          const orderId = `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
          
          // Gọi API xác minh thanh toán
          const verifyResponse = await axios.post('/api/payments/verify', {
            transactionId: transactionId,
            paymentStatus: 'completed', // Giả sử thanh toán thành công
            paymentMethod: backendPaymentMethod,
            amount: totalAmount,
            paymentDetails: {
              orderId: orderId,
              paymentTime: new Date().toISOString()
            }
          });
          
          console.log('Kết quả API xác minh thanh toán:', verifyResponse.data);
          
          if (verifyResponse.data.success) {
            // Lưu thông tin thanh toán thành công để hiển thị ở trang success
            const successData = {
              package: selectedPackage,
              paymentMethod: paymentMethod,
              paymentId: paymentId,
              transactionId: transactionId,
              orderId: orderId
            };
            
            // Chuyển hướng người dùng sau khi thanh toán - sử dụng replace để không thể quay lại
            navigate('/payment/success', { 
              replace: true,
              state: successData 
            });
          } else {
            throw new Error(verifyResponse.data.message || 'Xác minh thanh toán thất bại');
          }
        } catch (verifyError) {
          console.error('Lỗi xác minh thanh toán:', verifyError);
          setIsProcessing(false);
          
          // Thông báo lỗi chi tiết hơn
          let errorMessage = 'Xác minh thanh toán thất bại';
          if (verifyError.response && verifyError.response.data) {
            errorMessage = verifyError.response.data.message || errorMessage;
          } else if (verifyError.message) {
            errorMessage = verifyError.message;
          }
          
          alert(`Thanh toán không thành công: ${errorMessage}`);
        }
      } else {
        throw new Error(response.data.message || 'Tạo thanh toán thất bại');
      }
    } catch (error) {
      console.error('Lỗi khi thanh toán:', error);
      setIsProcessing(false);
      
      // Thông báo lỗi chi tiết hơn
      let errorMessage = 'Thanh toán thất bại';
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Thanh toán thất bại: ${errorMessage}`);
    }
  };

  // Xử lý nút quay lại
  const handleGoBack = () => {
    navigate('/membership');
  };
    // Hiển thị loading khi chưa có dữ liệu gói
  if (!selectedPackage) {
    return (
      <div className="payment-container">
        <div className="payment-loading">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin...</p>
        </div>
      </div>
    );
  }
  
  // Hiển thị màn hình xử lý thanh toán
  if (isProcessing) {
    return (
      <div className="payment-container">
        <div className="payment-processing">
          <div className="processing-animation">
            <div className="loading-spinner"></div>
            {paymentMethod === 'creditCard' && <div className="credit-card-icon">💳</div>}
            {paymentMethod === 'momo' && <div className="momo-icon">M</div>}
            {paymentMethod === 'zalopay' && <div className="zalopay-icon">Z</div>}
            {paymentMethod === 'paypal' && <div className="paypal-icon">P</div>}
          </div>
          <h2>{processingMessage}</h2>
          <p>Vui lòng không đóng trang này trong quá trình xử lý...</p>
        </div>
      </div>
    );
  }

  // Tính VAT và tổng tiền - đảm bảo giá trị hợp lệ
  const price = selectedPackage && selectedPackage.price ? Number(selectedPackage.price) : 0;
  const vat = price * 0.1;
  const totalAmount = price + vat;

  return (
    <div className="payment-container">
      <div className="payment-content">
        <div className="payment-methods-section">
          <h2>Phương thức thanh toán</h2>
          
          <div className="payment-method-options">
            <div className="payment-option">
              <input 
                type="radio" 
                id="creditCard" 
                name="paymentMethod" 
                checked={paymentMethod === 'creditCard'} 
                onChange={() => handlePaymentMethodChange('creditCard')} 
              />              <label htmlFor="creditCard">
                <FaCreditCard style={{marginRight: '10px'}} /> Thẻ tín dụng/ghi nợ
              </label>
            </div>
            
            <div className="payment-option">
              <input 
                type="radio" 
                id="momo" 
                name="paymentMethod" 
                checked={paymentMethod === 'momo'} 
                onChange={() => handlePaymentMethodChange('momo')} 
              />
              <label htmlFor="momo">
                <FaWallet style={{marginRight: '10px'}} /> Ví Momo
              </label>
            </div>
            
            <div className="payment-option">
              <input 
                type="radio" 
                id="zalopay" 
                name="paymentMethod" 
                checked={paymentMethod === 'zalopay'} 
                onChange={() => handlePaymentMethodChange('zalopay')} 
              />
              <label htmlFor="zalopay">
                <FaMoneyBillWave style={{marginRight: '10px'}} /> ZaloPay
              </label>
            </div>
            
            <div className="payment-option">
              <input 
                type="radio" 
                id="paypal" 
                name="paymentMethod" 
                checked={paymentMethod === 'paypal'} 
                onChange={() => handlePaymentMethodChange('paypal')} 
              />
              <label htmlFor="paypal">
                <FaPaypal style={{marginRight: '10px'}} /> PayPal
              </label>
            </div>
          </div>
            {paymentMethod === 'creditCard' && (
            <div className="card-info-form">
              <h3>Thông tin thẻ</h3>
              <div className="form-group">
                <label htmlFor="cardName">Tên chủ thẻ</label>
                <input 
                  type="text" 
                  id="cardName" 
                  name="cardName" 
                  placeholder="NGUYEN VAN A" 
                  value={cardInfo.cardName}
                  onChange={handleCardInfoChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="cardNumber">Số thẻ</label>
                <input 
                  type="text" 
                  id="cardNumber" 
                  name="cardNumber" 
                  placeholder="1234 5678 9012 3456" 
                  value={cardInfo.cardNumber}
                  onChange={handleCardInfoChange}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group half-width">
                  <label htmlFor="expiryDate">Ngày hết hạn</label>
                  <input 
                    type="text" 
                    id="expiryDate" 
                    name="expiryDate" 
                    placeholder="MM/YY" 
                    value={cardInfo.expiryDate}
                    onChange={handleCardInfoChange}
                    required
                  />
                </div>
                <div className="form-group half-width">
                  <label htmlFor="cvv">Mã CVV</label>
                  <input 
                    type="text" 
                    id="cvv" 
                    name="cvv" 
                    placeholder="123" 
                    value={cardInfo.cvv}
                    onChange={handleCardInfoChange}
                    required
                  />
                </div>
              </div>
            </div>
          )}
          
          {paymentMethod === 'momo' && (
            <div className="momo-payment-form">
              <div className="qr-code-container">
                <h3>Quét mã để thanh toán qua Ví Momo</h3>
                <div className="qr-code">
                  <div className="qr-image">
                    {/* QR code placeholder - would be dynamic in real app */}
                    <div className="qr-placeholder">
                      <div className="qr-grid"></div>
                    </div>
                  </div>
                  <p className="qr-instruction">Sử dụng ứng dụng Momo để quét mã QR</p>
                </div>
                <div className="payment-instructions">
                  <h4>Hướng dẫn thanh toán:</h4>
                  <ol>
                    <li>Mở ứng dụng Momo trên điện thoại của bạn</li>
                    <li>Chọn "Quét mã QR" trong ứng dụng</li>
                    <li>Quét mã QR được hiển thị ở trên</li>
                    <li>Xác nhận thanh toán trên ứng dụng Momo</li>
                    <li>Đợi xác nhận thanh toán thành công</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
          
          {paymentMethod === 'zalopay' && (
            <div className="zalopay-payment-form">
              <div className="qr-code-container">
                <h3>Quét mã để thanh toán qua ZaloPay</h3>
                <div className="qr-code">
                  <div className="qr-image zalopay">
                    {/* QR code placeholder - would be dynamic in real app */}
                    <div className="qr-placeholder">
                      <div className="qr-grid"></div>
                    </div>
                  </div>
                  <p className="qr-instruction">Sử dụng ứng dụng ZaloPay để quét mã QR</p>
                </div>
                <div className="payment-instructions">
                  <h4>Hướng dẫn thanh toán:</h4>
                  <ol>
                    <li>Mở ứng dụng ZaloPay trên điện thoại của bạn</li>
                    <li>Chọn "Quét mã QR" trong ứng dụng</li>
                    <li>Quét mã QR được hiển thị ở trên</li>
                    <li>Xác nhận thanh toán trên ứng dụng ZaloPay</li>
                    <li>Đợi xác nhận thanh toán thành công</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
          
          {paymentMethod === 'paypal' && (
            <div className="paypal-payment-form">
              <h3>Thanh toán bằng PayPal</h3>
              <div className="paypal-container">
                <div className="paypal-logo">
                  <div className="paypal-p">P</div>
                  <div className="paypal-a">a</div>
                  <div className="paypal-y">y</div>
                  <div className="paypal-p2">P</div>
                  <div className="paypal-a2">a</div>
                  <div className="paypal-l">l</div>
                </div>
                <p className="paypal-instruction">Bạn sẽ được chuyển đến trang web PayPal để hoàn tất thanh toán.</p>                <button className="paypal-button" onClick={handlePayment}></button>
                <div className="paypal-secure">
                  <span className="lock-icon">🔒</span> Thanh toán an toàn qua PayPal
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="payment-summary-section">
          <h2>Tóm tắt đơn hàng</h2>
          <div className="package-details">
            <div className="package-info">
              <span>Gói {selectedPackage.name}</span>
              <span>{selectedPackage.price.toLocaleString()}đ</span>
            </div>
            <div className="tax-info">
              <span>Thuế VAT (10%)</span>
              <span>{vat.toLocaleString()}đ</span>
            </div>
            <div className="total-amount">
              <span>Tổng cộng</span>
              <span>{totalAmount.toLocaleString()}đ</span>
            </div>
          </div>
          
          <div className="payment-agreement">
            <input 
              type="checkbox" 
              id="terms" 
              checked={termsAccepted}
              onChange={() => setTermsAccepted(!termsAccepted)}
            />
            <label htmlFor="terms">Tôi đồng ý với <a href="#">điều khoản</a> và <a href="#">điều kiện sử dụng dịch vụ</a></label>
          </div>
          
          <div className="payment-actions">
            <button className="payment-button" onClick={handlePayment} disabled={!termsAccepted}>
              Thanh toán ngay
            </button>
            <button className="back-button" onClick={handleGoBack}>
              Quay lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pay;