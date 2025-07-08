# Hướng dẫn sử dụng hệ thống xác nhận lịch hẹn Coach

## Tính năng đã thêm

Đã cập nhật hệ thống booking để có luồng xác nhận lịch hẹn từ coach:

### 1. **Luồng User đặt lịch:**
- User đặt lịch hẹn với coach
- Lịch hẹn được lưu với trạng thái `'pending'` (Chờ xác nhận)
- User nhận thông báo rằng lịch hẹn đang chờ coach xác nhận

### 2. **Luồng Coach xác nhận:**
- Coach đăng nhập và truy cập `/coach`
- Xem danh sách lịch hẹn với các tab:
  - **Tất cả**: Hiển thị tất cả lịch hẹn
  - **Chờ xác nhận**: Chỉ hiển thị lịch hẹn có status `'pending'`
  - **Sắp tới**: Lịch hẹn đã xác nhận sắp diễn ra
  - **Đã hoàn thành**: Lịch hẹn đã hoàn thành
  - **Đã hủy**: Lịch hẹn đã bị hủy

### 3. **Hành động của Coach:**
- **Với lịch hẹn "Chờ xác nhận"**:
  - ✅ **Xác nhận**: Chuyển status từ `'pending'` → `'confirmed'`
  - ❌ **Từ chối**: Chuyển status từ `'pending'` → `'cancelled'`

- **Với lịch hẹn "Đã xác nhận"**:
  - ✅ **Hoàn thành**: Chuyển status từ `'confirmed'` → `'completed'`
  - ❌ **Hủy**: Chuyển status từ `'confirmed'` → `'cancelled'`

- **Với lịch hẹn "Đã hủy"**:
  - 🔄 **Khôi phục**: Chuyển status từ `'cancelled'` → `'confirmed'`

## Cách test hệ thống

### **Bước 1: Tạo lịch hẹn từ phía User**
1. Đăng nhập với tài khoản user thường
2. Vào trang booking `/tools` hoặc từ menu
3. Chọn coach, ngày, giờ và đặt lịch
4. Kiểm tra thông báo hiển thị "Đang chờ coach xác nhận"

### **Bước 2: Đăng nhập với tài khoản Coach**
```
Email: coach1@nosmoke.com
Password: coach123

Email: coach2@nosmoke.com
Password: coach123

Email: coach3@nosmoke.com
Password: coach123
```

### **Bước 3: Truy cập trang Coach**
1. Sau khi đăng nhập với tài khoản coach
2. Truy cập `/coach`
3. Xem dashboard hiển thị danh sách lịch hẹn

### **Bước 4: Test chức năng xác nhận**
1. Click tab **"Chờ xác nhận"** để xem các lịch hẹn pending
2. Với mỗi lịch hẹn, bạn sẽ thấy 2 nút:
   - **"Xác nhận"** (màu xanh dương)
   - **"Từ chối"** (màu đỏ)
3. Click **"Xác nhận"** để approve lịch hẹn
4. Lịch hẹn sẽ chuyển sang tab **"Sắp tới"** với status "Đã xác nhận"

### **Bước 5: Test các chức năng khác**
1. **Hoàn thành lịch hẹn**: Trong tab "Sắp tới", click "Hoàn thành"
2. **Hủy lịch hẹn**: Click "Hủy" để hủy lịch hẹn
3. **Khôi phục**: Trong tab "Đã hủy", click "Khôi phục" để khôi phục lịch hẹn

## Trạng thái lịch hẹn

| Trạng thái | Màu sắc | Mô tả | Hành động có thể thực hiện |
|------------|---------|-------|---------------------------|
| `pending` | 🟡 Vàng | Chờ xác nhận | Xác nhận, Từ chối |
| `confirmed` | 🔵 Xanh dương | Đã xác nhận | Hoàn thành, Hủy |
| `completed` | 🟢 Xanh lá | Đã hoàn thành | (Không có hành động) |
| `cancelled` | 🔴 Đỏ | Đã hủy | Khôi phục |

## Files đã thay đổi

1. **`src/page/coach/CoachBookings.jsx`**:
   - Thêm filter "Chờ xác nhận"
   - Thêm nút "Xác nhận" và "Từ chối" cho status pending
   - Cập nhật logic xử lý các trạng thái

2. **`src/styles/CoachBookings.css`**:
   - Thêm styling cho nút "Xác nhận" (.confirm-btn)

3. **`src/page/BookAppointment.jsx`**:
   - Thay đổi status mặc định từ 'confirmed' → 'pending'
   - Cập nhật thông báo success với thông tin về trạng thái chờ xác nhận

4. **`src/page/BookAppointment.css`**:
   - Thêm styling cho thông báo pending status

5. **`src/routes/AppRoutes.jsx`**:
   - Thêm route `/coach` để truy cập trang coach

## Lưu ý quan trọng

- Chỉ những tài khoản có `role: 'coach'` mới có thể truy cập `/coach`
- Mỗi coach chỉ thấy các lịch hẹn của riêng mình (filter theo coachId)
- Tất cả data được lưu trong localStorage (phù hợp cho development)
- Trong production, cần tích hợp với backend API và notification system

## Tính năng có thể mở rộng

1. **Notification real-time**: Thông báo cho user khi coach xác nhận/từ chối
2. **Email notifications**: Gửi email thông báo trạng thái lịch hẹn
3. **Calendar integration**: Tích hợp với Google Calendar
4. **Appointment notes**: Coach có thể thêm ghi chú cho lịch hẹn
5. **Bulk actions**: Xác nhận/từ chối nhiều lịch hẹn cùng lúc
