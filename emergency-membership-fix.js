/**
 * Script khẩn cấp để fix membership PRE -> premium
 * Chạy script này trong console của browser
 */

// 1. Kiểm tra dữ liệu hiện tại
console.log('🔍 Kiểm tra dữ liệu membership hiện tại...');

const userKeys = ['nosmoke_user', 'user', 'currentUser', 'auth_user'];
const tokenKeys = ['nosmoke_token', 'token', 'auth_token', 'access_token'];

// Kiểm tra tất cả các key có thể chứa thông tin user
userKeys.forEach(key => {
  const data = localStorage.getItem(key);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      console.log(`📄 ${key}:`, parsed);
      if (parsed.membership) {
        console.log(`🎯 ${key} có membership: ${parsed.membership}`);
      }
    } catch (e) {
      console.log(`📄 ${key} (string):`, data);
    }
  }
});

// Kiểm tra sessionStorage
console.log('\n🔍 Kiểm tra sessionStorage...');
userKeys.forEach(key => {
  const data = sessionStorage.getItem(key);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      console.log(`📄 sessionStorage.${key}:`, parsed);
      if (parsed.membership) {
        console.log(`🎯 sessionStorage.${key} có membership: ${parsed.membership}`);
      }
    } catch (e) {
      console.log(`📄 sessionStorage.${key} (string):`, data);
    }
  }
});

// 2. Fix function
function fixMembershipPRE() {
  console.log('\n🔧 Bắt đầu fix membership PRE -> premium...');
  
  let fixed = false;
  
  // Fix localStorage
  userKeys.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (parsed.membership && parsed.membership.toLowerCase() === 'pre') {
          console.log(`🔄 Fixing ${key}: ${parsed.membership} -> premium`);
          parsed.membership = 'premium';
          localStorage.setItem(key, JSON.stringify(parsed));
          fixed = true;
        }
      } catch (e) {
        // Skip if not JSON
      }
    }
  });
  
  // Fix sessionStorage  
  userKeys.forEach(key => {
    const data = sessionStorage.getItem(key);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (parsed.membership && parsed.membership.toLowerCase() === 'pre') {
          console.log(`🔄 Fixing sessionStorage.${key}: ${parsed.membership} -> premium`);
          parsed.membership = 'premium';
          sessionStorage.setItem(key, JSON.stringify(parsed));
          fixed = true;
        }
      } catch (e) {
        // Skip if not JSON
      }
    }
  });
  
  if (fixed) {
    console.log('✅ Đã fix membership! Vui lòng reload trang.');
    return true;
  } else {
    console.log('ℹ️ Không tìm thấy membership "PRE" nào cần fix.');
    return false;
  }
}

// 3. Manual fix function
function setMembershipToPremium() {
  console.log('\n🔧 Force set membership to premium...');
  
  // Tìm user object chính
  const userData = localStorage.getItem('nosmoke_user');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      console.log('🔄 Current user:', user);
      user.membership = 'premium';
      localStorage.setItem('nosmoke_user', JSON.stringify(user));
      
      // Also update sessionStorage if exists
      const sessionData = sessionStorage.getItem('nosmoke_user');
      if (sessionData) {
        const sessionUser = JSON.parse(sessionData);
        sessionUser.membership = 'premium';
        sessionStorage.setItem('nosmoke_user', JSON.stringify(sessionUser));
      }
      
      console.log('✅ Đã force set membership = premium!');
      console.log('🔄 Vui lòng reload trang để thay đổi có hiệu lực.');
      return true;
    } catch (e) {
      console.error('❌ Lỗi khi parse user data:', e);
      return false;
    }
  } else {
    console.log('❌ Không tìm thấy dữ liệu user trong localStorage');
    return false;
  }
}

// 4. Chạy auto fix
const wasFixed = fixMembershipPRE();

if (!wasFixed) {
  console.log('\n💡 Nếu vẫn gặp vấn đề, hãy chạy: setMembershipToPremium()');
}

// Export functions for manual use
window.fixMembershipPRE = fixMembershipPRE;
window.setMembershipToPremium = setMembershipToPremium;

console.log('\n🛠️ Các function có sẵn:');
console.log('- fixMembershipPRE(): Tự động fix PRE -> premium');
console.log('- setMembershipToPremium(): Force set membership = premium');
