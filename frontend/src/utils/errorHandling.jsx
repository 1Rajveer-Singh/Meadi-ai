/**
 * Enhanced Error Handling System
 * Comprehensive error management with user-friendly messages and recovery actions
 */

import React, { useState, useCallback, createContext, useContext } from 'react';
import { AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

// Error types based on backend responses
export const ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UPLOAD_ERROR: 'UPLOAD_ERROR',
  ANALYSIS_ERROR: 'ANALYSIS_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  QUOTA_ERROR: 'QUOTA_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

export const ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK_ERROR]: {
    title: 'Connection Problem',
    message: 'Unable to connect to the medical AI platform. Please check your internet connection.',
    suggestions: ['Check your internet connection', 'Try refreshing the page', 'Contact support if the problem persists'],
    recoverable: true,
    retryable: true
  },
  [ERROR_TYPES.AUTHENTICATION_ERROR]: {
    title: 'Authentication Required',
    message: 'Your session has expired. Please log in again to continue.',
    suggestions: ['Log in with your credentials', 'Check if your account is still active', 'Reset your password if needed'],
    recoverable: true,
    retryable: false,
    requiresAuth: true
  },
  [ERROR_TYPES.VALIDATION_ERROR]: {
    title: 'Invalid Data',
    message: 'The information provided is not valid. Please check and try again.',
    suggestions: ['Review the required fields', 'Check file formats and sizes', 'Ensure all data is complete'],
    recoverable: true,
    retryable: true
  },
  [ERROR_TYPES.SERVER_ERROR]: {
    title: 'Server Error',
    message: 'An internal server error occurred. Our team has been notified.',
    suggestions: ['Try again in a few minutes', 'Save your work locally', 'Contact support with error details'],
    recoverable: true,
    retryable: true
  },
  [ERROR_TYPES.UPLOAD_ERROR]: {
    title: 'Upload Failed',
    message: 'Failed to upload medical images. Please check file format and size.',
    suggestions: ['Ensure files are in supported formats (JPEG, PNG, DICOM)', 'Check file sizes are under 50MB', 'Try uploading fewer files at once'],
    recoverable: true,
    retryable: true
  },
  [ERROR_TYPES.ANALYSIS_ERROR]: {
    title: 'Analysis Failed',
    message: 'The AI analysis could not be completed. This may be temporary.',
    suggestions: ['Try starting the analysis again', 'Check if all required data is provided', 'Contact support if this continues'],
    recoverable: true,
    retryable: true
  },
  [ERROR_TYPES.TIMEOUT_ERROR]: {
    title: 'Request Timeout',
    message: 'The operation took too long to complete and was cancelled.',
    suggestions: ['Try again with a smaller dataset', 'Check your internet connection', 'The system may be busy - try later'],
    recoverable: true,
    retryable: true
  },
  [ERROR_TYPES.QUOTA_ERROR]: {
    title: 'Usage Limit Reached',
    message: 'You have reached your usage limit for this service.',
    suggestions: ['Upgrade your plan for more capacity', 'Wait for your quota to reset', 'Contact your administrator'],
    recoverable: false,
    retryable: false
  },
  [ERROR_TYPES.PERMISSION_ERROR]: {
    title: 'Access Denied',
    message: 'You do not have permission to perform this action.',
    suggestions: ['Check with your administrator', 'Ensure you have the correct role', 'Log out and log back in'],
    recoverable: false,
    retryable: false,
    requiresAuth: true
  },
  [ERROR_TYPES.SERVICE_UNAVAILABLE]: {
    title: 'Service Unavailable',
    message: 'The medical AI service is temporarily unavailable for maintenance.',
    suggestions: ['Try again later', 'Check our status page', 'Subscribe to updates for service notifications'],
    recoverable: true,
    retryable: true
  },
  [ERROR_TYPES.UNKNOWN_ERROR]: {
    title: 'Unexpected Error',
    message: 'An unexpected error occurred. Please try again or contact support.',
    suggestions: ['Try refreshing the page', 'Clear your browser cache', 'Contact support with error details'],
    recoverable: true,
    retryable: true
  }
};

// Error parsing function to categorize backend errors
export const parseError = (error) => {
  if (!error) {
    return {
      type: ERROR_TYPES.UNKNOWN_ERROR,
      message: 'Unknown error occurred',
      details: null,
      statusCode: null
    };
  }

  // Handle fetch/network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return {
      type: ERROR_TYPES.NETWORK_ERROR,
      message: error.message,
      details: null,
      statusCode: null
    };
  }

  // Handle timeout errors
  if (error.name === 'AbortError' || error.message.includes('timeout')) {
    return {
      type: ERROR_TYPES.TIMEOUT_ERROR,
      message: error.message,
      details: null,
      statusCode: 408
    };
  }

  // Parse HTTP error responses
  const errorMessage = error.message || error.detail || 'Unknown error';
  let errorType = ERROR_TYPES.UNKNOWN_ERROR;
  let statusCode = null;

  // Extract status code from error message if present
  const statusMatch = errorMessage.match(/HTTP (\d{3})/);
  if (statusMatch) {
    statusCode = parseInt(statusMatch[1]);
  }

  // Categorize by status code
  if (statusCode) {
    switch (Math.floor(statusCode / 100)) {
      case 4:
        if (statusCode === 401 || statusCode === 403) {
          errorType = statusCode === 401 ? ERROR_TYPES.AUTHENTICATION_ERROR : ERROR_TYPES.PERMISSION_ERROR;
        } else if (statusCode === 400) {
          errorType = ERROR_TYPES.VALIDATION_ERROR;
        } else if (statusCode === 408) {
          errorType = ERROR_TYPES.TIMEOUT_ERROR;
        } else if (statusCode === 413) {
          errorType = ERROR_TYPES.UPLOAD_ERROR;
        } else if (statusCode === 429) {
          errorType = ERROR_TYPES.QUOTA_ERROR;
        }
        break;
      case 5:
        if (statusCode === 503) {
          errorType = ERROR_TYPES.SERVICE_UNAVAILABLE;
        } else {
          errorType = ERROR_TYPES.SERVER_ERROR;
        }
        break;
    }
  }

  // Categorize by error message content
  if (errorMessage.toLowerCase().includes('upload') || errorMessage.toLowerCase().includes('file')) {
    errorType = ERROR_TYPES.UPLOAD_ERROR;
  } else if (errorMessage.toLowerCase().includes('analysis') || errorMessage.toLowerCase().includes('processing')) {
    errorType = ERROR_TYPES.ANALYSIS_ERROR;
  } else if (errorMessage.toLowerCase().includes('auth') || errorMessage.toLowerCase().includes('token')) {
    errorType = ERROR_TYPES.AUTHENTICATION_ERROR;
  } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('connection')) {
    errorType = ERROR_TYPES.NETWORK_ERROR;
  }

  return {
    type: errorType,
    message: errorMessage,
    details: error.details || error.stack || null,
    statusCode,
    originalError: error
  };
};

// Error Context
const ErrorContext = createContext();

export const useErrorHandler = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorHandler must be used within ErrorProvider');
  }
  return context;
};

export const ErrorProvider = ({ children }) => {
  const [errors, setErrors] = useState([]);
  const [globalError, setGlobalError] = useState(null);

  const handleError = useCallback((error, context = {}) => {
    const parsedError = parseError(error);
    const errorInfo = ERROR_MESSAGES[parsedError.type] || ERROR_MESSAGES[ERROR_TYPES.UNKNOWN_ERROR];
    
    const errorRecord = {
      id: Date.now().toString(),
      timestamp: new Date(),
      ...parsedError,
      ...errorInfo,
      context,
      acknowledged: false
    };

    console.error('Error handled:', errorRecord);

    // Add to error list
    setErrors(prev => [errorRecord, ...prev.slice(0, 49)]); // Keep last 50 errors

    // Show toast notification based on severity
    if (parsedError.statusCode >= 500 || parsedError.type === ERROR_TYPES.SERVER_ERROR) {
      toast.error(errorInfo.message, {
        duration: 6000,
        style: { background: '#EF4444', color: 'white' }
      });
    } else if (parsedError.statusCode >= 400) {
      toast.error(errorInfo.message, {
        duration: 4000,
        style: { background: '#F59E0B', color: 'white' }
      });
    } else {
      toast.error(errorInfo.message, {
        duration: 3000
      });
    }

    // Set global error for critical issues
    if (!errorInfo.recoverable) {
      setGlobalError(errorRecord);
    }

    return errorRecord;
  }, []);

  const retryOperation = useCallback(async (operationFn, maxRetries = 3, delay = 1000) => {
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operationFn();
      } catch (error) {
        lastError = error;
        const parsedError = parseError(error);
        const errorInfo = ERROR_MESSAGES[parsedError.type];
        
        if (!errorInfo?.retryable || attempt === maxRetries) {
          throw error;
        }
        
        // Wait before retrying with exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
        
        toast.loading(`Retrying... (${attempt}/${maxRetries})`, {
          duration: 1000
        });
      }
    }
    
    throw lastError;
  }, []);

  const clearError = useCallback((errorId) => {
    setErrors(prev => prev.filter(err => err.id !== errorId));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors([]);
    setGlobalError(null);
  }, []);

  const acknowledgeError = useCallback((errorId) => {
    setErrors(prev => 
      prev.map(err => 
        err.id === errorId ? { ...err, acknowledged: true } : err
      )
    );
  }, []);

  const dismissGlobalError = useCallback(() => {
    setGlobalError(null);
  }, []);

  const value = {
    errors,
    globalError,
    handleError,
    retryOperation,
    clearError,
    clearAllErrors,
    acknowledgeError,
    dismissGlobalError
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
};

// Higher-order component for error boundaries
export const withErrorHandling = (WrappedComponent) => {
  return function ErrorHandledComponent(props) {
    const { handleError } = useErrorHandler();
    
    const handleComponentError = (error, errorInfo) => {
      handleError(error, { 
        component: WrappedComponent.name,
        errorInfo 
      });
    };

    return (
      <ErrorBoundary onError={handleComponentError}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
};

// React Error Boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Something went wrong
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              An unexpected error occurred. Please refresh the page and try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Utility hooks for specific error scenarios
export const useApiErrorHandler = () => {
  const { handleError, retryOperation } = useErrorHandler();

  const handleApiCall = useCallback(async (apiCall, retries = 2) => {
    try {
      return await retryOperation(apiCall, retries);
    } catch (error) {
      return handleError(error, { type: 'api_call' });
    }
  }, [handleError, retryOperation]);

  return { handleApiCall };
};

export const useUploadErrorHandler = () => {
  const { handleError } = useErrorHandler();

  const handleUploadError = useCallback((error, fileInfo) => {
    return handleError(error, { 
      type: 'file_upload',
      fileName: fileInfo?.name,
      fileSize: fileInfo?.size,
      fileType: fileInfo?.type
    });
  }, [handleError]);

  return { handleUploadError };
};

export const useWebSocketErrorHandler = () => {
  const { handleError } = useErrorHandler();

  const handleConnectionError = useCallback((error, endpoint) => {
    return handleError(error, { 
      type: 'websocket_connection',
      endpoint
    });
  }, [handleError]);

  const handleMessageError = useCallback((error, message) => {
    return handleError(error, { 
      type: 'websocket_message',
      message
    });
  }, [handleError]);

  return { handleConnectionError, handleMessageError };
};

export default ErrorProvider;