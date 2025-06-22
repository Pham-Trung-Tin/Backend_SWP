import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Import configurations
import connectDB from './config/database.js';

// Import routes
import authRoutes from './routes/auth.js';
import appointmentRoutes from './routes/appointments.js';
import checkinRoutes from './routes/checkins.js';
import userRoutes from './routes/users.js';
import membershipRoutes from './routes/membership.js';
// import adminRoutes from './routes/admin.js';

// Load environment variables
dotenv.config();

// Khởi tạo Express app
const app = express();

// Connect to MongoDB
connectDB();

// Trust proxy để có thể lấy real IP khi deploy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Tạm thời disable CSP cho development
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Cho phép requests không có origin (mobile apps, postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Cho phép gửi cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 phút
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // Giới hạn 100 requests mỗi windowMs
  message: {
    success: false,
    message: 'Quá nhiều requests từ IP này, vui lòng thử lại sau'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Quit Smoking API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/checkins', checkinRoutes);
app.use('/api/users', userRoutes);
app.use('/api/membership', membershipRoutes);
// app.use('/api/admin', adminRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((error, req, res, _next) => {
  console.error('Global Error:', error);

  // CORS error
  if (error.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS error: Origin not allowed'
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token đã hết hạn'
    });
  }

  // MongoDB errors
  if (error.name === 'MongoError' || error.name === 'MongooseError') {
    return res.status(500).json({
      success: false,
      message: 'Lỗi cơ sở dữ liệu'
    });
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: messages
    });
  }

  // Default error
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Lỗi server không xác định',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
🚀 Quit Smoking API Server is running!
📍 Environment: ${process.env.NODE_ENV || 'development'}
🌐 Port: ${PORT}
🔗 URL: http://localhost:${PORT}
📊 Health Check: http://localhost:${PORT}/health
📚 API Base: http://localhost:${PORT}/api
  `);
});

export default app;
