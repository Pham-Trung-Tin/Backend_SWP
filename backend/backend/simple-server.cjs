const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

console.log('🚀 Starting simple API server...');

// MySQL connection
const pool = mysql.createPool({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '12345',
  database: 'SmokingCessationDB',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0
});

// Test MySQL connection
(async () => {
  try {
    await pool.query('SELECT 1');
    console.log('✅ MySQL connected successfully!');
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
  }
})();

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Backend API Server is running!',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      success: true,
      message: 'Server and database are healthy!',
      database: 'MySQL connected'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message
    });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT u.UserID, u.Name, u.Email, u.Membership, r.RoleName 
      FROM User u
      JOIN Role r ON u.RoleID = r.RoleID
    `);
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

const PORT = 3000; // Đổi port để tránh conflict
app.listen(PORT, () => {
  console.log(`
🚀 Backend API Server running!
📍 Port: ${PORT}
🌐 URL: http://localhost:${PORT}
📊 Health: http://localhost:${PORT}/health
👥 Users: http://localhost:${PORT}/api/users
  `);
});
