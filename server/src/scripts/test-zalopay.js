/**
 * Test script for ZaloPay integration
 * Run with: node src/scripts/test-zalopay.js
 */

import fetch from 'node-fetch';
import readline from 'readline';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:5000/api';
const TEST_USER_ID = 1; // Change to a valid user ID in your system
const TEST_PACKAGE_ID = 2; // Change to a valid package ID (Premium)
const TEST_AMOUNT = 99000; // 99,000 VND

// Create readline interface for interactive prompts
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Generate a test JWT token
function generateToken() {
  const payload = {
    id: TEST_USER_ID,
    email: 'test@example.com',
    role: 'user'
  };
  
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  return jwt.sign(payload, secret, { expiresIn: '1h' });
}

// Create a ZaloPay payment
async function createZaloPayment() {
  try {
    console.log('Creating ZaloPay payment...');
    
    const token = generateToken();
    
    const response = await fetch(`${API_URL}/payments/zalopay/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        packageId: TEST_PACKAGE_ID,
        amount: TEST_AMOUNT,
        redirectUrl: 'http://localhost:5173/payment/success'
      })
    });
    
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.success && data.data && data.data.order_url) {
      console.log('\n===== PAYMENT INFO =====');
      console.log('Payment URL:', data.data.order_url);
      console.log('Transaction ID:', data.data.app_trans_id || data.transactionId);
      console.log('QR Code (for mobile):', data.data.qr_code ? 'Available' : 'Not available');
      console.log('\nOpen the URL in your browser to complete the payment.');
      
      if (data.data.app_trans_id || data.transactionId) {
        return data.data.app_trans_id || data.transactionId;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error creating ZaloPay payment:', error);
    return null;
  }
}

// Check payment status
async function checkPaymentStatus(transactionId) {
  try {
    console.log(`\nChecking payment status for transaction ${transactionId}...`);
    
    const token = generateToken();
    
    const response = await fetch(`${API_URL}/payments/zalopay/status/${transactionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    console.log('Status Response:', JSON.stringify(data, null, 2));
    
    if (data.success && data.data) {
      console.log('\n===== PAYMENT STATUS =====');
      console.log('Status:', data.data.return_message);
      console.log('Return Code:', data.data.return_code);
      
      if (data.data.return_code === 1 || data.data.return_code === "1") {
        console.log('Payment was successful!');
      } else if (data.data.return_code === 2 || data.data.return_code === "2") {
        console.log('Payment is still pending. User has not completed payment yet.');
      } else {
        console.log('Payment failed or was cancelled.');
      }
    }
  } catch (error) {
    console.error('Error checking payment status:', error);
  }
}

// Main function
async function main() {
  console.log('===== ZALOPAY INTEGRATION TEST =====');
  
  rl.question('Do you want to create a new payment? (y/n): ', async (answer) => {
    if (answer.toLowerCase() === 'y') {
      const transactionId = await createZaloPayment();
      
      if (transactionId) {
        rl.question('\nDo you want to check the payment status? (y/n): ', async (checkAnswer) => {
          if (checkAnswer.toLowerCase() === 'y') {
            await checkPaymentStatus(transactionId);
          }
          rl.close();
        });
      } else {
        console.log('Failed to create payment or get transaction ID.');
        rl.close();
      }
    } else {
      rl.question('Enter the transaction ID to check: ', async (transactionId) => {
        if (transactionId) {
          await checkPaymentStatus(transactionId);
        } else {
          console.log('No transaction ID provided.');
        }
        rl.close();
      });
    }
  });
}

// Run the main function
main();
