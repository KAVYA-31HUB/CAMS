Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  College Admission Management System (CAMS) Launcher  " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/4] Clearing any existing processes on ports 8080 and 5173..." -ForegroundColor Yellow
Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -in 8080, 5173 } | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
}

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "[2/4] Starting Spring Boot Backend (port 8080)..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k", "cd /d `"$rootDir\cams`" && mvnw.cmd spring-boot:run"

Write-Host "[3/4] Starting Vite React Frontend (port 5173)..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k", "cd /d `"$rootDir\frontend`" && npm run dev"

Write-Host "[4/4] Waiting for servers to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "Opening http://localhost:5173 in browser..." -ForegroundColor Green
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  CAMS is running!" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "  Backend:  http://localhost:8080" -ForegroundColor Green
Write-Host "  To stop all servers, run: .\stop.ps1" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Green
