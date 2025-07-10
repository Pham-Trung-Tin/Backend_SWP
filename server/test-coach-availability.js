import { pool } from './src/config/database.js';
import Coach from './src/models/Coach.js';

async function testAvailability() {
  try {
    console.log('Testing Coach availability...');
    
    // Test with a specific coach ID
    const coachId = 13; // You can change this to another ID if needed
    
    console.log(`Testing getAvailability with id=${coachId}`);
    const availability = await Coach.getAvailability(coachId);
    console.log('Availability result:', JSON.stringify(availability, null, 2));
    
  } catch (error) {
    console.error('Error testing availability:', error);
  } finally {
    pool.end();
  }
}

testAvailability();
