"""
AgenticAI HealthGuard - Python AI Services
Advanced FastAPI application for AI/ML medical processing
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks, Depends, status, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
import uvicorn
from typing import Optional, List, Dict, Any
import logging
import time
import sys
import json
from datetime import datetime, timedelta
import asyncio

# Import simplified coordinator and basic configurations
from config.coordinator import SimpleSimpleAgentCoordinator
from config.settings import settings
from config.database import Database
from config.redis_client import RedisClient
from config.minio_client import MinIOClient

# Import route modules
from routes.patients import patients_router
from routes.diagnosis import diagnosis_router
from routes.auth import auth_router
from routes.websocket_handler import manager
from routes.notifications import router as notifications_router

from models.schemas import (
    DiagnosisRequest,
    DiagnosisResponse,
    ImageAnalysisResponse,
    DrugCheckRequest,
    ResearchQuery,
    HealthResponse,
    UserCreate,
    UserLogin,
    TokenResponse,
    ErrorResponse,
    PatientCreate,
    PatientUpdate,
    PatientResponse,
    PaginatedPatients
)

# Configure advanced logging
logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format=settings.log_format,
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('healthguard.log') if settings.environment == 'production' else logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Global instances - simplified for standalone operation
db: Optional[Database] = None
redis_client: Optional[RedisClient] = None
minio_client: Optional[MinIOClient] = None
coordinator: Optional[SimpleSimpleAgentCoordinator] = None
security = HTTPBearer()


# ==================== Middleware ====================

class TimingMiddleware:
    """Custom middleware for request timing"""
    
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            start_time = time.time()
            
            async def send_wrapper(message):
                if message["type"] == "http.response.start":
                    process_time = time.time() - start_time
                    message["headers"].append((b"x-process-time", str(process_time).encode()))
                await send(message)
            
            await self.app(scope, receive, send_wrapper)
        else:
            await self.app(scope, receive, send)


# ==================== Exception Handlers ====================

async def global_exception_handler(request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Global exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            error="Internal Server Error",
            message="An unexpected error occurred",
            timestamp=datetime.utcnow()
        ).dict()
    )


async def http_exception_handler(request, exc: HTTPException):
    """HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error=exc.detail,
            message=f"HTTP {exc.status_code} Error",
            timestamp=datetime.utcnow()
        ).dict()
    )


# ==================== Lifespan Management ====================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Enhanced lifecycle manager for startup and shutdown events"""
    global db, redis_client, minio_client, coordinator
    
    logger.info("🚀 Starting AgenticAI HealthGuard Python Services...")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"Debug Mode: {settings.debug}")
    
    # Initialize services with optional dependencies for standalone mode
    try:
        # Try to initialize database (optional for demo mode)
        try:
            db = Database()
            await db.connect()
            logger.info("✅ MongoDB connected successfully")
        except Exception as e:
            logger.warning(f"⚠️ MongoDB not available, running in demo mode: {e}")
            db = None
        
        # Try to initialize Redis (optional for demo mode)
        try:
            redis_client = RedisClient()
            await redis_client.connect()
            logger.info("✅ Redis connected successfully")
        except Exception as e:
            logger.warning(f"⚠️ Redis not available, running in demo mode: {e}")
            redis_client = None
        
        # Try to initialize MinIO (optional for demo mode)
        try:
            minio_client = MinIOClient()
            await minio_client.initialize()
            logger.info("✅ MinIO initialized successfully")
        except Exception as e:
            logger.warning(f"⚠️ MinIO not available, running in demo mode: {e}")
            minio_client = None
            
            # Initialize simplified coordinator without complex dependencies
            coordinator = SimpleSimpleAgentCoordinator()
            
            # Mock agent registration for demo purposes
            coordinator.register_agent('monai', 'MONAI Image Analyzer')
            coordinator.register_agent('history', 'Medical History Synthesizer')
            coordinator.register_agent('drug_checker', 'Drug Interaction Checker')
            coordinator.register_agent('research', 'Medical Research Agent')
            
            logger.info("✅ Simple AI Agent Coordinator initialized successfully")
            
            # Warmup services
            await warmup_services()
            
            # Start WebSocket background tasks
            from routes.websocket_handler import periodic_updates
            asyncio.create_task(periodic_updates())
            logger.info("🔄 WebSocket background tasks started")
            
            logger.info("🎉 All services ready and warmed up!")
            break
            
        except Exception as e:
            logger.error(f"❌ Startup attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                logger.info(f"Retrying in {retry_delay} seconds...")
                await asyncio.sleep(retry_delay)
            else:
                logger.error("❌ Failed to start services after all retries")
                raise
    
    yield
    
    # Graceful shutdown
    logger.info("🛑 Shutting down services gracefully...")
    
    shutdown_tasks = []
    if coordinator:
        shutdown_tasks.append(coordinator.shutdown())
    if db:
        shutdown_tasks.append(db.disconnect())
    if redis_client:
        shutdown_tasks.append(redis_client.disconnect())
    if minio_client:
        shutdown_tasks.append(minio_client.cleanup())
    
    if shutdown_tasks:
        await asyncio.gather(*shutdown_tasks, return_exceptions=True)
    
    logger.info("✅ Graceful shutdown completed")


async def warmup_services():
    """Warmup services to reduce cold start times"""
    try:
        if db:
            await db.check_connection()
        if redis_client:
            await redis_client.ping()
        if minio_client:
            minio_client.check_connection()
        logger.info("✅ Services warmed up successfully")
    except Exception as e:
        logger.warning(f"⚠️ Service warmup warning: {e}")


# ==================== FastAPI App Initialization ====================

app = FastAPI(
    title=settings.app_name,
    description="Advanced Python-based AI/ML services for medical diagnosis and healthcare analytics",
    version=settings.version,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    lifespan=lifespan,
    responses={
        404: {"model": ErrorResponse},
        422: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    }
)

# Add exception handlers
app.add_exception_handler(Exception, global_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)

# Add middleware (order matters!)
app.add_middleware(TimingMiddleware)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# CORS middleware with enhanced security
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["x-process-time"]
)

# Trusted host middleware for production
if settings.environment == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["localhost", "127.0.0.1", "*.yourdomain.com"]
    )


# ==================== Router Registration ====================

# Include API routers
app.include_router(patients_router)
app.include_router(diagnosis_router)
app.include_router(auth_router)
app.include_router(notifications_router)


# ==================== WebSocket Endpoints ====================

@app.websocket("/ws/analysis")
async def websocket_analysis_endpoint(websocket: WebSocket):
    """
    🔌 WebSocket endpoint for real-time AI analysis communication
    Provides real-time updates during AI processing and agent coordination
    """
    await manager.connect(websocket)
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get('type') == 'start_analysis':
                # Generate unique session ID
                session_id = f"analysis_{int(time.time())}_{id(websocket)}"
                
                # Start AI analysis in background
                asyncio.create_task(
                    manager.start_analysis(session_id, message.get('data', {}))
                )
                
                # Send acknowledgment
                await manager.send_personal_message({
                    'type': 'analysis_started',
                    'session_id': session_id,
                    'message': 'AI analysis started successfully'
                }, websocket)
                
            elif message.get('type') == 'ping':
                # Health check
                await manager.send_personal_message({
                    'type': 'pong',
                    'timestamp': datetime.now().isoformat()
                }, websocket)
    
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)


# ==================== Dependency Injection ====================

async def get_db() -> Database:
    """Dependency to get database instance"""
    if not db:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database not initialized"
        )
    return db


async def get_coordinator() -> SimpleSimpleAgentCoordinator:
    """Dependency to get coordinator instance"""
    if not coordinator:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI services not initialized"
        )
    return coordinator


async def verify_api_key(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify API key for protected endpoints"""
    # For now, this is a placeholder. Implement proper JWT verification
    if not credentials or len(credentials.credentials) < 10:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key"
        )
    return credentials.credentials


# ==================== Health Check & Monitoring ====================

@app.get("/", include_in_schema=False)
async def root():
    """Root endpoint"""
    return {"message": f"Welcome to {settings.app_name} API", "version": settings.version}


@app.get("/health", response_model=HealthResponse, tags=["Monitoring"])
async def health_check():
    """Comprehensive health check endpoint"""
    try:
        # Check all services with timeout
        checks = {}
        
        if db:
            try:
                checks["mongodb"] = "connected" if await asyncio.wait_for(db.check_connection(), timeout=5.0) else "disconnected"
            except asyncio.TimeoutError:
                checks["mongodb"] = "timeout"
            except Exception:
                checks["mongodb"] = "error"
        
        if redis_client:
            try:
                checks["redis"] = "connected" if await asyncio.wait_for(redis_client.ping(), timeout=5.0) else "disconnected"
            except asyncio.TimeoutError:
                checks["redis"] = "timeout"
            except Exception:
                checks["redis"] = "error"
        
        if minio_client:
            try:
                checks["minio"] = "connected" if minio_client.check_connection() else "disconnected"
            except Exception:
                checks["minio"] = "error"
        
        checks["ai_agents"] = "operational" if coordinator else "not_initialized"
        
        # Determine overall status
        critical_services = ["mongodb", "redis", "minio"]
        all_critical_healthy = all(checks.get(service) == "connected" for service in critical_services)
        
        status = "healthy" if all_critical_healthy and coordinator else "degraded"
        if any(checks.get(service) == "error" for service in critical_services):
            status = "unhealthy"
        
        return HealthResponse(
            status=status,
            timestamp=datetime.utcnow(),
            services=checks
        )
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return HealthResponse(
            status="unhealthy",
            timestamp=datetime.utcnow(),
            services={"error": str(e)}
        )


@app.get("/metrics", tags=["Monitoring"])
async def get_metrics():
    """Get application metrics"""
    try:
        metrics = {
            "uptime": time.time() - start_time if 'start_time' in globals() else 0,
            "environment": settings.environment,
            "version": settings.version,
            "debug": settings.debug
        }
        
        if coordinator:
            metrics.update(await coordinator.get_metrics())
        
        return metrics
        
    except Exception as e:
        logger.error(f"Failed to get metrics: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve metrics")


# ==================== Image Analysis ====================

@app.post("/api/ai/analyze-image", response_model=ImageAnalysisResponse, tags=["AI Services"])
async def analyze_image(
    file: UploadFile = File(...),
    patient_id: Optional[str] = None,
    modality: Optional[str] = None,
    coordinator_service: SimpleAgentCoordinator = Depends(get_coordinator)
):
    """
    Analyze medical image using advanced AI
    
    Supports: X-Ray, CT, MRI, Ultrasound, DICOM
    Returns detailed findings with confidence scores
    """
    try:
        # Validate file type
        if file.content_type not in settings.allowed_image_types_list:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type. Allowed: {settings.allowed_image_types_list}"
            )
        
        # Check file size
        content = await file.read()
        if len(content) > settings.max_file_size:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size: {settings.max_file_size} bytes"
            )
        
        # Process with image analyzer agent
        result = await coordinator_service.image_agent.analyze(
            image_data=content,
            filename=file.filename,
            patient_id=patient_id,
            modality=modality
        )
        
        logger.info(f"Image analysis completed for {file.filename}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Image analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Image analysis failed: {str(e)}")


# ==================== Complete Diagnosis ====================

@app.post("/api/ai/diagnose", response_model=DiagnosisResponse, tags=["AI Services"])
async def process_diagnosis(
    request: DiagnosisRequest,
    background_tasks: BackgroundTasks,
    coordinator_service: SimpleAgentCoordinator = Depends(get_coordinator)
):
    """
    Complete AI-powered diagnosis workflow
    
    Coordinates multiple AI agents for comprehensive medical analysis:
    - Image analysis
    - Medical history synthesis
    - Drug interaction checking
    - Research literature review
    """
    try:
        # Validate request
        if not request.patient_id:
            raise HTTPException(status_code=400, detail="Patient ID is required")
        
        if not request.symptoms and not request.image_ids:
            raise HTTPException(
                status_code=400, 
                detail="At least symptoms or image IDs must be provided"
            )
        
        # Process with agent coordinator
        result = await coordinator_service.process_diagnosis(request)
        
        # Add background task for additional processing
        background_tasks.add_task(
            coordinator_service.post_process_diagnosis,
            diagnosis_id=result.diagnosis_id
        )
        
        logger.info(f"Diagnosis completed for patient {request.patient_id}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Diagnosis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Diagnosis failed: {str(e)}")


# ==================== Drug Interaction Check ====================

@app.post("/api/ai/check-drugs", tags=["AI Services"])
async def check_drug_interactions(
    request: DrugCheckRequest,
    coordinator_service: SimpleAgentCoordinator = Depends(get_coordinator)
):
    """
    Advanced drug interaction and contraindication analysis
    
    Checks for:
    - Drug-drug interactions
    - Drug-condition contraindications
    - Dosage recommendations
    - Allergy warnings
    """
    try:
        if not request.medications:
            raise HTTPException(status_code=400, detail="Medications list cannot be empty")
        
        result = await coordinator_service.drug_agent.check_interactions(
            medications=request.medications,
            patient_id=request.patient_id,
            conditions=request.conditions
        )
        
        logger.info(f"Drug interaction check completed for {len(request.medications)} medications")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Drug check failed: {e}")
        raise HTTPException(status_code=500, detail=f"Drug interaction check failed: {str(e)}")


# ==================== Research Query ====================

@app.post("/api/ai/research", tags=["AI Services"])
async def query_research(
    request: ResearchQuery,
    coordinator_service: SimpleAgentCoordinator = Depends(get_coordinator)
):
    """
    Query medical research databases and literature
    
    Sources:
    - PubMed (medical literature)
    - ClinicalTrials.gov
    - Cochrane Library
    - Medical guidelines
    """
    try:
        if not request.query or len(request.query.strip()) < 3:
            raise HTTPException(status_code=400, detail="Query must be at least 3 characters long")
        
        if request.limit > 50:
            raise HTTPException(status_code=400, detail="Limit cannot exceed 50 results")
        
        result = await coordinator_service.research_agent.search(
            query=request.query,
            sources=request.sources,
            limit=request.limit
        )
        
        logger.info(f"Research query completed for: {request.query}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Research query failed: {e}")
        raise HTTPException(status_code=500, detail=f"Research query failed: {str(e)}")


# ==================== AI Agent Management ====================

@app.get("/api/ai/agents/status", tags=["AI Management"])
async def get_agents_status(coordinator_service: SimpleAgentCoordinator = Depends(get_coordinator)):
    """Get detailed status of all AI agents"""
    try:
        return await coordinator_service.get_agents_status()
    except Exception as e:
        logger.error(f"Failed to get agent status: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve agent status")


@app.post("/api/ai/agents/restart", tags=["AI Management"])
async def restart_agents(coordinator_service: SimpleAgentCoordinator = Depends(get_coordinator)):
    """Restart all AI agents (admin endpoint)"""
    try:
        await coordinator_service.restart_agents()
        return {"message": "AI agents restarted successfully"}
    except Exception as e:
        logger.error(f"Failed to restart agents: {e}")
        raise HTTPException(status_code=500, detail="Failed to restart AI agents")


# ==================== Diagnosis Status Tracking ====================

@app.get("/api/ai/diagnosis/{diagnosis_id}/status", tags=["AI Services"])
async def get_diagnosis_status(
    diagnosis_id: str,
    coordinator_service: SimpleAgentCoordinator = Depends(get_coordinator)
):
    """Get real-time status of diagnosis processing"""
    try:
        status = await coordinator_service.get_diagnosis_status(diagnosis_id)
        
        if not status:
            raise HTTPException(status_code=404, detail="Diagnosis not found")
        
        return status
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get diagnosis status: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve diagnosis status")


@app.get("/api/ai/diagnosis/{diagnosis_id}/results", tags=["AI Services"])
async def get_diagnosis_results(
    diagnosis_id: str,
    coordinator_service: SimpleAgentCoordinator = Depends(get_coordinator)
):
    """Get complete diagnosis results"""
    try:
        results = await coordinator_service.get_diagnosis_results(diagnosis_id)
        
        if not results:
            raise HTTPException(status_code=404, detail="Diagnosis results not found")
        
        return results
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get diagnosis results: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve diagnosis results")


# ==================== Authentication Endpoints ====================

@app.post("/api/auth/login", response_model=TokenResponse, tags=["Authentication"])
async def login_user(user_data: UserLogin):
    """User login endpoint"""
    try:
        # For now, return a mock token for testing
        # In production, implement proper authentication
        return TokenResponse(
            access_token="mock_token_12345",
            token_type="bearer",
            expires_in=3600,
            user_id="user_123"
        )
    except Exception as e:
        logger.error(f"Login failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )


@app.post("/api/auth/register", response_model=TokenResponse, tags=["Authentication"])
async def register_user(user_data: UserCreate):
    """User registration endpoint"""
    try:
        # For now, return a mock token for testing
        # In production, implement proper registration
        return TokenResponse(
            access_token="mock_token_12345",
            token_type="bearer",
            expires_in=3600,
            user_id="user_456"
        )
    except Exception as e:
        logger.error(f"Registration failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration failed"
        )


# ==================== Application Startup ====================

# Store startup time for metrics
start_time = time.time()

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level=settings.log_level.lower(),
        access_log=settings.debug,
        workers=1 if settings.debug else 4
    )
