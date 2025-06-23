import React, { useEffect } from 'react';
import RequireMembership from './RequireMembership';
import CoachChat from './CoachChat';
import { useAuth } from '../context/AuthContext';
import { hasAccessToFeature } from '../utils/membershipUtils';

/**
 * Component bọc CoachChat với RequireMembership để kiểm tra quyền truy cập dựa trên gói thành viên
 */
const ProtectedCoachChat = ({ coach, appointment, isOpen, onClose }) => {
  const { user } = useAuth();
    // Kiểm tra quyền truy cập dựa trên membership
  useEffect(() => {
    if (isOpen && user) {
      // Kiểm tra membership của user sử dụng hàm tiện ích
      const hasAccess = hasAccessToFeature(user.membership || 'free', 'premium');
      
      // Xử lý trường hợp người dùng đã nâng cấp nhưng không được cập nhật
      if (!hasAccess && user.membership !== 'free') {
        try {
          const storedUser = JSON.parse(localStorage.getItem('nosmoke_user') || '{}');
          if (storedUser && hasAccessToFeature(storedUser.membership, 'premium')) {
            // User có quyền trong localStorage nhưng không trong state
            // Thử cập nhật thông tin user trong session
            if (window.sessionStorage) {
              window.sessionStorage.setItem('membership_refresh_needed', 'true');
            }
          }
        } catch (error) {
          // Xử lý lỗi khi đọc localStorage
        }
      }
    }
  }, [isOpen, user]);
  
  return (
    <RequireMembership allowedMemberships={['premium', 'pro']} showModal={true}>
      <CoachChat
        coach={coach}
        appointment={appointment}
        isOpen={isOpen}
        onClose={onClose}
      />
    </RequireMembership>
  );
};

export default ProtectedCoachChat;
