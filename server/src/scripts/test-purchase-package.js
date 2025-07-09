/**
 * Script để test API mua/nâng cấp gói thành viên
 * 
 * Hướng dẫn sử dụng:
 * 1. Chuẩn bị JWT token hợp lệ của user muốn mua/nâng cấp gói
 * 2. Thay TOKEN bên dưới bằng token thật
 * 3. Chọn packageId của gói muốn mua (1:Free, 2:Premium, 3:Pro)
 * 4. Chọn phương thức thanh toán
 * 5. Chạy script với lệnh: npm run test-purchase
 */
import fetch from 'node-fetch';

// Cấu hình kết nối
const API_URL = process.env.API_URL || 'http://localhost:5000/api';
const TOKEN = process.env.TEST_TOKEN || 'REPLACE_WITH_VALID_TOKEN'; // Thay đổi token này hoặc đặt biến môi trường TEST_TOKEN

// Thông tin gói và phương thức thanh toán để test
const TEST_DATA = {
  packageId: process.env.PACKAGE_ID || 2, // Gói Premium mặc định 
  paymentMethod: process.env.PAYMENT_METHOD || 'momo' // Phương thức thanh toán mặc định
};

async function testPurchasePackageAPI() {
  try {
    console.log('🧪 Testing POST /api/packages/purchase API...');
    console.log('📦 Package ID:', TEST_DATA.packageId);
    console.log('💳 Payment method:', TEST_DATA.paymentMethod);
    
    const response = await fetch(`${API_URL}/packages/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify(TEST_DATA)
    });
    
    const data = await response.json();
    
    console.log('\n✅ API Response Status:', response.status);
    console.log('✅ Success:', data.success);
    console.log('✅ Message:', data.message);
    
    if (data.success && data.data) {
      console.log('\n📦 Purchase details:');
      console.log(`   🆔 Membership ID: ${data.data.membershipId}`);
      console.log(`   💰 Package: ${data.data.packageName} (ID: ${data.data.packageId})`);
      console.log(`   📅 Start date: ${new Date(data.data.startDate).toLocaleString()}`);
      console.log(`   📅 End date: ${data.data.endDate ? new Date(data.data.endDate).toLocaleString() : 'No expiration'}`);
      console.log(`   💲 Price: ${data.data.price}`);
      console.log(`   💳 Payment method: ${data.data.paymentMethod}`);
      console.log(`   🔄 Status: ${data.data.status}`);
    } else {
      console.log('\n❌ Error details:');
      console.log('   Message:', data.message);
      if (data.error) console.log('   Error:', data.error);
    }
    
    console.log('\n🧪 Testing complete!');
    
    // Hướng dẫn kiểm tra database sau khi mua gói
    console.log('\n🔍 Để kiểm tra kết quả trong database:');
    console.log('1. Chạy lệnh: npm run check-tables');
    console.log('2. Hoặc truy vấn trực tiếp database:');
    console.log('   - SELECT * FROM user_memberships WHERE user_id = <user_id>;');
    console.log('   - SELECT * FROM payment_transactions WHERE user_id = <user_id>;');
  } catch (error) {
    console.error('\n❌ Error testing API:', error);
    console.error('Vui lòng kiểm tra:');
    console.error('1. Server đang chạy ở port 5000?');
    console.error('2. Token xác thực có hợp lệ?');
    console.error('3. Đã thêm API route vào routes/packages.js?');
    console.error('4. Package ID có tồn tại trong database?');
    console.error('4. Database đã được khởi tạo với các bảng cần thiết?');
    console.error('\nStack trace:', error.stack);
  }
}

// Thực thi test
testPurchasePackageAPI();
