-- Add duration_minutes column to appointments table
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns 
                  WHERE table_schema = DATABASE() 
                  AND table_name = 'appointments' 
                  AND column_name = 'duration_minutes');
                  
SET @add_column = IF(@col_exists = 0, 
                   'ALTER TABLE appointments ADD COLUMN duration_minutes INT NOT NULL DEFAULT 30 COMMENT "Duration in minutes" AFTER time', 
                   'SELECT "Column already exists"');
                   
PREPARE stmt FROM @add_column;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
