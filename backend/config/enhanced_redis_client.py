"""
Enhanced Redis Client Configuration  
Comprehensive caching, session management, and real-time data management
"""

import asyncio
import logging
import json
import pickle
from typing import Dict, Any, Optional, List, Union
from datetime import datetime, timedelta
import os

try:
    import redis.asyncio as redis
    from redis.asyncio import Redis
    REDIS_AVAILABLE = True
except ImportError:
    try:
        import redis
        REDIS_AVAILABLE = True
    except ImportError:
        REDIS_AVAILABLE = False
        logging.warning("Redis client not available. Install with: pip install redis")

logger = logging.getLogger(__name__)


# ========================================
# Configuration
# ========================================

class RedisConfig:
    """Redis configuration settings"""
    
    def __init__(self):
        # Redis connection settings
        self.host = os.getenv("REDIS_HOST", "localhost")
        self.port = int(os.getenv("REDIS_PORT", 6379))
        self.password = os.getenv("REDIS_PASSWORD")
        self.db = int(os.getenv("REDIS_DB", 0))
        self.decode_responses = True
        
        # Connection pool settings
        self.max_connections = int(os.getenv("REDIS_MAX_CONNECTIONS", 10))
        self.retry_on_timeout = True
        self.socket_timeout = 30
        self.socket_connect_timeout = 10
        
        # Key prefixes for organization
        self.key_prefixes = {
            "cache": "cache:",
            "session": "session:",
            "websocket": "ws:",
            "queue": "queue:",
            "lock": "lock:",
            "rate_limit": "rate:",
            "metrics": "metrics:",
            "analysis": "analysis:",
            "temp": "temp:"
        }
        
        # Default expiration times (seconds)
        self.default_ttl = {
            "cache": 3600,        # 1 hour
            "session": 86400,     # 24 hours  
            "websocket": 7200,    # 2 hours
            "queue": 3600,        # 1 hour
            "lock": 300,          # 5 minutes
            "rate_limit": 3600,   # 1 hour
            "metrics": 86400,     # 24 hours
            "analysis": 7200,     # 2 hours
            "temp": 900           # 15 minutes
        }


# ========================================
# Enhanced Redis Client
# ========================================

class EnhancedRedisClient:
    """Enhanced Redis client with comprehensive medical platform features"""
    
    def __init__(self, config: Optional[RedisConfig] = None):
        self.config = config or RedisConfig()
        self.client: Optional[Redis] = None
        self.initialized = False
        
        if not REDIS_AVAILABLE:
            logger.warning("Redis not available, using mock client")
    
    async def initialize(self) -> bool:
        """Initialize Redis connection"""
        
        if not REDIS_AVAILABLE:
            logger.warning("Redis client not available")
            return False
        
        try:
            # Create Redis connection
            self.client = redis.Redis(
                host=self.config.host,
                port=self.config.port,
                password=self.config.password,
                db=self.config.db,
                decode_responses=self.config.decode_responses,
                max_connections=self.config.max_connections,
                retry_on_timeout=self.config.retry_on_timeout,
                socket_timeout=self.config.socket_timeout,
                socket_connect_timeout=self.config.socket_connect_timeout
            )
            
            # Test connection
            await self.client.ping()
            
            self.initialized = True
            logger.info(f"Redis client initialized: {self.config.host}:{self.config.port}")
            return True
            
        except Exception as e:
            logger.error(f"Redis initialization failed: {e}")
            self.client = None
            return False
    
    async def close(self):
        """Close Redis connection"""
        if self.client:
            await self.client.close()
            self.initialized = False
            logger.info("Redis connection closed")
    
    def _get_key(self, prefix: str, key: str) -> str:
        """Generate prefixed key"""
        prefix_value = self.config.key_prefixes.get(prefix, f"{prefix}:")
        return f"{prefix_value}{key}"
    
    # ========================================
    # Cache Management
    # ========================================
    
    async def cache_set(
        self,
        key: str,
        value: Any,
        ttl: Optional[int] = None,
        serialize: bool = True
    ) -> bool:
        """Set cache value with optional serialization"""
        
        if not self.client:
            return False
        
        try:
            cache_key = self._get_key("cache", key)
            
            # Serialize value if needed
            if serialize:
                if isinstance(value, (dict, list)):
                    cache_value = json.dumps(value, default=str)
                else:
                    cache_value = pickle.dumps(value)
            else:
                cache_value = str(value)
            
            # Set with TTL
            expiration = ttl or self.config.default_ttl["cache"]
            
            await self.client.setex(cache_key, expiration, cache_value)
            return True
            
        except Exception as e:
            logger.error(f"Cache set error: {e}")
            return False
    
    async def cache_get(
        self,
        key: str,
        deserialize: bool = True,
        default: Any = None
    ) -> Any:
        """Get cache value with optional deserialization"""
        
        if not self.client:
            return default
        
        try:
            cache_key = self._get_key("cache", key)
            cache_value = await self.client.get(cache_key)
            
            if cache_value is None:
                return default
            
            # Deserialize value if needed
            if deserialize:
                try:
                    # Try JSON first
                    return json.loads(cache_value)
                except (json.JSONDecodeError, TypeError):
                    try:
                        # Try pickle
                        return pickle.loads(cache_value.encode() if isinstance(cache_value, str) else cache_value)
                    except:
                        return cache_value
            else:
                return cache_value
                
        except Exception as e:
            logger.error(f"Cache get error: {e}")
            return default
    
    async def cache_delete(self, key: str) -> bool:
        """Delete cache entry"""
        
        if not self.client:
            return False
        
        try:
            cache_key = self._get_key("cache", key)
            result = await self.client.delete(cache_key)
            return bool(result)
            
        except Exception as e:
            logger.error(f"Cache delete error: {e}")
            return False
    
    async def cache_exists(self, key: str) -> bool:
        """Check if cache key exists"""
        
        if not self.client:
            return False
        
        try:
            cache_key = self._get_key("cache", key)
            result = await self.client.exists(cache_key)
            return bool(result)
            
        except Exception as e:
            logger.error(f"Cache exists error: {e}")
            return False
    
    # ========================================
    # Session Management
    # ========================================
    
    async def session_set(
        self,
        session_id: str,
        session_data: Dict[str, Any],
        ttl: Optional[int] = None
    ) -> bool:
        """Set session data"""
        
        if not self.client:
            return False
        
        try:
            session_key = self._get_key("session", session_id)
            session_value = json.dumps(session_data, default=str)
            expiration = ttl or self.config.default_ttl["session"]
            
            await self.client.setex(session_key, expiration, session_value)
            return True
            
        except Exception as e:
            logger.error(f"Session set error: {e}")
            return False
    
    async def session_get(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session data"""
        
        if not self.client:
            return None
        
        try:
            session_key = self._get_key("session", session_id)
            session_value = await self.client.get(session_key)
            
            if session_value:
                return json.loads(session_value)
            return None
            
        except Exception as e:
            logger.error(f"Session get error: {e}")
            return None
    
    async def session_update(
        self,
        session_id: str,
        update_data: Dict[str, Any],
        extend_ttl: bool = True
    ) -> bool:
        """Update session data"""
        
        # Get existing session
        session_data = await self.session_get(session_id)
        if session_data is None:
            session_data = {}
        
        # Update with new data
        session_data.update(update_data)
        
        # Set updated session
        ttl = self.config.default_ttl["session"] if extend_ttl else None
        return await self.session_set(session_id, session_data, ttl)
    
    async def session_delete(self, session_id: str) -> bool:
        """Delete session"""
        
        if not self.client:
            return False
        
        try:
            session_key = self._get_key("session", session_id)
            result = await self.client.delete(session_key)
            return bool(result)
            
        except Exception as e:
            logger.error(f"Session delete error: {e}")
            return False
    
    # ========================================
    # WebSocket Session Management
    # ========================================
    
    async def websocket_register(
        self,
        connection_id: str,
        user_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Register WebSocket connection"""
        
        if not self.client:
            return False
        
        try:
            ws_key = self._get_key("websocket", connection_id)
            
            ws_data = {
                "connection_id": connection_id,
                "user_id": user_id,
                "connected_at": datetime.utcnow().isoformat(),
                "last_activity": datetime.utcnow().isoformat(),
                "metadata": metadata or {}
            }
            
            await self.client.setex(
                ws_key,
                self.config.default_ttl["websocket"],
                json.dumps(ws_data, default=str)
            )
            
            # Add to user connections set if user_id provided
            if user_id:
                user_key = self._get_key("websocket", f"user:{user_id}")
                await self.client.sadd(user_key, connection_id)
                await self.client.expire(user_key, self.config.default_ttl["websocket"])
            
            return True
            
        except Exception as e:
            logger.error(f"WebSocket register error: {e}")
            return False
    
    async def websocket_unregister(self, connection_id: str) -> bool:
        """Unregister WebSocket connection"""
        
        if not self.client:
            return False
        
        try:
            # Get connection data first
            ws_data = await self.websocket_get(connection_id)
            
            # Remove connection
            ws_key = self._get_key("websocket", connection_id)
            await self.client.delete(ws_key)
            
            # Remove from user connections if user_id exists
            if ws_data and ws_data.get("user_id"):
                user_key = self._get_key("websocket", f"user:{ws_data['user_id']}")
                await self.client.srem(user_key, connection_id)
            
            return True
            
        except Exception as e:
            logger.error(f"WebSocket unregister error: {e}")
            return False
    
    async def websocket_get(self, connection_id: str) -> Optional[Dict[str, Any]]:
        """Get WebSocket connection data"""
        
        if not self.client:
            return None
        
        try:
            ws_key = self._get_key("websocket", connection_id)
            ws_value = await self.client.get(ws_key)
            
            if ws_value:
                return json.loads(ws_value)
            return None
            
        except Exception as e:
            logger.error(f"WebSocket get error: {e}")
            return None
    
    async def websocket_get_user_connections(self, user_id: str) -> List[str]:
        """Get all connections for a user"""
        
        if not self.client:
            return []
        
        try:
            user_key = self._get_key("websocket", f"user:{user_id}")
            connections = await self.client.smembers(user_key)
            return list(connections) if connections else []
            
        except Exception as e:
            logger.error(f"WebSocket get user connections error: {e}")
            return []
    
    async def websocket_update_activity(self, connection_id: str) -> bool:
        """Update last activity timestamp"""
        
        ws_data = await self.websocket_get(connection_id)
        if ws_data:
            ws_data["last_activity"] = datetime.utcnow().isoformat()
            
            ws_key = self._get_key("websocket", connection_id)
            try:
                await self.client.setex(
                    ws_key,
                    self.config.default_ttl["websocket"],
                    json.dumps(ws_data, default=str)
                )
                return True
            except Exception as e:
                logger.error(f"WebSocket update activity error: {e}")
        
        return False
    
    # ========================================
    # Analysis Queue Management
    # ========================================
    
    async def queue_add_analysis(
        self,
        analysis_id: str,
        analysis_data: Dict[str, Any],
        priority: int = 0
    ) -> bool:
        """Add analysis to processing queue"""
        
        if not self.client:
            return False
        
        try:
            queue_item = {
                "id": analysis_id,
                "data": analysis_data,
                "priority": priority,
                "queued_at": datetime.utcnow().isoformat(),
                "status": "queued"
            }
            
            # Add to priority queue (higher score = higher priority)
            queue_key = self._get_key("queue", "analysis")
            await self.client.zadd(queue_key, {analysis_id: priority})
            
            # Store analysis data
            data_key = self._get_key("analysis", analysis_id)
            await self.client.setex(
                data_key,
                self.config.default_ttl["analysis"],
                json.dumps(queue_item, default=str)
            )
            
            return True
            
        except Exception as e:
            logger.error(f"Queue add analysis error: {e}")
            return False
    
    async def queue_get_next_analysis(self) -> Optional[Dict[str, Any]]:
        """Get next analysis from queue"""
        
        if not self.client:
            return None
        
        try:
            queue_key = self._get_key("queue", "analysis")
            
            # Get highest priority item
            result = await self.client.zpopmax(queue_key)
            
            if result:
                analysis_id, priority = result[0]
                
                # Get analysis data
                data_key = self._get_key("analysis", analysis_id)
                analysis_data = await self.client.get(data_key)
                
                if analysis_data:
                    return json.loads(analysis_data)
            
            return None
            
        except Exception as e:
            logger.error(f"Queue get next analysis error: {e}")
            return None
    
    async def queue_update_analysis_status(
        self,
        analysis_id: str,
        status: str,
        progress: Optional[float] = None,
        results: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Update analysis status"""
        
        if not self.client:
            return False
        
        try:
            data_key = self._get_key("analysis", analysis_id)
            analysis_data = await self.client.get(data_key)
            
            if analysis_data:
                analysis_item = json.loads(analysis_data)
                analysis_item["status"] = status
                analysis_item["updated_at"] = datetime.utcnow().isoformat()
                
                if progress is not None:
                    analysis_item["progress"] = progress
                
                if results is not None:
                    analysis_item["results"] = results
                
                await self.client.setex(
                    data_key,
                    self.config.default_ttl["analysis"],
                    json.dumps(analysis_item, default=str)
                )
                
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Queue update analysis status error: {e}")
            return False
    
    # ========================================
    # Rate Limiting
    # ========================================
    
    async def rate_limit_check(
        self,
        identifier: str,
        limit: int,
        window_seconds: int = 3600
    ) -> Dict[str, Any]:
        """Check rate limit for identifier"""
        
        if not self.client:
            return {"allowed": True, "remaining": limit, "reset_time": None}
        
        try:
            rate_key = self._get_key("rate_limit", f"{identifier}:{window_seconds}")
            
            # Get current count
            current_count = await self.client.get(rate_key)
            current_count = int(current_count) if current_count else 0
            
            # Check if limit exceeded
            if current_count >= limit:
                ttl = await self.client.ttl(rate_key)
                reset_time = datetime.utcnow() + timedelta(seconds=ttl) if ttl > 0 else None
                
                return {
                    "allowed": False,
                    "remaining": 0,
                    "reset_time": reset_time.isoformat() if reset_time else None,
                    "limit": limit
                }
            
            # Increment counter
            pipe = self.client.pipeline()
            pipe.incr(rate_key)
            pipe.expire(rate_key, window_seconds)
            await pipe.execute()
            
            remaining = limit - current_count - 1
            return {
                "allowed": True,
                "remaining": remaining,
                "reset_time": None,
                "limit": limit
            }
            
        except Exception as e:
            logger.error(f"Rate limit check error: {e}")
            return {"allowed": True, "remaining": limit, "reset_time": None}
    
    # ========================================
    # System Metrics
    # ========================================
    
    async def metrics_increment(
        self,
        metric_name: str,
        value: Union[int, float] = 1,
        tags: Optional[Dict[str, str]] = None
    ) -> bool:
        """Increment system metric"""
        
        if not self.client:
            return False
        
        try:
            # Create metric key with timestamp
            timestamp = int(datetime.utcnow().timestamp())
            metric_key = self._get_key("metrics", f"{metric_name}:{timestamp}")
            
            # Store metric with metadata
            metric_data = {
                "name": metric_name,
                "value": value,
                "timestamp": timestamp,
                "tags": tags or {}
            }
            
            await self.client.setex(
                metric_key,
                self.config.default_ttl["metrics"],
                json.dumps(metric_data, default=str)
            )
            
            return True
            
        except Exception as e:
            logger.error(f"Metrics increment error: {e}")
            return False
    
    async def metrics_get(
        self,
        metric_name: str,
        hours: int = 24
    ) -> List[Dict[str, Any]]:
        """Get metric values for time period"""
        
        if not self.client:
            return []
        
        try:
            pattern = self._get_key("metrics", f"{metric_name}:*")
            keys = await self.client.keys(pattern)
            
            if not keys:
                return []
            
            # Get all metric values
            metrics = []
            for key in keys:
                metric_data = await self.client.get(key)
                if metric_data:
                    metrics.append(json.loads(metric_data))
            
            # Filter by time window
            cutoff_time = datetime.utcnow() - timedelta(hours=hours)
            cutoff_timestamp = int(cutoff_time.timestamp())
            
            filtered_metrics = [
                metric for metric in metrics
                if metric.get("timestamp", 0) >= cutoff_timestamp
            ]
            
            # Sort by timestamp
            filtered_metrics.sort(key=lambda x: x.get("timestamp", 0))
            
            return filtered_metrics
            
        except Exception as e:
            logger.error(f"Metrics get error: {e}")
            return []
    
    # ========================================
    # Utility Methods
    # ========================================
    
    async def health_check(self) -> Dict[str, Any]:
        """Redis health check"""
        
        if not self.client:
            return {"status": "unavailable", "message": "Redis client not initialized"}
        
        try:
            start_time = datetime.utcnow()
            
            # Test ping
            await self.client.ping()
            
            # Test basic operations
            test_key = "health_check_test"
            await self.client.set(test_key, "test", ex=10)
            test_value = await self.client.get(test_key)
            await self.client.delete(test_key)
            
            response_time = (datetime.utcnow() - start_time).total_seconds() * 1000
            
            if test_value == "test":
                return {
                    "status": "healthy",
                    "response_time_ms": round(response_time, 2),
                    "message": "Redis is operational"
                }
            else:
                return {
                    "status": "degraded",
                    "response_time_ms": round(response_time, 2),
                    "message": "Redis basic operations failed"
                }
                
        except Exception as e:
            return {
                "status": "unhealthy",
                "message": f"Redis health check failed: {str(e)}"
            }
    
    async def get_info(self) -> Dict[str, Any]:
        """Get Redis server information"""
        
        if not self.client:
            return {"error": "Redis client not available"}
        
        try:
            info = await self.client.info()
            return {
                "version": info.get("redis_version"),
                "memory_usage": info.get("used_memory_human"),
                "connected_clients": info.get("connected_clients"),
                "total_commands_processed": info.get("total_commands_processed"),
                "uptime_seconds": info.get("uptime_in_seconds")
            }
            
        except Exception as e:
            logger.error(f"Redis info error: {e}")
            return {"error": str(e)}


# ========================================
# Global Redis Client Instance
# ========================================

# Initialize global Redis client
config = RedisConfig()
redis_client = EnhancedRedisClient(config)


# ========================================
# Initialization Function
# ========================================

async def initialize_redis() -> bool:
    """Initialize Redis client"""
    return await redis_client.initialize()


# ========================================
# Cleanup Function
# ========================================

async def cleanup_redis():
    """Cleanup Redis connections"""
    await redis_client.close()