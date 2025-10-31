"""
Medical Image Models
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from .base import BaseDocument, PyObjectId, ImageType


class ImageAnalysis(BaseModel):
    """Image analysis results"""
    processed: bool = False
    annotations: List[Dict[str, Any]] = []
    measurements: List[Dict[str, Any]] = []
    confidence_regions: List[Dict[str, Any]] = []


class MedicalImage(BaseDocument):
    """Medical image model"""
    image_id: str = Field(..., unique=True)  # Auto-generated unique ID
    diagnosis_id: Optional[PyObjectId] = None
    patient_id: PyObjectId
    
    # File information
    filename: str
    file_size: int
    mime_type: str
    file_path: str  # MinIO object path
    
    # Medical metadata
    image_type: Optional[ImageType] = None
    body_part: Optional[str] = None
    acquisition_date: Optional[datetime] = None
    modality: Optional[str] = None
    
    # AI Analysis results
    analysis: Optional[ImageAnalysis] = None
    
    uploaded_by: PyObjectId  # Reference to User


class ImageUpload(BaseModel):
    """Schema for image upload metadata"""
    diagnosis_id: Optional[str] = None
    patient_id: str
    image_type: Optional[ImageType] = None
    body_part: Optional[str] = None
    modality: Optional[str] = None


class ImageResponse(BaseModel):
    """Schema for image response"""
    id: str
    image_id: str
    filename: str
    file_size: int
    image_type: Optional[ImageType] = None
    analysis: Optional[ImageAnalysis] = None
    created_at: datetime


class ImageAnalysisResponse(BaseModel):
    """Legacy compatibility - image analysis response"""
    image_id: str
    analysis_results: Dict[str, Any]
    confidence: float
    processing_time: float