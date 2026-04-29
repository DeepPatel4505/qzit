@echo off
REM Qzit Quiz Generator - Setup Script for Windows
REM This script helps set up the project on Windows

echo.
echo ====================================
echo  Qzit - Quiz Generator Setup
echo ====================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [✓] Node.js is installed: %node --version%
npm --version >nul 2>&1
echo [✓] npm is installed: %npm --version%
echo.

REM Backend setup
echo ====================================
echo Setting up Backend...
echo ====================================
cd backend

if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install backend dependencies
        pause
        exit /b 1
    )
    echo [✓] Backend dependencies installed
) else (
    echo [✓] Backend dependencies already installed
)

if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo [✓] Created .env file
    echo   Please edit backend/.env with your MongoDB connection string
) else (
    echo [✓] .env file already exists
)

cd ..

REM Frontend setup
echo.
echo ====================================
echo Setting up Frontend...
echo ====================================
cd frontend

if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install frontend dependencies
        pause
        exit /b 1
    )
    echo [✓] Frontend dependencies installed
) else (
    echo [✓] Frontend dependencies already installed
)

if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo [✓] Created .env file
) else (
    echo [✓] .env file already exists
)

cd ..

echo.
echo ====================================
echo Setup Complete!
echo ====================================
echo.
echo Next steps:
echo.
echo 1. Make sure MongoDB is running:
echo    - Start MongoDB service from Windows Services
echo    - Or use MongoDB Atlas (cloud)
echo.
echo 2. Edit backend/.env file:
echo    - Add your MongoDB connection string
echo    - Default: mongodb://localhost:27017/qzit
echo.
echo 3. Start the backend (Terminal 1):
echo    cd backend
echo    npm start
echo.
echo 4. Start the frontend (Terminal 2):
echo    cd frontend
echo    npm start
echo.
echo 5. Frontend will open at http://localhost:3000
echo.
echo For more details, see:
echo - QUICKSTART.md - Quick start guide
echo - README.md - Full documentation
echo - INSTALLATION.md - Detailed installation guide
echo.
pause
