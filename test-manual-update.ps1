# Test manual update API để xem có cập nhật được membership không
Write-Host "Testing ZaloPay manual update API..." -ForegroundColor Green

# Bạn cần thay đổi các giá trị này:
$TRANSACTION_ID = "250711_50659"  # Lấy từ database transaction_id mới nhất
$JWT_TOKEN = "YOUR_JWT_TOKEN_HERE"  # Lấy từ localStorage của browser
$BASE_URL = "http://localhost:5000"

Write-Host "Transaction ID: $TRANSACTION_ID" -ForegroundColor Yellow
Write-Host "Base URL: $BASE_URL" -ForegroundColor Yellow
Write-Host ""

# Test 1: Kiểm tra payment hiện tại
Write-Host "1. Checking current payment status..." -ForegroundColor Cyan
$headers = @{
    "Authorization" = "Bearer $JWT_TOKEN"
    "Content-Type" = "application/json"
}

try {
    $response1 = Invoke-RestMethod -Uri "$BASE_URL/api/payments/transaction/$TRANSACTION_ID" -Method GET -Headers $headers
    $response1 | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Manual update payment status..." -ForegroundColor Cyan
try {
    $response2 = Invoke-RestMethod -Uri "$BASE_URL/api/payments/zalopay/manual-update/$TRANSACTION_ID" -Method POST -Headers $headers
    $response2 | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n3. Checking payment status after update..." -ForegroundColor Cyan
try {
    $response3 = Invoke-RestMethod -Uri "$BASE_URL/api/payments/transaction/$TRANSACTION_ID" -Method GET -Headers $headers
    $response3 | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest completed!" -ForegroundColor Green

# Instructions
Write-Host "`n=== INSTRUCTIONS ===" -ForegroundColor Magenta
Write-Host "1. Thay đổi `$TRANSACTION_ID với transaction_id mới nhất từ database"
Write-Host "2. Lấy JWT token từ localStorage của browser:"
Write-Host "   - Mở browser, đăng nhập vào app"
Write-Host "   - F12 -> Application -> Local Storage -> tìm 'nosmoke_token'"
Write-Host "   - Copy value và thay vào `$JWT_TOKEN"
Write-Host "3. Chạy: .\test-manual-update.ps1"
