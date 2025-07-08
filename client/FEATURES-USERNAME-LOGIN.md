# 🎯 Tính năng Username + Login mới

## ✨ Những thay đổi đã thực hiện

### 1. 📝 **Form Đăng ký (Register.jsx)**
- ✅ Thêm trường **Username** riêng biệt 
- ✅ Xác thực username (ít nhất 3 ký tự, chỉ chữ cái, số và dấu gạch dưới)
- ✅ Bố cục 2 cột: Username và Họ tên cùng 1 hàng
- ✅ Tự động chuyển username về lowercase

### 2. 🔐 **Form Đăng nhập (Login.jsx + LoginModal.jsx)**
- ✅ Cho phép đăng nhập bằng **Email HOẶC Username**
- ✅ Thay đổi label thành "Email hoặc Username"
- ✅ Cập nhật placeholder phù hợp
- ✅ Áp dụng cho cả trang Login và LoginModal

### 3. 🖥️ **Backend (authController.js)**
- ✅ Cập nhật API login để tìm kiếm user bằng cả email và username
- ✅ Thay đổi query: `WHERE email = ? OR username = ?`
- ✅ Cập nhật thông báo lỗi: "Invalid email/username or password"

## 🚀 Cách sử dụng

### Đăng ký:
1. Nhập **Username** (ít nhất 3 ký tự, chỉ a-z, 0-9, _)
2. Nhập **Họ và tên** đầy đủ
3. Nhập **Email** hợp lệ
4. Nhập **Mật khẩu** (ít nhất 6 ký tự)
5. **Xác nhận mật khẩu**

### Đăng nhập:
- Có thể dùng **Email** hoặc **Username** để đăng nhập
- Ví dụ:
  - `john_doe` (username)
  - `john@email.com` (email)

## ⚠️ Lưu ý

- Username chỉ được chứa: `a-z`, `A-Z`, `0-9`, `_`
- Username tự động chuyển thành lowercase
- Backend đã hỗ trợ tìm kiếm cả email và username
- Email verification vẫn hoạt động bình thường

## 🧪 Test Cases

### ✅ Đăng ký thành công:
- Username: `john_doe`
- Họ tên: `John Doe`
- Email: `john@example.com`
- Password: `123456`

### ✅ Đăng nhập thành công:
- Dùng username: `john_doe`
- Dùng email: `john@example.com`
- Cả 2 cách đều phải hoạt động với cùng 1 tài khoản

### ❌ Validation errors:
- Username < 3 ký tự
- Username chứa ký tự đặc biệt (ngoài _)
- Email không hợp lệ
- Password < 6 ký tự
- Confirm password không khớp
