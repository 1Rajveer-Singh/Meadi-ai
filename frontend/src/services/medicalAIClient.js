/**
 * Enhanced Medical AI Platform API Client
 * Complete integration with backend APIs for real-world medical AI workflows
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

class MedicalAIApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.wsURL = WS_BASE_URL;
    this.token = localStorage.getItem('authToken');
    this.wsConnections = new Map();
  }

  // ==================== HTTP Client Methods ====================

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          detail: `HTTP ${response.status}: ${response.statusText}` 
        }));
        throw new Error(errorData.detail || errorData.message || 'Request failed');
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return response;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // ==================== Authentication ====================

  async login(credentials) {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.makeRequest('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.makeRequest('/auth/me');
  }

  // ==================== Enhanced Diagnosis Workflows ====================

  async createWorkflow(workflowData) {
    return this.makeRequest('/api/v1/workflows/create', {
      method: 'POST',
      body: JSON.stringify({
        workflow_type: workflowData.workflow_type || 'comprehensive_diagnosis',
        patient_id: workflowData.patient_id,
        priority: workflowData.priority || 'routine',
        clinical_context: workflowData.clinical_context,
        imaging_data: workflowData.imaging_data,
        medical_history: workflowData.medical_history,
        medications: workflowData.medications,
        symptoms: workflowData.symptoms,
        vital_signs: workflowData.vital_signs,
        laboratory_results: workflowData.laboratory_results,
        preferences: workflowData.preferences,
        specialty_focus: workflowData.specialty_focus,
        second_opinion_required: workflowData.second_opinion_required || false,
        research_protocols_enabled: workflowData.research_protocols_enabled !== false,
        explainable_ai_enabled: workflowData.explainable_ai_enabled !== false,
      }),
    });
  }

  async getWorkflowStatus(workflowId) {
    return this.makeRequest(`/api/v1/workflows/${workflowId}/status`);
  }

  async getWorkflowResults(workflowId) {
    return this.makeRequest(`/api/v1/workflows/${workflowId}/results`);
  }

  async cancelWorkflow(workflowId) {
    return this.makeRequest(`/api/v1/workflows/${workflowId}/cancel`, {
      method: 'POST',
    });
  }

  async getWorkflows(params = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });
    
    const endpoint = `/api/v1/workflows${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.makeRequest(endpoint);
  }

  // ==================== Enhanced Diagnosis Management ====================

  async createDiagnosis(diagnosisData) {
    return this.makeRequest('/diagnosis', {
      method: 'POST',
      body: JSON.stringify(diagnosisData),
    });
  }

  async getDiagnoses(params = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });
    
    const endpoint = `/diagnosis${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.makeRequest(endpoint);
  }

  async getDiagnosisById(diagnosisId) {
    return this.makeRequest(`/diagnosis/${diagnosisId}`);
  }

  async updateDiagnosis(diagnosisId, updateData) {
    return this.makeRequest(`/diagnosis/${diagnosisId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async deleteDiagnosis(diagnosisId) {
    return this.makeRequest(`/diagnosis/${diagnosisId}`, {
      method: 'DELETE',
    });
  }

  // ==================== Medical Images Management ====================

  async uploadMedicalImage(file, metadata = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    Object.entries(metadata).forEach(([key, value]) => {
      formData.append(key, JSON.stringify(value));
    });

    return this.makeRequest('/medical-images/upload', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it with boundary
      body: formData,
    });
  }

  async getMedicalImage(imageId) {
    return this.makeRequest(`/medical-images/${imageId}`);
  }

  async getMedicalImages(params = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });
    
    const endpoint = `/medical-images${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.makeRequest(endpoint);
  }

  async deleteMedicalImage(imageId) {
    return this.makeRequest(`/medical-images/${imageId}`, {
      method: 'DELETE',
    });
  }

  async analyzeImage(imageId, analysisOptions = {}) {
    return this.makeRequest(`/medical-images/${imageId}/analyze`, {
      method: 'POST',
      body: JSON.stringify(analysisOptions),
    });
  }

  // ==================== System Metrics ====================

  async getSystemMetrics() {
    return this.makeRequest('/system-metrics');
  }

  async getSystemHealth() {
    return this.makeRequest('/system-metrics/health');
  }

  async getAgentStatus() {
    return this.makeRequest('/system-metrics/agents');
  }

  async getQueueStatus() {
    return this.makeRequest('/system-metrics/queues');
  }

  // ==================== Patient Management ====================

  async getPatients(params = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });
    
    const endpoint = `/patients${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.makeRequest(endpoint);
  }

  async getPatientById(patientId) {
    return this.makeRequest(`/patients/${patientId}`);
  }

  async createPatient(patientData) {
    return this.makeRequest('/patients', {
      method: 'POST',
      body: JSON.stringify(patientData),
    });
  }

  async updatePatient(patientId, updateData) {
    return this.makeRequest(`/patients/${patientId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // ==================== WebSocket Management ====================

  createWebSocketConnection(endpoint, options = {}) {
    const wsUrl = `${this.wsURL}${endpoint}`;
    const connectionId = options.connectionId || endpoint;

    if (this.wsConnections.has(connectionId)) {
      const existingWs = this.wsConnections.get(connectionId);
      if (existingWs.readyState === WebSocket.OPEN) {
        return existingWs;
      }
    }

    const ws = new WebSocket(wsUrl);
    this.wsConnections.set(connectionId, ws);

    ws.onopen = () => {
      console.log(`WebSocket connected: ${endpoint}`);
      if (options.onOpen) options.onOpen();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (options.onMessage) options.onMessage(data);
      } catch (error) {
        console.error('WebSocket message parse error:', error);
        if (options.onError) options.onError(error);
      }
    };

    ws.onclose = (event) => {
      console.log(`WebSocket disconnected: ${endpoint}`, event);
      this.wsConnections.delete(connectionId);
      if (options.onClose) options.onClose(event);
    };

    ws.onerror = (error) => {
      console.error(`WebSocket error: ${endpoint}`, error);
      if (options.onError) options.onError(error);
    };

    return ws;
  }

  closeWebSocketConnection(connectionId) {
    const ws = this.wsConnections.get(connectionId);
    if (ws) {
      ws.close();
      this.wsConnections.delete(connectionId);
    }
  }

  closeAllWebSocketConnections() {
    this.wsConnections.forEach((ws, connectionId) => {
      ws.close();
    });
    this.wsConnections.clear();
  }

  // ==================== Specialized Analysis Methods ====================

  async startImageAnalysis(imageIds, options = {}) {
    return this.createWorkflow({
      workflow_type: 'image_analysis',
      imaging_data: imageIds.map(id => ({ image_id: id })),
      preferences: {
        analysis_depth: options.depth || 'comprehensive',
        modality_specific: options.modalitySpecific || true,
        explainable_ai: options.explainableAI !== false,
        confidence_threshold: options.confidenceThreshold || 0.85,
      },
      ...options,
    });
  }

  async startDrugInteractionCheck(medications, patientHistory = {}) {
    return this.createWorkflow({
      workflow_type: 'drug_interaction_analysis',
      medications: medications,
      medical_history: patientHistory,
      preferences: {
        severity_threshold: 'moderate',
        include_supplements: true,
        pharmacogenomics: true,
      },
    });
  }

  async startClinicalResearch(query, options = {}) {
    return this.createWorkflow({
      workflow_type: 'clinical_research',
      clinical_context: { research_query: query },
      preferences: {
        evidence_level: options.evidenceLevel || 'high',
        publication_years: options.years || [2020, 2025],
        include_trials: options.includeTrials !== false,
        rare_diseases: options.rareDisease || false,
      },
    });
  }

  async startComprehensiveAnalysis(analysisData) {
    return this.createWorkflow({
      workflow_type: 'comprehensive_medical_analysis',
      ...analysisData,
      preferences: {
        multi_modal: true,
        explainable_ai: true,
        confidence_threshold: 0.8,
        real_time_updates: true,
        ...analysisData.preferences,
      },
    });
  }
}

// Create singleton instance
const medicalAIClient = new MedicalAIApiClient();

export default medicalAIClient;
export { MedicalAIApiClient };