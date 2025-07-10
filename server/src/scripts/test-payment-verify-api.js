/**
 * Script kiểm tra API endpoint /api/payments/verify
 */

import fetch from 'node-fetch';

const testPaymentVerifyAPI = async () => {
  try {
    const url = 'http://localhost:5000/api/payments/callback/verify';
    console.log(`🔍 Testing API endpoint: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        transactionId: 'TEST123456789',
        paymentStatus: 'completed'
      })
    });
    
    const data = await response.json();
    console.log('📝 Response status:', response.status);
    console.log('📝 Response data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Error testing API:', error);
  }
};

// Thực thi
testPaymentVerifyAPI();
