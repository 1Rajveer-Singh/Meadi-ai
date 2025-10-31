#!/usr/bin/env pwsh

# Medical AI Platform - Start Local Python Backend
# Starts FastAPI backend with .venv connecting to Docker services

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "STARTING PYTHON BACKEND (LOCAL)" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if .venv exists
if (-not (Test-Path "backend\.venv")) {
    Write-Host "[ERROR] Virtual environment not found!" -ForegroundColor Red
    Write-Host "Please run .\setup-dev.ps1 first to create the .venv" -ForegroundColor Yellow
    exit 1
}

# Navigate to backend directory
Set-Location backend

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
.\.venv\Scripts\Activate.ps1

# Check if Docker services are running
Write-Host ""
Write-Host "Checking Docker services..." -ForegroundColor Yellow

$requiredServices = @("medical-ai-mongodb", "medical-ai-redis", "medical-ai-minio")
$allRunning = $true

foreach ($service in $requiredServices) {
    $status = docker ps --filter "name=$service" --format "table {{.Status}}" | Select-Object -Skip 1
    if ($status -and $status -like "*Up*") {
        Write-Host "  [OK] $service" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] $service (Not running)" -ForegroundColor Red
        $allRunning = $false
    }
}

if (-not $allRunning) {
    Write-Host ""
    Write-Host "[ERROR] Some Docker services are not running!" -ForegroundColor Red
    Write-Host "Please start services first: .\start-services.ps1" -ForegroundColor Yellow
    Set-Location ..
    exit 1
}

Write-Host ""
Write-Host "Starting FastAPI backend..." -ForegroundColor Yellow
Write-Host "- Connecting to Docker services" -ForegroundColor Gray
Write-Host "- Hot reload enabled for development" -ForegroundColor Gray
Write-Host "- API docs available at http://localhost:8000/docs" -ForegroundColor Gray
Write-Host ""

# Start the local backend
python local_main.py