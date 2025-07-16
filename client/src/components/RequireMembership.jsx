import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMembership } from '../context/MembershipContext';
import '../styles/RequireMembership.css';
import { FaLock, FaCrown, FaSpinner } from 'react-icons/fa';
import { hasAccessToFeature, getMinimumRequiredMembership, formatMembershipName } from '../utils/membershipUtils';

/**
 * Higher-Order Component (HOC) để giới hạn truy cập các tính năng dựa trên gói thành viên
 * @param {Object} props
 * @param {Array} props.allowedMemberships - Mảng các loại membership được phép truy cập (ví dụ: ['free', 'premium', 'pro'])
 * @param {boolean} props.showModal - Nếu true, hiển thị modal thay vì chuyển hướng
 * @param {string} props.featureName - Tên của tính năng cần bảo vệ (ví dụ: 'chat', 'huy hiệu', v.v.)
 * @param {ReactNode} props.children - Component con được bảo vệ
 */
const RequireMembership = ({ allowedMemberships = [], showModal = false, featureName = '', children }) => {
  const { user } = useAuth();
  const { checkFeatureAccess } = useMembership();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [accessInfo, setAccessInfo] = React.useState(null);

  // Mock backend check function to avoid ReferenceError
  const checkFeatureAccessFromBackend = async () => ({ success: false });
  
  // Normalize membership function to handle different formats - moved outside to prevent re-creation
  const normalizeMembership = React.useCallback((membership) => {
    if (!membership) return 'free';
    
    const normalized = membership.toLowerCase().trim();
    
    // Mapping for different membership formats
    const membershipMapping = {
      'pre': 'premium',
      'premium': 'premium',
      'pro': 'pro', 
      'free': 'free',
      'basic': 'free'
    };
    
    return membershipMapping[normalized] || 'free';
  }, []);
  
  // // Xác định membership level tối thiểu cần thiết
  // const minRequiredMembership = allowedMemberships.sort((a, b) => {
  //   const levels = { 'free': 0, 'premium': 1, 'pro': 2 };
  //   return levels[a] - levels[b];
  // })[0];
  //   // Kiểm tra xem user có quyền truy cập không dựa trên phân cấp membership
  // // Ghi log để debug
  // console.log('User membership:', userMembership);
  // console.log('Allowed memberships:', allowedMemberships);
  // console.log('Min required membership:', minRequiredMembership);
  
  // // Thiết lập mảng cấp độ thành viên để so sánh
  // const membershipLevels = ['free', 'premium', 'pro'];
  // const userLevel = membershipLevels.indexOf(userMembership);
  // const requiredLevel = membershipLevels.indexOf(minRequiredMembership);
  
  // // Người dùng có quyền nếu họ có membership cấp cao hơn hoặc bằng yêu cầu
  // const hasAccess = userLevel >= requiredLevel;  // Component modal hiển thị khi không có quyền truy cập
  // Lấy và normalize membership của user hiện tại

  //huy start
  const rawUserMembership = user?.membership || user?.membershipType || user?.package_name || 'free';
  const userMembership = React.useMemo(() => normalizeMembership(rawUserMembership), [rawUserMembership, normalizeMembership]);
  
  // Xác định membership level tối thiểu cần thiết
  const minRequiredMembership = React.useMemo(() => {
    return allowedMemberships.sort((a, b) => {
      const levels = { 'free': 0, 'premium': 1, 'pro': 2 };
      return levels[a] - levels[b];
    })[0];
  }, [allowedMemberships]);
  
  // Kiểm tra quyền truy cập từ backend - Single useEffect
  useEffect(() => {
    let isMounted = true;
    
    const checkAccess = async () => {
      console.log('🔍 RequireMembership debug:', {
        rawUserMembership,
        normalizedUserMembership: userMembership,
        allowedMemberships,
        user: user ? { id: user.id, email: user.email } : null
      });
      
      if (!user) {
        if (isMounted) {
          setAccessInfo({ hasAccess: false, userMembership: 'free', requiredMembership: minRequiredMembership });
          setLoading(false);
        }
        return;
      }
      
      try {
        console.log('Kiểm tra quyền truy cập từ backend cho:', allowedMemberships);
        const result = await checkFeatureAccessFromBackend(allowedMemberships);
        
        if (!isMounted) return;
        
        console.log('Kết quả kiểm tra quyền từ backend:', result);
        
        if (result.success) {
          // Normalize the result memberships too
          const normalizedResult = {
            ...result,
            userMembership: normalizeMembership(result.userMembership),
            requiredMembership: result.requiredMembership
          };
          setAccessInfo(normalizedResult);
        } else {
          // Fallback sang kiểm tra local nếu backend không khả dụng
          console.log('🔄 Fallback to local membership check');
          const membershipLevels = { 'free': 0, 'premium': 1, 'pro': 2 };
          const userLevel = membershipLevels[userMembership] || 0;
          const requiredLevel = Math.min(...allowedMemberships.map(m => membershipLevels[m] || 0));
          
          const localAccessInfo = {
            hasAccess: userLevel >= requiredLevel,
            userMembership: userMembership,
            requiredMembership: minRequiredMembership
          };
          
          console.log('🧮 Local access check result:', localAccessInfo);
          setAccessInfo(localAccessInfo);
        }
      } catch (error) {
        if (!isMounted) return;
        
        console.error('Lỗi khi kiểm tra quyền truy cập:', error);
        // Fallback sang kiểm tra local
        console.log('🔄 Error fallback to local membership check');
        const membershipLevels = { 'free': 0, 'premium': 1, 'pro': 2 };
        const userLevel = membershipLevels[userMembership] || 0;
        const requiredLevel = Math.min(...allowedMemberships.map(m => membershipLevels[m] || 0));
        
        const fallbackAccessInfo = {
          hasAccess: userLevel >= requiredLevel,
          userMembership: userMembership,
          requiredMembership: minRequiredMembership
        };
        
        console.log('🧮 Fallback access check result:', fallbackAccessInfo);
        setAccessInfo(fallbackAccessInfo);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    checkAccess();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [user, userMembership, minRequiredMembership, allowedMemberships, normalizeMembership]);
  
  // Khi đang tải dữ liệu, hiển thị trạng thái loading
  if (loading) {
    return (
      <div className="membership-loading">
        <FaSpinner className="spinner" />
        <p>Đang kiểm tra quyền truy cập...</p>
      </div>
    );
  }
  
  // Sử dụng kết quả kiểm tra từ backend
  const hasAccess = accessInfo?.hasAccess || false;
  
  // Force allow access for PRE membership users (PRIORITY CHECK)
  const forceAllowForPre = rawUserMembership && rawUserMembership.toLowerCase() === 'pre' && 
                          allowedMemberships.includes('premium');
  
  // Additional fallback: if normalized membership is premium and allowed memberships include premium
  const fallbackPremiumAccess = userMembership === 'premium' && allowedMemberships.includes('premium');
  
  const finalHasAccess = hasAccess || forceAllowForPre || fallbackPremiumAccess;
  
  // Debug log for final decision
  if (!loading && accessInfo) {
    console.log('🎯 RequireMembership final decision:', {
      hasAccess,
      forceAllowForPre,
      fallbackPremiumAccess,
      finalHasAccess,
      accessInfo,
      userMembership,
      rawUserMembership,
      allowedMemberships
    });
    
    // Special debug for PRE membership issues
    if (rawUserMembership && rawUserMembership.toLowerCase() === 'pre' && !finalHasAccess) {
      console.error('🚨 CRITICAL: PRE membership user denied access!', {
        rawUserMembership,
        userMembership,
        allowedMemberships,
        hasAccess,
        forceAllowForPre,
        fallbackPremiumAccess,
        finalHasAccess
      });
    }
  }  
  //huy end

  // Component modal hiển thị khi không có quyền truy cập
  const AccessDeniedModal = () => {
    const { membershipTiers } = useMembership();
      // Sử dụng utility function để lấy tên hiển thị của gói thành viên
    const requiredMembershipName = formatMembershipName(minRequiredMembership);
    const currentMembershipName = formatMembershipName(userMembership);
    
    return (
      <div className="membership-modal-overlay">
        <div className="membership-modal">
          <div className="membership-modal-header">
            <FaLock className="membership-lock-icon" />
            <h3>Tính năng bị giới hạn</h3>
          </div>          <div className="membership-modal-body">
            <p>
              {userMembership === 'free' ? (
                <>
                  {featureName === 'huy hiệu' ? (
                    <>
                      Tính năng huy hiệu yêu cầu gói thành viên <strong>{requiredMembershipName}</strong> trở lên.
                      Vui lòng nâng cấp để xem các huy hiệu và theo dõi thành tựu của bạn.
                    </>
                  ) : (
                    <>
                      Tính năng này yêu cầu gói thành viên <strong>{requiredMembershipName}</strong> trở lên.
                      Vui lòng nâng cấp để sử dụng tính năng này.
                    </>
                  )}
                </>
              ) : (
                <>
                  Bạn đã có gói <strong>{currentMembershipName}</strong> và đáng lẽ phải có quyền truy cập tính năng này.
                  Có thể có lỗi hệ thống. Vui lòng thử tải lại trang hoặc đăng nhập lại.
                  {console.log('🐛 Access denied despite having sufficient membership:', {
                    userMembership: accessInfo?.userMembership || userMembership,
                    rawUserMembership,
                    requiredMembership: accessInfo?.requiredMembership || minRequiredMembership,
                    hasAccess
                  })}
                </>
              )}
            </p>
            
            <div className="membership-info">
              <div className="membership-item">
                <h4>Gói hiện tại</h4>
                <span className={`membership-badge current-badge ${userMembership}`}>
                  {userMembership === 'free' ? '○' : userMembership === 'premium' ? '✓' : '★'} {currentMembershipName}
                </span>
              </div>
                <div className="membership-item">
                <h4>Yêu cầu tối thiểu</h4>
                <span className="membership-badge required-badge">
                  {minRequiredMembership === 'premium' ? '✓' : '★'} {requiredMembershipName}
                </span>
              </div>
            </div>
          </div>
          <div className="membership-modal-footer">
            <button className="membership-cancel-button" onClick={() => navigate(-1)}>
              Quay lại
            {/* //Tin start */}
            {/* </button>            {userMembership === 'free' && ( */}
            {/* //Tin end */}
            
            //Huy start
            </button>
            
            {/* Show reload button for users with sufficient membership */}
            {(accessInfo?.userMembership !== 'free' && userMembership !== 'free') && (
              <button 
                className="membership-upgrade-button" 
                onClick={() => window.location.reload()}
                style={{ backgroundColor: '#28a745' }}
              >
                🔄 Thử lại
              </button>
            )}
            
            {(accessInfo?.userMembership === 'free' || userMembership === 'free') && (
              // Huy end
              <button className="membership-upgrade-button" onClick={() => navigate('/membership')}>
                <FaCrown /> Nâng cấp ngay
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Nếu có quyền truy cập, hiển thị component con
  if (finalHasAccess) {
    return children;
  }
  
  // Nếu không có quyền truy cập và chọn hiển thị modal
  if (showModal) {
    return <AccessDeniedModal />;
  }
  
  // Nếu không có quyền truy cập và không hiển thị modal, chuyển hướng đến trang access-denied
  navigate('/access-denied', { 
    state: { 
      userMembership,
      requiredMembership: allowedMemberships[0] || 'premium',
      from: window.location.pathname
    } 
  });
  
  return null;
};

export default RequireMembership;