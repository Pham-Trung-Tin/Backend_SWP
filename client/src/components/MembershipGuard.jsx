import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMembership } from '../context/MembershipContext';
import { Button, Alert, Container } from 'react-bootstrap';
import { FaCrown, FaLock } from 'react-icons/fa';

/**
 * Component bảo vệ các tính năng yêu cầu membership nhất định
 * Sử dụng: <MembershipGuard requiredMembership="premium">...</MembershipGuard>
 */
const MembershipGuard = ({ children, requiredMembership = 'premium', redirectTo = '/membership' }) => {
  const { checkFeatureAccess, membershipTiers, currentMembership } = useMembership();
  const navigate = useNavigate();
  
  const hasAccess = checkFeatureAccess(requiredMembership);
  const requiredTier = membershipTiers[requiredMembership];
  
  if (!hasAccess) {
    return (
      <Container className="py-5 text-center">
        <div className="p-4 border rounded shadow-sm">
          <div className="mb-4">
            <FaLock size={40} className="text-secondary mb-3" />
            <h3>Tính năng chỉ dành cho thành viên {requiredTier.name}</h3>
          </div>
          
          <Alert variant="info">
            <FaCrown className="me-2" /> Bạn cần nâng cấp lên gói {requiredTier.name} hoặc cao hơn để sử dụng tính năng này.
          </Alert>
          
          <p>
            Gói hiện tại của bạn: <strong>{membershipTiers[currentMembership].name}</strong>
          </p>
          
          <div className="mt-4">
            <Button 
              variant="primary" 
              onClick={() => navigate(redirectTo)}
              className="me-2"
            >
              Nâng cấp ngay
            </Button>
            
            <Button 
              variant="outline-secondary" 
              onClick={() => navigate('/')}
            >
              Quay lại trang chủ
            </Button>
          </div>
        </div>
      </Container>
    );
  }
  
  return <>{children}</>;
};

export default MembershipGuard;
