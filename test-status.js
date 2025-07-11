// Test payment status after user completes payment
import axios from 'axios';

const BASE_URL = 'http://localhost:5000';
const transactionId = process.argv[2];
const token = 'YOUR_JWT_TOKEN_HERE'; // Replace with actual token

if (!transactionId) {
    console.log('Usage: node test-status.js <transaction_id>');
    console.log('Example: node test-status.js 250711_123456');
    process.exit(1);
}

if (token === 'YOUR_JWT_TOKEN_HERE') {
    console.log('⚠️  Please update the token in this file first');
    process.exit(1);
}

async function testPaymentStatus() {
    console.log(`=== Testing Payment Status for ${transactionId} ===\n`);
    
    try {
        // Check status via our API
        console.log('1. Checking status via our API...');
        const statusResponse = await axios.get(
            `${BASE_URL}/api/payments/zalopay/status/${transactionId}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        
        console.log('✅ Status Response:', statusResponse.data);
        
        if (statusResponse.data.success && statusResponse.data.data.return_code === 1) {
            console.log('🎉 Payment successful! Checking database...');
            
            // Check if payment was updated in database
            const paymentResponse = await axios.get(
                `${BASE_URL}/api/payments/transaction/${transactionId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            console.log('💾 Database status:', paymentResponse.data);
            
        } else {
            console.log('⏳ Payment not completed yet or failed');
            console.log('You can try manual update with:');
            console.log(`curl -X POST "${BASE_URL}/api/payments/zalopay/manual-update/${transactionId}" -H "Authorization: Bearer ${token}"`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testPaymentStatus();
