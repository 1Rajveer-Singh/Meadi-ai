// Ultra-Advanced Axios Configuration with Interceptors
import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token, request ID, timestamp
apiClient.interceptors.request.use(
  (config) => {
    // Add authentication token
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request ID for tracking
    config.headers['X-Request-ID'] = generateRequestId();
    
    // Add timestamp
    config.metadata = { startTime: new Date() };
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log('🚀 API Request:', {
        method: config.method.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors, log performance, auto-refresh tokens
apiClient.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = new Date() - response.config.metadata.startTime;
    
    // Log response in development
    if (import.meta.env.DEV) {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        duration: `${duration}ms`,
        data: response.data,
      });
    }

    // Warn on slow requests
    if (duration > 3000) {
      console.warn(`⚠️ Slow API request (${duration}ms):`, response.config.url);
    }

    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors - SUPPRESS NOTIFICATIONS FOR DEVELOPMENT
    if (!error.response) {
      // Suppress network error notifications for development
      if (import.meta.env.DEV) {
        console.warn('⚠️ Network error suppressed for development:', error.message);
      } else {
        toast.error('Network error. Please check your connection.');
      }
      return Promise.reject({
        message: 'Network error',
        type: 'NETWORK_ERROR',
      });
    }

    const { status, data } = error.response;

    // Handle different error types
    switch (status) {
      case 401:
        // Unauthorized - try to refresh token
        if (!originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await axios.post(
                `${apiClient.defaults.baseURL}/auth/refresh`,
                { refreshToken }
              );
              
              const { token } = response.data;
              localStorage.setItem('authToken', token);
              
              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return apiClient(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed - logout user
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/';
            toast.error('Session expired. Please login again.');
            return Promise.reject(refreshError);
          }
        }
        break;

      case 403:
        // Suppress error notifications in development
        if (!import.meta.env.DEV) {
          toast.error('Access denied. You don\'t have permission.');
        }
        break;

      case 404:
        // Suppress error notifications in development
        if (!import.meta.env.DEV) {
          toast.error('Resource not found.');
        }
        break;

      case 422:
        // Suppress validation error notifications in development
        if (!import.meta.env.DEV) {
          if (data.errors) {
            Object.values(data.errors).forEach((error) => {
              toast.error(error);
            });
          } else {
            toast.error(data.message || 'Validation error');
          }
        }
        break;

      case 429:
        // Suppress rate limit error notifications in development
        if (!import.meta.env.DEV) {
          toast.error('Too many requests. Please slow down.');
        }
        break;

      case 500:
      case 502:
      case 503:
      case 504:
        // Suppress server error notifications in development
        if (!import.meta.env.DEV) {
          toast.error('Server error. Please try again later.');
        }
        break;

      default:
        // Suppress all other error notifications in development
        if (!import.meta.env.DEV) {
          toast.error(data.message || 'An error occurred');
        }
    }

    // Log error in development
    if (import.meta.env.DEV) {
      console.error('❌ API Error:', {
        status,
        url: error.config.url,
        message: data.message,
        data,
      });
    }

    return Promise.reject({
      status,
      message: data.message || 'An error occurred',
      errors: data.errors,
      data,
    });
  }
);

// Helper function to generate unique request ID
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Request cancellation support
export const createCancelToken = () => axios.CancelToken.source();

// Multi-part form data helper
export const createFormData = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    if (Array.isArray(data[key])) {
      data[key].forEach((item) => formData.append(key, item));
    } else {
      formData.append(key, data[key]);
    }
  });
  return formData;
};

// Batch requests helper
export const batchRequests = async (requests, options = {}) => {
  const { maxConcurrent = 5, onProgress } = options;
  const results = [];
  const queue = [...requests];
  let completed = 0;

  const executeNext = async () => {
    if (queue.length === 0) return;
    
    const request = queue.shift();
    try {
      const result = await request();
      results.push({ success: true, data: result });
    } catch (error) {
      results.push({ success: false, error });
    }
    
    completed++;
    if (onProgress) {
      onProgress(completed, requests.length);
    }
    
    return executeNext();
  };

  // Execute requests with concurrency limit
  const workers = Array(Math.min(maxConcurrent, requests.length))
    .fill()
    .map(() => executeNext());
  
  await Promise.all(workers);
  return results;
};

// Retry helper for failed requests
export const retryRequest = async (requestFn, options = {}) => {
  const { maxRetries = 3, delayMs = 1000, backoff = true } = options;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delay = backoff ? delayMs * Math.pow(2, i) : delayMs;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

export default apiClient;
