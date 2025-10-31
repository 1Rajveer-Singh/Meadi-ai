// Ultra-Advanced Diagnosis API Service
import apiClient, { createCancelToken, createFormData } from './axios';

/**
 * Diagnosis API Service
 * Complete diagnosis workflow management with real-time updates
 */

// Create new diagnosis
export const createDiagnosis = async (data) => {
  return apiClient.post('/diagnosis/new', data);
};

// Get diagnosis by ID
export const getDiagnosis = async (id) => {
  return apiClient.get(`/diagnosis/${id}`);
};

// Get diagnosis status (for real-time polling)
export const getDiagnosisStatus = async (id) => {
  return apiClient.get(`/diagnosis/${id}/status`);
};

// Get all diagnoses with pagination
export const getDiagnoses = async (params = {}) => {
  return apiClient.get('/diagnosis', { params });
};

// Update diagnosis
export const updateDiagnosis = async (id, data) => {
  return apiClient.put(`/diagnosis/${id}`, data);
};

// Cancel diagnosis
export const cancelDiagnosis = async (id, reason) => {
  return apiClient.post(`/diagnosis/${id}/cancel`, { reason });
};

// Retry failed diagnosis
export const retryDiagnosis = async (id) => {
  return apiClient.post(`/diagnosis/${id}/retry`);
};

// Get diagnosis results
export const getDiagnosisResults = async (id) => {
  return apiClient.get(`/diagnosis/${id}/results`);
};

// Get agent reports
export const getAgentReports = async (diagnosisId) => {
  return apiClient.get(`/diagnosis/${diagnosisId}/agents`);
};

// Get specific agent report
export const getAgentReport = async (diagnosisId, agentName) => {
  return apiClient.get(`/diagnosis/${diagnosisId}/agents/${agentName}`);
};

// Upload medical images
export const uploadMedicalImages = async (diagnosisId, files, onProgress) => {
  const formData = createFormData({ images: files });
  
  return apiClient.post(`/diagnosis/${diagnosisId}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(progress);
      }
    },
  });
};

// Get diagnosis timeline
export const getDiagnosisTimeline = async (id) => {
  return apiClient.get(`/diagnosis/${id}/timeline`);
};

// Add diagnosis comment
export const addDiagnosisComment = async (id, comment) => {
  return apiClient.post(`/diagnosis/${id}/comments`, { comment });
};

// Get diagnosis comments
export const getDiagnosisComments = async (id) => {
  return apiClient.get(`/diagnosis/${id}/comments`);
};

// Export diagnosis report
export const exportDiagnosisReport = async (id, format = 'pdf') => {
  return apiClient.get(`/diagnosis/${id}/export`, {
    params: { format },
    responseType: 'blob',
  });
};

// Share diagnosis
export const shareDiagnosis = async (id, recipients, message) => {
  return apiClient.post(`/diagnosis/${id}/share`, {
    recipients,
    message,
  });
};

// Get diagnosis statistics
export const getDiagnosisStats = async (params = {}) => {
  return apiClient.get('/diagnosis/stats', { params });
};

// Get diagnosis analytics
export const getDiagnosisAnalytics = async (params = {}) => {
  return apiClient.get('/diagnosis/analytics', { params });
};

// Compare diagnoses
export const compareDiagnoses = async (ids) => {
  return apiClient.post('/diagnosis/compare', { ids });
};

// Get similar diagnoses
export const getSimilarDiagnoses = async (id, params = {}) => {
  return apiClient.get(`/diagnosis/${id}/similar`, { params });
};

// Request second opinion
export const requestSecondOpinion = async (id, specialist) => {
  return apiClient.post(`/diagnosis/${id}/second-opinion`, { specialist });
};

// Approve diagnosis
export const approveDiagnosis = async (id, notes) => {
  return apiClient.post(`/diagnosis/${id}/approve`, { notes });
};

// Reject diagnosis
export const rejectDiagnosis = async (id, reason) => {
  return apiClient.post(`/diagnosis/${id}/reject`, { reason });
};

// Archive diagnosis
export const archiveDiagnosis = async (id) => {
  return apiClient.put(`/diagnosis/${id}/archive`);
};

// Restore archived diagnosis
export const restoreDiagnosis = async (id) => {
  return apiClient.put(`/diagnosis/${id}/restore`);
};

// Batch operations
export const batchDeleteDiagnoses = async (ids) => {
  return apiClient.delete('/diagnosis/batch', { data: { ids } });
};

export const batchExportDiagnoses = async (ids, format = 'pdf') => {
  return apiClient.post(
    '/diagnosis/batch/export',
    { ids },
    {
      params: { format },
      responseType: 'blob',
    }
  );
};

// Search diagnoses
export const searchDiagnoses = async (query, filters = {}) => {
  return apiClient.post('/diagnosis/search', {
    query,
    filters,
  });
};

// Get diagnosis insights
export const getDiagnosisInsights = async (id) => {
  return apiClient.get(`/diagnosis/${id}/insights`);
};

// Get quality metrics
export const getQualityMetrics = async (id) => {
  return apiClient.get(`/diagnosis/${id}/quality`);
};

// Submit feedback
export const submitDiagnosisFeedback = async (id, feedback) => {
  return apiClient.post(`/diagnosis/${id}/feedback`, feedback);
};

export default {
  createDiagnosis,
  getDiagnosis,
  getDiagnosisStatus,
  getDiagnoses,
  updateDiagnosis,
  cancelDiagnosis,
  retryDiagnosis,
  getDiagnosisResults,
  getAgentReports,
  getAgentReport,
  uploadMedicalImages,
  getDiagnosisTimeline,
  addDiagnosisComment,
  getDiagnosisComments,
  exportDiagnosisReport,
  shareDiagnosis,
  getDiagnosisStats,
  getDiagnosisAnalytics,
  compareDiagnoses,
  getSimilarDiagnoses,
  requestSecondOpinion,
  approveDiagnosis,
  rejectDiagnosis,
  archiveDiagnosis,
  restoreDiagnosis,
  batchDeleteDiagnoses,
  batchExportDiagnoses,
  searchDiagnoses,
  getDiagnosisInsights,
  getQualityMetrics,
  submitDiagnosisFeedback,
};
