// Test script for checking MySQL connection
const { connectDB, pool } = require('./config/database');

async function testConnection() {
  try {
    await connectDB();
    
    // Test a simple query
    const [rows] = await pool.query('SELECT 1 as test');
    console.log('Test query result:', rows);
    
    // Test querying the memberships table
    const [memberships] = await pool.query('SELECT * FROM memberships');
    console.log('Memberships found:', memberships.length);
    console.log('Memberships:', memberships);
    
    console.log('Database connection test successful!');
    process.exit(0);
  } catch (error) {
    console.error('Database connection test failed:', error);
    process.exit(1);
  }
}

testConnection();
