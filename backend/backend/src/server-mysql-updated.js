// MySQL Express server for Quit Smoking App - Updated version
// filepath: c:\Users\ADMIN\Documents\GitHub\Project-SWP391\backend\src\server-mysql-updated.js
import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';

// Khởi tạo Express app
const app = express();

// Middleware
app.use(cors());
app.use(helmet({ contentSecurityPolicy: false })); // Disable CSP for development
app.use(express.json());

// Tạo pool connection cho MySQL
const pool = mysql.createPool({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '12345',
  database: 'SmokingCessationDB',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Kiểm tra kết nối
pool.getConnection()
  .then(conn => {
    console.log('Kết nối MySQL thành công!');
    conn.release();
  })
  .catch(err => {
    console.error('Lỗi kết nối MySQL:', err);
  });

// API routes

// Health check
app.get('/health', async (req, res) => {
  try {
    const [result] = await pool.query('SELECT 1 AS connected');
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

// === AUTH ROUTES ===
// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, roleId = 3 } = req.body;

    // Check if email exists
    const [existingUsers] = await pool.query('SELECT * FROM User WHERE Email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
    const [result] = await pool.query(
      'INSERT INTO User (Name, Email, Password, RoleID, Membership) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, roleId, 'free']
    );

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      userId: result.insertId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đăng ký',
      error: error.message
    });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const [users] = await pool.query('SELECT * FROM User WHERE Email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    const user = users[0];
    
    // Nếu mật khẩu đang lưu là hash bcrypt
    const isMatch = await bcrypt.compare(password, user.Password);
    
    // Nếu mật khẩu không phải là bcrypt hash, thử so sánh trực tiếp (cho test)
    const isDirectMatch = (user.Password === password);
    
    if (!isMatch && !isDirectMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    // Update last login
    await pool.query('UPDATE User SET LastLogin = NOW() WHERE UserID = ?', [user.UserID]);

    // Get user role
    const [roles] = await pool.query('SELECT RoleName FROM Role WHERE RoleID = ?', [user.RoleID]);
    const roleName = roles.length > 0 ? roles[0].RoleName : 'Unknown';

    // Return user info (without password)
    const { Password, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        user: {
          ...userWithoutPassword,
          role: roleName
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đăng nhập',
      error: error.message
    });
  }
});

// Get current user profile
app.get('/api/auth/me', async (req, res) => {
  try {
    // Thực tế cần JWT Authentication
    // Tạm thời chỉ trả về một user cố định cho testing
    const userId = req.query.userId || 1;
    
    const [users] = await pool.query(`
      SELECT u.*, r.RoleName
      FROM User u
      JOIN Role r ON u.RoleID = r.RoleID
      WHERE u.UserID = ?
    `, [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User không tồn tại'
      });
    }

    const { Password, ...userWithoutPassword } = users[0];
    
    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// === USER ROUTES ===
// Get all users
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

// === PLAN ROUTES ===
// Get quit smoking plans
app.get('/api/plans', async (req, res) => {
  try {
    const [plans] = await pool.query(`
      SELECT p.*, u.Name as UserName
      FROM QuitSmokingPlan p
      JOIN User u ON p.UserID = u.UserID
      LIMIT 10
    `);
    
    res.json({
      success: true,
      count: plans.length,
      data: plans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching plans',
      error: error.message
    });
  }
});

// === BOOKING ROUTES ===
// Get all appointments
app.get('/api/appointments', async (req, res) => {
  try {
    const [appointments] = await pool.query(`
      SELECT a.*, b.BookingDate, 
             u.Name as UserName, 
             c.Name as CoachName
      FROM Appointment a
      JOIN Booking b ON a.BookingID = b.BookingID
      JOIN User u ON b.UserID = u.UserID
      JOIN User c ON b.CoachUserID = c.UserID
      LIMIT 10
    `);
    
    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments',
      error: error.message
    });
  }
});

// Thêm route để kiểm tra progress tracking
app.get('/api/progress', async (req, res) => {
  try {
    const [progress] = await pool.query(`
      SELECT pt.*, p.Title as PlanTitle
      FROM ProgressTracking pt
      JOIN QuitSmokingPlan p ON pt.PlanID = p.PlanID
      ORDER BY pt.TrackingDate DESC
      LIMIT 20
    `);
    
    res.json({
      success: true,
      count: progress.length,
      data: progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching progress data',
      error: error.message
    });
  }
});

// Thêm route để kiểm tra membership
app.get('/api/membership', async (req, res) => {
  try {
    const [memberships] = await pool.query(`
      SELECT m.*, u.Name as UserName, p.Name as PackageName
      FROM Membership m
      JOIN User u ON m.UserID = u.UserID
      JOIN Package p ON m.PackageID = p.PackageID
    `);
    
    res.json({
      success: true,
      count: memberships.length,
      data: memberships
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching membership data',
      error: error.message
    });
  }
});

// Blog API
app.get('/api/blogs', async (req, res) => {
  try {
    const [blogs] = await pool.query(`
      SELECT b.*, u.Name as AuthorName
      FROM Blog b
      JOIN User u ON b.AuthorUserID = u.UserID
      ORDER BY b.CreatedAt DESC
      LIMIT 10
    `);
    
    res.json({
      success: true,
      count: blogs.length,
      data: blogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching blogs',
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

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`
🚀 Quit Smoking API Server với MySQL đang chạy!
📍 Port: ${PORT}
📊 Health Check: http://localhost:${PORT}/health
👤 API Đăng nhập: http://localhost:${PORT}/api/auth/login
👥 API Users: http://localhost:${PORT}/api/users
📝 API Plans: http://localhost:${PORT}/api/plans
📅 API Appointments: http://localhost:${PORT}/api/appointments
📈 API Progress: http://localhost:${PORT}/api/progress
📰 API Blogs: http://localhost:${PORT}/api/blogs
  `);
});
