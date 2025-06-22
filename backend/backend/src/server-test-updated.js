import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { testConnection, User, Role } from './models/index-mysql-updated.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Basic middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Health check route
app.get('/health', async (req, res) => {
  try {
    // Kiểm tra kết nối
    await testConnection();
    
    res.json({
      success: true,
      message: 'Quit Smoking API with MySQL is running!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: process.env.DB_NAME || 'SmokingCessationDB'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection error',
      error: error.message
    });
  }
});

// Lấy danh sách users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{ model: Role }],
      attributes: { exclude: ['Password'] }
    });
    
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

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    success: false,
    message: 'Server Error',
    error: error.message
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
🚀 Quit Smoking API Server with MySQL is running!
📍 Environment: ${process.env.NODE_ENV || 'development'}
🌐 Port: ${PORT}
🔗 URL: http://localhost:${PORT}
📊 Health Check: http://localhost:${PORT}/health
📚 API Test: http://localhost:${PORT}/api/users
  `);
});
