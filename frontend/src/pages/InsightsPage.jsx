import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Download,
  Filter,
  Calendar,
  Users,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Brain,
  Stethoscope,
  Target,
  Award,
  Zap,
  Eye,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Search,
  RefreshCw,
  Settings,
  Share,
  Sparkles,
  Monitor,
  Shield,
  Database,
  Microscope,
  FileText,
  BookOpen,
  ExternalLink,
  Lightbulb,
  ArrowUp,
  ArrowDown,
  Plus,
  Star,
  Bookmark,
  Globe,
  Building,
  Users as UsersIcon,
  Heart,
  Pill,
  FlaskConical,
  Clipboard,
  MessageSquare,
  Bell,
  Gauge,
  Timer,
  Crosshair,
  Map,
  Grid,
  Sliders,
  Layers,
  Palette,
  AlertTriangle,
} from "lucide-react";
import NavigationBar from "../components/NavigationBar";
import toast from "react-hot-toast";

const InsightsPage = () => {
  const [activeTab, setActiveTab] = useState("real-time-analytics");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState("30days");
  const [refreshing, setRefreshing] = useState(false);

  // Enhanced tabs configuration
  const tabs = [
    {
      id: "real-time-analytics",
      label: "Real-time Analytics",
      icon: BarChart3,
      description: "Live performance metrics and trends",
      color: "blue",
      features: [
        "Live Dashboards",
        "KPI Monitoring",
        "Trend Analysis",
        "Alerts",
      ],
    },
    {
      id: "ai-insights",
      label: "AI Insights Engine",
      icon: Brain,
      description: "Machine learning predictions and recommendations",
      color: "purple",
      features: [
        "Predictive Models",
        "Pattern Recognition",
        "Risk Scoring",
        "Recommendations",
      ],
    },
    {
      id: "clinical-reports",
      label: "Clinical Intelligence",
      icon: FileText,
      description: "Advanced clinical analytics and outcomes",
      color: "green",
      features: [
        "Outcome Analysis",
        "Quality Metrics",
        "Benchmarking",
        "Research Data",
      ],
    },
    {
      id: "population-health",
      label: "Population Health",
      icon: UsersIcon,
      description: "Population-wide health analytics",
      color: "orange",
      features: [
        "Demographics",
        "Epidemiology",
        "Risk Stratification",
        "Public Health",
      ],
    },
    {
      id: "research-hub",
      label: "Research Hub",
      icon: FlaskConical,
      description: "Research analytics and clinical trials",
      color: "indigo",
      features: [
        "Clinical Trials",
        "Evidence Generation",
        "Biomarkers",
        "Publications",
      ],
    },
  ];

  // Enhanced analytics data
  const analyticsData = {
    performance: [
      {
        month: "Jan",
        accuracy: 96.2,
        speed: 1.8,
        volume: 1245,
        satisfaction: 94,
      },
      {
        month: "Feb",
        accuracy: 96.8,
        speed: 1.6,
        volume: 1387,
        satisfaction: 95,
      },
      {
        month: "Mar",
        accuracy: 97.1,
        speed: 1.5,
        volume: 1456,
        satisfaction: 96,
      },
      {
        month: "Apr",
        accuracy: 97.4,
        speed: 1.4,
        volume: 1523,
        satisfaction: 96,
      },
      {
        month: "May",
        accuracy: 97.7,
        speed: 1.3,
        volume: 1698,
        satisfaction: 97,
      },
      {
        month: "Jun",
        accuracy: 98.1,
        speed: 1.2,
        volume: 1834,
        satisfaction: 97,
      },
    ],
    diagnosticTypes: [
      {
        name: "Radiology",
        value: 45,
        cases: 2341,
        accuracy: 98.2,
        color: "#3B82F6",
      },
      {
        name: "Pathology",
        value: 25,
        cases: 1289,
        accuracy: 97.8,
        color: "#10B981",
      },
      {
        name: "Cardiology",
        value: 15,
        cases: 743,
        accuracy: 96.9,
        color: "#F59E0B",
      },
      {
        name: "Neurology",
        value: 10,
        cases: 456,
        accuracy: 97.1,
        color: "#8B5CF6",
      },
      {
        name: "Others",
        value: 5,
        cases: 234,
        accuracy: 95.8,
        color: "#EF4444",
      },
    ],
    aiModels: [
      {
        name: "Vision Transformer",
        accuracy: 98.5,
        speed: 1.2,
        confidence: 96,
      },
      { name: "CNN Ensemble", accuracy: 97.8, speed: 0.8, confidence: 94 },
      { name: "Radiomics AI", accuracy: 96.9, speed: 2.1, confidence: 92 },
      { name: "PathNet", accuracy: 97.2, speed: 1.5, confidence: 93 },
    ],
  };

  const kpiMetrics = [
    {
      label: "Overall Accuracy",
      value: "98.1%",
      change: "+2.3%",
      trend: "up",
      icon: Target,
      color: "green",
    },
    {
      label: "Avg Processing Time",
      value: "1.2min",
      change: "-15s",
      trend: "up",
      icon: Timer,
      color: "blue",
    },
    {
      label: "Cases Processed",
      value: "12,847",
      change: "+1,234",
      trend: "up",
      icon: Activity,
      color: "purple",
    },
    {
      label: "Patient Satisfaction",
      value: "97.2%",
      change: "+0.8%",
      trend: "up",
      icon: Heart,
      color: "red",
    },
  ];

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const refreshData = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setRefreshing(false);
    toast.success("📊 Analytics data refreshed!");
  };

  const renderRealTimeAnalytics = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {kpiMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl transition-colors duration-300"
            >
              <div
                className={`w-12 h-12 bg-${metric.color}-100 dark:bg-${metric.color}-900/30 rounded-xl flex items-center justify-center mb-4`}
              >
                <Icon
                  className={`w-6 h-6 text-${metric.color}-600 dark:text-${metric.color}-400`}
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {metric.value}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                {metric.label}
              </p>
              <div
                className={`flex items-center space-x-1 ${
                  metric.trend === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                {metric.trend === "up" ? (
                  <ArrowUp className="w-4 h-4" />
                ) : (
                  <ArrowDown className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">{metric.change}</span>
                <span className="text-xs text-gray-500">vs last month</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Performance Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-2xl p-8 transition-colors duration-300"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center transition-colors duration-300">
            <TrendingUp className="w-7 h-7 mr-3 text-blue-600 dark:text-blue-400 transition-colors duration-300" />
            Performance Trends
          </h2>

          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300"
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
              <option value="1year">Last year</option>
            </select>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={refreshData}
              disabled={refreshing}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-300"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </motion.button>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analyticsData.performance}>
              <defs>
                <linearGradient
                  id="accuracyGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6B7280" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6B7280" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "none",
                  borderRadius: "12px",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Area
                type="monotone"
                dataKey="accuracy"
                stroke="#3B82F6"
                strokeWidth={3}
                fill="url(#accuracyGradient)"
                name="Accuracy (%)"
              />
              <Area
                type="monotone"
                dataKey="volume"
                stroke="#10B981"
                strokeWidth={3}
                fill="url(#volumeGradient)"
                name="Volume"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Diagnostic Distribution */}
      <div className="grid lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-2xl p-8 transition-colors duration-300"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center transition-colors duration-300">
            <PieChartIcon className="w-6 h-6 mr-3 text-purple-600 dark:text-purple-400 transition-colors duration-300" />
            Case Distribution by Specialty
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData.diagnosticTypes}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analyticsData.diagnosticTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            {analyticsData.diagnosticTypes.map((type, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: type.color }}
                ></div>
                <span className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                  {type.name}
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">
                  {type.cases}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-2xl p-8 transition-colors duration-300"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center transition-colors duration-300">
            <Brain className="w-6 h-6 mr-3 text-indigo-600 dark:text-indigo-400 transition-colors duration-300" />
            AI Model Performance
          </h3>

          <div className="space-y-4">
            {analyticsData.aiModels.map((model, index) => (
              <div
                key={index}
                className="p-4 bg-gradient-to-r from-gray-50 to-indigo-50 dark:from-gray-700 dark:to-indigo-900/20 rounded-xl transition-colors duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">
                    {model.name}
                  </h4>
                  <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 transition-colors duration-300">
                    {model.accuracy}%
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">
                      Speed
                    </p>
                    <p className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">
                      {model.speed}min
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">
                      Accuracy
                    </p>
                    <p className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">
                      {model.accuracy}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">
                      Confidence
                    </p>
                    <p className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">
                      {model.confidence}%
                    </p>
                  </div>
                </div>

                <div className="mt-2">
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 transition-colors duration-300">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500 h-2 rounded-full transition-colors duration-300"
                      style={{ width: `${model.accuracy}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderAIInsights = () => (
    <div className="space-y-6">
      <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-2xl p-8 transition-colors duration-300">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center transition-colors duration-300">
          <Brain className="w-7 h-7 mr-3 text-purple-600 dark:text-purple-400 transition-colors duration-300" />
          AI Insights Engine
        </h2>

        <div className="grid gap-6">
          {/* Predictive Analytics */}
          <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl border border-purple-200 dark:border-purple-800/50 transition-colors duration-300">
            <h3 className="text-lg font-bold text-purple-900 dark:text-purple-200 mb-4 flex items-center transition-colors duration-300">
              <Lightbulb className="w-5 h-5 mr-2" />
              Predictive Insights
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white/60 dark:bg-gray-700/50 p-4 rounded-xl transition-colors duration-300">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-300">
                  Risk Predictions
                </h4>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>
                      15% increase in cardiac cases expected next month
                    </span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Respiratory infections trending upward (8%)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Emergency cases stabilizing (-2%)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white/60 dark:bg-gray-700/50 p-4 rounded-xl transition-colors duration-300">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-300">
                  Resource Optimization
                </h4>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 transition-colors duration-300" />
                    <span>Radiology capacity optimal</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 transition-colors duration-300" />
                    <span>Consider adding 2 pathology slots</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 transition-colors duration-300" />
                    <span>Emergency department at 95% capacity</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Pattern Recognition */}
          <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl border border-blue-200 dark:border-blue-800/50">
            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Pattern Recognition
            </h3>

            <div className="space-y-4">
              <div className="bg-white/60 dark:bg-gray-700/50 p-4 rounded-xl">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Diagnostic Patterns
                </h4>
                <div className="flex items-center space-x-4">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                    <div
                      className="bg-blue-600 dark:bg-blue-400 h-3 rounded-full"
                      style={{ width: "78%" }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    78% accuracy in early detection
                  </span>
                </div>
              </div>

              <div className="bg-white/60 dark:bg-gray-700/50 p-4 rounded-xl">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Treatment Outcomes
                </h4>
                <div className="flex items-center space-x-4">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                    <div
                      className="bg-green-600 dark:bg-green-400 h-3 rounded-full"
                      style={{ width: "92%" }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    92% positive outcomes
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "real-time-analytics":
        return renderRealTimeAnalytics();
      case "ai-insights":
        return renderAIInsights();
      case "clinical-reports":
        return (
          <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-2xl p-8 text-center transition-colors duration-300">
            <FileText className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4 transition-colors duration-300" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-300">
              Clinical Intelligence Reports
            </h3>
            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
              Advanced clinical analytics coming soon...
            </p>
          </div>
        );
      case "population-health":
        return (
          <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-2xl p-8 text-center transition-colors duration-300">
            <UsersIcon className="w-16 h-16 text-orange-600 dark:text-orange-400 mx-auto mb-4 transition-colors duration-300" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-300">
              Population Health Analytics
            </h3>
            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
              Population-wide health insights coming soon...
            </p>
          </div>
        );
      case "research-hub":
        return (
          <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-2xl p-8 text-center transition-colors duration-300">
            <FlaskConical className="w-16 h-16 text-indigo-600 dark:text-indigo-400 mx-auto mb-4 transition-colors duration-300" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-300">
              Research Analytics Hub
            </h3>
            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
              Research and clinical trial analytics coming soon...
            </p>
          </div>
        );
      default:
        return renderRealTimeAnalytics();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
        <NavigationBar />
        <div className="flex items-center justify-center h-96">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-12 w-12 border-4 border-blue-600 dark:border-blue-400 border-t-transparent"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <NavigationBar />

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-purple-400 to-blue-400 dark:from-purple-600 dark:to-blue-600 rounded-full opacity-20 dark:opacity-10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-green-400 to-teal-400 dark:from-green-600 dark:to-teal-600 rounded-full opacity-20 dark:opacity-10 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-2xl overflow-hidden mb-8"
        >
          {/* Gradient Header */}
          <div className="relative h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 via-purple-600/90 to-pink-600/90 dark:from-indigo-900/80 dark:via-purple-900/80 dark:to-pink-900/80" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />

            <div className="relative z-10 flex items-center justify-between h-full px-8">
              <div className="flex items-center space-x-4">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg"
                >
                  <BarChart3 className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Advanced Insights Platform
                  </h1>
                  <p className="text-indigo-100 text-lg">
                    Comprehensive analytics and AI-powered intelligence center
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`p-4 rounded-xl transition-all duration-300 text-left ${
                      isActive
                        ? "bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 shadow-lg border-2 border-blue-200 dark:border-blue-600"
                        : "bg-white/60 dark:bg-gray-800/80 hover:bg-white/80 dark:hover:bg-gray-700/90 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isActive
                            ? `bg-${tab.color}-100 text-${tab.color}-600 dark:bg-${tab.color}-900/30 dark:text-${tab.color}-400`
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3
                          className={`font-bold ${
                            isActive
                              ? `text-${tab.color}-700 dark:text-${tab.color}-400`
                              : "text-gray-800 dark:text-gray-200"
                          }`}
                        >
                          {tab.label}
                        </h3>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {tab.description}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {tab.features.slice(0, 2).map((feature, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </div>
    </div>
  );
};

export default InsightsPage;
