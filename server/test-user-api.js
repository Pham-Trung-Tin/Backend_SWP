// Test script for User API endpoints
// Uses built-in fetch (Node.js 18+)

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
    email: 'testuser@example.com',
    password: 'password123',
    username: 'testuser',
    fullName: 'Test User'
};

const updatedProfile = {
    full_name: 'Updated Test User',
    phone: '+84123456789',
    date_of_birth: '1990-01-01',
    gender: 'male'
};

const smokingData = {
    is_smoker: true,
    cigarettes_per_day: 10,
    years_smoking: 5,
    preferred_brand: 'Test Brand',
    quit_attempts: 2,
    motivation: 'Health reasons'
};

let authToken = '';

// Helper function to make authenticated requests
const makeRequest = async (url, options = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(`${BASE_URL}${url}`, {
        ...options,
        headers
    });

    const data = await response.json();
    console.log(`${options.method || 'GET'} ${url}:`, {
        status: response.status,
        success: data.success,
        message: data.message,
        data: data.data
    });

    return { response, data };
};

// Test functions
const testLogin = async () => {
    console.log('\n=== Testing Login ===');
    const { data } = await makeRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            email: testUser.email,
            password: testUser.password
        })
    });

    if (data.success && data.data.token) {
        authToken = data.data.token;
        console.log('✅ Login successful, token acquired');
        return true;
    } else {
        console.log('❌ Login failed');
        return false;
    }
};

const testGetProfile = async () => {
    console.log('\n=== Testing GET /api/users/profile ===');
    await makeRequest('/users/profile');
};

const testUpdateProfile = async () => {
    console.log('\n=== Testing PUT /api/users/profile ===');
    await makeRequest('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(updatedProfile)
    });
};

const testGetSmokingStatus = async () => {
    console.log('\n=== Testing GET /api/users/smoking-status ===');
    await makeRequest('/users/smoking-status');
};

const testUpdateSmokingStatus = async () => {
    console.log('\n=== Testing PUT /api/users/smoking-status ===');
    await makeRequest('/users/smoking-status', {
        method: 'PUT',
        body: JSON.stringify(smokingData)
    });
};

// Main test function
const runTests = async () => {
    console.log('🚀 Starting User API Tests...\n');

    try {
        // First login to get token
        const loginSuccess = await testLogin();
        if (!loginSuccess) {
            console.log('❌ Cannot proceed without valid token');
            return;
        }

        // Test all user endpoints
        await testGetProfile();
        await testUpdateProfile();
        await testGetProfile(); // Check if update worked
        await testGetSmokingStatus();
        await testUpdateSmokingStatus();
        await testGetSmokingStatus(); // Check if update worked

        console.log('\n✅ All tests completed!');

    } catch (error) {
        console.error('❌ Test error:', error.message);
    }
};

// Run tests
runTests();
