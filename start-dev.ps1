#!/usr/bin/env pwsh

# Medical AI Platform - Complete Development Startup
# Starts all services: Docker services + Local Python backend + Frontend

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "MEDICAL AI PLATFORM - FULL DEV STARTUP" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check Docker
try {
    docker version | Out-Null
    Write-Host "  [OK] Docker is running" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Docker is not running" -ForegroundColor Red
    exit 1
}

# Check Python venv
if (Test-Path "backend\.venv") {
    Write-Host "  [OK] Python .venv found" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] Python .venv not found" -ForegroundColor Red
    Write-Host "Run .\setup-dev.ps1 first to create the environment" -ForegroundColor Yellow
    exit 1
}

# Check Node.js for frontend
try {
    $nodeVersion = node --version 2>$null
    Write-Host "  [OK] Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  [WARN] Node.js not found (frontend may not work)" -ForegroundColor Yellow
}

Write-Host ""

# Step 1: Start Docker services
Write-Host "Step 1: Starting Docker services..." -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

docker-compose -f docker-compose.services.yml up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to start Docker services" -ForegroundColor Red
    exit 1
}

# Wait for services
Write-Host "Waiting for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host ""

# Step 2: Start Python backend in background
Write-Host "Step 2: Starting Python backend..." -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location backend
    .\.venv\Scripts\Activate.ps1
    python local_main.py
}

# Give backend time to start
Start-Sleep -Seconds 5

Write-Host ""

# Step 3: Start Frontend
Write-Host "Step 3: Starting Frontend..." -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

# Check if frontend dependencies are installed
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
}

$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location frontend  
    npm run dev
}

# Give frontend time to start
Start-Sleep -Seconds 8

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "DEVELOPMENT ENVIRONMENT READY!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check service status
Write-Host "Service Status:" -ForegroundColor Cyan

# Check Docker services
$dockerServices = @("medical-ai-mongodb", "medical-ai-redis", "medical-ai-minio")
foreach ($service in $dockerServices) {
    $status = docker ps --filter "name=$service" --format "table {{.Status}}" | Select-Object -Skip 1
    if ($status -and $status -like "*Up*") {
        Write-Host "  [OK] $service" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] $service" -ForegroundColor Red
    }
}

# Check backend
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/health" -TimeoutSec 5
    Write-Host "  [OK] Python Backend (FastAPI)" -ForegroundColor Green
} catch {
    Write-Host "  [WARN] Python Backend (starting...)" -ForegroundColor Yellow
}

# Check frontend  
try {
    Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 3 | Out-Null
    Write-Host "  [OK] Frontend (React/Vite)" -ForegroundColor Green
} catch {
    Write-Host "  [WARN] Frontend (starting...)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Application URLs:" -ForegroundColor Cyan
Write-Host "  - Frontend:        http://localhost:5173" -ForegroundColor White
Write-Host "  - Backend API:     http://localhost:8000" -ForegroundColor White
Write-Host "  - API Docs:        http://localhost:8000/docs" -ForegroundColor White
Write-Host "  - MinIO Console:   http://localhost:9001" -ForegroundColor White
Write-Host "  - Mongo Express:   http://localhost:8081" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Yellow
Write-Host ""

# Monitor jobs and wait for user interrupt
try {
    while ($true) {
        Start-Sleep -Seconds 2
        
        # Check if jobs are still running
        if ($backendJob.State -ne "Running") {
            Write-Host "[WARN] Backend job stopped" -ForegroundColor Yellow
        }
        if ($frontendJob.State -ne "Running") {
            Write-Host "[WARN] Frontend job stopped" -ForegroundColor Yellow  
        }
    }
} catch {
    Write-Host ""
    Write-Host "Stopping all services..." -ForegroundColor Yellow
    
    # Stop jobs
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    Stop-Job $frontendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job $frontendJob -ErrorAction SilentlyContinue
    
    # Stop Docker services
    docker-compose -f docker-compose.services.yml down
    
    Write-Host "All services stopped." -ForegroundColor Green
}