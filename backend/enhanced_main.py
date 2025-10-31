"""
Enhanced FastAPI Medical AI Platform
Comprehensive backend integrating MongoDB, MinIO, Redis, and WebSocket features
"""

import asyncio
import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Dict, Any

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import uvicorn

# Enhanced route imports
from routes.enhanced_auth import router as auth_router
from routes.enhanced_patients import router as patients_router
from routes.enhanced_diagnosis import router as diagnosis_router
from routes.enhanced_medical_images import router as images_router
from routes.enhanced_system_metrics import router as metrics_router
from routes.enhanced_websocket import (
    handle_websocket_connection, 
    manager, 
    broadcaster,
    get_websocket_stats
)

# Enhanced configuration imports
try:
    from config.enhanced_database import initialize_database, enhanced_db as db
except ImportError:
    try:
        from config.database import db
        async def initialize_database():
            return True
    except ImportError:
        # Mock database for basic testing
        class MockDB:
            def get_collection(self, name):
                class MockCollection:
                    async def count_documents(self, query, **kwargs):
                        return 0
                return MockCollection()
        db = MockDB()
        async def initialize_database():
            return True

try:
    from config.enhanced_minio_client import initialize_minio, minio_client
except ImportError:
    async def initialize_minio():
        return False

try:
    from config.enhanced_redis_client import initialize_redis, cleanup_redis, redis_client
except ImportError:
    async def initialize_redis():
        return False
    
    async def cleanup_redis():
        pass

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ========================================
# Application Lifecycle Management
# ========================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle manager"""
    
    logger.info("Starting Medical AI Platform...")
    
    # Initialize services
    startup_tasks = [
        ("Database", initialize_database()),
        ("MinIO", initialize_minio()),
        ("Redis", initialize_redis())
    ]
    
    startup_results = {}
    for service_name, task in startup_tasks:
        try:
            result = await task
            startup_results[service_name] = result
            status = "✓" if result else "✗"
            logger.info(f"{status} {service_name} initialization: {'Success' if result else 'Failed'}")
        except Exception as e:
            startup_results[service_name] = False
            logger.error(f"✗ {service_name} initialization failed: {e}")
    
    # Start WebSocket broadcaster if Redis is available
    if startup_results.get("Redis", False):
        try:
            await broadcaster.start()
            logger.info("✓ WebSocket broadcaster started")
        except Exception as e:
            logger.error(f"✗ WebSocket broadcaster failed: {e}")
    
    # Store startup results for health checks
    app.state.startup_results = startup_results
    app.state.startup_time = datetime.now(timezone.utc)
    
    logger.info("Medical AI Platform started successfully")
    
    yield
    
    # Cleanup on shutdown
    logger.info("Shutting down Medical AI Platform...")
    
    try:
        await broadcaster.stop()
        logger.info("✓ WebSocket broadcaster stopped")
    except Exception as e:
        logger.error(f"Error stopping broadcaster: {e}")
    
    try:
        await cleanup_redis()
        logger.info("✓ Redis connections closed")
    except Exception as e:
        logger.error(f"Error closing Redis: {e}")
    
    logger.info("Medical AI Platform shutdown complete")


# ========================================
# FastAPI Application Setup
# ========================================

app = FastAPI(
    title="Enhanced Medical AI Platform",
    description="Comprehensive medical AI analysis platform with real-time features",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS configuration for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

# Security middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "*.localhost"]
)


# ========================================
# Global Exception Handlers
# ========================================

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for unhandled errors"""
    
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "path": str(request.url.path) if hasattr(request, 'url') else None
        }
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc: HTTPException):
    """Handle HTTP exceptions with consistent format"""
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "path": str(request.url.path) if hasattr(request, 'url') else None
        }
    )


# ========================================
# Health Check and System Status
# ========================================

@app.get("/", response_model=Dict[str, Any])
async def root():
    """Root endpoint with system information"""
    
    return {
        "service": "Enhanced Medical AI Platform",
        "version": "2.0.0",
        "status": "operational",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "documentation": "/docs",
        "features": {
            "ai_analysis": True,
            "real_time_updates": True,
            "medical_imaging": True,
            "patient_management": True,
            "system_monitoring": True
        }
    }


@app.get("/health", response_model=Dict[str, Any])
async def comprehensive_health_check():
    """Comprehensive health check for all services"""
    
    try:
        startup_results = getattr(app.state, 'startup_results', {})
        startup_time = getattr(app.state, 'startup_time', datetime.now(timezone.utc))
        
        # Check individual service health
        health_checks = {
            "api": {"status": "healthy", "message": "API is operational"},
            "database": {"status": "unknown", "message": "Not checked"},
            "minio": {"status": "unknown", "message": "Not checked"},
            "redis": {"status": "unknown", "message": "Not checked"}
        }
        
        # Database health
        try:
            await db.get_collection("users").count_documents({}, limit=1)
            health_checks["database"] = {"status": "healthy", "message": "Database connected"}
        except Exception as e:
            health_checks["database"] = {"status": "unhealthy", "message": f"Database error: {str(e)}"}
        
        # Redis health (if available)
        if redis_client.initialized:
            redis_health = await redis_client.health_check()
            health_checks["redis"] = redis_health
        else:
            health_checks["redis"] = {"status": "unavailable", "message": "Redis not initialized"}
        
        # MinIO health (basic check)
        if startup_results.get("MinIO", False):
            health_checks["minio"] = {"status": "healthy", "message": "MinIO initialized"}
        else:
            health_checks["minio"] = {"status": "unavailable", "message": "MinIO not available"}
        
        # WebSocket health
        ws_stats = await get_websocket_stats()
        health_checks["websocket"] = {
            "status": "healthy" if ws_stats.get("broadcaster_running", False) else "degraded",
            "active_connections": ws_stats.get("total_connections", 0),
            "active_rooms": ws_stats.get("total_rooms", 0)
        }
        
        # Overall health assessment
        unhealthy_services = [
            service for service, check in health_checks.items()
            if check.get("status") == "unhealthy"
        ]
        
        overall_status = (
            "healthy" if not unhealthy_services 
            else "degraded" if len(unhealthy_services) < len(health_checks) / 2
            else "unhealthy"
        )
        
        uptime_seconds = (datetime.now(timezone.utc) - startup_time).total_seconds()
        
        return {
            "status": overall_status,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "uptime_seconds": round(uptime_seconds),
            "startup_time": startup_time.isoformat(),
            "services": health_checks,
            "issues": unhealthy_services
        }
        
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return {
            "status": "unhealthy",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "error": "Health check failed",
            "message": str(e)
        }


# ========================================
# API Route Registration
# ========================================

# Authentication routes
app.include_router(
    auth_router,
    prefix="/api/auth",
    tags=["Authentication"]
)

# Patient management routes
app.include_router(
    patients_router,
    prefix="/api/patients",
    tags=["Patients"]
)

# Diagnosis and AI analysis routes
app.include_router(
    diagnosis_router,
    prefix="/api/diagnosis",
    tags=["Diagnosis & AI Analysis"]
)

# Medical images routes
app.include_router(
    images_router,
    prefix="/api/images",
    tags=["Medical Images"]
)

# System metrics and monitoring routes
app.include_router(
    metrics_router,
    prefix="/api/system",
    tags=["System Monitoring"]
)


# ========================================
# WebSocket Endpoints
# ========================================

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Main WebSocket endpoint for real-time updates"""
    await handle_websocket_connection(websocket)


@app.websocket("/ws/{user_id}")
async def websocket_user_endpoint(websocket: WebSocket, user_id: str):
    """User-specific WebSocket endpoint"""
    await handle_websocket_connection(websocket, user_id)


# ========================================
# Additional API Endpoints
# ========================================

@app.get("/api/system/status", response_model=Dict[str, Any])
async def get_system_status():
    """Get comprehensive system status"""
    
    try:
        # Get WebSocket statistics
        ws_stats = await get_websocket_stats()
        
        # Get database statistics
        try:
            db_stats = {
                "patients": await db.get_collection("patients").count_documents({}),
                "diagnoses": await db.get_collection("diagnoses").count_documents({}),
                "medical_images": await db.get_collection("medical_images").count_documents({}),
                "users": await db.get_collection("users").count_documents({})
            }
        except Exception:
            db_stats = {"error": "Database not available"}
        
        # Get Redis statistics
        if redis_client.initialized:
            redis_info = await redis_client.get_info()
        else:
            redis_info = {"status": "not_initialized"}
        
        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "api_status": "operational",
            "websocket": ws_stats,
            "database": db_stats,
            "redis": redis_info,
            "features": {
                "real_time_analysis": True,
                "image_processing": True,
                "patient_management": True,
                "system_monitoring": True
            }
        }
        
    except Exception as e:
        logger.error(f"System status error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get system status")


@app.get("/api/version", response_model=Dict[str, Any])
async def get_version():
    """Get application version and build information"""
    
    return {
        "version": "2.0.0",
        "build_date": "2024-01-15",
        "api_version": "v2",
        "python_version": "3.11+",
        "framework": "FastAPI",
        "features": [
            "Enhanced Authentication",
            "Real-time WebSocket Communication", 
            "Medical Image Analysis",
            "Patient Management System",
            "AI Diagnosis Workflow",
            "System Monitoring Dashboard",
            "MinIO Object Storage",
            "Redis Caching & Sessions"
        ],
        "endpoints": {
            "auth": "/api/auth",
            "patients": "/api/patients", 
            "diagnosis": "/api/diagnosis",
            "images": "/api/images",
            "system": "/api/system",
            "websocket": "/ws"
        }
    }


# ========================================
# Development Server Configuration
# ========================================

if __name__ == "__main__":
    logger.info("Starting Enhanced Medical AI Platform in development mode...")
    
    uvicorn.run(
        "enhanced_main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
        access_log=True
    )