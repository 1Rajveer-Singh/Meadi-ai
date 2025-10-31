"""
MongoDB Models and Pydantic Schemas
Comprehensive data models for the Medical AI Platform
"""

from datetime import datetime, timezone
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field, EmailStr, validator
from bson import ObjectId
from enum import Enum


class HealthResponse(BaseModel):
    """Health check response"""
    status: str = Field(..., description="Overall system health status")
    timestamp: datetime = Field(..., description="Timestamp of health check")
    services: Dict[str, str] = Field(..., description="Status of individual services")


class ErrorResponse(BaseModel):
    """Standard error response"""
    error: str = Field(..., description="Error type or code")
    message: str = Field(..., description="Human-readable error message")
    timestamp: datetime = Field(..., description="Timestamp of error")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional error details")


# ==================== Patient Schemas ====================

class PatientCreate(BaseModel):
    """Create patient request"""
    name: str = Field(..., min_length=2, max_length=100, description="Patient full name")
    email: EmailStr = Field(..., description="Patient email address")
    phone: Optional[str] = Field(None, description="Patient phone number")
    date_of_birth: Optional[datetime] = Field(None, description="Patient date of birth")
    gender: Optional[str] = Field(None, description="Patient gender")
    address: Optional[str] = Field(None, description="Patient address")
    emergency_contact: Optional[Dict[str, str]] = Field(None, description="Emergency contact info")
    medical_history: Optional[List[str]] = Field(default=[], description="Medical history")
    allergies: Optional[List[str]] = Field(default=[], description="Known allergies")
    current_medications: Optional[List[str]] = Field(default=[], description="Current medications")
    insurance_info: Optional[Dict[str, str]] = Field(None, description="Insurance information")
    condition: Optional[str] = Field(None, description="Primary medical condition")
    risk_level: str = Field(default="medium", description="Risk level assessment")


class PatientUpdate(BaseModel):
    """Update patient request"""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = Field(None)
    phone: Optional[str] = Field(None)
    date_of_birth: Optional[datetime] = Field(None)
    gender: Optional[str] = Field(None)
    address: Optional[str] = Field(None)
    emergency_contact: Optional[Dict[str, str]] = Field(None)
    medical_history: Optional[List[str]] = Field(None)
    allergies: Optional[List[str]] = Field(None)
    current_medications: Optional[List[str]] = Field(None)
    insurance_info: Optional[Dict[str, str]] = Field(None)
    condition: Optional[str] = Field(None)
    risk_level: Optional[str] = Field(None)


class PatientResponse(BaseModel):
    """Patient response"""
    success: bool = Field(..., description="Request success status")
    data: Optional[Dict[str, Any]] = Field(None, description="Patient data")
    message: Optional[str] = Field(None, description="Response message")


class PaginatedPatients(BaseModel):
    """Paginated patients response"""
    success: bool = Field(..., description="Request success status")
    data: List[Dict[str, Any]] = Field(..., description="List of patients")
    pagination: Dict[str, int] = Field(..., description="Pagination info")


class PatientStats(BaseModel):
    """Patient statistics"""
    success: bool = Field(..., description="Request success status")
    data: Dict[str, Any] = Field(..., description="Patient statistics")


class PatientHistory(BaseModel):
    """Patient medical history"""
    success: bool = Field(..., description="Request success status")
    data: List[Dict[str, Any]] = Field(..., description="Patient history records")


class PatientNote(BaseModel):
    """Patient note"""
    note_id: str = Field(..., description="Unique note identifier")
    content: str = Field(..., description="Note content")
    author: str = Field(..., description="Note author")
    created_at: datetime = Field(..., description="Creation timestamp")
    note_type: str = Field(default="general", description="Type of note")


class PatientDocument(BaseModel):
    """Patient document"""
    document_id: str = Field(..., description="Unique document identifier")
    filename: str = Field(..., description="Document filename")
    file_type: str = Field(..., description="Document file type")
    size: int = Field(..., description="File size in bytes")
    uploaded_at: datetime = Field(..., description="Upload timestamp")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Document metadata")


# ==================== Diagnosis Schemas ====================

class DiagnosisStatus(BaseModel):
    """Diagnosis status response"""
    diagnosis_id: str = Field(..., description="Diagnosis identifier")
    status: str = Field(..., description="Current status")
    progress: float = Field(..., ge=0.0, le=100.0, description="Progress percentage")
    current_step: str = Field(..., description="Current processing step")
    agents_status: Dict[str, Dict] = Field(..., description="Individual agent statuses")
    estimated_completion: Optional[datetime] = Field(None, description="Estimated completion time")
    updated_at: datetime = Field(..., description="Last update timestamp")


class DiagnosisResults(BaseModel):
    """Complete diagnosis results"""
    diagnosis_id: str = Field(..., description="Diagnosis identifier")
    primary_diagnosis: str = Field(..., description="Primary diagnosis")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Overall confidence")
    differential_diagnoses: List[Dict[str, Any]] = Field(..., description="Alternative diagnoses")
    severity: str = Field(..., description="Condition severity")
    recommendations: List[str] = Field(..., description="Treatment recommendations")
    agent_reports: Dict[str, Dict] = Field(..., description="Individual agent reports")
    processing_time: float = Field(..., description="Total processing time")


class PaginatedDiagnoses(BaseModel):
    """Paginated diagnoses response"""
    success: bool = Field(..., description="Request success status")
    data: List[Dict[str, Any]] = Field(..., description="List of diagnoses")
    pagination: Dict[str, int] = Field(..., description="Pagination info")


class DiagnosisTimeline(BaseModel):
    """Diagnosis timeline"""
    diagnosis_id: str = Field(..., description="Diagnosis identifier")
    events: List[Dict[str, Any]] = Field(..., description="Timeline events")


class DiagnosisComment(BaseModel):
    """Diagnosis comment"""
    comment_id: str = Field(..., description="Unique comment identifier")
    diagnosis_id: str = Field(..., description="Related diagnosis ID")
    content: str = Field(..., description="Comment content")
    author: str = Field(..., description="Comment author")
    created_at: datetime = Field(..., description="Creation timestamp")


# ==================== Authentication Schemas ====================

class UserCreate(BaseModel):
    """User registration request"""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=8, description="User password")
    name: str = Field(..., min_length=2, max_length=100, description="User full name")
    role: Optional[str] = Field(default="user", description="User role")
    department: Optional[str] = Field(None, description="User department")


class UserLogin(BaseModel):
    """User login request"""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="User password")


class TokenResponse(BaseModel):
    """Authentication token response"""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiration in seconds")
    user_id: str = Field(..., description="User identifier")
    user: Optional[Dict[str, Any]] = Field(None, description="User information")


class UserProfile(BaseModel):
    """User profile response"""
    id: str = Field(..., description="User identifier")
    email: EmailStr = Field(..., description="User email")
    name: str = Field(..., description="User full name")
    role: str = Field(..., description="User role")
    department: Optional[str] = Field(None, description="User department")
    avatar: Optional[str] = Field(None, description="Avatar URL or initials")
    permissions: List[str] = Field(default=[], description="User permissions")
    created_at: datetime = Field(..., description="Account creation date")
    last_login: Optional[datetime] = Field(None, description="Last login timestamp")


class ImageAnalysisResponse(BaseModel):
    """Image analysis result"""
    success: bool = Field(..., description="Whether analysis succeeded")
    image_id: str = Field(..., description="Unique identifier for the analyzed image")
    findings: List[Dict[str, Any]] = Field(..., description="List of medical findings")
    modality: str = Field(..., description="Image modality (X-Ray, CT, MRI, etc.)")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Overall confidence score")
    processing_time: float = Field(..., description="Processing time in seconds")
    annotations: Optional[List[Dict]] = Field(None, description="Visual annotations on image")
    quality_metrics: Optional[Dict[str, float]] = Field(None, description="Image quality metrics")


class DiagnosisRequest(BaseModel):
    """Diagnosis request"""
    patient_id: str = Field(..., description="Unique patient identifier")
    image_ids: List[str] = Field(default=[], description="List of image IDs to analyze")
    symptoms: List[str] = Field(default=[], description="List of patient symptoms")
    medical_history: Optional[Dict] = Field(None, description="Patient medical history")
    current_medications: Optional[List[str]] = Field(None, description="Current medications")
    vital_signs: Optional[Dict[str, float]] = Field(None, description="Current vital signs")
    priority: str = Field(default="normal", description="Diagnosis priority level")
    
    @validator('priority')
    def validate_priority(cls, v):
        allowed = ['low', 'normal', 'high', 'urgent']
        if v not in allowed:
            raise ValueError(f'Priority must be one of: {allowed}')
        return v


class DiagnosisResponse(BaseModel):
    """Diagnosis response"""
    success: bool = Field(..., description="Whether diagnosis succeeded")
    diagnosis_id: str = Field(..., description="Unique diagnosis identifier")
    primary_diagnosis: str = Field(..., description="Primary diagnosis")
    differential_diagnoses: List[Dict[str, Any]] = Field(..., description="Alternative diagnoses")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Overall confidence score")
    severity: str = Field(..., description="Condition severity level")
    recommendations: List[str] = Field(..., description="Treatment recommendations")
    image_analysis: Dict = Field(..., description="Image analysis results")
    drug_interactions: Optional[Dict] = Field(None, description="Drug interaction analysis")
    research_references: Optional[List[Dict]] = Field(None, description="Relevant research papers")
    processing_time: float = Field(..., description="Total processing time in seconds")
    urgency_level: Optional[str] = Field(None, description="Clinical urgency assessment")


class DrugCheckRequest(BaseModel):
    """Drug interaction check request"""
    medications: List[str] = Field(..., min_items=1, description="List of medications to check")
    patient_id: Optional[str] = Field(None, description="Patient identifier")
    conditions: Optional[List[str]] = Field(None, description="Patient medical conditions")
    allergies: Optional[List[str]] = Field(None, description="Known allergies")
    age: Optional[int] = Field(None, ge=0, le=150, description="Patient age")
    weight: Optional[float] = Field(None, gt=0, description="Patient weight in kg")


class DrugCheckResponse(BaseModel):
    """Drug interaction check response"""
    success: bool = Field(..., description="Whether check succeeded")
    interactions: List[Dict[str, Any]] = Field(..., description="Found drug interactions")
    warnings: List[Dict[str, Any]] = Field(..., description="Warnings and precautions")
    contraindications: List[Dict[str, Any]] = Field(..., description="Contraindications")
    dosage_recommendations: Optional[List[Dict]] = Field(None, description="Dosage suggestions")
    monitoring_requirements: Optional[List[str]] = Field(None, description="Required monitoring")


class ResearchQuery(BaseModel):
    """Research query request"""
    query: str = Field(..., min_length=3, description="Search query")
    sources: List[str] = Field(default=["pubmed", "clinicaltrials"], description="Research sources")
    limit: int = Field(default=10, ge=1, le=50, description="Maximum results to return")
    filters: Optional[Dict[str, Any]] = Field(None, description="Additional search filters")
    date_range: Optional[Dict[str, str]] = Field(None, description="Publication date range")


class ResearchResponse(BaseModel):
    """Research query response"""
    success: bool = Field(..., description="Whether search succeeded")
    query: str = Field(..., description="Original search query")
    total_results: int = Field(..., description="Total number of results found")
    results: List[Dict[str, Any]] = Field(..., description="Research results")
    sources_searched: List[str] = Field(..., description="Sources that were searched")
    search_time: float = Field(..., description="Search time in seconds")


class DiagnosisStatus(BaseModel):
    """Diagnosis processing status"""
    diagnosis_id: str = Field(..., description="Diagnosis identifier")
    status: str = Field(..., description="Current processing status")
    progress: float = Field(..., ge=0.0, le=1.0, description="Completion progress")
    current_agent: Optional[str] = Field(None, description="Currently active agent")
    agents_completed: List[str] = Field(default=[], description="Completed agents")
    estimated_time_remaining: Optional[float] = Field(None, description="ETA in seconds")
    error: Optional[str] = Field(None, description="Error message if failed")
    created_at: datetime = Field(..., description="Diagnosis start time")
    updated_at: datetime = Field(..., description="Last update time")


# User Authentication Models
class UserCreate(BaseModel):
    """User creation request"""
    email: str = Field(..., description="User email address")
    password: str = Field(..., min_length=8, description="User password")
    full_name: str = Field(..., min_length=2, description="User full name")
    role: str = Field(default="user", description="User role")
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v


class UserLogin(BaseModel):
    """User login request"""
    email: str = Field(..., description="User email address")
    password: str = Field(..., description="User password")


class TokenResponse(BaseModel):
    """Authentication token response"""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiration time in seconds")
    user_id: str = Field(..., description="User identifier")


class UserProfile(BaseModel):
    """User profile information"""
    user_id: str = Field(..., description="User identifier")
    email: str = Field(..., description="User email")
    full_name: str = Field(..., description="User full name")
    role: str = Field(..., description="User role")
    created_at: datetime = Field(..., description="Account creation time")
    last_login: Optional[datetime] = Field(None, description="Last login time")
    is_active: bool = Field(default=True, description="Account status")


# Agent Status Models
class AgentStatus(BaseModel):
    """Individual agent status"""
    name: str = Field(..., description="Agent name")
    status: str = Field(..., description="Agent status")
    last_activity: datetime = Field(..., description="Last activity timestamp")
    processing_queue: int = Field(..., description="Number of items in processing queue")
    success_rate: float = Field(..., ge=0.0, le=1.0, description="Success rate")
    average_processing_time: float = Field(..., description="Average processing time")


class SystemMetrics(BaseModel):
    """System performance metrics"""
    uptime: float = Field(..., description="System uptime in seconds")
    total_requests: int = Field(..., description="Total requests processed")
    active_diagnoses: int = Field(..., description="Currently active diagnoses")
    success_rate: float = Field(..., ge=0.0, le=1.0, description="Overall success rate")
    average_response_time: float = Field(..., description="Average response time")
    memory_usage: Dict[str, float] = Field(..., description="Memory usage statistics")
    cpu_usage: float = Field(..., description="CPU usage percentage")
