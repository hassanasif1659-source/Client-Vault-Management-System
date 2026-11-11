@echo off
title ClientVault Server
cd /d "%~dp0"
echo ==========================================
echo   ClientVault - starting, please wait...
echo ==========================================
echo.

rem 1. Start MySQL (XAMPP) if it is not already running
netstat -ano | findstr ":3306" | findstr "LISTENING" >nul
if errorlevel 1 (
    echo Starting MySQL...
    start "MySQL" /min "C:\xampp\mysql\bin\mysqld.exe" --defaults-file="C:\xampp\mysql\bin\my.ini" --standalone
    timeout /t 5 /nobreak >nul
) else (
    echo MySQL is already running.
)

rem 2. Open the website in the browser
start "" http://localhost:3000

rem 3. Start the Node.js server (keep this window open)
echo Keep this window open while using the website.
echo.
"C:\Program Files\nodejs\node.exe" server.js
pause
