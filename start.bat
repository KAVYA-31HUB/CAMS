@echo off
title Starting CAMS Full Stack...
echo ========================================================
echo   College Admission Management System (CAMS) Launcher
echo ========================================================
echo.

echo [1/4] Clearing old processes on ports 8080 and 5173...
powershell -NoProfile -Command "Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -in 8080, 5173 } | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"

echo [2/4] Starting Backend (Spring Boot on port 8080)...
start "CAMS-Backend-8080" cmd /k "cd /d ""%~dp0cams"" && mvnw.cmd spring-boot:run"

echo [3/4] Starting Frontend (React Vite on port 5173)...
start "CAMS-Frontend-5173" cmd /k "cd /d ""%~dp0frontend"" && npm run dev"

echo [4/4] Waiting 10 seconds for servers to start...
powershell -NoProfile -Command "Start-Sleep -Seconds 10"

echo Launching CAMS in your browser...
start http://localhost:5173

echo.
echo ========================================================
echo   CAMS is running!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8080
echo   To stop all servers, simply run stop.bat or close the windows.
echo ========================================================
