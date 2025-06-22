# API Documentation - Quit Smoking Application

## Tổng quan

API server cho ứng dụng hỗ trợ cai thuốc lá, được xây dựng với Node.js, Express và MySQL.

**Base URL**: `http://localhost:5000`

## Authentication

API sử dụng JWT (JSON Web Tokens) để xác thực. Sau khi đăng nhập thành công, bạn sẽ nhận được một token. Token này cần được gửi trong header `Authorization` cho các API yêu cầu xác thực.

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### 🏥 Health Check

#### GET /health

Kiểm tra trạng thái server và kết nối database.

**Response:**

```json
{
  "success": true,
  "message": "Server is running",
  "database": "MySQL connected",
  "timestamp": "2025-06-19T10:00:00.000Z"
}
```

---

### 🔐 Authentication

#### POST /api/auth/register

Đăng ký tài khoản mới.

**Request Body:**

```json
{
  "name": "Nguyễn Văn A",
  "email": "user@example.com",
  "password": "password123",
  "age": 25,
  "gender": "Male",
  "phone": "0123456789",
  "address": "Hà Nội"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "userId": 4,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST /api/auth/login

Đăng nhập vào hệ thống.

**Request Body:**

```json
{
  "email": "admin@nosmoke.com",
  "password": "12345"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "user": {
      "UserID": 1,
      "Name": "Admin User",
      "Email": "admin@nosmoke.com",
      "RoleName": "Admin",
      "Membership": "pro"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### GET /api/auth/me

Lấy thông tin user hiện tại. **Yêu cầu xác thực**.

**Response:**

```json
{
  "success": true,
  "data": {
    "UserID": 1,
    "Name": "Admin User",
    "Email": "admin@nosmoke.com",
    "RoleName": "Admin",
    "Membership": "pro"
  }
}
```

---

### 👥 User Management

#### GET /api/users

Lấy danh sách users. **Yêu cầu xác thực**.

**Query Parameters:**

- `page` (optional): Số trang (default: 1)
- `limit` (optional): Số lượng per page (default: 10)
- `role` (optional): Filter theo role (Admin, Coach, Smoker)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "UserID": 1,
      "Name": "Admin User",
      "Email": "admin@nosmoke.com",
      "RoleName": "Admin",
      "Membership": "pro"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "totalPages": 1
  }
}
```

#### GET /api/users/:id

Lấy thông tin user theo ID. **Yêu cầu xác thực**.

#### PUT /api/users/:id

Cập nhật thông tin user. **Yêu cầu xác thực**.

**Request Body:**

```json
{
  "name": "Tên mới",
  "age": 30,
  "gender": "Female",
  "phone": "0987654321",
  "address": "TP.HCM",
  "membership": "premium"
}
```

---

### 📝 Quit Smoking Plans

#### POST /api/plans

Tạo kế hoạch cai thuốc mới. **Yêu cầu xác thực**.

**Request Body:**

```json
{
  "title": "Kế hoạch cai thuốc trong 1 tháng",
  "reason": "Vì sức khỏe và gia đình",
  "startDate": "2025-06-19",
  "expectedQuitDate": "2025-07-19",
  "description": "Giảm dần số điếu thuốc mỗi tuần"
}
```

#### GET /api/plans

Lấy danh sách kế hoạch cai thuốc. **Yêu cầu xác thực**.

**Query Parameters:**

- `userId` (optional): Filter theo user ID (chỉ Admin)
- `status` (optional): Filter theo trạng thái
- `page`, `limit`: Phân trang

#### GET /api/plans/:id

Lấy kế hoạch theo ID. **Yêu cầu xác thực**.

#### PUT /api/plans/:id

Cập nhật kế hoạch. **Yêu cầu xác thực**.

#### DELETE /api/plans/:id

Xóa kế hoạch. **Yêu cầu xác thực**.

---

### 📈 Progress Tracking

#### POST /api/progress

Thêm progress tracking mới. **Yêu cầu xác thực**.

**Request Body:**

```json
{
  "planId": 1,
  "status": "Good",
  "note": "Hôm nay không hút điếu nào",
  "cravingLevel": 3
}
```

#### GET /api/progress

Lấy danh sách progress tracking. **Yêu cầu xác thực**.

**Query Parameters:**

- `planId` (optional): Filter theo plan ID
- `page`, `limit`: Phân trang

---

### 💳 Packages

#### GET /api/packages

Lấy danh sách gói thành viên.

#### POST /api/packages

Tạo gói thành viên mới. **Yêu cầu xác thực Admin**.

**Request Body:**

```json
{
  "name": "Gói Premium",
  "description": "Truy cập đầy đủ tính năng",
  "features": "Chat với coach, theo dõi chi tiết...",
  "price": 99000,
  "durationDays": 30
}
```

---

### 📅 Bookings

#### POST /api/bookings

Tạo booking với coach. **Yêu cầu xác thực**.

**Request Body:**

```json
{
  "coachUserId": 2,
  "bookingDate": "2025-06-25 10:00:00"
}
```

#### GET /api/bookings

Lấy danh sách bookings. **Yêu cầu xác thực**.

#### PUT /api/bookings/:id/status

Cập nhật trạng thái booking. **Yêu cầu xác thực Coach/Admin**.

**Request Body:**

```json
{
  "status": "confirmed"
}
```

---

### 📰 Blogs

#### GET /api/blogs

Lấy danh sách bài viết blog.

#### GET /api/blogs/:id

Lấy bài viết theo ID.

#### POST /api/blogs

Tạo bài viết mới. **Yêu cầu xác thực Admin/Coach**.

**Request Body:**

```json
{
  "title": "10 Tips cai thuốc hiệu quả",
  "content": "Nội dung bài viết..."
}
```

---

### 🏆 Achievements

#### GET /api/achievements

Lấy danh sách tất cả achievements.

#### GET /api/users/:userId/achievements

Lấy achievements của user cụ thể. **Yêu cầu xác thực**.

---

## Error Responses

Tất cả lỗi sẽ có format:

```json
{
  "success": false,
  "message": "Mô tả lỗi",
  "error": "Chi tiết lỗi (chỉ trong development mode)"
}
```

### Mã lỗi thường gặp:

- `400` - Bad Request: Thiếu thông tin hoặc dữ liệu không hợp lệ
- `401` - Unauthorized: Chưa đăng nhập hoặc token không hợp lệ
- `403` - Forbidden: Không có quyền truy cập
- `404` - Not Found: Không tìm thấy resource
- `500` - Internal Server Error: Lỗi server

---

## Database Schema

### Các bảng chính:

1. **User** - Thông tin người dùng
2. **Role** - Vai trò (Admin, Coach, Smoker)
3. **QuitSmokingPlan** - Kế hoạch cai thuốc
4. **ProgressTracking** - Theo dõi tiến trình
5. **Package** - Gói thành viên
6. **Membership** - Thành viên
7. **Booking** - Đặt lịch
8. **Appointment** - Cuộc hẹn
9. **Blog** - Bài viết
10. **Achievement** - Thành tựu

---

## Testing

Để test API, bạn có thể:

1. Sử dụng file `test-api.html` đã được tạo
2. Sử dụng Postman hoặc Insomnia
3. Sử dụng curl command

### Test với curl:

```bash
# Health check
curl http://localhost:5000/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nosmoke.com","password":"12345"}'

# Get users (cần token)
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Setup & Running

1. Cài đặt dependencies: `npm install`
2. Cấu hình `.env` file
3. Đảm bảo MySQL đang chạy và database đã được tạo
4. Chạy server: `npm run api`
5. Server sẽ chạy tại `http://localhost:5000`

---

_Tài liệu này được cập nhật lần cuối: 19/06/2025_
