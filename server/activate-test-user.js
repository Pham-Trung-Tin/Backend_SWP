// Manually activate test user in database
import { pool } from './src/config/database.js';

const activateTestUser = async () => {
    try {
        console.log('🔧 Manually activating test user...');

        const email = 'testuser@example.com';

        // First, move user from pending_registrations to users table
        const [pendingUsers] = await pool.execute(
            'SELECT * FROM pending_registrations WHERE email = ?',
            [email]
        );

        if (pendingUsers.length === 0) {
            console.log('❌ No pending user found');
            return;
        }

        const pendingUser = pendingUsers[0];
        console.log('✅ Found pending user:', pendingUser.username);

        // Insert into users table
        await pool.execute(`
            INSERT INTO users (username, email, password_hash, full_name, email_verified, is_active)
            VALUES (?, ?, ?, ?, TRUE, TRUE)
        `, [
            pendingUser.username,
            pendingUser.email,
            pendingUser.password_hash,
            pendingUser.full_name
        ]);

        console.log('✅ User moved to users table');

        // Clean up pending registration
        await pool.execute(
            'DELETE FROM pending_registrations WHERE email = ?',
            [email]
        );

        console.log('✅ Pending registration cleaned up');
        console.log('🎉 Test user is now active and verified!');
        console.log('📧 Email:', email);
        console.log('🔑 Password: password123');

    } catch (error) {
        console.error('❌ Error:', error.message);

        // If user already exists in users table, just mark as verified
        if (error.message.includes('Duplicate entry')) {
            console.log('👤 User already exists, marking as verified...');

            await pool.execute(
                'UPDATE users SET email_verified = TRUE, is_active = TRUE WHERE email = ?',
                [email]
            );

            console.log('✅ User marked as verified!');
        }
    } finally {
        await pool.end();
    }
};

activateTestUser();
