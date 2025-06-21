@echo off
echo Starting NoSmoke Backend Server...
echo.

:: Navigate to backend directory
cd /d "%~dp0backend"

:: Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    npm install
    echo.
)

:: Start the development server
echo Starting development server...
npm run dev
