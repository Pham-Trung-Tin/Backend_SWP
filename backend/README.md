# Quit Smoking Backend API

Backend API cho ứng dụng hỗ trợ bỏ thuốc lá được xây dựng với Node.js, Express và MongoDB.

## 🚀 Tính năng

### Core Features

- **Authentication**: Đăng ký, đăng nhập, JWT token
- **Daily Check-in**: Theo dõi hàng ngày việc bỏ thuốc
- **Progress Tracking**: Thống kê tiến trình bỏ thuốc
- **Appointments**: Đặt lịch tư vấn với coach
- **Membership**: Quản lý gói thành viên (Free, Premium, Pro)

### Tính năng chi tiết

- ✅ Đăng ký/đăng nhập với JWT authentication
- ✅ Check-in hàng ngày với mood, craving level, symptoms
- ✅ Thống kê tiền tiết kiệm, điều thuốc không hút
- ✅ Đặt lịch hẹn với coach
- ✅ Quản lý kế hoạch bỏ thuốc
- ✅ Rate limiting và bảo mật API
- ✅ Validation đầu vào
- ✅ Error handling toàn cục

## 🛠 Công nghệ sử dụng

- **Backend**: Node.js, Express.js
- **Database**: MongoDB với Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator
- **Development**: Nodemon

## 📋 Yêu cầu hệ thống

- Node.js >= 16.0.0
- MongoDB >= 4.0
- npm hoặc yarn

## ⚙️ Cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd Backend_SWP
```

### 2. Cài đặt dependencies

```bash
# Cài đặt cho root project
npm install

# Cài đặt cho backend
cd backend
npm install
```

### 3. Cấu hình environment variables

Tạo file `.env` trong thư mục root với nội dung:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/quit-smoking-app

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:5173

# JWT Configuration
JWT_SECRET=quit_smoking_super_secret_key_2024
JWT_EXPIRE=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### 4. Khởi động MongoDB

Đảm bảo MongoDB đang chạy trên hệ thống của bạn.

### 5. Chạy ứng dụng

#### Development mode

```bash
# Từ thư mục backend
npm run dev

# Hoặc từ root
npm run dev:backend
```

#### Production mode

```bash
npm start
```

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication Endpoints

#### POST `/auth/register`

Đăng ký user mới

```json
{
  "name": "Nguyễn Văn A",
  "email": "user@example.com",
  "password": "password123",
  "cigarettesPerDay": 20,
  "costPerPack": 25000,
  "cigarettesPerPack": 20
}
```

#### POST `/auth/login`

Đăng nhập

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### GET `/auth/me`

Lấy thông tin user hiện tại (cần token)

### User Endpoints

#### GET `/users/dashboard`

Lấy thông tin dashboard user

#### PUT `/users/profile`

Cập nhật thông tin cá nhân

#### GET `/users/statistics`

Lấy thống kê user

### Check-in Endpoints

#### POST `/checkins`

Tạo check-in hàng ngày

```json
{
  "smokingStatus": "smoke-free",
  "mood": "good",
  "cravingLevel": 3,
  "notes": "Hôm nay cảm thấy tốt"
}
```

#### GET `/checkins/today`

Lấy check-in hôm nay

#### GET `/checkins/history`

Lấy lịch sử check-in

#### GET `/checkins/statistics`

Lấy thống kê check-in

### Appointment Endpoints

#### POST `/appointments`

Đặt lịch hẹn mới

```json
{
  "coachId": "coach123",
  "coachName": "Dr. Smith",
  "appointmentDate": "2024-01-15",
  "appointmentTime": "10:00",
  "type": "consultation",
  "reason": "Cần tư vấn về kế hoạch bỏ thuốc"
}
```

#### GET `/appointments`

Lấy danh sách cuộc hẹn

#### GET `/appointments/upcoming`

Lấy cuộc hẹn sắp tới

### Membership Endpoints

#### GET `/membership`

Lấy thông tin membership

#### POST `/membership/upgrade`

Nâng cấp membership

## 🔒 Bảo mật

- **JWT Authentication**: Tất cả protected routes đều yêu cầu token
- **Rate Limiting**: Giới hạn số request per IP
- **CORS**: Cấu hình chỉ cho phép domain được phép
- **Helmet**: Security headers
- **Input Validation**: Validate tất cả input từ client
- **Password Hashing**: Sử dụng bcrypt

## 📁 Cấu trúc thư mục

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Cấu hình MongoDB
│   ├── controllers/
│   │   ├── authController.js    # Xử lý authentication
│   │   ├── userController.js    # Xử lý user operations
│   │   ├── checkinController.js # Xử lý daily check-ins
│   │   ├── appointmentController.js # Xử lý appointments
│   │   └── membershipController.js # Xử lý membership
│   ├── middleware/
│   │   ├── auth.js             # JWT authentication
│   │   └── validation.js       # Input validation
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── DailyCheckin.js    # Daily check-in schema
│   │   └── Appointment.js     # Appointment schema
│   ├── routes/
│   │   ├── auth.js           # Auth routes
│   │   ├── users.js          # User routes
│   │   ├── checkins.js       # Check-in routes
│   │   ├── appointments.js   # Appointment routes
│   │   └── membership.js     # Membership routes
│   └── server.js             # Main server file
├── package.json
└── README.md
```

## 🧪 Testing

```bash
# Chạy tests (khi có)
npm test

# Test specific endpoint với curl
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"123456","cigarettesPerDay":10,"costPerPack":25000}'
```

## 📈 Monitoring

### Health Check

```
GET /health
```

### API Status

Server sẽ log thông tin startup:

```
🚀 Quit Smoking API Server is running!
📍 Environment: development
🌐 Port: 5000
🔗 URL: http://localhost:5000
📊 Health Check: http://localhost:5000/health
📚 API Base: http://localhost:5000/api
```

## 🔧 Troubleshooting

### Lỗi thường gặp

1. **MongoDB connection failed**

   - Kiểm tra MongoDB có đang chạy
   - Kiểm tra connection string trong .env

2. **JWT token errors**

   - Kiểm tra JWT_SECRET trong .env
   - Đảm bảo token được gửi trong header Authorization

3. **CORS errors**

   - Kiểm tra FRONTEND_URL trong .env
   - Thêm domain vào allowedOrigins nếu cần

4. **Rate limiting**
   - Chờ hết thời gian rate limit
   - Điều chỉnh cấu hình rate limit nếu cần

## 🚀 Deployment

### Docker (recommended)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/quit-smoking-app
JWT_SECRET=your-super-secret-production-key
FRONTEND_URL=https://yourdomain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Contact

- Email: support@quitsmoking.com
- Documentation: [API Docs](http://localhost:5000/api/docs)
- Issues: [GitHub Issues](https://github.com/yourrepo/issues)
