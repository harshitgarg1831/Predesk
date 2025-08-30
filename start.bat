@echo off
echo Starting Portfolio Application...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist ".env" (
    echo Warning: .env file not found
    echo Copying env.example to .env...
    copy "env.example" ".env"
    echo Please edit .env file with your database credentials
    echo.
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
)

echo.
echo Starting the application...
echo Backend will be available at: http://localhost:3000
echo Frontend will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the application
echo.

REM Start the application
npm start

pause
