// Mock Data Script - Chạy trong Browser Console
// Paste script này vào Console của http://localhost:5176 để tạo mock booking data

// Mock booking data cho Coach A (ID = 1)
const mockBookings = [
  {
    id: 123456,
    userId: "user123",
    userName: "Hồ Minh Nghĩa", 
    userEmail: "nghia@email.com",
    coachId: 1,
    coachName: "Nguyên Văn A",
    coachAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
    coachRole: "Coach cai thuốc chuyên nghiệp",
    date: "2025-06-26T10:00:00.000Z",
    time: "10:00",
    status: "confirmed",
    completed: false,
    createdAt: "2025-06-25T08:30:00.000Z"
  },
  {
    id: 123457,
    userId: "user456", 
    userName: "Nguyễn Thị Mai",
    userEmail: "mai@email.com", 
    coachId: 1,
    coachName: "Nguyên Văn A",
    coachAvatar: "https://randomuser.me/api/portraits/men/32.jpg", 
    coachRole: "Coach cai thuốc chuyên nghiệp",
    date: "2025-06-27T14:30:00.000Z",
    time: "14:30", 
    status: "confirmed",
    completed: false,
    createdAt: "2025-06-25T09:15:00.000Z"
  },
  {
    id: 123458,
    userId: "user789",
    userName: "Trần Văn Nam", 
    userEmail: "nam@email.com",
    coachId: 1, 
    coachName: "Nguyên Văn A",
    coachAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
    coachRole: "Coach cai thuốc chuyên nghiệp", 
    date: "2025-06-24T16:00:00.000Z",
    time: "16:00",
    status: "completed", 
    completed: true,
    createdAt: "2025-06-23T10:00:00.000Z"
  }
];

// Lưu vào localStorage
localStorage.setItem('appointments', JSON.stringify(mockBookings));
console.log('✅ Đã tạo mock booking data cho Coach A!');
console.log('📅 Bookings:', mockBookings.length);
console.log('👤 Clients: Hồ Minh Nghĩa, Nguyễn Thị Mai, Trần Văn Nam');

// Refresh page để thấy data
window.location.reload();
