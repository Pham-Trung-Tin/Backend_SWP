import { pool } from './src/config/database.js';

async function fixDatabaseConstraints() {
    try {
        console.log('🔧 Fixing database constraints...');
        
        // 1. Add UNIQUE constraint for (smoker_id, date) to prevent duplicates
        console.log('📋 Adding UNIQUE constraint for (smoker_id, date)...');
        try {
            await pool.execute(`
                ALTER TABLE daily_progress 
                ADD CONSTRAINT unique_user_date 
                UNIQUE (smoker_id, date)
            `);
            console.log('✅ UNIQUE constraint added successfully');
        } catch (error) {
            if (error.code === 'ER_DUP_KEYNAME') {
                console.log('ℹ️ UNIQUE constraint already exists');
            } else {
                console.error('❌ Error adding UNIQUE constraint:', error.message);
            }
        }
        
        // 2. Update any existing records with health_score = 0 to health_score = 1
        console.log('📋 Fixing existing health_score values...');
        const [updateResult] = await pool.execute(`
            UPDATE daily_progress 
            SET health_score = 1 
            WHERE health_score = 0 OR health_score IS NULL
        `);
        console.log(`✅ Updated ${updateResult.affectedRows} records with invalid health_score`);
        
        // 3. Check for duplicate records and show them
        console.log('📋 Checking for duplicate records...');
        const [duplicates] = await pool.execute(`
            SELECT smoker_id, date, COUNT(*) as count 
            FROM daily_progress 
            GROUP BY smoker_id, date 
            HAVING COUNT(*) > 1
        `);
        
        if (duplicates.length > 0) {
            console.log('⚠️ Found duplicate records:', duplicates);
            console.log('Manual cleanup may be needed before adding UNIQUE constraint');
        } else {
            console.log('✅ No duplicate records found');
        }
        
        // 4. Show current table structure
        console.log('📋 Current table constraints:');
        const [constraints] = await pool.execute(`
            SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE 
            FROM information_schema.TABLE_CONSTRAINTS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'daily_progress'
        `);
        console.log('Table constraints:', constraints);
        
        console.log('🎉 Database constraints fix completed!');
        
    } catch (error) {
        console.error('❌ Error fixing database constraints:', error);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

fixDatabaseConstraints();
