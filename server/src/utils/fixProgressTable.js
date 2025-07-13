import { pool } from '../config/database.js';

/**
 * Kiểm tra và sửa chữa bảng daily_progress nếu cần
 */
const fixProgressTable = async () => {
    try {
        console.log('Checking daily_progress table structure...');

        // 1. Kiểm tra xem có cột progress_data không và loại của nó
        const [columns] = await pool.execute(`
            SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'daily_progress'
            AND COLUMN_NAME = 'progress_data'
        `);

        if (columns.length === 0) {
            console.log('progress_data column not found, updating table structure...');
            
            // Thêm các cột mới
            await pool.execute(`
                ALTER TABLE daily_progress
                ADD COLUMN tool_type VARCHAR(50) DEFAULT 'dashboard' AFTER date,
                ADD COLUMN progress_data JSON AFTER notes,
                ADD COLUMN days_clean INT DEFAULT 0 AFTER progress_data,
                ADD COLUMN money_saved DECIMAL(10,2) DEFAULT 0.00 AFTER days_clean,
                ADD COLUMN cigarettes_avoided INT DEFAULT 0 AFTER money_saved,
                ADD COLUMN vapes_avoided INT DEFAULT 0 AFTER cigarettes_avoided,
                ADD COLUMN health_score INT DEFAULT 0 AFTER vapes_avoided,
                ADD COLUMN progress_percentage INT DEFAULT 0 AFTER health_score
            `);
            
            console.log('✅ Table structure updated successfully');
        } else {
            console.log('Column progress_data exists with type:', columns[0].DATA_TYPE);
            
            // Nếu cột tồn tại nhưng không phải là JSON, thay đổi kiểu dữ liệu
            if (columns[0].DATA_TYPE !== 'json') {
                console.log('Converting progress_data column to JSON type...');
                
                // Backup dữ liệu hiện tại
                const [rows] = await pool.execute('SELECT id, progress_data FROM daily_progress');
                
                // Chuyển đổi kiểu dữ liệu
                await pool.execute(`
                    ALTER TABLE daily_progress
                    MODIFY COLUMN progress_data JSON
                `);
                
                // Cập nhật lại dữ liệu nếu cần
                for (const row of rows) {
                    if (row.progress_data) {
                        try {
                            // Đảm bảo dữ liệu là JSON hợp lệ
                            const jsonData = typeof row.progress_data === 'string' 
                                ? JSON.parse(row.progress_data) 
                                : row.progress_data;
                                
                            await pool.execute(
                                'UPDATE daily_progress SET progress_data = ? WHERE id = ?',
                                [JSON.stringify(jsonData), row.id]
                            );
                        } catch (e) {
                            console.error(`Cannot parse progress_data for id ${row.id}:`, e);
                            // Set empty object nếu không parse được
                            await pool.execute(
                                'UPDATE daily_progress SET progress_data = ? WHERE id = ?',
                                ['{}', row.id]
                            );
                        }
                    }
                }
                
                console.log('✅ Column progress_data converted to JSON type');
            }
        }

        // 2. Kiểm tra và sửa các giá trị NULL
        console.log('Fixing NULL values in integer and numeric columns...');
        
        await pool.execute(`
            UPDATE daily_progress
            SET days_clean = 0 WHERE days_clean IS NULL
        `);
        
        await pool.execute(`
            UPDATE daily_progress
            SET money_saved = 0 WHERE money_saved IS NULL
        `);
        
        await pool.execute(`
            UPDATE daily_progress
            SET cigarettes_avoided = 0 WHERE cigarettes_avoided IS NULL
        `);
        
        await pool.execute(`
            UPDATE daily_progress
            SET vapes_avoided = 0 WHERE vapes_avoided IS NULL
        `);
        
        await pool.execute(`
            UPDATE daily_progress
            SET health_score = 0 WHERE health_score IS NULL
        `);
        
        await pool.execute(`
            UPDATE daily_progress
            SET progress_percentage = 0 WHERE progress_percentage IS NULL
        `);
        
        await pool.execute(`
            UPDATE daily_progress
            SET target_cigarettes = 0 WHERE target_cigarettes IS NULL
        `);
        
        await pool.execute(`
            UPDATE daily_progress
            SET actual_cigarettes = 0 WHERE actual_cigarettes IS NULL
        `);
        
        await pool.execute(`
            UPDATE daily_progress
            SET progress_data = '{}' WHERE progress_data IS NULL
        `);
        
        console.log('✅ Fixed NULL values in daily_progress table');
        
        // 3. Kiểm tra và sửa giá trị JSON không hợp lệ
        console.log('Checking for invalid JSON in progress_data...');
        
        const [invalidRows] = await pool.execute(`
            SELECT id, progress_data 
            FROM daily_progress 
            WHERE JSON_VALID(progress_data) = 0 OR progress_data IS NULL
        `);
        
        if (invalidRows.length > 0) {
            console.log(`Found ${invalidRows.length} rows with invalid JSON, fixing...`);
            
            for (const row of invalidRows) {
                await pool.execute(
                    'UPDATE daily_progress SET progress_data = ? WHERE id = ?',
                    ['{}', row.id]
                );
            }
            
            console.log('✅ Fixed invalid JSON values');
        } else {
            console.log('No invalid JSON found in progress_data');
        }
        
        console.log('✅ Database daily_progress table check and fix completed!');
        return true;
    } catch (error) {
        console.error('❌ Error fixing progress table:', error);
        throw error;
    }
};

export default fixProgressTable;
