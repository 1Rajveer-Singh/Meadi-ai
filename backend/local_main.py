"""
Local Development FastAPI Application
Runs Python backend locally with Docker services (MongoDB, Redis, MinIO)
"""

import asyncio
import logging
import sys
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import uvicorn

# Local configuration
from config.local_settings import local_settings

# Setup logging
logging.basicConfig(
    level=getattr(logging, local_settings.LOG_LEVEL),
    format=local_settings.LOG_FORMAT
)
logger = logging.getLogger(__name__)

# Import routes (with error handling for missing dependencies)
try:
    from routes.enhanced_auth import auth_router
    from routes.enhanced_patients import router as patients_router
    from routes.enhanced_diagnosis import router as diagnosis_router
    from routes.enhanced_medical_images import router as images_router
    from routes.enhanced_system_metrics import router as metrics_router
except ImportError as e:
    logger.error(f"Failed to import routes: {e}")
    logger.info("Some routes may not be available. Install missing dependencies.")
    # Create dummy routers to prevent app crash
    from fastapi import APIRouter
    auth_router = APIRouter(prefix="/api/auth", tags=["auth"])
    patients_router = APIRouter(prefix="/api/patients", tags=["patients"])
    diagnosis_router = APIRouter(prefix="/api/diagnosis", tags=["diagnosis"])
    images_router = APIRouter(prefix="/api/images", tags=["images"])
    metrics_router = APIRouter(prefix="/api/metrics", tags=["metrics"])

# Database and service connections
db_client = None
redis_client = None
minio_client = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle manager"""
    global db_client, redis_client, minio_client
    
    logger.info("🚀 Starting Medical AI Platform (Local Development)")
    
    # Initialize services
    startup_success = True
    
    # MongoDB connection
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        db_client = AsyncIOMotorClient(local_settings.mongodb_url)
        # Test connection
        await db_client.admin.command('ping')
        logger.info("✅ MongoDB connected successfully")
    except Exception as e:
        logger.error(f"❌ MongoDB connection failed: {e}")
        startup_success = False
    
    # Redis connection
    try:
        import redis.asyncio as redis
        redis_client = redis.from_url(local_settings.redis_url)
        # Test connection
        await redis_client.ping()
        logger.info("✅ Redis connected successfully")
    except Exception as e:
        logger.error(f"❌ Redis connection failed: {e}")
        startup_success = False
    
    # MinIO connection
    try:
        from minio import Minio
        minio_client = Minio(
            local_settings.MINIO_ENDPOINT,
            access_key=local_settings.MINIO_ACCESS_KEY,
            secret_key=local_settings.MINIO_SECRET_KEY,
            secure=local_settings.MINIO_SECURE
        )
        # Test connection and create buckets
        buckets = [
            local_settings.MINIO_BUCKET_MEDICAL_IMAGES,
            local_settings.MINIO_BUCKET_DOCUMENTS,
            local_settings.MINIO_BUCKET_REPORTS
        ]
        for bucket in buckets:
            if not minio_client.bucket_exists(bucket):
                minio_client.make_bucket(bucket)
                logger.info(f"📁 Created MinIO bucket: {bucket}")
        logger.info("✅ MinIO connected successfully")
    except Exception as e:
        logger.error(f"❌ MinIO connection failed: {e}")
        startup_success = False
    
    if startup_success:
        logger.info("🎉 All services connected successfully!")
    else:
        logger.warning("⚠️ Some services failed to connect. Check Docker containers.")
    
    # Store clients in app state
    app.state.db = db_client
    app.state.redis = redis_client
    app.state.minio = minio_client
    app.state.settings = local_settings
    
    yield
    
    # Cleanup
    logger.info("🛑 Shutting down Medical AI Platform")
    if db_client:
        db_client.close()
    if redis_client:
        await redis_client.close()


# Create FastAPI app
app = FastAPI(
    title=local_settings.APP_NAME,
    version=local_settings.APP_VERSION,
    description="Medical AI Platform - Local Development Server",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=local_settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", local_settings.HOST]
)

# Create upload directory
upload_dir = Path(local_settings.UPLOAD_DIR)
upload_dir.mkdir(exist_ok=True)

# Mount static files
if upload_dir.exists():
    app.mount("/uploads", StaticFiles(directory=str(upload_dir)), name="uploads")

# Health check endpoint
@app.get("/health", tags=["system"])
async def health_check():
    """Health check endpoint"""
    services_status = {}
    
    # Check MongoDB
    try:
        if app.state.db:
            await app.state.db.admin.command('ping')
            services_status["mongodb"] = "healthy"
        else:
            services_status["mongodb"] = "not_connected"
    except Exception:
        services_status["mongodb"] = "unhealthy"
    
    # Check Redis
    try:
        if app.state.redis:
            await app.state.redis.ping()
            services_status["redis"] = "healthy"
        else:
            services_status["redis"] = "not_connected"
    except Exception:
        services_status["redis"] = "unhealthy"
    
    # Check MinIO
    try:
        if app.state.minio:
            # Simple check - list buckets
            list(app.state.minio.list_buckets())
            services_status["minio"] = "healthy"
        else:
            services_status["minio"] = "not_connected"
    except Exception:
        services_status["minio"] = "unhealthy"
    
    return {
        "status": "ok",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "services": services_status,
        "environment": "local_development"
    }

# Root endpoint
@app.get("/", tags=["system"])
async def root():
    """Root endpoint"""
    return {
        "message": "Medical AI Platform - Local Development",
        "version": local_settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health",
        "environment": "local_development"
    }

# Include routers
app.include_router(auth_router)
app.include_router(patients_router)
app.include_router(diagnosis_router)
app.include_router(images_router)
app.include_router(metrics_router)

# Error handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Global error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "type": "server_error"}
    )


# Development server runner
if __name__ == "__main__":
    logger.info("🏥 Starting Medical AI Platform - Local Development")
    logger.info(f"📊 Debug mode: {local_settings.DEBUG}")
    logger.info(f"🌐 Server: http://{local_settings.HOST}:{local_settings.PORT}")
    logger.info(f"📚 API Docs: http://{local_settings.HOST}:{local_settings.PORT}/docs")
    logger.info("🐳 Make sure Docker services are running: docker-compose -f docker-compose.services.yml up -d")
    
    uvicorn.run(
        "local_main:app",
        host=local_settings.HOST,
        port=local_settings.PORT,
        reload=True,  # Auto-reload on code changes
        log_level=local_settings.LOG_LEVEL.lower(),
        access_log=True
    )