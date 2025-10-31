"""
Diagnosis and AI Analysis Models
"""

from datetime import datetime
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field
from .base import BaseDocument, PyObjectId, DiagnosisStatus, Priority, AgentStatus


class PatientData(BaseModel):
    """Patient data for diagnosis"""
    symptoms: List[str] = []
    vital_signs: Dict[str, Any] = {}
    medical_history: Dict[str, Any] = {}


class AIConfig(BaseModel):
    """AI analysis configuration"""
    models: List[str] = ["vision-transformer", "cnn-ensemble"]
    analysis_depth: Literal["basic", "standard", "comprehensive"] = "comprehensive"
    confidence_threshold: float = Field(0.85, ge=0.0, le=1.0)
    explainability_mode: bool = True
    real_time_processing: bool = True
    multi_modal_fusion: bool = True


class Finding(BaseModel):
    """Medical finding from AI analysis"""
    region: str
    finding: str
    confidence: float = Field(..., ge=0.0, le=100.0)
    agent: str
    coordinates: Optional[Dict[str, Any]] = None


class DiagnosisResults(BaseModel):
    """Diagnosis results from AI analysis"""
    primary_diagnosis: Optional[str] = None
    secondary_diagnoses: List[str] = []
    confidence: float = Field(0.0, ge=0.0, le=100.0)
    severity: Optional[str] = None
    findings: List[Finding] = []
    recommendations: List[str] = []


class AgentReport(BaseModel):
    """Individual AI agent report"""
    status: AgentStatus = AgentStatus.READY
    progress: float = Field(0.0, ge=0.0, le=100.0)
    accuracy: Optional[float] = Field(None, ge=0.0, le=100.0)
    processing_time: Optional[float] = None
    findings: List[Dict[str, Any]] = []
    confidence: Optional[float] = Field(None, ge=0.0, le=100.0)
    interactions_found: Optional[int] = None
    severity: Optional[str] = None
    papers_found: Optional[int] = None
    evidence_level: Optional[str] = None
    references: List[Dict[str, Any]] = []


class AgentsReports(BaseModel):
    """All AI agents reports"""
    monai: Optional[AgentReport] = None
    history: Optional[AgentReport] = None
    drug_checker: Optional[AgentReport] = None
    research: Optional[AgentReport] = None


class ProgressTracking(BaseModel):
    """Progress tracking for diagnosis"""
    percentage: float = Field(0.0, ge=0.0, le=100.0)
    current_stage: str = "initialized"
    stages_completed: List[str] = []
    estimated_completion: Optional[datetime] = None


class Diagnosis(BaseDocument):
    """Diagnosis model"""
    diagnosis_id: str = Field(..., unique=True)  # Auto-generated unique ID
    patient_id: PyObjectId
    status: DiagnosisStatus = DiagnosisStatus.PENDING
    priority: Priority = Priority.ROUTINE
    completed_at: Optional[datetime] = None
    
    # Input data
    patient_data: Optional[PatientData] = None
    ai_config: Optional[AIConfig] = None
    
    # Analysis results
    results: Optional[DiagnosisResults] = None
    agents_reports: Optional[AgentsReports] = None
    
    # Progress tracking
    progress: Optional[ProgressTracking] = None
    
    # Metadata
    created_by: PyObjectId  # Reference to User


class DiagnosisCreate(BaseModel):
    """Schema for diagnosis creation"""
    patient_id: str  # Will be converted to ObjectId
    priority: Priority = Priority.ROUTINE
    patient_data: Optional[PatientData] = None
    ai_config: Optional[AIConfig] = None


class DiagnosisUpdate(BaseModel):
    """Schema for diagnosis updates"""
    status: Optional[DiagnosisStatus] = None
    patient_data: Optional[PatientData] = None
    results: Optional[DiagnosisResults] = None
    agents_reports: Optional[AgentsReports] = None
    progress: Optional[ProgressTracking] = None


class DiagnosisResponse(BaseModel):
    """Schema for diagnosis response"""
    id: str
    diagnosis_id: str
    patient_id: str
    status: DiagnosisStatus
    priority: Priority
    progress: Optional[ProgressTracking] = None
    results: Optional[DiagnosisResults] = None
    created_at: datetime
    updated_at: datetime


class DiagnosisRequest(BaseModel):
    """Legacy compatibility - diagnosis request"""
    patient_id: str
    priority: str = "routine"
    patient_data: Optional[Dict[str, Any]] = None