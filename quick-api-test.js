/**
 * Quick test script để kiểm tra API trả về coach availability
 */

async function testCoachAvailabilityAPI() {
  try {
    console.log('🔍 Testing coach availability API...');
    
    // Test với coach ID 5 - thay đổi nếu cần
    const coachId = 5;
    const response = await fetch(`http://localhost:5000/api/coaches/${coachId}/availability`);
    
    if (!response.ok) {
      console.error('❌ API request failed:', response.status, response.statusText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ API Response:', JSON.stringify(data, null, 2));
    
    // Kiểm tra structure
    if (data && data.data) {
      const availabilityData = data.data;
      console.log('📋 Availability data structure:');
      console.log('- working_hours:', availabilityData.working_hours);
      console.log('- available_slots count:', availabilityData.available_slots?.length || 0);
      console.log('- booked_appointments count:', availabilityData.booked_appointments?.length || 0);
      
      if (availabilityData.available_slots?.length > 0) {
        console.log('📅 Sample available slot:', availabilityData.available_slots[0]);
      }
      
      if (availabilityData.booked_appointments?.length > 0) {
        console.log('🚫 Sample booked appointment:', availabilityData.booked_appointments[0]);
      } else {
        console.log('✅ No booked appointments - all slots should be available');
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error);
  }
}

// Kiểm tra ngay
testCoachAvailabilityAPI();
