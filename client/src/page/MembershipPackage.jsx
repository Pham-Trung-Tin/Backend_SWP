import React, { useState, useEffect, useMemo } from 'react';
import MembershipDashboard from '../components/MembershipDashboard';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './MembershipPackage.css';
import { FaRocket, FaCheck, FaTimes, FaLock, FaLeaf, FaCrown } from 'react-icons/fa';

export default function MembershipPackage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [toasts, setToasts] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Lấy dữ liệu các gói từ API
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        console.log('Đang gọi API /api/packages để lấy thông tin gói...');
        
        // Sử dụng utility để kiểm tra API
        const apiTestResult = await testPackagesApi();
        console.log('Kết quả kiểm tra API:', apiTestResult);
        
        if (apiTestResult.success) {
          console.log('Số lượng gói nhận được:', apiTestResult.data.length);
          
          // Đảm bảo dữ liệu có đúng định dạng
          const formattedPackages = apiTestResult.data.map(pkg => {
            // Đảm bảo mỗi gói có membershipType
            if (!pkg.membershipType) {
              pkg.membershipType = pkg.id === 1 ? 'free' : pkg.id === 2 ? 'premium' : pkg.id === 3 ? 'pro' : `package-${pkg.id}`;
            }
            return pkg;
          });
          
          setPackages(formattedPackages);
          console.log('Đã cập nhật state packages với dữ liệu đã format:', formattedPackages);
        } else {
          console.error('Failed to load packages:', apiTestResult.message);
          addToast('Không thể tải dữ liệu gói thành viên', 'error');
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
        console.error('Error details:', error.message);
        addToast('Lỗi kết nối đến server', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPackages();
  }, []);
  
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
  
  // Chuyển đổi dữ liệu packages từ API thành định dạng để sử dụng trong component
  const packageDetails = useMemo(() => {
    // Map package types to ID values for consistency
    const packageTypeToId = {
      'free': '1',
      'premium': '2',
      'pro': '3'
    };
    
    // Map ID values to package types for reverse lookup
    const idToPackageType = {
      '1': 'free',
      '2': 'premium',
      '3': 'pro'
    };

    // Log the packages array received from API
    console.log('Raw packages from API:', packages);
    
    if (packages.length === 0) {
      // Sử dụng dữ liệu mặc định khi chưa load được từ API
      const defaultPackages = {
        free: {
          id: '1',
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
          id: '2',
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
          id: '3',
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
      
      console.log('Using default packages:', defaultPackages);
      return defaultPackages;
    }
    
    // Chuyển đổi từ array sang object với key là packageType (free, premium, pro)
    const packageDetailsObj = {};
    
    packages.forEach(pkg => {
      // Xác định package type dựa vào id hoặc membershipType
      let packageType = idToPackageType[pkg.id.toString()];
      if (!packageType && pkg.membershipType) {
        packageType = pkg.membershipType;
      }
      
      if (!packageType) {
        packageType = pkg.id === 1 ? 'free' : pkg.id === 2 ? 'premium' : pkg.id === 3 ? 'pro' : `package-${pkg.id}`;
      }
      
      packageDetailsObj[packageType] = {
        id: pkg.id.toString(),
        name: pkg.name,
        price: pkg.price,
        period: pkg.period,
        membershipType: packageType,
        features: pkg.features || [],
        disabledFeatures: pkg.disabledFeatures || []
      };
      
      // Cũng lưu theo ID để có thể truy cập cả 2 cách
      packageDetailsObj[pkg.id.toString()] = packageDetailsObj[packageType];
    });
    
    console.log('Package details after mapping:', packageDetailsObj);
    
    return packageDetailsObj;
  }, [packages]);
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
  const handlePackageSelection = (packageType, event) => {
    // Ngăn chặn hành vi mặc định nếu là sự kiện click
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
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

    // Kiểm tra xem gói có tồn tại không
    if (!packageDetails[packageType]) {
      console.error('Không tìm thấy thông tin gói:', packageType);
      addToast('Không tìm thấy thông tin gói. Vui lòng thử lại!', 'error');
      return;
    }
    
    console.log('Thông tin gói đang được lựa chọn:', packageDetails[packageType]);
    
    // Map package type to correct ID
    const packageTypeToId = {
      'free': '1',
      'premium': '2',
      'pro': '3'
    };
    
    // Tạo đối tượng gói đầy đủ và hợp lệ
    const packageToSend = {
      ...packageDetails[packageType],
      id: packageDetails[packageType].id || packageTypeToId[packageType] || packageType,
      membershipType: packageType  // Đảm bảo có membershipType chính xác
    };
    
    // Lưu thông tin gói vào localStorage để đề phòng chuyển trang bị lỗi
    try {
      const packageJson = JSON.stringify(packageToSend);
      localStorage.setItem('selectedPackage', packageJson);
      console.log('Đã lưu gói đã chọn vào localStorage:', packageToSend, 'JSON:', packageJson);
    } catch (error) {
      console.error('Lỗi khi lưu gói vào localStorage:', error);
    }

    // Chuyển hướng đến trang thanh toán với thông tin gói đã chọn
    console.log('Đang chuyển hướng đến trang thanh toán với gói:', packageToSend);
    console.log('JSON serialization test:', JSON.stringify(packageToSend));
    
    // Hiện toast thông báo
    addToast(`Đang chuyển đến trang thanh toán cho gói ${packageToSend.name}...`, 'info');
    
    // Sử dụng setTimeout để đảm bảo localStorage được cập nhật trước khi chuyển trang
    setTimeout(() => {
      try {
        // Đảm bảo state là đúng và không bị null/undefined
        const navigationState = { 
          package: {
            ...packageToSend,
            price: Number(packageToSend.price), // Đảm bảo price là số
            id: packageToSend.id.toString(),    // Đảm bảo id là string
          } 
        };
        
        console.log('State chính xác khi navigate:', navigationState);
        navigate('/payment', { state: navigationState });
      } catch (error) {
        console.error('Lỗi khi navigate đến trang payment:', error);
        alert(`Có lỗi xảy ra khi chuyển trang: ${error.message}. Vui lòng thử lại.`);
      }
    }, 200);
  };
  
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
      <div className="membership-page-wrapper">
        <div className="container py-4">
          {!user ? (
            <div className="card text-center my-5 p-4">
              <div className="card-body">
                <div className="alert alert-info">
                  <h4>Bạn cần đăng nhập để quản lý gói thành viên</h4>
                  <p>Vui lòng đăng nhập hoặc đăng ký để truy cập trang này</p>
                </div>
                <button className="btn btn-primary" onClick={() => document.getElementById('loginButton')?.click()}>
                  Đăng nhập
                </button>
              </div>
            </div>
          ) : (
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
                      </div>              </div>                    <button 
                      onClick={(e) => handlePackageSelection('free', e)} 
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
                      onClick={(e) => {
                        console.log('Clicked premium button, packageDetails:', packageDetails);
                        console.log('Premium package details:', packageDetails['premium']);
                        return canPurchasePackage('premium') && handlePackageSelection('premium', e);
                      }} 
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
                      onClick={(e) => {
                        console.log('Clicked pro button, packageDetails:', packageDetails);
                        console.log('Pro package details:', packageDetails['pro']);
                        return canPurchasePackage('pro') && handlePackageSelection('pro', e);
                      }} 
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
          )}
        </div>
      </div>
  );
}