import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMembership } from '../context/MembershipContext';
import membershipApi from '../utils/membershipApi';

/**
 * Component tiện ích để giúp debug và sửa lỗi membership
 * Chỉ hiển thị trong môi trường phát triển
 */
const MembershipDebugger = () => {
  const { user, setUser, updateUser } = useAuth();
  const { currentPackage, checkFeatureAccess } = useMembership();
  
  const [expanded, setExpanded] = useState(false);
  const [localStorageUser, setLocalStorageUser] = useState(null);
  const [backendMembership, setBackendMembership] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testFeature, setTestFeature] = useState('premium');
  const [accessResult, setAccessResult] = useState(null);
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());
  
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
  
  // Lấy dữ liệu từ localStorage và backend khi component được render
  useEffect(() => {
    if (expanded) {
      const loadData = async () => {
        setIsLoading(true);
        try {
          // Lấy dữ liệu từ localStorage
          const storedUser = JSON.parse(localStorage.getItem('nosmoke_user') || '{}');
          setLocalStorageUser(storedUser);
          
          // Lấy dữ liệu từ backend
          const response = await membershipApi.getCurrentMembership();
          if (response.success) {
            setBackendMembership(response.data);
          }
        } catch (error) {
          console.error('Error loading membership data:', error);
        } finally {
          setIsLoading(false);
          setLastRefreshTime(new Date());
        }
      };
      
      loadData();
    }
  }, [expanded]);
  
  // Kiểm tra quyền truy cập cho một tính năng
  const handleTestAccess = async () => {
    setIsLoading(true);
    try {
      // Kiểm tra quyền từ backend
      const result = await membershipApi.checkFeatureAccessFromBackend(testFeature);
      setAccessResult(result);
    } catch (error) {
      console.error('Error testing access:', error);
      setAccessResult({ 
        success: false, 
        message: error.message, 
        hasAccess: false 
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Làm mới dữ liệu
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // Lấy dữ liệu từ localStorage
      const storedUser = JSON.parse(localStorage.getItem('nosmoke_user') || '{}');
      setLocalStorageUser(storedUser);
      
      // Lấy dữ liệu từ backend
      const response = await membershipApi.getCurrentMembership();
      if (response.success) {
        setBackendMembership(response.data);
      }
      
      setLastRefreshTime(new Date());
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Chỉ hiển thị trong môi trường phát triển
  if (import.meta.env.MODE !== 'development' && !window.location.hostname.includes('localhost')) {
    return null;
  }
  
  // Hiển thị giao diện mini khi chưa mở rộng
  if (!expanded) {
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h4 style={{ margin: '0 0 10px 0' }}>Debug Membership</h4>
          <button 
            onClick={() => setExpanded(true)}
            style={{ 
              padding: '2px 5px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '10px'
            }}
          >
            Mở rộng
          </button>
        </div>
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
  }
  
  // Hiển thị giao diện mở rộng với nhiều công cụ debug hơn
  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      left: '10px',
      background: 'rgba(33, 33, 33, 0.95)',
      padding: '15px',
      borderRadius: '8px',
      color: 'white',
      zIndex: 9999,
      fontSize: '14px',
      maxHeight: '80vh',
      overflowY: 'auto',
      width: '90vw',
      maxWidth: '800px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
        <h3 style={{ margin: '0' }}>Membership Debugger</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleRefresh}
            style={{
              padding: '5px 10px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Đang làm mới...' : 'Làm mới dữ liệu'}
          </button>
          <button
            onClick={() => setExpanded(false)}
            style={{
              padding: '5px 10px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Thu gọn
          </button>
        </div>
      </div>
      
      <div style={{ marginBottom: '10px', fontSize: '12px' }}>
        Cập nhật lần cuối: {lastRefreshTime.toLocaleTimeString()}
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
        <div style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '5px' }}>
          <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '5px' }}>Context / AuthContext</h4>
          <pre style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '4px', overflowX: 'auto', color: '#a5d6a7' }}>
            {JSON.stringify({
              loggedIn: !!user,
              userId: user?.id,
              userEmail: user?.email,
              membership: user?.membership,
              membershipType: user?.membershipType
            }, null, 2)}
          </pre>
        </div>
        
        <div style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '5px' }}>
          <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '5px' }}>LocalStorage</h4>
          {localStorageUser ? (
            <pre style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '4px', overflowX: 'auto', color: '#bbdefb' }}>
              {JSON.stringify({
                userId: localStorageUser?.id,
                membership: localStorageUser?.membership,
                membershipType: localStorageUser?.membershipType,
                packageDetails: localStorageUser?.packageDetails
              }, null, 2)}
            </pre>
          ) : (
            <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '4px', color: '#ffcdd2' }}>
              {isLoading ? 'Đang tải...' : 'Không có dữ liệu hoặc chưa đăng nhập'}
            </div>
          )}
        </div>
      </div>
      
      <div style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '5px', marginBottom: '15px' }}>
        <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '5px' }}>Backend Membership</h4>
        {isLoading ? (
          <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '4px' }}>Đang tải...</div>
        ) : backendMembership ? (
          <pre style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '4px', overflowX: 'auto', color: '#ffecb3' }}>
            {JSON.stringify(backendMembership, null, 2)}
          </pre>
        ) : (
          <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '4px', color: '#ffcdd2' }}>
            Không có dữ liệu hoặc chưa đăng nhập
          </div>
        )}
      </div>
      
      <div style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '5px', marginBottom: '15px' }}>
        <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '5px' }}>Kiểm tra quyền truy cập từ Backend</h4>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
          <span>Tính năng cần:</span>
          <select
            value={testFeature}
            onChange={(e) => setTestFeature(e.target.value)}
            style={{ padding: '5px', borderRadius: '4px', border: 'none' }}
          >
            <option value="free">Free</option>
            <option value="premium">Premium</option>
            <option value="pro">Pro</option>
          </select>
          <button
            onClick={handleTestAccess}
            style={{
              padding: '5px 10px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginLeft: 'auto'
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Đang kiểm tra...' : 'Kiểm tra quyền'}
          </button>
        </div>
        
        {accessResult && (
          <div style={{ 
            padding: '10px', 
            backgroundColor: accessResult.hasAccess ? 'rgba(76,175,80,0.3)' : 'rgba(244,67,54,0.3)', 
            borderRadius: '4px',
            marginTop: '10px'
          }}>
            <div style={{ marginBottom: '5px', fontWeight: 'bold' }}>
              Kết quả: {accessResult.hasAccess ? '✓ CÓ QUYỀN' : '✗ KHÔNG CÓ QUYỀN'}
            </div>
            <pre style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '4px', overflowX: 'auto', fontSize: '12px', color: '#e1bee7' }}>
              {JSON.stringify(accessResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      <div style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '5px', marginBottom: '15px' }}>
        <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '5px' }}>Cập nhật Membership (Debug Only)</h4>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button 
            onClick={() => updateMembership('free')}
            style={{ 
              padding: '8px 15px', 
              backgroundColor: user?.membership === 'free' ? '#4caf50' : 'rgba(255,255,255,0.1)',
              color: 'white',
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              flex: 1
            }}
          >
            Free
          </button>
          <button 
            onClick={() => updateMembership('premium')}
            style={{ 
              padding: '8px 15px', 
              backgroundColor: user?.membership === 'premium' ? '#2196f3' : 'rgba(255,255,255,0.1)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              flex: 1
            }}
          >
            Premium
          </button>
          <button 
            onClick={() => updateMembership('pro')}
            style={{ 
              padding: '8px 15px', 
              backgroundColor: user?.membership === 'pro' ? '#ff9800' : 'rgba(255,255,255,0.1)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              flex: 1
            }}
          >
            Pro
          </button>
        </div>
        <div style={{ marginTop: '8px', fontSize: '12px', textAlign: 'center', color: '#ffcdd2' }}>
          Cảnh báo: Thao tác này chỉ dùng để debug và sẽ tải lại trang
        </div>
      </div>
      
      <div style={{ padding: '10px', backgroundColor: 'rgba(255, 152, 0, 0.3)', borderRadius: '5px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#ffcc80' }}>Hướng dẫn xử lý sự cố</h4>
        <ul style={{ paddingLeft: '20px', fontSize: '12px', lineHeight: '1.5' }}>
          <li>Nếu <strong>Context</strong> và <strong>LocalStorage</strong> khác nhau: Đăng xuất và đăng nhập lại</li>
          <li>Nếu <strong>Backend</strong> và <strong>LocalStorage</strong> khác nhau: Làm mới trang hoặc gọi getCurrentMembership()</li>
          <li>Nếu kiểm tra quyền truy cập không chính xác: Kiểm tra API token và thử lại</li>
          <li>Nếu gói hiện tại không hiển thị đúng: Xem log trong Console và kiểm tra token</li>
        </ul>
      </div>
    </div>
  );
};

export default MembershipDebugger;
