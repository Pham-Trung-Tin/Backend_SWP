/**
 * SQL script to create appointment-related tables
 */

-- Create coach_availability table if it doesn't exist
CREATE TABLE IF NOT EXISTS coach_availability (
  id INT AUTO_INCREMENT PRIMARY KEY,
  coach_id INT NOT NULL,
  day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  FOREIGN KEY (coach_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create appointment table if it doesn't exist
CREATE TABLE IF NOT EXISTS appointment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  coach_id INT NOT NULL,
  user_id INT NOT NULL,
  appointment_time DATETIME NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 30,
  status ENUM('pending', 'confirmed', 'cancelled', 'completed') NOT NULL DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (coach_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create feedback table if it doesn't exist
CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  coach_id INT NOT NULL,
  smoker_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_feedback (coach_id, smoker_id),
  FOREIGN KEY (coach_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (smoker_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add indexes for improved query performance
CREATE INDEX IF NOT EXISTS idx_appointment_coach_id ON appointment(coach_id);
CREATE INDEX IF NOT EXISTS idx_appointment_user_id ON appointment(user_id);
CREATE INDEX IF NOT EXISTS idx_appointment_status ON appointment(status);
CREATE INDEX IF NOT EXISTS idx_appointment_time ON appointment(appointment_time);
CREATE INDEX IF NOT EXISTS idx_coach_availability ON coach_availability(coach_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_feedback_coach ON feedback(coach_id);
