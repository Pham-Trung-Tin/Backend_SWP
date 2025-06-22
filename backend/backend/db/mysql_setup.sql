-- Tạo database quit_smoking_app
CREATE DATABASE IF NOT EXISTS quit_smoking_app;

-- Sử dụng database này
USE quit_smoking_app;

-- Tạo bảng users (người dùng)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  cigarettes_per_day INT NOT NULL,
  cost_per_pack FLOAT NOT NULL,
  cigarettes_per_pack INT NOT NULL DEFAULT 20,
  start_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  days_without_smoking INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  membership JSON DEFAULT NULL,
  quit_plan JSON DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);

-- Tạo bảng daily_checkins (check-in hàng ngày)
CREATE TABLE IF NOT EXISTS daily_checkins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  date DATE NOT NULL,
  smoking_status ENUM('smoke-free', 'reduced', 'relapsed') NOT NULL,
  cigarettes_smoked INT DEFAULT 0,
  mood ENUM('great', 'good', 'neutral', 'bad', 'awful') NOT NULL,
  craving_level INT NOT NULL,
  withdrawal_symptoms JSON DEFAULT NULL,
  alternative_activities JSON DEFAULT NULL,
  notes TEXT,
  self_rating INT,
  tomorrow_goal VARCHAR(255),
  stress_level INT,
  stress_factors JSON DEFAULT NULL,
  achievements JSON DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY idx_user_date (user_id, date)
);

-- Tạo bảng appointments (lịch hẹn)
CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  coach_id VARCHAR(50),
  coach_name VARCHAR(100) NOT NULL,
  date DATETIME NOT NULL,
  appointment_type ENUM('consultation', 'follow_up', 'emergency') NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no_show') DEFAULT 'pending',
  notes TEXT,
  meeting_link VARCHAR(255),
  duration INT DEFAULT 30,
  feedback JSON DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_date (date),
  INDEX idx_status (status)
);

-- Tạo bảng coaches (huấn luyện viên)
CREATE TABLE IF NOT EXISTS coaches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  specialization VARCHAR(100),
  bio TEXT,
  profile_image VARCHAR(255),
  availability JSON DEFAULT NULL,
  rating FLOAT DEFAULT 0,
  review_count INT DEFAULT 0,
  status ENUM('active', 'inactive', 'on_leave') DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tạo bảng membership_plans (các gói thành viên)
CREATE TABLE IF NOT EXISTS membership_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL,
  price FLOAT NOT NULL,
  duration INT NOT NULL COMMENT 'Duration in days',
  description TEXT,
  features JSON NOT NULL,
  is_recommended BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY idx_type (type)
);

-- Thêm dữ liệu mẫu cho membership_plans
INSERT INTO membership_plans (name, type, price, duration, description, features, is_recommended)
VALUES 
('Free', 'free', 0, 0, 'Basic access to quit smoking tools', JSON_ARRAY('Basic progress tracking', 'Daily check-ins', 'Community support', 'Educational articles'), FALSE),
('Premium', 'premium', 9.99, 30, 'Enhanced support for your quit journey', JSON_ARRAY('All free features', 'Advanced progress analytics', 'Personalized quit plan', 'Group coaching sessions', 'Priority email support'), TRUE),
('Professional', 'pro', 19.99, 30, 'Maximum support with personalized coaching', JSON_ARRAY('All premium features', 'One-on-one coaching sessions', '24/7 priority support', 'Custom meal and exercise plans', 'Advanced health tracking'), FALSE);
