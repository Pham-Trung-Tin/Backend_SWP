/**
 * Test script to verify the payments table functionality
 * 
 * To run this script, execute:
 * node server/src/scripts/test-payments.js
 */

import { pool } from '../config/database.js';
import * as Payment from '../models/Payment.js';
import * as Package from '../models/Package.js';
import { ensurePaymentsTable } from '../models/Payment.js';

/**
 * Tests the payments functionality
 */
const testPayments = async () => {
  try {
    console.log('🔍 Testing payments table functionality...');
    
    // Ensure the payments table exists
    console.log('1. Ensuring payments table exists...');
    await ensurePaymentsTable();
    console.log('✅ Payments table created or already exists');
    
    // Get all available packages for reference
    console.log('\n2. Getting available packages...');
    const [packages] = await pool.execute('SELECT * FROM package');
    console.log(`📦 Found ${packages.length} packages`);
    
    // Get any user for testing
    console.log('\n3. Getting a test user...');
    const [users] = await pool.execute('SELECT id FROM users LIMIT 1');
    
    if (users.length === 0) {
      console.error('❌ No users found in the database. Please create a user first.');
      return;
    }
    
    const testUser = users[0];
    console.log(`👤 Using user ID: ${testUser.id} for test`);
    
    // Create a test payment
    console.log('\n4. Creating a test payment record...');
    const testPackage = packages[0];
    
    const paymentData = {
      userId: testUser.id,
      packageId: testPackage.id,
      amount: testPackage.price,
      paymentMethod: 'test',
      paymentStatus: 'pending',
      paymentDetails: {
        test: true,
        message: 'This is a test payment',
        timestamp: new Date().toISOString()
      },
      transactionId: `TEST-${Date.now()}`
    };
    
    console.log('Creating payment with data:', paymentData);
    
    const payment = await Payment.createPayment(paymentData);
    console.log('✅ Payment created successfully:', payment);
    
    // Get user payments
    console.log('\n5. Getting user payments...');
    const userPayments = await Payment.getUserPayments(testUser.id);
    console.log(`✅ Found ${userPayments.length} payments for user ${testUser.id}`);
    
    // Update payment status
    console.log('\n6. Updating payment status...');
    const updatedPayment = await Payment.updatePaymentStatus(
      payment.id,
      'completed',
      `COMPLETED-${Date.now()}`
    );
    console.log('✅ Payment status updated:', updatedPayment);
    
    console.log('\n✅ All payment tests completed successfully!');
  } catch (error) {
    console.error('❌ Error testing payments functionality:', error);
  } finally {
    // Close the database connection
    pool.end();
  }
};

// Run the test
testPayments();
