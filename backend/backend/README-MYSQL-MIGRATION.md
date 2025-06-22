# Quit Smoking API Server

Backend API cho ứng dụng Quit Smoking, hỗ trợ người dùng trong hành trình cai thuốc lá.

## Thông tin cơ sở dữ liệu

Hệ thống sử dụng MySQL thay vì MongoDB như phiên bản trước.

### Cấu hình MySQL

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=SmokingCessationDB
DB_USER=root
DB_PASSWORD=12345
```

## Các bước chạy dự án

### 1. Cài đặt các gói phụ thuộc

```bash
npm install
```

### 2. Cấu hình database

- Đảm bảo MySQL đã được cài đặt và chạy trên máy của bạn
- Đảm bảo cơ sở dữ liệu `SmokingCessationDB` đã được tạo
- Các bảng được tạo tự động thông qua ORM

### 3. Chạy server

```bash
# Chạy server với MongoDB (phiên bản cũ)
npm run dev

# Chạy server với MySQL (phiên bản mới, đơn giản)
npm run mysql

# Chạy server với MySQL (phiên bản MVC đầy đủ)
npm run mvc
```

## API Endpoint

### Auth API

- `POST /api/auth/register`: Đăng ký tài khoản mới
- `POST /api/auth/login`: Đăng nhập
- `GET /api/auth/me`: Lấy thông tin user hiện tại (yêu cầu JWT token)
- `PUT /api/auth/profile`: Cập nhật thông tin cá nhân (yêu cầu JWT token)
- `PUT /api/auth/password`: Đổi mật khẩu (yêu cầu JWT token)

### User API

- `GET /api/users`: Lấy danh sách tất cả user (Admin)
- `GET /api/users/:id`: Lấy thông tin user theo ID
- `PUT /api/users/:id`: Cập nhật thông tin user
- `DELETE /api/users/:id`: Xóa user

### Quit Smoking Plan API

- `POST /api/plans`: Tạo kế hoạch cai thuốc mới
- `GET /api/plans`: Lấy danh sách kế hoạch cai thuốc
- `GET /api/plans/:id`: Lấy thông tin kế hoạch cai thuốc theo ID
- `PUT /api/plans/:id`: Cập nhật kế hoạch cai thuốc
- `DELETE /api/plans/:id`: Xóa kế hoạch cai thuốc

### Progress Tracking API

- `POST /api/progress`: Thêm dữ liệu theo dõi tiến trình mới
- `GET /api/progress`: Lấy danh sách dữ liệu theo dõi tiến trình
- `GET /api/progress/user/:userId`: Lấy tiến trình theo user ID
- `PUT /api/progress/:id`: Cập nhật dữ liệu theo dõi tiến trình
- `DELETE /api/progress/:id`: Xóa dữ liệu theo dõi tiến trình

### Appointment API

- `POST /api/appointments`: Đặt lịch hẹn mới
- `GET /api/appointments`: Lấy danh sách lịch hẹn
- `GET /api/appointments/:id`: Lấy thông tin lịch hẹn theo ID
- `PUT /api/appointments/:id`: Cập nhật lịch hẹn
- `DELETE /api/appointments/:id`: Hủy lịch hẹn

### Membership API

- `GET /api/membership`: Lấy thông tin các gói thành viên
- `PUT /api/membership/:userId`: Cập nhật gói thành viên cho user

### Blog API

- `GET /api/blogs`: Lấy danh sách bài viết blog
- `GET /api/blogs/:id`: Lấy thông tin bài viết blog theo ID

## Cấu trúc cơ sở dữ liệu MySQL

### Bảng User

- **UserID**: int, Primary Key, Auto Increment
- **Name**: varchar(100)
- **Email**: varchar(100), Unique
- **Password**: varchar(255)
- **RoleID**: int, Foreign Key -> Role(RoleID)
- **Membership**: enum('free', 'premium')
- **RegistrationDate**: datetime
- **LastLogin**: datetime

### Bảng Role

- **RoleID**: int, Primary Key
- **RoleName**: varchar(50)

### Bảng QuitSmokingPlan

- **PlanID**: int, Primary Key, Auto Increment
- **UserID**: int, Foreign Key -> User(UserID)
- **Title**: varchar(100)
- **StartDate**: date
- **TargetDate**: date
- **CigarettesPerDay**: int
- **CostPerPack**: decimal(10,2)
- **CigarettesPerPack**: int
- **Status**: enum('active', 'completed', 'failed', 'paused')
- **CreatedAt**: datetime
- **UpdatedAt**: datetime

### Bảng ProgressTracking

- **TrackingID**: int, Primary Key, Auto Increment
- **PlanID**: int, Foreign Key -> QuitSmokingPlan(PlanID)
- **UserID**: int, Foreign Key -> User(UserID)
- **TrackingDate**: date
- **CigarettesSmoked**: int
- **MoneySaved**: decimal(10,2)
- **HealthImprovements**: text
- **Mood**: enum('great', 'good', 'neutral', 'bad', 'terrible')
- **Cravings**: int
- **CreatedAt**: datetime

### Bảng Booking

- **BookingID**: int, Primary Key, Auto Increment
- **UserID**: int, Foreign Key -> User(UserID)
- **CoachUserID**: int, Foreign Key -> User(UserID)
- **BookingDate**: datetime
- **Status**: enum('pending', 'confirmed', 'completed', 'cancelled')
- **CreatedAt**: datetime

### Bảng Appointment

- **AppointmentID**: int, Primary Key, Auto Increment
- **BookingID**: int, Foreign Key -> Booking(BookingID)
- **AppointmentDate**: datetime
- **Duration**: int
- **Topic**: varchar(255)
- **Notes**: text
- **Status**: enum('scheduled', 'completed', 'cancelled')
- **CreatedAt**: datetime

### Bảng Feedback

- **FeedbackID**: int, Primary Key, Auto Increment
- **AppointmentID**: int, Foreign Key -> Appointment(AppointmentID)
- **UserID**: int, Foreign Key -> User(UserID)
- **Rating**: int
- **Comments**: text
- **CreatedAt**: datetime

## Tác giả

Developed by [Your Name](https://github.com/yourusername)
