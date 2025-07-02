import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMembership } from '../context/MembershipContext'; 
import RequireMembership from '../components/RequireMembership';

/**
 * Component kiểm tra tính năng giới hạn truy cập theo membership
 */
const MembershipTest = () => {
  const { user } = useAuth();
  const { membershipTiers, upgradeMembership, currentMembership } = useMembership();
  const [showPremiumContent, setShowPremiumContent] = useState(false);
  const [showProContent, setShowProContent] = useState(false);
  
  const handleShowPremiumContent = () => {
    setShowPremiumContent(true);
  };
  
  const handleShowProContent = () => {
    setShowProContent(true);
  };
  
  const handleUpgrade = async (targetMembership) => {
    const result = await upgradeMembership(targetMembership);
    if (result.success) {
      alert(`Đã nâng cấp lên gói ${membershipTiers[targetMembership].name} thành công!`);
    } else {
      alert(`Lỗi: ${result.error}`);
    }
  };
  
  return (
    <div className="membership-test-container">
      <h2>Kiểm tra giới hạn quyền truy cập</h2>
      
      <div className="current-membership">
        <h3>Gói thành viên hiện tại</h3>
        <div className="membership-badge">
          {membershipTiers[currentMembership].icon} {membershipTiers[currentMembership].name}
        </div>
      </div>
      
      <div className="test-actions">
        <h3>Thử nghiệm quyền truy cập</h3>
        
        <div className="feature-test">
          <h4>Tính năng Premium</h4>
          <button onClick={handleShowPremiumContent}>Xem nội dung Premium</button>
          
          {showPremiumContent && (
            <RequireMembership allowedMemberships={['premium', 'pro']} showModal={true}>
              <div className="premium-content">
                <h5>Nội dung Premium</h5>
                <p>Đây là nội dung chỉ dành cho thành viên Premium và Pro</p>
              </div>
            </RequireMembership>
          )}
        </div>
        
        <div className="feature-test">
          <h4>Tính năng Professional</h4>
          <button onClick={handleShowProContent}>Xem nội dung Professional</button>
          
          {showProContent && (
            <RequireMembership allowedMemberships={['pro']} showModal={true}>
              <div className="pro-content">
                <h5>Nội dung Professional</h5>
                <p>Đây là nội dung chỉ dành cho thành viên Professional</p>
              </div>
            </RequireMembership>
          )}
        </div>
      </div>
      
      <div className="upgrade-actions">
        <h3>Nâng cấp gói thành viên (Cho mục đích kiểm thử)</h3>
        <div className="upgrade-buttons">
          <button onClick={() => handleUpgrade('free')}>Đặt về Free</button>
          <button onClick={() => handleUpgrade('premium')}>Nâng cấp lên Premium</button>
          <button onClick={() => handleUpgrade('pro')}>Nâng cấp lên Professional</button>
        </div>
      </div>
    </div>
  );
};

export default MembershipTest;
