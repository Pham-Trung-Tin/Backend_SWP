// Công cụ kiểm tra luồng đặt lịch hẹn và quyền hạn người dùng
// Để sử dụng, import và gọi hàm trong console hoặc tích hợp vào UI kiểm thử

/**
 * Kiểm tra quyền hạn đặt lịch hẹn dựa trên gói thành viên
 * @param {string} userMembership - Gói thành viên của người dùng ('free', 'premium', 'pro')
 * @returns {object} - Kết quả kiểm tra bao gồm quyền truy cập và thông báo
 */
export function testBookingAccess(userMembership = 'free') {
  const MEMBERSHIP_LEVELS = ['free', 'premium', 'pro'];
  const requiredMembership = 'premium';
  
  const userLevel = MEMBERSHIP_LEVELS.indexOf(userMembership);
  const requiredLevel = MEMBERSHIP_LEVELS.indexOf(requiredMembership);
  
  const hasAccess = userLevel >= requiredLevel;
  
  console.log('========= KIỂM TRA QUYỀN ĐẶT LỊCH HẸN =========');
  console.log(`Gói thành viên hiện tại: ${userMembership.toUpperCase()}`);
  console.log(`Yêu cầu tối thiểu: ${requiredMembership.toUpperCase()}`);
  console.log(`Có quyền truy cập: ${hasAccess ? 'CÓ ✓' : 'KHÔNG ✗'}`);
  
  if (hasAccess) {
    console.log('✅ Người dùng có thể đặt lịch hẹn với Coach');
  } else {
    console.log('❌ Người dùng cần nâng cấp lên gói Premium hoặc Pro để đặt lịch hẹn');
  }
  
  return {
    userMembership,
    requiredMembership,
    hasAccess,
    message: hasAccess 
      ? 'Người dùng có quyền đặt lịch hẹn'
      : 'Người dùng không có quyền đặt lịch hẹn, cần nâng cấp gói thành viên'
  };
}

/**
 * Kiểm tra quyền sử dụng chat với Coach sau khi đã đặt lịch hẹn
 * @param {boolean} hasAppointment - Người dùng có lịch hẹn không
 * @param {string} appointmentStatus - Trạng thái lịch hẹn ('confirmed', 'completed', 'cancelled', 'pending')
 * @returns {object} - Kết quả kiểm tra bao gồm quyền truy cập và thông báo
 */
export function testChatAccess(hasAppointment = false, appointmentStatus = 'confirmed') {
  const validStatuses = ['confirmed', 'completed'];
  const canChat = hasAppointment && validStatuses.includes(appointmentStatus);
  
  console.log('========= KIỂM TRA QUYỀN CHAT VỚI COACH =========');
  console.log(`Có lịch hẹn: ${hasAppointment ? 'CÓ ✓' : 'KHÔNG ✗'}`);
  if (hasAppointment) {
    console.log(`Trạng thái lịch hẹn: ${appointmentStatus.toUpperCase()}`);
  }
  console.log(`Có thể chat: ${canChat ? 'CÓ ✓' : 'KHÔNG ✗'}`);
  
  if (canChat) {
    console.log('✅ Người dùng có thể chat với Coach dựa trên lịch hẹn đã tạo');
  } else if (!hasAppointment) {
    console.log('❌ Người dùng cần đặt lịch hẹn trước khi có thể chat với Coach');
  } else {
    console.log(`❌ Không thể chat với Coach vì trạng thái lịch hẹn là "${appointmentStatus}"`);
  }
  
  return {
    hasAppointment,
    appointmentStatus,
    canChat,
    message: canChat 
      ? 'Người dùng có quyền chat với Coach'
      : 'Người dùng không có quyền chat với Coach'
  };
}

/**
 * Chạy kiểm tra toàn diện cho cả hai luồng: đặt lịch và chat
 */
export function runFullTest() {
  console.log('======================================================');
  console.log('        KIỂM TRA LUỒNG ĐẶT LỊCH & CHAT COACH         ');
  console.log('======================================================');
  
  // Kiểm tra từng gói thành viên
  const memberships = ['free', 'premium', 'pro'];
  
  memberships.forEach(membership => {
    const bookingResult = testBookingAccess(membership);
    console.log('\n------------------------------------------------------\n');
    
    // Nếu có quyền đặt lịch, kiểm tra các trường hợp chat
    if (bookingResult.hasAccess) {
      const statuses = ['confirmed', 'completed', 'cancelled', 'pending'];
      statuses.forEach(status => {
        testChatAccess(true, status);
        console.log('\n');
      });
    } else {
      // Trường hợp không có quyền đặt lịch
      testChatAccess(false);
      console.log('\n');
    }
  });
  
  console.log('======================================================');
  console.log('            KẾT THÚC KIỂM TRA                        ');
  console.log('======================================================');
}

// Hàm tiện ích để thử nghiệm thủ công
export function testUser(membership = 'free', hasAppointment = false, appointmentStatus = 'confirmed') {
  testBookingAccess(membership);
  console.log('\n------------------------------------------------------\n');
  testChatAccess(hasAppointment, appointmentStatus);
}
