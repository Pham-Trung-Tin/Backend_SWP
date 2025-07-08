// Check actual database table structure
import { pool } from './src/config/database.js';

const checkTableStructure = async () => {
    try {
        console.log('🔍 Checking user_smoking_status table structure...\n');

        // Show table structure
        const [structure] = await pool.execute('DESCRIBE user_smoking_status');

        console.log('📋 Table Columns:');
        structure.forEach((col, index) => {
            console.log(`${index + 1}. ${col.Field} (${col.Type}) - ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}${col.Key ? ` [${col.Key}]` : ''}${col.Default !== null ? ` Default: ${col.Default}` : ''}`);
        });

        // Show existing data
        console.log('\n📊 Existing Data:');
        const [data] = await pool.execute('SELECT * FROM user_smoking_status LIMIT 5');
        console.log('Rows:', data.length);
        if (data.length > 0) {
            console.log('Sample data:', data[0]);
        }

    } catch (error) {
        console.error('❌ Error checking table:', error.message);
    } finally {
        process.exit(0);
    }
};

checkTableStructure();
