"""Models package for the Medical AI Platform"""

# Import all models and schemas for easy access
from .base import *
from .user import *
from .patient import *
from .diagnosis import *
from .image import *
from .websocket import *

# Legacy compatibility - import from schemas.py
try:
    from .schemas import *
except ImportError:
    pass

__all__ = [
    # Base models
    "BaseDocument",
    "PyObjectId",
    "HealthResponse", 
    "ErrorResponse",
    "PaginationParams",
    
    # Enums
    "UserRole",
    "PatientStatus", 
    "RiskLevel",
    "DiagnosisStatus",
    "Priority",
    "AgentStatus", 
    "ImageType",
    
    # User models
    "User",
    "UserCreate",
    "UserLogin", 
    "UserResponse",
    "TokenResponse",
    "UserProfile",
    
    # Patient models
    "Patient",
    "PatientCreate",
    "PatientUpdate",
    "PatientResponse", 
    "PaginatedPatients",
    "ContactInfo",
    "EmergencyContact",
    "MedicalHistory",
    
    # Diagnosis models
    "Diagnosis",
    "DiagnosisCreate",
    "DiagnosisUpdate",
    "DiagnosisResponse",
    "DiagnosisRequest",
    "PatientData",
    "AIConfig",
    "Finding", 
    "DiagnosisResults",
    "AgentReport",
    "AgentsReports",
    "ProgressTracking",
    
    # Image models
    "MedicalImage",
    "ImageUpload",
    "ImageResponse",
    "ImageAnalysisResponse",
    "ImageAnalysis",
    
    # WebSocket models
    "SystemMetrics",
    "SystemMetricsLog",
    "WebSocketMessage",
    "AgentStatusMessage", 
    "AnalysisProgressMessage",
]
