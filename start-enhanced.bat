@echo off
echo ========================================
echo Enhanced Medical AI Platform Setup
echo ========================================

echo Checking Docker...
docker ps >nul 2>&1
if errorlevel 1 (
    echo Docker is not running. Please start Docker Desktop.
    pause
    exit /b 1
)
echo Docker is running

echo Stopping existing services...
docker-compose -f docker-compose.enhanced.yml down

echo Building and starting enhanced services...
docker-compose -f docker-compose.enhanced.yml up -d --build

echo Waiting for services to initialize...
timeout /t 30 /nobreak >nul

echo.
echo Checking service status...
docker-compose -f docker-compose.enhanced.yml ps

echo.
echo ========================================
echo Enhanced Medical AI Platform - Ready!
echo ========================================
echo.
echo Service URLs:
echo   Frontend:        http://localhost:5173
echo   Backend API:     http://localhost:8000
echo   API Docs:        http://localhost:8000/docs
echo   MinIO Console:   http://localhost:9001
echo.
echo Default Credentials:
echo   MongoDB: admin / medical_ai_2024
echo   MinIO:   minioadmin / medical_minio_2024
echo   Redis:   medical_redis_2024
echo.
echo Enhanced Medical AI Platform is ready for use!
echo Open http://localhost:5173 to access the application
echo.
pause