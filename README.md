# MedAI Agent - AI-Powered Medical Intelligence Platform

## 🚀 Quick Start with Demo Accounts

Experience the full power of our Multi-Agent AI Medical System with pre-configured demo accounts!

### 🔐 Demo Login Credentials

#### 👨‍⚕️ Admin Account (Full Access)

- **Email:** `admin@example.com`
- **Password:** `admin123`
- **Role:** Dr. Jennifer Martinez - AI Radiologist
- **Access:**
  - Multi-Agent AI Image Analysis (MONAI)
  - Explainable AI with Visual Heatmaps
  - Real-time Drug Interaction Detection
  - Clinical Trial Research Integration
  - RAG-based Medical Knowledge
  - Admin Dashboard & Settings

#### 👨‍⚕️ Doctor Account (Clinical Access)

- **Email:** `doctor@example.com`
- **Password:** `doctor123`
- **Role:** Dr. Michael Chen - Clinical Physician
- **Access:**
  - History Synthesis Agent (EHR Integration)
  - Drug Interaction Agent (Real-time)
  - Patient Record Management
  - AI-Assisted Diagnosis
  - Clinical Decision Support

#### 🔬 Researcher Account (Research Access)

- **Email:** `researcher@example.com`
- **Password:** `research123`
- **Role:** Dr. Sarah Kim - Medical Researcher
- **Access:**
  - Research Agent (Clinical Trials)
  - Rare Disease Research
  - Medical Evidence Analysis
  - Adaptive Learning Systems
  - Advanced Analytics Dashboard

---

## ✨ Key Features

### 🤖 Multi-Agent AI System

- **Clinical Decision Support Agent**: AI-powered diagnostic assistance
- **Drug Interaction Agent**: Real-time medication safety analysis
- **Medical Imaging Agent**: MONAI-based image analysis with explainable AI
- **History Synthesis Agent**: Intelligent patient record summarization
- **Research Agent**: Clinical trials and medical research integration

### 🏥 Core Capabilities

- **Patient Management**: Comprehensive EHR integration
- **Medical Image Analysis**: AI-enhanced radiology with visual heatmaps
- **Drug Safety**: Real-time interaction checking and alerts
- **Clinical Research**: Integration with medical literature and trials
- **RAG-based Knowledge**: Context-aware medical information retrieval

### 🔒 Security & Compliance

- HIPAA Compliant Architecture
- End-to-End Encryption
- Role-Based Access Control (RBAC)
- Audit Logging
- Secure Authentication

---

## 🛠️ Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Python 3.9+
- Docker (optional, for containerized deployment)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/1Rajveer-Singh/Meadi-ai.git
   cd Meadi-ai
   ```

2. **Install frontend dependencies**

   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies**

   ```bash
   cd ../backend
   pip install -r requirements.txt
   ```

4. **Start the development servers**

   **Frontend:**

   ```bash
   cd frontend
   npm run dev
   ```

   **Backend:**

   ```bash
   cd backend
   python main.py
   ```

5. **Access the application**
   - Open your browser to `http://localhost:5173`
   - Use one of the demo accounts listed above to login

### Using Docker

```bash
# Start all services with Docker Compose
docker-compose up -d

# Or use the enhanced setup
docker-compose -f docker-compose.enhanced.yml up -d
```

---

## 📱 Usage Guide

### Logging In

1. Navigate to the landing page
2. Click "Sign In" or use the demo credentials section
3. Enter one of the demo account credentials
4. You'll be redirected to the dashboard

### Quick Actions

- **View Patients**: Access patient records and medical history
- **Analyze Images**: Upload and analyze medical images with AI
- **Check Drug Interactions**: Verify medication safety
- **View Insights**: Access AI-generated clinical insights
- **Research**: Explore medical literature and clinical trials

---

## 🏗️ Project Structure

```
Meadi-ai/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Application pages
│   │   ├── contexts/        # React contexts (Auth, etc.)
│   │   ├── hooks/           # Custom React hooks
│   │   └── api/             # API client configuration
│   └── public/              # Static assets
│
├── backend/                  # FastAPI backend
│   ├── agents/              # Multi-Agent AI system
│   ├── routes/              # API endpoints
│   ├── models/              # Data models
│   ├── config/              # Configuration files
│   └── workflows/           # Agent workflows
│
├── notebooks/               # Jupyter notebooks for analysis
└── docker/                  # Docker configuration files
```

---

## 🧪 Technology Stack

### Frontend

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Animations
- **React Router** - Navigation
- **Lucide React** - Icon library

### Backend

- **FastAPI** - Modern Python web framework
- **LangGraph** - Multi-agent orchestration
- **MONAI** - Medical image analysis
- **MongoDB** - Database
- **Redis** - Caching and real-time features
- **LangChain** - LLM integration

### AI/ML

- **OpenAI GPT** - Language models
- **MONAI** - Medical imaging AI
- **RAG** - Retrieval-Augmented Generation
- **Vector Search** - Semantic search capabilities

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# API Keys
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# Database
MONGODB_URI=mongodb://localhost:27017/medai
REDIS_URL=redis://localhost:6379

# Application
DEBUG=true
SECRET_KEY=your_secret_key
CORS_ORIGINS=http://localhost:5173
```

---

## 📚 Documentation

- [Backend Architecture](backend/BACKEND_ARCHITECTURE_PLAN.md)
- [Multi-Agent System](MULTI_AGENT_MEDICAL_AI_COMPLETE.md)
- [Navigation Optimization](frontend/NAVIGATION_OPTIMIZATION_PLAN.md)
- [Integration Summary](FINAL_INTEGRATION_SUMMARY.md)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- MONAI - Medical Open Network for AI
- LangChain & LangGraph - Multi-agent frameworks
- FastAPI - Modern web framework
- React & Vite - Frontend technologies

---

## 📧 Support

For support, questions, or feedback:

- Create an issue on GitHub
- Contact: [Your Contact Information]

---

## 🎯 Roadmap

- [ ] Mobile application (React Native)
- [ ] Advanced ML model training interface
- [ ] Integration with more EHR systems
- [ ] Telemedicine features
- [ ] Multi-language support
- [ ] Voice-activated controls
- [ ] Advanced analytics dashboard

---

**Made with ❤️ for Healthcare Innovation**
