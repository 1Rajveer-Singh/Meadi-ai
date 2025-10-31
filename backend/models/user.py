"""
User Authentication Models
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, EmailStr
from .base import BaseDocument, UserRole


class UserProfile(BaseModel):
    """User profile information"""
    specialization: Optional[str] = None
    license_number: Optional[str] = None
    hospital: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None


class User(BaseDocument):
    """User model for authentication and authorization"""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password_hash: str
    full_name: str = Field(..., min_length=2, max_length=100)
    role: UserRole = UserRole.DOCTOR
    is_active: bool = True
    last_login: Optional[datetime] = None
    profile: Optional[UserProfile] = None


class UserCreate(BaseModel):
    """Schema for user creation"""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=2, max_length=100)
    role: UserRole = UserRole.DOCTOR
    profile: Optional[UserProfile] = None


class UserLogin(BaseModel):
    """Schema for user login"""
    username: str
    password: str


class UserResponse(BaseModel):
    """Schema for user response (without password)"""
    id: str
    username: str
    email: str
    full_name: str
    role: UserRole
    is_active: bool
    last_login: Optional[datetime] = None
    profile: Optional[UserProfile] = None
    created_at: datetime


class TokenResponse(BaseModel):
    """JWT token response"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse