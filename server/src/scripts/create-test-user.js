/**
 * Script to create a test user for API testing
 */

import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const createTestUser = async () => {
  try {
    console.log('🚀 Creating test user for API testing...');
    
    // Check if test user already exists
    const [existingUsers] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      ['testuser@example.com']
    );
    
    if (existingUsers.length > 0) {
      console.log('✅ Test user already exists with ID:', existingUsers[0].id);
      
      // Generate token for existing user
      const token = jwt.sign(
        { id: existingUsers[0].id, email: existingUsers[0].email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );
      
      console.log('✅ Generated token for existing user:');
      console.log(token);
      
      return;
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('testpassword', salt);
    
    // Insert test user
    const [result] = await pool.execute(
      `INSERT INTO users (name, email, password, role, status)
       VALUES (?, ?, ?, ?, ?)`,
      ['Test User', 'testuser@example.com', hashedPassword, 'user', 'active']
    );
    
    console.log('✅ Test user created successfully with ID:', result.insertId);
    
    // Generate token for new user
    const token = jwt.sign(
      { id: result.insertId, email: 'testuser@example.com' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );
    
    console.log('✅ Generated token:');
    console.log(token);
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  }
};

// Run the function
createTestUser();
