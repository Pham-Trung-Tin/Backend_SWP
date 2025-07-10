@echo off
echo Starting ZaloPay Test Server...
echo.

:: Navigate to server directory
cd /d "%~dp0server"

:: Start the ZaloPay server
echo Starting ZaloPay server on port 5001...
npm run zalopay
