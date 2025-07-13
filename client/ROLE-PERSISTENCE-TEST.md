# Test Script - Role Persistence khi reload

## Vấn đề đã sửa
- **Vấn đề**: Khi reload trang, user với role 'coach' tự động bị redirect về giao diện coach dù đang ở trang khác
- **Nguyên nhân**: Logic trong `Login.jsx` tự động redirect mọi user có role 'coach' về `/coach` khi component mount
- **Giải pháp**: Thêm điều kiện kiểm tra `window.location.pathname === '/login'` để chỉ redirect khi user thực sự truy cập trang login

## Các thay đổi đã thực hiện

### 1. Sửa file `src/page/Login.jsx`
```jsx
// TRƯỚC (có vấn đề):
useEffect(() => {
  if (isAuthenticated && user) {
    if (user.role === 'coach') {
      navigate('/coach');
    } else {
      navigate(from);
    }
  }
}, [isAuthenticated, user, navigate, from]);

// SAU (đã sửa):
useEffect(() => {
  if (isAuthenticated && user && window.location.pathname === '/login') {
    if (user.role === 'coach') {
      navigate('/coach');
    } else {
      navigate(from);
    }
  }
}, [isAuthenticated, user, navigate, from]);
```

## Test Cases để verify

### Test 1: User thường (role: 'user')
1. Đăng nhập với tài khoản user thường
2. Truy cập trang `/profile`
3. Reload trang
4. **Kết quả mong đợi**: Vẫn ở trang `/profile`, không bị redirect

### Test 2: Coach user ở trang user
1. Đăng nhập với tài khoản coach (coach1@nosmoke.com / coach123)
2. Truy cập trang `/profile` hoặc `/`
3. Reload trang
4. **Kết quả mong đợi**: Vẫn ở trang hiện tại, không tự động chuyển về `/coach`

### Test 3: Coach user truy cập trang login
1. Đăng nhập với tài khoản coach
2. Truy cập trực tiếp `/login`
3. **Kết quả mong đợi**: Tự động redirect về `/coach` (behavior mong muốn)

### Test 4: User thường truy cập trang login
1. Đăng nhập với tài khoản user
2. Truy cập trực tiếp `/login`
3. **Kết quả mong đợi**: Tự động redirect về `/profile`

### Test 5: Navigation giữa các role
1. Đăng nhập với tài khoản coach
2. Truy cập giao diện coach qua dropdown menu trong header
3. Reload trang
4. **Kết quả mong đợi**: Vẫn ở giao diện coach

## Accounts để test
- **Coach**: coach1@nosmoke.com / coach123
- **User**: user@example.com / user123 (hoặc đăng ký tài khoản mới)

## Checklist
- [ ] Test 1 passed
- [ ] Test 2 passed  
- [ ] Test 3 passed
- [ ] Test 4 passed
- [ ] Test 5 passed

## Notes
- Logic này chỉ ảnh hưởng đến việc auto-redirect khi reload
- User vẫn có thể chuyển đổi giữa các giao diện thông qua navigation menu
- Giao diện coach vẫn được bảo vệ bởi `RoleBasedRoute` và các component protection khác
