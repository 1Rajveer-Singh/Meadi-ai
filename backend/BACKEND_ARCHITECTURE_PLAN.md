# 🏗️ **COMPREHENSIVE BACKEND ARCHITECTURE PLAN**
*FastAPI + MongoDB + MinIO + Redis Medical AI Platform*

---

## 📋 **Frontend Analysis Summary**

Based on deep analysis of the frontend components, the backend must support:

### 🔗 **WebSocket Real-time Features**
- **Connection**: `ws://localhost:8000/ws/analysis`
- **Events**: `agent_status`, `system_metrics`, `analysis_progress`, `analysis_complete`, `real_time_metrics`, `error`
- **AI Agents Status**: MONAI, History Synthesizer, Drug Checker, Research Agent
- **System Metrics**: CPU, Memory, GPU usage, Network latency, Processing queue

### 🏥 **Patients Management**
- **CRUD Operations**: Create, Read, Update, Delete patients
- **Advanced Search**: Autocomplete, filters, pagination
- **Medical History**: Timeline, diagnoses, medications, allergies
- **Documents**: Upload/download patient documents
- **Analytics**: Patient statistics, risk levels, demographics

### 🧠 **AI Diagnosis Workflow**
- **Create Diagnosis**: Patient info + medical images + preferences
- **Real-time Status**: Progress tracking, agent coordination
- **Image Analysis**: MONAI AI processing, annotations, DICOM support
- **Results**: Comprehensive analysis results, confidence scores
- **Export/Share**: PDF reports, timeline, comments

### 🔐 **Authentication & Security**
- **JWT Tokens**: Secure API access
- **User Management**: Registration, login, profiles
- **Role-based Access**: Admin, Doctor, Patient roles

---

## 🏗️ **Backend Architecture Design**

### 📁 **Project Structure**
```
backend/
├── main.py                    # FastAPI application entry point
├── requirements.txt           # Python dependencies
├── Dockerfile                # Docker containerization
├── config/                   # Configuration management
│   ├── __init__.py
│   ├── settings.py           # App settings & environment variables
│   ├── database.py          # MongoDB connection & models
│   ├── redis_client.py      # Redis connection & caching
│   ├── minio_client.py      # MinIO object storage
│   └── auth.py              # JWT authentication
├── models/                   # Pydantic schemas & MongoDB models
│   ├── __init__.py
│   ├── schemas.py           # Request/Response schemas
│   ├── patient.py           # Patient data models
│   ├── diagnosis.py         # Diagnosis & AI results models
│   └── user.py              # User authentication models
├── routes/                   # API endpoint handlers
│   ├── __init__.py
│   ├── auth.py              # Authentication endpoints
│   ├── patients.py          # Patient management APIs
│   ├── diagnosis.py         # Diagnosis workflow APIs
│   ├── images.py            # Medical image handling
│   ├── websocket.py         # WebSocket real-time handlers
│   └── system.py            # System metrics & health checks
├── services/                 # Business logic & AI agents
│   ├── __init__.py
│   ├── ai_coordinator.py    # AI agents coordination
│   ├── monai_agent.py       # Medical image analysis
│   ├── history_agent.py     # Medical history synthesis
│   ├── drug_checker.py      # Drug interactions checker
│   ├── research_agent.py    # Medical research & evidence
│   └── websocket_manager.py # WebSocket connection management
└── utils/                    # Utility functions
    ├── __init__.py
    ├── file_handlers.py     # File upload/download utilities
    ├── image_processing.py  # Medical image processing
    └── validators.py        # Data validation helpers
```

---

## 🗄️ **MongoDB Database Schema**

### 👥 **Users Collection**
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password_hash: String,
  full_name: String,
  role: String, // "admin", "doctor", "patient"
  is_active: Boolean,
  created_at: Date,
  last_login: Date,
  profile: {
    specialization: String, // For doctors
    license_number: String,
    hospital: String,
    phone: String
  }
}
```

### 🏥 **Patients Collection**
```javascript
{
  _id: ObjectId,
  patient_id: String, // Unique patient identifier
  name: String,
  age: Number,
  gender: String,
  date_of_birth: Date,
  contact_info: {
    phone: String,
    email: String,
    address: String
  },
  emergency_contact: {
    name: String,
    phone: String,
    relationship: String
  },
  medical_history: {
    conditions: [String],
    allergies: [String],
    medications: [String],
    previous_diagnoses: [ObjectId] // References to diagnoses
  },
  risk_level: String, // "low", "medium", "high"
  status: String, // "active", "inactive"
  created_at: Date,
  updated_at: Date,
  created_by: ObjectId // Reference to user
}
```

### 🧠 **Diagnoses Collection**
```javascript
{
  _id: ObjectId,
  diagnosis_id: String,
  patient_id: ObjectId,
  status: String, // "pending", "processing", "completed", "cancelled"
  priority: String, // "routine", "urgent", "emergency"
  created_at: Date,
  completed_at: Date,
  
  // Input data
  patient_data: {
    symptoms: [String],
    vital_signs: Object,
    medical_history: Object
  },
  
  // AI Analysis configuration
  ai_config: {
    models: [String],
    analysis_depth: String,
    confidence_threshold: Number,
    explainability_mode: Boolean
  },
  
  // Analysis results
  results: {
    primary_diagnosis: String,
    secondary_diagnoses: [String],
    confidence: Number,
    severity: String,
    findings: [Object],
    recommendations: [String]
  },
  
  // AI Agents reports
  agents_reports: {
    monai: {
      status: String,
      accuracy: Number,
      findings: [Object],
      processing_time: Number
    },
    history: {
      status: String,
      confidence: Number,
      relevant_history: [Object]
    },
    drug_checker: {
      status: String,
      interactions: [Object],
      severity: String
    },
    research: {
      status: String,
      papers_found: Number,
      evidence_level: String,
      references: [Object]
    }
  },
  
  // Progress tracking
  progress: {
    percentage: Number,
    current_stage: String,
    stages_completed: [String]
  },
  
  created_by: ObjectId // Reference to user
}
```

### 📸 **Medical Images Collection**
```javascript
{
  _id: ObjectId,
  image_id: String,
  diagnosis_id: ObjectId,
  patient_id: ObjectId,
  
  // File information
  filename: String,
  file_size: Number,
  mime_type: String,
  file_path: String, // MinIO object path
  
  // Medical metadata
  image_type: String, // "X-ray", "CT", "MRI", "Ultrasound"
  body_part: String,
  acquisition_date: Date,
  modality: String,
  
  // AI Analysis results
  analysis: {
    processed: Boolean,
    annotations: [Object],
    measurements: [Object],
    confidence_regions: [Object]
  },
  
  uploaded_at: Date,
  uploaded_by: ObjectId
}
```

### 📊 **System Metrics Collection**
```javascript
{
  _id: ObjectId,
  timestamp: Date,
  metrics: {
    cpu_usage: Number,
    memory_usage: Number,
    gpu_usage: Number,
    network_latency: Number,
    disk_io: Number,
    processing_queue: Number
  },
  active_sessions: Number,
  active_diagnoses: Number
}
```

---

## 🗃️ **MinIO Bucket Structure**

### 📁 **Bucket Organization**
```
medical-images/
├── patients/
│   └── {patient_id}/
│       ├── xrays/
│       ├── ct-scans/
│       ├── mri/
│       └── documents/
├── diagnoses/
│   └── {diagnosis_id}/
│       ├── original/
│       ├── processed/
│       └── annotations/
└── exports/
    └── reports/
        └── {diagnosis_id}/
```

---

## 🚀 **Redis Caching Strategy**

### 🔑 **Key Patterns**
- **User Sessions**: `session:{user_id}`
- **WebSocket Connections**: `ws_conn:{connection_id}`
- **AI Agent Status**: `agent:{agent_name}:status`
- **System Metrics**: `metrics:latest`
- **Diagnosis Cache**: `diagnosis:{diagnosis_id}:cache`
- **Patient Cache**: `patient:{patient_id}:cache`

### ⚡ **Caching Policies**
- **User Sessions**: TTL 24 hours
- **WebSocket Data**: TTL 1 hour
- **System Metrics**: TTL 5 minutes
- **Diagnosis Results**: TTL 1 week
- **Patient Data**: TTL 1 hour

---

## 🌐 **API Endpoints Specification**

### 🔐 **Authentication Routes** (`/auth`)
```
POST   /auth/register          # User registration
POST   /auth/login            # User login
POST   /auth/logout           # User logout
POST   /auth/refresh          # Refresh JWT token
GET    /auth/profile          # Get current user profile
PUT    /auth/profile          # Update user profile
```

### 👥 **Patients Routes** (`/patients`)
```
GET    /patients              # List patients (with pagination/search)
POST   /patients              # Create new patient
GET    /patients/{id}         # Get patient details
PUT    /patients/{id}         # Update patient
DELETE /patients/{id}         # Delete patient
GET    /patients/{id}/history # Get patient medical history
POST   /patients/{id}/documents # Upload patient document
GET    /patients/{id}/diagnoses # Get patient diagnoses
GET    /patients/search       # Advanced search patients
GET    /patients/analytics    # Patient analytics
```

### 🧠 **Diagnosis Routes** (`/diagnosis`)
```
GET    /diagnosis             # List diagnoses
POST   /diagnosis/new         # Create new diagnosis
GET    /diagnosis/{id}        # Get diagnosis details
PUT    /diagnosis/{id}        # Update diagnosis
DELETE /diagnosis/{id}        # Cancel diagnosis
GET    /diagnosis/{id}/status # Get real-time diagnosis status
GET    /diagnosis/{id}/results # Get diagnosis results
GET    /diagnosis/{id}/agents # Get AI agents reports
POST   /diagnosis/{id}/images # Upload medical images
GET    /diagnosis/{id}/timeline # Get diagnosis timeline
POST   /diagnosis/{id}/comments # Add diagnosis comment
GET    /diagnosis/stats       # Diagnosis statistics
```

### 📸 **Images Routes** (`/images`)
```
POST   /images/upload         # Upload medical images
GET    /images/{id}          # Get image details
GET    /images/{id}/download # Download image file
POST   /images/{id}/analyze  # Trigger AI analysis
GET    /images/{id}/annotations # Get image annotations
POST   /images/{id}/annotations # Add image annotation
```

### 🔌 **WebSocket Routes** (`/ws`)
```
WS     /ws/analysis          # Real-time analysis updates
WS     /ws/system           # System metrics streaming
WS     /ws/diagnosis/{id}   # Diagnosis-specific updates
```

### 📊 **System Routes** (`/system`)
```
GET    /system/health        # Health check endpoint
GET    /system/metrics       # Current system metrics
GET    /system/agents        # AI agents status
POST   /system/agents/{name}/restart # Restart specific agent
```

---

## 🤖 **AI Agents Architecture**

### 🧠 **Agent Coordinator**
- **Central coordination** of all AI agents
- **Load balancing** and resource management
- **Error handling** and recovery
- **Progress tracking** and status updates

### 🏥 **MONAI Agent** (Medical Image Analysis)
- **Deep learning models** for medical imaging
- **DICOM processing** and analysis
- **Annotation generation** with confidence scores
- **GPU acceleration** support

### 📚 **History Synthesizer Agent**
- **Medical history analysis** and pattern recognition
- **Risk assessment** based on patient history
- **Drug interaction checking** with current medications
- **Timeline generation** for patient care

### 💊 **Drug Checker Agent**
- **Real-time drug interaction** checking
- **Allergy validation** against patient records
- **Dosage recommendations** based on patient profile
- **Safety alerts** and warnings

### 🔬 **Research Agent**
- **Medical literature search** and analysis
- **Evidence-based recommendations** 
- **Clinical trial matching** for patients
- **Latest research integration**

---

## 🔌 **WebSocket Real-time Architecture**

### 📡 **Connection Management**
- **Connection pooling** for efficient resource usage
- **Auto-reconnection** with exponential backoff
- **Heart-beat monitoring** for connection health
- **Room-based messaging** for diagnosis sessions

### 📢 **Event Types**
```python
# AI Agent Status Updates
{
  "type": "agent_status",
  "agent": "monai|history|drug_checker|research", 
  "status": {
    "status": "ready|processing|complete|error",
    "progress": 0-100,
    "accuracy": 0-100,
    "processing_time": float
  }
}

# System Performance Metrics
{
  "type": "system_metrics",
  "metrics": {
    "cpu_usage": 0-100,
    "memory_usage": 0-100, 
    "gpu_usage": 0-100,
    "network_latency": float,
    "processing_queue": int
  }
}

# Analysis Progress Updates
{
  "type": "analysis_progress",
  "progress": 0-100,
  "stage": "upload|processing|analysis|complete",
  "diagnosis_id": "string"
}

# Analysis Complete Results
{
  "type": "analysis_complete",
  "diagnosis_id": "string",
  "results": {
    "primary_diagnosis": "string",
    "confidence": 0-100,
    "findings": [Object]
  }
}
```

---

## 🐳 **Docker Configuration**

### 📋 **Services Stack**
```yaml
# docker-compose.yml
services:
  # FastAPI Backend
  backend:
    build: ./backend
    ports: ["8000:8000"]
    environment:
      - MONGODB_URI=mongodb://mongo:27017/medical_ai
      - REDIS_URI=redis://redis:6379
      - MINIO_ENDPOINT=minio:9000
    depends_on: [mongo, redis, minio]
  
  # MongoDB Database  
  mongo:
    image: mongo:7.0
    ports: ["27017:27017"]
    volumes: ["mongo_data:/data/db"]
  
  # Redis Cache
  redis:
    image: redis:7.2-alpine
    ports: ["6379:6379"]
    volumes: ["redis_data:/data"]
  
  # MinIO Object Storage
  minio:
    image: minio/minio:latest
    ports: ["9000:9000", "9001:9001"]
    volumes: ["minio_data:/data"]
    command: server /data --console-address ":9001"
```

---

## ⚙️ **Configuration Management**

### 🔧 **Environment Variables**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/medical_ai
REDIS_URI=redis://localhost:6379
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin

# Security
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_DEBUG=false
CORS_ORIGINS=["http://localhost:3000"]

# AI Agents
ENABLE_GPU=true
MONAI_MODEL_PATH=/models/monai
MAX_CONCURRENT_ANALYSIS=5
```

---

## 🚦 **Implementation Phases**

### 📅 **Phase 1: Core Infrastructure** (Current Priority)
1. ✅ **Database Models** - MongoDB schemas and connections
2. ✅ **Authentication** - JWT-based user management
3. ✅ **Basic API Routes** - CRUD operations for patients/diagnoses
4. ✅ **File Handling** - MinIO integration for medical images

### 📅 **Phase 2: AI Integration**
1. ⏳ **AI Coordinator** - Central agent management
2. ⏳ **MONAI Integration** - Medical image analysis
3. ⏳ **WebSocket System** - Real-time communication
4. ⏳ **Agent Services** - History, Drug Checker, Research agents

### 📅 **Phase 3: Advanced Features**
1. 🔮 **Analytics Dashboard** - System metrics and reporting
2. 🔮 **Export/Import** - Data migration and backup
3. 🔮 **Security Enhancements** - Advanced authentication
4. 🔮 **Performance Optimization** - Caching and scaling

---

## 🎯 **Success Criteria**

### ✅ **Functional Requirements**
- [ ] All frontend API calls work seamlessly
- [ ] WebSocket connections are stable and performant
- [ ] Medical images can be uploaded and analyzed
- [ ] AI agents coordinate and provide real-time updates
- [ ] Patient management is complete and secure

### ⚡ **Performance Requirements**
- [ ] API response time < 200ms for basic operations
- [ ] Image upload supports files up to 100MB
- [ ] WebSocket connections handle 100+ concurrent users
- [ ] AI analysis completes within 30 seconds for standard images
- [ ] System supports 1000+ patients with efficient queries

### 🔒 **Security Requirements**
- [ ] JWT authentication for all API endpoints
- [ ] Secure file upload with validation
- [ ] HIPAA-compliant data handling
- [ ] Encrypted data storage and transmission
- [ ] Audit logging for all user actions

---

## 🚀 **Next Steps**

1. **Implement Core Models** - Create MongoDB schemas and Pydantic models
2. **Setup Database Connections** - Configure MongoDB, Redis, MinIO clients
3. **Build Authentication System** - JWT tokens and user management
4. **Create API Endpoints** - Implement all required routes
5. **WebSocket Integration** - Real-time communication system
6. **AI Agents Development** - Coordinate medical AI services
7. **Testing & Validation** - Comprehensive testing with frontend
8. **Docker Deployment** - Complete containerization setup

---

*This architecture provides a robust, scalable, and secure foundation for the medical AI platform with comprehensive MongoDB, MinIO, and Redis integration as requested.*