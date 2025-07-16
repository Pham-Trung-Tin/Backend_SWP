/**
 * Script để tạo test appointment data qua API để demo filter
 */

const API_BASE = 'http://localhost:5000/api';

// Test credentials - update these
const TEST_CREDENTIALS = {
  username: 'testuser', // User có membership để book appointment
  password: 'password123'
};

const TEST_COACH_ID = 4; // Coach ID từ test trước

let authToken = null;
let userId = null;

async function login() {
  try {
    console.log('🔐 Logging in...');
    
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(TEST_CREDENTIALS)
    });

    if (!response.ok) {
      console.error('❌ Login failed:', response.status);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return false;
    }

    const result = await response.json();
    authToken = result.data.token;
    userId = result.data.user.id;
    
    console.log('✅ Login successful');
    console.log('👤 User ID:', userId);
    console.log('🔑 Token:', authToken ? 'Received' : 'Missing');
    
    return true;
  } catch (error) {
    console.error('❌ Login error:', error.message);
    return false;
  }
}

async function createTestAppointment(date, time) {
  try {
    console.log(`📅 Creating appointment for ${date} ${time}...`);
    
    const response = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        coach_id: TEST_COACH_ID,
        appointment_date: date,
        appointment_time: time,
        duration_minutes: 120,
        notes: `Test appointment for filter demo - ${time}`
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Created appointment: ${date} ${time}`, result.data?.id);
      return result;
    } else {
      const error = await response.text();
      console.log(`❌ Failed to create appointment ${date} ${time}:`, error);
      return null;
    }
  } catch (error) {
    console.log(`❌ Error creating appointment ${date} ${time}:`, error.message);
    return null;
  }
}

async function testAvailabilityAfterBooking() {
  try {
    console.log('\n🔍 Testing availability after booking...');
    
    const response = await fetch(`${API_BASE}/coaches/${TEST_COACH_ID}/availability`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📋 Updated availability:');
      console.log('- available_slots count:', data.data.available_slots?.length || 0);
      console.log('- booked_appointments count:', data.data.booked_appointments?.length || 0);
      
      if (data.data.booked_appointments?.length > 0) {
        console.log('🚫 Booked appointments:');
        data.data.booked_appointments.forEach(apt => {
          console.log(`  - ${apt.date} ${apt.time} (status: ${apt.status})`);
        });
      }
      
      return data.data;
    } else {
      console.log('❌ Failed to fetch updated availability:', response.status);
      return null;
    }
  } catch (error) {
    console.log('❌ Error testing availability:', error.message);
    return null;
  }
}

async function runTest() {
  console.log('🚀 Starting appointment booking test for filter demo...');
  
  // Login first
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without login');
    return;
  }
  
  // Get today and tomorrow dates
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todayStr = today.toISOString().split('T')[0];
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  console.log(`📅 Testing dates: ${todayStr}, ${tomorrowStr}`);
  
  // Create test appointments to block some time slots
  console.log('\n📝 Creating test appointments...');
  
  await createTestAppointment(todayStr, '10:00');
  await createTestAppointment(todayStr, '14:00');  
  await createTestAppointment(tomorrowStr, '16:00');
  
  // Test availability after booking
  await testAvailabilityAfterBooking();
  
  console.log(`
📋 Test Complete! 

Next steps:
1. Go to http://localhost:5175
2. Login with membership account
3. Go to Book Appointment
4. Select coach ID ${TEST_COACH_ID} (${TEST_CREDENTIALS.username})
5. Select today (${todayStr}) - slots 10:00-12:00, 14:00-16:00 should be hidden
6. Select tomorrow (${tomorrowStr}) - slot 16:00-18:00 should be hidden

The filter logic should hide these booked time slots!
  `);
}

// Run the test
runTest().catch(console.error);
