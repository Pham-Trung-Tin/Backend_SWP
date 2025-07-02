// Kiểm tra thông tin user trong localStorage
try {
  // Lấy thông tin user hiện tại
  const currentUser = JSON.parse(localStorage.getItem('nosmoke_user'));
  
  if (currentUser) {
    console.log('=== THÔNG TIN USER HIỆN TẠI ===');
    console.log('ID:', currentUser.id);
    console.log('Email:', currentUser.email);
    console.log('Tên:', currentUser.fullName || currentUser.name);
    console.log('Membership:', currentUser.membership || 'free (mặc định)');
    
    // Nếu không có trường membership, thêm nó vào
    if (!currentUser.membership) {
      console.log('Thêm trường membership (mặc định: free)');
      currentUser.membership = 'free';
      localStorage.setItem('nosmoke_user', JSON.stringify(currentUser));
    }
  } else {
    console.log('Không tìm thấy thông tin user đã đăng nhập');
  }
} catch (error) {
  console.error('Lỗi khi kiểm tra thông tin user:', error);
}

// Kiểm tra danh sách users trong localStorage
try {
  const users = JSON.parse(localStorage.getItem('nosmoke_users')) || [];
  console.log('=== THÔNG TIN TẤT CẢ USERS ===');
  console.log('Tổng số users:', users.length);
  
  // Kiểm tra xem mỗi user có trường membership chưa
  const usersWithoutMembership = users.filter(user => !user.membership);
  if (usersWithoutMembership.length > 0) {
    console.log(`Có ${usersWithoutMembership.length} user chưa có trường membership`);
    
    // Thêm trường membership cho những user này
    const updatedUsers = users.map(user => ({
      ...user,
      membership: user.membership || 'free'
    }));
    
    // Lưu lại danh sách đã cập nhật
    localStorage.setItem('nosmoke_users', JSON.stringify(updatedUsers));
    console.log('Đã cập nhật membership cho tất cả users');
  }
} catch (error) {
  console.error('Lỗi khi kiểm tra danh sách users:', error);
}

// Nâng cấp user lên Premium hoặc Pro để kiểm tra
/* 
// Bỏ comment đoạn này để nâng cấp user hiện tại lên Premium hoặc Pro
try {
  const currentUser = JSON.parse(localStorage.getItem('nosmoke_user'));
  if (currentUser) {
    // Thay 'premium' bằng 'pro' nếu muốn nâng lên Pro
    currentUser.membership = 'premium';
    localStorage.setItem('nosmoke_user', JSON.stringify(currentUser));
    
    // Cập nhật trong danh sách users
    const users = JSON.parse(localStorage.getItem('nosmoke_users')) || [];
    const updatedUsers = users.map(user => {
      if (user.id === currentUser.id) {
        return { ...user, membership: currentUser.membership };
      }
      return user;
    });
    
    localStorage.setItem('nosmoke_users', JSON.stringify(updatedUsers));
    console.log('Đã nâng cấp user lên', currentUser.membership);
  }
} catch (error) {
  console.error('Lỗi khi nâng cấp user:', error);
}
*/
