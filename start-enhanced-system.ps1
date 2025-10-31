# Enhanced Medical AI Platform - Setup and Start Script
# Comprehensive system initialization with MongoDB, MinIO, Redis

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Enhanced Medical AI Platform Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Function to check if Docker is running
function Test-DockerRunning {
    try {
        docker ps | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Function to check service health
function Wait-ForService {
    param(
        [string]$ServiceName,
        [string]$HealthEndpoint,
        [int]$MaxWaitSeconds = 60
    )
    
    Write-Host "Waiting for $ServiceName to be healthy..." -ForegroundColor Yellow
    
    $waited = 0
    while ($waited -lt $MaxWaitSeconds) {
        try {
            if ($HealthEndpoint) {
                $response = Invoke-RestMethod -Uri $HealthEndpoint -TimeoutSec 5 -ErrorAction SilentlyContinue
                if ($response) {
                    Write-Host "✓ $ServiceName is healthy" -ForegroundColor Green
                    return $true
                }
            }
        }
        catch {
            # Continue waiting
        }
        
        Start-Sleep -Seconds 2
        $waited += 2
        Write-Host "." -NoNewline -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "✗ $ServiceName health check timed out" -ForegroundColor Red
    return $false
}

# Check Docker
if (-not (Test-DockerRunning)) {
    Write-Host "✗ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

Write-Host "✓ Docker is running" -ForegroundColor Green

# Check if docker-compose.enhanced.yml exists
if (-not (Test-Path "docker-compose.enhanced.yml")) {
    Write-Host "✗ docker-compose.enhanced.yml not found in current directory" -ForegroundColor Red
    exit 1
}

# Stop any existing services
Write-Host "Stopping any existing services..." -ForegroundColor Yellow
docker-compose -f docker-compose.enhanced.yml down

# Clean up old containers and volumes if requested
$cleanup = Read-Host "Do you want to clean up existing data? (y/N)"
if ($cleanup -eq 'y' -or $cleanup -eq 'Y') {
    Write-Host "Cleaning up existing data..." -ForegroundColor Yellow
    docker-compose -f docker-compose.enhanced.yml down -v
    docker system prune -f
}

# Build and start services
Write-Host "Building and starting enhanced services..." -ForegroundColor Cyan
docker-compose -f docker-compose.enhanced.yml up -d --build

# Wait for core services to be healthy
$services = @(
    @{ Name = "MongoDB"; Endpoint = "http://localhost:27017" },
    @{ Name = "Redis"; Endpoint = $null },
    @{ Name = "MinIO"; Endpoint = "http://localhost:9000/minio/health/live" },
    @{ Name = "Backend API"; Endpoint = "http://localhost:8000/health" }
)

foreach ($service in $services) {
    if ($service.Endpoint) {
        Wait-ForService -ServiceName $service.Name -HealthEndpoint $service.Endpoint
    } else {
        Write-Host "Waiting for $($service.Name)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        Write-Host "✓ $($service.Name) should be ready" -ForegroundColor Green
    }
}

# Check service status
Write-Host "`nChecking service status..." -ForegroundColor Cyan
docker-compose -f docker-compose.enhanced.yml ps

# Display service URLs and credentials
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "Enhanced Medical AI Platform - Ready!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host "`nService URLs:" -ForegroundColor White
Write-Host "  • Frontend:        http://localhost:5173" -ForegroundColor Cyan
Write-Host "  • Backend API:     http://localhost:8000" -ForegroundColor Cyan
Write-Host "  • API Docs:        http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "  • MinIO Console:   http://localhost:9001" -ForegroundColor Cyan
Write-Host "  • MongoDB:         localhost:27017" -ForegroundColor Cyan
Write-Host "  • Redis:           localhost:6379" -ForegroundColor Cyan

Write-Host "`nDefault Credentials:" -ForegroundColor White
Write-Host "  MongoDB:" -ForegroundColor Yellow
Write-Host "    Username: admin" -ForegroundColor Gray
Write-Host "    Password: medical_ai_2024" -ForegroundColor Gray
Write-Host "  MinIO:" -ForegroundColor Yellow
Write-Host "    Username: minioadmin" -ForegroundColor Gray
Write-Host "    Password: medical_minio_2024" -ForegroundColor Gray
Write-Host "  Redis:" -ForegroundColor Yellow
Write-Host "    Password: medical_redis_2024" -ForegroundColor Gray

Write-Host "`nDemo User (Auto-created):" -ForegroundColor White
Write-Host "  Email: admin@medical.ai" -ForegroundColor Gray
Write-Host "  Password: admin123" -ForegroundColor Gray

Write-Host "`nFeatures Available:" -ForegroundColor White
Write-Host "  ✓ Enhanced Authentication with JWT" -ForegroundColor Green
Write-Host "  ✓ Real-time WebSocket Communication" -ForegroundColor Green
Write-Host "  ✓ Medical Image Upload & AI Analysis" -ForegroundColor Green
Write-Host "  ✓ Patient Management System" -ForegroundColor Green
Write-Host "  ✓ AI Diagnosis Workflow" -ForegroundColor Green
Write-Host "  ✓ System Monitoring Dashboard" -ForegroundColor Green
Write-Host "  ✓ Object Storage with MinIO" -ForegroundColor Green
Write-Host "  ✓ Redis Caching and Session Management" -ForegroundColor Green

# Test basic API functionality
Write-Host "`nTesting API connectivity..." -ForegroundColor Cyan
try {
    $apiHealth = Invoke-RestMethod -Uri "http://localhost:8000/health" -TimeoutSec 10
    if ($apiHealth.status -eq "healthy") {
        Write-Host "✓ Backend API is fully operational" -ForegroundColor Green
    } else {
        Write-Host "⚠ Backend API is responding but may have issues" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Unable to connect to Backend API" -ForegroundColor Red
}

# Show logs command
Write-Host "`nUseful Commands:" -ForegroundColor White
Write-Host "  View logs:         docker-compose -f docker-compose.enhanced.yml logs -f" -ForegroundColor Gray
Write-Host "  Stop services:     docker-compose -f docker-compose.enhanced.yml down" -ForegroundColor Gray
Write-Host "  Restart services:  docker-compose -f docker-compose.enhanced.yml restart" -ForegroundColor Gray
Write-Host "  Check status:      docker-compose -f docker-compose.enhanced.yml ps" -ForegroundColor Gray

Write-Host "`n🚀 Enhanced Medical AI Platform is ready for use!" -ForegroundColor Green
Write-Host "   Open http://localhost:5173 to access the application" -ForegroundColor Cyan

# Ask if user wants to view logs
$viewLogs = Read-Host "`nWould you like to view service logs? (y/N)"
if ($viewLogs -eq 'y' -or $viewLogs -eq 'Y') {
    Write-Host "Showing service logs (Ctrl+C to exit)..." -ForegroundColor Yellow
    docker-compose -f docker-compose.enhanced.yml logs -f
}