/**
 * Script để tạo test data cho coach availability
 */

const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'trolley.proxy.rlwy.net',
  port: 45213,
  user: 'root',
  password: 'lGDZJCNBNWLXJwflgTOIBaNhiDWEcAmz',
  database: 'railway'
};

async function createCoachAvailabilityTestData() {
  let connection;
  
  try {
    console.log('🔗 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    // Get all coaches
    const [coaches] = await connection.execute('SELECT id, username FROM users WHERE role = ?', ['coach']);
    console.log(`👥 Found ${coaches.length} coaches:`, coaches.map(c => `${c.id}: ${c.username}`));
    
    if (coaches.length === 0) {
      console.log('❌ No coaches found in database');
      return;
    }
    
    // Check current availability data
    const [existing] = await connection.execute('SELECT coach_id, day_of_week, start_time, end_time FROM coach_availability');
    console.log(`📋 Current availability records: ${existing.length}`);
    
    if (existing.length > 0) {
      console.log('📋 Existing availability:', existing);
    }
    
    // Create availability for first coach if none exists
    const coachId = coaches[0].id;
    
    // Delete existing data for this coach to start fresh
    await connection.execute('DELETE FROM coach_availability WHERE coach_id = ?', [coachId]);
    console.log(`🗑️ Deleted existing availability for coach ${coachId}`);
    
    // Define availability schedule (Monday to Friday, 9 AM to 5 PM)
    const availabilityData = [
      { day: 'Monday', start: '09:00', end: '17:00' },
      { day: 'Tuesday', start: '09:00', end: '17:00' },
      { day: 'Wednesday', start: '09:00', end: '17:00' },
      { day: 'Thursday', start: '09:00', end: '17:00' },
      { day: 'Friday', start: '09:00', end: '17:00' },
      { day: 'Saturday', start: '10:00', end: '16:00' }
    ];
    
    // Insert availability data
    for (const slot of availabilityData) {
      await connection.execute(
        'INSERT INTO coach_availability (coach_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)',
        [coachId, slot.day.toLowerCase(), slot.start, slot.end]
      );
      console.log(`✅ Added availability: ${slot.day} ${slot.start}-${slot.end}`);
    }
    
    // Verify the data
    const [newAvailability] = await connection.execute(
      'SELECT coach_id, day_of_week, TIME_FORMAT(start_time, "%H:%i") as start_time, TIME_FORMAT(end_time, "%H:%i") as end_time FROM coach_availability WHERE coach_id = ?',
      [coachId]
    );
    
    console.log('🎯 Final availability data:');
    console.table(newAvailability);
    
    console.log('✅ Test data created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the script
createCoachAvailabilityTestData().catch(console.error);
