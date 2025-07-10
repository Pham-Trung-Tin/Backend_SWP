/**
 * Script để test API lấy chi tiết gói dịch vụ theo ID
 */
import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000/api';
const PACKAGE_ID = 1; // ID gói muốn lấy thông tin

async function testPackageDetailAPI() {
  try {
    console.log(`🧪 Testing GET /api/packages/${PACKAGE_ID} API...`);
    
    const response = await fetch(`${API_URL}/packages/${PACKAGE_ID}`);
    const data = await response.json();
    
    console.log('\n✅ API Response Status:', response.status);
    console.log('✅ Success:', data.success);
    console.log('✅ Message:', data.message);
    
    if (data.success && data.data) {
      console.log('\n📦 Package Details:');
      console.log(`   🆔 ID: ${data.data.id}`);
      console.log(`   📝 Name: ${data.data.name}`);
      console.log(`   📋 Description: ${data.data.description}`);
      console.log(`   💰 Price: ${data.data.price} / ${data.data.period}`);
      console.log(`   🔖 Membership Type: ${data.data.membershipType}`);
      console.log(`   ⭐ Popular: ${data.data.popular ? 'Yes' : 'No'}`);
      
      console.log(`\n   ✅ Features (${data.data.features.length}):`);
      data.data.features.forEach(feature => console.log(`      - ${feature}`));
      
      console.log(`\n   ❌ Disabled Features (${data.data.disabledFeatures.length}):`);
      data.data.disabledFeatures.forEach(feature => console.log(`      - ${feature}`));
    } else {
      console.log('\n❌ Failed to get package details:');
      console.log('   Error:', data.message);
    }
    
    console.log('\n🧪 Testing complete!');
  } catch (error) {
    console.error('\n❌ Error testing API:', error.message);
    console.error('Vui lòng kiểm tra:');
    console.error('1. Server đang chạy ở port 5000?');
    console.error('2. API endpoint /api/packages/:id đã được đăng ký?');
    console.error('3. MySQL đã được kết nối?');
    console.error('\nStack trace:', error.stack);
  }
}

// Thực thi test
testPackageDetailAPI();
