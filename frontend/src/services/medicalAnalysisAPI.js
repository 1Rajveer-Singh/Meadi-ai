/**
 * Medical AI Analysis API Service
 * Connects AnalyzePage to backend Jupyter notebook endpoints
 */

import axios from 'axios';
import toast from 'react-hot-toast';

// API Configuration
const API_BASE_URL = 'http://localhost:8000';
const API_VERSION = 'v1';

class MedicalAnalysisAPI {
  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api/${API_VERSION}`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Request interceptor for auth
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // ==================== Workflow Management ====================

  /**
   * Create new AI analysis workflow
   */
  async createWorkflow(workflowData) {
    try {
      const response = await this.client.post('/workflows', workflowData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create workflow: ${error.response?.data?.detail || error.message}`);
    }
  }

  /**
   * Get workflow status and results
   */
  async getWorkflowStatus(workflowId) {
    try {
      const response = await this.client.get(`/workflows/${workflowId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get workflow status: ${error.response?.data?.detail || error.message}`);
    }
  }

  /**
   * Cancel running workflow
   */
  async cancelWorkflow(workflowId) {
    try {
      const response = await this.client.delete(`/workflows/${workflowId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to cancel workflow: ${error.response?.data?.detail || error.message}`);
    }
  }

  // ==================== File Upload & Management ====================

  /**
   * Upload medical files (images, documents)
   */
  async uploadMedicalFiles(files, patientId, metadata = {}) {
    try {
      const formData = new FormData();
      
      // Add files to form data
      files.forEach((file, index) => {
        formData.append('files', file);
      });
      
      // Add metadata
      formData.append('patient_id', patientId);
      formData.append('metadata', JSON.stringify(metadata));

      const response = await this.client.post('/medical-images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload Progress: ${percentCompleted}%`);
        }
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to upload files: ${error.response?.data?.detail || error.message}`);
    }
  }

  /**
   * Get uploaded files for patient
   */
  async getPatientFiles(patientId) {
    try {
      const response = await this.client.get(`/medical-images/patient/${patientId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get patient files: ${error.response?.data?.detail || error.message}`);
    }
  }

  // ==================== Diagnosis Management ====================

  /**
   * Create new diagnosis request
   */
  async createDiagnosis(diagnosisData) {
    try {
      const response = await this.client.post('/diagnosis', diagnosisData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create diagnosis: ${error.response?.data?.detail || error.message}`);
    }
  }

  /**
   * Get diagnosis results
   */
  async getDiagnosis(diagnosisId) {
    try {
      const response = await this.client.get(`/diagnosis/${diagnosisId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get diagnosis: ${error.response?.data?.detail || error.message}`);
    }
  }

  // ==================== Patient Management ====================

  /**
   * Create or update patient information
   */
  async savePatientInfo(patientData) {
    try {
      const response = await this.client.post('/patients', patientData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to save patient info: ${error.response?.data?.detail || error.message}`);
    }
  }

  /**
   * Get patient information
   */
  async getPatientInfo(patientId) {
    try {
      const response = await this.client.get(`/patients/${patientId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get patient info: ${error.response?.data?.detail || error.message}`);
    }
  }

  // ==================== System Metrics ====================

  /**
   * Get system health and performance metrics
   */
  async getSystemMetrics() {
    try {
      const response = await this.client.get('/system-metrics');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get system metrics: ${error.response?.data?.detail || error.message}`);
    }
  }

  // ==================== Specialized Analysis Functions ====================

  /**
   * Start comprehensive medical analysis workflow
   */
  async startComprehensiveAnalysis(analysisRequest) {
    const workflowData = {
      workflow_type: 'comprehensive_medical_analysis',
      patient_id: analysisRequest.patientId,
      priority: analysisRequest.priority || 'routine',
      clinical_context: {
        patient_demographics: analysisRequest.patientInfo,
        presenting_symptoms: analysisRequest.symptoms || [],
        vital_signs: analysisRequest.vitalSigns || {}
      },
      imaging_data: analysisRequest.imageFiles?.map(file => ({
        filename: file.name,
        size: file.size,
        type: file.type,
        modality: analysisRequest.modality || 'unknown'
      })) || [],
      medical_history: analysisRequest.medicalHistory || {},
      medications: analysisRequest.medications || [],
      preferences: {
        analysis_depth: 'comprehensive',
        explainable_ai_enabled: true,
        research_protocols_enabled: true,
        second_opinion_required: false,
        specialty_focus: analysisRequest.specialtyFocus
      }
    };

    return await this.createWorkflow(workflowData);
  }

  /**
   * Start medical imaging analysis
   */
  async startImagingAnalysis(analysisRequest) {
    const workflowData = {
      workflow_type: 'medical_imaging_analysis',
      patient_id: analysisRequest.patientId,
      priority: analysisRequest.priority || 'routine',
      imaging_data: analysisRequest.imageFiles?.map(file => ({
        filename: file.name,
        size: file.size,
        type: file.type,
        modality: analysisRequest.modality || 'CT'
      })) || [],
      preferences: {
        analysis_focus: 'imaging',
        modality_specific: true,
        explainable_ai_enabled: true
      }
    };

    return await this.createWorkflow(workflowData);
  }

  /**
   * Start clinical decision support analysis
   */
  async startClinicalAnalysis(analysisRequest) {
    const workflowData = {
      workflow_type: 'clinical_decision_support',
      patient_id: analysisRequest.patientId,
      priority: analysisRequest.priority || 'routine',
      clinical_context: {
        patient_demographics: analysisRequest.patientInfo,
        presenting_symptoms: analysisRequest.symptoms || [],
        vital_signs: analysisRequest.vitalSigns || {}
      },
      medical_history: analysisRequest.medicalHistory || {},
      medications: analysisRequest.medications || [],
      preferences: {
        analysis_focus: 'clinical_decision',
        evidence_based: true,
        guideline_adherence: true
      }
    };

    return await this.createWorkflow(workflowData);
  }

  /**
   * Start drug safety analysis
   */
  async startDrugSafetyAnalysis(analysisRequest) {
    const workflowData = {
      workflow_type: 'drug_interaction_analysis',
      patient_id: analysisRequest.patientId,
      priority: analysisRequest.priority || 'urgent',
      medications: analysisRequest.medications || [],
      clinical_context: {
        patient_demographics: analysisRequest.patientInfo,
        allergies: analysisRequest.allergies || [],
        medical_conditions: analysisRequest.medicalConditions || []
      },
      preferences: {
        analysis_focus: 'drug_safety',
        interaction_severity: 'all',
        alternative_suggestions: true
      }
    };

    return await this.createWorkflow(workflowData);
  }
}

// Create singleton instance
const medicalAnalysisAPI = new MedicalAnalysisAPI();

export default medicalAnalysisAPI;