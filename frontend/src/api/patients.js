// Ultra-Advanced Patients API Service
import apiClient, { createCancelToken, retryRequest } from './axios';

/**
 * Patients API Service
 * Provides all patient-related API operations with advanced features:
 * - Request cancellation
 * - Automatic retries
 * - Optimistic updates support
 * - Batch operations
 */

// Get all patients with advanced filtering and pagination
export const getPatients = async (params = {}) => {
  const {
    page = 1,
    limit = 20,
    search = '',
    status = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    cancelToken,
  } = params;

  return apiClient.get('/patients', {
    params: {
      page,
      limit,
      search,
      status,
      sortBy,
      sortOrder,
    },
    cancelToken,
  });
};

// Get single patient by ID
export const getPatient = async (id, options = {}) => {
  return retryRequest(
    () => apiClient.get(`/patients/${id}`),
    { maxRetries: 3, ...options }
  );
};

// Create new patient
export const createPatient = async (data) => {
  return apiClient.post('/patients', data);
};

// Update patient
export const updatePatient = async (id, data) => {
  return apiClient.put(`/patients/${id}`, data);
};

// Partial update patient
export const patchPatient = async (id, data) => {
  return apiClient.patch(`/patients/${id}`, data);
};

// Delete patient
export const deletePatient = async (id) => {
  return apiClient.delete(`/patients/${id}`);
};

// Batch operations
export const batchCreatePatients = async (patients) => {
  return apiClient.post('/patients/batch', { patients });
};

export const batchUpdatePatients = async (updates) => {
  return apiClient.put('/patients/batch', { updates });
};

export const batchDeletePatients = async (ids) => {
  return apiClient.delete('/patients/batch', { data: { ids } });
};

// Search patients with advanced filters
export const searchPatients = async (query, filters = {}) => {
  return apiClient.post('/patients/search', {
    query,
    filters,
  });
};

// Get patient statistics
export const getPatientStats = async (id) => {
  return apiClient.get(`/patients/${id}/stats`);
};

// Get patient medical history
export const getPatientHistory = async (id, params = {}) => {
  return apiClient.get(`/patients/${id}/history`, { params });
};

// Get patient diagnoses
export const getPatientDiagnoses = async (id, params = {}) => {
  return apiClient.get(`/patients/${id}/diagnoses`, { params });
};

// Export patients data
export const exportPatients = async (format = 'csv', filters = {}) => {
  return apiClient.post(
    '/patients/export',
    { filters },
    {
      params: { format },
      responseType: 'blob',
    }
  );
};

// Import patients data
export const importPatients = async (file, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  Object.keys(options).forEach(key => {
    formData.append(key, options[key]);
  });

  return apiClient.post('/patients/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: options.onProgress,
  });
};

// Get patient analytics
export const getPatientAnalytics = async (params = {}) => {
  return apiClient.get('/patients/analytics', { params });
};

// Advanced search with autocomplete
export const autocompletePatients = async (query, options = {}) => {
  const cancelToken = options.cancelToken || createCancelToken().token;
  
  return apiClient.get('/patients/autocomplete', {
    params: { query, ...options },
    cancelToken,
  });
};

// Check patient eligibility
export const checkPatientEligibility = async (id, criteria) => {
  return apiClient.post(`/patients/${id}/eligibility`, { criteria });
};

// Merge duplicate patients
export const mergePatients = async (primaryId, duplicateIds) => {
  return apiClient.post('/patients/merge', {
    primaryId,
    duplicateIds,
  });
};

// Get patient timeline
export const getPatientTimeline = async (id, params = {}) => {
  return apiClient.get(`/patients/${id}/timeline`, { params });
};

// Add patient note
export const addPatientNote = async (id, note) => {
  return apiClient.post(`/patients/${id}/notes`, { note });
};

// Get patient notes
export const getPatientNotes = async (id, params = {}) => {
  return apiClient.get(`/patients/${id}/notes`, { params });
};

// Upload patient document
export const uploadPatientDocument = async (id, file, metadata = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  Object.keys(metadata).forEach(key => {
    formData.append(key, metadata[key]);
  });

  return apiClient.post(`/patients/${id}/documents`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Get patient documents
export const getPatientDocuments = async (id, params = {}) => {
  return apiClient.get(`/patients/${id}/documents`, { params });
};

export default {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  patchPatient,
  deletePatient,
  batchCreatePatients,
  batchUpdatePatients,
  batchDeletePatients,
  searchPatients,
  getPatientStats,
  getPatientHistory,
  getPatientDiagnoses,
  exportPatients,
  importPatients,
  getPatientAnalytics,
  autocompletePatients,
  checkPatientEligibility,
  mergePatients,
  getPatientTimeline,
  addPatientNote,
  getPatientNotes,
  uploadPatientDocument,
  getPatientDocuments,
};
