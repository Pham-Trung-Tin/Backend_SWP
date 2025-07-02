-- NoSmoke Database Schema

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS nosmoke;
USE nosmoke;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  membership_type ENUM('free', 'premium', 'pro') DEFAULT 'free',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Memberships table
CREATE TABLE IF NOT EXISTS memberships (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('free', 'premium', 'pro') UNIQUE NOT NULL,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  features JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Membership subscriptions table
CREATE TABLE IF NOT EXISTS membership_subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  membership_type ENUM('free', 'premium', 'pro') NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  payment_id VARCHAR(100),
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sample data for memberships
INSERT INTO memberships (type, name, description, price, features) VALUES
('free', 'Free', 'Basic features to help you quit smoking', 0.00, '{"tracking": true, "basicStats": true, "articles": true}'),
('premium', 'Premium', 'Enhanced features with personalized insights', 9.99, '{"tracking": true, "basicStats": true, "articles": true, "advancedStats": true, "communityAccess": true, "personalizedPlan": true}'),
('pro', 'Professional', 'Complete access with professional coaching', 19.99, '{"tracking": true, "basicStats": true, "articles": true, "advancedStats": true, "communityAccess": true, "personalizedPlan": true, "proCoaching": true, "prioritySupport": true}');
