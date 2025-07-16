# CORS Configuration Fix

## Vấn đề

Lỗi CORS khi thực hiện yêu cầu PATCH từ frontend (http://localhost:5175) đến backend (http://localhost:5000):

```
Access to fetch at 'http://localhost:5000/api/appointments/148/status' from origin 'http://localhost:5175' 
has been blocked by CORS policy:
Method PATCH is not allowed by Access-Control-Allow-Methods in preflight response.
```

## Nguyên nhân

Mặc dù phương thức PATCH đã được thêm vào danh sách các phương thức được chấp nhận trong cấu hình CORS chính, nhưng có thể có vấn đề với việc xử lý các yêu cầu preflight OPTIONS trước khi thực hiện yêu cầu PATCH thực tế.

## Giải pháp

### 1. Thêm middleware xử lý preflight OPTIONS cho tất cả các endpoint

```javascript
// Add specific CORS headers for preflight requests
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.status(200).end();
});
```

### 2. Thêm middleware đặc biệt cho endpoint cập nhật trạng thái

```javascript
// Special CORS handling for appointments status endpoint
app.options('/api/appointments/:id/status', (req, res) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.status(200).end();
});
```

### 3. Cập nhật cấu hình fetch trong client

```javascript
const options = api.addAuthHeader({
  method: 'PATCH',
  body: JSON.stringify({ status }),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  mode: 'cors',
  credentials: 'include'
});
```

## Tác động của thay đổi

- Đảm bảo server đúng cách phản hồi các yêu cầu preflight OPTIONS từ trình duyệt
- Cho phép phương thức PATCH được sử dụng từ frontend đến backend
- Cấu hình CORS đầy đủ để tránh các lỗi liên quan đến giao tiếp cross-origin

## Kiểm tra sau khi sửa

- Kiểm tra xem yêu cầu PATCH có hoạt động để cập nhật trạng thái cuộc hẹn không
- Xác nhận không còn lỗi CORS trong console
- Xác nhận coach có thể xác nhận/từ chối cuộc hẹn
