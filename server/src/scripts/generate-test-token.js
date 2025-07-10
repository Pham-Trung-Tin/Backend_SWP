/**
 * Script để tạo JWT token cho mục đích test API
 * Sử dụng: 
 * - node src/scripts/generate-test-token.js
 * - hoặc: npm run generate-token
 */
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { pool } from '../config/database.js';

// Load environment variables
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret';
const USER_EMAIL = process.env.TEST_USER_EMAIL || null;

async function generateToken() {
  try {
    console.log('� Tìm người dùng để tạo token...');
    
    // Tìm người dùng trong database
    let queryStr = 'SELECT id, email, full_name, role FROM users';
    let params = [];
    
    if (USER_EMAIL) {
      queryStr += ' WHERE email = ?';
      params.push(USER_EMAIL);
      console.log(`📧 Tìm người dùng với email: ${USER_EMAIL}`);
    } else {
      queryStr += ' ORDER BY id ASC LIMIT 1';
      console.log('🔍 Không có email được chỉ định, tìm người dùng đầu tiên trong database');
    }
    
    const [users] = await pool.execute(queryStr, params);
    
    if (users.length === 0) {
      console.error(`❌ No user found with email: ${USER_EMAIL}`);
      console.log('Available users:');
      const [allUsers] = await pool.execute('SELECT id, email, name FROM users LIMIT 5');
      console.table(allUsers);
      process.exit(1);
    }
    
    const user = users[0];
    console.log('✅ Found user:', {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role
    });
    
    // Đảm bảo user.id là một số nguyên
    const userId = Number(user.id);
    if (isNaN(userId)) {
      throw new Error(`User ID must be a number, got: ${user.id} (${typeof user.id})`);
    }
    
    // Tạo payload cho JWT - đảm bảo id luôn là số và sử dụng full_name
    const payload = {
      id: userId,
      email: user.email,
      full_name: user.full_name, // Sử dụng full_name thay vì name
      role: user.role || 'user'
    };
    
    console.log('Creating token with payload:', payload);
    
    // Tạo token với thời hạn 24 giờ
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
    
    console.log('\n🔓 JWT Token (có hiệu lực trong 24 giờ):');
    console.log(token);
    
    console.log('\n📝 Sử dụng trong Postman:');
    console.log('Header: Authorization');
    console.log(`Value: Bearer ${token}`);
    
    console.log('\n🧪 Test API mua gói với Postman:');
    console.log('1. Method: POST');
    console.log('2. URL: http://localhost:5000/api/packages/purchase');
    console.log('3. Headers: Authorization: Bearer ' + token);
    console.log('4. Body (raw JSON):');
    console.log('   {');
    console.log('     "packageId": 2,');
    console.log('     "paymentMethod": "momo"');
    console.log('   }');
    
    // Kiểm tra token để đảm bảo nó hoạt động
    console.log('\n🔍 Xác thực token...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token hợp lệ. Payload:', decoded);
  } catch (error) {
    console.error('❌ Error generating token:', error);
  } finally {
    // Đóng kết nối database
    pool.end();
  }
}

// Chạy hàm
generateToken();
