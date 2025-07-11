import { pool } from '../config/database.js';

/**
 * Migrate existing daily_progress table to new structure by:
 * 1. Removing mood tracking fields
 * 2. Adding new fields for progress tracking
 */
const migrateProgressTable = async () => {
    let connection;
    try {
        console.log('⏳ Starting migration of daily_progress table...');
        
        // Check if table exists
        const [tables] = await pool.execute(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = DATABASE() 
            AND table_name = 'daily_progress'
        `);
        
        if (tables.length === 0) {
            console.log('✅ daily_progress table does not exist, no migration needed');
            return;
        }

        // Check if columns exist before trying to drop them
        const [columnsResult] = await pool.execute(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = DATABASE() 
            AND table_name = 'daily_progress'
        `);
        
        console.log('Debug columns structure:', JSON.stringify(columnsResult, null, 2));
        
        // Kiểm tra xem columns có phải là một mảng và có ít nhất một phần tử không
        if (!Array.isArray(columnsResult) || columnsResult.length === 0) {
            console.log('⚠️ No columns found in daily_progress table');
            return;
        }
        
        // Kiểm tra cấu trúc của phần tử đầu tiên để xác định tên thuộc tính đúng
        const firstColumn = columnsResult[0];
        console.log('First column object:', firstColumn);
        
        // Xác định tên thuộc tính chứa tên cột (có thể là column_name hoặc COLUMN_NAME)
        let columnNameProperty;
        if (firstColumn.column_name !== undefined) {
            columnNameProperty = 'column_name';
        } else if (firstColumn.COLUMN_NAME !== undefined) {
            columnNameProperty = 'COLUMN_NAME';
        } else {
            // Nếu không tìm thấy tên cột thông thường, kiểm tra tất cả các key có sẵn
            const keys = Object.keys(firstColumn);
            const possibleNameKeys = keys.filter(key => key.toLowerCase().includes('column') && key.toLowerCase().includes('name'));
            
            if (possibleNameKeys.length > 0) {
                columnNameProperty = possibleNameKeys[0];
            } else {
                console.error('⚠️ Cannot determine column name property in result set');
                console.log('Available properties:', keys);
                return;
            }
        }
        
        console.log(`Using property '${columnNameProperty}' to get column names`);
        
        // Lọc ra các cột không null và chuyển đổi tên thành chữ thường
        const columnNames = columnsResult
            .filter(col => col && col[columnNameProperty])
            .map(col => col[columnNameProperty].toLowerCase());
        
        console.log('Found columns:', columnNames);
        
        // Start transaction
        connection = await pool.getConnection();
        await connection.beginTransaction();
        
        // Drop mood-related columns if they exist
        if (columnNames.includes('mood_rating')) {
            console.log('🗑️ Dropping mood_rating column...');
            await connection.execute('ALTER TABLE daily_progress DROP COLUMN mood_rating');
        }
        
        if (columnNames.includes('energy_level')) {
            console.log('🗑️ Dropping energy_level column...');
            await connection.execute('ALTER TABLE daily_progress DROP COLUMN energy_level');
        }
        
        if (columnNames.includes('stress_level')) {
            console.log('🗑️ Dropping stress_level column...');
            await connection.execute('ALTER TABLE daily_progress DROP COLUMN stress_level');
        }
        
        if (columnNames.includes('mood_notes')) {
            console.log('🗑️ Dropping mood_notes column...');
            await connection.execute('ALTER TABLE daily_progress DROP COLUMN mood_notes');
        }
        
        // Add new columns if they don't exist
        if (!columnNames.includes('health_score')) {
            console.log('➕ Adding health_score column...');
            await connection.execute('ALTER TABLE daily_progress ADD COLUMN health_score INT DEFAULT 0');
        }
        
        if (!columnNames.includes('days_clean')) {
            console.log('➕ Adding days_clean column...');
            await connection.execute('ALTER TABLE daily_progress ADD COLUMN days_clean INT DEFAULT 0');
        }
        
        if (!columnNames.includes('cigarettes_avoided')) {
            console.log('➕ Adding cigarettes_avoided column...');
            await connection.execute('ALTER TABLE daily_progress ADD COLUMN cigarettes_avoided INT DEFAULT 0');
            
            // Calculate and populate cigarettes_avoided based on existing data
            await connection.execute(`
                UPDATE daily_progress 
                SET cigarettes_avoided = GREATEST(0, target_cigarettes - actual_cigarettes)
                WHERE target_cigarettes IS NOT NULL AND actual_cigarettes IS NOT NULL
            `);
        }
        
        if (!columnNames.includes('money_saved')) {
            console.log('➕ Adding money_saved column...');
            await connection.execute('ALTER TABLE daily_progress ADD COLUMN money_saved DECIMAL(10,2) DEFAULT 0');
        }
        
        if (!columnNames.includes('progress_percentage')) {
            console.log('➕ Adding progress_percentage column...');
            await connection.execute('ALTER TABLE daily_progress ADD COLUMN progress_percentage INT DEFAULT 0');
        }
        
        if (!columnNames.includes('streak_days')) {
            console.log('➕ Adding streak_days column...');
            await connection.execute('ALTER TABLE daily_progress ADD COLUMN streak_days INT DEFAULT 0');
            
            // Calculate streak days for each record
            const [records] = await connection.execute(`
                SELECT id, smoker_id, date, actual_cigarettes
                FROM daily_progress
                ORDER BY smoker_id, date
            `);
            
            const userStreaks = {};
            
            for (const record of records) {
                const userId = record.smoker_id;
                const noSmoke = record.actual_cigarettes === 0;
                
                if (!userStreaks[userId]) {
                    userStreaks[userId] = 0;
                }
                
                if (noSmoke) {
                    userStreaks[userId]++;
                } else {
                    userStreaks[userId] = 0;
                }
                
                // Update the streak for this record
                await connection.execute(`
                    UPDATE daily_progress
                    SET streak_days = ?
                    WHERE id = ?
                `, [userStreaks[userId], record.id]);
            }
        }
        
        // Commit transaction
        await connection.commit();
        console.log('✅ Migration of daily_progress table completed successfully');
        
    } catch (error) {
        // Rollback on error
        if (connection) {
            await connection.rollback();
        }
        console.error('❌ Error migrating daily_progress table:', error);
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

export default migrateProgressTable;
