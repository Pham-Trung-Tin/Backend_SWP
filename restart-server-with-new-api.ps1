# Khởi động lại server với cấu hình API đường dẫn mới
# Chạy với PowerShell

Write-Host "🛑 Đang dừng server hiện tại (nếu có)..." -ForegroundColor Yellow

# Tìm và dừng tiến trình đang chạy trên cổng 5000
$running = netstat -ano | Select-String ":5000" | Select-String "LISTENING"
if ($running) {
    $processIds = $running | ForEach-Object { ($_ -split '\s+')[-1] } | Select-Object -Unique
    foreach ($processId in $processIds) {
        Write-Host "⚠️ Dừng tiến trình $processId đang chạy trên cổng 5000" -ForegroundColor Yellow
        taskkill /PID $processId /F
    }
    Start-Sleep -Seconds 2
}

# Di chuyển vào thư mục server
Set-Location -Path server

# Kiểm tra xem có các file cần thiết không
Write-Host "🔍 Kiểm tra cấu hình server..." -ForegroundColor Blue

$routeFile = "src\routes\appointmentsStatusRoutes.js"
if (-not (Test-Path $routeFile)) {
    Write-Host "❌ Không tìm thấy file $routeFile" -ForegroundColor Red
    exit 1
}

# Khởi động server
Write-Host "🚀 Khởi động server với cấu hình mới..." -ForegroundColor Green
node server.js
