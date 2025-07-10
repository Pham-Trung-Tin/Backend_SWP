import fetch from 'node-fetch';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

// Thay đổi các giá trị này để test
const TEST_USER_ID = 1;  // ID của user cần test
const TEST_EMAIL = 'test@example.com';  // Email của user cần test
const TEST_SECRET = process.env.JWT_SECRET || 'your-default-secret';

const generateTestToken = () => {
  return jwt.sign(
    { id: TEST_USER_ID, email: TEST_EMAIL },
    TEST_SECRET,
    { expiresIn: '1h' }
  );
};

const checkMembership = async () => {
  try {
    console.log('🔍 Checking membership status...');
    const token = generateTestToken();
    
    // Test lấy thông tin người dùng từ cơ sở dữ liệu
    console.log('1. Testing user information from database...');
    const userResponse = await fetch('http://localhost:3001/api/users/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const userData = await userResponse.json();
    console.log('User data:', JSON.stringify(userData, null, 2));
    console.log('Membership status in users table:', userData.data?.membership);
    
    // Test lấy thông tin gói thành viên hiện tại
    console.log('\n2. Testing current membership from API...');
    const membershipResponse = await fetch('http://localhost:3001/api/packages/user/current', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const membershipData = await membershipResponse.json();
    console.log('Current membership data:', JSON.stringify(membershipData, null, 2));
    
    // So sánh các thông tin
    if (userData.success && membershipData.success) {
      const userMembership = userData.data?.membership;
      const activeMembership = membershipData.data?.package_name?.toLowerCase();
      
      console.log('\n🔄 Comparison:');
      console.log('- User table membership value:', userMembership);
      console.log('- Active membership package:', activeMembership);
      
      if (userMembership === activeMembership || 
          (userMembership === 'premium' && activeMembership === 'premium') ||
          (userMembership === 'free' && !activeMembership)) {
        console.log('✅ Values match correctly!');
      } else {
        console.log('❌ Values do not match - needs fixing!');
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking membership:', error);
  }
};

checkMembership();
