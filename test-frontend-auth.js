// Test frontend authentication với browser console
// Chạy script này trong browser console để test

console.log('🧪 Testing frontend authentication...');

// Test 1: Kiểm tra axiosConfig
async function testAxiosConfig() {
    console.log('\n=== TEST 1: Axios Config ===');
    
    // Giả lập có token
    localStorage.setItem('nosmoke_token', 'test-token-123');
    
    try {
        // Import axios config (nếu có thể)
        const axios = window.axios; // Axios should be available globally or imported
        
        if (axios) {
            console.log('✅ Axios instance found');
            
            // Kiểm tra request interceptor
            const config = {
                headers: {}
            };
            
            // Simulate interceptor
            const token = localStorage.getItem('nosmoke_token') || sessionStorage.getItem('nosmoke_token');
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
                console.log('✅ Token would be added to header:', config.headers['Authorization'].substring(0, 20) + '...');
            } else {
                console.log('❌ No token found');
            }
        } else {
            console.log('⚠️ Axios not found globally, checking in modules...');
        }
    } catch (error) {
        console.log('❌ Error testing axios config:', error);
    }
    
    // Cleanup
    localStorage.removeItem('nosmoke_token');
}

// Test 2: Kiểm tra AuthContext
async function testAuthContext() {
    console.log('\n=== TEST 2: Auth Context ===');
    
    try {
        // Kiểm tra localStorage/sessionStorage keys
        const possibleKeys = ['nosmoke_token', 'auth_token', 'nosmoke_user'];
        
        possibleKeys.forEach(key => {
            const value = localStorage.getItem(key) || sessionStorage.getItem(key);
            if (value) {
                console.log(`✅ Found ${key}:`, typeof value === 'string' && value.length > 20 ? value.substring(0, 20) + '...' : value);
            } else {
                console.log(`⚪ ${key}: not found`);
            }
        });
        
    } catch (error) {
        console.log('❌ Error checking auth context:', error);
    }
}

// Test 3: Test login flow
async function testLoginFlow() {
    console.log('\n=== TEST 3: Login Flow ===');
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'testuser@example.com',
                password: 'password123'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Login successful');
            console.log('Token received:', data.data.token.substring(0, 20) + '...');
            
            // Save token như AuthContext sẽ làm
            localStorage.setItem('nosmoke_token', data.data.token);
            localStorage.setItem('nosmoke_user', JSON.stringify(data.data.user));
            
            console.log('✅ Token saved to localStorage');
            
            // Test authenticated request
            const packagesResponse = await fetch('/api/packages', {
                headers: {
                    'Authorization': `Bearer ${data.data.token}`
                }
            });
            
            const packagesData = await packagesResponse.json();
            
            if (packagesData.success) {
                console.log('✅ Authenticated packages request successful');
                console.log('Packages count:', packagesData.data.length);
            } else {
                console.log('❌ Authenticated packages request failed:', packagesData.message);
            }
            
        } else {
            console.log('❌ Login failed:', data.message);
        }
        
    } catch (error) {
        console.log('❌ Login flow error:', error);
    }
}

// Run all tests
async function runAllTests() {
    await testAxiosConfig();
    await testAuthContext();
    await testLoginFlow();
    
    console.log('\n✅ All frontend tests completed!');
    console.log('📱 You can now try the actual login/payment flow on the website');
}

// Auto-run tests
runAllTests();
