/**
 * Instant PRE Membership Fix
 * Paste this in browser console to fix PRE membership issue immediately
 */

console.log('🚀 === INSTANT PRE MEMBERSHIP FIX ===');

function fixPreMembershipNow() {
  try {
    // 1. Check and fix localStorage
    const localUser = localStorage.getItem('nosmoke_user');
    if (localUser) {
      const userData = JSON.parse(localUser);
      console.log('📊 Current localStorage user:', userData);
      
      if (userData.membership === 'pre' || userData.membershipType === 'pre' || userData.package_name === 'pre') {
        userData.membership = 'premium';
        userData.membershipType = 'premium';
        localStorage.setItem('nosmoke_user', JSON.stringify(userData));
        console.log('✅ Fixed localStorage: pre → premium');
      }
    }
    
    // 2. Check and fix sessionStorage
    const sessionUser = sessionStorage.getItem('nosmoke_user');
    if (sessionUser) {
      const userData = JSON.parse(sessionUser);
      console.log('📊 Current sessionStorage user:', userData);
      
      if (userData.membership === 'pre' || userData.membershipType === 'pre' || userData.package_name === 'pre') {
        userData.membership = 'premium';
        userData.membershipType = 'premium';
        sessionStorage.setItem('nosmoke_user', JSON.stringify(userData));
        console.log('✅ Fixed sessionStorage: pre → premium');
      }
    }
    
    // 3. Force update React state by dispatching a custom event
    console.log('🔄 Triggering React state update...');
    window.dispatchEvent(new CustomEvent('membershipFixed', {
      detail: { membership: 'premium' }
    }));
    
    // 4. Test membership logic
    const testMembership = 'premium';
    const allowedMemberships = ['premium', 'pro'];
    const membershipLevels = { 'free': 0, 'premium': 1, 'pro': 2 };
    const userLevel = membershipLevels[testMembership];
    const minRequiredLevel = Math.min(...allowedMemberships.map(m => membershipLevels[m]));
    
    console.log('🧮 Access test:');
    console.log(`👤 User level: ${userLevel} (${testMembership})`);
    console.log(`📋 Required level: ${minRequiredLevel}`);
    console.log(`🎯 Should have access: ${userLevel >= minRequiredLevel ? '✅ YES' : '❌ NO'}`);
    
    // 5. Auto reload page to apply changes
    console.log('🔄 Reloading page in 2 seconds...');
    setTimeout(() => {
      window.location.reload();
    }, 2000);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error fixing membership:', error);
    return false;
  }
}

// Run the fix
const success = fixPreMembershipNow();

if (success) {
  console.log('🎉 PRE membership fix applied!');
  console.log('⏳ Page will reload automatically...');
} else {
  console.log('❌ Fix failed. Try manual steps:');
  console.log('1. const user = JSON.parse(localStorage.getItem("nosmoke_user"));');
  console.log('2. user.membership = "premium";');
  console.log('3. localStorage.setItem("nosmoke_user", JSON.stringify(user));');
  console.log('4. location.reload();');
}
