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
        // Thử nhiều URL để đảm bảo kết nối được đến API
        const urls = [
          'http://localhost:5000/api/packages',
          '/api/packages'
        ];
        
        let res = null;
        let success = false;
        
        for (const url of urls) {
          try {
            console.log(`Thử gọi API với URL: ${url}`);
            res = await fetch(url);
            if (res.ok) {
              console.log(`✅ Gọi API thành công với URL: ${url}`);
              success = true;
              break;
            }
          } catch (urlError) {
            console.log(`❌ Lỗi với URL ${url}:`, urlError.message);
          }
        }
        
        if (!success || !res) {
          throw new Error(`Không thể kết nối đến API packages với tất cả các URL`);
        }
        
        const json = await res.json();
        console.log('Kết quả API packages:', json);
        
        if (json.success && json.data && Array.isArray(json.data)) {
          console.log('Số lượng gói nhận được:', json.data.length);
          
          // Lưu các gói đã nhận từ API, đã bao gồm thông tin features
          const receivedPackages = json.data;
          
          // Tạo packageFeatures từ thông tin packages
          const featuresMap = {};
          receivedPackages.forEach(pkg => {
            if (pkg.id) {
              featuresMap[pkg.id] = {
                features: Array.isArray(pkg.features) ? pkg.features : [],
                disabledFeatures: Array.isArray(pkg.disabledFeatures) ? pkg.disabledFeatures : []
              };
            }
          });
          
          // Cập nhật state packageFeatures
          setPackageFeatures(featuresMap);
          
          // Cập nhật state packages
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
    
    // Xác định ID gói đúng
    let packageId;
    if (pkg.id) {
      // Nếu có ID, giữ nguyên ID đó
      packageId = pkg.id;
    } else {
      // Nếu không có ID, xác định dựa trên membershipType
      packageId = membershipType === 'free' ? 1 : membershipType === 'premium' ? 2 : 3;
    }
    
    console.log(`Gói được chọn: ${pkg.name || membershipType}, ID: ${packageId}, Type: ${membershipType}`);
    
    // Đảm bảo dữ liệu gói đầy đủ trước khi chuyển sang trang thanh toán
    const packageToSend = {
      ...pkg,
      id: packageId, // Sử dụng ID đã xác định
      membershipType: membershipType,
      name: pkg.name || (membershipType === 'free' ? 'Free' : membershipType === 'premium' ? 'Premium' : 'Pro'),
      price: pkg.price !== undefined ? Number(pkg.price) : (membershipType === 'premium' ? 99000 : 999000),
      period: pkg.period || (membershipType === 'pro' ? 'năm' : 'tháng')
    };
    
    console.log('Đang chuyển hướng đến trang thanh toán với gói:', packageToSend);
    console.log('Chi tiết gói thanh toán:', {
      id: packageToSend.id,
      type: typeof packageToSend.id,
      membershipType: packageToSend.membershipType,
      name: packageToSend.name,
      price: packageToSend.price
    });
    
    // Lưu thông tin gói vào localStorage để đề phòng chuyển trang bị lỗi
    try {
      const packageJson = JSON.stringify(packageToSend);
      console.log('Chuỗi JSON trước khi lưu vào localStorage:', packageJson);
      localStorage.setItem('selectedPackage', packageJson);
      
      // Kiểm tra lại dữ liệu đã lưu
      const savedPackage = localStorage.getItem('selectedPackage');
      console.log('Dữ liệu đã lưu trong localStorage:', savedPackage);
      
      // Parse lại để kiểm tra
      const parsedPackage = JSON.parse(savedPackage);
      console.log('Dữ liệu sau khi parse lại:', parsedPackage);
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
      
      // Chúng ta sẽ lấy tính năng từ gói cụ thể API /api/packages/:id
      const packageUrl = `http://localhost:5000/api/packages/${packageId}`;
      console.log(`Gọi API để lấy thông tin gói và tính năng: ${packageUrl}`);
      
      const res = await fetch(packageUrl);
      
      if (!res.ok) {
        console.log(`❌ Gọi API package bị lỗi: ${res.status} ${res.statusText}`);
        throw new Error(`API trả về lỗi: ${res.status} ${res.statusText}`);
      }
      
      const json = await res.json();
      
      if (json.success && json.data) {
        // Lấy features và disabledFeatures trực tiếp từ response
        // Backend đã xử lý việc phân loại tính năng cho chúng ta
        const packageData = json.data;
        
        // Sử dụng features và disabledFeatures từ API
        const enabledFeatures = Array.isArray(packageData.features) ? packageData.features : [];
        const disabledFeatures = Array.isArray(packageData.disabledFeatures) ? packageData.disabledFeatures : [];
          
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
      
      // Nếu không lấy được dữ liệu từ API, sử dụng tính năng mặc định
      console.log(`Không nhận được dữ liệu hợp lệ từ API, sử dụng tính năng mặc định cho gói ${packageId}`);
      const defaultFeatures = getDefaultFeaturesForPackage(packageId);
      
      setPackageFeatures(prev => ({
        ...prev,
        [packageId]: defaultFeatures
      }));
      
      return defaultFeatures;
    } catch (err) {
      console.error(`Lỗi khi lấy tính năng cho gói ${packageId}:`, err);
      
      // Sử dụng tính năng mặc định khi có lỗi
      console.log(`Sử dụng tính năng mặc định cho gói ${packageId} do lỗi API`);
      const defaultFeatures = getDefaultFeaturesForPackage(packageId);
      
      setPackageFeatures(prev => ({
        ...prev,
        [packageId]: defaultFeatures
      }));
      
      return defaultFeatures;
    }
  };

  // Hàm để tạo dữ liệu gói mặc định nếu không có dữ liệu từ API
  const getDefaultPackages = () => {
    // Gói mặc định với ID là số
    return [
      {
        id: 1, // Đảm bảo id là số, không phải chuỗi
        name: "Free",
        price: 0,
        period: "tháng",
        membershipType: "free",
        description: "Bắt đầu miễn phí",
        features: ["Theo dõi cai thuốc", "Lập kế hoạch cá nhân"],
        disabledFeatures: ["Huy hiệu & cộng đồng", "Chat huấn luyện viên", "Video call tư vấn"]
      },
      {
        id: 2, // Đảm bảo id là số, không phải chuỗi
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
        id: 3, // Đảm bảo id là số, không phải chuỗi
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

  // Hàm để lấy tính năng mặc định cho từng gói khi API thất bại
  const getDefaultFeaturesForPackage = (packageId) => {
    const defaultFeaturesByPackageId = {
      1: { // Free
        features: ["Theo dõi cai thuốc", "Lập kế hoạch cá nhân"],
        disabledFeatures: ["Huy hiệu & cộng đồng", "Chat huấn luyện viên", "Video call tư vấn"]
      },
      2: { // Premium
        features: ["Theo dõi cai thuốc", "Lập kế hoạch cá nhân", "Huy hiệu & cộng đồng", "Chat huấn luyện viên", "Video call tư vấn"],
        disabledFeatures: []
      },
      3: { // Pro
        features: ["Theo dõi cai thuốc", "Lập kế hoạch cá nhân", "Huy hiệu & cộng đồng", "Chat huấn luyện viên", "Video call tư vấn"],
        disabledFeatures: []
      }
    };

    // Chuyển packageId sang số nếu là chuỗi
    const id = typeof packageId === 'string' ? parseInt(packageId) : packageId;
    
    return defaultFeaturesByPackageId[id] || {
      features: ["Theo dõi cai thuốc"],
      disabledFeatures: []
    };
  };

  // Quyết định sử dụng dữ liệu nào - từ API hoặc fallback
  const displayPackages = packages.length > 0 ? packages : getDefaultPackages();
  
  // Log thông tin gói để debug
  console.log('Gói thành viên được hiển thị:', displayPackages.map(pkg => ({
    id: pkg.id,
    type: typeof pkg.id,
    name: pkg.name,
    membershipType: pkg.membershipType,
    price: pkg.price
  })));

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
                  console.log(`Rendering package: ID=${pkg.id} (${typeof pkg.id}), Name=${pkg.name}, Type=${pkg.membershipType}`);
                  
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

                  // Lấy features từ pkg trực tiếp hoặc từ state packageFeatures nếu có
                  let features = [];
                  let disabledFeatures = [];
                  
                  if (Array.isArray(pkg.features) && pkg.features.length > 0) {
                    // Ưu tiên sử dụng features từ pkg object
                    features = pkg.features;
                    disabledFeatures = Array.isArray(pkg.disabledFeatures) ? pkg.disabledFeatures : [];
                  } else if (packageFeatures[pkg.id]) {
                    // Nếu không có trong pkg, thử lấy từ packageFeatures
                    features = packageFeatures[pkg.id].features || [];
                    disabledFeatures = packageFeatures[pkg.id].disabledFeatures || [];
                  }
                  
                  // Nếu vẫn không có features, sử dụng mặc định
                  if (features.length === 0) {
                    const defaultFeatures = getDefaultFeaturesForPackage(pkg.id);
                    features = defaultFeatures.features;
                    disabledFeatures = defaultFeatures.disabledFeatures;
                  }
                  
                  // Đảm bảo luôn có các mảng hợp lệ
                  const displayFeatures = Array.isArray(features) ? features : [];
                  const displayDisabledFeatures = Array.isArray(disabledFeatures) ? disabledFeatures : [];

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
                            console.log('Chọn gói thành viên:', {
                              id: pkg.id,
                              type: typeof pkg.id,
                              membershipType,
                              name: pkg.name,
                              price: pkg.price
                            });
                            
                            // Tạo package data với id là số, không phải string
                            const packageData = {
                              ...pkg,
                              id: typeof pkg.id === 'string' ? parseInt(pkg.id) : pkg.id,
                              membershipType: membershipType
                            };
                            
                            console.log('Gói đã chuẩn hóa trước khi gửi:', {
                              id: packageData.id,
                              type: typeof packageData.id,
                              membershipType: packageData.membershipType,
                              name: packageData.name,
                              price: packageData.price
                            });
                            
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
