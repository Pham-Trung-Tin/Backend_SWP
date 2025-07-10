/**
 * Script để test API packages sau khi sửa
 */
import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000/api'; // Port 5000 cho server của bạn

async function testPackageAPI() {
  try {
    // Test API danh sách gói
    console.log('🧪 Testing GET /api/packages API...');
    
    const response = await fetch(`${API_URL}/packages`);
    const data = await response.json();
    
    console.log('\n✅ API Response Status:', response.status);
    console.log('✅ Success:', data.success);
    console.log('✅ Message:', data.message);
    
    // Nếu có lỗi từ server
    if (!data.success) {
      console.error('❌ API Error:', data.message);
      if (data.error) {
        console.error('Error details:', data.error);
      }
    }
    
    if (data.data && Array.isArray(data.data)) {
      console.log(`\n📦 Found ${data.data.length} packages:`);
      
      data.data.forEach(pkg => {
        console.log(`\n🔖 Package: ${pkg.name} (ID: ${pkg.id})`);
        console.log(`   💰 Price: ${pkg.price} / ${pkg.period}`);
        console.log(`   ⭐ Popular: ${pkg.popular ? 'Yes' : 'No'}`);
        console.log(`   ✅ Features (${pkg.features.length}):`);
        pkg.features.forEach(feature => console.log(`      - ${feature}`));
        console.log(`   ❌ Disabled Features (${pkg.disabledFeatures.length}):`);
        pkg.disabledFeatures.forEach(feature => console.log(`      - ${feature}`));
      });
    } else {
      console.log('❌ No package data found in response');
    }
    
    // Test API chi tiết gói đầu tiên nếu có
    if (data.data && data.data.length > 0) {
      const firstPackage = data.data[0];
      console.log(`\n🧪 Testing GET /api/packages/${firstPackage.id} API...`);
      
      try {
        const detailResponse = await fetch(`${API_URL}/packages/${firstPackage.id}`);
        const detailData = await detailResponse.json();
        
        console.log('\n✅ Detail API Response Status:', detailResponse.status);
        console.log('✅ Detail Success:', detailData.success);
        
        if (detailData.success && detailData.data) {
          console.log(`\n📦 Package Detail: ${detailData.data.name}`);
          console.log(`   💰 Price: ${detailData.data.price} / ${detailData.data.period}`);
          console.log(`   🆔 Membership Type: ${detailData.data.membershipType}`);
          console.log(`   ✅ Features (${detailData.data.features.length}):`);
          detailData.data.features.forEach(feature => console.log(`      - ${feature}`));
        } else {
          console.log('❌ Package detail API returned error:', detailData.message);
        }
      } catch (detailError) {
        console.error('❌ Error testing detail API:', detailError.message);
      }
    }
    
    console.log('\n🧪 Testing complete!');
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    console.error('Vui lòng kiểm tra:');
    console.error('1. Server đang chạy ở port 5000?');
    console.error('2. API endpoint /api/packages đã được đăng ký?');
    console.error('3. MySQL đã được kết nối?');
    console.error('\nStack trace:', error.stack);
  }
}

testPackageAPI();
