import { pool } from '../config/database.js';

async function checkUsersTable() {
    try {
        console.log('🔍 Checking users table structure...');

        // Check table structure
        const [columns] = await pool.query(`
            SHOW COLUMNS FROM users WHERE Field = 'membership'
        `);
        
        console.log('\n📋 Membership column structure:');
        console.log(columns[0]);

        // Check current values
        const [users] = await pool.query(`
            SELECT id, email, membership, role 
            FROM users 
            ORDER BY id
        `);

        console.log('\n👥 Users data:');
        users.forEach(user => {
            console.log(`ID: ${user.id}, Email: ${user.email}, Membership: ${user.membership}, Role: ${user.role}`);
        });

        // Check if we need to update the membership enum
        if (columns[0].Type === "enum('free')") {
            console.log('\n⚠️ Membership column needs to be updated to include all types');
            
            console.log('\n🔄 Updating membership column...');
            await pool.query(`
                ALTER TABLE users 
                MODIFY COLUMN membership ENUM('free', 'premium', 'pro') DEFAULT 'free'
            `);
            console.log('✅ Membership column updated successfully');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error checking users table:', error);
        process.exit(1);
    }
}

// Run the function
checkUsersTable(); 