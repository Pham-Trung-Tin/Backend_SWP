# NoSmoke - Tích hợp Frontend & Backend

Dự án NoSmoke là ứng dụng hỗ trợ cai thuốc lá, giúp người dùng theo dõi tiến trình, nhận tư vấn và cải thiện sức khỏe.

## Cấu trúc dự án

Dự án bao gồm hai phần chính:
- **Frontend**: Ứng dụng React (Vite) nằm tại thư mục gốc
- **Backend**: API Node.js Express nằm tại thư mục `/server`

## Yêu cầu hệ thống

- Node.js v14.0.0 trở lên
- npm v6.0.0 trở lên
- MySQL

## Cài đặt

1. Clone dự án:
   ```bash
   git clone https://github.com/your-repo/nosmoke.git
   cd nosmoke
   ```

2. Cài đặt dependencies cho frontend:
   ```bash
   npm install
   ```

3. Cài đặt dependencies cho backend:
   ```bash
   cd server
   npm install
   cd ..
   ```

## Cấu hình

1. Tạo file `.env` trong thư mục `server` với nội dung sau:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=nosmoke
   JWT_SECRET=your_jwt_secret
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   PORT=5000
   ```

2. Tạo cơ sở dữ liệu MySQL:
   ```sql
   CREATE DATABASE nosmoke;
   ```

3. Chạy migration để khởi tạo database (từ thư mục server):
   ```bash
   npm run migrate
   ```

## Chạy ứng dụng

### Chạy cả frontend và backend:

#### Windows (PowerShell):
```bash
.\start.ps1
```

#### Linux/macOS:
```bash
./start.sh
```

### Hoặc chạy riêng lẻ:

#### Frontend:
```bash
npm run dev
```

#### Backend:
```bash
cd server
npm run dev
```

## API Endpoints

### Xác thực
- `POST /api/auth/register`: Đăng ký tài khoản
- `POST /api/auth/login`: Đăng nhập
- `POST /api/auth/logout`: Đăng xuất
- `GET /api/auth/profile`: Lấy thông tin người dùng hiện tại
- `POST /api/auth/forgot-password`: Yêu cầu đặt lại mật khẩu
- `POST /api/auth/reset-password`: Đặt lại mật khẩu với token
- `POST /api/auth/change-password`: Thay đổi mật khẩu khi đã đăng nhập
- `POST /api/auth/verify-email`: Xác thực email
- `POST /api/auth/resend-verification`: Gửi lại email xác thực

### Người dùng
- `GET /api/users/profile`: Lấy thông tin hồ sơ
- `PUT /api/users/profile`: Cập nhật thông tin hồ sơ
- `POST /api/users/avatar`: Tải lên ảnh đại diện
- `GET /api/users/smoking-status`: Lấy trạng thái hút thuốc
- `PUT /api/users/smoking-status`: Cập nhật trạng thái hút thuốc
- `DELETE /api/users/account`: Xóa tài khoản
- `GET /api/users/membership`: Lấy thông tin gói thành viên
- `PUT /api/users/membership`: Nâng cấp gói thành viên
- `DELETE /api/users/membership`: Hủy gói thành viên (về gói miễn phí)

### Thanh toán
- `POST /api/payments/process`: Xử lý thanh toán
- `GET /api/payments/history`: Lấy lịch sử thanh toán

## Chức năng chính

1. **Xác thực người dùng**
   - Đăng ký, đăng nhập, đăng xuất
   - Quên mật khẩu, đặt lại mật khẩu
   - Xác thực email

2. **Quản lý hồ sơ cá nhân**
   - Cập nhật thông tin cá nhân
   - Thay đổi mật khẩu
   - Tải lên ảnh đại diện

3. **Quản lý gói thành viên**
   - Nâng cấp lên gói Premium/Pro
   - Hủy gói thành viên
   - Thanh toán và xem lịch sử thanh toán

4. **Theo dõi quá trình cai thuốc**
   - Cập nhật trạng thái hút thuốc
   - Xem tiến độ cai thuốc
   - Nhận thông báo và lời khuyên

5. **Hệ thống coach**
   - Đặt lịch tư vấn với coach
   - Chat với coach (chỉ dành cho gói Premium trở lên)
