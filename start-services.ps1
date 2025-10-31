#!/usr/bin/env pwsh

# Medical AI Platform - Start Docker Services Only
# Starts MongoDB, Redis, and MinIO in Docker containers

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "STARTING DOCKER SERVICES" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker status..." -ForegroundColor Yellow
try {
    docker version | Out-Null
    Write-Host "[OK] Docker is running" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Stop existing containers
Write-Host ""
Write-Host "Stopping existing containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.services.yml down 2>$null

# Start services
Write-Host ""
Write-Host "Starting Docker services..." -ForegroundColor Yellow
Write-Host "- MongoDB (Database)" -ForegroundColor Gray
Write-Host "- Redis (Cache & Sessions)" -ForegroundColor Gray  
Write-Host "- MinIO (Object Storage)" -ForegroundColor Gray

Write-Host ""

docker-compose -f docker-compose.services.yml up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] Failed to start services" -ForegroundColor Red
    exit 1
}

# Wait for services to be ready
Write-Host ""
Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check service status
Write-Host ""
Write-Host "Checking service status..." -ForegroundColor Yellow

$services = @{
    "medical-ai-mongodb" = "MongoDB Database"
    "medical-ai-redis" = "Redis Cache"  
    "medical-ai-minio" = "MinIO Storage"
}

foreach ($containerName in $services.Keys) {
    $serviceName = $services[$containerName]
    $status = docker ps --filter "name=$containerName" --format "table {{.Status}}" | Select-Object -Skip 1
    
    if ($status -and $status -like "*Up*") {
        Write-Host "  [OK] $serviceName" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] $serviceName (Not running)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "DOCKER SERVICES STARTED!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Service URLs:" -ForegroundColor Cyan
Write-Host "  - MongoDB:         localhost:27017" -ForegroundColor White
Write-Host "  - Redis:           localhost:6379" -ForegroundColor White
Write-Host "  - MinIO Console:   http://localhost:9001" -ForegroundColor White
Write-Host "  - MinIO API:       http://localhost:9000" -ForegroundColor White

Write-Host ""
Write-Host "Default Credentials:" -ForegroundColor Cyan
Write-Host "  - MongoDB:   admin / medical_ai_2024" -ForegroundColor White
Write-Host "  - MinIO:     minioadmin / medical_minio_2024" -ForegroundColor White
Write-Host "  - Redis:     (password: medical_redis_2024)" -ForegroundColor White
Write-Host ""
Write-Host "Next: Start the Python backend with .\start-backend-local.ps1" -ForegroundColor Green
Write-Host ""