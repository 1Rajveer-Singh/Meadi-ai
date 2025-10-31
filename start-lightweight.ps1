#!/usr/bin/env pwsh

# Medical AI Platform - Lightweight Start Script
# Starts the complete system with lightweight backend (no heavy ML dependencies)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "MEDICAL AI PLATFORM - LIGHTWEIGHT STARTUP" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker status..." -ForegroundColor Yellow
try {
    docker version | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Stop any existing containers
Write-Host "🧹 Cleaning up existing containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.lightweight.yml down 2>$null

# Remove old backend image if it exists
Write-Host "Removing old backend image..." -ForegroundColor Yellow
docker rmi medical-ai-platform-backend 2>$null

Write-Host ""
Write-Host "Starting Medical AI Platform (Lightweight)..." -ForegroundColor Green
Write-Host ""

# Build and start all services
Write-Host "Building and starting services..." -ForegroundColor Yellow
docker-compose -f docker-compose.lightweight.yml up --build -d

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Failed to start services. Check the logs above." -ForegroundColor Red
    Write-Host ""
    Write-Host "Showing service logs:" -ForegroundColor Yellow
    docker-compose -f docker-compose.lightweight.yml logs --tail=50
    exit 1
}

Write-Host ""
Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Check service health
Write-Host ""
Write-Host "Checking service health..." -ForegroundColor Yellow

$services = @{
    "MongoDB" = @{
        "Container" = "medical-ai-mongodb"
        "URL" = "http://localhost:27017"
        "Port" = 27017
    }
    "Redis" = @{
        "Container" = "medical-ai-redis" 
        "URL" = "http://localhost:6379"
        "Port" = 6379
    }
    "MinIO" = @{
        "Container" = "medical-ai-minio"
        "URL" = "http://localhost:9001"
        "Port" = 9001
    }
    "Backend API" = @{
        "Container" = "medical-ai-backend-lightweight"
        "URL" = "http://localhost:8000/health"
        "Port" = 8000
    }
    "Frontend" = @{
        "Container" = "medical-ai-frontend"
        "URL" = "http://localhost:5173"
        "Port" = 5173
    }
}

foreach ($serviceName in $services.Keys) {
    $service = $services[$serviceName]
    $status = docker ps --filter "name=$($service.Container)" --format "table {{.Status}}" | Select-Object -Skip 1
    
    if ($status -and $status -like "*Up*") {
        Write-Host "  [OK] $serviceName" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] $serviceName (Not running)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Service URLs:" -ForegroundColor Cyan
Write-Host "  - Frontend:        http://localhost:5173" -ForegroundColor White
Write-Host "  - Backend API:     http://localhost:8000" -ForegroundColor White
Write-Host "  - API Docs:        http://localhost:8000/docs" -ForegroundColor White
Write-Host "  - MinIO Console:   http://localhost:9001" -ForegroundColor White
Write-Host "  - MongoDB:         localhost:27017" -ForegroundColor White
Write-Host "  - Redis:           localhost:6379" -ForegroundColor White

Write-Host ""
Write-Host "Default Credentials:" -ForegroundColor Cyan
Write-Host "  - MinIO:     minioadmin / medical_minio_2024" -ForegroundColor White
Write-Host "  - MongoDB:   admin / medical_ai_2024" -ForegroundColor White
Write-Host "  - Redis:     (password: medical_redis_2024)" -ForegroundColor White

Write-Host ""
Write-Host "Useful Commands:" -ForegroundColor Cyan
Write-Host "  - View logs:       docker-compose -f docker-compose.lightweight.yml logs -f" -ForegroundColor White
Write-Host "  - Stop services:   docker-compose -f docker-compose.lightweight.yml down" -ForegroundColor White
Write-Host "  - Restart:         docker-compose -f docker-compose.lightweight.yml restart" -ForegroundColor White

Write-Host ""

# Test backend health
Write-Host "Testing backend health..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/health" -TimeoutSec 10
    if ($response) {
        Write-Host "[OK] Backend API is responding" -ForegroundColor Green
    }
} catch {
    Write-Host "[WARN] Backend API not ready yet (may take a few more seconds)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "MEDICAL AI PLATFORM STARTED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Open http://localhost:5173 to access the application" -ForegroundColor Green
Write-Host ""

# Show running containers
Write-Host "Running Containers:" -ForegroundColor Cyan
docker-compose -f docker-compose.lightweight.yml ps

Write-Host ""
Write-Host "Note: This is the lightweight version without heavy ML dependencies." -ForegroundColor Yellow
Write-Host "Core functionality is available. ML features can be added later." -ForegroundColor Yellow