import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Test function to check token structure from login endpoint
const testTokenFix = async () => {
  try {
    console.log('🔍 Testing login token structure fix...');
    
    // Replace with valid test credentials
    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    // Update the URL to match your server
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      console.error('❌ Login failed:', data.message);
      return;
    }
    
    console.log('✅ Login successful');
    
    if (!data.data?.token) {
      console.error('❌ No token returned in response');
      return;
    }
    
    // Decode the token to check its structure
    const token = data.data.token;
    const decoded = jwt.decode(token);
    
    console.log('📋 Token structure:');
    console.log(JSON.stringify(decoded, null, 2));
    
    // Check for id field
    if (decoded.id !== undefined) {
      console.log('✅ Token contains "id" field:', decoded.id);
    } else {
      console.log('❌ Token does NOT contain "id" field');
    }
    
    // Check for userId field
    if (decoded.userId !== undefined) {
      console.log('✅ Token contains "userId" field:', decoded.userId);
    } else {
      console.log('❌ Token does NOT contain "userId" field');
    }
    
    // Test purchase API with the token
    console.log('🧪 Testing /api/packages/purchase API with login token...');
    
    // Example purchase data
    const purchaseData = {
      packageId: 1,
      amount: 100000,
      paymentMethod: 'credit_card'
    };
    
    const purchaseResponse = await fetch('http://localhost:3001/api/packages/purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(purchaseData),
    });
    
    const purchaseResult = await purchaseResponse.json();
    
    console.log('📊 Purchase API response:');
    console.log(JSON.stringify(purchaseResult, null, 2));
    
    if (purchaseResult.success) {
      console.log('🎉 Purchase API test successful!');
    } else {
      console.log('❌ Purchase API test failed:', purchaseResult.message);
    }
  } catch (error) {
    console.error('❌ Test error:', error);
  }
};

// Run the test
testTokenFix();
