import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  Eye,
  Search,
  Filter,
  Calendar,
  User,
  Activity,
  TrendingUp,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Printer,
  Share2,
  MoreVertical,
  ChevronDown,
  Brain,
  Microscope,
  Pill,
  Stethoscope,
  Heart,
  Plus,
  RefreshCw,
  Trash2,
  Archive,
  Star,
} from "lucide-react";
import NavigationBar from "../components/NavigationBar";
import toast from "react-hot-toast";

const ReportsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Report Types
  const reportTypes = [
    { id: "all", label: "All Reports", icon: FileText, color: "blue" },
    { id: "analysis", label: "AI Analysis", icon: Brain, color: "purple" },
    {
      id: "imaging",
      label: "Medical Imaging",
      icon: Microscope,
      color: "green",
    },
    { id: "drug", label: "Drug Safety", icon: Pill, color: "orange" },
    {
      id: "clinical",
      label: "Clinical Reports",
      icon: Stethoscope,
      color: "red",
    },
    {
      id: "diagnostic",
      label: "Diagnostic Results",
      icon: Activity,
      color: "cyan",
    },
  ];

  // Mock reports data
  const mockReports = [
    {
      id: "RPT-2024-001",
      title: "Comprehensive AI Medical Analysis",
      type: "analysis",
      patient: "John Doe",
      patientId: "PT-2024-001",
      date: "2024-11-06T14:30:00",
      status: "completed",
      priority: "high",
      confidence: 92,
      findings: 5,
      recommendations: 7,
      generatedBy: "Multi-Agent AI System",
      fileSize: "2.4 MB",
    },
    {
      id: "RPT-2024-002",
      title: "Chest X-Ray Analysis Report",
      type: "imaging",
      patient: "Sarah Johnson",
      patientId: "PT-2024-002",
      date: "2024-11-06T10:15:00",
      status: "completed",
      priority: "routine",
      confidence: 88,
      findings: 3,
      recommendations: 4,
      generatedBy: "MONAI Imaging AI",
      fileSize: "3.1 MB",
    },
    {
      id: "RPT-2024-003",
      title: "Drug Interaction Safety Report",
      type: "drug",
      patient: "Michael Chen",
      patientId: "PT-2024-003",
      date: "2024-11-05T16:45:00",
      status: "completed",
      priority: "urgent",
      confidence: 95,
      findings: 2,
      recommendations: 5,
      generatedBy: "Drug Safety AI Agent",
      fileSize: "1.8 MB",
    },
    {
      id: "RPT-2024-004",
      title: "Clinical Decision Support Report",
      type: "clinical",
      patient: "Emily Rodriguez",
      patientId: "PT-2024-004",
      date: "2024-11-05T09:20:00",
      status: "completed",
      priority: "high",
      confidence: 90,
      findings: 6,
      recommendations: 8,
      generatedBy: "Clinical Decision AI",
      fileSize: "2.9 MB",
    },
    {
      id: "RPT-2024-005",
      title: "Cardiac MRI Analysis",
      type: "imaging",
      patient: "David Thompson",
      patientId: "PT-2024-005",
      date: "2024-11-04T13:00:00",
      status: "completed",
      priority: "routine",
      confidence: 87,
      findings: 4,
      recommendations: 6,
      generatedBy: "MONAI Imaging AI",
      fileSize: "4.2 MB",
    },
    {
      id: "RPT-2024-006",
      title: "Multi-Agent Comprehensive Analysis",
      type: "analysis",
      patient: "Lisa Anderson",
      patientId: "PT-2024-006",
      date: "2024-11-04T08:30:00",
      status: "completed",
      priority: "high",
      confidence: 93,
      findings: 7,
      recommendations: 9,
      generatedBy: "Multi-Agent AI System",
      fileSize: "3.5 MB",
    },
  ];

  useEffect(() => {
    loadReports();
  }, [selectedFilter, selectedDateRange]);

  const loadReports = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      let filtered = [...mockReports];

      // Filter by type
      if (selectedFilter !== "all") {
        filtered = filtered.filter((r) => r.type === selectedFilter);
      }

      // Filter by date range
      if (selectedDateRange !== "all") {
        const now = new Date();
        filtered = filtered.filter((r) => {
          const reportDate = new Date(r.date);
          const diffTime = Math.abs(now - reportDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          switch (selectedDateRange) {
            case "today":
              return diffDays === 0;
            case "week":
              return diffDays <= 7;
            case "month":
              return diffDays <= 30;
            default:
              return true;
          }
        });
      }

      // Filter by search query
      if (searchQuery) {
        filtered = filtered.filter(
          (r) =>
            r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.patientId.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setReports(filtered);
      setIsLoading(false);
    }, 500);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "processing":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
      case "high":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";
      case "routine":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    toast.success(`Opening report: ${report.title}`);
  };

  const handleDownloadReport = (report) => {
    toast.success(`Downloading: ${report.title}`);
  };

  const handlePrintReport = (report) => {
    toast.success(`Printing: ${report.title}`);
  };

  const handleShareReport = (report) => {
    toast.success(`Sharing: ${report.title}`);
  };

  const handleNewAnalysis = () => {
    navigate("/diagnosis/new");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <NavigationBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                📋 Medical Reports
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Access and manage all AI-generated medical reports and analysis
                results
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNewAnalysis}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white rounded-lg shadow-lg font-semibold transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>New Analysis</span>
            </motion.button>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Total Reports
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {mockReports.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Today
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  3
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Avg Confidence
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  91%
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  High Priority
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  3
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports, patients, IDs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Filter by Type */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                {reportTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Report Type Filters */}
        <div className="flex items-center space-x-3 mb-6 overflow-x-auto pb-2">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            const isActive = selectedFilter === type.id;
            return (
              <motion.button
                key={type.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedFilter(type.id)}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all
                  ${
                    isActive
                      ? `bg-${type.color}-100 text-${type.color}-700 dark:bg-${type.color}-900/30 dark:text-${type.color}-300 shadow-md`
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{type.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center shadow-md border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Loading reports...
              </p>
            </div>
          ) : reports.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center shadow-md border border-gray-200 dark:border-gray-700">
              <FileText className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Reports Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                No reports match your current filters
              </p>
              <button
                onClick={() => {
                  setSelectedFilter("all");
                  setSelectedDateRange("all");
                  setSearchQuery("");
                }}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            reports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      {/* Report Icon */}
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>

                      {/* Report Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                              {report.title}
                            </h3>
                            <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                              <span className="flex items-center">
                                <User className="w-4 h-4 mr-1" />
                                {report.patient}
                              </span>
                              <span>•</span>
                              <span>{report.patientId}</span>
                              <span>•</span>
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {formatDate(report.date)}
                              </span>
                            </div>
                          </div>

                          {/* Status and Priority Badges */}
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                report.status
                              )}`}
                            >
                              {report.status}
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(
                                report.priority
                              )}`}
                            >
                              {report.priority}
                            </span>
                          </div>
                        </div>

                        {/* Report Metrics */}
                        <div className="grid grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Confidence
                              </p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {report.confidence}%
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Findings
                              </p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {report.findings}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Recommendations
                              </p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {report.recommendations}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Brain className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                            <div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Generated By
                              </p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {report.generatedBy}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleViewReport(report)}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Report</span>
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDownloadReport(report)}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download</span>
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlePrintReport(report)}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                          >
                            <Printer className="w-5 h-5" />
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleShareReport(report)}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                          >
                            <Share2 className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
