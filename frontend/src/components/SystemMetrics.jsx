/**
 * Enhanced System Metrics Component
 * Real-time system performance monitoring and resource utilization display
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Cpu, MemoryStick, HardDrive, Activity, Server, Gauge,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  Clock, Zap, Database, Network, Wifi, Monitor, Timer,
  BarChart3, PieChart, LineChart, Settings, RefreshCw,
  ThermometerSun, Wind, Power, Battery, Signal, Globe
} from 'lucide-react';
import medicalAIClient from '../services/medicalAIClient';
import { useEnhancedWebSocket } from '../hooks/useEnhancedWebSocket';

const SystemMetrics = ({ className = '', refreshInterval = 5000 }) => {
  // Real-time data from WebSocket
  const {
    systemMetrics,
    queueStatus,
    connectToSystemMetrics,
    isConnected
  } = useEnhancedWebSocket({
    autoConnect: true,
    reconnectAttempts: 3,
  });

  // Local state for historical data and UI
  const [historicalData, setHistoricalData] = useState({
    cpu: [],
    memory: [],
    disk: [],
    network: [],
    gpu: []
  });
  const [alerts, setAlerts] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [timeRange, setTimeRange] = useState('1h');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const maxHistoryPoints = 50;
  const chartRef = useRef(null);

  // ==================== Effects ====================

  useEffect(() => {
    connectToSystemMetrics();
  }, [connectToSystemMetrics]);

  useEffect(() => {
    // Update historical data when new metrics arrive
    if (systemMetrics && Object.keys(systemMetrics).length > 0) {
      const timestamp = Date.now();
      
      setHistoricalData(prev => ({
        cpu: [...prev.cpu.slice(-(maxHistoryPoints - 1)), {
          timestamp,
          value: systemMetrics.cpu_usage || 0
        }],
        memory: [...prev.memory.slice(-(maxHistoryPoints - 1)), {
          timestamp,
          value: systemMetrics.memory_usage || 0
        }],
        disk: [...prev.disk.slice(-(maxHistoryPoints - 1)), {
          timestamp,
          value: systemMetrics.disk_usage || 0
        }],
        network: [...prev.network.slice(-(maxHistoryPoints - 1)), {
          timestamp,
          value: systemMetrics.network_io || 0
        }],
        gpu: [...prev.gpu.slice(-(maxHistoryPoints - 1)), {
          timestamp,
          value: systemMetrics.gpu_usage || 0
        }]
      }));

      // Check for alerts
      checkForAlerts(systemMetrics);
    }
  }, [systemMetrics]);

  // ==================== Alert System ====================

  const checkForAlerts = (metrics) => {
    const newAlerts = [];
    const timestamp = Date.now();

    if (metrics.cpu_usage > 90) {
      newAlerts.push({
        id: `cpu-${timestamp}`,
        type: 'critical',
        message: 'CPU usage critically high',
        value: `${metrics.cpu_usage}%`,
        timestamp
      });
    } else if (metrics.cpu_usage > 80) {
      newAlerts.push({
        id: `cpu-${timestamp}`,
        type: 'warning',
        message: 'CPU usage high',
        value: `${metrics.cpu_usage}%`,
        timestamp
      });
    }

    if (metrics.memory_usage > 95) {
      newAlerts.push({
        id: `memory-${timestamp}`,
        type: 'critical',
        message: 'Memory usage critically high',
        value: `${metrics.memory_usage}%`,
        timestamp
      });
    } else if (metrics.memory_usage > 85) {
      newAlerts.push({
        id: `memory-${timestamp}`,
        type: 'warning',
        message: 'Memory usage high',
        value: `${metrics.memory_usage}%`,
        timestamp
      });
    }

    if (metrics.disk_usage > 95) {
      newAlerts.push({
        id: `disk-${timestamp}`,
        type: 'critical',
        message: 'Disk space critically low',
        value: `${metrics.disk_usage}%`,
        timestamp
      });
    }

    if (metrics.processing_queue > 20) {
      newAlerts.push({
        id: `queue-${timestamp}`,
        type: 'warning',
        message: 'Processing queue backing up',
        value: `${metrics.processing_queue} tasks`,
        timestamp
      });
    }

    // Update alerts (keep only recent ones)
    setAlerts(prev => [
      ...newAlerts,
      ...prev.filter(alert => timestamp - alert.timestamp < 300000) // 5 minutes
    ]);
  };

  // ==================== Data Refresh ====================

  const refreshMetrics = async () => {
    setIsRefreshing(true);
    try {
      await medicalAIClient.getSystemMetrics();
      // Data will be updated via WebSocket
    } catch (error) {
      console.error('Failed to refresh metrics:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // ==================== Utility Functions ====================

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (value, thresholds = { warning: 70, critical: 90 }) => {
    if (value >= thresholds.critical) return '#EF4444';
    if (value >= thresholds.warning) return '#F59E0B';
    return '#10B981';
  };

  const getStatusIcon = (value, thresholds = { warning: 70, critical: 90 }) => {
    if (value >= thresholds.critical) return AlertTriangle;
    if (value >= thresholds.warning) return AlertTriangle;
    return CheckCircle;
  };

  // ==================== Render Methods ====================

  const renderMetricCard = (title, value, unit, IconComponent, thresholds, additionalInfo = null) => {
    const color = getStatusColor(value, thresholds);
    const StatusIcon = getStatusIcon(value, thresholds);
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="p-3 rounded-lg"
              style={{ backgroundColor: `${color}20` }}
            >
              <IconComponent className="w-6 h-6" style={{ color }} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">{title}</h3>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-bold text-gray-900">
                  {typeof value === 'number' ? value.toFixed(1) : value}
                </span>
                <span className="text-sm text-gray-500">{unit}</span>
              </div>
            </div>
          </div>
          
          <StatusIcon 
            className="w-5 h-5" 
            style={{ color }} 
          />
        </div>
        
        {/* Progress Bar */}
        {typeof value === 'number' && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(value, 100)}%`,
                  backgroundColor: color
                }}
              />
            </div>
          </div>
        )}
        
        {additionalInfo && (
          <div className="mt-3 text-xs text-gray-600">
            {additionalInfo}
          </div>
        )}
      </motion.div>
    );
  };

  const renderMiniChart = (data, color, label) => {
    if (!data || data.length < 2) {
      return (
        <div className="h-16 flex items-center justify-center text-gray-400">
          No data available
        </div>
      );
    }

    const max = Math.max(...data.map(d => d.value));
    const min = Math.min(...data.map(d => d.value));
    const range = max - min;
    
    return (
      <div className="h-16 flex items-end space-x-1">
        {data.slice(-20).map((point, index) => {
          const height = range > 0 ? ((point.value - min) / range) * 100 : 50;
          return (
            <div
              key={index}
              className="flex-1 rounded-t"
              style={{
                height: `${Math.max(height, 4)}%`,
                backgroundColor: color,
                opacity: 0.7 + (index / data.length) * 0.3
              }}
            />
          );
        })}
      </div>
    );
  };

  const renderQueueStatus = () => {
    if (!queueStatus || Object.keys(queueStatus).length === 0) {
      return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Queues</h3>
          <div className="text-center text-gray-500 py-8">
            No queue data available
          </div>
        </div>
      );
    }

    const queues = [
      { name: 'Image Analysis', key: 'image_analysis_queue', icon: Activity, color: '#8B5CF6' },
      { name: 'Drug Interactions', key: 'drug_check_queue', icon: Database, color: '#F59E0B' },
      { name: 'Research Tasks', key: 'research_queue', icon: Search, color: '#06B6D4' },
      { name: 'History Synthesis', key: 'history_queue', icon: Clock, color: '#10B981' },
    ];

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Processing Queues</h3>
          <div className="text-sm text-gray-500">
            Updated: {new Date(queueStatus.timestamp || Date.now()).toLocaleTimeString()}
          </div>
        </div>
        
        <div className="space-y-4">
          {queues.map(queue => {
            const count = queueStatus[queue.key] || 0;
            const Icon = queue.icon;
            
            return (
              <div key={queue.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="p-2 rounded"
                    style={{ backgroundColor: `${queue.color}20` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: queue.color }} />
                  </div>
                  <span className="font-medium text-gray-900">{queue.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold text-gray-900">{count}</span>
                  <span className="text-sm text-gray-500">tasks</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAlerts = () => {
    if (alerts.length === 0) {
      return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Alerts</h3>
          <div className="flex items-center justify-center text-green-600 py-8">
            <CheckCircle className="w-6 h-6 mr-2" />
            All systems operating normally
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          System Alerts ({alerts.length})
        </h3>
        
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {alerts.slice(0, 10).map(alert => (
            <div
              key={alert.id}
              className={`
                flex items-center justify-between p-3 rounded-lg border-l-4
                ${alert.type === 'critical' 
                  ? 'bg-red-50 border-red-500' 
                  : 'bg-yellow-50 border-yellow-500'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <AlertTriangle 
                  className={`w-4 h-4 ${
                    alert.type === 'critical' ? 'text-red-500' : 'text-yellow-500'
                  }`} 
                />
                <div>
                  <div className="font-medium text-gray-900">{alert.message}</div>
                  <div className="text-sm text-gray-600">{alert.value}</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {new Date(alert.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderConnectionStatus = () => {
    const connected = isConnected('system-metrics');
    
    return (
      <div className={`
        flex items-center space-x-2 px-3 py-2 rounded-full text-sm
        ${connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
      `}>
        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span>{connected ? 'Connected' : 'Disconnected'}</span>
        {connected && <Wifi className="w-4 h-4" />}
        {!connected && <WifiOff className="w-4 h-4" />}
      </div>
    );
  };

  // Default metrics if no data available
  const currentMetrics = {
    cpu_usage: 0,
    memory_usage: 0,
    disk_usage: 0,
    gpu_usage: 0,
    network_latency: 0,
    processing_queue: 0,
    ...systemMetrics
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Metrics</h2>
          <p className="text-gray-600">Real-time system performance monitoring</p>
        </div>
        <div className="flex items-center space-x-4">
          {renderConnectionStatus()}
          <button
            onClick={refreshMetrics}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {renderMetricCard(
          'CPU Usage',
          currentMetrics.cpu_usage,
          '%',
          Cpu,
          { warning: 70, critical: 90 },
          `${Math.max(0, 100 - currentMetrics.cpu_usage)}% available`
        )}
        
        {renderMetricCard(
          'Memory Usage',
          currentMetrics.memory_usage,
          '%',
          MemoryStick,
          { warning: 80, critical: 95 },
          `${formatBytes((100 - currentMetrics.memory_usage) * 1024 * 1024 * 100)} free`
        )}
        
        {renderMetricCard(
          'Disk Usage',
          currentMetrics.disk_usage,
          '%',
          HardDrive,
          { warning: 85, critical: 95 },
          `${Math.max(0, 100 - currentMetrics.disk_usage)}% free space`
        )}
        
        {renderMetricCard(
          'GPU Usage',
          currentMetrics.gpu_usage,
          '%',
          Gauge,
          { warning: 80, critical: 95 },
          `AI processing workload`
        )}
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* CPU & Memory Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">CPU & Memory Trends</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>CPU Usage</span>
                <span>{currentMetrics.cpu_usage.toFixed(1)}%</span>
              </div>
              {renderMiniChart(historicalData.cpu, '#3B82F6', 'CPU')}
            </div>
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Memory Usage</span>
                <span>{currentMetrics.memory_usage.toFixed(1)}%</span>
              </div>
              {renderMiniChart(historicalData.memory, '#10B981', 'Memory')}
            </div>
          </div>
        </div>

        {/* Network & GPU Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Network & GPU Activity</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Network I/O</span>
                <span>{formatBytes(currentMetrics.network_io || 0)}/s</span>
              </div>
              {renderMiniChart(historicalData.network, '#F59E0B', 'Network')}
            </div>
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>GPU Usage</span>
                <span>{currentMetrics.gpu_usage.toFixed(1)}%</span>
              </div>
              {renderMiniChart(historicalData.gpu, '#8B5CF6', 'GPU')}
            </div>
          </div>
        </div>
      </div>

      {/* Queue Status and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderQueueStatus()}
        {renderAlerts()}
      </div>
    </div>
  );
};

export default SystemMetrics;