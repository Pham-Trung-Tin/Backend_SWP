import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

console.log('🔗 Connecting to database:', {
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    user: dbConfig.user
});

async function checkDatabase() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        console.log('✅ Database connected successfully!');
        
        // Show all tables
        console.log('\n📋 All tables:');
        const [tables] = await connection.execute('SHOW TABLES');
        tables.forEach(table => {
            console.log(`  - ${Object.values(table)[0]}`);
        });
        
        // Check daily_progress table structure
        console.log('\n🔍 daily_progress table structure:');
        try {
            const [columns] = await connection.execute('DESCRIBE daily_progress');
            columns.forEach(col => {
                console.log(`  - ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'nullable' : 'not null'})`);
            });
        } catch (err) {
            console.log('❌ daily_progress table does not exist');
        }
        
        // Check data in daily_progress for specific user and date
        console.log('\n📊 Data in daily_progress for user 13 and recent dates:');
        try {
            const [rows] = await connection.execute(
                'SELECT * FROM daily_progress WHERE smoker_id = ? ORDER BY date DESC LIMIT 10',
                ['13']
            );
            if (rows.length === 0) {
                console.log('  ❌ No data found for user 13');
            } else {
                console.log(`  ✅ Found ${rows.length} records for user 13:`);
                rows.forEach(row => {
                    console.log(`    - ID: ${row.id}, Date: ${row.date}, Target: ${row.target_cigarettes}, Actual: ${row.actual_cigarettes}, Tool: ${row.tool_type}`);
                });
            }
        } catch (err) {
            console.log('❌ Error reading daily_progress for user 13:', err.message);
        }

        // Check data for today's date
        console.log('\n📅 Data for today (2025-07-11):');
        try {
            const [todayRows] = await connection.execute(
                'SELECT * FROM daily_progress WHERE date = ? ORDER BY smoker_id',
                ['2025-07-11']
            );
            if (todayRows.length === 0) {
                console.log('  ❌ No data found for 2025-07-11');
            } else {
                console.log(`  ✅ Found ${todayRows.length} records for 2025-07-11:`);
                todayRows.forEach(row => {
                    console.log(`    - User: ${row.smoker_id}, Target: ${row.target_cigarettes}, Actual: ${row.actual_cigarettes}, Tool: ${row.tool_type}`);
                });
            }
        } catch (err) {
            console.log('❌ Error reading data for 2025-07-11:', err.message);
        }

        // Check data in daily_progress
        console.log('\n📊 All Data in daily_progress:');
        try {
            const [rows] = await connection.execute('SELECT * FROM daily_progress ORDER BY date DESC LIMIT 10');
            if (rows.length === 0) {
                console.log('  ❌ No data found in daily_progress table');
            } else {
                console.log(`  ✅ Found ${rows.length} records:`);
                rows.forEach(row => {
                    console.log(`    - ID: ${row.id}, User: ${row.smoker_id}, Date: ${row.date}, Target: ${row.target_cigarettes}, Actual: ${row.actual_cigarettes}`);
                });
            }
        } catch (err) {
            console.log('❌ Error reading daily_progress:', err.message);
        }
        
        // Check users table
        console.log('\n👥 Users in database:');
        try {
            const [users] = await connection.execute('SELECT id, username, email FROM users LIMIT 5');
            users.forEach(user => {
                console.log(`  - ID: ${user.id}, Username: ${user.username}, Email: ${user.email}`);
            });
        } catch (err) {
            console.log('❌ Error reading users:', err.message);
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
    }
}

checkDatabase();
