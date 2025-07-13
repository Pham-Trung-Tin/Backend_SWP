# Test Plan - Kiểm tra vấn đề Role Persistence

## Các thay đổi đã thực hiện:
1. ✅ Sửa `Login.jsx` - xóa useEffect auto-redirect  
2. ✅ Sửa `Login.jsx` - redirect về home `/` thay vì `/profile` sau login
3. ✅ Sửa `LoginModal.jsx` - redirect về home `/` thay vì `/profile` sau login

## Test Steps:

### Test 1: User thường
1. Đăng ký tài khoản mới hoặc login user thường
2. Ở trang home `/`
3. Reload trang (F5)
4. **Expected**: Vẫn ở trang home, không redirect đâu cả

### Test 2: Coach user ở trang khác
1. Login với coach: `coach1@nosmoke.com` / `coach123`  
2. **Expected**: Sau login redirect về home `/` (không phải profile)
3. Navigate đến trang bất kỳ như `/profile`, `/membership`
4. Reload trang (F5)
5. **Expected**: Vẫn ở trang hiện tại, không auto chuyển về `/coach`

### Test 3: Coach access qua dropdown
1. Login với coach account
2. Click dropdown menu trong header
3. Click "Dashboard" 
4. **Expected**: Chuyển đến `/coach`
5. Reload trang
6. **Expected**: Vẫn ở `/coach`, không redirect

## Current Issues to Check:
- [ ] Reload có bị redirect về coach interface không?
- [ ] Login redirect về home thay vì profile chưa?
- [ ] Coach access qua dropdown có hoạt động không?

## Files đã sửa:
- `src/page/Login.jsx` 
- `src/components/LoginModal.jsx`
