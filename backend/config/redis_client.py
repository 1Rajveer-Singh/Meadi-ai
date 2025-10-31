"""Redis client for caching and real-time updates"""

import redis.asyncio as redis
import json
import logging
from typing import Optional, Any
from .settings import settings

logger = logging.getLogger(__name__)


class RedisClient:
    """Redis cache manager"""
    
    def __init__(self):
        self.client: Optional[redis.Redis] = None
    
    async def connect(self):
        """Connect to Redis"""
        try:
            self.client = redis.from_url(
                settings.redis_uri,
                encoding="utf-8",
                decode_responses=True
            )
            
            # Test connection
            await self.client.ping()
            logger.info("✅ Redis connected successfully")
            
        except Exception as e:
            logger.error(f"❌ Redis connection failed: {e}")
            raise
    
    async def disconnect(self):
        """Disconnect from Redis"""
        if self.client:
            await self.client.close()
            logger.info("Redis disconnected")
    
    async def ping(self) -> bool:
        """Check if Redis is connected"""
        try:
            if self.client:
                return await self.client.ping()
            return False
        except Exception:
            return False
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from Redis"""
        try:
            value = await self.client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"Redis GET failed: {e}")
            return None
    
    async def set(self, key: str, value: Any, expire: int = 3600):
        """Set value in Redis with expiration"""
        try:
            await self.client.set(
                key,
                json.dumps(value),
                ex=expire
            )
            return True
        except Exception as e:
            logger.error(f"Redis SET failed: {e}")
            return False
    
    async def delete(self, key: str):
        """Delete key from Redis"""
        try:
            await self.client.delete(key)
            return True
        except Exception as e:
            logger.error(f"Redis DELETE failed: {e}")
            return False
    
    async def publish(self, channel: str, message: dict):
        """Publish message to Redis pub/sub"""
        try:
            await self.client.publish(channel, json.dumps(message))
            return True
        except Exception as e:
            logger.error(f"Redis PUBLISH failed: {e}")
            return False
    
    async def set_diagnosis_status(self, diagnosis_id: str, status: dict):
        """Set diagnosis processing status"""
        key = f"diagnosis:{diagnosis_id}:status"
        await self.set(key, status, expire=7200)  # 2 hours
        
        # Publish update
        await self.publish(f"diagnosis:{diagnosis_id}", status)
