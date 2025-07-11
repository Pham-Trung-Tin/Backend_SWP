# Test manual update PowerShell script
$BASE_URL = "http://localhost:5000"
$TRANSACTION_ID = "250711_50659"

Write-Host "=== Testing ZaloPay Status and Manual Update ===" -ForegroundColor Green

# Bước 1: Kiểm tra server có chạy không
Write-Host "`n1. Kiểm tra server..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/test" -Method GET
    Write-Host "✅ Server đang chạy: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Server không chạy hoặc không thể kết nối" -ForegroundColor Red
    Write-Host "Khởi động server bằng: cd server && node server.js" -ForegroundColor Cyan
    exit
}

# Bước 2: Kiểm tra trạng thái ZaloPay (không cần token)
Write-Host "`n2. Kiểm tra trạng thái từ ZaloPay API..." -ForegroundColor Yellow
try {
    $statusUrl = "$BASE_URL/api/payments/zalopay/status/$TRANSACTION_ID"
    Write-Host "Gọi API: $statusUrl" -ForegroundColor Cyan
    
    $statusResponse = Invoke-RestMethod -Uri $statusUrl -Method GET
    Write-Host "✅ Kết quả từ ZaloPay:" -ForegroundColor Green
    $statusResponse | ConvertTo-Json -Depth 10 | Write-Host
    
    if ($statusResponse.success -and $statusResponse.data.return_code -eq 1) {
        Write-Host "🎉 ZaloPay xác nhận thanh toán THÀNH CÔNG!" -ForegroundColor Green
        Write-Host "Nhưng database vẫn pending - cần manual update" -ForegroundColor Yellow
    } else {
        Write-Host "⚠️ ZaloPay chưa xác nhận thành công" -ForegroundColor Yellow
        Write-Host "Return code: $($statusResponse.data.return_code)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Lỗi khi kiểm tra ZaloPay status:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Bước 3: Hướng dẫn manual update (cần token)
Write-Host "`n3. Manual Update (cần JWT token)..." -ForegroundColor Yellow
Write-Host "⚠️ Để thực hiện manual update, cần JWT token:" -ForegroundColor Yellow
Write-Host "1. Mở browser, đăng nhập vào http://localhost:5173" -ForegroundColor Cyan
Write-Host "2. Mở Developer Tools (F12)" -ForegroundColor Cyan
Write-Host "3. Vào tab Application/Storage -> Local Storage" -ForegroundColor Cyan
Write-Host "4. Tìm key 'nosmoke_token' và copy value" -ForegroundColor Cyan
Write-Host "5. Paste token vào biến `$TOKEN dưới đây và uncomment dòng test" -ForegroundColor Cyan

# Uncomment và thay YOUR_JWT_TOKEN_HERE để test manual update
# $TOKEN = "YOUR_JWT_TOKEN_HERE"
# if ($TOKEN -ne "YOUR_JWT_TOKEN_HERE") {
#     try {
#         $headers = @{ "Authorization" = "Bearer $TOKEN" }
#         $manualUpdateUrl = "$BASE_URL/api/payments/zalopay/manual-update/$TRANSACTION_ID"
#         Write-Host "`nGọi API Manual Update: $manualUpdateUrl" -ForegroundColor Cyan
#         
#         $updateResponse = Invoke-RestMethod -Uri $manualUpdateUrl -Method POST -Headers $headers
#         Write-Host "✅ Kết quả Manual Update:" -ForegroundColor Green
#         $updateResponse | ConvertTo-Json -Depth 10 | Write-Host
#         
#         if ($updateResponse.success) {
#             Write-Host "🎉 Manual update THÀNH CÔNG!" -ForegroundColor Green
#             Write-Host "Payment status đã được cập nhật thành completed" -ForegroundColor Green
#         }
#     } catch {
#         Write-Host "❌ Lỗi manual update:" -ForegroundColor Red
#         Write-Host $_.Exception.Message -ForegroundColor Red
#     }
# }

Write-Host "`n=== Hướng dẫn tiếp theo ===" -ForegroundColor Green
Write-Host "1. Nếu ZaloPay xác nhận thành công nhưng DB vẫn pending:" -ForegroundColor Cyan
Write-Host "   - Lấy JWT token như hướng dẫn trên" -ForegroundColor Cyan
Write-Host "   - Uncomment phần manual update trong script" -ForegroundColor Cyan
Write-Host "   - Chạy lại script" -ForegroundColor Cyan
Write-Host "`n2. Hoặc test trực tiếp trên frontend:" -ForegroundColor Cyan
Write-Host "   - Vào trang PaymentSuccess" -ForegroundColor Cyan
Write-Host "   - Click nút 'Cập nhật trạng thái thanh toán'" -ForegroundColor Cyan
