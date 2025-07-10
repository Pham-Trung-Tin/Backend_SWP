import { pool } from './src/config/database.js';
import Coach from './src/models/Coach.js';

async function testCoachAPI() {
  try {
    console.log('Testing Coach API functions...');
    
    // Test findAll
    console.log('\n--- Testing findAll ---');
    const coaches = await Coach.findAll();
    console.log(`Found ${coaches.length} coaches`);
    
    if (coaches.length > 0) {
      const coachId = coaches[0].id;
      
      // Test findById
      console.log(`\n--- Testing findById with id=${coachId} ---`);
      const coach = await Coach.findById(coachId);
      console.log('Coach found:', coach?.username);
      
      // Test getAvailability
      console.log(`\n--- Testing getAvailability with id=${coachId} ---`);
      try {
        const availability = await Coach.getAvailability(coachId);
        console.log('Availability:', JSON.stringify(availability, null, 2));
      } catch (availError) {
        console.error('Error getting availability:', availError);
      }
      
      // Test getReviews
      console.log(`\n--- Testing getReviews with id=${coachId} ---`);
      try {
        const reviews = await Coach.getReviews(coachId);
        console.log(`Found ${reviews.length} reviews`);
        if (reviews.length > 0) {
          console.log('First review:', JSON.stringify(reviews[0], null, 2));
        }
      } catch (reviewError) {
        console.error('Error getting reviews:', reviewError);
      }
    }
    
  } catch (error) {
    console.error('Error testing Coach API:', error);
  } finally {
    // Close the connection pool
    pool.end();
  }
}

testCoachAPI();
