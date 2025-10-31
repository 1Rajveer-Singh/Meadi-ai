# Enhanced Medical AI Platform - Simple Startup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Enhanced Medical AI Platform Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check Docker
try {
    docker ps | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
}
catch {
    Write-Host "✗ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check if docker-compose.enhanced.yml exists
if (-not (Test-Path "docker-compose.enhanced.yml")) {
    Write-Host "✗ docker-compose.enhanced.yml not found in current directory" -ForegroundColor Red
    exit 1
}

# Stop any existing services
Write-Host "Stopping any existing services..." -ForegroundColor Yellow
docker-compose -f docker-compose.enhanced.yml down

# Ask for cleanup
$cleanup = Read-Host "Do you want to clean up existing data? (y/N)"
if ($cleanup -eq 'y' -or $cleanup -eq 'Y') {
    Write-Host "Cleaning up existing data..." -ForegroundColor Yellow
    docker-compose -f docker-compose.enhanced.yml down -v
    docker system prune -f
}

# Build and start services
Write-Host "Building and starting enhanced services..." -ForegroundColor Cyan
docker-compose -f docker-compose.enhanced.yml up -d --build

# Wait for services to start
Write-Host "Waiting for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Check service status
Write-Host "`nChecking service status..." -ForegroundColor Cyan
docker-compose -f docker-compose.enhanced.yml ps

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "Enhanced Medical AI Platform - Ready!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host "`nService URLs:" -ForegroundColor White
Write-Host "  • Frontend:        http://localhost:5173" -ForegroundColor Cyan
Write-Host "  • Backend API:     http://localhost:8000" -ForegroundColor Cyan
Write-Host "  • API Docs:        http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "  • MinIO Console:   http://localhost:9001" -ForegroundColor Cyan

Write-Host "`nDefault Credentials:" -ForegroundColor White
Write-Host "  MongoDB:" -ForegroundColor Yellow
Write-Host "    Username: admin" -ForegroundColor Gray
Write-Host "    Password: medical_ai_2024" -ForegroundColor Gray
Write-Host "  MinIO:" -ForegroundColor Yellow
Write-Host "    Username: minioadmin" -ForegroundColor Gray
Write-Host "    Password: medical_minio_2024" -ForegroundColor Gray
Write-Host "  Redis:" -ForegroundColor Yellow
Write-Host "    Password: medical_redis_2024" -ForegroundColor Gray

Write-Host "`n🚀 Enhanced Medical AI Platform is ready for use!" -ForegroundColor Green
Write-Host "   Open http://localhost:5173 to access the application" -ForegroundColor Cyan