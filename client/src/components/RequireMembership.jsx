import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMembership } from '../context/MembershipContext';
import '../styles/RequireMembership.css';
import { FaLock, FaCrown } from 'react-icons/fa';
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
  
  // Lấy membership của user hiện tại (mặc định là 'free' nếu không có)
  const userMembership = user?.membership || 'free';
  
  // Xác định membership level tối thiểu cần thiết
  const minRequiredMembership = allowedMemberships.sort((a, b) => {
    const levels = { 'free': 0, 'premium': 1, 'pro': 2 };
    return levels[a] - levels[b];
  })[0];
    // Kiểm tra xem user có quyền truy cập không dựa trên phân cấp membership
  // Ghi log để debug
  console.log('User membership:', userMembership);
  console.log('Allowed memberships:', allowedMemberships);
  console.log('Min required membership:', minRequiredMembership);
  
  // Thiết lập mảng cấp độ thành viên để so sánh
  const membershipLevels = ['free', 'premium', 'pro'];
  const userLevel = membershipLevels.indexOf(userMembership);
  const requiredLevel = membershipLevels.indexOf(minRequiredMembership);
  
  // Người dùng có quyền nếu họ có membership cấp cao hơn hoặc bằng yêu cầu
  const hasAccess = userLevel >= requiredLevel;  // Component modal hiển thị khi không có quyền truy cập
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
                  Đã có lỗi xảy ra khi kiểm tra quyền truy cập của bạn.
                  Gói <strong>{currentMembershipName}</strong> của bạn đáng lẽ phải có quyền truy cập tính năng này.
                  Vui lòng đăng xuất và đăng nhập lại, hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục.
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
            </button>            {userMembership === 'free' && (
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
  if (hasAccess) {
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