// Test user ID detection across different storage methods
console.log('🔍 Testing User ID Detection...');

// Simulate different user storage scenarios
const testUserIdDetection = () => {
    console.log('=== Current Storage State ===');
    
    // Check all possible storage locations
    const storageKeys = [
        'user_id', 'userId', 'nosmoke_user', 'user', 
        'auth_token', 'refresh_token'
    ];
    
    console.log('localStorage:');
    storageKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
            if (key.includes('user') && !key.includes('token')) {
                try {
                    const parsed = JSON.parse(value);
                    console.log(`  ${key}:`, parsed);
                } catch (e) {
                    console.log(`  ${key}:`, value);
                }
            } else {
                console.log(`  ${key}:`, value ? 'exists' : 'null');
            }
        }
    });
    
    console.log('\nsessionStorage:');
    storageKeys.forEach(key => {
        const value = sessionStorage.getItem(key);
        if (value) {
            if (key.includes('user') && !key.includes('token')) {
                try {
                    const parsed = JSON.parse(value);
                    console.log(`  ${key}:`, parsed);
                } catch (e) {
                    console.log(`  ${key}:`, value);
                }
            } else {
                console.log(`  ${key}:`, value ? 'exists' : 'null');
            }
        }
    });
    
    // Test the utility function (need to copy logic since we can't import in browser console)
    const getCurrentUserId = () => {
        let userId = localStorage.getItem('user_id') || localStorage.getItem('userId');
        
        if (!userId) {
            const userStr = localStorage.getItem('nosmoke_user') || localStorage.getItem('user');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    userId = user.id || user.smoker_id || user.user_id;
                } catch (e) {
                    console.warn('Error parsing user data from localStorage:', e);
                }
            }
        }
        
        if (!userId) {
            userId = sessionStorage.getItem('user_id') || sessionStorage.getItem('userId');
            
            if (!userId) {
                const userStr = sessionStorage.getItem('nosmoke_user') || sessionStorage.getItem('user');
                if (userStr) {
                    try {
                        const user = JSON.parse(userStr);
                        userId = user.id || user.smoker_id || user.user_id;
                    } catch (e) {
                        console.warn('Error parsing user data from sessionStorage:', e);
                    }
                }
            }
        }
        
        return userId || null;
    };
    
    console.log('\n=== Detection Results ===');
    const detectedUserId = getCurrentUserId();
    console.log('Detected User ID:', detectedUserId);
    
    if (detectedUserId) {
        console.log('✅ User ID successfully detected');
    } else {
        console.log('❌ No user ID found - user may not be logged in');
        console.log('💡 This will trigger fallback to user ID 13 for development');
    }
    
    // Check authentication status
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    console.log('Auth Token:', token ? 'exists' : 'missing');
    
    if (detectedUserId && token) {
        console.log('✅ User appears to be properly authenticated');
    } else if (detectedUserId && !token) {
        console.log('⚠️ User ID found but no auth token - may need to re-login');
    } else if (!detectedUserId && token) {
        console.log('⚠️ Auth token found but no user ID - data inconsistency');
    } else {
        console.log('❌ User not authenticated - should redirect to login');
    }
};

// Run the test
testUserIdDetection();
