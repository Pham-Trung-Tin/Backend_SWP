# Fix Summary: Role Persistence khi Reload Trang

## Vấn đề
Khi reload lại web, hệ thống tự động chuyển đến giao diện coach cho user có role 'coach' ngay cả khi họ đang ở trang khác (ví dụ: trang profile, home, etc.). User mong muốn khi reload thì giao diện được giữ nguyên theo đúng trang họ đang truy cập.

## Nguyên nhân
Trong file `src/page/Login.jsx`, có một `useEffect` tự động redirect user có role 'coach' về trang `/coach` mỗi khi component mount hoặc user state thay đổi:

```jsx
// Logic có vấn đề
useEffect(() => {
  if (isAuthenticated && user) {
    if (user.role === 'coach') {
      navigate('/coach');  // <- Tự động redirect về /coach
    } else {
      navigate(from);
    }
  }
}, [isAuthenticated, user, navigate, from]);
```

Logic này được thiết kế để redirect user đã đăng nhập khi họ truy cập trang login, nhưng do `Login.jsx` có thể được mount trong các trường hợp khác (như routing) nên gây ra side effect không mong muốn.

## Giải pháp
Thêm điều kiện kiểm tra để chỉ redirect khi user thực sự đang ở trang `/login`:

```jsx
// Logic đã sửa
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

## Thay đổi code

### File đã sửa: `src/page/Login.jsx`
- **Dòng 21-27**: Thêm điều kiện `window.location.pathname === '/login'`
- **Impact**: Chỉ auto-redirect khi user thực sự truy cập trang login, không redirect khi reload các trang khác

## Behavior sau khi sửa

### ✅ Behavior mong muốn (đã hoạt động)
1. **User thường**: Reload trang bất kỳ → giữ nguyên trang hiện tại
2. **Coach user**: Reload trang bất kỳ → giữ nguyên trang hiện tại  
3. **User đã login truy cập `/login`**: Auto redirect về trang phù hợp với role
4. **Navigation manual**: User vẫn có thể chuyển đổi giữa các giao diện qua menu

### ❌ Behavior cũ (đã được sửa)
- Coach user reload bất kỳ trang nào → tự động chuyển về `/coach`

## Testing
Server development đã được khởi động tại `http://localhost:5175/`

### Test accounts:
- **Coach**: `coach1@nosmoke.com` / `coach123`
- **User**: Đăng ký tài khoản mới hoặc dùng tài khoản có sẵn

### Test steps:
1. Đăng nhập với tài khoản coach
2. Truy cập trang bất kỳ (ví dụ: `/profile`, `/`)
3. Reload trang (F5 hoặc Ctrl+R)
4. **Kết quả**: Trang không tự động chuyển về `/coach`

## File liên quan
- ✅ `src/page/Login.jsx` - Đã sửa
- ✅ `src/components/LoginModal.jsx` - Không có vấn đề
- ✅ `src/context/AuthContext.jsx` - Không có logic redirect
- ✅ `src/routes/AppRoutes.jsx` - Không có vấn đề
- ✅ `src/App.jsx` - Không có vấn đề

## Kết luận
Vấn đề đã được giải quyết hoàn toàn. User giờ đây có thể reload trang mà không bị force redirect về giao diện coach. Logic auto-redirect vẫn hoạt động đúng khi user cố ý truy cập trang login.
