@echo off
title ERP Platform - Start Services

echo ================================
echo    ERP Platform - Start Script
echo ================================
echo.

set SERVER_DIR=%~dp0server
set FRONTEND_DIR=%~dp0traewordp
set BACKEND_PORT=3001
set FRONTEND_PORT=8090

echo [1/4] Checking environment...
where node >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found!
    pause
    exit /b 1
)

where python >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found!
    pause
    exit /b 1
)

echo [2/4] Releasing ports...

netstat -ano | findstr :%BACKEND_PORT% >nul
if not errorlevel 1 (
    echo Port %BACKEND_PORT% in use, releasing...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%BACKEND_PORT%') do taskkill /PID %%a /F >nul 2>&1
    timeout /t 2 /nobreak >nul
)

netstat -ano | findstr :%FRONTEND_PORT% >nul
if not errorlevel 1 (
    echo Port %FRONTEND_PORT% in use, releasing...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%FRONTEND_PORT%') do taskkill /PID %%a /F >nul 2>&1
    timeout /t 2 /nobreak >nul
)

echo [3/4] Starting backend service...
cd /d "%SERVER_DIR%"
start "Backend - Port %BACKEND_PORT%" cmd /k "cd /d "%SERVER_DIR%" && npm run start:dev"

echo Waiting for backend to start...
timeout /t 8 /nobreak >nul

echo [4/4] Starting frontend service...
cd /d "%FRONTEND_DIR%"
start "Frontend - Port %FRONTEND_PORT%" cmd /k "cd /d "%FRONTEND_DIR%" && python -m http.server %FRONTEND_PORT%"

echo.
echo ================================
echo    Services started successfully!
echo ================================
echo.
echo Backend: http://localhost:%BACKEND_PORT%
echo API Docs: http://localhost:%BACKEND_PORT%/api/docs
echo Frontend: http://localhost:%FRONTEND_PORT%
echo.
echo Press any key to open browser...
pause >nul

start http://localhost:%FRONTEND_PORT%

echo.
echo Done! Service windows opened, don't close them.
echo.
pause