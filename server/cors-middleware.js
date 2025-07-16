/**
 * CORS middleware đơn giản để giải quyết vấn đề CORS cho các yêu cầu từ frontend
 */

export default function setupCorsMiddleware(app) {
  // Middleware CORS đơn giản nhưng có hiệu quả
  app.use((req, res, next) => {
    // Lấy origin từ header request
    const origin = req.headers.origin || 'http://localhost:5173';
    
    // Cho phép tất cả các origin localhost (cho phát triển)
    if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      // Hoặc sử dụng cấu hình từ env nếu không phải localhost
      const allowedOrigins = process.env.ALLOWED_ORIGINS ? 
        process.env.ALLOWED_ORIGINS.split(',') : 
        ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];
        
      if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }
    }
    
    // Headers cho preflight request
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 giờ
    
    // Handle preflight request
    if (req.method === 'OPTIONS') {
      console.log(`✅ Handling OPTIONS preflight request for ${req.path}`);
      return res.status(200).end();
    }
    
    // Tiếp tục xử lý yêu cầu
    next();
  });
  
  // Middleware đặc biệt cho endpoint cập nhật trạng thái lịch hẹn
  app.use('/api/appointments/:id/status', (req, res, next) => {
    console.log(`🔒 Special CORS handling for appointment status endpoint: ${req.method}`);
    const origin = req.headers.origin || 'http://localhost:5173';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      console.log('✅ Responding to OPTIONS preflight for appointment status endpoint');
      return res.status(200).end();
    }
    
    next();
  });
  
  console.log('✅ Custom CORS middleware initialized');
}
