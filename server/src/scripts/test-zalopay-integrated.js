import axios from 'axios';
import dotenv from 'dotenv';
import * as Payment from '../models/Payment.js';
import * as PaymentTransaction from '../models/PaymentTransaction.js';

// Load environment variables
dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:8800';
let authToken = '';
let userId = null;

/**
 * Integration test for ZaloPay payment flow
 */
async function testZaloPayFlow() {
  try {
    console.log('=== ZALOPAY PAYMENT FLOW TEST ===');
    
    // Step 1: Login to get token
    console.log('\n1. Logging in to get auth token...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'test@example.com', // Replace with valid credentials
      password: 'password123'     // Replace with valid credentials
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + loginResponse.data.message);
    }
    
    authToken = loginResponse.data.data.token;
    userId = loginResponse.data.data.user.id;
    console.log('✅ Login successful. User ID:', userId);
    
    // Step 2: Create ZaloPay payment
    console.log('\n2. Creating ZaloPay payment...');
    const createPaymentResponse = await axios.post(
      `${API_URL}/api/payments/zalopay/create`,
      {
        packageId: 1, // Replace with valid package ID
        amount: 50000, // 50,000 VND
        redirectUrl: 'http://localhost:5173/payment/success'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    if (!createPaymentResponse.data.success) {
      throw new Error('Payment creation failed: ' + createPaymentResponse.data.message);
    }
    
    const { order_token, zp_trans_token } = createPaymentResponse.data.data;
    const transactionId = createPaymentResponse.data.data.app_trans_id || createPaymentResponse.data.data.transactionId;
    
    console.log('✅ Payment created successfully');
    console.log('   Transaction ID:', transactionId);
    console.log('   Order URL:', createPaymentResponse.data.data.order_url);
    
    // Step 3: Check payment in database
    console.log('\n3. Checking payment record in database...');
    const payment = await Payment.getPaymentByTransactionId(transactionId);
    
    if (!payment) {
      throw new Error('Payment record not found in database');
    }
    
    console.log('✅ Payment record found:');
    console.log('   ID:', payment.id);
    console.log('   User ID:', payment.user_id);
    console.log('   Amount:', payment.amount);
    console.log('   Status:', payment.payment_status);
    
    // Step 4: Check transaction record
    console.log('\n4. Checking transaction record in database...');
    const transaction = await PaymentTransaction.getTransactionById(transactionId);
    
    if (!transaction) {
      console.log('❌ Transaction record not found - this should be created when creating payment');
    } else {
      console.log('✅ Transaction record found:');
      console.log('   ID:', transaction.id);
      console.log('   Payment ID:', transaction.payment_id);
      console.log('   Status:', transaction.status);
    }
    
    // Step 5: Check payment status through API
    console.log('\n5. Checking payment status through API...');
    const statusResponse = await axios.get(
      `${API_URL}/api/payments/zalopay/status/${transactionId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    if (!statusResponse.data.success) {
      throw new Error('Status check failed: ' + statusResponse.data.message);
    }
    
    console.log('✅ Status check response:');
    console.log('   Return Code:', statusResponse.data.data.return_code);
    console.log('   Return Message:', statusResponse.data.data.return_message);
    
    // Step 6: Simulate ZaloPay callback (this would normally come from ZaloPay)
    console.log('\n6. Simulating ZaloPay callback...');
    console.log('   NOTE: This is just a simulation, not a real callback');
    console.log('   In production, ZaloPay would send this callback to your server');
    
    const mockCallbackData = {
      data: {
        app_id: 2554,
        app_trans_id: transactionId,
        app_time: Date.now(),
        app_user: userId.toString(),
        amount: 50000,
        embed_data: JSON.stringify({ redirecturl: 'http://localhost:5173/payment/success' }),
        item: JSON.stringify([{ packageId: 1 }]),
        zp_trans_id: 123456789,
        server_time: Date.now(),
        channel: 38,
        merchant_user_id: userId.toString(),
        user_fee_amount: 0,
        discount_amount: 0
      },
      mac: "dummy-mac-value",
      type: 1
    };
    
    // In a real test, you would send this to your callback endpoint
    // await axios.post(`${API_URL}/api/payments/zalopay/callback`, mockCallbackData);
    
    console.log('\n=== TEST COMPLETED ===');
    console.log('All steps completed successfully');
    console.log('To complete the payment flow in real scenario:');
    console.log('1. User would pay through the order_url or QR code');
    console.log('2. ZaloPay would send a callback to your server');
    console.log('3. Payment status would be updated and membership activated');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testZaloPayFlow();
