// Test authentication flow with token integration
async function testAuthFlow() {
    console.log('🔍 Testing authentication flow...\n');
    
    const baseURL = 'http://localhost:5000';
    
    // Test 1: Login and get token
    console.log('📝 Test 1: Login and get token');
    try {
        const loginResponse = await fetch(`${baseURL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'user@example.com',
                password: 'password123'
            })
        });
        
        const loginData = await loginResponse.json();
        console.log('Login response:', loginData);
        
        if (loginData.success) {
            const { user, token } = loginData.data;
            console.log('✅ User object:', user);
            console.log('✅ Token:', token ? 'Present' : 'Missing');
            console.log('✅ User ID:', user.id);
            
            // Test 2: Simulate localStorage storage
            console.log('\n📦 Test 2: Simulating localStorage storage');
            
            // Mock localStorage
            const mockLocalStorage = {
                data: {},
                setItem: function(key, value) {
                    this.data[key] = value;
                    console.log(`Set ${key}: ${value}`);
                },
                getItem: function(key) {
                    return this.data[key] || null;
                }
            };
            
            // Store data as AuthContext would
            mockLocalStorage.setItem('nosmoke_token', token);
            mockLocalStorage.setItem('nosmoke_user', JSON.stringify(user));
            
            // Test 3: Verify getCurrentUserId would work
            console.log('\n🔍 Test 3: Testing getCurrentUserId logic');
            const storedUserStr = mockLocalStorage.getItem('nosmoke_user');
            if (storedUserStr) {
                const storedUser = JSON.parse(storedUserStr);
                const extractedUserId = storedUser.id || storedUser.smoker_id || storedUser.user_id;
                console.log('✅ Extracted user ID:', extractedUserId);
                
                // Test 4: Test API call with token
                console.log('\n🔧 Test 4: Testing API call with token');
                const storedToken = mockLocalStorage.getItem('nosmoke_token');
                console.log('Token available:', storedToken ? 'Yes' : 'No');
                
                if (storedToken && extractedUserId) {
                    try {
                        const planResponse = await fetch(`${baseURL}/api/quit-plans/user-active`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${storedToken}`,
                                'Content-Type': 'application/json'
                            }
                        });
                        
                        const planData = await planResponse.json();
                        console.log('✅ Plan API response:', planData);
                        
                        // Test 5: Test progress API call
                        console.log('\n📈 Test 5: Testing progress API call');
                        const progressResponse = await fetch(`${baseURL}/api/progress/user`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${storedToken}`,
                                'Content-Type': 'application/json'
                            }
                        });
                        
                        const progressData = await progressResponse.json();
                        console.log('✅ Progress API response:', progressData);
                        
                    } catch (apiError) {
                        console.error('❌ API call error:', apiError.message);
                    }
                }
            }
            
        } else {
            console.error('❌ Login failed:', loginData.message);
        }
        
    } catch (error) {
        console.error('❌ Login error:', error.message);
    }
}

// Run the test
testAuthFlow();
