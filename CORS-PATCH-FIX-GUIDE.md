# Fix cho lỗi CORS khi cập nhật trạng thái booking

## Vấn đề
Lỗi CORS khi gửi yêu cầu PATCH từ frontend (http://localhost:5175) đến backend (http://localhost:5000):

```
Access to fetch at 'http://localhost:5000/api/appointments/148/status' from origin 'http://localhost:5175' has been blocked by CORS policy: Method PATCH is not allowed by Access-Control-Allow-Methods in preflight response.
```

## Giải pháp

Đã thực hiện các sửa đổi sau:

### 1. Tạo endpoint mới sử dụng method POST thay vì PATCH

- Tạo route mới `/api/appointments-update/:id/status` sử dụng method POST (tên số nhiều phản ánh bảng appointments)
- Đảm bảo xử lý CORS cho endpoint mới
- Kế thừa logic xử lý từ controller hiện tại

### 2. Cải thiện middleware CORS

- Thêm log chi tiết cho xử lý OPTIONS request
- Đảm bảo tất cả các header CORS được cài đặt đúng
- Đảm bảo middleware CORS được áp dụng trước khi routes được đăng ký

### 3. Cập nhật frontend để dùng endpoint mới

- Chuyển từ PATCH sang POST request
- Thêm logic fallback để thử endpoint cũ nếu endpoint mới không tồn tại
- Cải thiện xử lý lỗi và logging

### 4. Tích hợp status update endpoint vào server

- Import và khởi tạo endpoint trong server.js

## Cách kiểm tra

1. Restart server Node.js
2. Đăng nhập vào tài khoản coach
3. Điều hướng đến trang quản lý lịch hẹn (CoachBookings)
4. Thử cập nhật trạng thái của một cuộc hẹn

## Các file đã thay đổi

- `server/src/routes/appointmentsStatusRoutes.js` (mới): Tạo endpoint POST thay thế (đúng với tên số nhiều)
- `server/src/app.js`: Thêm route mới và cải thiện xử lý CORS
- `server/cors-middleware.js`: Cải thiện xử lý CORS và thêm log chi tiết
- `server/server.js`: Tích hợp status update endpoint
- `src/utils/coachApiIntegration.js`: Cập nhật frontend để sử dụng endpoint mới

## Lưu ý kỹ thuật

Vấn đề là do CORS preflight request với method OPTIONS không được xử lý đúng khi client request dùng PATCH. Giải pháp đơn giản nhất là:

1. Sử dụng method POST thay vì PATCH (web service vẫn RESTful dù dùng POST để update)
2. Đảm bảo CORS headers được cấu hình đúng
3. Xử lý preflight OPTIONS request một cách rõ ràng

## Biện pháp phòng ngừa tương lai

- Nên sử dụng method phổ biến (GET, POST) thay vì PATCH/PUT nếu không cần thiết
- Đảm bảo CORS được cấu hình đúng cho tất cả các endpoint, đặc biệt là các method không phổ biến
- Thêm log chi tiết khi xử lý CORS và preflight requests để dễ debug
