// MySQL Express server cho Quit Smoking App - Phiên bản MVC cuối cùng
// filepath: c:\Users\ADMIN\Documents\GitHub\Project-SWP391\backend\src\server-mvc.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import process from 'process';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import appointmentRoutes from './routes/appointments.js';
import membershipRoutes from './routes/membership.js';
import checkinRoutes from './routes/checkins.js';
import adminRoutes from './routes/admin.js';

// Imports MySQL connection
import { pool } from './middleware/auth.js';

// Khởi tạo biến môi trường
dotenv.config();

// Lấy đường dẫn hiện tại
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Khởi tạo Express app
const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // 100 yêu cầu mỗi IP trong 15 phút
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút'
  }
});

// Middleware
app.use(cors());
app.use(helmet({ contentSecurityPolicy: false })); // Tắt CSP cho môi trường phát triển
app.use(compression()); // Nén response
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded
app.use(limiter); // Rate limiting

// Phục vụ file tĩnh
app.use(express.static(join(__dirname, '../public')));

// Kiểm tra kết nối DB
pool.getConnection()
  .then(conn => {
    console.log('Kết nối MySQL thành công!');
    conn.release();
  })
  .catch(err => {
    console.error('Lỗi kết nối MySQL:', err);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/membership', membershipRoutes);
app.use('/api/checkins', checkinRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', async (req, res) => {
  try {
    // Thực hiện truy vấn kiểm tra kết nối
    await pool.query('SELECT 1 AS connected');
    res.json({
      success: true,
      message: 'Server is running',
      database: 'MySQL connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection error',
      error: error.message
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handler
app.use((err, req, res) => {
  console.error('Server error:', err);
  const nodeEnv = process.env.NODE_ENV || 'development';
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Lỗi server',
    error: nodeEnv === 'development' ? err : {}
  });
});

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
🚀 Quit Smoking API Server với MySQL đang chạy!
📍 Port: ${PORT}
📊 Health Check: http://localhost:${PORT}/health
👤 API Đăng nhập: http://localhost:${PORT}/api/auth/login
👥 API Users: http://localhost:${PORT}/api/users
📅 API Appointments: http://localhost:${PORT}/api/appointments
💳 API Membership: http://localhost:${PORT}/api/membership
📝 API Checkins: http://localhost:${PORT}/api/checkins
🛠️ API Admin: http://localhost:${PORT}/api/admin
  `);
});
