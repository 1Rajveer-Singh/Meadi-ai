"""
Base Models and Common Types
"""

from datetime import datetime, timezone
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from bson import ObjectId
from enum import Enum


# For now, just use string for ObjectId references to avoid Pydantic v2 issues
PyObjectId = str


# ========================================
# Enums and Constants
# ========================================

class UserRole(str, Enum):
    ADMIN = "admin"
    DOCTOR = "doctor" 
    PATIENT = "patient"
    NURSE = "nurse"

class PatientStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    DISCHARGED = "discharged"

class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class DiagnosisStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    FAILED = "failed"

class Priority(str, Enum):
    ROUTINE = "routine"
    URGENT = "urgent"
    EMERGENCY = "emergency"

class AgentStatus(str, Enum):
    READY = "ready"
    PROCESSING = "processing"
    COMPLETE = "complete"
    ERROR = "error"
    OFFLINE = "offline"

class ImageType(str, Enum):
    XRAY = "x-ray"
    CT = "ct"
    MRI = "mri"
    ULTRASOUND = "ultrasound"
    MAMMOGRAPHY = "mammography"
    PET = "pet"
    DICOM = "dicom"


# ========================================
# Base Model with Common Fields
# ========================================

class BaseDocument(BaseModel):
    """Base document with common fields"""
    id: Optional[str] = Field(default=None, alias="_id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )


# ========================================
# Response Models
# ========================================

class HealthResponse(BaseModel):
    """Health check response"""
    status: Literal["healthy", "degraded", "unhealthy"]
    timestamp: datetime
    services: Dict[str, bool]
    version: str = "1.0.0"

class ErrorResponse(BaseModel):
    """Error response schema"""
    error: str
    message: str
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PaginationParams(BaseModel):
    """Pagination parameters"""
    page: int = Field(1, ge=1)
    per_page: int = Field(20, ge=1, le=100)
    sort_by: Optional[str] = "created_at"
    sort_order: Literal["asc", "desc"] = "desc"