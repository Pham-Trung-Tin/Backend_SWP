/**
 * Migration script to fix table and column names in the appointment tables
 */

-- Check if the 'appointment' table exists and rename it to 'appointments' if it does
SET @table_exists = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'appointment');
SET @query = IF(@table_exists > 0, 'RENAME TABLE appointment TO appointments', 'SELECT 1');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if 'appointments' table exists
SET @appointments_exists = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'appointments');

-- Create the appointments table if it doesn't exist
SET @create_appointments = IF(@appointments_exists = 0, 
    'CREATE TABLE appointments (
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
    )',
    'SELECT 1'
);
PREPARE stmt FROM @create_appointments;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if appointments has appointment_time column and needs migration to date/time
SET @has_appointment_time = (
    SELECT COUNT(*) FROM information_schema.columns 
    WHERE table_schema = DATABASE() 
    AND table_name = 'appointments' 
    AND column_name = 'appointment_time'
);

-- Check if it's missing the date column
SET @needs_date_column = (
    SELECT COUNT(*) FROM information_schema.columns 
    WHERE table_schema = DATABASE() 
    AND table_name = 'appointments' 
    AND column_name = 'date'
) = 0;

-- Check if it's missing the time column
SET @needs_time_column = (
    SELECT COUNT(*) FROM information_schema.columns 
    WHERE table_schema = DATABASE() 
    AND table_name = 'appointments' 
    AND column_name = 'time'
) = 0;

-- Add date column if needed
SET @add_date_column = IF(@needs_date_column, 
    'ALTER TABLE appointments ADD COLUMN date DATE', 
    'SELECT 1'
);
PREPARE stmt FROM @add_date_column;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add time column if needed
SET @add_time_column = IF(@needs_time_column, 
    'ALTER TABLE appointments ADD COLUMN time VARCHAR(10)', 
    'SELECT 1'
);
PREPARE stmt FROM @add_time_column;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Migrate data from appointment_time to date/time if needed
SET @migrate_data = IF(@has_appointment_time > 0 AND @needs_date_column = 0 AND @needs_time_column = 0,
    'UPDATE appointments 
     SET date = DATE(appointment_time),
         time = TIME_FORMAT(TIME(appointment_time), "%H:%i:%s")
     WHERE date IS NULL OR time IS NULL',
    'SELECT 1'
);
PREPARE stmt FROM @migrate_data;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop the appointment_time column if it exists and migration is complete
SET @drop_appointment_time = IF(@has_appointment_time > 0 AND @needs_date_column = 0 AND @needs_time_column = 0,
    'ALTER TABLE appointments DROP COLUMN appointment_time',
    'SELECT 1'
);
PREPARE stmt FROM @drop_appointment_time;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Make sure we have all required columns
SET @needs_duration_minutes = (
    SELECT COUNT(*) FROM information_schema.columns 
    WHERE table_schema = DATABASE() 
    AND table_name = 'appointments' 
    AND column_name = 'duration_minutes'
) = 0;

-- Add duration_minutes column if needed
SET @add_duration_minutes = IF(@needs_duration_minutes, 
    'ALTER TABLE appointments ADD COLUMN duration_minutes INT NOT NULL DEFAULT 30', 
    'SELECT 1'
);
PREPARE stmt FROM @add_duration_minutes;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_coach_id ON appointments(coach_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_time ON appointments(time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
