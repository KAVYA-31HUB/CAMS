@echo off
title Stopping CAMS Full Stack...
echo ========================================================
echo   Stopping College Admission Management System (CAMS)
echo ========================================================
powershell -NoProfile -Command "Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -in 8080, 5173 } | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"
echo All CAMS backend and frontend servers have been stopped.
powershell -NoProfile -Command "Start-Sleep -Seconds 2"
