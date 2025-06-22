import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import connectDB from './config/database-mysql.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Basic middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Show startup message
console.log('Starting MySQL server...');
console.log('Checking configuration...');
console.log(`Database: ${process.env.DB_NAME}`);
console.log(`Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
console.log(`User: ${process.env.DB_USER}`);

// Connect to MySQL
(async () => {
  try {
    console.log('Connecting to MySQL database...');
    await connectDB();
    console.log('Database connection successful!');
  } catch (error) {
    console.error('Failed to connect to database:', error);
    console.error('Check your MySQL connection settings in .env file');
  }
})();

// Health check route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Quit Smoking API with MySQL is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Sync models route (chỉ sử dụng trong development)
app.get('/setup-db', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ success: false, message: 'Route not available in production' });
  }
  
  try {
    await syncModels(req.query.force === 'true');
    res.json({ success: true, message: 'Database tables created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
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
📚 Setup DB: http://localhost:${PORT}/setup-db
  `);
});
