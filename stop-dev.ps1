#!/usr/bin/env pwsh

# Medical AI Platform - Stop All Services
# Stops Docker services and any running local processes

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "STOPPING MEDICAL AI PLATFORM" -ForegroundColor Red
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Stopping Docker services..." -ForegroundColor Yellow
docker-compose -f docker-compose.services.yml down

Write-Host ""
Write-Host "Stopping local Python processes..." -ForegroundColor Yellow

# Kill any Python processes running local_main.py
$pythonProcesses = Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object {
    $_.MainModule.FileName -like "*local_main.py*" -or
    $_.CommandLine -like "*local_main.py*"
}

if ($pythonProcesses) {
    $pythonProcesses | ForEach-Object {
        Write-Host "  Stopping Python backend (PID: $($_.Id))" -ForegroundColor Gray
        Stop-Process -Id $_.Id -Force
    }
} else {
    Write-Host "  No Python backend processes found" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Stopping frontend processes..." -ForegroundColor Yellow

# Kill any Node.js processes (Vite dev server)
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*vite*" -or $_.CommandLine -like "*dev*"
}

if ($nodeProcesses) {
    $nodeProcesses | ForEach-Object {
        Write-Host "  Stopping frontend server (PID: $($_.Id))" -ForegroundColor Gray  
        Stop-Process -Id $_.Id -Force
    }
} else {
    Write-Host "  No frontend processes found" -ForegroundColor Gray
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "ALL SERVICES STOPPED" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To restart: .\start-dev.ps1" -ForegroundColor Yellow
Write-Host ""