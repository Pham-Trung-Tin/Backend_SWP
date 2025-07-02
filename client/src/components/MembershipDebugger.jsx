import React from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Component tiện ích để giúp debug và sửa lỗi membership
 * Chỉ hiển thị trong môi trường phát triển
 */
const MembershipDebugger = () => {
  const { user, setUser, updateUser } = useAuth();
  
  // Hàm để cập nhật membership của user
  const updateMembership = async (newMembership) => {
    try {
      // Cập nhật trong localStorage trước
      const currentUser = JSON.parse(localStorage.getItem('nosmoke_user'));
      
      if (currentUser) {
        currentUser.membership = newMembership;
        localStorage.setItem('nosmoke_user', JSON.stringify(currentUser));
        
        // Cập nhật trong state React
        setUser({ ...user, membership: newMembership });
        
        // Cập nhật trong danh sách users
        if (updateUser) {
          await updateUser({ membership: newMembership });
        } else {
          // Fallback nếu updateUser không có sẵn
          const users = JSON.parse(localStorage.getItem('nosmoke_users')) || [];
          const updatedUsers = users.map(u => {
            if (u.id === currentUser.id) {
              return { ...u, membership: newMembership };
            }
            return u;
          });
          
          localStorage.setItem('nosmoke_users', JSON.stringify(updatedUsers));
        }
        
        // Làm mới trang để áp dụng thay đổi
        window.location.reload();
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật membership:', error);
      alert('Có lỗi xảy ra khi cập nhật gói thành viên!');
    }
  };
  
  // Chỉ hiển thị trong môi trường phát triển
  if (process.env.NODE_ENV !== 'development' && !window.location.hostname.includes('localhost')) {
    return null;
  }
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      left: '10px',
      background: 'rgba(0, 0, 0, 0.7)',
      padding: '10px',
      borderRadius: '5px',
      color: 'white',
      zIndex: 9999,
      fontSize: '12px'
    }}>
      <h4 style={{ margin: '0 0 10px 0' }}>Debug Membership</h4>
      <div style={{ marginBottom: '10px' }}>
        Current: {user?.membership || 'free'}
      </div>
      <div style={{ display: 'flex', gap: '5px' }}>
        <button 
          onClick={() => updateMembership('free')}
          style={{ 
            padding: '3px 8px', 
            backgroundColor: user?.membership === 'free' ? '#4caf50' : '#f1f1f1',
            color: user?.membership === 'free' ? 'white' : 'black',
            border: 'none', 
            borderRadius: '3px', 
            cursor: 'pointer'
          }}
        >
          Free
        </button>
        <button 
          onClick={() => updateMembership('premium')}
          style={{ 
            padding: '3px 8px', 
            backgroundColor: user?.membership === 'premium' ? '#2196f3' : '#f1f1f1',
            color: user?.membership === 'premium' ? 'white' : 'black',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Premium
        </button>
        <button 
          onClick={() => updateMembership('pro')}
          style={{ 
            padding: '3px 8px', 
            backgroundColor: user?.membership === 'pro' ? '#ff9800' : '#f1f1f1',
            color: user?.membership === 'pro' ? 'white' : 'black',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Pro
        </button>
      </div>
      <div style={{ marginTop: '5px', fontSize: '10px' }}>
        <span onClick={() => window.location.reload()} style={{ textDecoration: 'underline', cursor: 'pointer' }}>
          Làm mới trang
        </span>
      </div>
    </div>
  );
};

export default MembershipDebugger;
