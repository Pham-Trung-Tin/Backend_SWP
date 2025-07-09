import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './MembershipPackage.css';
import { FaRocket, FaCheck, FaTimes, FaLock, FaLeaf, FaCrown } from 'react-icons/fa';

const iconMap = {
  free: <FaRocket />,
  premium: <FaLeaf />,
  pro: <FaCrown />,
};

export default function MembershipPackage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [packageFeatures, setPackageFeatures] = useState({});

  useEffect(() => {
    const fetchPackagesAndFeatures = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Đang gọi API để lấy danh sách gói thành viên...');
        
        // Sử dụng URL đầy đủ thay vì URL tương đối
        const res = await fetch('http://localhost:5000/api/packages');
        
        // Kiểm tra response trước khi parse JSON
        if (!res.ok) {
          throw new Error(`Lỗi API packages: ${res.status} ${res.statusText}`);
        }
        
        const json = await res.json();
        console.log('Kết quả API packages:', json);
        
        if (json.success && json.data && Array.isArray(json.data)) {
          console.log('Số lượng gói nhận được:', json.data.length);
          
          // Lưu các gói đã nhận từ API
          const receivedPackages = json.data;
          
          // Lấy tính năng cho từng gói
          for (const pkg of receivedPackages) {
            if (pkg.id) {
              try {
                // Lấy features cho gói hiện tại
                await fetchFeatures(pkg.id);
              } catch (featureError) {
                console.error(`Lỗi khi lấy features cho gói ${pkg.id}:`, featureError);
                // Không dừng xử lý nếu không lấy được features cho một gói
              }
            }
          }
          
          // Cập nhật state packages sau khi đã lấy xong features
          setPackages(receivedPackages);
        } else {
          throw new Error(json.message || 'Không nhận được dữ liệu hợp lệ từ server');
        }
      } catch (err) {
        console.error('Lỗi khi lấy dữ liệu gói thành viên:', err);
        setError(err.message);
        addToast(`Lỗi kết nối đến server: ${err.message}`, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchPackagesAndFeatures();
  }, []);

  const addToast = (message, type = 'error') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const canPurchasePackage = (type) => {
    if (!user) return true;
    const current = user.membership || 'free';
    const levels = { free: 0, premium: 1, pro: 2 };
    return levels[current] < levels[type];
  };

  const handlePackageSelection = (pkg, e) => {
    e?.preventDefault();
    
    // Đảm bảo có membershipType
    const membershipType = pkg.membershipType || (
      pkg.id === 1 ? 'free' : 
      pkg.id === 2 ? 'premium' : 
      pkg.id === 3 ? 'pro' : 'free'
    );
    
    // Kiểm tra người dùng đã đăng nhập chưa
    if (!user) {
      addToast('Bạn cần đăng nhập để mua gói thành viên!', 'error');
      setTimeout(() => {
        navigate('/login');
      }, 1000);
      return;
    }
    
    // Nếu gói miễn phí, không cần thanh toán
    if (membershipType === 'free' || (pkg.price !== undefined && Number(pkg.price) === 0)) {
      addToast('Đăng ký gói miễn phí thành công!', 'success');
      setTimeout(() => {
        navigate('/');
      }, 1500);
      return;
    }
    
    // Đảm bảo dữ liệu gói đầy đủ trước khi chuyển sang trang thanh toán
    const packageToSend = {
      ...pkg,
      id: pkg.id?.toString() || membershipType === 'free' ? '1' : membershipType === 'premium' ? '2' : '3',
      membershipType: membershipType,
      name: pkg.name || (membershipType === 'free' ? 'Free' : membershipType === 'premium' ? 'Premium' : 'Pro'),
      price: pkg.price !== undefined ? Number(pkg.price) : (membershipType === 'premium' ? 99000 : 999000),
      period: pkg.period || (membershipType === 'pro' ? 'năm' : 'tháng')
    };
    
    console.log('Đang chuyển hướng đến trang thanh toán với gói:', packageToSend);
    
    // Lưu thông tin gói vào localStorage để đề phòng chuyển trang bị lỗi
    try {
      localStorage.setItem('selectedPackage', JSON.stringify(packageToSend));
    } catch (error) {
      console.error('Lỗi khi lưu gói vào localStorage:', error);
    }
    
    // Hiện toast thông báo
    addToast(`Đang chuyển đến trang thanh toán cho gói ${packageToSend.name}...`, 'info');
    
    // Chuyển hướng đến trang thanh toán với thông tin gói
    setTimeout(() => {
      navigate('/payment', { state: { package: packageToSend } });
    }, 500);
  };

  // Hàm lấy tính năng cho từng gói
  const fetchFeatures = async (packageId) => {
    try {
      console.log(`Đang lấy tính năng cho gói có ID: ${packageId}`);
      const res = await fetch(`http://localhost:5000/api/packages/features?package_id=${packageId}`);
      
      if (!res.ok) {
        throw new Error(`Lỗi khi lấy features: ${res.status}`);
      }
      
      const json = await res.json();
      
      if (json.success && json.data) {
        // Lọc ra features được bật và tắt
        const enabledFeatures = json.data
          .filter(feature => feature.enabled === 1)
          .map(feature => feature.feature_name);
          
        const disabledFeatures = json.data
          .filter(feature => feature.enabled === 0)
          .map(feature => feature.feature_name);
          
        console.log(`Đã lấy được ${enabledFeatures.length} features bật và ${disabledFeatures.length} features tắt cho gói ID ${packageId}`);
        
        // Cập nhật state packageFeatures
        setPackageFeatures(prev => ({
          ...prev,
          [packageId]: {
            features: enabledFeatures,
            disabledFeatures: disabledFeatures
          }
        }));
        
        return {
          features: enabledFeatures,
          disabledFeatures: disabledFeatures
        };
      }
      
      return null;
    } catch (err) {
      console.error(`Lỗi khi lấy tính năng cho gói ${packageId}:`, err);
      return null;
    }
  };

  // Hàm để tạo dữ liệu gói mặc định nếu không có dữ liệu từ API
  const getDefaultPackages = () => {
    return [
      {
        id: 1,
        name: "Free",
        price: 0,
        period: "tháng",
        membershipType: "free",
        description: "Bắt đầu miễn phí",
        features: ["Theo dõi cai thuốc", "Lập kế hoạch cá nhân"],
        disabledFeatures: ["Huy hiệu & cộng đồng", "Chat huấn luyện viên", "Video call tư vấn"]
      },
      {
        id: 2,
        name: "Premium",
        price: 99000,
        period: "tháng",
        membershipType: "premium",
        popular: true,
        description: "Hỗ trợ toàn diện",
        features: ["Theo dõi cai thuốc", "Lập kế hoạch cá nhân", "Huy hiệu & cộng đồng", "Chat huấn luyện viên", "Video call tư vấn"],
        disabledFeatures: []
      },
      {
        id: 3,
        name: "Pro",
        price: 999000,
        period: "năm",
        membershipType: "pro",
        description: "Hỗ trợ toàn diện",
        features: ["Theo dõi cai thuốc", "Lập kế hoạch cá nhân", "Huy hiệu & cộng đồng", "Chat huấn luyện viên", "Video call tư vấn"],
        disabledFeatures: []
      }
    ];
  };

  // Quyết định sử dụng dữ liệu nào - từ API hoặc fallback
  const displayPackages = packages.length > 0 ? packages : getDefaultPackages();

  return (
    <div className="membership-page-wrapper">
      <div className="container py-4">
        {!user ? (
          <div className="card text-center my-5 p-4">
            <h4>Bạn cần đăng nhập để xem gói thành viên</h4>
            <button className="btn btn-primary" onClick={() => navigate('/login')}>Đăng nhập</button>
          </div>
        ) : loading ? (
          <div className="text-center my-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="mt-3">Đang tải thông tin gói thành viên...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger my-5" role="alert">
            <h4 className="alert-heading">Không thể tải dữ liệu!</h4>
            <p>{error}</p>
            <hr />
            <p className="mb-0">
              <button 
                className="btn btn-sm btn-outline-danger" 
                onClick={() => window.location.reload()}
              >
                Tải lại trang
              </button>
            </p>
          </div>
        ) : (
          <>
            <section className="pricing-section">
              <h2>Gói thành viên</h2>
              <p className="pricing-subtitle">Chọn gói phù hợp với bạn</p>
              <div className="pricing-grid">
                {displayPackages.map(pkg => {
                  // Đảm bảo membershipType luôn tồn tại
                  const membershipType = pkg.membershipType || (
                    pkg.id === 1 ? 'free' : 
                    pkg.id === 2 ? 'premium' : 
                    pkg.id === 3 ? 'pro' : 'free'
                  );
                  
                  const owned = user?.membership === membershipType;
                  const disabled = !canPurchasePackage(membershipType);
                  const icon = iconMap[membershipType] || <FaRocket />;
                  
                  // Đảm bảo các thuộc tính quan trọng luôn có giá trị
                  const packageName = pkg.name || (
                    membershipType === 'free' ? 'Free' :
                    membershipType === 'premium' ? 'Premium' :
                    membershipType === 'pro' ? 'Pro' : 'Gói thành viên'
                  );
                  
                  const packagePrice = pkg.price !== undefined ? Number(pkg.price) : (
                    membershipType === 'free' ? 0 :
                    membershipType === 'premium' ? 99000 :
                    membershipType === 'pro' ? 999000 : 0
                  );
                  
                  const packagePeriod = pkg.period || (
                    membershipType === 'pro' ? 'năm' : 'tháng'
                  );
                  
                  const packageDesc = pkg.description || (
                    membershipType === 'free' ? 'Bắt đầu miễn phí' :
                    'Hỗ trợ toàn diện'
                  );

                  // Lấy features từ state packageFeatures nếu có
                  let features = [];
                  let disabledFeatures = [];
                  
                  if (packageFeatures[pkg.id]) {
                    features = packageFeatures[pkg.id].features || [];
                    disabledFeatures = packageFeatures[pkg.id].disabledFeatures || [];
                  } else {
                    // Nếu không có trong packageFeatures, thử lấy từ pkg object
                    features = Array.isArray(pkg.features) ? pkg.features : [];
                    disabledFeatures = Array.isArray(pkg.disabledFeatures) ? pkg.disabledFeatures : [];
                  }
                  
                  // Nếu không có features, tạo mặc định theo loại gói
                  const defaultFeatures = () => {
                    if (membershipType === 'free') {
                      return {
                        enabled: ["Theo dõi cai thuốc", "Lập kế hoạch cá nhân"],
                        disabled: ["Huy hiệu & cộng đồng", "Chat huấn luyện viên", "Video call tư vấn"]
                      };
                    } else {
                      return {
                        enabled: ["Theo dõi cai thuốc", "Lập kế hoạch cá nhân", "Huy hiệu & cộng đồng", "Chat huấn luyện viên", "Video call tư vấn"],
                        disabled: []
                      };
                    }
                  };
                  
                  const displayFeatures = features.length > 0 ? features : defaultFeatures().enabled;
                  const displayDisabledFeatures = disabledFeatures.length > 0 ? disabledFeatures : defaultFeatures().disabled;

                  return (
                    <div
                      key={pkg.id || membershipType}
                      className={`pricing-card ${membershipType} ${pkg.popular ? 'highlight' : ''} ${disabled && owned ? 'disabled-package' : ''}`}
                    >
                      {pkg.popular && <div className="best-value">Phổ biến nhất</div>}
                      {disabled && owned && <div className="package-owned"><FaLock /> Đã sở hữu</div>}
                      <div className="pricing-header">
                        <h3>{icon} {packageName}</h3>
                        <p className="pricing-desc">{packageDesc}</p>
                        <div className="pricing-price">
                          <span className="price">{packagePrice.toLocaleString('vi-VN')}đ</span>
                          <span className="period">/{packagePeriod}</span>
                        </div>
                      </div>
                      <div className="pricing-features">
                        {displayFeatures.map((f, i) => (
                          <div key={i} className="feature-item"><FaCheck /> <span>{f}</span></div>
                        ))}
                        {displayDisabledFeatures.map((f, i) => (
                          <div key={`d-${i}`} className="feature-item disabled"><FaTimes /> <span>{f}</span></div>
                        ))}
                      </div>
                      <button
                        className={`pricing-btn ${disabled ? 'disabled-btn' : ''}`}
                        onClick={(e) => {
                          if (!disabled) {
                            console.log('Chọn gói thành viên:', pkg);
                            const packageData = {
                              ...pkg,
                              membershipType: membershipType
                            };
                            handlePackageSelection(packageData, e);
                          }
                        }}
                        disabled={disabled}
                      >
                        {packagePrice === 0 ? 'Bắt đầu miễn phí' : 
                          disabled ? 'Đã sở hữu' : 
                          membershipType === 'premium' ? 'Đăng ký Premium' : 
                          membershipType === 'pro' ? 'Đăng ký Pro' : 
                          'Đăng ký ngay'
                        }
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Toast Container */}
            <div className="toast-container">
              {toasts.map(t => (
                <div key={t.id} className={`toast toast-${t.type}`}>
                  <span>{t.message}</span>
                  <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>×</button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
