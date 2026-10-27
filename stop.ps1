Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Stopping College Admission Management System (CAMS)   " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -in 8080, 5173 } | ForEach-Object {
    $proc = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
    Write-Host "Stopping process $($proc.ProcessName) (PID: $($_.OwningProcess)) on port $($_.LocalPort)..." -ForegroundColor Yellow
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
}

Write-Host "All CAMS servers have been stopped." -ForegroundColor Green
