/**
 * Script để tạo test appointments để demo tính năng filter booked slots
 */

const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'trolley.proxy.rlwy.net',
  port: 45213,
  user: 'root',
  password: 'lGDZJCNBNWLXJwflgTOIBaNhiDWEcAmz',
  database: 'railway'
};

async function createTestBookedAppointments() {
  let connection;
  
  try {
    console.log('🔗 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    // Get coaches and users
    const [coaches] = await connection.execute('SELECT id, username FROM users WHERE role = ?', ['coach']);
    const [users] = await connection.execute('SELECT id, username FROM users WHERE role = ? LIMIT 3', ['user']);
    
    if (coaches.length === 0 || users.length === 0) {
      console.log('❌ Need at least 1 coach and 1 user');
      return;
    }
    
    const coachId = coaches[0].id;
    const userId = users[0]?.id || 1;
    
    console.log(`👥 Using coach ${coachId} and user ${userId}`);
    
    // Create some test appointments for today and tomorrow
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const testAppointments = [
      {
        date: today.toISOString().split('T')[0],
        time: '10:00:00',
        datetime: `${today.toISOString().split('T')[0]} 10:00:00`
      },
      {
        date: today.toISOString().split('T')[0], 
        time: '14:00:00',
        datetime: `${today.toISOString().split('T')[0]} 14:00:00`
      },
      {
        date: tomorrow.toISOString().split('T')[0],
        time: '16:00:00', 
        datetime: `${tomorrow.toISOString().split('T')[0]} 16:00:00`
      }
    ];
    
    // Clear existing test appointments
    await connection.execute(
      'DELETE FROM appointment WHERE coach_id = ? AND appointment_time >= CURDATE()',
      [coachId]
    );
    console.log('🗑️ Cleared existing future appointments');
    
    // Insert test appointments
    for (const apt of testAppointments) {
      try {
        await connection.execute(
          'INSERT INTO appointment (user_id, coach_id, appointment_time, duration_minutes, status, notes) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, coachId, apt.datetime, 120, 'confirmed', `Test appointment at ${apt.time}`]
        );
        console.log(`✅ Created appointment: ${apt.date} ${apt.time}`);
      } catch (error) {
        console.log(`⚠️ Failed to create appointment ${apt.date} ${apt.time}:`, error.message);
      }
    }
    
    // Verify appointments
    const [appointments] = await connection.execute(
      `SELECT 
        DATE(appointment_time) as date,
        TIME_FORMAT(appointment_time, '%H:%i') as time,
        status,
        notes
      FROM appointment 
      WHERE coach_id = ? AND appointment_time >= CURDATE()
      ORDER BY appointment_time`,
      [coachId]
    );
    
    console.log('🎯 Test appointments created:');
    console.table(appointments);
    
    console.log('✅ Test data created! Now these time slots should be filtered out in the UI.');
    
  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

createTestBookedAppointments().catch(console.error);
