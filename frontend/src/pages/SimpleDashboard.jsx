import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Users,
  Brain,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  FileText,
  Stethoscope,
  Heart,
  Microscope,
  Pill,
  ArrowRight,
  Calendar,
  Eye,
  BarChart3,
  Zap,
  Sparkles,
  Plus,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  Target,
  Layers,
  Shield,
  Upload,
  Search,
  Bell,
  Settings,
  Database,
  Image,
  PlayCircle,
  PauseCircle,
  Gauge,
  Timer,
  Award,
  Cpu,
  Server,
  Wifi,
  WifiOff,
  CheckSquare,
  XSquare,
  TrendingDown,
  AlertOctagon,
  Info,
  UserCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow, format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import NavigationBar from "../components/NavigationBar";

// Enhanced Count-up animation component
const CountUp = ({ end, duration = 2000, suffix = "", prefix = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationId;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - percentage, 4);

      setCount(Math.floor(end * easeOutQuart));

      if (percentage < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [end, duration]);

  return (
    <span>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

const HospitalDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState("today");
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);

  // Hospital Dashboard Stats
  const todayStats = [
    {
      title: "Total Diagnoses Today",
      value: 127,
      change: "+18%",
      changeType: "positive",
      icon: Stethoscope,
      color: "blue",
      description: "vs yesterday",
    },
    {
      title: "Pending Cases",
      value: 23,
      change: "-5",
      changeType: "positive",
      icon: Clock,
      color: "orange",
      description: "awaiting analysis",
    },
    {
      title: "Critical Alerts",
      value: 8,
      change: "+3",
      changeType: "negative",
      icon: AlertTriangle,
      color: "red",
      description: "require attention",
    },
    {
      title: "Avg Processing Time",
      value: "1.8m",
      change: "-12s",
      changeType: "positive",
      icon: Timer,
      color: "green",
      description: "per diagnosis",
    },
  ];

  // Real-time activity feed
  const activityFeed = [
    {
      id: 1,
      type: "diagnosis_complete",
      message: "Chest X-ray analysis completed for Patient #P-2024-1156",
      confidence: 94,
      time: "2 minutes ago",
      status: "success",
      agent: "Image Analysis AI",
    },
    {
      id: 2,
      type: "drug_interaction",
      message:
        "Critical interaction detected: Warfarin + Aspirin for Patient #P-2024-1154",
      severity: "high",
      time: "5 minutes ago",
      status: "warning",
      agent: "Drug Safety AI",
    },
    {
      id: 3,
      type: "agent_coordination",
      message: "Multi-agent analysis initiated for complex case #D-2024-0892",
      time: "8 minutes ago",
      status: "processing",
      agents: ["Image AI", "History AI", "Research AI"],
    },
    {
      id: 4,
      type: "rare_disease",
      message: "Rare condition detected: Fibrodysplasia Ossificans Progressiva",
      confidence: 87,
      time: "12 minutes ago",
      status: "alert",
      agent: "Research AI",
    },
  ];

  // Agent performance metrics
  const agentMetrics = [
    {
      name: "Image Analysis AI",
      processingSpeed: "45.2s",
      accuracy: 96.8,
      casesToday: 89,
      status: "active",
      color: "blue",
    },
    {
      name: "History Synthesis AI",
      processingSpeed: "12.1s",
      accuracy: 94.2,
      casesToday: 127,
      status: "active",
      color: "green",
    },
    {
      name: "Drug Interaction AI",
      processingSpeed: "2.3s",
      accuracy: 99.1,
      casesToday: 156,
      status: "active",
      color: "purple",
    },
    {
      name: "Research AI",
      processingSpeed: "67.8s",
      accuracy: 91.5,
      casesToday: 34,
      status: "active",
      color: "orange",
    },
  ];

  // Recent diagnoses table
  const recentDiagnoses = [
    {
      patientId: "P-2024-1156",
      name: "Sarah Johnson",
      date: "2024-10-10 14:30",
      diagnosis: "Pneumonia (Right Lower Lobe)",
      confidence: 94,
      status: "completed",
      urgency: "routine",
      doctor: "Dr. Chen",
    },
    {
      patientId: "P-2024-1155",
      name: "Michael Rodriguez",
      date: "2024-10-10 14:15",
      diagnosis: "Fractured Radius (Distal)",
      confidence: 97,
      status: "completed",
      urgency: "urgent",
      doctor: "Dr. Patel",
    },
    {
      patientId: "P-2024-1154",
      name: "Emily Chen",
      date: "2024-10-10 14:02",
      diagnosis: "Drug Interaction Alert",
      confidence: 99,
      status: "alert",
      urgency: "critical",
      doctor: "Dr. Williams",
    },
    {
      patientId: "P-2024-1153",
      name: "David Thompson",
      date: "2024-10-10 13:45",
      diagnosis: "Normal Chest X-ray",
      confidence: 92,
      status: "completed",
      urgency: "routine",
      doctor: "Dr. Johnson",
    },
    {
      patientId: "P-2024-1152",
      name: "Jessica Martinez",
      date: "2024-10-10 13:30",
      diagnosis: "Suspected Pneumothorax",
      confidence: 88,
      status: "completed",
      urgency: "urgent",
      doctor: "Dr. Smith",
    },
    {
      patientId: "P-2024-1151",
      name: "Robert Lee",
      date: "2024-10-10 13:15",
      diagnosis: "Atrial Fibrillation",
      confidence: 95,
      status: "completed",
      urgency: "routine",
      doctor: "Dr. Anderson",
    },
    {
      patientId: "P-2024-1150",
      name: "Amanda White",
      date: "2024-10-10 13:00",
      diagnosis: "Kidney Stone Detected",
      confidence: 91,
      status: "completed",
      urgency: "routine",
      doctor: "Dr. Brown",
    },
    {
      patientId: "P-2024-1149",
      name: "Christopher Davis",
      date: "2024-10-10 12:45",
      diagnosis: "Pulmonary Edema",
      confidence: 93,
      status: "completed",
      urgency: "urgent",
      doctor: "Dr. Wilson",
    },
    {
      patientId: "P-2024-1148",
      name: "Maria Garcia",
      date: "2024-10-10 12:30",
      diagnosis: "Cervical Spine Injury",
      confidence: 96,
      status: "completed",
      urgency: "urgent",
      doctor: "Dr. Taylor",
    },
  ];

  // Alerts and notifications
  const criticalAlerts = [
    {
      type: "drug_interaction",
      title: "Critical Drug Interaction",
      message: "Warfarin + Aspirin detected for Patient #P-2024-1154",
      severity: "critical",
      time: "5 min ago",
      action: "Review Prescription",
    },
    {
      type: "rare_disease",
      title: "Rare Disease Detection",
      message: "Fibrodysplasia Ossificans Progressiva - 87% confidence",
      severity: "high",
      time: "12 min ago",
      action: "Specialist Referral",
    },
    {
      type: "system_update",
      title: "MONAI Model Updated",
      message: "Chest X-ray analysis model v2.3.1 deployed",
      severity: "info",
      time: "1 hour ago",
      action: "View Changes",
    },
  ];

  // Performance trends data
  const performanceData = [
    { time: "06:00", diagnoses: 12, accuracy: 94 },
    { time: "08:00", diagnoses: 28, accuracy: 96 },
    { time: "10:00", diagnoses: 45, accuracy: 97 },
    { time: "12:00", diagnoses: 67, accuracy: 95 },
    { time: "14:00", diagnoses: 89, accuracy: 98 },
    { time: "16:00", diagnoses: 127, accuracy: 96 },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "diagnosis",
      patient: "John Doe",
      action: "New diagnosis completed",
      time: new Date(Date.now() - 10 * 60 * 1000),
      status: "completed",
      priority: "high",
    },
    {
      id: 2,
      type: "analysis",
      patient: "Jane Smith",
      action: "X-ray analysis in progress",
      time: new Date(Date.now() - 25 * 60 * 1000),
      status: "processing",
      priority: "medium",
    },
    {
      id: 3,
      type: "alert",
      patient: "Bob Johnson",
      action: "Drug interaction detected",
      time: new Date(Date.now() - 45 * 60 * 1000),
      status: "alert",
      priority: "high",
    },
  ];

  const chartData = [
    { name: "Mon", patients: 65, accuracy: 96.5 },
    { name: "Tue", patients: 78, accuracy: 97.2 },
    { name: "Wed", patients: 82, accuracy: 97.8 },
    { name: "Thu", patients: 95, accuracy: 98.1 },
    { name: "Fri", patients: 88, accuracy: 97.9 },
    { name: "Sat", patients: 72, accuracy: 97.6 },
    { name: "Sun", patients: 58, accuracy: 97.3 },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <NavigationBar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <NavigationBar />

      <div className="max-w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Hospital Dashboard Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center transition-colors duration-300">
                <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
                Hospital Dashboard
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400 transition-colors duration-300">
                Real-time AI diagnostic monitoring -{" "}
                {format(new Date(), "EEEE, MMMM d, yyyy")}
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm">
                <div
                  className={`w-3 h-3 rounded-full ${
                    realTimeUpdates
                      ? "bg-green-500 animate-pulse"
                      : "bg-gray-400 dark:bg-gray-600"
                  }`}
                ></div>
                <span className="text-gray-700 dark:text-gray-300">
                  {realTimeUpdates ? "Live Updates" : "Paused"}
                </span>
              </div>
              <button
                onClick={() => setRealTimeUpdates(!realTimeUpdates)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                {realTimeUpdates ? (
                  <PauseCircle className="w-4 h-4" />
                ) : (
                  <PlayCircle className="w-4 h-4" />
                )}
                <span>{realTimeUpdates ? "Pause" : "Resume"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards (Top Row) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {todayStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-l-4 border-l-blue-500 dark:border-l-blue-400 hover:shadow-md dark:hover:shadow-gray-900/50 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2 transition-colors duration-300">
                      <CountUp
                        end={typeof stat.value === "string" ? 1.8 : stat.value}
                        suffix={typeof stat.value === "string" ? "m" : ""}
                      />
                    </p>
                    <div className="flex items-center mt-2">
                      <span
                        className={`text-sm font-semibold ${
                          stat.changeType === "positive"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-500 dark:text-red-400"
                        }`}
                      >
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                        {stat.description}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                      stat.color === "blue"
                        ? "bg-blue-100 text-blue-600"
                        : stat.color === "orange"
                        ? "bg-orange-100 text-orange-600"
                        : stat.color === "red"
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Real-Time Activity Feed */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center transition-colors duration-300">
                  <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                  Real-Time Activity Feed
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Live
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {activityFeed.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        activity.status === "success"
                          ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                          : activity.status === "warning"
                          ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                          : activity.status === "processing"
                          ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {activity.status === "success" ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : activity.status === "warning" ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : activity.status === "processing" ? (
                        <Cpu className="w-5 h-5" />
                      ) : (
                        <AlertOctagon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {activity.message}
                      </p>
                      <div className="flex items-center mt-1 space-x-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {activity.time}
                        </p>
                        {activity.confidence && (
                          <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded-full">
                            {activity.confidence}% confidence
                          </span>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          by {activity.agent || activity.agents?.join(", ")}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Performance Analytics */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                Weekly Performance Analytics
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                AI diagnosis accuracy and case volume trends
              </p>
            </div>
            <div className="p-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="accuracyGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3B82F6"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3B82F6"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                      <linearGradient
                        id="patientsGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10B981"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10B981"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="name"
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
                        boxShadow:
                          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
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
                      dataKey="patients"
                      stroke="#10B981"
                      strokeWidth={3}
                      fill="url(#patientsGradient)"
                      name="Patients"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Chart Legend */}
              <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">AI Accuracy</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    Patients Treated
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Department Performance Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 transition-colors duration-300">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <Target className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                Department Case Distribution
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Active cases by medical department
              </p>
            </div>
            <div className="p-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Radiology", value: 145, color: "#3B82F6" },
                        { name: "Cardiology", value: 89, color: "#10B981" },
                        { name: "Emergency", value: 67, color: "#F59E0B" },
                        { name: "Orthopedics", value: 54, color: "#8B5CF6" },
                        { name: "Neurology", value: 43, color: "#EF4444" },
                        { name: "Others", value: 32, color: "#6B7280" },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[
                        { name: "Radiology", value: 145, color: "#3B82F6" },
                        { name: "Cardiology", value: 89, color: "#10B981" },
                        { name: "Emergency", value: 67, color: "#F59E0B" },
                        { name: "Orthopedics", value: 54, color: "#8B5CF6" },
                        { name: "Neurology", value: 43, color: "#EF4444" },
                        { name: "Others", value: 32, color: "#6B7280" },
                      ].map((entry, index) => (
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

              {/* Department Legend */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100">
                {[
                  { name: "Radiology", value: 145, color: "bg-blue-500" },
                  { name: "Cardiology", value: 89, color: "bg-green-500" },
                  { name: "Emergency", value: 67, color: "bg-yellow-500" },
                  { name: "Orthopedics", value: 54, color: "bg-purple-500" },
                  { name: "Neurology", value: 43, color: "bg-red-500" },
                  { name: "Others", value: 32, color: "bg-gray-500" },
                ].map((dept, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <div className={`w-3 h-3 ${dept.color} rounded-full`}></div>
                    <span className="text-gray-600">{dept.name}</span>
                    <span className="font-medium text-gray-900">
                      {dept.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Real-time Processing Speed */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 transition-colors duration-300">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <Gauge className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                Processing Speed Analytics
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                AI processing times by case type
              </p>
            </div>
            <div className="p-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        type: "X-Ray",
                        avgTime: 1.2,
                        cases: 245,
                        color: "#3B82F6",
                      },
                      {
                        type: "MRI",
                        avgTime: 3.8,
                        cases: 89,
                        color: "#10B981",
                      },
                      {
                        type: "CT Scan",
                        avgTime: 2.1,
                        cases: 156,
                        color: "#F59E0B",
                      },
                      {
                        type: "Ultrasound",
                        avgTime: 0.9,
                        cases: 198,
                        color: "#8B5CF6",
                      },
                      {
                        type: "ECG",
                        avgTime: 0.5,
                        cases: 312,
                        color: "#EF4444",
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="type"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#6B7280" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#6B7280" }}
                      label={{
                        value: "Minutes",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "none",
                        borderRadius: "12px",
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                      }}
                      formatter={(value, name) => [
                        `${value} min`,
                        "Avg Processing Time",
                      ]}
                    />
                    <Bar
                      dataKey="avgTime"
                      fill="#3B82F6"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Performance Insights */}
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">1.7m</div>
                  <div className="text-xs text-gray-500">Avg Overall</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">98.2%</div>
                  <div className="text-xs text-gray-500">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    1,240
                  </div>
                  <div className="text-xs text-gray-500">Total Cases</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Diagnoses Table & Agent Performance */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8 xl:items-stretch">
          {/* Recent Diagnoses Table */}
          <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col h-full transition-colors duration-300">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Recent Diagnoses
                </h3>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                    <Filter className="w-4 h-4" />
                  </button>
                  <Link
                    to="/patients"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    View All →
                  </Link>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Diagnosis
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Confidence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {recentDiagnoses.map((diagnosis, index) => (
                    <tr
                      key={diagnosis.patientId}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {diagnosis.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {diagnosis.patientId}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {diagnosis.diagnosis}
                        </div>
                        <div className="text-sm text-gray-500">
                          {diagnosis.date}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {diagnosis.confidence}%
                          </div>
                          <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                diagnosis.confidence >= 95
                                  ? "bg-green-500"
                                  : diagnosis.confidence >= 90
                                  ? "bg-blue-500"
                                  : "bg-orange-500"
                              }`}
                              style={{ width: `${diagnosis.confidence}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            diagnosis.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : diagnosis.status === "alert"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {diagnosis.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Agent Performance Metrics */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col h-full transition-colors duration-300">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <Cpu className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                Agent Performance
              </h3>
            </div>
            <div className="p-6 flex-1 overflow-auto">
              <div className="space-y-4">
                {agentMetrics.map((agent, index) => (
                  <div
                    key={agent.name}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-300"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {agent.name}
                      </h4>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          agent.status === "active"
                            ? "bg-green-500"
                            : "bg-gray-400 dark:bg-gray-600"
                        }`}
                      ></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">
                          Speed
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {agent.processingSpeed}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">
                          Accuracy
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {agent.accuracy}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">
                          Cases Today
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {agent.casesToday}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Status</p>
                        <p
                          className={`font-semibold capitalize ${
                            agent.status === "active"
                              ? "text-green-600"
                              : "text-gray-500"
                          }`}
                        >
                          {agent.status}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Alerts & Notifications Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <Bell className="w-5 h-5 text-orange-500 dark:text-orange-400 mr-2" />
              Alerts & Notifications
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {criticalAlerts.map((alert, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors duration-300"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {alert.title}
                    </h4>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        alert.severity === "critical"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                          : alert.severity === "high"
                          ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {alert.message}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {alert.time}
                    </span>
                    <button className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                      {alert.action}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;
