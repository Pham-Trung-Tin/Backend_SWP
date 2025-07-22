import { pool } from '../config/database.js';

async function fixUsersMembershipStrict() {
    try {
        console.log('🔄 Starting users membership column strict fix...');

        // Step 1: Backup current membership values
        console.log('📦 Backing up current membership values...');
        const [users] = await pool.query('SELECT id, membership FROM users');
        
        // Step 2: Drop the existing membership column and create new one with strict ENUM
        console.log('🔧 Recreating membership column with strict ENUM...');
        await pool.query(`
            ALTER TABLE users 
            DROP COLUMN membership
        `);

        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN membership ENUM('free', 'premium', 'pro') NOT NULL DEFAULT 'free'
        `);
        
        // Step 3: Verify the change
        const [columns] = await pool.query(`
            SHOW COLUMNS FROM users WHERE Field = 'membership'
        `);
        
        console.log('\n📋 New membership column structure:');
        console.log(columns[0]);

        // Step 4: Set all existing users to 'free' membership
        console.log('\n🔄 Setting all users to "free" membership...');
        await pool.query(`
            UPDATE users 
            SET membership = 'free'
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

        // Step 6: Add a trigger to prevent invalid values
        console.log('\n🔒 Adding validation trigger...');
        await pool.query(`
            CREATE TRIGGER before_user_membership_update 
            BEFORE UPDATE ON users
            FOR EACH ROW
            BEGIN
                IF NEW.membership NOT IN ('free', 'premium', 'pro') THEN
                    SIGNAL SQLSTATE '45000'
                    SET MESSAGE_TEXT = 'Invalid membership value. Must be one of: free, premium, pro';
                END IF;
            END
        `);

        console.log('\n✅ Users membership column fixed with strict validation!');
        console.log('ℹ️ Membership can now only be: free, premium, or pro');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error fixing users membership:', error);
        process.exit(1);
    }
}

// Run the function
fixUsersMembershipStrict(); 