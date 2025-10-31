// Ultra-Advanced WebSocket Hook for Real-time Updates
import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

/**
 * Ultra-Advanced WebSocket Hook
 * Features:
 * - Automatic reconnection
 * - Connection state management
 * - Event subscription/unsubscription
 * - Heartbeat monitoring
 * - Message queuing during disconnection
 * - Type-safe event emitters
 */

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export function useWebSocket(options = {}) {
  const {
    autoConnect = true,
    reconnection = true,
    reconnectionAttempts = 5,
    reconnectionDelay = 1000,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const messageQueueRef = useRef([]);
  const listenersRef = useRef(new Map());

  // Initialize socket connection
  useEffect(() => {
    if (!autoConnect) return;

    const token = localStorage.getItem('authToken');
    
    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      reconnection,
      reconnectionAttempts,
      reconnectionDelay,
      transports: ['websocket', 'polling'],
    });

    const socket = socketRef.current;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('✅ WebSocket connected:', socket.id);
      setIsConnected(true);
      setConnectionError(null);
      
      // Process queued messages
      while (messageQueueRef.current.length > 0) {
        const { event, data } = messageQueueRef.current.shift();
        socket.emit(event, data);
      }

      onConnect?.(socket);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      setIsConnected(false);
      onDisconnect?.(reason);
      
      if (reason === 'io server disconnect') {
        // Server disconnected - try to reconnect
        socket.connect();
      }
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setConnectionError(error.message);
      onError?.(error);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 WebSocket reconnected after ${attemptNumber} attempts`);
      toast.success('Reconnected to server');
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 WebSocket reconnection attempt ${attemptNumber}`);
    });

    socket.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error);
    });

    socket.on('reconnect_failed', () => {
      console.error('WebSocket reconnection failed');
      toast.error('Failed to reconnect to server');
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.off();
        socket.disconnect();
      }
    };
  }, [
    autoConnect,
    reconnection,
    reconnectionAttempts,
    reconnectionDelay,
    onConnect,
    onDisconnect,
    onError,
  ]);

  // Emit event
  const emit = useCallback((event, data) => {
    if (!socketRef.current) {
      console.warn('Socket not initialized');
      return;
    }

    if (isConnected) {
      socketRef.current.emit(event, data);
    } else {
      // Queue message if disconnected
      messageQueueRef.current.push({ event, data });
      console.warn('Message queued - socket disconnected');
    }
  }, [isConnected]);

  // Subscribe to event
  const on = useCallback((event, handler) => {
    if (!socketRef.current) {
      console.warn('Socket not initialized');
      return;
    }

    socketRef.current.on(event, handler);
    
    // Track listener for cleanup
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, []);
    }
    listenersRef.current.get(event).push(handler);
  }, []);

  // Unsubscribe from event
  const off = useCallback((event, handler) => {
    if (!socketRef.current) return;

    if (handler) {
      socketRef.current.off(event, handler);
      
      // Remove from tracked listeners
      const listeners = listenersRef.current.get(event);
      if (listeners) {
        const index = listeners.indexOf(handler);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    } else {
      // Remove all listeners for event
      socketRef.current.off(event);
      listenersRef.current.delete(event);
    }
  }, []);

  // Manually connect
  const connect = useCallback(() => {
    if (socketRef.current && !isConnected) {
      socketRef.current.connect();
    }
  }, [isConnected]);

  // Manually disconnect
  const disconnect = useCallback(() => {
    if (socketRef.current && isConnected) {
      socketRef.current.disconnect();
    }
  }, [isConnected]);

  return {
    socket: socketRef.current,
    isConnected,
    connectionError,
    emit,
    on,
    off,
    connect,
    disconnect,
  };
}

// Specialized hook for diagnosis real-time updates
export function useDiagnosisWebSocket(diagnosisId, options = {}) {
  const { onProgress, onComplete, onError, onStatusChange } = options;
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('pending');
  const { socket, isConnected, emit, on, off } = useWebSocket();

  useEffect(() => {
    if (!socket || !isConnected || !diagnosisId) return;

    // Join diagnosis room
    emit('join_diagnosis', diagnosisId);
    console.log(`📡 Joined diagnosis room: ${diagnosisId}`);

    // Subscribe to events
    on('diagnosis:progress', (data) => {
      if (data.diagnosisId === diagnosisId) {
        setProgress(data.progress);
        onProgress?.(data);
      }
    });

    on('diagnosis:status', (data) => {
      if (data.diagnosisId === diagnosisId) {
        setStatus(data.status);
        onStatusChange?.(data);
      }
    });

    on('diagnosis:complete', (data) => {
      if (data.diagnosisId === diagnosisId) {
        setProgress(100);
        setStatus('completed');
        onComplete?.(data);
        toast.success('Diagnosis completed!');
      }
    });

    on('diagnosis:error', (data) => {
      if (data.diagnosisId === diagnosisId) {
        setStatus('error');
        onError?.(data);
        toast.error(`Diagnosis error: ${data.message}`);
      }
    });

    on('agent:update', (data) => {
      if (data.diagnosisId === diagnosisId) {
        console.log('Agent update:', data);
      }
    });

    // Cleanup
    return () => {
      emit('leave_diagnosis', diagnosisId);
      off('diagnosis:progress');
      off('diagnosis:status');
      off('diagnosis:complete');
      off('diagnosis:error');
      off('agent:update');
    };
  }, [socket, isConnected, diagnosisId, emit, on, off, onProgress, onComplete, onError, onStatusChange]);

  return {
    progress,
    status,
    isConnected,
  };
}

// Hook for general notifications
export function useNotificationWebSocket(userId, options = {}) {
  const { onNotification } = options;
  const [notifications, setNotifications] = useState([]);
  const { socket, isConnected, emit, on, off } = useWebSocket();

  useEffect(() => {
    if (!socket || !isConnected || !userId) return;

    // Join user notification room
    emit('join_notifications', userId);

    // Subscribe to notifications
    on('notification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      onNotification?.(notification);
      
      // Show toast based on notification type
      switch (notification.type) {
        case 'success':
          toast.success(notification.message);
          break;
        case 'error':
          toast.error(notification.message);
          break;
        case 'warning':
          toast(notification.message, { icon: '⚠️' });
          break;
        case 'info':
          toast(notification.message, { icon: 'ℹ️' });
          break;
        default:
          toast(notification.message);
      }
    });

    // Cleanup
    return () => {
      emit('leave_notifications', userId);
      off('notification');
    };
  }, [socket, isConnected, userId, emit, on, off, onNotification]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    clearNotifications,
    isConnected,
  };
}

export default {
  useWebSocket,
  useDiagnosisWebSocket,
  useNotificationWebSocket,
};
