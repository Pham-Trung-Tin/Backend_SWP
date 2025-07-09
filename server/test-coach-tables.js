import { pool } from './src/config/database.js';

async function checkTables() {
  try {
    console.log('Checking database tables...');
    
    // Check users table
    const [users] = await pool.query('SHOW COLUMNS FROM users');
    console.log('Users table columns:', users.map(col => col.Field));
    
    // Check if coach_availability table exists
    try {
      const [availCols] = await pool.query('SHOW COLUMNS FROM coach_availability');
      console.log('coach_availability table exists with columns:', availCols.map(col => col.Field));
    } catch (error) {
      console.log('coach_availability table does not exist:', error.message);
    }
    
    // Check if appointment/appointments table exists
    try {
      const [appCols] = await pool.query('SHOW COLUMNS FROM appointment');
      console.log('appointment table exists with columns:', appCols.map(col => col.Field));
    } catch (error) {
      console.log('appointment table does not exist:', error.message);
      try {
        const [appsCols] = await pool.query('SHOW COLUMNS FROM appointments');
        console.log('appointments table exists with columns:', appsCols.map(col => col.Field));
      } catch (error) {
        console.log('appointments table does not exist either:', error.message);
      }
    }
    
    // Check if feedback table exists
    try {
      const [feedbackCols] = await pool.query('SHOW COLUMNS FROM feedback');
      console.log('feedback table exists with columns:', feedbackCols.map(col => col.Field));
    } catch (error) {
      console.log('feedback table does not exist:', error.message);
    }
    
    // List all tables in the database
    const [allTables] = await pool.query('SHOW TABLES');
    console.log('All tables in the database:', allTables.map(table => Object.values(table)[0]));
    
  } catch (error) {
    console.error('Error checking tables:', error);
  } finally {
    // Close the connection pool
    pool.end();
  }
}

checkTables();
