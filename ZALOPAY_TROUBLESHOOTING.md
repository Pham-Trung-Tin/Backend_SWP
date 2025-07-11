# Khắc phục vấn đề thanh toán ZaloPay "pending"

## Vấn đề

Khi người dùng thanh toán thành công trên ZaloPay nhưng trạng thái trong hệ thống vẫn là "pending" thay vì "completed".

## Nguyên nhân

1. **ZaloPay callback không thể gọi về server**: Do server đang chạy trên `localhost`, ZaloPay không thể gửi callback notification về.
2. **Lỗi mạng**: Callback có thể thất bại do vấn đề kết nối mạng.
3. **Lỗi xử lý callback**: Có thể có lỗi trong quá trình xử lý callback data.

## Giải pháp đã implement

### 1. Cải thiện logic kiểm tra trạng thái tự động
- Frontend tự động kiểm tra trạng thái khi user quay lại trang PaymentSuccess
- Gọi API ZaloPay để verify trạng thái thanh toán
- Tự động cập nhật database nếu thanh toán thành công

### 2. API endpoints mới

#### Get payment by transaction ID
```
GET /api/payments/transaction/:transactionId
```
Lấy thông tin payment từ database theo transaction ID.

#### Manual update payment status
```
POST /api/payments/zalopay/manual-update/:transactionId
```
Cập nhật thủ công trạng thái thanh toán:
1. Kiểm tra trạng thái từ ZaloPay API
2. Nếu ZaloPay confirm thành công, cập nhật database
3. Cập nhật membership cho user

### 3. Improved callback processing
- Thêm logging chi tiết
- Kiểm tra trạng thái trước khi cập nhật
- Error handling tốt hơn

### 4. Frontend improvements
- Loading state khi kiểm tra trạng thái
- Nút "Cập nhật trạng thái thanh toán" cho user
- Thông báo chi tiết về trạng thái xử lý

## Cách sử dụng

### Tự động (Recommended)
1. User thanh toán trên ZaloPay
2. User được redirect về trang PaymentSuccess
3. Frontend tự động kiểm tra trạng thái và cập nhật

### Thủ công (Backup)
1. Nếu trạng thái vẫn pending, user click "Cập nhật trạng thái thanh toán"
2. System sẽ verify với ZaloPay và cập nhật

### Admin/Developer
Sử dụng test script:
```bash
node test-zalopay-apis.js
```

## Logs để debug

### Server logs
```bash
# Callback received
=== ZaloPay Callback Received ===

# Manual update
=== Manual Update Requested ===

# Status check
📡 Querying ZaloPay API for transaction status...
```

### Frontend logs
```javascript
// Check trong browser console
console.log('ZaloPay xác nhận thanh toán thành công');
console.log('Tiến hành cập nhật thủ công trạng thái thanh toán');
```

## Troubleshooting

### Vấn đề: Callback không được gọi
**Giải pháp**: System sẽ tự động kiểm tra khi user quay lại trang PaymentSuccess

### Vấn đề: Manual update không hoạt động
**Kiểm tra**:
1. Transaction ID có đúng không
2. User có permission không
3. ZaloPay API có trả về success không

### Vấn đề: Membership không được cập nhật
**Kiểm tra**: 
1. Function `Membership.purchasePackage()` có lỗi không
2. Database connection có ổn không
3. Package ID có tồn tại không

## Database queries để check

```sql
-- Kiểm tra payments pending
SELECT * FROM payments WHERE payment_status = 'pending' ORDER BY created_at DESC;

-- Kiểm tra transactions
SELECT * FROM payment_transactions WHERE status = 'pending' ORDER BY created_at DESC;

-- Kiểm tra user membership
SELECT u.id, u.email, u.membership, u.membershipType, um.membership_id 
FROM users u 
LEFT JOIN user_memberships um ON u.id = um.user_id 
WHERE u.id = [USER_ID];
```

## Production deployment notes

Để hoạt động đúng trên production:
1. Set `API_BASE_URL` environment variable
2. Đảm bảo callback URL accessible từ internet
3. Setup proper HTTPS
4. Configure firewall cho ZaloPay IPs

## Testing

1. Thực hiện thanh toán test
2. Check database status
3. Test manual update API
4. Verify membership được cập nhật đúng
