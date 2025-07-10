import { pool } from './src/config/database.js';

/**
 * Executes the SQL script to fix appointment tables
 */
async function fixAppointmentTables() {
    try {
        console.log('Running appointment tables fix script...');
        
        // Check if 'appointment' table exists (old name)
        const [oldTableCheck] = await pool.query(`
            SELECT COUNT(*) as count 
            FROM information_schema.tables 
            WHERE table_schema = DATABASE() 
            AND table_name = 'appointment'
        `);
        
        // Check if 'appointments' table exists
        const [tableCheck] = await pool.query(`
            SELECT COUNT(*) as count 
            FROM information_schema.tables 
            WHERE table_schema = DATABASE() 
            AND table_name = 'appointments'
        `);
        
        // Handle table rename or creation based on what exists
        if (oldTableCheck[0].count > 0 && tableCheck[0].count === 0) {
            // Only old table exists, rename it
            console.log('Found old table name "appointment", renaming to "appointments"...');
            await pool.query('RENAME TABLE appointment TO appointments');
            console.log('✅ Table renamed successfully');
        } else if (oldTableCheck[0].count > 0 && tableCheck[0].count > 0) {
            // Both tables exist, try to drop the old one
            try {
                console.log('Both "appointment" and "appointments" tables exist, dropping old table...');
                await pool.query('DROP TABLE appointment');
                console.log('✅ Old table dropped successfully');
            } catch (error) {
                console.log('⚠️ Could not drop old table:', error.message);
            }
        } else if (tableCheck[0].count === 0) {
            // Neither table exists, create new one
            console.log('Creating appointments table...');
            await pool.query(`
                CREATE TABLE appointments (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    coach_id INT NOT NULL COMMENT "ID của user với role coach",
                    user_id INT NOT NULL COMMENT "ID của người dùng đặt lịch",
                    date DATE NOT NULL,
                    time VARCHAR(10) NOT NULL COMMENT "Format: HH:MM",
                    duration_minutes INT NOT NULL DEFAULT 30 COMMENT "Duration in minutes",
                    status ENUM("pending", "confirmed", "completed", "cancelled") DEFAULT "pending",
                    notes TEXT,
                    rating INT DEFAULT NULL CHECK (rating BETWEEN 1 AND 5 OR rating IS NULL),
                    review_text TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (coach_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            `);
            console.log('✅ Appointments table created successfully');
        } else {
            console.log('✅ Appointments table already exists');
        }
        
        // Check if appointments has appointment_time column
        const [hasAppointmentTime] = await pool.query(`
            SELECT COUNT(*) as count 
            FROM information_schema.columns 
            WHERE table_schema = DATABASE() 
            AND table_name = 'appointments' 
            AND column_name = 'appointment_time'
        `);
        
        // Check if it has date and time columns
        const [hasDateColumn] = await pool.query(`
            SELECT COUNT(*) as count 
            FROM information_schema.columns 
            WHERE table_schema = DATABASE() 
            AND table_name = 'appointments' 
            AND column_name = 'date'
        `);
        
        const [hasTimeColumn] = await pool.query(`
            SELECT COUNT(*) as count 
            FROM information_schema.columns 
            WHERE table_schema = DATABASE() 
            AND table_name = 'appointments' 
            AND column_name = 'time'
        `);
        
        // Add date column if needed
        if (hasDateColumn[0].count === 0) {
            console.log('Adding date column...');
            await pool.query('ALTER TABLE appointments ADD COLUMN date DATE');
            console.log('✅ Date column added successfully');
        }
        
        // Add time column if needed
        if (hasTimeColumn[0].count === 0) {
            console.log('Adding time column...');
            await pool.query('ALTER TABLE appointments ADD COLUMN time VARCHAR(10)');
            console.log('✅ Time column added successfully');
        }
        
        // Migrate data from appointment_time to date/time
        if (hasAppointmentTime[0].count > 0 && hasDateColumn[0].count > 0 && hasTimeColumn[0].count > 0) {
            console.log('Migrating data from appointment_time to date/time...');
            await pool.query(`
                UPDATE appointments 
                SET date = DATE(appointment_time),
                    time = TIME_FORMAT(TIME(appointment_time), "%H:%i:%s")
                WHERE date IS NULL OR time IS NULL
            `);
            console.log('✅ Data migrated successfully');
            
            // Drop appointment_time column
            console.log('Dropping appointment_time column...');
            await pool.query('ALTER TABLE appointments DROP COLUMN appointment_time');
            console.log('✅ appointment_time column dropped successfully');
        }
        
        // Check if duration_minutes column exists
        const [hasDurationMinutes] = await pool.query(`
            SELECT COUNT(*) as count 
            FROM information_schema.columns 
            WHERE table_schema = DATABASE() 
            AND table_name = 'appointments' 
            AND column_name = 'duration_minutes'
        `);
        
        // Add duration_minutes column if needed
        if (hasDurationMinutes[0].count === 0) {
            console.log('Adding duration_minutes column...');
            await pool.query(`
                ALTER TABLE appointments 
                ADD COLUMN duration_minutes INT NOT NULL DEFAULT 30 
                COMMENT 'Duration in minutes' AFTER time
            `);
            console.log('✅ duration_minutes column added successfully');
        }
        
        // Try to create indexes for better performance
        console.log('Creating indexes...');
        try {
            await pool.query('CREATE INDEX idx_appointments_coach_id ON appointments(coach_id)');
            console.log('✅ Created coach_id index');
        } catch (error) {
            console.log('⚠️ coach_id index already exists or could not be created');
        }
        
        try {
            await pool.query('CREATE INDEX idx_appointments_user_id ON appointments(user_id)');
            console.log('✅ Created user_id index');
        } catch (error) {
            console.log('⚠️ user_id index already exists or could not be created');
        }
        
        try {
            await pool.query('CREATE INDEX idx_appointments_date ON appointments(date)');
            console.log('✅ Created date index');
        } catch (error) {
            console.log('⚠️ date index already exists or could not be created');
        }
        
        try {
            await pool.query('CREATE INDEX idx_appointments_time ON appointments(time)');
            console.log('✅ Created time index');
        } catch (error) {
            console.log('⚠️ time index already exists or could not be created');
        }
        
        try {
            await pool.query('CREATE INDEX idx_appointments_status ON appointments(status)');
            console.log('✅ Created status index');
        } catch (error) {
            console.log('⚠️ status index already exists or could not be created');
        }
        
        // Check the appointments table structure
        const [columns] = await pool.query('SHOW COLUMNS FROM appointments');
        console.log('Current appointments table structure:');
        columns.forEach(col => {
            console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
        });
        
        // Check for sample data
        const [count] = await pool.query('SELECT COUNT(*) as count FROM appointments');
        console.log(`Number of appointments in the database: ${count[0].count}`);
        
        console.log('All table fixes completed successfully! 🎉');
    } catch (error) {
        console.error('❌ Error fixing appointment tables:', error);
    } finally {
        try {
            // Close the database connection
            await pool.end();
            console.log('Database connection closed');
        } catch (error) {
            console.error('Error closing database connection:', error);
        }
    }
}

// Execute the function
fixAppointmentTables();

fixAppointmentTables();
