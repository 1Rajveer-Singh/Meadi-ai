"""MongoDB database connection and operations"""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase, AsyncIOMotorCollection
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from pymongo import ASCENDING, DESCENDING
import logging
from typing import Optional, Dict, Any, List
import asyncio
from datetime import datetime, timedelta
from .settings import settings

logger = logging.getLogger(__name__)


class Database:
    """Enhanced MongoDB database manager with connection pooling and error handling"""
    
    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.db: Optional[AsyncIOMotorDatabase] = None
        self.collections: Dict[str, AsyncIOMotorCollection] = {}
        
    async def connect(self):
        """Connect to MongoDB with retry logic and connection pooling"""
        max_retries = 3
        retry_delay = 2
        
        for attempt in range(max_retries):
            try:
                # Create client with optimized settings
                self.client = AsyncIOMotorClient(
                    settings.mongodb_uri,
                    maxPoolSize=100,
                    minPoolSize=10,
                    maxIdleTimeMS=30000,
                    waitQueueTimeoutMS=5000,
                    connectTimeoutMS=10000,
                    serverSelectionTimeoutMS=5000,
                    socketTimeoutMS=30000,
                    retryWrites=True
                )
                
                # Get database
                self.db = self.client[settings.database_name]
                
                # Test connection
                await self.client.admin.command('ping')
                
                # Initialize collections
                await self._setup_collections()
                
                logger.info("✅ MongoDB connected successfully with connection pooling")
                return True
                
            except (ConnectionFailure, ServerSelectionTimeoutError) as e:
                logger.warning(f"❌ MongoDB connection attempt {attempt + 1} failed: {e}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(retry_delay)
                    retry_delay *= 2  # Exponential backoff
                else:
                    logger.error("❌ Failed to connect to MongoDB after all retries")
                    raise
            except Exception as e:
                logger.error(f"❌ Unexpected error connecting to MongoDB: {e}")
                raise
    
    async def _setup_collections(self):
        """Setup collections and indexes for optimal performance"""
        try:
            # Define collections with their indexes
            collection_configs = {
                'patients': [
                    ('patient_id', ASCENDING),
                    ('email', ASCENDING),
                    ('created_at', DESCENDING)
                ],
                'diagnoses': [
                    ('diagnosis_id', ASCENDING),
                    ('patient_id', ASCENDING),
                    ('created_at', DESCENDING),
                    ('status', ASCENDING)
                ],
                'images': [
                    ('image_id', ASCENDING),
                    ('patient_id', ASCENDING),
                    ('modality', ASCENDING),
                    ('created_at', DESCENDING)
                ],
                'drug_interactions': [
                    ('drug_names', ASCENDING),
                    ('interaction_type', ASCENDING)
                ],
                'research_cache': [
                    ('query_hash', ASCENDING),
                    ('created_at', DESCENDING)
                ],
                'users': [
                    ('email', ASCENDING),
                    ('user_id', ASCENDING),
                    ('created_at', DESCENDING)
                ],
                'audit_logs': [
                    ('timestamp', DESCENDING),
                    ('user_id', ASCENDING),
                    ('action', ASCENDING)
                ]
            }
            
            # Create collections and indexes
            for collection_name, indexes in collection_configs.items():
                collection = self.db[collection_name]
                self.collections[collection_name] = collection
                
                # Create indexes
                for index_fields in indexes:
                    try:
                        await collection.create_index([index_fields])
                    except Exception as e:
                        logger.warning(f"Index creation warning for {collection_name}: {e}")
            
            logger.info("✅ Database collections and indexes set up successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to setup collections: {e}")
            raise
    
    async def disconnect(self):
        """Disconnect from MongoDB"""
        try:
            if self.client:
                self.client.close()
                logger.info("✅ MongoDB disconnected successfully")
        except Exception as e:
            logger.error(f"❌ Error disconnecting from MongoDB: {e}")
    
    async def check_connection(self) -> bool:
        """Check if database connection is healthy"""
        try:
            if not self.client:
                return False
            
            # Use a shorter timeout for health checks
            await asyncio.wait_for(self.client.admin.command('ping'), timeout=3.0)
            return True
            
        except Exception as e:
            logger.warning(f"Database health check failed: {e}")
            return False
    
    def get_collection(self, name: str) -> AsyncIOMotorCollection:
        """Get a collection by name"""
        if name in self.collections:
            return self.collections[name]
        
        # If collection not in cache, create it
        collection = self.db[name]
        self.collections[name] = collection
        return collection
    
    # ==================== Patient Operations ====================
    
    async def create_patient(self, patient_data: Dict[str, Any]) -> str:
        """Create a new patient record"""
        try:
            patient_data['created_at'] = datetime.utcnow()
            patient_data['updated_at'] = datetime.utcnow()
            
            collection = self.get_collection('patients')
            result = await collection.insert_one(patient_data)
            
            logger.info(f"Patient created with ID: {result.inserted_id}")
            return str(result.inserted_id)
            
        except Exception as e:
            logger.error(f"Failed to create patient: {e}")
            raise
    
    async def get_patient(self, patient_id: str) -> Optional[Dict[str, Any]]:
        """Get patient by ID"""
        try:
            collection = self.get_collection('patients')
            patient = await collection.find_one({'patient_id': patient_id})
            return patient
            
        except Exception as e:
            logger.error(f"Failed to get patient {patient_id}: {e}")
            raise
    
    async def update_patient(self, patient_id: str, update_data: Dict[str, Any]) -> bool:
        """Update patient record"""
        try:
            update_data['updated_at'] = datetime.utcnow()
            
            collection = self.get_collection('patients')
            result = await collection.update_one(
                {'patient_id': patient_id},
                {'$set': update_data}
            )
            
            return result.modified_count > 0
            
        except Exception as e:
            logger.error(f"Failed to update patient {patient_id}: {e}")
            raise
    
    async def get_patient_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get patient by email"""
        try:
            collection = self.get_collection('patients')
            patient = await collection.find_one({'email': email})
            return patient
            
        except Exception as e:
            logger.error(f"Failed to get patient by email {email}: {e}")
            raise

    async def get_patients_paginated(self, page: int, limit: int, filters: Dict = None, sort: List = None) -> Dict[str, Any]:
        """Get patients with pagination"""
        try:
            collection = self.get_collection('patients')
            
            # Calculate skip
            skip = (page - 1) * limit
            
            # Apply filters
            query = filters or {}
            
            # Get total count
            total = await collection.count_documents(query)
            
            # Build query with pagination
            cursor = collection.find(query).skip(skip).limit(limit)
            
            # Apply sorting
            if sort:
                cursor = cursor.sort(sort)
            
            # Execute query
            patients = await cursor.to_list(length=limit)
            
            return {
                "patients": patients,
                "total": total
            }
            
        except Exception as e:
            logger.error(f"Failed to get paginated patients: {e}")
            raise

    async def get_patient_statistics(self, patient_id: str) -> Dict[str, Any]:
        """Get patient statistics"""
        try:
            # Mock statistics for now - implement based on requirements
            stats = {
                "total_diagnoses": 0,
                "recent_visits": 0,
                "risk_score": 0.5,
                "last_visit": None
            }
            
            # Get actual diagnosis count
            diagnosis_collection = self.get_collection('diagnoses')
            stats["total_diagnoses"] = await diagnosis_collection.count_documents({"patient_id": patient_id})
            
            return stats
            
        except Exception as e:
            logger.error(f"Failed to get patient statistics: {e}")
            raise

    async def get_patient_history(self, patient_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get patient medical history"""
        try:
            collection = self.get_collection('diagnoses')
            
            # Get patient's diagnosis history
            cursor = collection.find({"patient_id": patient_id}).sort("created_at", -1).limit(limit)
            history = await cursor.to_list(length=limit)
            
            return history
            
        except Exception as e:
            logger.error(f"Failed to get patient history: {e}")
            raise

    async def get_patient_diagnoses(self, patient_id: str, page: int = 1, limit: int = 20) -> List[Dict[str, Any]]:
        """Get patient diagnoses with pagination"""
        try:
            collection = self.get_collection('diagnoses')
            
            skip = (page - 1) * limit
            cursor = collection.find({"patient_id": patient_id}).sort("created_at", -1).skip(skip).limit(limit)
            diagnoses = await cursor.to_list(length=limit)
            
            return diagnoses
            
        except Exception as e:
            logger.error(f"Failed to get patient diagnoses: {e}")
            raise

    async def get_patients_analytics(self) -> Dict[str, Any]:
        """Get patients analytics"""
        try:
            collection = self.get_collection('patients')
            
            # Mock analytics - implement based on requirements
            total_patients = await collection.count_documents({})
            active_patients = await collection.count_documents({"status": "active"})
            
            analytics = {
                "total_patients": total_patients,
                "active_patients": active_patients,
                "inactive_patients": total_patients - active_patients,
                "high_risk_patients": await collection.count_documents({"risk_level": "high"}),
                "medium_risk_patients": await collection.count_documents({"risk_level": "medium"}),
                "low_risk_patients": await collection.count_documents({"risk_level": "low"})
            }
            
            return analytics
            
        except Exception as e:
            logger.error(f"Failed to get patients analytics: {e}")
            raise

    # ==================== Diagnosis Operations ====================
    
    async def create_diagnosis(self, diagnosis_data: Dict[str, Any]) -> str:
        """Create a new diagnosis record"""
        try:
            diagnosis_data['created_at'] = datetime.utcnow()
            diagnosis_data['updated_at'] = datetime.utcnow()
            
            collection = self.get_collection('diagnoses')
            result = await collection.insert_one(diagnosis_data)
            
            logger.info(f"Diagnosis created with ID: {result.inserted_id}")
            return str(result.inserted_id)
            
        except Exception as e:
            logger.error(f"Failed to create diagnosis: {e}")
            raise
    
    async def get_diagnosis(self, diagnosis_id: str) -> Optional[Dict[str, Any]]:
        """Get diagnosis by ID"""
        try:
            collection = self.get_collection('diagnoses')
            diagnosis = await collection.find_one({'diagnosis_id': diagnosis_id})
            return diagnosis
            
        except Exception as e:
            logger.error(f"Failed to get diagnosis {diagnosis_id}: {e}")
            raise

    async def update_diagnosis(self, diagnosis_id: str, update_data: Dict[str, Any]) -> bool:
        """Update diagnosis record"""
        try:
            update_data['updated_at'] = datetime.utcnow()
            
            collection = self.get_collection('diagnoses')
            result = await collection.update_one(
                {'diagnosis_id': diagnosis_id},
                {'$set': update_data}
            )
            
            return result.modified_count > 0
            
        except Exception as e:
            logger.error(f"Failed to update diagnosis {diagnosis_id}: {e}")
            raise

    async def get_diagnoses_paginated(self, page: int, limit: int, filters: Dict = None, sort: List = None) -> Dict[str, Any]:
        """Get diagnoses with pagination"""
        try:
            collection = self.get_collection('diagnoses')
            
            # Calculate skip
            skip = (page - 1) * limit
            
            # Apply filters
            query = filters or {}
            
            # Get total count
            total = await collection.count_documents(query)
            
            # Build query with pagination
            cursor = collection.find(query).skip(skip).limit(limit)
            
            # Apply sorting
            if sort:
                cursor = cursor.sort(sort)
            
            # Execute query
            diagnoses = await cursor.to_list(length=limit)
            
            return {
                "diagnoses": diagnoses,
                "total": total
            }
            
        except Exception as e:
            logger.error(f"Failed to get paginated diagnoses: {e}")
            raise

    async def get_diagnosis_results(self, diagnosis_id: str) -> Optional[Dict[str, Any]]:
        """Get diagnosis results"""
        try:
            collection = self.get_collection('diagnoses')
            diagnosis = await collection.find_one({'diagnosis_id': diagnosis_id})
            
            if diagnosis:
                return diagnosis.get('results', {})
            return None
            
        except Exception as e:
            logger.error(f"Failed to get diagnosis results: {e}")
            raise

    async def get_diagnosis_timeline(self, diagnosis_id: str) -> List[Dict[str, Any]]:
        """Get diagnosis timeline"""
        try:
            # Mock timeline - implement based on requirements
            timeline = [
                {
                    "timestamp": datetime.utcnow(),
                    "event": "Diagnosis created",
                    "description": "New diagnosis request submitted"
                }
            ]
            
            return timeline
            
        except Exception as e:
            logger.error(f"Failed to get diagnosis timeline: {e}")
            raise

    async def get_agent_reports(self, diagnosis_id: str) -> Dict[str, Any]:
        """Get all agent reports for diagnosis"""
        try:
            # Mock agent reports - implement based on requirements
            reports = {
                "image_analyzer": {"status": "completed", "findings": []},
                "drug_checker": {"status": "completed", "interactions": []},
                "research_agent": {"status": "completed", "papers": []}
            }
            
            return reports
            
        except Exception as e:
            logger.error(f"Failed to get agent reports: {e}")
            raise

    async def get_agent_report(self, diagnosis_id: str, agent_name: str) -> Optional[Dict[str, Any]]:
        """Get specific agent report"""
        try:
            reports = await self.get_agent_reports(diagnosis_id)
            return reports.get(agent_name)
            
        except Exception as e:
            logger.error(f"Failed to get agent report: {e}")
            raise

    async def save_medical_image(self, diagnosis_id: str, image_file) -> str:
        """Save medical image and return image_id"""
        try:
            # Generate image ID
            image_id = f"IMG-{int(datetime.utcnow().timestamp() * 1000)}"
            
            # Mock image saving - implement with MinIO or file storage
            image_doc = {
                "image_id": image_id,
                "diagnosis_id": diagnosis_id,
                "filename": image_file.filename,
                "size": getattr(image_file, 'size', 0),
                "content_type": getattr(image_file, 'content_type', 'image/jpeg'),
                "created_at": datetime.utcnow()
            }
            
            collection = self.get_collection('images')
            await collection.insert_one(image_doc)
            
            return image_id
            
        except Exception as e:
            logger.error(f"Failed to save medical image: {e}")
            raise

    async def get_diagnosis_statistics(self, date_from: str = None, date_to: str = None) -> Dict[str, Any]:
        """Get diagnosis statistics"""
        try:
            collection = self.get_collection('diagnoses')
            
            # Mock statistics - implement based on requirements
            total_diagnoses = await collection.count_documents({})
            completed_diagnoses = await collection.count_documents({"status": "completed"})
            
            stats = {
                "total_diagnoses": total_diagnoses,
                "completed_diagnoses": completed_diagnoses,
                "pending_diagnoses": await collection.count_documents({"status": "processing"}),
                "failed_diagnoses": await collection.count_documents({"status": "failed"}),
                "success_rate": (completed_diagnoses / total_diagnoses * 100) if total_diagnoses > 0 else 0
            }
            
            return stats
            
        except Exception as e:
            logger.error(f"Failed to get diagnosis statistics: {e}")
            raise

    async def get_diagnosis_analytics(self, period: str = "30d") -> Dict[str, Any]:
        """Get diagnosis analytics"""
        try:
            # Mock analytics - implement based on requirements
            analytics = {
                "period": period,
                "total_diagnoses": 0,
                "average_processing_time": 0,
                "accuracy_rate": 95.5,
                "most_common_conditions": []
            }
            
            return analytics
            
        except Exception as e:
            logger.error(f"Failed to get diagnosis analytics: {e}")
            raise
    
    async def update_diagnosis_status(self, diagnosis_id: str, status: str, progress: float) -> bool:
        """Update diagnosis status and progress"""
        try:
            collection = self.get_collection('diagnoses')
            result = await collection.update_one(
                {'diagnosis_id': diagnosis_id},
                {
                    '$set': {
                        'status': status,
                        'progress': progress,
                        'updated_at': datetime.utcnow()
                    }
                }
            )
            
            return result.modified_count > 0
            
        except Exception as e:
            logger.error(f"Failed to update diagnosis status {diagnosis_id}: {e}")
            raise
    
    # ==================== Image Operations ====================
    
    async def save_image_analysis(self, image_data: Dict[str, Any]) -> str:
        """Save image analysis results"""
        try:
            image_data['created_at'] = datetime.utcnow()
            
            collection = self.get_collection('images')
            result = await collection.insert_one(image_data)
            
            logger.info(f"Image analysis saved with ID: {result.inserted_id}")
            return str(result.inserted_id)
            
        except Exception as e:
            logger.error(f"Failed to save image analysis: {e}")
            raise
    
    async def get_patient_images(self, patient_id: str) -> List[Dict[str, Any]]:
        """Get all images for a patient"""
        try:
            collection = self.get_collection('images')
            cursor = collection.find({'patient_id': patient_id}).sort('created_at', DESCENDING)
            images = await cursor.to_list(length=None)
            return images
            
        except Exception as e:
            logger.error(f"Failed to get images for patient {patient_id}: {e}")
            raise
    
    # ==================== User Operations ====================
    
    async def create_user(self, user_data: Dict[str, Any]) -> str:
        """Create a new user"""
        try:
            user_data['created_at'] = datetime.utcnow()
            user_data['updated_at'] = datetime.utcnow()
            user_data['is_active'] = True
            
            collection = self.get_collection('users')
            result = await collection.insert_one(user_data)
            
            logger.info(f"User created with ID: {result.inserted_id}")
            return str(result.inserted_id)
            
        except Exception as e:
            logger.error(f"Failed to create user: {e}")
            raise
    
    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email"""
        try:
            collection = self.get_collection('users')
            user = await collection.find_one({'email': email})
            return user
            
        except Exception as e:
            logger.error(f"Failed to get user by email {email}: {e}")
            raise
    
    # ==================== Audit Logging ====================
    
    async def log_action(self, user_id: str, action: str, details: Optional[Dict] = None):
        """Log user action for audit trail"""
        try:
            log_data = {
                'user_id': user_id,
                'action': action,
                'details': details or {},
                'timestamp': datetime.utcnow()
            }
            
            collection = self.get_collection('audit_logs')
            await collection.insert_one(log_data)
            
        except Exception as e:
            logger.error(f"Failed to log action: {e}")
    
    # ==================== Analytics ====================
    
    async def get_system_stats(self) -> Dict[str, Any]:
        """Get system usage statistics"""
        try:
            stats = {}
            
            # Count documents in collections
            for collection_name in ['patients', 'diagnoses', 'images', 'users']:
                collection = self.get_collection(collection_name)
                count = await collection.count_documents({})
                stats[f'total_{collection_name}'] = count
            
            # Recent activity (last 24 hours)
            yesterday = datetime.utcnow() - timedelta(days=1)
            
            diagnoses_collection = self.get_collection('diagnoses')
            recent_diagnoses = await diagnoses_collection.count_documents({
                'created_at': {'$gte': yesterday}
            })
            stats['recent_diagnoses_24h'] = recent_diagnoses
            
            return stats
            
        except Exception as e:
            logger.error(f"Failed to get system stats: {e}")
            return {}
            raise
    
    async def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
            logger.info("MongoDB disconnected")
    
    async def check_connection(self) -> bool:
        """Check if MongoDB is connected"""
        try:
            if self.client:
                await self.client.admin.command('ping')
                return True
            return False
        except Exception:
            return False
    
    # Collections
    @property
    def patients(self):
        return self.db.patients
    
    @property
    def diagnoses(self):
        return self.db.diagnoses
    
    # User management methods
    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        try:
            user = await self.users.find_one({"user_id": user_id})
            return user
        except Exception as e:
            logger.error(f"Error getting user by ID: {str(e)}")
            return None
    
    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email"""
        try:
            user = await self.users.find_one({"email": email})
            return user
        except Exception as e:
            logger.error(f"Error getting user by email: {str(e)}")
            return None
    
    async def create_user(self, user_data: Dict[str, Any]) -> Optional[str]:
        """Create a new user"""
        try:
            result = await self.users.insert_one(user_data)
            return user_data["user_id"]
        except Exception as e:
            logger.error(f"Error creating user: {str(e)}")
            return None
    
    async def update_user(self, user_id: str, update_data: Dict[str, Any]) -> bool:
        """Update user"""
        try:
            update_data["updated_at"] = datetime.utcnow()
            result = await self.users.update_one(
                {"user_id": user_id},
                {"$set": update_data}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error updating user: {str(e)}")
            return False
    
    async def update_last_login(self, user_id: str) -> bool:
        """Update user's last login timestamp"""
        try:
            result = await self.users.update_one(
                {"user_id": user_id},
                {"$set": {"last_login": datetime.utcnow()}}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error updating last login: {str(e)}")
            return False

    @property
    def images(self):
        return self.db.images
    
    @property
    def drugs(self):
        return self.db.drugs
    
    @property
    def research(self):
        return self.db.research
    
    @property
    def analytics(self):
        return self.db.analytics
    
    @property
    def users(self):
        return self.db.users
