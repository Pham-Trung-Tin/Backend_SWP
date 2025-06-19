import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Khởi tạo Express app
const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Quit Smoking API is running!',
    timestamp: new Date().toISOString()
  });
});

// Simple auth routes để test
const authRouter = express.Router();

authRouter.post('/register', (req, res) => {
  res.json({
    success: true,
    message: 'Register endpoint working'
  });
});

authRouter.post('/login', (req, res) => {
  res.json({
    success: true,
    message: 'Login endpoint working'
  });
});

app.use('/api/auth', authRouter);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
🚀 Simple Test Server Running!
🌐 Port: ${PORT}
📊 Health: http://localhost:${PORT}/health
🔐 Auth Test: http://localhost:${PORT}/api/auth/login
  `);
});

export default app;
