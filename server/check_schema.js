import { pool } from './src/config/database.js';

async function checkSchema() {
    try {
        const [columns] = await pool.execute('DESCRIBE daily_progress');
        console.log('Daily progress table structure:');
        columns.forEach(col => {
            console.log(`- ${col.Field}: ${col.Type} ${col.Null} ${col.Key} ${col.Default}`);
        });
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkSchema();
