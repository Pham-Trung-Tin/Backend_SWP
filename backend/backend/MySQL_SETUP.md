# Quit Smoking Application - Hướng dẫn cài đặt MySQL

Dự án sử dụng MySQL để lưu trữ dữ liệu. Dưới đây là hướng dẫn cách cài đặt và cấu hình MySQL cho ứng dụng.

## Cài đặt MySQL

1. Tải và cài đặt MySQL từ [trang chủ MySQL](https://dev.mysql.com/downloads/installer/).
2. Trong quá trình cài đặt, chọn "Server only" hoặc "Custom" và chắc chắn bạn đã chọn MySQL Server.
3. Đặt mật khẩu cho user `root`.

## Cấu hình dự án với MySQL

1. Cập nhật file `.env` trong thư mục `backend` với thông tin MySQL:

```bash
DB_HOST=localhost
DB_PORT=3306
DB_NAME=quit_smoking_app
DB_USER=root
DB_PASSWORD=YOUR_PASSWORD_HERE  # Thay thế bằng mật khẩu root MySQL của bạn
```

2. Tạo database và các bảng cần thiết:

```bash
# Cách 1: Sử dụng file SQL
mysql -u root -p < db/mysql_setup.sql

# Cách 2: Sử dụng Sequelize để tạo các bảng (trong môi trường development)
# Truy cập vào URL: http://localhost:5000/setup-db
```

## Kiểm tra kết nối MySQL

1. Chạy server MySQL:

```bash
cd backend
node src/server-mysql.js
```

2. Nếu không có lỗi, điều này có nghĩa là kết nối thành công!

## Sử dụng MySQL trong dự án

Dự án hiện tại hỗ trợ cả MongoDB và MySQL. Để sử dụng MySQL:

1. Import các models từ `./models/index-mysql.js` thay vì từ `mongoose`.
2. Sử dụng các phương thức của Sequelize như `findAll()`, `findOne()`, `create()`, v.v. thay vì các phương thức của Mongoose.

## Chú ý

- Các models đã được chuyển đổi từ Mongoose sang Sequelize và có thể được tìm thấy trong thư mục `src/models` với hậu tố `MySQL`.
- Định dạng JSON được sử dụng cho một số trường phức tạp như `membership`, `quitPlan`, v.v.
- Các liên kết giữa các bảng đã được thiết lập qua các khóa ngoại.

## Vấn đề thường gặp

1. **Lỗi kết nối**: Đảm bảo MySQL server đang chạy và thông tin kết nối trong file `.env` là chính xác.

2. **Lỗi quyền truy cập**: Đảm bảo user MySQL có đủ quyền để tạo và sửa đổi database.

3. **Lỗi không tìm thấy database**: Chạy setup script để tạo database hoặc tạo database thủ công.

```sql
CREATE DATABASE IF NOT EXISTS quit_smoking_app;
```
