# Script khởi động server với CORS fix
# Chạy với PowerShell

Write-Host "🚀 Khởi động server với CORS fix..." -ForegroundColor Green

# Di chuyển vào thư mục server
Set-Location -Path server

# Kiểm tra xem server có đang chạy không
$running = netstat -ano | Select-String ":5000"
if ($running) {
    Write-Host "⚠️ Phát hiện server đang chạy trên cổng 5000, đang dừng..." -ForegroundColor Yellow
    $process = $running | ForEach-Object { ($_ -split '\s+')[5] } | Select-Object -First 1
    if ($process) {
        taskkill /PID $process /F
        Write-Host "✅ Đã dừng server" -ForegroundColor Green
    }
}

# Khởi động server
Write-Host "🔄 Khởi động server Node.js..." -ForegroundColor Cyan
node server.js
