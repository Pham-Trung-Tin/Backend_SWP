// Test script to verify user authentication and data flow
console.log('🔍 Testing user authentication flow...\n');

// Test 1: Check if user is logged in
console.log('📋 Test 1: Check localStorage/sessionStorage');
console.log('localStorage keys:', Object.keys(localStorage));
console.log('sessionStorage keys:', Object.keys(sessionStorage));

// Test 2: Check user data
console.log('\n📋 Test 2: Check user data');
const nosmokeUser = localStorage.getItem('nosmoke_user') || sessionStorage.getItem('nosmoke_user');
console.log('nosmoke_user:', nosmokeUser);

if (nosmokeUser) {
    try {
        const userData = JSON.parse(nosmokeUser);
        console.log('Parsed user data:', userData);
        console.log('User ID:', userData.id);
        console.log('Username:', userData.username);
        console.log('Email:', userData.email);
    } catch (e) {
        console.error('Error parsing user data:', e);
    }
} else {
    console.log('No user data found');
}

// Test 3: Check token
console.log('\n📋 Test 3: Check token');
const token = localStorage.getItem('nosmoke_token') || sessionStorage.getItem('nosmoke_token');
console.log('nosmoke_token:', token ? 'Present' : 'Missing');

// Test 4: Simulate getCurrentUserId function
console.log('\n📋 Test 4: Simulate getCurrentUserId');
function testGetCurrentUserId() {
    // Priority order: auth system keys -> legacy keys -> user object fields -> null
    let userId = localStorage.getItem('user_id') || localStorage.getItem('userId');
    
    if (!userId) {
        // Check nosmoke_user first (main auth system)
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
    
    // Try sessionStorage as backup
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
}

const testUserId = testGetCurrentUserId();
console.log('Test getCurrentUserId result:', testUserId);

// Test 5: Check if user is considered "logged in"
console.log('\n📋 Test 5: Check login status');
const isLoggedIn = !!(testUserId && token);
console.log('Is user logged in?', isLoggedIn);

if (isLoggedIn) {
    console.log('✅ User is properly logged in');
    console.log('User ID:', testUserId);
    console.log('Token:', token ? 'Available' : 'Missing');
} else {
    console.log('❌ User is not properly logged in');
    console.log('Missing:', testUserId ? 'Token' : 'User ID');
}

// Test 6: Test API call format
console.log('\n📋 Test 6: API call format');
if (testUserId) {
    console.log('Progress API URL would be:', `/api/progress/${testUserId}`);
    console.log('Stats API URL would be:', `/api/progress/${testUserId}/stats`);
    console.log('Chart API URL would be:', `/api/progress/${testUserId}/chart-data`);
} else {
    console.log('❌ Cannot generate API URLs without user ID');
}
