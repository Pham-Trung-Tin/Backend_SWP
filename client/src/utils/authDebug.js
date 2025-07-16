/**
 * Authentication Debug Utility
 * Helps debug authentication issues in the frontend
 */

export const debugAuth = {
  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const tokens = {
      localStorage_nosmoke: localStorage.getItem('nosmoke_token'),
      localStorage_token: localStorage.getItem('token'),
      sessionStorage_nosmoke: sessionStorage.getItem('nosmoke_token'),
      sessionStorage_token: sessionStorage.getItem('token')
    };
    
    console.log('🔍 Authentication Debug:', tokens);
    
    const hasToken = Object.values(tokens).some(token => token !== null);
    console.log(`🔐 Authenticated: ${hasToken}`);
    
    return hasToken;
  },

  /**
   * Get current auth token
   */
  getToken() {
    const token = localStorage.getItem('nosmoke_token') || 
                  localStorage.getItem('token') ||
                  sessionStorage.getItem('nosmoke_token') ||
                  sessionStorage.getItem('token');
    
    if (token) {
      console.log('🔑 Current token:', token.substring(0, 20) + '...');
    } else {
      console.warn('⚠️ No token found');
    }
    
    return token;
  },

  /**
   * Get current user info
   */
  getCurrentUser() {
    const userStorage = localStorage.getItem('nosmoke_user') || sessionStorage.getItem('nosmoke_user');
    
    if (userStorage) {
      try {
        const user = JSON.parse(userStorage);
        console.log('👤 Current user:', {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.full_name || user.fullName
        });
        return user;
      } catch (error) {
        console.error('❌ Error parsing user data:', error);
        return null;
      }
    } else {
      console.warn('⚠️ No user data found');
      return null;
    }
  },

  /**
   * Clear all auth data
   */
  clearAuth() {
    const keys = ['nosmoke_token', 'token', 'nosmoke_user', 'nosmoke_remember'];
    
    keys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    console.log('🧹 Cleared all authentication data');
  },

  /**
   * Test API call with current auth
   */
  async testApiCall(endpoint = '/api/appointments/user') {
    try {
      const token = this.getToken();
      
      if (!token) {
        console.error('❌ Cannot test API call - no token');
        return;
      }
      
      console.log(`🧪 Testing API call to ${endpoint}`);
      
      const response = await fetch(`${window.location.origin}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      console.log(`📊 API Response (${response.status}):`, data);
      
      if (response.status === 401) {
        console.error('🚫 Token expired or invalid');
      } else if (response.status === 200) {
        console.log('✅ API call successful');
      }
      
      return { response, data };
    } catch (error) {
      console.error('❌ API test failed:', error);
    }
  },

  /**
   * Show full debug report
   */
  fullReport() {
    console.log('\n📋 === AUTHENTICATION DEBUG REPORT ===');
    console.log('🔍 Checking authentication status...');
    
    this.isAuthenticated();
    this.getToken();
    this.getCurrentUser();
    
    console.log('\n🧪 Testing API call...');
    this.testApiCall();
    
    console.log('\n📋 === END REPORT ===\n');
  }
};

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  window.debugAuth = debugAuth;
}

export default debugAuth;
