// Test script for Smoking Status API
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// Login to get token
async function login() {
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'testuser@example.com',
            password: 'password123',
        });

        const data = response.data;
        console.log('Login result:', data);

        if (data.success) {
            return data.data.token;
        } else {
            throw new Error('Login failed');
        }
    } catch (error) {
        console.error('Login error:', error.message);
        process.exit(1);
    }
}

async function testSmokingStatusAPI(token) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };

    // 1. Test updating smoking status with is_smoker=true
    console.log('\n=== Testing Update Smoking Status to Active ===');
    try {
        const activeData = {
            is_smoker: true,
            cigarettes_per_day: 15,
            years_smoking: 8,
        };

        const activeResponse = await axios.put(`${BASE_URL}/users/smoking-status`, activeData, { headers });
        const activeResult = activeResponse.data;
        console.log('Update result (Active):', JSON.stringify(activeResult, null, 2));

        // Verify the update
        const getResponse = await axios.get(`${BASE_URL}/users/smoking-status`, { headers });
        const getResult = getResponse.data;
        console.log('Get result (After Active update):', JSON.stringify(getResult, null, 2));
    } catch (error) {
        console.error('Test error (Active):', error.message);
    }

    // 2. Test updating smoking status with is_smoker=false
    console.log('\n=== Testing Update Smoking Status to Quit ===');
    try {
        const quitDate = new Date().toISOString().split('T')[0]; // Today
        const quitData = {
            is_smoker: false,
            quit_date: quitDate,
        };

        const quitResponse = await axios.put(`${BASE_URL}/users/smoking-status`, quitData, { headers });
        const quitResult = quitResponse.data;
        console.log('Update result (Quit):', JSON.stringify(quitResult, null, 2));

        // Verify the update
        const getResponse = await axios.get(`${BASE_URL}/users/smoking-status`, { headers });
        const getResult = getResponse.data;
        console.log('Get result (After Quit update):', JSON.stringify(getResult, null, 2));
    } catch (error) {
        console.error('Test error (Quit):', error.message);
    }
}

// Run the tests
async function runTests() {
    console.log('=== Starting Smoking Status API Tests ===');
    const token = await login();
    await testSmokingStatusAPI(token);
    console.log('\n=== Tests Completed ===');
}

runTests();
