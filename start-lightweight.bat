@echo off
echo ========================================
echo Medical AI Platform - Lightweight Setup
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
docker-compose down

echo Starting core services (MongoDB, Redis, MinIO)...
docker-compose up -d mongodb redis minio

echo Waiting for core services to initialize...
timeout /t 20 /nobreak >nul

echo Building and starting lightweight backend...
docker-compose up -d --build backend

echo Waiting for backend to initialize...
timeout /t 15 /nobreak >nul

echo Starting frontend...
docker-compose up -d frontend

echo.
echo Checking service status...
docker-compose ps

echo.
echo ========================================
echo Medical AI Platform - Ready!
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
echo Medical AI Platform is ready for use!
echo Open http://localhost:5173 to access the application
echo.
pause