# Hướng dẫn Debug Statistics và Tính toán

## ⚠️ Vấn đề đã được sửa

Đã cập nhật logic tính toán trong `Progress.jsx` và `DailyCheckin.jsx` để khắc phục các vấn đề:

1. **Ngày theo dõi sai**: Đã sửa để chỉ tính các ngày thực tế có checkin
2. **Số điếu đã tránh sai**: Đã sửa logic tính tích lũy chính xác  
3. **Milestone sai**: Đã sửa để dựa trên số ngày checkin thực tế

## 🔍 Cách kiểm tra sau khi sửa

### 1. Test Scenario Đơn giản

1. **Clear dữ liệu cũ**:
```javascript
localStorage.clear();
location.reload();
```

2. **Tạo kế hoạch mới**:
   - Vào `/journey` 
   - Nhập: 20 điếu/ngày, 25000đ/gói
   - Lập kế hoạch 7 tuần

3. **Daily checkin ngày đầu**:
   - Vào `/progress`
   - Checkin: 18 điếu (giảm 2 điếu)
   - Kiểm tra thống kê:
     - Ngày theo dõi: 1
     - Điếu đã tránh: 2
     - Milestone: 1/8 (12.5%)

4. **Checkin ngày thứ 2** (fake date):
```javascript
// Tạo dữ liệu ngày hôm qua
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const dateStr = yesterday.toISOString().split('T')[0];

localStorage.setItem(`checkin_${dateStr}`, JSON.stringify({
  date: dateStr,
  actualCigarettes: 17,
  targetCigarettes: 18,
  notes: 'Test ngày hôm qua'
}));

// Reload trang và kiểm tra
location.reload();
```

### 2. Script Debug Toàn Diện

```javascript
// Paste script này vào Console để debug
function debugStatistics() {
  console.log("=== STATISTICS DEBUG ===");
  
  // Kiểm tra kế hoạch
  const activePlan = JSON.parse(localStorage.getItem('activePlan') || '{}');
  console.log("📋 Kế hoạch:", {
    startDate: activePlan.startDate,
    initialCigarettes: activePlan.initialCigarettes,
    packPrice: activePlan.packPrice
  });
  
  // Tìm tất cả ngày có checkin
  const checkinDays = [];
  const today = new Date();
  
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    const data = localStorage.getItem(`checkin_${dateStr}`);
    
    if (data) {
      const parsed = JSON.parse(data);
      checkinDays.push({
        date: dateStr,
        actual: parsed.actualCigarettes,
        target: parsed.targetCigarettes,
        saved: Math.max(0, (activePlan.initialCigarettes || 20) - parsed.actualCigarettes)
      });
    }
  }
  
  // Sắp xếp theo thời gian
  checkinDays.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  console.log("📅 Ngày có checkin:", checkinDays.length);
  checkinDays.forEach(day => {
    console.log(`  ${day.date}: ${day.actual}/${day.target} (tránh ${day.saved})`);
  });
  
  // Tính toán
  const totalSaved = checkinDays.reduce((sum, day) => sum + day.saved, 0);
  const savedMoney = totalSaved * ((activePlan.packPrice || 25000) / 20);
  
  console.log("📊 Kết quả tính toán:");
  console.log(`  Ngày theo dõi: ${checkinDays.length}`);
  console.log(`  Điếu đã tránh: ${totalSaved}`);
  console.log(`  Tiền tiết kiệm: ${Math.round(savedMoney).toLocaleString()}đ`);
  
  // Milestone
  const milestones = [1, 2, 3, 7, 14, 30, 90, 365];
  const achieved = milestones.filter(m => checkinDays.length >= m).length;
  console.log(`  Milestone: ${achieved}/${milestones.length} (${Math.round(achieved/milestones.length*100)}%)`);
  
  console.log("=== END DEBUG ===");
}

// Chạy debug
debugStatistics();
```

### 3. Test Case Specific

#### Test Case 1: Ngày đầu tiên
```javascript
// Setup
localStorage.clear();
localStorage.setItem('activePlan', JSON.stringify({
  startDate: '2025-06-25',
  initialCigarettes: 20,
  packPrice: 25000,
  weeks: [
    {week: 1, amount: 18}
  ]
}));

// Checkin ngày đầu
const today = new Date().toISOString().split('T')[0];
localStorage.setItem(`checkin_${today}`, JSON.stringify({
  date: today,
  actualCigarettes: 18,
  targetCigarettes: 18,
  notes: 'Ngày đầu tiên'
}));

// Mong đợi:
// - Ngày theo dõi: 1
// - Điếu tránh: 2 (20-18)
// - Milestone: 1/8 (12.5%)
```

#### Test Case 2: Một tuần
```javascript
// Tạo dữ liệu 7 ngày
const plan = {
  startDate: '2025-06-19', // 7 ngày trước
  initialCigarettes: 20,
  packPrice: 25000
};

localStorage.setItem('activePlan', JSON.stringify(plan));

// Tạo 7 ngày checkin
for (let i = 0; i < 7; i++) {
  const date = new Date();
  date.setDate(date.getDate() - (6-i)); // Từ 6 ngày trước đến hôm nay
  const dateStr = date.toISOString().split('T')[0];
  
  localStorage.setItem(`checkin_${dateStr}`, JSON.stringify({
    date: dateStr,
    actualCigarettes: 18 - i, // Giảm dần
    targetCigarettes: 18,
    notes: `Ngày ${i+1}`
  }));
}

// Mong đợi:
// - Ngày theo dõi: 7
// - Điếu tránh: 2+3+4+5+6+7+8 = 35
// - Milestone: 4/8 (50%) - đạt 1,2,3,7 ngày
```

## 🐞 Common Issues

### Issue 1: Thống kê không cập nhật
**Nguyên nhân**: Cache trong localStorage
**Giải pháp**:
```javascript
localStorage.removeItem('dashboardStats');
location.reload();
```

### Issue 2: Streak không đúng
**Nguyên nhân**: Dữ liệu checkin cũ
**Giải pháp**: Xóa dữ liệu cũ trước khi test

### Issue 3: Milestone không tăng
**Nguyên nhân**: Logic dựa trên ngày từ startDate thay vì số ngày checkin
**Giải pháp**: Đã sửa trong code mới

## ✅ Verification Checklist

- [ ] Ngày theo dõi = số ngày có checkin thực tế
- [ ] Điếu tránh = tổng (initial - actual) cho tất cả ngày > 0
- [ ] Tiền tiết kiệm = điếu tránh * (giá gói / 20)
- [ ] Milestone dựa trên số ngày checkin, không phải startDate
- [ ] Streak tính đúng từ hôm nay về trước
- [ ] Biểu đồ hiển thị đúng dữ liệu actualProgress

## 🎯 Expected Results

Sau khi sửa, với kế hoạch 20 điếu ban đầu và checkin 1 ngày 18 điếu:
- ✅ Ngày theo dõi: 1
- ✅ Điếu đã tránh: 2 
- ✅ Tiền tiết kiệm: 2,500đ (2 * 25000/20)
- ✅ Milestone: 1/8 (12.5%)
- ✅ Streak: 1 (nếu 18 ≤ 18)
