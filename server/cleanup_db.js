import { pool } from './src/config/database.js';

async function cleanup() {
    try {
        // Xóa duplicate records
        await pool.execute(`DELETE FROM daily_progress WHERE id IN (
            SELECT id FROM (
                SELECT id, ROW_NUMBER() OVER (PARTITION BY smoker_id, date ORDER BY id) as rn 
                FROM daily_progress
            ) t WHERE rn > 1
        )`);
        
        console.log('✅ Deleted duplicate records');
        
        // Thêm UNIQUE constraint
        await pool.execute(`
            ALTER TABLE daily_progress 
            ADD CONSTRAINT unique_user_date 
            UNIQUE (smoker_id, date)
        `);
        
        console.log('✅ Added UNIQUE constraint');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

cleanup();
