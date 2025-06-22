import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration
app.use(cors());

// Body parsing middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Quit Smoking API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Auth routes only
app.use('/api/auth', (req, res) => {
  res.json({
    success: true,
    message: 'Auth endpoint working',
    endpoint: req.originalUrl,
    method: req.method
  });
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
🚀 Minimal Quit Smoking API Server is running!
📍 Environment: ${process.env.NODE_ENV || 'development'}
🌐 Port: ${PORT}
🔗 URL: http://localhost:${PORT}
📊 Health Check: http://localhost:${PORT}/health
  `);
});

export default app;
