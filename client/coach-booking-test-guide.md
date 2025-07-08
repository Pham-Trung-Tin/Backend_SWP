# Hướng dẫn Test Hệ thống Coach Booking

## Tổng quan
Hệ thống đã được hoàn thiện với các tính năng:
1. **3 Coach hardcoded** trong BookAppointment.jsx
2. **Coach Login** với tài khoản hardcoded
3. **User Booking System** - User có thể chọn và book coach
4. **Coach Management** - Coach có thể xem và quản lý bookings của mình

## Tài khoản Coach Test
Đã tạo 3 tài khoản coach hardcoded:

### Coach 1 - Nguyên Văn A
- **Email**: `coach1@nosmoke.com`
- **Password**: `coach123`
- **Chuyên môn**: Coach cai thuốc chuyên nghiệp
- **Rating**: 4.8

### Coach 2 - Trần Thị B
- **Email**: `coach2@nosmoke.com`
- **Password**: `coach123`
- **Chuyên môn**: Chuyên gia tâm lý
- **Rating**: 4.9

### Coach 3 - Phạm Minh C
- **Email**: `coach3@nosmoke.com`
- **Password**: `coach123`
- **Chuyên môn**: Bác sĩ phục hồi chức năng
- **Rating**: 4.7

## Hướng dẫn Test

### 1. Test User Booking (Người dùng đặt lịch)

1. **Đăng ký/Đăng nhập** với tài khoản user thường
2. **Nâng cấp membership** lên Premium hoặc Pro (booking chỉ dành cho Premium/Pro members)
3. **Truy cập trang booking**: `/appointment`
4. **Chọn coach** từ danh sách 3 coach có sẵn
5. **Chọn ngày và giờ hẹn**
6. **Xác nhận booking**
7. **Kiểm tra** trong Profile > Appointments tab

### 2. Test Coach Login & Management (Coach đăng nhập và quản lý)

1. **Đăng nhập** với một trong 3 tài khoản coach ở trên
2. **Tự động chuyển hướng** đến Coach Dashboard: `/coach`
3. **Xem Dashboard** với thống kê:
   - Tổng số booking
   - Lịch sắp tới
   - Đã hoàn thành
   - Tổng khách hàng
4. **Quản lý Bookings**: `/coach/bookings`
   - Xem danh sách booking
   - Lọc theo trạng thái (Tất cả, Sắp tới, Đã hoàn thành, Đã hủy)
   - Cập nhật trạng thái booking (Hoàn thành/Hủy/Khôi phục)

### 3. Test End-to-End Flow

1. **User booking flow**:
   - User đăng ký → Nâng cấp membership → Book coach → Xem appointment

2. **Coach management flow**:
   - Coach đăng nhập → Xem dashboard → Quản lý bookings → Cập nhật trạng thái

## Cấu trúc Dữ liệu

### Booking Data Structure (localStorage)
```javascript
{
  id: number,                    // ID của booking
  userId: string,                // ID của user
  userName: string,              // Tên user
  userEmail: string,             // Email user
  coachId: number,               // ID của coach (1, 2, 3)
  coachName: string,             // Tên coach
  coachAvatar: string,           // Avatar coach
  coachRole: string,             // Vai trò/chuyên môn coach
  date: string,                  // Ngày hẹn (ISO string)
  time: string,                  // Giờ hẹn
  status: string,                // Trạng thái: 'confirmed', 'completed', 'cancelled'
  completed: boolean,            // Đã hoàn thành hay chưa
  createdAt: string              // Thời gian tạo booking
}
```

### User Data Update
Khi user book coach, thông tin user sẽ được cập nhật:
```javascript
{
  ...existingUserData,
  assignedCoachId: number,       // ID coach được assign
  assignedCoachName: string      // Tên coach được assign
}
```

## Routing Structure

### User Routes
- `/` - Trang chủ
- `/appointment` - Đặt lịch hẹn (yêu cầu Premium/Pro)
- `/profile` - Hồ sơ cá nhân (xem appointments)

### Coach Routes (Yêu cầu role='coach')
- `/coach` - Coach Dashboard
- `/coach/bookings` - Quản lý Bookings
- `/access-denied` - Trang từ chối truy cập

## Các tính năng đã implement

✅ **3 Coach hardcoded trong BookAppointment**
✅ **Coach authentication với tài khoản hardcoded**
✅ **Role-based routing (coach/user)**
✅ **User booking với thông tin coach đầy đủ**
✅ **Coach dashboard với thống kê**
✅ **Coach booking management với filter**
✅ **Booking status management (confirmed/completed/cancelled)**
✅ **User assignment to coach khi booking**
✅ **Responsive design cho mobile**

## Test Scenarios

### Scenario 1: User Book Coach Success
1. User login/register
2. Upgrade to Premium
3. Go to /appointment
4. Select Coach 1 (Nguyên Văn A)
5. Select date & time
6. Confirm booking
7. Check booking in profile

### Scenario 2: Coach View & Manage Bookings
1. Login as coach1@nosmoke.com
2. View dashboard stats
3. Go to bookings management
4. See user's booking
5. Update booking status to "completed"
6. Verify status change

### Scenario 3: Multiple Coaches Different Bookings
1. Create bookings with different coaches
2. Login as different coaches
3. Verify each coach only sees their own bookings

## Lưu ý
- Tất cả dữ liệu được lưu trong localStorage
- Coach không cần membership để truy cập tính năng
- User cần Premium/Pro membership để book appointment
- Mỗi coach chỉ thấy booking của riêng mình
- Booking status có thể được cập nhật bởi coach
