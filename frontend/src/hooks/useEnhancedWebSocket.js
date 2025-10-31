/**
 * Enhanced WebSocket Hook for Real-time Medical AI Platform
 * Complete integration with backend WebSocket endpoints for live updates
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import medicalAIClient from '../services/medicalAIClient';
import toast from 'react-hot-toast';

export const useEnhancedWebSocket = (options = {}) => {
  const {
    autoConnect = true,
    reconnectAttempts = 5,
    reconnectInterval = 3000,
    onConnectionChange,
    onMessage,
    onError,
  } = options;

  // Connection state
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastMessage, setLastMessage] = useState(null);
  const [reconnectCount, setReconnectCount] = useState(0);
  
  // Real-time data states
  const [agentStatus, setAgentStatus] = useState({});
  const [systemMetrics, setSystemMetrics] = useState({});
  const [workflowProgress, setWorkflowProgress] = useState({});
  const [analysisResults, setAnalysisResults] = useState({});
  const [queueStatus, setQueueStatus] = useState({});

  // WebSocket references
  const wsConnections = useRef(new Map());
  const reconnectTimeouts = useRef(new Map());

  // ==================== Connection Management ====================

  const connectToEndpoint = useCallback((endpoint, connectionId, messageHandler) => {
    if (wsConnections.current.has(connectionId)) {
      const existingWs = wsConnections.current.get(connectionId);
      if (existingWs.readyState === WebSocket.OPEN) {
        return existingWs;
      }
    }

    const ws = medicalAIClient.createWebSocketConnection(endpoint, {
      connectionId,
      onOpen: () => {
        setConnectionStatus('connected');
        setReconnectCount(0);
        
        if (onConnectionChange) {
          onConnectionChange('connected', connectionId);
        }
        
        toast.success(`Connected to ${connectionId}`, {
          duration: 2000,
          style: { background: '#10B981', color: 'white' }
        });
      },
      
      onMessage: (data) => {
        setLastMessage({ ...data, timestamp: Date.now(), endpoint: connectionId });
        
        if (messageHandler) {
          messageHandler(data);
        }
        
        if (onMessage) {
          onMessage(data, connectionId);
        }
      },
      
      onClose: (event) => {
        setConnectionStatus('disconnected');
        wsConnections.current.delete(connectionId);
        
        if (onConnectionChange) {
          onConnectionChange('disconnected', connectionId);
        }
        
        // Auto-reconnect logic
        if (autoConnect && reconnectCount < reconnectAttempts) {
          const timeout = setTimeout(() => {
            setReconnectCount(prev => prev + 1);
            connectToEndpoint(endpoint, connectionId, messageHandler);
          }, reconnectInterval);
          
          reconnectTimeouts.current.set(connectionId, timeout);
        }
      },
      
      onError: (error) => {
        console.error(`WebSocket error for ${connectionId}:`, error);
        setConnectionStatus('error');
        
        if (onError) {
          onError(error, connectionId);
        }
        
        toast.error(`Connection error: ${connectionId}`, {
          duration: 3000,
          style: { background: '#EF4444', color: 'white' }
        });
      }
    });

    wsConnections.current.set(connectionId, ws);
    return ws;
  }, [autoConnect, reconnectAttempts, reconnectInterval, onConnectionChange, onMessage, onError, reconnectCount]);

  // ==================== Specialized Connection Methods ====================

  const connectToWorkflowUpdates = useCallback((workflowId) => {
    return connectToEndpoint(
      `/ws/workflows/${workflowId}`,
      `workflow-${workflowId}`,
      (data) => {
        switch (data.type) {
          case 'workflow_progress':
            setWorkflowProgress(prev => ({
              ...prev,
              [workflowId]: {
                ...prev[workflowId],
                progress: data.progress,
                current_step: data.current_step,
                estimated_completion: data.estimated_completion,
              }
            }));
            break;
            
          case 'workflow_status':
            setWorkflowProgress(prev => ({
              ...prev,
              [workflowId]: {
                ...prev[workflowId],
                status: data.status,
                message: data.message,
              }
            }));
            break;
            
          case 'workflow_results':
            setAnalysisResults(prev => ({
              ...prev,
              [workflowId]: data.results
            }));
            
            toast.success(`Analysis complete: ${workflowId}`, {
              duration: 4000,
              style: { background: '#059669', color: 'white' }
            });
            break;
            
          case 'workflow_error':
            toast.error(`Workflow error: ${data.message}`, {
              duration: 5000,
              style: { background: '#DC2626', color: 'white' }
            });
            break;
        }
      }
    );
  }, [connectToEndpoint]);

  const connectToAgentStatus = useCallback(() => {
    return connectToEndpoint(
      '/ws/agents/status',
      'agent-status',
      (data) => {
        switch (data.type) {
          case 'agent_status_update':
            setAgentStatus(prev => ({
              ...prev,
              [data.agent_name]: {
                ...prev[data.agent_name],
                ...data.status,
                last_updated: Date.now(),
              }
            }));
            break;
            
          case 'agent_progress':
            setAgentStatus(prev => ({
              ...prev,
              [data.agent_name]: {
                ...prev[data.agent_name],
                progress: data.progress,
                current_task: data.current_task,
              }
            }));
            break;
            
          case 'agent_results':
            setAgentStatus(prev => ({
              ...prev,
              [data.agent_name]: {
                ...prev[data.agent_name],
                last_results: data.results,
                status: 'completed',
              }
            }));
            break;
        }
      }
    );
  }, [connectToEndpoint]);

  const connectToSystemMetrics = useCallback(() => {
    return connectToEndpoint(
      '/ws/system/metrics',
      'system-metrics',
      (data) => {
        switch (data.type) {
          case 'system_metrics_update':
            setSystemMetrics(prev => ({
              ...prev,
              ...data.metrics,
              timestamp: Date.now(),
            }));
            break;
            
          case 'queue_status_update':
            setQueueStatus(prev => ({
              ...prev,
              ...data.queues,
              timestamp: Date.now(),
            }));
            break;
            
          case 'system_alert':
            toast.error(`System Alert: ${data.message}`, {
              duration: 8000,
              style: { background: '#DC2626', color: 'white' }
            });
            break;
            
          case 'resource_warning':
            toast.warn(`Resource Warning: ${data.message}`, {
              duration: 6000,
              style: { background: '#F59E0B', color: 'white' }
            });
            break;
        }
      }
    );
  }, [connectToEndpoint]);

  const connectToAnalysisSession = useCallback((sessionId) => {
    return connectToEndpoint(
      `/ws/analysis/${sessionId}`,
      `analysis-${sessionId}`,
      (data) => {
        switch (data.type) {
          case 'image_analysis_progress':
            setWorkflowProgress(prev => ({
              ...prev,
              [`analysis-${sessionId}`]: {
                ...prev[`analysis-${sessionId}`],
                image_progress: data.progress,
                current_image: data.current_image,
                processed_images: data.processed_images,
              }
            }));
            break;
            
          case 'analysis_insights':
            setAnalysisResults(prev => ({
              ...prev,
              [`analysis-${sessionId}`]: {
                ...prev[`analysis-${sessionId}`],
                insights: data.insights,
                confidence_scores: data.confidence_scores,
              }
            }));
            break;
            
          case 'real_time_annotations':
            setAnalysisResults(prev => ({
              ...prev,
              [`analysis-${sessionId}`]: {
                ...prev[`analysis-${sessionId}`],
                annotations: data.annotations,
                heatmaps: data.heatmaps,
              }
            }));
            break;
        }
      }
    );
  }, [connectToEndpoint]);

  // ==================== Message Sending Methods ====================

  const sendMessage = useCallback((connectionId, message) => {
    const ws = wsConnections.current.get(connectionId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  const sendWorkflowCommand = useCallback((workflowId, command) => {
    return sendMessage(`workflow-${workflowId}`, {
      type: 'workflow_command',
      command,
      timestamp: Date.now(),
    });
  }, [sendMessage]);

  const sendAgentCommand = useCallback((agentName, command) => {
    return sendMessage('agent-status', {
      type: 'agent_command',
      agent: agentName,
      command,
      timestamp: Date.now(),
    });
  }, [sendMessage]);

  // ==================== Connection Control Methods ====================

  const disconnect = useCallback((connectionId) => {
    const ws = wsConnections.current.get(connectionId);
    if (ws) {
      ws.close();
      wsConnections.current.delete(connectionId);
    }
    
    const timeout = reconnectTimeouts.current.get(connectionId);
    if (timeout) {
      clearTimeout(timeout);
      reconnectTimeouts.current.delete(connectionId);
    }
  }, []);

  const disconnectAll = useCallback(() => {
    wsConnections.current.forEach((ws, connectionId) => {
      ws.close();
    });
    wsConnections.current.clear();
    
    reconnectTimeouts.current.forEach((timeout) => {
      clearTimeout(timeout);
    });
    reconnectTimeouts.current.clear();
    
    setConnectionStatus('disconnected');
  }, []);

  const reconnect = useCallback((connectionId) => {
    disconnect(connectionId);
    // Connection will be re-established based on the specific method used
  }, [disconnect]);

  // ==================== Utility Methods ====================

  const getConnectionStatus = useCallback((connectionId) => {
    const ws = wsConnections.current.get(connectionId);
    if (!ws) return 'disconnected';
    
    switch (ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'disconnecting';
      case WebSocket.CLOSED: return 'disconnected';
      default: return 'unknown';
    }
  }, []);

  const isConnected = useCallback((connectionId) => {
    return getConnectionStatus(connectionId) === 'connected';
  }, [getConnectionStatus]);

  // ==================== Cleanup Effect ====================

  useEffect(() => {
    return () => {
      disconnectAll();
    };
  }, [disconnectAll]);

  return {
    // Connection methods
    connectToWorkflowUpdates,
    connectToAgentStatus,
    connectToSystemMetrics,
    connectToAnalysisSession,
    
    // Message methods
    sendMessage,
    sendWorkflowCommand,
    sendAgentCommand,
    
    // Control methods
    disconnect,
    disconnectAll,
    reconnect,
    
    // Status methods
    getConnectionStatus,
    isConnected,
    
    // State data
    connectionStatus,
    lastMessage,
    reconnectCount,
    agentStatus,
    systemMetrics,
    workflowProgress,
    analysisResults,
    queueStatus,
  };
};

export default useEnhancedWebSocket;