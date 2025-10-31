"""Authentication routes for user management"""

from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from typing import Dict, Any
import logging
import hashlib
from datetime import datetime, timedelta

from config.database import Database
from models.schemas import UserCreate, UserLogin, TokenResponse, UserProfile, ErrorResponse

logger = logging.getLogger(__name__)

# Database dependency
def get_db():
    return Database()

# Simple auth manager (replace with proper JWT implementation)
class SimpleAuthManager:
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password using SHA-256 (use bcrypt in production)"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    @staticmethod
    def verify_password(password: str, hashed: str) -> bool:
        """Verify password"""
        return hashlib.sha256(password.encode()).hexdigest() == hashed
    
    @staticmethod
    def create_access_token(user_data: dict) -> str:
        """Create access token (simplified - use JWT in production)"""
        return f"token_{user_data['user_id']}_{int(datetime.utcnow().timestamp())}"

auth_manager = SimpleAuthManager()

# Security scheme
security = HTTPBearer()

# Auth dependency functions
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Database = Depends(get_db)
) -> Dict[str, Any]:
    """Get current user from token"""
    try:
        token = credentials.credentials
        # Simple token validation (replace with proper JWT)
        if not token.startswith("token_"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token format"
            )
        
        # Extract user_id from token
        parts = token.split("_")
        if len(parts) < 2:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        user_id = parts[1]
        user = await db.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        return user
        
    except Exception as e:
        logger.error(f"Error getting current user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

async def get_current_active_user(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get current active user"""
    if not current_user.get("is_active", False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user

# Create router
auth_router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@auth_router.post("/register", response_model=TokenResponse)
async def register_user(
    user_data: UserCreate,
    db: Database = Depends(get_db)
):
    """Register a new user"""
    try:
        # Check if user already exists
        existing_user = await db.get_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash password
        hashed_password = auth_manager.hash_password(user_data.password)
        
        # Generate user ID
        user_id = f"U-{int(datetime.utcnow().timestamp() * 1000)}"
        
        # Create user data
        user_doc = {
            "user_id": user_id,
            "email": user_data.email,
            "password_hash": hashed_password,
            "name": user_data.name,
            "role": user_data.role,
            "department": user_data.department,
            "is_active": True,
            "created_at": datetime.utcnow(),
            "last_login": None
        }
        
        # Save user
        user_id = await db.create_user(user_doc)
        
        # Create access token
        token_data = {
            "user_id": user_id,
            "email": user_data.email,
            "role": user_data.role
        }
        access_token = auth_manager.create_access_token(token_data)
        
        # Log registration
        await db.log_action(user_id, "user_registered", {"email": user_data.email})
        
        logger.info(f"User registered successfully: {user_data.email}")
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=auth_manager.access_token_expire_minutes * 60,
            user_id=user_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"User registration failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )


@auth_router.post("/login", response_model=TokenResponse)
async def login_user(
    login_data: UserLogin,
    db: Database = Depends()
):
    """Authenticate user and return access token"""
    try:
        # Get user by email
        user = await db.get_user_by_email(login_data.email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Verify password
        if not auth_manager.verify_password(login_data.password, user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Check if user is active
        if not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is disabled"
            )
        
        # Update last login
        await db.update_user(str(user["_id"]), {"last_login": datetime.utcnow()})
        
        # Create access token
        token_data = {
            "user_id": str(user["_id"]),
            "email": user["email"],
            "role": user.get("role", "user")
        }
        access_token = auth_manager.create_access_token(token_data)
        
        # Log login
        await db.log_action(str(user["_id"]), "user_login", {"email": user["email"]})
        
        logger.info(f"User logged in successfully: {login_data.email}")
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=auth_manager.access_token_expire_minutes * 60,
            user_id=str(user["_id"])
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"User login failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )


@auth_router.get("/profile", response_model=UserProfile)
async def get_user_profile(
    current_user: Dict[str, Any] = Depends(get_current_active_user),
    db: Database = Depends()
):
    """Get current user profile"""
    try:
        # Get full user data from database
        user = await db.get_user_by_id(current_user["user_id"])
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserProfile(
            user_id=str(user["_id"]),
            email=user["email"],
            full_name=user["full_name"],
            role=user.get("role", "user"),
            created_at=user["created_at"],
            last_login=user.get("last_login"),
            is_active=user.get("is_active", True)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user profile"
        )


@auth_router.post("/refresh")
async def refresh_token(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Refresh access token"""
    try:
        # Create new access token
        token_data = {
            "user_id": current_user["user_id"],
            "email": current_user["email"],
            "role": current_user["role"]
        }
        access_token = auth_manager.create_access_token(token_data)
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=auth_manager.access_token_expire_minutes * 60,
            user_id=current_user["user_id"]
        )
        
    except Exception as e:
        logger.error(f"Token refresh failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed"
        )


@auth_router.post("/logout")
async def logout_user(
    current_user: Dict[str, Any] = Depends(get_current_active_user),
    db: Database = Depends()
):
    """Logout user (invalidate token)"""
    try:
        # Log logout action
        await db.log_action(current_user["user_id"], "user_logout", {"email": current_user["email"]})
        
        # In a real implementation, you would add the token to a blacklist
        # For now, we'll just return a success message
        
        logger.info(f"User logged out successfully: {current_user['email']}")
        
        return {"message": "Successfully logged out"}
        
    except Exception as e:
        logger.error(f"Logout failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed"
        )


@auth_router.get("/verify")
async def verify_token(
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    """Verify if token is valid"""
    return {
        "valid": True,
        "user_id": current_user["user_id"],
        "email": current_user["email"],
        "role": current_user["role"]
    }