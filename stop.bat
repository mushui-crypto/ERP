@echo off
title ERP Platform - Stop Services

echo ================================
echo    ERP Platform - Stop Script
echo ================================
echo.

set BACKEND_PORT=3001
set FRONTEND_PORT=8090

echo [1/2] Stopping backend service...
netstat -ano | findstr :%BACKEND_PORT% >nul
if not errorlevel 1 (
    echo Found process on port %BACKEND_PORT%, killing...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%BACKEND_PORT%') do (
        taskkill /PID %%a /F >nul 2>&1
        if not errorlevel 1 echo Killed PID: %%a
    )
    echo Backend service stopped.
) else (
    echo Backend service not running.
)

echo.
echo [2/2] Stopping frontend service...
netstat -ano | findstr :%FRONTEND_PORT% >nul
if not errorlevel 1 (
    echo Found process on port %FRONTEND_PORT%, killing...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%FRONTEND_PORT%') do (
        taskkill /PID %%a /F >nul 2>&1
        if not errorlevel 1 echo Killed PID: %%a
    )
    echo Frontend service stopped.
) else (
    echo Frontend service not running.
)

echo.
echo ================================
echo    All services stopped!
echo ================================
echo.
pause