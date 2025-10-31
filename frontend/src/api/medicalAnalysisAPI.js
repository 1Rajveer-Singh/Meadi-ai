import axios from 'axios';

// Multi-Agent Medical Analysis API Integration
class MedicalAnalysisAPI {
  constructor() {
    this.baseURL = 'http://localhost:8000';
    this.httpClient = axios.create({
      baseURL: this.baseURL,
      timeout: 300000, // 5 minutes for analysis
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Multi-Agent System Endpoints
  async comprehensiveAnalysis(analysisRequest) {
    try {
      const response = await this.httpClient.post('/api/v1/multi-agent/analysis/comprehensive', analysisRequest);
      return response.data;
    } catch (error) {
      console.error('Comprehensive analysis failed:', error);
      throw new Error('Multi-agent analysis failed');
    }
  }

  async medicalImageAnalysis(imageFiles, analysisType = 'auto') {
    try {
      const formData = new FormData();
      imageFiles.forEach(file => formData.append('image_files', file));
      formData.append('analysis_type', analysisType);
      
      const response = await this.httpClient.post('/api/v1/multi-agent/analysis/imaging', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Image analysis failed:', error);
      throw new Error('Medical image analysis failed');
    }
  }

  async drugSafetyAnalysis(drugRequest) {
    try {
      const response = await this.httpClient.post('/api/v1/multi-agent/analysis/drug-safety', drugRequest);
      return response.data;
    } catch (error) {
      console.error('Drug safety analysis failed:', error);
      throw new Error('Drug interaction analysis failed');
    }
  }

  async clinicalDecisionSupport(clinicalRequest) {
    try {
      const response = await this.httpClient.post('/api/v1/multi-agent/analysis/clinical-decision', clinicalRequest);
      return response.data;
    } catch (error) {
      console.error('Clinical decision support failed:', error);
      throw new Error('Clinical analysis failed');
    }
  }

  async researchAnalysis(researchRequest) {
    try {
      const response = await this.httpClient.post('/api/v1/multi-agent/analysis/research', researchRequest);
      return response.data;
    } catch (error) {
      console.error('Research analysis failed:', error);
      throw new Error('Research and trial matching failed');
    }
  }

  async getAnalysisStatus(analysisId) {
    try {
      const response = await this.httpClient.get(`/api/v1/multi-agent/analysis/${analysisId}/status`);
      return response.data;
    } catch (error) {
      console.error('Failed to get analysis status:', error);
      throw new Error('Failed to get analysis status');
    }
  }

  // Demo and Testing
  async generateDemoPatient() {
    try {
      const response = await this.httpClient.get('/api/v1/multi-agent/demo/patient-data');
      return response.data;
    } catch (error) {
      console.error('Failed to generate demo patient:', error);
      throw new Error('Demo patient generation failed');
    }
  }

  async runDemoAnalysis() {
    try {
      const response = await this.httpClient.post('/api/v1/multi-agent/demo/comprehensive-analysis');
      return response.data;
    } catch (error) {
      console.error('Demo analysis failed:', error);
      throw new Error('Demo analysis execution failed');
    }
  }

  // Notebook Integration
  async executeNotebook(notebookName, params = {}) {
    try {
      const response = await this.httpClient.post(`/api/v1/multi-agent/notebooks/execute/${notebookName}`, params);
      return response.data;
    } catch (error) {
      console.error('Notebook execution failed:', error);
      throw new Error('Jupyter notebook execution failed');
    }
  }

  // Agent Status and Health
  async getAgentsStatus() {
    try {
      const response = await this.httpClient.get('/api/v1/multi-agent/agents/status');
      return response.data;
    } catch (error) {
      console.error('Failed to get agents status:', error);
      throw new Error('Agents status check failed');
    }
  }

  async generateComprehensiveReport(analysisId) {
    try {
      const response = await this.httpClient.get(`/api/v1/multi-agent/reports/generate/${analysisId}`);
      return response.data;
    } catch (error) {
      console.error('Report generation failed:', error);
      throw new Error('Comprehensive report generation failed');
    }
  }

  // Legacy API Support (for backward compatibility)
  async createWorkflow(workflowType, patientId) {
    // Map to multi-agent system
    return await this.comprehensiveAnalysis({
      patient_id: patientId,
      analysis_type: workflowType,
      medical_images: [],
      medications: [],
      symptoms: [],
      lab_results: {},
      medical_history: {}
    });
  }

  async uploadMedicalFiles(files, workflowId) {
    // Map to image analysis
    return await this.medicalImageAnalysis(files);
  }

  async startComprehensiveAnalysis(analysisData) {
    return await this.comprehensiveAnalysis(analysisData);
  }

  async getPatients() {
    try {
      // Generate demo patient for testing
      const demoResponse = await this.generateDemoPatient();
      return {
        patients: [demoResponse.demo_patient]
      };
    } catch (error) {
      console.error('Failed to get patients:', error);
      return { patients: [] };
    }
  }

  async testConnection() {
    try {
      const response = await this.httpClient.get('/api/v1/multi-agent/health');
      return response.data;
    } catch (error) {
      console.error('Connection test failed:', error);
      throw new Error('Multi-agent system connection failed');
    }
  }

  // Utility methods for data formatting
  formatAnalysisRequest(formData) {
    return {
      patient_id: formData.patientId || `ANALYZE_${Date.now()}`,
      analysis_type: formData.analysisType || 'comprehensive',
      medical_images: formData.medicalImages || [],
      medications: formData.medications || [],
      symptoms: formData.symptoms || [],
      lab_results: formData.labResults || {},
      medical_history: formData.medicalHistory || {},
      diagnosis_keywords: formData.diagnosisKeywords || []
    };
  }

  formatDrugSafetyRequest(medications, patientProfile) {
    return {
      patient_id: patientProfile?.patient_id || `DRUG_${Date.now()}`,
      medications: medications,
      patient_profile: {
        demographics: patientProfile?.demographics || {},
        medical_history: patientProfile?.medical_history || {},
        lab_results: patientProfile?.lab_results || {}
      }
    };
  }
}

export default MedicalAnalysisAPI;