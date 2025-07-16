/**
 * Script để tạo coach account mới hoặc reset password
 */

import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'trolley.proxy.rlwy.net',
  port: 45213,
  user: 'root',
  password: 'lGDZJCNBNWLXJwflgTOIBaNhiDWEcAmz',
  database: 'railway'
};

async function createOrUpdateCoach() {
  let connection;
  
  try {
    console.log('🔗 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    const coachData = {
      username: 'TestCoach',
      password: 'password123',
      email: 'testcoach@example.com',
      full_name: 'Test Coach',
      phone: '0123456789',
      role: 'coach'
    };
    
    // Hash password
    const hashedPassword = await bcrypt.hash(coachData.password, 12);
    
    // Check if coach already exists
    const [existing] = await connection.execute(
      'SELECT id, username, role FROM users WHERE username = ? OR email = ?',
      [coachData.username, coachData.email]
    );
    
    if (existing.length > 0) {
      // Update existing coach
      const coachId = existing[0].id;
      console.log(`👤 Updating existing coach: ID ${coachId}`);
      
      await connection.execute(
        'UPDATE users SET password_hash = ?, role = ?, updated_at = NOW() WHERE id = ?',
        [hashedPassword, 'coach', coachId]
      );
      
      console.log('✅ Coach password updated successfully');
      console.log(`👤 Coach credentials: username="${coachData.username}", password="${coachData.password}"`);
      
      return coachId;
    } else {
      // Create new coach
      console.log('👤 Creating new coach...');
      
      const [result] = await connection.execute(
        `INSERT INTO users (username, password_hash, email, full_name, phone, role, created_at, updated_at, is_active, email_verified) 
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), 1, 1)`,
        [coachData.username, hashedPassword, coachData.email, coachData.full_name, coachData.phone, coachData.role]
      );
      
      const coachId = result.insertId;
      console.log('✅ Coach created successfully');
      console.log(`👤 Coach ID: ${coachId}`);
      console.log(`👤 Coach credentials: username="${coachData.username}", password="${coachData.password}"`);
      
      return coachId;
    }
    
  } catch (error) {
    console.error('❌ Error creating/updating coach:', error);
    return null;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

async function testCoachAPI() {
  const coachId = await createOrUpdateCoach();
  
  if (coachId) {
    console.log(`
🎯 Test instructions:
1. Update test script with these credentials:
   - username: "TestCoach"
   - password: "password123"
   
2. Run the coach appointments API test again
3. Coach ID ${coachId} should have access to /api/appointments/coach

4. To add availability data for this coach, run:
   node create-coach-availability-test-data.js
   (Make sure to update coach ID to ${coachId})
    `);
  }
}

testCoachAPI().catch(console.error);
