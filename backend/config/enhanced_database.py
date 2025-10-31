"""
Enhanced Database Configuration with Comprehensive Medical AI Platform Support
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure, DuplicateKeyError
from pymongo import IndexModel, ASCENDING, DESCENDING, TEXT
import logging
from typing import Optional, Dict, List, Any
from datetime import datetime, timezone
from bson import ObjectId

logger = logging.getLogger(__name__)


class EnhancedDatabase:
    """Enhanced MongoDB database manager for Medical AI Platform"""
    
    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.db = None
        self.connected = False
        self.collections = {}
    
    async def connect(self, uri: str = "mongodb://localhost:27017", db_name: str = "medical_ai"):
        """Connect to MongoDB with comprehensive setup"""
        try:
            self.client = AsyncIOMotorClient(
                uri,
                maxPoolSize=50,
                minPoolSize=10,
                maxIdleTimeMS=30000,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=10000,
                socketTimeoutMS=20000
            )
            
            # Test connection
            await self.client.admin.command('ping')
            self.db = self.client[db_name]
            self.connected = True
            
            # Initialize collections
            await self._initialize_collections()
            
            # Create comprehensive indexes
            await self._create_comprehensive_indexes()
            
            logger.info(f"✅ Enhanced MongoDB connected: {db_name}")
            
        except ConnectionFailure as e:
            logger.error(f"❌ Failed to connect to MongoDB: {e}")
            self.connected = False
            raise
        except Exception as e:
            logger.error(f"❌ Database connection error: {e}")
            self.connected = False
            raise
    
    async def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
            self.connected = False
            self.collections.clear()
            logger.info("🔌 Disconnected from Enhanced MongoDB")
    
    async def _initialize_collections(self):
        """Initialize all required collections"""
        if not self.db:
            return
        
        collection_names = [
            "users",
            "patients", 
            "diagnoses",
            "medical_images",
            "system_metrics",
            "websocket_sessions",
            "ai_agent_logs",
            "audit_logs"
        ]
        
        for name in collection_names:
            self.collections[name] = self.db[name]
        
        logger.info("✅ Initialized enhanced database collections")
    
    async def _create_comprehensive_indexes(self):
        """Create comprehensive database indexes"""
        if not self.db:
            return
        
        try:
            # Users collection indexes
            await self.collections["users"].create_indexes([
                IndexModel([("username", ASCENDING)], unique=True),
                IndexModel([("email", ASCENDING)], unique=True),
                IndexModel([("role", ASCENDING)]),
                IndexModel([("is_active", ASCENDING)]),
                IndexModel([("created_at", DESCENDING)])
            ])
            
            # Patients collection indexes
            await self.collections["patients"].create_indexes([
                IndexModel([("patient_id", ASCENDING)], unique=True),
                IndexModel([("name", TEXT)]),
                IndexModel([("contact_info.email", ASCENDING)]),
                IndexModel([("risk_level", ASCENDING)]),
                IndexModel([("status", ASCENDING)]),
                IndexModel([("created_by", ASCENDING)]),
                IndexModel([("created_at", DESCENDING)])
            ])
            
            # Diagnoses collection indexes  
            await self.collections["diagnoses"].create_indexes([
                IndexModel([("diagnosis_id", ASCENDING)], unique=True),
                IndexModel([("patient_id", ASCENDING)]),
                IndexModel([("status", ASCENDING)]),
                IndexModel([("priority", ASCENDING)]),
                IndexModel([("created_by", ASCENDING)]),
                IndexModel([("created_at", DESCENDING)])
            ])
            
            # Medical Images collection indexes
            await self.collections["medical_images"].create_indexes([
                IndexModel([("image_id", ASCENDING)], unique=True),
                IndexModel([("patient_id", ASCENDING)]),
                IndexModel([("diagnosis_id", ASCENDING)]),
                IndexModel([("image_type", ASCENDING)])
            ])
            
            logger.info("✅ Enhanced database indexes created")
            
        except Exception as e:
            logger.error(f"❌ Failed to create enhanced indexes: {e}")
    
    def get_collection(self, name: str):
        """Get a collection by name"""
        if not self.connected:
            raise RuntimeError("Enhanced database not connected")
        return self.collections.get(name) or self.db[name]
    
    @property
    def is_connected(self) -> bool:
        """Check if database is connected"""
        return self.connected and self.client is not None
    
    # Enhanced helper methods
    async def create_document(self, collection_name: str, document: Dict[str, Any]) -> str:
        """Create a new document and return its ID"""
        collection = self.get_collection(collection_name)
        
        # Add timestamps
        now = datetime.now(timezone.utc)
        document["created_at"] = now
        document["updated_at"] = now
        
        result = await collection.insert_one(document)
        return str(result.inserted_id)
    
    async def get_document_by_id(self, collection_name: str, doc_id: str) -> Optional[Dict[str, Any]]:
        """Get a document by its ObjectId"""
        collection = self.get_collection(collection_name)
        
        try:
            object_id = ObjectId(doc_id)
            document = await collection.find_one({"_id": object_id})
            if document:
                document["id"] = str(document["_id"])
            return document
        except Exception:
            return None
    
    async def get_patient_by_patient_id(self, patient_id: str) -> Optional[Dict[str, Any]]:
        """Get patient by patient_id field"""
        collection = self.get_collection("patients")
        document = await collection.find_one({"patient_id": patient_id})
        if document:
            document["id"] = str(document["_id"])
        return document
    
    async def get_diagnosis_by_diagnosis_id(self, diagnosis_id: str) -> Optional[Dict[str, Any]]:
        """Get diagnosis by diagnosis_id field"""
        collection = self.get_collection("diagnoses")
        document = await collection.find_one({"diagnosis_id": diagnosis_id})
        if document:
            document["id"] = str(document["_id"])
        return document


# Global enhanced database instance
enhanced_db = EnhancedDatabase()