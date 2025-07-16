/**
 * Quick Membership Fix for BookAppointment
 * Add this to browser console to diagnose and fix membership issue
 */

console.log('🔧 === MEMBERSHIP FIX FOR BOOK APPOINTMENT ===');

// 1. Check current user membership
function checkCurrentMembership() {
  console.log('\n👤 Checking current membership...');
  
  const userStorage = localStorage.getItem('nosmoke_user') || sessionStorage.getItem('nosmoke_user');
  
  if (!userStorage) {
    console.error('❌ No user data found');
    return null;
  }
  
  try {
    const userData = JSON.parse(userStorage);
    console.log('📊 Full user data:', userData);
    
    const possibleMembershipFields = [
      'membership',
      'membershipType', 
      'package_name',
      'package_type',
      'membership_type'
    ];
    
    console.log('💎 Checking membership fields:');
    possibleMembershipFields.forEach(field => {
      if (userData[field]) {
        console.log(`  ${field}: "${userData[field]}"`);
      }
    });
    
    return userData;
  } catch (error) {
    console.error('❌ Error parsing user data:', error);
    return null;
  }
}

// 2. Fix membership mapping
function fixMembershipMapping(userData) {
  console.log('\n🔧 Fixing membership mapping...');
  
  if (!userData) return;
  
  let currentMembership = userData.membership || userData.membershipType || userData.package_name || 'free';
  console.log('🔍 Current membership value:', currentMembership);
  
  // Mapping different membership formats
  const membershipMapping = {
    'pre': 'premium',
    'premium': 'premium', 
    'pro': 'pro',
    'free': 'free',
    'basic': 'free'
  };
  
  // Convert to lowercase for comparison
  const normalizedMembership = currentMembership.toLowerCase();
  const mappedMembership = membershipMapping[normalizedMembership] || 'free';
  
  console.log('🔄 Mapped membership:', normalizedMembership, '->', mappedMembership);
  
  // Update user data if mapping changed
  if (mappedMembership !== userData.membership) {
    console.log('📝 Updating user membership in storage...');
    
    const updatedUserData = {
      ...userData,
      membership: mappedMembership,
      membershipType: mappedMembership
    };
    
    // Update both localStorage and sessionStorage
    if (localStorage.getItem('nosmoke_user')) {
      localStorage.setItem('nosmoke_user', JSON.stringify(updatedUserData));
      console.log('✅ Updated localStorage.nosmoke_user');
    }
    
    if (sessionStorage.getItem('nosmoke_user')) {
      sessionStorage.setItem('nosmoke_user', JSON.stringify(updatedUserData));
      console.log('✅ Updated sessionStorage.nosmoke_user');
    }
    
    console.log('🎯 Membership fixed! Reload the page to see changes.');
    return updatedUserData;
  } else {
    console.log('✅ Membership mapping is already correct');
    return userData;
  }
}

// 3. Test membership logic
function testMembershipLogic(membership) {
  console.log('\n🧮 Testing membership logic...');
  
  const membershipLevels = { 'free': 0, 'premium': 1, 'pro': 2 };
  const allowedMemberships = ['premium', 'pro']; // From BookAppointment.jsx
  
  const userLevel = membershipLevels[membership] || 0;
  const minRequiredLevel = Math.min(...allowedMemberships.map(m => membershipLevels[m]));
  
  console.log(`👤 User membership: "${membership}" (level ${userLevel})`);
  console.log(`📋 Required: ${allowedMemberships.join(' or ')} (level ${minRequiredLevel}+)`);
  
  const hasAccess = userLevel >= minRequiredLevel;
  console.log(`🎯 Should have access: ${hasAccess ? '✅ YES' : '❌ NO'}`);
  
  return hasAccess;
}

// 4. Force reload AuthContext (if possible)
function triggerAuthContextReload() {
  console.log('\n🔄 Triggering page reload to refresh AuthContext...');
  
  // Dispatch a custom event to potentially trigger context refresh
  window.dispatchEvent(new Event('membershipUpdated'));
  
  console.log('💡 If issue persists, refresh the page manually');
}

// Main execution
function runMembershipFix() {
  console.log('🚀 Running membership fix...');
  
  const userData = checkCurrentMembership();
  
  if (!userData) {
    console.log('❌ Cannot fix - no user data found. Please login again.');
    return;
  }
  
  const fixedUserData = fixMembershipMapping(userData);
  const finalMembership = fixedUserData.membership || fixedUserData.membershipType || 'free';
  
  const hasAccess = testMembershipLogic(finalMembership);
  
  if (hasAccess) {
    console.log('\n🎉 SUCCESS! You should now have access to coach booking.');
    console.log('💡 If you still see the membership modal, please refresh the page.');
  } else {
    console.log('\n❌ ISSUE: Membership level is still insufficient.');
    console.log('💡 Your membership might not be correctly recorded. Contact support.');
  }
  
  triggerAuthContextReload();
  
  return { userData: fixedUserData, hasAccess };
}

// Run the fix
runMembershipFix();
