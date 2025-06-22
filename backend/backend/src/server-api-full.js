// MySQL Express server cho Quit Smoking App - Phiên bản API đầy đủ
// filepath: c:\Users\ADMIN\Documents\GitHub\Project-SWP391\backend\src\server-api-full.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import process from 'process';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import planRoutes from './routes/plans.js';
import progressRoutes from './routes/progress.js';
import appointmentRoutes from './routes/appointments.js';
import membershipRoutes from './routes/membership.js';
import checkinRoutes from './routes/checkins.js';
import adminRoutes from './routes/admin.js';

// Import MySQL connection
import { pool } from './middleware/auth.js';

// Khởi tạo biến môi trường
dotenv.config();

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

// Kiểm tra kết nối DB
pool.getConnection()
  .then(conn => {
    console.log('Kết nối MySQL thành công!');
    conn.release();
  })
  .catch(err => {
    console.error('Lỗi kết nối MySQL:', err);
  });

// Routes với prefix /api
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/progress', progressRoutes);
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

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Quit Smoking API - MySQL Backend',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Đăng ký tài khoản mới',
        'POST /api/auth/login': 'Đăng nhập',
        'GET /api/auth/me': 'Lấy thông tin user hiện tại (cần JWT)',
        'PUT /api/auth/profile': 'Cập nhật profile (cần JWT)',
        'PUT /api/auth/password': 'Đổi mật khẩu (cần JWT)'
      },
      users: {
        'GET /api/users': 'Lấy danh sách users (Admin)',
        'GET /api/users/:id': 'Lấy thông tin user theo ID',
        'PUT /api/users/:id': 'Cập nhật user (cần JWT)',
        'DELETE /api/users/:id': 'Xóa user (Admin)'
      },
      plans: {
        'GET /api/plans': 'Lấy danh sách plans',
        'GET /api/plans/:id': 'Lấy plan theo ID',
        'POST /api/plans': 'Tạo plan mới (cần JWT)',
        'PUT /api/plans/:id': 'Cập nhật plan (cần JWT)',
        'DELETE /api/plans/:id': 'Xóa plan (cần JWT)'
      },
      progress: {
        'GET /api/progress': 'Lấy danh sách progress (cần JWT)',
        'GET /api/progress/user/:userId': 'Lấy progress theo user ID (cần JWT)',
        'POST /api/progress': 'Tạo progress mới (cần JWT)',
        'PUT /api/progress/:id': 'Cập nhật progress (cần JWT)',
        'DELETE /api/progress/:id': 'Xóa progress (cần JWT)'
      },
      appointments: {
        'GET /api/appointments': 'Lấy danh sách appointments',
        'POST /api/appointments': 'Tạo appointment mới (cần JWT)',
        'PUT /api/appointments/:id': 'Cập nhật appointment (cần JWT)',
        'DELETE /api/appointments/:id': 'Xóa appointment (cần JWT)'
      },
      membership: {
        'GET /api/membership': 'Lấy thông tin membership',
        'PUT /api/membership/:userId': 'Cập nhật membership (cần JWT)'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    hint: 'Xem danh sách API tại GET /api'
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
📋 API Documentation: http://localhost:${PORT}/api
🔑 Auth API: http://localhost:${PORT}/api/auth/*
👥 Users API: http://localhost:${PORT}/api/users/*
📝 Plans API: http://localhost:${PORT}/api/plans/*
📈 Progress API: http://localhost:${PORT}/api/progress/*
📅 Appointments API: http://localhost:${PORT}/api/appointments/*
💳 Membership API: http://localhost:${PORT}/api/membership/*
  `);
});
