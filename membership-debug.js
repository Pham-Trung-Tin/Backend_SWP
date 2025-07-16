/**
 * Membership Debug Script
 * Debug membership và feature access issues
 */

console.log('🔍 === MEMBERSHIP DEBUG ANALYSIS ===');

// 1. Check user data from AuthContext
console.log('\n👤 1. Checking user data...');
const userStorage = localStorage.getItem('nosmoke_user') || sessionStorage.getItem('nosmoke_user');
if (userStorage) {
  try {
    const userData = JSON.parse(userStorage);
    console.log('✅ User data found:', userData);
    console.log('📊 Current membership:', userData.membership);
    console.log('📊 Membership type:', userData.membershipType);
    console.log('📊 Package name:', userData.package_name);
  } catch (e) {
    console.error('❌ Error parsing user data:', e);
  }
} else {
  console.error('❌ No user data found');
}

// 2. Check membership API endpoint
console.log('\n🔍 2. Testing membership API...');
async function testMembershipAPI() {
  try {
    const token = localStorage.getItem('nosmoke_token') || 
                  sessionStorage.getItem('nosmoke_token') ||
                  localStorage.getItem('token');
    
    if (!token) {
      console.error('❌ No token found for membership API test');
      return;
    }
    
    console.log('🔑 Using token:', token.substring(0, 20) + '...');
    
    // Test current membership endpoint
    const response = await fetch('http://localhost:5000/api/membership/current', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Membership API response:', data);
      
      if (data.success && data.data) {
        console.log('📦 Package name:', data.data.package_name);
        console.log('💎 Package type:', data.data.package_type);
        console.log('📅 Start date:', data.data.start_date);
        console.log('📅 End date:', data.data.end_date);
        console.log('🔄 Status:', data.data.status);
      }
    } else {
      const errorText = await response.text();
      console.error('❌ Membership API failed:', response.status, errorText);
    }
  } catch (error) {
    console.error('❌ Membership API error:', error);
  }
}

// 3. Test feature access API
console.log('\n🔍 3. Testing feature access API...');
async function testFeatureAccessAPI() {
  try {
    const token = localStorage.getItem('nosmoke_token') || 
                  sessionStorage.getItem('nosmoke_token') ||
                  localStorage.getItem('token');
    
    if (!token) {
      console.error('❌ No token found for feature access test');
      return;
    }
    
    // Test coach booking feature access
    const testMemberships = ['premium', 'pro'];
    
    const response = await fetch('http://localhost:5000/api/membership/check-feature-access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        allowedMemberships: testMemberships
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Feature access API response:', data);
      
      if (data.success) {
        console.log('🎯 Has access:', data.hasAccess);
        console.log('👤 User membership:', data.userMembership);
        console.log('📋 Required membership:', data.requiredMembership);
      }
    } else {
      const errorText = await response.text();
      console.error('❌ Feature access API failed:', response.status, errorText);
    }
  } catch (error) {
    console.error('❌ Feature access API error:', error);
  }
}

// 4. Check RequireMembership component logic
console.log('\n🔍 4. Testing membership level comparison...');
function testMembershipLogic() {
  const membershipLevels = { 'free': 0, 'premium': 1, 'pro': 2 };
  const allowedMemberships = ['premium', 'pro'];
  
  // Get user membership from storage
  const userStorage = localStorage.getItem('nosmoke_user') || sessionStorage.getItem('nosmoke_user');
  let userMembership = 'free';
  
  if (userStorage) {
    try {
      const userData = JSON.parse(userStorage);
      userMembership = userData.membership || userData.membershipType || 'free';
    } catch (e) {
      console.error('Error parsing user data for logic test:', e);
    }
  }
  
  console.log('👤 User membership:', userMembership);
  console.log('📋 Allowed memberships:', allowedMemberships);
  
  const userLevel = membershipLevels[userMembership];
  const minRequiredLevel = Math.min(...allowedMemberships.map(m => membershipLevels[m]));
  const minRequiredMembership = Object.keys(membershipLevels).find(k => membershipLevels[k] === minRequiredLevel);
  
  console.log('🔢 User level:', userLevel);
  console.log('🔢 Min required level:', minRequiredLevel);
  console.log('📦 Min required membership:', minRequiredMembership);
  
  const hasAccess = userLevel >= minRequiredLevel;
  console.log('🎯 Should have access:', hasAccess);
  
  return { hasAccess, userMembership, minRequiredMembership };
}

// Run all tests
(async () => {
  await testMembershipAPI();
  await testFeatureAccessAPI();
  const logicResult = testMembershipLogic();
  
  console.log('\n📊 === SUMMARY ===');
  console.log('Local logic test result:', logicResult);
  
  console.log('\n🔧 === DEBUGGING COMMANDS ===');
  console.log('Run these in console:');
  console.log('window.debugAuthNew.checkUserData() // Check user data');
  console.log('window.debugAuthNew.fullAuthReport() // Full auth report');
  
  console.log('\n💡 === POSSIBLE SOLUTIONS ===');
  console.log('1. If user membership is not "premium" or "pro", update it');
  console.log('2. If API returns wrong membership, check backend membership logic');
  console.log('3. If local storage has old data, clear and login again');
  console.log('4. Check if membership purchase was recorded correctly in database');
})();
