// Check existing users in database
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: 'trolley.proxy.rlwy.net',
    port: 38398,
    user: 'root',
    password: 'daNPMJDaJCvQgPjNtGOxgQtAhzREHmRY',
    database: 'railway',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function checkUsers() {
    try {
        console.log('🔍 Checking existing users in database...\n');
        
        const [users] = await pool.execute('SELECT id, username, email, role, is_active FROM users LIMIT 10');
        
        console.log('📋 Found users:');
        users.forEach((user, index) => {
            console.log(`${index + 1}. ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Role: ${user.role}, Active: ${user.is_active}`);
        });
        
        if (users.length > 0) {
            console.log(`\n✅ Total users found: ${users.length}`);
            console.log('💡 You can test with any of these users (password likely: password123)');
        } else {
            console.log('\n❌ No users found in database');
        }
        
    } catch (error) {
        console.error('❌ Database error:', error.message);
    } finally {
        await pool.end();
    }
}

checkUsers();
