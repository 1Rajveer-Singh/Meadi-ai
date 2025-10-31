"""
Enhanced Authentication Routes
JWT-based authentication system for Medical AI Platform
"""

from fastapi import APIRouter, HTTPException, status, Depends, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import logging
from bson import ObjectId

from models.user import User, UserCreate, UserLogin, UserResponse, TokenResponse
from models.base import ErrorResponse
try:
    from config.local_settings import local_settings as settings
except ImportError:
    from config.settings import settings
try:
    from config.enhanced_database import enhanced_db as db
except ImportError:
    from config.database import db

logger = logging.getLogger(__name__)

# Initialize router
auth_router = APIRouter(prefix="/auth", tags=["Authentication"])

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Security
security = HTTPBearer()

# JWT Configuration
SECRET_KEY = getattr(settings, 'jwt_secret_key', "your-secret-key-change-in-production")
ALGORITHM = getattr(settings, 'jwt_algorithm', "HS256")
ACCESS_TOKEN_EXPIRE_HOURS = getattr(settings, 'jwt_expiration_hours', 24)


class AuthManager:
    """Enhanced authentication manager"""
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def get_password_hash(password: str) -> str:
        """Hash password"""
        return pwd_context.hash(password)
    
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
        """Create JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    async def authenticate_user(username: str, password: str) -> Optional[Dict[str, Any]]:
        """Authenticate user with username and password"""
        try:
            # Get user from database
            user_doc = await db.get_collection("users").find_one({"username": username})
            if not user_doc:
                return None
            
            # Verify password
            if not AuthManager.verify_password(password, user_doc["password_hash"]):
                return None
            
            # Update last login
            await db.get_collection("users").update_one(
                {"_id": user_doc["_id"]},
                {"$set": {"last_login": datetime.now(timezone.utc)}}
            )
            
            # Convert ObjectId to string for response
            user_doc["id"] = str(user_doc["_id"])
            return user_doc
            
        except Exception as e:
            logger.error(f"Authentication error: {e}")
            return None


auth_manager = AuthManager()


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """Get current user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        
        # Get user from database
        user_doc = await db.get_collection("users").find_one({"username": username})
        if user_doc is None:
            raise credentials_exception
        
        user_doc["id"] = str(user_doc["_id"])
        return user_doc
        
    except JWTError:
        raise credentials_exception


async def get_current_active_user(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """Get current active user"""
    if not current_user.get("is_active", True):
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


# ========================================
# Authentication Endpoints
# ========================================

@auth_router.post("/register", response_model=UserResponse)
async def register_user(user_data: UserCreate):
    """Register a new user"""
    try:
        # Check if user already exists
        existing_user = await db.get_collection("users").find_one({
            "$or": [
                {"username": user_data.username},
                {"email": user_data.email}
            ]
        })
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username or email already registered"
            )
        
        # Hash password
        hashed_password = auth_manager.get_password_hash(user_data.password)
        
        # Create user document
        user_doc = {
            "username": user_data.username,
            "email": user_data.email,
            "password_hash": hashed_password,
            "full_name": user_data.full_name,
            "role": user_data.role,
            "is_active": True,
            "profile": user_data.profile.dict() if user_data.profile else None,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        
        # Insert user
        result = await db.get_collection("users").insert_one(user_doc)
        user_id = str(result.inserted_id)
        
        # Return user response
        return UserResponse(
            id=user_id,
            username=user_data.username,
            email=user_data.email,
            full_name=user_data.full_name,
            role=user_data.role,
            is_active=True,
            profile=user_data.profile,
            created_at=user_doc["created_at"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )


@auth_router.post("/login", response_model=TokenResponse)
async def login_for_access_token(user_credentials: UserLogin):
    """Login and get access token"""
    try:
        # Authenticate user
        user = await auth_manager.authenticate_user(
            user_credentials.username, 
            user_credentials.password
        )
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create access token
        access_token_expires = timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
        access_token = auth_manager.create_access_token(
            data={"sub": user["username"]}, 
            expires_delta=access_token_expires
        )
        
        # Create user response
        user_response = UserResponse(
            id=user["id"],
            username=user["username"],
            email=user["email"],
            full_name=user["full_name"],
            role=user["role"],
            is_active=user["is_active"],
            last_login=user.get("last_login"),
            profile=user.get("profile"),
            created_at=user["created_at"]
        )
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=ACCESS_TOKEN_EXPIRE_HOURS * 3600,
            user=user_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )


@auth_router.post("/logout")
async def logout(current_user: Dict[str, Any] = Depends(get_current_active_user)):
    """Logout current user"""
    try:
        # In a production system, you would invalidate the token here
        # For now, we just return success
        return {"message": "Successfully logged out"}
        
    except Exception as e:
        logger.error(f"Logout error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed"
        )


@auth_router.get("/profile", response_model=UserResponse)
async def get_current_user_profile(current_user: Dict[str, Any] = Depends(get_current_active_user)):
    """Get current user profile"""
    try:
        return UserResponse(
            id=current_user["id"],
            username=current_user["username"],
            email=current_user["email"],
            full_name=current_user["full_name"],
            role=current_user["role"],
            is_active=current_user["is_active"],
            last_login=current_user.get("last_login"),
            profile=current_user.get("profile"),
            created_at=current_user["created_at"]
        )
        
    except Exception as e:
        logger.error(f"Get profile error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user profile"
        )


@auth_router.put("/profile", response_model=UserResponse)
async def update_user_profile(
    profile_update: dict,
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    """Update current user profile"""
    try:
        # Update allowed fields
        update_data = {}
        allowed_fields = ["full_name", "profile"]
        
        for field in allowed_fields:
            if field in profile_update:
                update_data[field] = profile_update[field]
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid fields to update"
            )
        
        update_data["updated_at"] = datetime.now(timezone.utc)
        
        # Update user in database
        await db.get_collection("users").update_one(
            {"_id": ObjectId(current_user["id"])},
            {"$set": update_data}
        )
        
        # Get updated user
        updated_user = await db.get_collection("users").find_one({"_id": ObjectId(current_user["id"])})
        updated_user["id"] = str(updated_user["_id"])
        
        return UserResponse(
            id=updated_user["id"],
            username=updated_user["username"],
            email=updated_user["email"],
            full_name=updated_user["full_name"],
            role=updated_user["role"],
            is_active=updated_user["is_active"],
            last_login=updated_user.get("last_login"),
            profile=updated_user.get("profile"),
            created_at=updated_user["created_at"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update profile error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )


@auth_router.post("/refresh", response_model=TokenResponse)
async def refresh_access_token(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Refresh access token"""
    try:
        # Create new access token
        access_token_expires = timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
        access_token = auth_manager.create_access_token(
            data={"sub": current_user["username"]}, 
            expires_delta=access_token_expires
        )
        
        # Create user response
        user_response = UserResponse(
            id=current_user["id"],
            username=current_user["username"],
            email=current_user["email"],
            full_name=current_user["full_name"],
            role=current_user["role"],
            is_active=current_user["is_active"],
            last_login=current_user.get("last_login"),
            profile=current_user.get("profile"),
            created_at=current_user["created_at"]
        )
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=ACCESS_TOKEN_EXPIRE_HOURS * 3600,
            user=user_response
        )
        
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to refresh token"
        )