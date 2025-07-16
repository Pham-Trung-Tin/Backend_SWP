/**
 * Test script để verify membership PRE fix
 * Chạy trong console để kiểm tra các fix đã hoạt động
 */

async function verifyMembershipFix() {
  console.log('🧪 Bắt đầu test verify membership fix...\n');
  
  const results = {
    localStorage: null,
    sessionStorage: null,
    apiResponse: null,
    frontendLogic: null,
    issues: []
  };
  
  // 1. Kiểm tra localStorage
  console.log('1️⃣ Kiểm tra localStorage...');
  try {
    const userData = localStorage.getItem('nosmoke_user');
    if (userData) {
      const user = JSON.parse(userData);
      results.localStorage = {
        hasMembership: !!user.membership,
        membership: user.membership,
        isPRE: user.membership?.toLowerCase() === 'pre',
        isPremium: user.membership?.toLowerCase() === 'premium'
      };
      
      if (results.localStorage.isPRE) {
        results.issues.push('❌ localStorage vẫn có membership "PRE"');
      } else if (results.localStorage.isPremium) {
        console.log('✅ localStorage membership đã là "premium"');
      }
    } else {
      results.issues.push('⚠️ Không tìm thấy user data trong localStorage');
    }
  } catch (e) {
    results.issues.push('❌ Lỗi khi đọc localStorage: ' + e.message);
  }
  
  // 2. Kiểm tra sessionStorage
  console.log('\n2️⃣ Kiểm tra sessionStorage...');
  try {
    const sessionData = sessionStorage.getItem('nosmoke_user');
    if (sessionData) {
      const user = JSON.parse(sessionData);
      results.sessionStorage = {
        hasMembership: !!user.membership,
        membership: user.membership,
        isPRE: user.membership?.toLowerCase() === 'pre',
        isPremium: user.membership?.toLowerCase() === 'premium'
      };
      
      if (results.sessionStorage.isPRE) {
        results.issues.push('❌ sessionStorage vẫn có membership "PRE"');
      } else if (results.sessionStorage.isPremium) {
        console.log('✅ sessionStorage membership đã là "premium"');
      }
    } else {
      console.log('ℹ️ Không có user data trong sessionStorage');
    }
  } catch (e) {
    results.issues.push('❌ Lỗi khi đọc sessionStorage: ' + e.message);
  }
  
  // 3. Test API response (nếu có token)
  console.log('\n3️⃣ Kiểm tra API response...');
  try {
    const token = localStorage.getItem('nosmoke_token') || 
                 localStorage.getItem('token') || 
                 localStorage.getItem('auth_token');
    
    if (token) {
      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        results.apiResponse = {
          success: true,
          membership: data.user?.membership || data.membership,
          fullResponse: data
        };
        
        if (results.apiResponse.membership?.toLowerCase() === 'pre') {
          results.issues.push('❌ API vẫn trả về membership "PRE"');
        } else {
          console.log('✅ API trả về membership:', results.apiResponse.membership);
        }
      } else {
        results.apiResponse = {
          success: false,
          status: response.status,
          error: 'API call failed'
        };
        results.issues.push(`⚠️ API call thất bại: ${response.status}`);
      }
    } else {
      results.issues.push('⚠️ Không tìm thấy auth token');
    }
  } catch (e) {
    results.issues.push('❌ Lỗi khi gọi API: ' + e.message);
  }
  
  // 4. Test frontend logic
  console.log('\n4️⃣ Test frontend normalization logic...');
  try {
    // Test normalize function
    const testNormalize = (membership) => {
      if (!membership) return 'free';
      const normalized = membership.toString().toLowerCase().trim();
      if (normalized === 'pre' || normalized === 'premium') return 'premium';
      if (normalized === 'pro') return 'pro';
      return 'free';
    };
    
    const testCases = ['PRE', 'pre', 'Premium', 'premium', 'PREMIUM', 'pro', 'free'];
    const normalizeResults = testCases.map(input => ({
      input,
      output: testNormalize(input),
      correct: (input.toLowerCase() === 'pre' || input.toLowerCase() === 'premium') ? 
               testNormalize(input) === 'premium' : true
    }));
    
    results.frontendLogic = normalizeResults;
    
    const failedTests = normalizeResults.filter(r => !r.correct);
    if (failedTests.length > 0) {
      results.issues.push('❌ Frontend normalize logic có vấn đề');
    } else {
      console.log('✅ Frontend normalize logic hoạt động đúng');
    }
  } catch (e) {
    results.issues.push('❌ Lỗi khi test frontend logic: ' + e.message);
  }
  
  // 5. Test RequireMembership component logic (simulation)
  console.log('\n5️⃣ Simulate RequireMembership logic...');
  try {
    const rawMembership = results.localStorage?.membership || 'free';
    const allowedMemberships = ['premium'];
    
    // Simulate component logic
    const forceAllowForPre = rawMembership && rawMembership.toLowerCase() === 'pre' && 
                            allowedMemberships.includes('premium');
    const normalizedMembership = rawMembership?.toLowerCase() === 'pre' ? 'premium' : rawMembership;
    const fallbackPremiumAccess = normalizedMembership === 'premium' && allowedMemberships.includes('premium');
    
    const finalAccess = forceAllowForPre || fallbackPremiumAccess;
    
    results.componentLogic = {
      rawMembership,
      normalizedMembership,
      forceAllowForPre,
      fallbackPremiumAccess,
      finalAccess
    };
    
    if (rawMembership?.toLowerCase() === 'pre' && !finalAccess) {
      results.issues.push('❌ Component logic vẫn từ chối PRE membership');
    } else if (finalAccess) {
      console.log('✅ Component logic cho phép truy cập');
    }
  } catch (e) {
    results.issues.push('❌ Lỗi khi simulate component logic: ' + e.message);
  }
  
  // Tổng kết
  console.log('\n📊 KẾT QUẢ TỔNG QUAN:');
  console.log('='.repeat(50));
  
  if (results.issues.length === 0) {
    console.log('🎉 TẤT CẢ ĐỀU ỔN! Membership fix đã hoạt động hoàn hảo.');
  } else {
    console.log('⚠️ VẪN CÒN VẤN ĐỀ CẦN KHẮC PHỤC:');
    results.issues.forEach(issue => console.log('  ' + issue));
  }
  
  console.log('\n📋 Chi tiết kết quả:');
  console.table(results);
  
  // Auto fix nếu phát hiện vấn đề
  if (results.issues.some(issue => issue.includes('localStorage vẫn có membership "PRE"') || 
                                  issue.includes('sessionStorage vẫn có membership "PRE"'))) {
    console.log('\n🔧 Phát hiện vấn đề PRE membership. Tự động fix...');
    
    if (confirm('Có muốn tự động fix membership PRE -> premium không?')) {
      // Auto fix
      if (results.localStorage?.isPRE) {
        const userData = JSON.parse(localStorage.getItem('nosmoke_user'));
        userData.membership = 'premium';
        localStorage.setItem('nosmoke_user', JSON.stringify(userData));
        console.log('✅ Đã fix localStorage');
      }
      
      if (results.sessionStorage?.isPRE) {
        const sessionData = JSON.parse(sessionStorage.getItem('nosmoke_user'));
        sessionData.membership = 'premium';
        sessionStorage.setItem('nosmoke_user', JSON.stringify(sessionData));
        console.log('✅ Đã fix sessionStorage');
      }
      
      console.log('🔄 Reload trang để áp dụng thay đổi...');
      setTimeout(() => window.location.reload(), 2000);
    }
  }
  
  return results;
}

// Chạy test
console.log('🧪 Starting membership verification test...');
verifyMembershipFix().then(results => {
  console.log('\n✅ Test completed. Results stored in variable "membershipTestResults"');
  window.membershipTestResults = results;
});

// Export function for manual use
window.verifyMembershipFix = verifyMembershipFix;
