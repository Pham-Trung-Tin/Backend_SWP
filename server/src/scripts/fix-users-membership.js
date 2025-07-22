import { pool } from '../config/database.js';

async function fixUsersMembership() {
    try {
        console.log('🔄 Starting users membership column fix...');

        // Step 1: Backup current membership values
        console.log('📦 Backing up current membership values...');
        const [users] = await pool.query('SELECT id, membership FROM users');
        
        // Step 2: Modify the column to ENUM
        console.log('🔧 Modifying membership column to ENUM...');
        await pool.query(`
            ALTER TABLE users 
            MODIFY COLUMN membership ENUM('free', 'premium', 'pro') DEFAULT 'free'
        `);
        
        // Step 3: Verify the change
        const [columns] = await pool.query(`
            SHOW COLUMNS FROM users WHERE Field = 'membership'
        `);
        
        console.log('\n📋 New membership column structure:');
        console.log(columns[0]);

        // Step 4: Update any invalid values to 'free'
        console.log('\n🔄 Updating invalid membership values to "free"...');
        await pool.query(`
            UPDATE users 
            SET membership = 'free' 
            WHERE membership NOT IN ('free', 'premium', 'pro') 
            OR membership IS NULL
        `);

        // Step 5: Final verification
        const [updatedUsers] = await pool.query(`
            SELECT id, email, membership, role 
            FROM users 
            ORDER BY id
        `);

        console.log('\n👥 Updated users data:');
        updatedUsers.forEach(user => {
            console.log(`ID: ${user.id}, Email: ${user.email}, Membership: ${user.membership}, Role: ${user.role}`);
        });

        console.log('\n✅ Users membership column fixed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error fixing users membership:', error);
        process.exit(1);
    }
}

// Run the function
fixUsersMembership(); 