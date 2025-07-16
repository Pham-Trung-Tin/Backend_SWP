/**
 * Enhanced Authentication Debug Utility
 * Provides comprehensive functions to debug authentication issues
 */

/**
 * Check all possible token storage locations
 */
export const checkAllTokens = () => {
  console.log('🔍 Checking all token storage locations...');
  
  const locations = [
    { name: 'localStorage.nosmoke_token', value: localStorage.getItem('nosmoke_token') },
    { name: 'localStorage.token', value: localStorage.getItem('token') },
    { name: 'localStorage.authToken', value: localStorage.getItem('authToken') },
    { name: 'sessionStorage.nosmoke_token', value: sessionStorage.getItem('nosmoke_token') },
    { name: 'sessionStorage.token', value: sessionStorage.getItem('token') },
    { name: 'sessionStorage.authToken', value: sessionStorage.getItem('authToken') }
  ];
  
  const tokensFound = [];
  
  locations.forEach(location => {
    if (location.value) {
      console.log(`✅ ${location.name}: ${location.value.substring(0, 20)}...`);
      tokensFound.push(location);
    } else {
      console.log(`❌ ${location.name}: null`);
    }
  });
  
  if (tokensFound.length === 0) {
    console.warn('⚠️ No tokens found in any location!');
  } else {
    console.log(`📊 Total tokens found: ${tokensFound.length}`);
  }
  
  return tokensFound;
};

/**
 * Check user data in storage
 */
export const checkUserData = () => {
  console.log('👤 Checking user data...');
  
  const userLocations = [
    { name: 'localStorage.nosmoke_user', value: localStorage.getItem('nosmoke_user') },
    { name: 'sessionStorage.nosmoke_user', value: sessionStorage.getItem('nosmoke_user') }
  ];
  
  userLocations.forEach(location => {
    if (location.value) {
      try {
        const userData = JSON.parse(location.value);
        console.log(`✅ ${location.name}:`, userData);
      } catch (e) {
        console.error(`❌ ${location.name}: Invalid JSON - ${location.value}`);
      }
    } else {
      console.log(`❌ ${location.name}: null`);
    }
  });
};

/**
 * Test API call with current authentication
 */
export const testApiAuth = async () => {
  console.log('🧪 Testing API authentication...');
  
  try {
    // Get token manually
    const token = localStorage.getItem('nosmoke_token') || 
                  sessionStorage.getItem('nosmoke_token') ||
                  localStorage.getItem('token') ||
                  sessionStorage.getItem('token');
    
    if (!token) {
      console.error('❌ No token found for API test');
      return;
    }
    
    console.log('🔑 Using token for test:', token.substring(0, 20) + '...');
    
    // Try to call an authenticated endpoint
    const response = await fetch('http://localhost:5000/api/auth/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📤 API response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API auth test successful:', data);
    } else {
      const errorText = await response.text();
      console.error('❌ API auth test failed:', response.status, errorText);
    }
    
  } catch (error) {
    console.error('❌ API auth test failed with error:', error);
  }
};

/**
 * Clear all authentication data
 */
export const clearAllAuth = () => {
  console.log('🗑️ Clearing all authentication data...');
  
  const keysToRemove = [
    'nosmoke_token',
    'token', 
    'authToken',
    'nosmoke_user',
    'nosmoke_remember'
  ];
  
  keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`✅ Removed localStorage.${key}`);
    }
    if (sessionStorage.getItem(key)) {
      sessionStorage.removeItem(key);
      console.log(`✅ Removed sessionStorage.${key}`);
    }
  });
  
  console.log('🧹 All authentication data cleared');
};

/**
 * Simulate a token for testing
 */
export const setTestToken = (token = 'test-token-123') => {
  console.log('🎭 Setting test token:', token);
  
  localStorage.setItem('nosmoke_token', token);
  localStorage.setItem('token', token);
  sessionStorage.setItem('nosmoke_token', token);
  
  console.log('✅ Test token set in multiple locations');
};

/**
 * Test appointment API specifically
 */
export const testAppointmentApi = async () => {
  console.log('📅 Testing appointment API...');
  
  try {
    const token = localStorage.getItem('nosmoke_token') || 
                  sessionStorage.getItem('nosmoke_token') ||
                  localStorage.getItem('token');
    
    if (!token) {
      console.error('❌ No token found for appointment API test');
      return;
    }
    
    console.log('🔑 Using token:', token.substring(0, 20) + '...');
    
    // Test getting user appointments
    const response = await fetch('http://localhost:5000/api/appointments/user', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📤 Appointment API response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Appointment API test successful:', data);
    } else {
      const errorText = await response.text();
      console.error('❌ Appointment API test failed:', response.status, errorText);
    }
    
  } catch (error) {
    console.error('❌ Appointment API test failed:', error);
  }
};

/**
 * Test membership API and feature access
 */
export const testMembershipApi = async () => {
  console.log('💎 Testing membership API...');
  
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
    const membershipResponse = await fetch('http://localhost:5000/api/membership/current', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📤 Membership API response status:', membershipResponse.status);
    
    if (membershipResponse.ok) {
      const membershipData = await membershipResponse.json();
      console.log('✅ Membership API test successful:', membershipData);
      
      // Test feature access for coach booking
      console.log('🎯 Testing feature access for coach booking...');
      const featureResponse = await fetch('http://localhost:5000/api/membership/check-feature-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          allowedMemberships: ['premium', 'pro']
        })
      });
      
      if (featureResponse.ok) {
        const featureData = await featureResponse.json();
        console.log('✅ Feature access API test successful:', featureData);
        
        if (featureData.success) {
          console.log(`🎯 Coach booking access: ${featureData.hasAccess ? '✅ ALLOWED' : '❌ DENIED'}`);
          console.log(`👤 Your membership: ${featureData.userMembership}`);
          console.log(`📋 Required: ${featureData.requiredMembership}`);
        }
      } else {
        const errorText = await featureResponse.text();
        console.error('❌ Feature access API failed:', featureResponse.status, errorText);
      }
      
    } else {
      const errorText = await membershipResponse.text();
      console.error('❌ Membership API test failed:', membershipResponse.status, errorText);
    }
    
  } catch (error) {
    console.error('❌ Membership API test failed:', error);
  }
};

/**
 * Check local membership logic
 */
export const checkMembershipLogic = () => {
  console.log('🧮 Checking local membership logic...');
  
  const userStorage = localStorage.getItem('nosmoke_user') || sessionStorage.getItem('nosmoke_user');
  
  if (!userStorage) {
    console.error('❌ No user data found in storage');
    return { hasAccess: false, reason: 'No user data' };
  }
  
  try {
    const userData = JSON.parse(userStorage);
    console.log('👤 User data:', userData);
    
    const membership = userData.membership || userData.membershipType || 'free';
    console.log('💎 Current membership:', membership);
    
    const membershipLevels = { 'free': 0, 'premium': 1, 'pro': 2 };
    const allowedMemberships = ['premium', 'pro'];
    const userLevel = membershipLevels[membership];
    const minRequiredLevel = Math.min(...allowedMemberships.map(m => membershipLevels[m]));
    
    const hasAccess = userLevel >= minRequiredLevel;
    
    console.log(`🔢 User level: ${userLevel} (${membership})`);
    console.log(`🔢 Required level: ${minRequiredLevel} (${allowedMemberships.join(' or ')})`);
    console.log(`🎯 Local access check: ${hasAccess ? '✅ SHOULD HAVE ACCESS' : '❌ ACCESS DENIED'}`);
    
    return { 
      hasAccess, 
      userMembership: membership,
      userLevel,
      requiredLevel: minRequiredLevel,
      userData 
    };
    
  } catch (error) {
    console.error('❌ Error parsing user data:', error);
    return { hasAccess: false, reason: 'Invalid user data' };
  }
};

/**
 * Full authentication debug report
 */
export const fullAuthReport = () => {
  console.log('📋 === FULL AUTHENTICATION DEBUG REPORT ===');
  console.log('');
  
  checkAllTokens();
  console.log('');
  
  checkUserData();
  console.log('');
  
  const membershipLogic = checkMembershipLogic();
  console.log('');
  
  console.log('🔧 Available debug functions:');
  console.log('- window.debugAuthNew.checkAllTokens() - Check all token locations');
  console.log('- window.debugAuthNew.checkUserData() - Check user data');
  console.log('- window.debugAuthNew.testApiAuth() - Test general API authentication');
  console.log('- window.debugAuthNew.testAppointmentApi() - Test appointment API');
  console.log('- window.debugAuthNew.testMembershipApi() - Test membership API');
  console.log('- window.debugAuthNew.checkMembershipLogic() - Check local membership logic');
  console.log('- window.debugAuthNew.clearAllAuth() - Clear all auth data');
  console.log('- window.debugAuthNew.setTestToken() - Set a test token');
  console.log('');
  console.log('📋 === END REPORT ===');
  
  return membershipLogic;
};

// Export object with all functions for easy access
const debugAuthNew = {
  checkAllTokens,
  checkUserData,
  testApiAuth,
  testAppointmentApi,
  testMembershipApi,
  checkMembershipLogic,
  clearAllAuth,
  setTestToken,
  fullAuthReport
};

export default debugAuthNew;
