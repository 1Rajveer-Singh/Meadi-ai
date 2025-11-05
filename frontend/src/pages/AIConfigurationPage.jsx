import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  Cpu,
  Settings,
  Sliders,
  Zap,
  Database,
  Activity,
  TrendingUp,
  BarChart3,
  FileText,
  Save,
  RotateCcw,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Info,
  Target,
  Gauge,
  Lock,
  Unlock,
  User,
  Bell,
  Shield,
  Link as LinkIcon,
  Users,
  Scale,
  Smartphone,
  CreditCard,
  LogOut,
} from "lucide-react";
import SimpleLayout from "../components/layouts/SimpleLayout";
import toast from "react-hot-toast";
import axios from "axios";

const AIConfigurationPage = () => {
  const navigate = useNavigate();
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("models");

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // AI Configuration States
  const [aiConfig, setAiConfig] = useState({
    // Model Selection
    primaryModel: "gpt-4-turbo",
    fallbackModel: "gpt-3.5-turbo",
    imageModel: "gpt-4-vision",
    embeddingModel: "text-embedding-3-large",

    // Performance Settings
    temperature: 0.7,
    maxTokens: 2048,
    topP: 0.9,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,

    // RAG Settings
    ragEnabled: true,
    chunkSize: 1000,
    chunkOverlap: 200,
    topKResults: 5,
    similarityThreshold: 0.75,

    // Multi-Agent Settings
    multiAgentEnabled: true,
    maxAgents: 5,
    agentTimeout: 30,
    parallelExecution: true,

    // Caching
    cacheEnabled: true,
    cacheTTL: 3600,
    
    // Safety & Validation
    contentFiltering: true,
    factChecking: true,
    confidenceThreshold: 0.8,
    requireHumanReview: false,
  });

  const [modelStats, setModelStats] = useState({
    totalRequests: 0,
    successRate: 0,
    avgResponseTime: 0,
    totalTokensUsed: 0,
    costEstimate: 0,
  });

  useEffect(() => {
    loadAIConfiguration();
    loadModelStats();
  }, []);

  const loadAIConfiguration = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/ai/config`);
      if (response.data.success) {
        setAiConfig(response.data.config);
      }
    } catch (error) {
      console.error("Error loading AI config:", error);
      // Use default config on error
    }
  };

  const loadModelStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/ai/stats`);
      if (response.data.success) {
        setModelStats(response.data.stats);
      }
    } catch (error) {
      console.error("Error loading model stats:", error);
    }
  };

  const handleConfigChange = (key, value) => {
    setAiConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  const saveConfiguration = async () => {
    setIsSaving(true);
    try {
      const response = await axios.put(`${API_BASE_URL}/api/ai/config`, aiConfig);
      if (response.data.success) {
        toast.success("AI configuration saved successfully!");
        setHasChanges(false);
      }
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("Failed to save configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = () => {
    if (window.confirm("Are you sure you want to reset to default settings?")) {
      loadAIConfiguration();
      setHasChanges(false);
      toast.success("Configuration reset to defaults");
    }
  };

  const tabs = [
    { id: "models", label: "AI Models", icon: Brain },
    { id: "performance", label: "Performance", icon: Zap },
    { id: "rag", label: "RAG Settings", icon: Database },
    { id: "agents", label: "Multi-Agent", icon: Activity },
    { id: "safety", label: "Safety & Validation", icon: AlertCircle },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  const renderModelsTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">AI Model Configuration</p>
            <p>
              Select and configure the AI models used for different tasks.
              Different models offer varying levels of performance, cost, and
              capabilities.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Primary Model */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-900 mb-3">
            <Brain className="w-4 h-4 text-blue-600" />
            <span>Primary Diagnosis Model</span>
          </label>
          <select
            value={aiConfig.primaryModel}
            onChange={(e) => handleConfigChange("primaryModel", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="gpt-4-turbo">GPT-4 Turbo (Recommended)</option>
            <option value="gpt-4">GPT-4 (High Quality)</option>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Fast)</option>
            <option value="claude-3-opus">Claude 3 Opus</option>
            <option value="claude-3-sonnet">Claude 3 Sonnet</option>
          </select>
          <p className="text-xs text-gray-500 mt-2">
            Used for primary medical diagnosis and analysis tasks
          </p>
        </div>

        {/* Fallback Model */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-900 mb-3">
            <Activity className="w-4 h-4 text-orange-600" />
            <span>Fallback Model</span>
          </label>
          <select
            value={aiConfig.fallbackModel}
            onChange={(e) => handleConfigChange("fallbackModel", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            <option value="gpt-4">GPT-4</option>
            <option value="claude-3-haiku">Claude 3 Haiku</option>
          </select>
          <p className="text-xs text-gray-500 mt-2">
            Used when primary model is unavailable
          </p>
        </div>

        {/* Image Analysis Model */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-900 mb-3">
            <Target className="w-4 h-4 text-green-600" />
            <span>Image Analysis Model</span>
          </label>
          <select
            value={aiConfig.imageModel}
            onChange={(e) => handleConfigChange("imageModel", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="gpt-4-vision">GPT-4 Vision</option>
            <option value="claude-3-opus">Claude 3 Opus (Vision)</option>
            <option value="gemini-pro-vision">Gemini Pro Vision</option>
          </select>
          <p className="text-xs text-gray-500 mt-2">
            Used for medical image analysis and interpretation
          </p>
        </div>

        {/* Embedding Model */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-900 mb-3">
            <Database className="w-4 h-4 text-purple-600" />
            <span>Embedding Model</span>
          </label>
          <select
            value={aiConfig.embeddingModel}
            onChange={(e) => handleConfigChange("embeddingModel", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="text-embedding-3-large">
              Text Embedding 3 Large
            </option>
            <option value="text-embedding-3-small">
              Text Embedding 3 Small
            </option>
            <option value="text-embedding-ada-002">
              Text Embedding Ada 002
            </option>
          </select>
          <p className="text-xs text-gray-500 mt-2">
            Used for vector search and semantic retrieval
          </p>
        </div>
      </div>
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Zap className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-green-900">
            <p className="font-medium mb-1">Performance Tuning</p>
            <p>
              Fine-tune AI model parameters to balance response quality, speed,
              and creativity. Lower temperature for more deterministic outputs,
              higher for more creative responses.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Temperature */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <label className="flex items-center justify-between text-sm font-medium text-gray-900 mb-3">
            <span className="flex items-center space-x-2">
              <Gauge className="w-4 h-4 text-orange-600" />
              <span>Temperature</span>
            </span>
            <span className="text-blue-600 font-semibold">
              {aiConfig.temperature}
            </span>
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={aiConfig.temperature}
            onChange={(e) =>
              handleConfigChange("temperature", parseFloat(e.target.value))
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Precise (0)</span>
            <span>Balanced (1)</span>
            <span>Creative (2)</span>
          </div>
        </div>

        {/* Max Tokens */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <label className="flex items-center justify-between text-sm font-medium text-gray-900 mb-3">
            <span className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Max Tokens</span>
            </span>
            <span className="text-blue-600 font-semibold">
              {aiConfig.maxTokens}
            </span>
          </label>
          <input
            type="range"
            min="256"
            max="4096"
            step="256"
            value={aiConfig.maxTokens}
            onChange={(e) =>
              handleConfigChange("maxTokens", parseInt(e.target.value))
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Short (256)</span>
            <span>Standard (2048)</span>
            <span>Long (4096)</span>
          </div>
        </div>

        {/* Top P */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <label className="flex items-center justify-between text-sm font-medium text-gray-900 mb-3">
            <span className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span>Top P (Nucleus Sampling)</span>
            </span>
            <span className="text-blue-600 font-semibold">{aiConfig.topP}</span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={aiConfig.topP}
            onChange={(e) =>
              handleConfigChange("topP", parseFloat(e.target.value))
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <p className="text-xs text-gray-500 mt-2">
            Controls diversity via nucleus sampling
          </p>
        </div>

        {/* Frequency Penalty */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <label className="flex items-center justify-between text-sm font-medium text-gray-900 mb-3">
            <span className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-green-600" />
              <span>Frequency Penalty</span>
            </span>
            <span className="text-blue-600 font-semibold">
              {aiConfig.frequencyPenalty}
            </span>
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={aiConfig.frequencyPenalty}
            onChange={(e) =>
              handleConfigChange("frequencyPenalty", parseFloat(e.target.value))
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <p className="text-xs text-gray-500 mt-2">
            Reduces repetition of frequent tokens
          </p>
        </div>
      </div>
    </div>
  );

  const renderRAGTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Database className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-purple-900">
            <p className="font-medium mb-1">RAG Configuration</p>
            <p>
              Configure Retrieval-Augmented Generation (RAG) settings for
              enhanced context retrieval and knowledge grounding.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <label className="flex items-center space-x-3">
            <span className="text-base font-semibold text-gray-900">
              Enable RAG
            </span>
          </label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={aiConfig.ragEnabled}
              onChange={(e) => handleConfigChange("ragEnabled", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {aiConfig.ragEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chunk Size */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-gray-900 mb-3">
                <span>Chunk Size</span>
                <span className="text-blue-600 font-semibold">
                  {aiConfig.chunkSize}
                </span>
              </label>
              <input
                type="range"
                min="256"
                max="2048"
                step="256"
                value={aiConfig.chunkSize}
                onChange={(e) =>
                  handleConfigChange("chunkSize", parseInt(e.target.value))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <p className="text-xs text-gray-500 mt-2">
                Size of text chunks for embedding
              </p>
            </div>

            {/* Chunk Overlap */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-gray-900 mb-3">
                <span>Chunk Overlap</span>
                <span className="text-blue-600 font-semibold">
                  {aiConfig.chunkOverlap}
                </span>
              </label>
              <input
                type="range"
                min="0"
                max="512"
                step="50"
                value={aiConfig.chunkOverlap}
                onChange={(e) =>
                  handleConfigChange("chunkOverlap", parseInt(e.target.value))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <p className="text-xs text-gray-500 mt-2">
                Overlap between consecutive chunks
              </p>
            </div>

            {/* Top K Results */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-gray-900 mb-3">
                <span>Top K Results</span>
                <span className="text-blue-600 font-semibold">
                  {aiConfig.topKResults}
                </span>
              </label>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={aiConfig.topKResults}
                onChange={(e) =>
                  handleConfigChange("topKResults", parseInt(e.target.value))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <p className="text-xs text-gray-500 mt-2">
                Number of relevant chunks to retrieve
              </p>
            </div>

            {/* Similarity Threshold */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-gray-900 mb-3">
                <span>Similarity Threshold</span>
                <span className="text-blue-600 font-semibold">
                  {aiConfig.similarityThreshold}
                </span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={aiConfig.similarityThreshold}
                onChange={(e) =>
                  handleConfigChange(
                    "similarityThreshold",
                    parseFloat(e.target.value)
                  )
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <p className="text-xs text-gray-500 mt-2">
                Minimum similarity score for retrieval
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderAgentsTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Activity className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-orange-900">
            <p className="font-medium mb-1">Multi-Agent System</p>
            <p>
              Configure the multi-agent AI system that coordinates specialized
              agents for complex medical analysis tasks.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <label className="flex items-center space-x-3">
            <span className="text-base font-semibold text-gray-900">
              Enable Multi-Agent System
            </span>
          </label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={aiConfig.multiAgentEnabled}
              onChange={(e) =>
                handleConfigChange("multiAgentEnabled", e.target.checked)
              }
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-orange-600"></div>
          </label>
        </div>

        {aiConfig.multiAgentEnabled && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Max Agents */}
              <div>
                <label className="flex items-center justify-between text-sm font-medium text-gray-900 mb-3">
                  <span>Maximum Concurrent Agents</span>
                  <span className="text-orange-600 font-semibold">
                    {aiConfig.maxAgents}
                  </span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={aiConfig.maxAgents}
                  onChange={(e) =>
                    handleConfigChange("maxAgents", parseInt(e.target.value))
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Number of agents that can run simultaneously
                </p>
              </div>

              {/* Agent Timeout */}
              <div>
                <label className="flex items-center justify-between text-sm font-medium text-gray-900 mb-3">
                  <span>Agent Timeout (seconds)</span>
                  <span className="text-orange-600 font-semibold">
                    {aiConfig.agentTimeout}s
                  </span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="120"
                  step="10"
                  value={aiConfig.agentTimeout}
                  onChange={(e) =>
                    handleConfigChange("agentTimeout", parseInt(e.target.value))
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Maximum execution time per agent
                </p>
              </div>
            </div>

            {/* Parallel Execution */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Parallel Execution</p>
                <p className="text-sm text-gray-600 mt-1">
                  Allow agents to execute tasks in parallel for faster results
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiConfig.parallelExecution}
                  onChange={(e) =>
                    handleConfigChange("parallelExecution", e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderSafetyTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-900">
            <p className="font-medium mb-1">Safety & Validation</p>
            <p>
              Configure safety measures and validation checks to ensure AI
              outputs meet medical standards and quality requirements.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Content Filtering */}
        <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <Lock className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Content Filtering</p>
              <p className="text-sm text-gray-600 mt-1">
                Filter inappropriate or harmful content from AI responses
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={aiConfig.contentFiltering}
              onChange={(e) =>
                handleConfigChange("contentFiltering", e.target.checked)
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
          </label>
        </div>

        {/* Fact Checking */}
        <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Fact Checking</p>
              <p className="text-sm text-gray-600 mt-1">
                Verify medical facts against trusted knowledge bases
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={aiConfig.factChecking}
              onChange={(e) =>
                handleConfigChange("factChecking", e.target.checked)
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </label>
        </div>

        {/* Confidence Threshold */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <label className="flex items-center justify-between text-sm font-medium text-gray-900 mb-3">
            <span>Minimum Confidence Threshold</span>
            <span className="text-blue-600 font-semibold">
              {(aiConfig.confidenceThreshold * 100).toFixed(0)}%
            </span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={aiConfig.confidenceThreshold}
            onChange={(e) =>
              handleConfigChange(
                "confidenceThreshold",
                parseFloat(e.target.value)
              )
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <p className="text-xs text-gray-500 mt-2">
            Minimum confidence score required for AI suggestions
          </p>
        </div>

        {/* Human Review */}
        <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">
                Require Human Review
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Flag all AI diagnoses for mandatory human verification
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={aiConfig.requireHumanReview}
              onChange={(e) =>
                handleConfigChange("requireHumanReview", e.target.checked)
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <BarChart3 className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-indigo-900">
            <p className="font-medium mb-1">AI Performance Analytics</p>
            <p>
              Monitor AI model usage, performance metrics, and cost analytics
              for optimization insights.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Requests</span>
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {modelStats.totalRequests.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">All-time API calls</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Success Rate</span>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {modelStats.successRate.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">Successful completions</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Avg Response Time</span>
            <Zap className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {modelStats.avgResponseTime.toFixed(0)}ms
          </p>
          <p className="text-xs text-gray-500 mt-1">Average latency</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Tokens Used</span>
            <FileText className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {(modelStats.totalTokensUsed / 1000000).toFixed(2)}M
          </p>
          <p className="text-xs text-gray-500 mt-1">Million tokens</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Estimated Cost</span>
            <TrendingUp className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ${modelStats.costEstimate.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">This period</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Cache Hit Rate</span>
            <Database className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {aiConfig.cacheEnabled ? "87%" : "0%"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {aiConfig.cacheEnabled ? "Cache enabled" : "Cache disabled"}
          </p>
        </div>
      </div>

      {/* Cache Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Cache Configuration
        </h3>

        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-medium text-gray-900">Enable Response Caching</p>
            <p className="text-sm text-gray-600 mt-1">
              Cache AI responses to reduce costs and improve speed
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={aiConfig.cacheEnabled}
              onChange={(e) =>
                handleConfigChange("cacheEnabled", e.target.checked)
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {aiConfig.cacheEnabled && (
          <div>
            <label className="flex items-center justify-between text-sm font-medium text-gray-900 mb-3">
              <span>Cache TTL (seconds)</span>
              <span className="text-blue-600 font-semibold">
                {aiConfig.cacheTTL}s ({Math.floor(aiConfig.cacheTTL / 60)}m)
              </span>
            </label>
            <input
              type="range"
              min="300"
              max="86400"
              step="300"
              value={aiConfig.cacheTTL}
              onChange={(e) =>
                handleConfigChange("cacheTTL", parseInt(e.target.value))
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>5 min</span>
              <span>1 hour</span>
              <span>24 hours</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <SimpleLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-4 sticky top-24">
            <nav className="space-y-1">
              <button
                onClick={() => navigate("/settings?section=profile")}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <User className="w-4 h-4 flex-shrink-0" />
                <span className="text-left">Personal Profile</span>
              </button>

              <button
                onClick={() => navigate("/settings?section=account")}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                <span className="text-left">Account & Sign Out</span>
              </button>

              <button
                onClick={() => navigate("/settings?section=notifications")}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Bell className="w-4 h-4 flex-shrink-0" />
                <span className="text-left">Notifications & Alerts</span>
              </button>

              <button
                onClick={() => navigate("/settings?section=security")}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Shield className="w-4 h-4 flex-shrink-0" />
                <span className="text-left">Security & Authentication</span>
              </button>

              <button
                onClick={() => navigate("/settings?section=integrations")}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <LinkIcon className="w-4 h-4 flex-shrink-0" />
                <span className="text-left">Integrations & Connections</span>
              </button>

              <button
                onClick={() => setActiveTab("models")}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
              >
                <Brain className="w-4 h-4 flex-shrink-0" />
                <span className="text-left">AI Configuration & Tuning</span>
              </button>

              <button
                onClick={() => navigate("/settings?section=team")}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Users className="w-4 h-4 flex-shrink-0" />
                <span className="text-left">Team & Collaboration</span>
              </button>

              <button
                onClick={() => navigate("/settings?section=compliance")}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Scale className="w-4 h-4 flex-shrink-0" />
                <span className="text-left">Compliance & Audit</span>
              </button>

              <button
                onClick={() => navigate("/settings?section=data")}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Database className="w-4 h-4 flex-shrink-0" />
                <span className="text-left">Data & Backup</span>
              </button>

              <button
                onClick={() => navigate("/settings?section=mobile")}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Smartphone className="w-4 h-4 flex-shrink-0" />
                <span className="text-left">Mobile & Devices</span>
              </button>

              <button
                onClick={() => navigate("/settings?section=billing")}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <CreditCard className="w-4 h-4 flex-shrink-0" />
                <span className="text-left">Billing & Subscription</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              AI Configuration & Tuning
            </h2>

            {/* Sub-navigation tabs */}
            <div className="mb-6 border-b border-gray-200">
              <div className="flex space-x-6 overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex items-center space-x-2 px-1 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors
                        ${
                          activeTab === tab.id
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "models" && renderModelsTab()}
            {activeTab === "performance" && renderPerformanceTab()}
            {activeTab === "rag" && renderRAGTab()}
            {activeTab === "agents" && renderAgentsTab()}
            {activeTab === "safety" && renderSafetyTab()}
            {activeTab === "analytics" && renderAnalyticsTab()}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-200">
              <button
                onClick={resetToDefaults}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restore Defaults</span>
              </button>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate("/settings")}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-all"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: hasChanges ? 1.02 : 1 }}
                  whileTap={{ scale: hasChanges ? 0.98 : 1 }}
                  onClick={saveConfiguration}
                  disabled={!hasChanges || isSaving}
                  className={`
                    flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all
                    ${
                      hasChanges && !isSaving
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }
                  `}
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Configuration</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </SimpleLayout>
  );
};

export default AIConfigurationPage;
