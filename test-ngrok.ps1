# Test ngrok endpoint
Write-Host "Testing ngrok endpoint..." -ForegroundColor Green

$NGROK_URL = "https://cd9dbe1b921e.ngrok-free.app"
$TEST_ENDPOINT = "$NGROK_URL/api/payments/zalopay/test-callback"

Write-Host "Testing URL: $TEST_ENDPOINT" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri $TEST_ENDPOINT -Method GET
    Write-Host "✅ Success!" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

Write-Host "`n=== Next Steps ===" -ForegroundColor Magenta
Write-Host "1. Nếu test này thành công, ngrok đang hoạt động đúng"
Write-Host "2. Kiểm tra server logs để xem có callback nào từ ZaloPay không"
Write-Host "3. Nếu không có callback, thử manual update API"
