import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Activity,
  AlertCircle,
  CheckCircle,
  X,
  Save,
  User,
  Heart,
  Stethoscope,
  Building,
  Clock,
  Download,
  Upload,
  RefreshCw,
  Star,
  Shield,
  Zap,
  UserPlus,
  UserX,
  UserCheck,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import NavigationBar from "../components/NavigationBar";
import toast from "react-hot-toast";

const SimplePatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(10);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    email: "",
    phone: "",
    condition: "",
    riskLevel: "low",
    status: "active",
    address: "",
    emergencyContact: "",
    notes: "",
  });

  // Mock patient data with more detailed information
  const mockPatients = [
    {
      id: 1,
      name: "John Doe",
      age: 45,
      gender: "Male",
      email: "john.doe@email.com",
      phone: "+1 (555) 123-4567",
      lastVisit: new Date("2025-10-08"),
      status: "active",
      condition: "Hypertension",
      riskLevel: "medium",
      address: "123 Main St, New York, NY 10001",
      emergencyContact: "Jane Doe - +1 (555) 123-4568",
      notes: "Regular monitoring required. Medication compliance good.",
      avatar: "👨",
    },
    {
      id: 2,
      name: "Jane Smith",
      age: 32,
      gender: "Female",
      email: "jane.smith@email.com",
      phone: "+1 (555) 987-6543",
      lastVisit: new Date("2025-10-09"),
      status: "active",
      condition: "Diabetes Type 2",
      riskLevel: "high",
      address: "456 Oak Ave, Los Angeles, CA 90210",
      emergencyContact: "John Smith - +1 (555) 987-6544",
      notes: "Insulin dependent. Diet counseling scheduled.",
      avatar: "👩",
    },
    {
      id: 3,
      name: "Bob Johnson",
      age: 58,
      gender: "Male",
      email: "bob.johnson@email.com",
      phone: "+1 (555) 456-7890",
      lastVisit: new Date("2025-10-07"),
      status: "inactive",
      condition: "Arthritis",
      riskLevel: "low",
      address: "789 Pine Rd, Chicago, IL 60601",
      emergencyContact: "Mary Johnson - +1 (555) 456-7891",
      notes: "Physical therapy sessions ongoing. Good progress.",
      avatar: "👨‍🦳",
    },
    {
      id: 4,
      name: "Sarah Wilson",
      age: 29,
      gender: "Female",
      email: "sarah.wilson@email.com",
      phone: "+1 (555) 321-0987",
      lastVisit: new Date("2025-10-10"),
      status: "active",
      condition: "Asthma",
      riskLevel: "medium",
      address: "321 Elm St, Miami, FL 33101",
      emergencyContact: "Mike Wilson - +1 (555) 321-0988",
      notes: "Seasonal triggers identified. Inhaler updated.",
      avatar: "👩‍💼",
    },
    {
      id: 5,
      name: "Michael Brown",
      age: 67,
      gender: "Male",
      email: "michael.brown@email.com",
      phone: "+1 (555) 654-3210",
      lastVisit: new Date("2025-10-06"),
      status: "active",
      condition: "Heart Disease",
      riskLevel: "high",
      address: "654 Maple Dr, Seattle, WA 98101",
      emergencyContact: "Lisa Brown - +1 (555) 654-3211",
      notes: "Cardiology follow-up scheduled. Exercise plan approved.",
      avatar: "👨‍⚕️",
    },
    {
      id: 6,
      name: "Emily Davis",
      age: 41,
      gender: "Female",
      email: "emily.davis@email.com",
      phone: "+1 (555) 789-0123",
      lastVisit: new Date("2025-10-11"),
      status: "active",
      condition: "Migraine",
      riskLevel: "medium",
      address: "987 Cedar Ave, Boston, MA 02101",
      emergencyContact: "David Davis - +1 (555) 789-0124",
      notes: "Neurologist referral completed. Triggers documented.",
      avatar: "👩‍🔬",
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPatients(mockPatients);
      setLoading(false);
    }, 1000);
  }, []);

  // Handle form submission for add/edit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (showEditModal && selectedPatient) {
      // Edit existing patient
      const updatedPatients = patients.map((patient) =>
        patient.id === selectedPatient.id
          ? { ...patient, ...formData, id: selectedPatient.id }
          : patient
      );
      setPatients(updatedPatients);
      toast.success("Patient updated successfully!");
      setShowEditModal(false);
    } else {
      // Add new patient
      const newPatient = {
        ...formData,
        id: Date.now(),
        lastVisit: new Date(),
        avatar: formData.gender === "Male" ? "👨" : "👩",
      };
      setPatients([...patients, newPatient]);
      toast.success("Patient added successfully!");
      setShowAddModal(false);
    }
    resetForm();
  };

  // Handle delete
  const handleDelete = () => {
    const updatedPatients = patients.filter(
      (patient) => patient.id !== selectedPatient.id
    );
    setPatients(updatedPatients);
    toast.success("Patient deleted successfully!");
    setShowDeleteModal(false);
    setSelectedPatient(null);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      age: "",
      gender: "",
      email: "",
      phone: "",
      condition: "",
      riskLevel: "low",
      status: "active",
      address: "",
      emergencyContact: "",
      notes: "",
    });
  };

  // Open modals
  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (patient) => {
    setSelectedPatient(patient);
    setFormData({
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      email: patient.email,
      phone: patient.phone,
      condition: patient.condition,
      riskLevel: patient.riskLevel,
      status: patient.status,
      address: patient.address || "",
      emergencyContact: patient.emergencyContact || "",
      notes: patient.notes || "",
    });
    setShowEditModal(true);
  };

  const openViewModal = (patient) => {
    setSelectedPatient(patient);
    setShowViewModal(true);
  };

  const openDeleteModal = (patient) => {
    setSelectedPatient(patient);
    setShowDeleteModal(true);
  };

  // Filter patients
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.condition.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "active" && patient.status === "active") ||
      (selectedFilter === "inactive" && patient.status === "inactive") ||
      (selectedFilter === "high-risk" && patient.riskLevel === "high") ||
      (selectedFilter === "medium-risk" && patient.riskLevel === "medium") ||
      (selectedFilter === "low-risk" && patient.riskLevel === "low");

    return matchesSearch && matchesFilter;
  });

  // Pagination
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(
    indexOfFirstPatient,
    indexOfLastPatient
  );
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case "high":
        return "text-red-600 bg-red-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusColor = (status) => {
    return status === "active"
      ? "text-green-600 bg-green-100"
      : "text-gray-600 bg-gray-100";
  };

  if (loading) {
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
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-green-400 to-blue-400 rounded-full opacity-10 blur-3xl"
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
          className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-2xl p-8 mb-8 transition-colors duration-300"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4 mb-6 lg:mb-0">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
              >
                <Users className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Patient Management
                </h1>
                <p className="text-gray-600 dark:text-gray-300 font-medium transition-colors duration-300">
                  Manage patient records with comprehensive CRUD operations
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openAddModal}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 dark:from-blue-600 dark:to-purple-700 dark:hover:from-blue-700 dark:hover:to-purple-800 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 shadow-lg transition-all duration-300"
            >
              <UserPlus className="w-5 h-5" />
              <span>Add New Patient</span>
            </motion.button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mt-8">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search patients by name or condition..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent outline-none bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-300"
              />
            </div>

            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent outline-none bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-gray-900 dark:text-gray-100 transition-colors duration-300"
            >
              <option value="all">All Patients</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="high-risk">High Risk</option>
              <option value="medium-risk">Medium Risk</option>
              <option value="low-risk">Low Risk</option>
            </select>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          {[
            {
              label: "Total Patients",
              value: patients.length,
              icon: Users,
              color: "blue",
            },
            {
              label: "Active Cases",
              value: patients.filter((p) => p.status === "active").length,
              icon: UserCheck,
              color: "green",
            },
            {
              label: "High Risk",
              value: patients.filter((p) => p.riskLevel === "high").length,
              icon: AlertTriangle,
              color: "red",
            },
            {
              label: "New This Week",
              value: "12",
              icon: UserPlus,
              color: "purple",
            },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl transition-colors duration-300"
              >
                <div
                  className={`w-12 h-12 bg-${stat.color}-100 dark:bg-${stat.color}-900/30 rounded-xl flex items-center justify-center mb-4`}
                >
                  <Icon
                    className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`}
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stat.value}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Patients Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-2xl overflow-hidden transition-colors duration-300"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Patient Records
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
              Complete patient database with detailed information
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Condition
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Risk Level
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Last Visit
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <AnimatePresence>
                  {currentPatients.map((patient, index) => (
                    <motion.tr
                      key={patient.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg">
                            {patient.avatar}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {patient.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {patient.age} years, {patient.gender}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {patient.email}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {patient.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {patient.condition}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getRiskLevelColor(
                            patient.riskLevel
                          )}`}
                        >
                          {patient.riskLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            patient.status
                          )}`}
                        >
                          {patient.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(patient.lastVisit, "MMM dd, yyyy")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openViewModal(patient)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openEditModal(patient)}
                            className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-100"
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openDeleteModal(patient)}
                            className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {indexOfFirstPatient + 1} to{" "}
                  {Math.min(indexOfLastPatient, filteredPatients.length)} of{" "}
                  {filteredPatients.length} patients
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm">
                    {currentPage}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modals */}
      {/* Add/Edit Patient Modal */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => {
              setShowAddModal(false);
              setShowEditModal(false);
              resetForm();
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700 transition-colors duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300">
                  {showAddModal ? "Add New Patient" : "Edit Patient"}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Age
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.age}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          age: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      required
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          gender: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medical Condition
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.condition}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          condition: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Risk Level
                    </label>
                    <select
                      value={formData.riskLevel}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          riskLevel: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="low">Low Risk</option>
                      <option value="medium">Medium Risk</option>
                      <option value="high">High Risk</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        emergencyContact: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Name - Phone Number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    rows="3"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  />
                </div>

                <div className="flex space-x-4 pt-6 border-t">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-xl font-medium flex items-center justify-center space-x-2"
                  >
                    <Save className="w-5 h-5" />
                    <span>
                      {showAddModal ? "Add Patient" : "Update Patient"}
                    </span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium"
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Patient Modal */}
      <AnimatePresence>
        {showViewModal && selectedPatient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowViewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Patient Details
                </h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Patient Header */}
                <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl">
                    {selectedPatient.avatar}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedPatient.name}
                    </h3>
                    <p className="text-gray-600">
                      {selectedPatient.age} years, {selectedPatient.gender}
                    </p>
                    <div className="flex space-x-2 mt-2">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getRiskLevelColor(
                          selectedPatient.riskLevel
                        )}`}
                      >
                        {selectedPatient.riskLevel} risk
                      </span>
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          selectedPatient.status
                        )}`}
                      >
                        {selectedPatient.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Patient Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-blue-600" />
                        Contact Information
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-sm text-gray-900">
                          {selectedPatient.email}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedPatient.phone}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Stethoscope className="w-4 h-4 mr-2 text-green-600" />
                        Medical Condition
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-sm text-gray-900">
                          {selectedPatient.condition}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-purple-600" />
                        Last Visit
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-sm text-gray-900">
                          {format(selectedPatient.lastVisit, "MMMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-red-600" />
                        Address
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-sm text-gray-900">
                          {selectedPatient.address || "Not provided"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-orange-600" />
                        Emergency Contact
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-sm text-gray-900">
                          {selectedPatient.emergencyContact || "Not provided"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-indigo-600" />
                        Notes
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-sm text-gray-900">
                          {selectedPatient.notes || "No notes available"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4 pt-6 border-t">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowViewModal(false);
                      openEditModal(selectedPatient);
                    }}
                    className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white py-3 rounded-xl font-medium flex items-center justify-center space-x-2"
                  >
                    <Edit className="w-5 h-5" />
                    <span>Edit Patient</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowViewModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium"
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedPatient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Delete Patient
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete{" "}
                  <span className="font-medium text-gray-900">
                    {selectedPatient.name}
                  </span>
                  ? This action cannot be undone.
                </p>

                <div className="flex space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDelete}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 rounded-xl font-medium flex items-center justify-center space-x-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span>Delete</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SimplePatientsPage;
