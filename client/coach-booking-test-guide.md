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

## 🔧 Troubleshooting

### ❓ "Ngày theo dõi, số điếu đã tránh, milestone đang tính sai?"
**ĐƯỢC SỬA CHỮA!** Đã cập nhật logic tính toán cho chính xác hơn:

#### **1. Ngày theo dõi (No Smoking Days)**
- **Cũ**: Tính từ ngày bắt đầu kế hoạch đến hôm nay (kể cả khi chưa checkin)
- **Mới**: Tính dựa trên số ngày thực tế có checkin 
- **Lý do**: Chỉ nên tính các ngày người dùng thực sự tham gia theo dõi

```javascript
// Kiểm tra ngày theo dõi:
const activePlan = JSON.parse(localStorage.getItem('activePlan'));
console.log('Ngày bắt đầu kế hoạch:', activePlan?.startDate);

// Đếm số ngày có checkin:
let checkinDays = 0;
for (let i = 0; i < 30; i++) {
  const date = new Date();
  date.setDate(date.getDate() - i);
  const dateStr = date.toISOString().split('T')[0];
  if (localStorage.getItem(`checkin_${dateStr}`)) {
    checkinDays++;
    console.log(`${dateStr}: Có checkin`);
  }
}
console.log('Tổng số ngày có checkin:', checkinDays);
```

#### **2. Số điếu thuốc đã tránh (Saved Cigarettes)**
- **Cũ**: Có thể tính sai hoặc trùng lặp
- **Mới**: Chỉ tính tích lũy các ngày thực sự giảm được (actual < initial)

```javascript
// Kiểm tra số điếu đã tránh:
const activePlan = JSON.parse(localStorage.getItem('activePlan'));
const initialCigs = activePlan?.initialCigarettes || 22;
let totalSaved = 0;

for (let i = 0; i < 30; i++) {
  const date = new Date();
  date.setDate(date.getDate() - i);
  const dateStr = date.toISOString().split('T')[0];
  const checkinData = localStorage.getItem(`checkin_${dateStr}`);
  
  if (checkinData) {
    const data = JSON.parse(checkinData);
    const saved = Math.max(0, initialCigs - data.actualCigarettes);
    if (saved > 0) {
      totalSaved += saved;
      console.log(`${dateStr}: ${initialCigs} - ${data.actualCigarettes} = ${saved} điếu`);
    }
  }
}
console.log('Tổng số điếu đã tránh:', totalSaved);
```

#### **3. Milestone sức khỏe (Health Progress)**
- **Cũ**: Dựa trên số ngày từ startDate (có thể sai)
- **Mới**: Dựa trên số ngày thực tế có checkin

```javascript
// Kiểm tra milestone:
const healthMilestones = [
  { days: 1, title: '24 giờ đầu tiên' },
  { days: 2, title: '48 giờ' },
  { days: 3, title: '72 giờ' },
  { days: 7, title: '1 tuần' },
  { days: 14, title: '2 tuần' },
  { days: 30, title: '1 tháng' },
  { days: 90, title: '3 tháng' },
  { days: 365, title: '1 năm' }
];

const checkinDays = 5; // Số ngày có checkin thực tế
const achieved = healthMilestones.filter(m => checkinDays >= m.days).length;
const progress = Math.round((achieved / healthMilestones.length) * 100);
console.log(`Milestone: ${achieved}/${healthMilestones.length} (${progress}%)`);
```

### ❓ "Lập kế hoạch hôm nay (25/6) nhưng daily checkin hiển thị 3 ngày liên tiếp?"
**Nguyên nhân**: Có dữ liệu checkin cũ trong localStorage từ test trước

```javascript
// Kiểm tra dữ liệu checkin hiện tại:
for (let i = 0; i < 7; i++) {
  const date = new Date();
  date.setDate(date.getDate() - i);
  const dateStr = date.toISOString().split('T')[0];
  const data = localStorage.getItem(`checkin_${dateStr}`);
  if (data) {
    console.log(`${dateStr}:`, JSON.parse(data));
  }
}

// Xóa tất cả dữ liệu checkin cũ:
for (let i = 0; i < 30; i++) {
  const date = new Date();
  date.setDate(date.getDate() - i);
  const dateStr = date.toISOString().split('T')[0];
  localStorage.removeItem(`checkin_${dateStr}`);
}

// Hoặc xóa toàn bộ localStorage và bắt đầu lại:
localStorage.clear();
location.reload();
```

**Giải thích**: Daily checkin tính streak bằng cách đếm ngược từ hôm nay về trước để tìm dữ liệu checkin có kết quả tốt (actual ≤ target). Nếu có dữ liệu test cũ, nó sẽ tính vào streak.

**Khuyến nghị**: Khi test kế hoạch mới, nên clear localStorage trước để có kết quả chính xác.

### ❓ "Ngày 26/6 Daily Checkin có cập nhật biểu đồ không?"
**CÓ!** Hệ thống đã được thiết kế để tự động cập nhật:

```javascript
// Quy trình khi bạn Daily Checkin ngày 26/6:
// 1. DailyCheckin.jsx lưu dữ liệu vào localStorage với key "checkin_2025-06-26"
// 2. Gọi onProgressUpdate() để thông báo cho Progress.jsx
// 3. Progress.jsx load lại tất cả dữ liệu checkin từ ngày bắt đầu kế hoạch
// 4. Cập nhật state actualProgress
// 5. QuitProgressChart.jsx nhận actualProgress mới và vẽ lại biểu đồ

// Để kiểm tra dữ liệu checkin:
const date26 = '2025-06-26';
const checkinData = localStorage.getItem(`checkin_${date26}`);
if (checkinData) {
  console.log('Dữ liệu ngày 26/6:', JSON.parse(checkinData));
} else {
  console.log('Chưa có dữ liệu checkin cho ngày 26/6');
}

// Kiểm tra biểu đồ có cập nhật không bằng cách xem console:
// - "✅ Xác nhận ngày hôm nay (2025-06-26) có dữ liệu"
// - "Updated actual progress data" với array chứa ngày 26/6
```

**Kết quả mong đợi ngày 26/6:**
- ✅ Daily Checkin hiển thị ngày 26/6
- ✅ Biểu đồ có thêm điểm dữ liệu ngày 26/6 (đường xanh lá)
- ✅ Streak days tăng lên (nếu đạt target)
- ✅ Statistics dashboard cập nhật số liệu mới

### 🔍 Script Debug Toàn Diện

```javascript
// === SCRIPT KIỂM TRA TOÀN BỘ TÍNH TOÁN ===
console.log("=== BẮT ĐẦU KIỂM TRA TÍNH TOÁN ===");

// 1. Kiểm tra kế hoạch
const activePlan = JSON.parse(localStorage.getItem('activePlan') || '{}');
console.log("1. Kế hoạch hiện tại:", activePlan);
console.log("   - Ngày bắt đầu:", activePlan.startDate);
console.log("   - Số điếu ban đầu:", activePlan.initialCigarettes);
console.log("   - Giá gói thuốc:", activePlan.packPrice);

// 2. Đếm ngày có checkin thực tế
let actualCheckinDays = [];
let totalSavedCigarettes = 0;
const initialCigs = activePlan.initialCigarettes || 22;

for (let i = 0; i < 30; i++) {
  const date = new Date();
  date.setDate(date.getDate() - i);
  const dateStr = date.toISOString().split('T')[0];
  const checkinData = localStorage.getItem(`checkin_${dateStr}`);
  
  if (checkinData) {
    const data = JSON.parse(checkinData);
    const saved = Math.max(0, initialCigs - data.actualCigarettes);
    
    actualCheckinDays.push({
      date: dateStr,
      actual: data.actualCigarettes,
      target: data.targetCigarettes,
      saved: saved
    });
    
    if (saved > 0) totalSavedCigarettes += saved;
  }
}

// Sắp xếp theo ngày
actualCheckinDays.sort((a, b) => new Date(a.date) - new Date(b.date));

console.log("2. Ngày có checkin thực tế:", actualCheckinDays.length);
actualCheckinDays.forEach(day => {
  console.log(`   - ${day.date}: ${day.actual}/${day.target} (${day.saved} điếu tránh)`);
});

// 3. Tính toán thống kê
console.log("3. Thống kê tính toán:");
console.log("   - Ngày theo dõi:", actualCheckinDays.length);
console.log("   - Tổng điếu đã tránh:", totalSavedCigarettes);
console.log("   - Tiền tiết kiệm:", Math.round(totalSavedCigarettes * (activePlan.packPrice || 25000) / 20));

// 4. Milestone sức khỏe
const healthMilestones = [1, 2, 3, 7, 14, 30, 90, 365];
const achievedMilestones = healthMilestones.filter(m => actualCheckinDays.length >= m).length;
const healthProgress = Math.round((achievedMilestones / healthMilestones.length) * 100);
console.log("   - Milestone đã đạt:", `${achievedMilestones}/${healthMilestones.length} (${healthProgress}%)`);

// 5. Streak hiện tại
let currentStreak = 0;
const today = new Date();
for (let i = 0; i < actualCheckinDays.length; i++) {
  const checkDate = new Date(today);
  checkDate.setDate(checkDate.getDate() - i);
  const dateStr = checkDate.toISOString().split('T')[0];
  const checkinData = localStorage.getItem(`checkin_${dateStr}`);
  
  if (checkinData) {
    const data = JSON.parse(checkinData);
    if (data.actualCigarettes <= data.targetCigarettes) {
      currentStreak++;
    } else {
      break;
    }
  } else {
    break;
  }
}
console.log("   - Streak hiện tại:", currentStreak);

console.log("=== KẾT THÚC KIỂM TRA ===");
```

### 🧹 Script Reset Dữ Liệu Test

```javascript
// === RESET TẤT CẢ DỮ LIỆU TEST ===
console.log("Đang xóa tất cả dữ liệu test...");

// Xóa checkin data
for (let i = 0; i < 60; i++) {
  const date = new Date();
  date.setDate(date.getDate() - i);
  const dateStr = date.toISOString().split('T')[0];
  localStorage.removeItem(`checkin_${dateStr}`);
}

// Xóa các dữ liệu khác
localStorage.removeItem('activePlan');
localStorage.removeItem('dashboardStats');
localStorage.removeItem('quitPlanCompletion');

console.log("✅ Đã xóa tất cả dữ liệu test");
console.log("🔄 Reload trang để bắt đầu lại...");
location.reload();
```

### ❓ "Ngày theo dõi đang được tính sai, số điếu thuốc đã tránh sai, milestone sai?"
**✅ ĐÃ KHẮC PHỤC**: Logic tính toán đã được sửa

**Vấn đề trước:**
- Ngày theo dõi = số lần checkin thay vì số ngày từ bắt đầu kế hoạch
- Số điếu tránh được tính cả khi không giảm 
- Milestone dựa trên ngày checkin đầu tiên thay vì ngày bắt đầu kế hoạch

**Logic mới đã sửa:**
```javascript
// 1. Ngày theo dõi = số ngày từ startDate đến hôm nay
const startDate = new Date(activePlan.startDate);
const today = new Date();
const noSmokingDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;

// 2. Số điếu tránh CHỈ tính khi thực sự giảm được
actualProgress.forEach(dayRecord => {
  const daySaved = Math.max(0, initialCigarettes - dayRecord.actualCigarettes);
  if (daySaved > 0) { // CHỈ cộng khi tránh được
    totalSavedCigarettes += daySaved;
  }
});

// 3. Milestone dựa trên noSmokingDays (từ ngày bắt đầu kế hoạch)
const achievedMilestones = healthMilestones.filter(m => noSmokingDays >= m.days).length;
```

**Kết quả sau khi sửa:**
- Ngày theo dõi chính xác (nếu bắt đầu 25/6, ngày 26/6 sẽ hiển thị "2 ngày")
- Số điếu tránh chỉ tính những ngày thực sự giảm được
- Milestone tính từ ngày bắt đầu kế hoạch thực tế
