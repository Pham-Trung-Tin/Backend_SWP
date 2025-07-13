# Coach Messaging System - Implementation Guide

## Tổng quan
Hệ thống nhắn tin giữa coach và user đã được triển khai với các tính năng sau:

### 🔧 Tính năng chính

#### Cho Coach:
1. **Dashboard quản lý tin nhắn** (`/coach-dashboard`)
   - Xem tất cả lịch hẹn và tin nhắn
   - Theo dõi tin nhắn chưa đọc
   - Gửi tin nhắn cho user đã đặt lịch
   - Xác nhận lịch hẹn trực tiếp từ giao diện

2. **Tin nhắn nhanh**
   - Chào hỏi
   - Kiểm tra tình hình
   - Động viên
   - Lời khuyên
   - Hỗ trợ
   - Nhắc nhở

3. **Khởi tạo tin nhắn mẫu**
   - Tự động tạo tin nhắn chào mừng
   - Tin nhắn động viên
   - Lời khuyên cai thuốc
   - Tips hữu ích

#### Cho User:
1. **Nhận tin nhắn từ coach**
   - Tin nhắn hiển thị trong component `CoachChat`
   - Thông báo tin nhắn chưa đọc
   - Phản hồi tự động từ coach

2. **Giao diện chat**
   - Gửi tin nhắn cho coach
   - Xem lịch sử trò chuyện
   - Nhận phản hồi thông minh

### 📁 Cấu trúc file

```
src/
├── page/coach/
│   └── CoachDashboard.jsx          # Dashboard chính cho coach
├── components/
│   └── CoachChat.jsx               # Component chat cho user
├── utils/
│   ├── coachMessages.js            # Template tin nhắn và khởi tạo
│   └── testCoachMessaging.js       # Script test và demo
└── styles/
    └── CoachDashboard.css          # Styling cho dashboard
```

### 🚀 Cách sử dụng

#### Để test hệ thống:

1. **Tạo tài khoản coach test:**
   ```javascript
   // Trong console trình duyệt
   import { runCoachMessagingDemo } from './src/utils/testCoachMessaging.js';
   runCoachMessagingDemo();
   ```

2. **Đăng nhập với tài khoản coach:**
   - Email: `coach1@nosmoke.com`
   - Password: `123456`

3. **Truy cập dashboard:**
   - Click vào menu user → "Dashboard & Tin nhắn"
   - Hoặc truy cập trực tiếp `/coach-dashboard`

4. **Khởi tạo tin nhắn mẫu:**
   - Click nút "Khởi tạo tin nhắn" (màu xanh lá)
   - Tin nhắn mẫu sẽ được tạo cho tất cả lịch hẹn

#### Để user nhận tin nhắn:

1. **Đặt lịch hẹn:**
   - User đăng nhập và đặt lịch với coach
   - Lịch hẹn được lưu trong localStorage

2. **Xem tin nhắn:**
   - Trong trang Profile → tab "Lịch hẹn"
   - Click "Chat" để mở giao diện nhắn tin
   - Tin nhắn từ coach sẽ hiển thị tự động

### 💾 Cấu trúc dữ liệu

#### Tin nhắn (localStorage):
```javascript
// Key: coach_chat_{appointmentId}
{
  id: number,
  text: string,
  sender: 'coach' | 'user',
  timestamp: string,
  readByUser: boolean,
  readByCoach: boolean
}
```

#### Tin nhắn chưa đọc:
```javascript
// Key: unread_messages_{appointmentId}
// Value: number (số tin nhắn chưa đọc)
```

### 🎨 Customization

#### Thêm template tin nhắn mới:
```javascript
// Trong utils/coachMessages.js
export const quickCoachResponses = {
  newCategory: [
    "Tin nhắn mẫu 1",
    "Tin nhắn mẫu 2", 
    // ...
  ]
};
```

#### Thêm nút tin nhắn nhanh:
```javascript
// Trong CoachDashboard.jsx
<button onClick={() => sendQuickMessage(appointmentId, 'newCategory')}>
  Tên nút mới
</button>
```

### 🔐 Bảo mật

- Tin nhắn được lưu local, chỉ hiển thị cho user/coach liên quan
- Kiểm tra quyền truy cập dựa trên role
- Validation input khi gửi tin nhắn

### 📝 Lưu ý

1. **Hardcoded data:** Hiện tại sử dụng localStorage cho demo
2. **Auto-response:** Coach có phản hồi tự động sau 1.5 giây
3. **Real-time:** Không có real-time updates, cần refresh để thấy tin nhắn mới
4. **Mobile responsive:** Giao diện đã tối ưu cho mobile

### 🛠️ Phát triển tiếp

1. **Backend integration:** Kết nối với API thật
2. **Real-time messaging:** Sử dụng WebSocket
3. **File attachments:** Gửi hình ảnh, file
4. **Message reactions:** Like, emoji reactions
5. **Message search:** Tìm kiếm trong lịch sử chat

---

**Demo hoàn chỉnh đã sẵn sàng!** 🎉

Coaches có thể đăng nhập và gửi tin nhắn hardcoded cho users đã đặt lịch hẹn. Users sẽ nhận được tin nhắn và có thể phản hồi qua giao diện chat.
