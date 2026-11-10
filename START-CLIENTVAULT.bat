@echo off
title ClientVault Server
cd /d "%~dp0"
echo Starting ClientVault...
echo Keep this window open while using the website.
echo.
start "" http://localhost:3000
"C:\Program Files\nodejs\node.exe" server.js
pause
