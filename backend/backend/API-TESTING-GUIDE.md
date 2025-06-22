# API Testing Guide - Quit Smoking MySQL Backend

## Khởi động server

```bash
cd backend
npm run api
```

Server sẽ chạy tại: http://localhost:5000

## API Endpoints

### 1. Health Check

- **GET** `/health`
- **Mô tả**: Kiểm tra trạng thái server và database
- **Response**:

```json
{
  "success": true,
  "message": "Server is running",
  "database": "MySQL connected",
  "timestamp": "2025-06-19T10:00:00.000Z"
}
```

### 2. API Documentation

- **GET** `/api`
- **Mô tả**: Xem danh sách tất cả endpoint có sẵn

### 3. Authentication APIs

#### Đăng ký

- **POST** `/api/auth/register`
- **Body**:

```json
{
  "name": "Nguyễn Văn A",
  "email": "user@example.com",
  "password": "123456",
  "cigarettesPerDay": 20,
  "costPerPack": 25000,
  "cigarettesPerPack": 20
}
```

#### Đăng nhập

- **POST** `/api/auth/login`
- **Body**:

```json
{
  "email": "admin@nosmoke.com",
  "password": "12345"
}
```

#### Lấy thông tin user hiện tại

- **GET** `/api/auth/me`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`

### 4. Plans APIs

#### Lấy tất cả plans

- **GET** `/api/plans`

#### Lấy plan theo ID

- **GET** `/api/plans/:id`

#### Tạo plan mới

- **POST** `/api/plans`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Body**:

```json
{
  "userID": 1,
  "title": "Kế hoạch cai thuốc 30 ngày",
  "startDate": "2025-06-19",
  "targetDate": "2025-07-19",
  "cigarettesPerDay": 20,
  "costPerPack": 25000,
  "cigarettesPerPack": 20
}
```

#### Cập nhật plan

- **PUT** `/api/plans/:id`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Body**:

```json
{
  "title": "Kế hoạch cai thuốc 60 ngày",
  "status": "active"
}
```

#### Xóa plan

- **DELETE** `/api/plans/:id`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`

### 5. Progress APIs

#### Lấy tất cả progress

- **GET** `/api/progress`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`

#### Lấy progress theo user ID

- **GET** `/api/progress/user/:userId`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`

#### Tạo progress mới

- **POST** `/api/progress`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Body**:

```json
{
  "planID": 1,
  "userID": 1,
  "trackingDate": "2025-06-19",
  "cigarettesSmoked": 5,
  "moneySaved": 15000,
  "healthImprovements": "Hơi thở dễ chịu hơn",
  "mood": "good",
  "cravings": 3
}
```

#### Cập nhật progress

- **PUT** `/api/progress/:id`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Body**:

```json
{
  "cigarettesSmoked": 3,
  "mood": "great",
  "cravings": 2
}
```

#### Xóa progress

- **DELETE** `/api/progress/:id`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`

### 6. Users APIs

#### Lấy tất cả users

- **GET** `/api/users`

#### Lấy user theo ID

- **GET** `/api/users/:id`

#### Cập nhật user

- **PUT** `/api/users/:id`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Body**:

```json
{
  "name": "Tên mới",
  "email": "email_moi@example.com",
  "membership": "premium"
}
```

## Testing với Curl

### 1. Health Check

```bash
curl http://localhost:5000/health
```

### 2. Đăng nhập

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@nosmoke.com",
    "password": "12345"
  }'
```

### 3. Lấy danh sách plans

```bash
curl http://localhost:5000/api/plans
```

### 4. Tạo plan mới (cần JWT token)

```bash
curl -X POST http://localhost:5000/api/plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userID": 1,
    "title": "Kế hoạch cai thuốc 30 ngày",
    "startDate": "2025-06-19",
    "targetDate": "2025-07-19",
    "cigarettesPerDay": 20,
    "costPerPack": 25000
  }'
```

## Testing với PowerShell

### 1. Health Check

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/health" -Method GET
```

### 2. Đăng nhập

```powershell
$loginData = @{
    email = "admin@nosmoke.com"
    password = "12345"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
```

### 3. Lấy danh sách plans

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/plans" -Method GET
```

## Lưu ý quan trọng

1. **JWT Token**: Sau khi đăng nhập thành công, bạn sẽ nhận được JWT token. Sử dụng token này trong header `Authorization: Bearer <token>` cho các API cần authentication.

2. **Database**: Đảm bảo MySQL đang chạy và database `SmokingCessationDB` đã được tạo với các bảng cần thiết.

3. **CORS**: Server đã được cấu hình CORS để có thể gọi từ frontend.

4. **Rate Limiting**: Có giới hạn 100 requests/15 phút cho mỗi IP.

5. **Error Handling**: Tất cả API đều trả về format JSON với `success: true/false`.

## Test với file HTML

Mở file `test-api.html` trong browser để test giao diện:

```
file:///path/to/backend/test-api.html
```
