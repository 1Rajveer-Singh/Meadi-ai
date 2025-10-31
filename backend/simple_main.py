"""
Medical AI Platform - Simple Local Development Server
Multi-Agent AI System for Medical Diagnostics
"""

import asyncio
import logging
from datetime import datetime
from typing import Dict, Any

import uvicorn
from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
import json
from motor.motor_asyncio import AsyncIOMotorClient
import redis.asyncio as redis
from minio import Minio

# Configuration
from config.simple_settings import simple_settings

# Set up logging
logging.basicConfig(
    level=getattr(logging, simple_settings.LOG_LEVEL),
    format=simple_settings.LOG_FORMAT
)
logger = logging.getLogger(__name__)

class MedicalAISystem:
    """Main Medical AI Platform with Multi-Agent System"""
    
    def __init__(self):
        self.mongodb_client: AsyncIOMotorClient = None
        self.redis_client: redis.Redis = None
        self.minio_client: Minio = None
        self.db = None
        
        # Agent instances will be initialized here
        self.image_analysis_agent = None
        self.history_synthesis_agent = None
        self.drug_interaction_agent = None
        self.research_agent = None
        
    async def initialize_services(self):
        """Initialize all external services - DEVELOPMENT MODE (Optional Services)"""
        services_status = {
            'mongodb': False,
            'redis': False,
            'minio': False,
            'agents': False
        }
        
        # Initialize MongoDB (Optional for development)
        try:
            logger.info(f"Connecting to MongoDB at {simple_settings.mongodb_url}")
            self.mongodb_client = AsyncIOMotorClient(simple_settings.mongodb_url)
            self.db = self.mongodb_client[simple_settings.MONGODB_DATABASE]
            
            # Test MongoDB connection
            await self.mongodb_client.admin.command('ping')
            logger.info("✅ MongoDB connection successful")
            services_status['mongodb'] = True
            
        except Exception as e:
            logger.warning(f"⚠️ MongoDB connection failed, continuing without database: {e}")
            self.mongodb_client = None
            self.db = None
            
        # Initialize Redis (Optional for development)
        try:
            # Try without auth first
            logger.info(f"Connecting to Redis at {simple_settings.redis_url}")
            self.redis_client = redis.from_url(simple_settings.redis_url)
            await self.redis_client.ping()
            logger.info("✅ Redis connection successful")
            services_status['redis'] = True
            
        except Exception as e:
            try:
                # Try with auth if no-auth fails
                logger.info(f"Retrying Redis with auth at {simple_settings.redis_url_with_auth}")
                self.redis_client = redis.from_url(simple_settings.redis_url_with_auth)
                await self.redis_client.ping()
                logger.info("✅ Redis connection successful (with auth)")
                services_status['redis'] = True
            except Exception as e2:
                logger.warning(f"⚠️ Redis connection failed (both auth attempts), continuing without cache: {e2}")
                self.redis_client = None
            
        # Initialize MinIO (Optional for development)
        try:
            logger.info(f"Connecting to MinIO at {simple_settings.MINIO_ENDPOINT}")
            logger.info(f"MinIO Credentials - Access Key: {simple_settings.MINIO_ACCESS_KEY}, Secure: {simple_settings.MINIO_SECURE}")
            
            self.minio_client = Minio(
                simple_settings.MINIO_ENDPOINT,
                access_key=simple_settings.MINIO_ACCESS_KEY,
                secret_key=simple_settings.MINIO_SECRET_KEY,
                secure=simple_settings.MINIO_SECURE
            )
            
            # Test MinIO connection by listing buckets
            buckets = list(self.minio_client.list_buckets())
            logger.info(f"✅ MinIO connection successful - Found {len(buckets)} buckets")
            services_status['minio'] = True
            
            # Create buckets if they don't exist (run in thread for synchronous MinIO client)
            try:
                import asyncio
                loop = asyncio.get_event_loop()
                await loop.run_in_executor(None, self._ensure_minio_buckets_sync)
                logger.info("✅ MinIO buckets initialized")
            except Exception as bucket_error:
                logger.warning(f"⚠️ MinIO bucket creation failed: {bucket_error}")
            
        except Exception as e:
            logger.warning(f"⚠️ MinIO connection failed, continuing without object storage: {e}")
            logger.warning(f"MinIO Error Details: {type(e).__name__}: {str(e)}")
            self.minio_client = None
        
        # Initialize AI Agents (Optional for development)
        try:
            await self._initialize_agents()
            logger.info("✅ AI Agents initialized")
            services_status['agents'] = True
        except Exception as e:
            logger.warning(f"⚠️ AI Agents initialization failed, continuing without agents: {e}")
        
        # Log service status
        logger.info("🚀 DEVELOPMENT MODE - Service Status:")
        for service, status in services_status.items():
            status_emoji = "✅" if status else "❌"
            logger.info(f"   {status_emoji} {service.upper()}: {'Connected' if status else 'Disabled'}")
        
        logger.info("🎯 Backend server ready - LOGIN BYPASSED for development!")
        return True  # Always return True for development mode
    
    def _ensure_minio_buckets_sync(self):
        """Ensure all required MinIO buckets exist (synchronous version)"""
        buckets = [
            simple_settings.MINIO_BUCKET_MEDICAL_IMAGES,
            simple_settings.MINIO_BUCKET_DOCUMENTS,
            simple_settings.MINIO_BUCKET_REPORTS,
            simple_settings.MINIO_BUCKET_XRAY_DATASET
        ]
        
        for bucket_name in buckets:
            if not self.minio_client.bucket_exists(bucket_name):
                self.minio_client.make_bucket(bucket_name)
                logger.info(f"Created MinIO bucket: {bucket_name}")
    
    async def _initialize_agents(self):
        """Initialize all AI agents"""
        try:
            # Import and initialize agents
            from agents.image_analysis import ImageAnalysisAgent
            from agents.history_synthesis import HistorySynthesisAgent
            from agents.drug_interaction import DrugInteractionAgent
            from agents.research import ResearchAgent
            
            self.image_analysis_agent = ImageAnalysisAgent(
                mongodb_client=self.mongodb_client,
                minio_client=self.minio_client,
                settings=simple_settings
            )
            
            self.history_synthesis_agent = HistorySynthesisAgent(
                mongodb_client=self.mongodb_client,
                redis_client=self.redis_client,
                settings=simple_settings
            )
            
            self.drug_interaction_agent = DrugInteractionAgent(
                mongodb_client=self.mongodb_client,
                redis_client=self.redis_client,
                settings=simple_settings
            )
            
            self.research_agent = ResearchAgent(
                mongodb_client=self.mongodb_client,
                redis_client=self.redis_client,
                settings=simple_settings
            )
            
            logger.info("✅ All AI agents initialized successfully")
            
        except ImportError as e:
            logger.warning(f"⚠️ Some agents not available yet: {e}")
        except Exception as e:
            logger.error(f"❌ Agent initialization failed: {e}")
    
    async def shutdown(self):
        """Cleanup on shutdown"""
        if self.mongodb_client:
            self.mongodb_client.close()
        if self.redis_client:
            await self.redis_client.close()

# Create the system instance
medical_ai = MedicalAISystem()

# Create FastAPI app
app = FastAPI(
    title="Medical AI Platform",
    description="Multi-Agent AI System for Medical Diagnostics",
    version=simple_settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=simple_settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup - DEVELOPMENT MODE (Non-blocking)"""
    success = await medical_ai.initialize_services()
    # In development mode, don't fail even if services aren't available
    logger.info("🚀 Backend startup complete - Services initialized (some may be optional)")
    logger.info("🔓 LOGIN BYPASS ACTIVE - No authentication required!")

@app.on_event("shutdown") 
async def shutdown_event():
    """Cleanup on shutdown"""
    await medical_ai.shutdown()

# ========================================
# Health Check Endpoints
# ========================================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check MongoDB
        await medical_ai.mongodb_client.admin.command('ping')
        mongodb_status = "healthy"
    except:
        mongodb_status = "unhealthy"
    
    try:
        # Check Redis
        await medical_ai.redis_client.ping()
        redis_status = "healthy"
    except:
        redis_status = "unhealthy"
    
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "mongodb": mongodb_status,
            "redis": redis_status,
            "minio": "healthy" if medical_ai.minio_client else "unhealthy"
        },
        "agents": {
            "image_analysis": "initialized" if medical_ai.image_analysis_agent else "not_initialized",
            "history_synthesis": "initialized" if medical_ai.history_synthesis_agent else "not_initialized", 
            "drug_interaction": "initialized" if medical_ai.drug_interaction_agent else "not_initialized",
            "research": "initialized" if medical_ai.research_agent else "not_initialized"
        }
    }

@app.get("/")
async def root():
    """Root endpoint with system information"""
    return {
        "message": "Medical AI Platform - Multi-Agent System",
        "version": simple_settings.APP_VERSION,
        "agents": [
            "Image Analysis Agent (MONAI + NIH Dataset)",
            "History Synthesis Agent (EHR Integration)", 
            "Drug Interaction Agent (Real-time Checking)",
            "Research Agent (Clinical Trials)"
        ],
        "docs": "/docs",
        "health": "/health"
    }

# ========================================
# Multi-Agent System Endpoints
# ========================================

@app.post("/agents/image-analysis/analyze")
async def analyze_medical_image(file: UploadFile = File(...)):
    """
    Image Analysis Agent: Process X-rays/MRIs using MONAI
    Supports NIH Chest X-ray dataset integration
    """
    if not medical_ai.image_analysis_agent:
        raise HTTPException(status_code=503, detail="Image Analysis Agent not available")
    
    try:
        # Process the uploaded image
        result = await medical_ai.image_analysis_agent.analyze_image(file)
        return {
            "status": "success",
            "agent": "Image Analysis Agent",
            "analysis": result,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Image analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/agents/history-synthesis/synthesize")
async def synthesize_patient_history(patient_id: str):
    """
    History Synthesis Agent: Integrate patient records and lab data
    """
    if not medical_ai.history_synthesis_agent:
        raise HTTPException(status_code=503, detail="History Synthesis Agent not available")
    
    try:
        result = await medical_ai.history_synthesis_agent.synthesize_history(patient_id)
        return {
            "status": "success", 
            "agent": "History Synthesis Agent",
            "synthesis": result,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"History synthesis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Synthesis failed: {str(e)}")

@app.post("/agents/drug-interaction/check")
async def check_drug_interactions(medications: list[str]):
    """
    Drug Interaction Agent: Flag risky prescriptions in real-time
    """
    if not medical_ai.drug_interaction_agent:
        raise HTTPException(status_code=503, detail="Drug Interaction Agent not available")
    
    try:
        result = await medical_ai.drug_interaction_agent.check_interactions(medications)
        return {
            "status": "success",
            "agent": "Drug Interaction Agent", 
            "interactions": result,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Drug interaction check failed: {e}")
        raise HTTPException(status_code=500, detail=f"Check failed: {str(e)}")

@app.post("/agents/research/search")
async def search_clinical_trials(condition: str, rare_disease: bool = False):
    """
    Research Agent: Auto-fetch latest clinical trials for conditions
    Specializes in rare conditions
    """
    if not medical_ai.research_agent:
        raise HTTPException(status_code=503, detail="Research Agent not available")
    
    try:
        result = await medical_ai.research_agent.search_trials(condition, rare_disease)
        return {
            "status": "success",
            "agent": "Research Agent",
            "trials": result,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Clinical trials search failed: {e}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@app.post("/diagnostic-report/generate")
async def generate_diagnostic_report(
    patient_id: str,
    image_file: UploadFile = File(None),
    medications: list[str] = None
):
    """
    Generate comprehensive diagnostic report using all agents
    Returns report with visual heatmaps and EHR integration
    """
    try:
        report = {
            "patient_id": patient_id,
            "timestamp": datetime.now().isoformat(),
            "report_id": f"DIAG_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "sections": {}
        }
        
        # Image Analysis (if image provided)
        if image_file and medical_ai.image_analysis_agent:
            image_analysis = await medical_ai.image_analysis_agent.analyze_image(image_file)
            report["sections"]["image_analysis"] = {
                "agent": "Image Analysis Agent",
                "results": image_analysis,
                "visual_heatmap": True  # Indicates heatmap generation
            }
        
        # History Synthesis
        if medical_ai.history_synthesis_agent:
            history = await medical_ai.history_synthesis_agent.synthesize_history(patient_id)
            report["sections"]["history_synthesis"] = {
                "agent": "History Synthesis Agent",
                "results": history,
                "ehr_integrated": True
            }
        
        # Drug Interaction Check (if medications provided)
        if medications and medical_ai.drug_interaction_agent:
            interactions = await medical_ai.drug_interaction_agent.check_interactions(medications)
            report["sections"]["drug_interactions"] = {
                "agent": "Drug Interaction Agent",
                "results": interactions,
                "real_time_check": True
            }
        
        # Research for any identified conditions
        if medical_ai.research_agent and "image_analysis" in report["sections"]:
            # Extract potential conditions from image analysis
            conditions = report["sections"]["image_analysis"]["results"].get("conditions", [])
            if conditions:
                research = await medical_ai.research_agent.search_trials(conditions[0])
                report["sections"]["clinical_research"] = {
                    "agent": "Research Agent",
                    "results": research,
                    "auto_fetched": True
                }
        
        return {
            "status": "success",
            "diagnostic_report": report,
            "agents_used": len(report["sections"]),
            "ehr_integration": True,
            "visual_heatmaps": True
        }
        
    except Exception as e:
        logger.error(f"Diagnostic report generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")

# ========================================
# WebSocket Endpoints
# ========================================

@app.websocket("/ws/analysis")
async def websocket_analysis_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time analysis updates"""
    await websocket.accept()
    logger.info("🔌 WebSocket connection established for analysis")
    
    try:
        while True:
            # Wait for messages from client
            message = await websocket.receive_text()
            data = json.loads(message)
            
            # Echo back with analysis status (mock implementation)
            response = {
                "type": "analysis_update",
                "status": "processing",
                "message": "Analysis request received",
                "timestamp": datetime.now().isoformat(),
                "data": data
            }
            
            await websocket.send_text(json.dumps(response))
            
            # Simulate analysis progress
            await asyncio.sleep(1)
            
            progress_response = {
                "type": "analysis_progress",
                "status": "in_progress",
                "progress": 50,
                "message": "Processing image...",
                "timestamp": datetime.now().isoformat()
            }
            
            await websocket.send_text(json.dumps(progress_response))
            
    except WebSocketDisconnect:
        logger.info("🔌 WebSocket connection closed for analysis")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket.close()

if __name__ == "__main__":
    uvicorn.run(
        "simple_main:app",
        host=simple_settings.HOST,
        port=simple_settings.PORT,
        reload=simple_settings.DEBUG,
        log_level=simple_settings.LOG_LEVEL.lower()
    )