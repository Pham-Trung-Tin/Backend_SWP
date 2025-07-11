@echo off
echo Starting NoSmoke Frontend...
echo.

:: Navigate to client directory
cd /d "%~dp0client"

:: Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

:: Start the development server
echo Starting frontend development server...
call npm run dev
