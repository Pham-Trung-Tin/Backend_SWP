// Script để cập nhật thủ công tất cả payments pending
import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '', // Update with your password
    database: 'railway'
};

async function updatePendingPayments() {
    console.log('=== Updating Pending Payments ===\n');
    
    let connection;
    try {
        // Connect to database
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');
        
        // Get all pending payments
        const [pendingPayments] = await connection.execute(`
            SELECT id, user_id, package_id, transaction_id, amount, payment_method 
            FROM payments 
            WHERE payment_status = 'pending' AND payment_method = 'zalopay'
            ORDER BY created_at DESC
        `);
        
        console.log(`Found ${pendingPayments.length} pending ZaloPay payments:`);
        pendingPayments.forEach((payment, index) => {
            console.log(`${index + 1}. ID: ${payment.id}, Transaction: ${payment.transaction_id}, User: ${payment.user_id}, Amount: ${payment.amount}`);
        });
        
        if (pendingPayments.length === 0) {
            console.log('No pending payments to update');
            return;
        }
        
        console.log('\n=== Manual Update Process ===');
        console.log('Since the old transactions were created via local server,');
        console.log('they don\'t exist in real ZaloPay system.');
        console.log('You have 2 options:');
        console.log('');
        console.log('Option 1: Mark as completed manually (if user actually paid)');
        console.log('Option 2: Mark as failed and ask user to pay again');
        console.log('');
        console.log('To mark as completed (use with caution):');
        pendingPayments.forEach((payment) => {
            console.log(`UPDATE payments SET payment_status = 'completed' WHERE id = ${payment.id};`);
            console.log(`UPDATE payment_transactions SET status = 'completed' WHERE transaction_id = '${payment.transaction_id}';`);
        });
        
        console.log('\nTo mark as failed:');
        pendingPayments.forEach((payment) => {
            console.log(`UPDATE payments SET payment_status = 'failed' WHERE id = ${payment.id};`);
            console.log(`UPDATE payment_transactions SET status = 'failed' WHERE transaction_id = '${payment.transaction_id}';`);
        });
        
    } catch (error) {
        console.error('❌ Database error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n✅ Database connection closed');
        }
    }
}

updatePendingPayments();
