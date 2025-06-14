const jwt = require('jsonwebtoken');      // Thư viện JWT để xác minh token
const User = require('../models/User');   // Model người dùng để truy vấn DB

// ✅ Middleware xác thực người dùng (dùng cho các route cần login)
const authMiddleware = (req, res, next) => {
  // 1. Lấy token từ header Authorization (kiểu Bearer ...)
  const token = req.headers['authorization'];

  // 2. Nếu không có token → trả lỗi 401
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // 3. Xác minh token hợp lệ
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' }); // token sai, hết hạn, v.v.
    }

    // 4. Lưu userId được mã hóa từ token vào `req` để dùng sau
    req.userId = decoded.id;

    // 5. Cho phép đi tiếp sang middleware / controller tiếp theo
    next();
  });
};

// ✅ Middleware kiểm tra người dùng có quyền admin không
const isAdmin = (req, res, next) => {
  // 1. Truy vấn người dùng bằng ID đã được giải mã từ token
  User.findById(req.userId)
    .then(user => {
      // 2. Nếu không tìm thấy user → trả lỗi
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // 3. Kiểm tra quyền của user có phải là admin không
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Require Admin Role!' });
      }

      // 4. Cho phép đi tiếp nếu là admin
      next();
    })
    .catch(err => {
      // 5. Nếu lỗi DB → trả lỗi 500
      res.status(500).json({ message: err.message });
    });
};

// ✅ Export cả 2 middleware để sử dụng ở nơi khác
module.exports = {
  authMiddleware,
  isAdmin
};
