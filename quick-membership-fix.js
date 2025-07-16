/**
 * Quick Fix for Membership Issue
 * Run this in browser console to fix "pre" -> "premium" mapping
 */

console.log('🔧 === QUICK MEMBERSHIP FIX ===');

// 1. Check current membership
function quickMembershipFix() {
  const userStorage = localStorage.getItem('nosmoke_user') || sessionStorage.getItem('nosmoke_user');
  
  if (!userStorage) {
    console.error('❌ No user data found. Please login first.');
    return false;
  }
  
  try {
    const userData = JSON.parse(userStorage);
    console.log('👤 Current user data:', userData);
    
    const currentMembership = userData.membership || userData.membershipType || userData.package_name || 'free';
    console.log('💎 Current membership:', currentMembership);
    
    // Check if it's "pre" and needs fixing
    if (currentMembership.toLowerCase() === 'pre') {
      console.log('🔧 Fixing "pre" -> "premium" mapping...');
      
      // Update membership
      userData.membership = 'premium';
      userData.membershipType = 'premium';
      
      // Save back to storage
      if (localStorage.getItem('nosmoke_user')) {
        localStorage.setItem('nosmoke_user', JSON.stringify(userData));
        console.log('✅ Updated localStorage');
      }
      
      if (sessionStorage.getItem('nosmoke_user')) {
        sessionStorage.setItem('nosmoke_user', JSON.stringify(userData));
        console.log('✅ Updated sessionStorage');
      }
      
      console.log('🎉 Membership fixed! Reload page to see changes.');
      
      // Test access logic
      const membershipLevels = { 'free': 0, 'premium': 1, 'pro': 2 };
      const allowedMemberships = ['premium', 'pro'];
      const userLevel = membershipLevels['premium'];
      const minRequiredLevel = Math.min(...allowedMemberships.map(m => membershipLevels[m]));
      
      console.log(`✅ Should now have access: ${userLevel >= minRequiredLevel ? 'YES' : 'NO'}`);
      
      return true;
    } else {
      console.log('ℹ️ Membership is already in correct format:', currentMembership);
      
      // Test current access
      const membershipLevels = { 'free': 0, 'premium': 1, 'pro': 2 };
      const allowedMemberships = ['premium', 'pro'];
      const userLevel = membershipLevels[currentMembership.toLowerCase()] || 0;
      const minRequiredLevel = Math.min(...allowedMemberships.map(m => membershipLevels[m]));
      
      console.log(`🎯 Current access: ${userLevel >= minRequiredLevel ? 'SHOULD HAVE ACCESS' : 'ACCESS DENIED'}`);
      console.log(`🔢 User level: ${userLevel}, Required: ${minRequiredLevel}`);
      
      return userLevel >= minRequiredLevel;
    }
    
  } catch (error) {
    console.error('❌ Error processing user data:', error);
    return false;
  }
}

// Run the fix
const result = quickMembershipFix();

if (result) {
  console.log('\n🎉 SUCCESS! Try accessing BookAppointment now.');
  console.log('💡 If you still see the modal, refresh the page (F5).');
} else {
  console.log('\n❌ Fix failed or membership insufficient.');
  console.log('💡 Try: window.debugAuthNew.fullAuthReport() for more details');
}

console.log('\n🔧 Manual fix if needed:');
console.log('const user = JSON.parse(localStorage.getItem("nosmoke_user"));');
console.log('user.membership = "premium";');
console.log('localStorage.setItem("nosmoke_user", JSON.stringify(user));');
console.log('location.reload();');
