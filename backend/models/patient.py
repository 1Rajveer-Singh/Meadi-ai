"""
Patient Management Models
"""

from datetime import datetime
from typing import Optional, List, Literal
from pydantic import BaseModel, Field, EmailStr
from .base import BaseDocument, PyObjectId, PatientStatus, RiskLevel


class ContactInfo(BaseModel):
    """Patient contact information"""
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None


class EmergencyContact(BaseModel):
    """Emergency contact information"""
    name: str
    phone: str
    relationship: str


class MedicalHistory(BaseModel):
    """Patient medical history"""
    conditions: List[str] = []
    allergies: List[str] = []
    medications: List[str] = []
    previous_diagnoses: List[PyObjectId] = []


class Patient(BaseDocument):
    """Patient model"""
    patient_id: str = Field(..., unique=True)  # Auto-generated unique ID
    name: str = Field(..., min_length=2, max_length=100)
    age: Optional[int] = Field(None, ge=0, le=150)
    gender: Optional[Literal["male", "female", "other"]] = None
    date_of_birth: Optional[datetime] = None
    contact_info: Optional[ContactInfo] = None
    emergency_contact: Optional[EmergencyContact] = None
    medical_history: Optional[MedicalHistory] = None
    risk_level: RiskLevel = RiskLevel.LOW
    status: PatientStatus = PatientStatus.ACTIVE
    created_by: PyObjectId  # Reference to User


class PatientCreate(BaseModel):
    """Schema for patient creation"""
    name: str = Field(..., min_length=2, max_length=100)
    age: Optional[int] = Field(None, ge=0, le=150)
    gender: Optional[Literal["male", "female", "other"]] = None
    date_of_birth: Optional[datetime] = None
    contact_info: Optional[ContactInfo] = None
    emergency_contact: Optional[EmergencyContact] = None
    medical_history: Optional[MedicalHistory] = None
    risk_level: RiskLevel = RiskLevel.LOW


class PatientUpdate(BaseModel):
    """Schema for patient updates"""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    age: Optional[int] = Field(None, ge=0, le=150)
    gender: Optional[Literal["male", "female", "other"]] = None
    date_of_birth: Optional[datetime] = None
    contact_info: Optional[ContactInfo] = None
    emergency_contact: Optional[EmergencyContact] = None
    medical_history: Optional[MedicalHistory] = None
    risk_level: Optional[RiskLevel] = None
    status: Optional[PatientStatus] = None


class PatientResponse(BaseModel):
    """Schema for patient response"""
    id: str
    patient_id: str
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    contact_info: Optional[ContactInfo] = None
    risk_level: RiskLevel
    status: PatientStatus
    created_at: datetime
    updated_at: datetime


class PaginatedPatients(BaseModel):
    """Paginated patients response"""
    patients: List[PatientResponse]
    total: int
    page: int
    per_page: int
    pages: int
    has_next: bool
    has_prev: bool