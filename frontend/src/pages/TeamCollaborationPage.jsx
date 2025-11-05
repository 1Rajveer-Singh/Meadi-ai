import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Settings,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Check,
  X,
  Crown,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Bell,
  Link as LinkIcon,
  Brain,
  Scale,
  Database,
  Smartphone,
  CreditCard,
  LogOut,
  UserCheck,
  UserX,
  Filter,
  Download,
  Upload,
  Share2,
  MessageSquare,
  Video,
  Calendar,
  FileText,
  TrendingUp,
} from "lucide-react";
import SimpleLayout from "../components/layouts/SimpleLayout";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import axios from "axios";

const TeamCollaborationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("members");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // Mock team data - replace with actual API calls
  const [teamMembers, setTeamMembers] = useState([
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@hospital.com",
      role: "admin",
      department: "Cardiology",
      status: "active",
      lastActive: "2 minutes ago",
      joinedDate: "2024-01-15",
      avatar: "SJ",
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      email: "michael.chen@hospital.com",
      role: "member",
      department: "Radiology",
      status: "active",
      lastActive: "5 minutes ago",
      joinedDate: "2024-02-20",
      avatar: "MC",
    },
    {
      id: 3,
      name: "Dr. Emily Williams",
      email: "emily.williams@hospital.com",
      role: "member",
      department: "Oncology",
      status: "offline",
      lastActive: "2 hours ago",
      joinedDate: "2024-03-10",
      avatar: "EW",
    },
    {
      id: 4,
      name: "Dr. James Smith",
      email: "james.smith@hospital.com",
      role: "viewer",
      department: "Neurology",
      status: "active",
      lastActive: "10 minutes ago",
      joinedDate: "2024-04-05",
      avatar: "JS",
    },
  ]);

  const [pendingInvites, setPendingInvites] = useState([
    {
      id: 1,
      email: "john.doe@hospital.com",
      role: "member",
      sentBy: "Dr. Sarah Johnson",
      sentDate: "2024-11-01",
      status: "pending",
    },
    {
      id: 2,
      email: "jane.smith@hospital.com",
      role: "viewer",
      sentBy: "Dr. Sarah Johnson",
      sentDate: "2024-11-03",
      status: "pending",
    },
  ]);

  const [teamStats, setTeamStats] = useState({
    totalMembers: 4,
    activeNow: 3,
    pendingInvites: 2,
    totalDiagnoses: 1247,
    collaborativeCases: 89,
  });

  const tabs = [
    { id: "members", label: "Team Members", icon: Users },
    { id: "invites", label: "Pending Invites", icon: Mail },
    { id: "roles", label: "Roles & Permissions", icon: Shield },
    { id: "activity", label: "Team Activity", icon: Activity },
    { id: "settings", label: "Team Settings", icon: Settings },
  ];

  const handleInviteMember = async () => {
    if (!inviteEmail) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      // Replace with actual API call
      const newInvite = {
        id: pendingInvites.length + 1,
        email: inviteEmail,
        role: inviteRole,
        sentBy: user?.name || "Current User",
        sentDate: new Date().toISOString().split("T")[0],
        status: "pending",
      };

      setPendingInvites([...pendingInvites, newInvite]);
      toast.success(`Invitation sent to ${inviteEmail}`);
      setShowInviteModal(false);
      setInviteEmail("");
      setInviteRole("member");
    } catch (error) {
      console.error("Error sending invite:", error);
      toast.error("Failed to send invitation");
    }
  };

  const handleRemoveMember = (memberId) => {
    if (window.confirm("Are you sure you want to remove this team member?")) {
      setTeamMembers(teamMembers.filter((m) => m.id !== memberId));
      toast.success("Team member removed");
    }
  };

  const handleCancelInvite = (inviteId) => {
    setPendingInvites(pendingInvites.filter((i) => i.id !== inviteId));
    toast.success("Invitation cancelled");
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "member":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "viewer":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "offline":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = selectedRole === "all" || member.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  const renderMembersTab = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">
                {teamStats.totalMembers}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Now</p>
              <p className="text-2xl font-bold text-gray-900">
                {teamStats.activeNow}
              </p>
            </div>
            <Activity className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Invites</p>
              <p className="text-2xl font-bold text-gray-900">
                {teamStats.pendingInvites}
              </p>
            </div>
            <Mail className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Diagnoses</p>
              <p className="text-2xl font-bold text-gray-900">
                {teamStats.totalDiagnoses}
              </p>
            </div>
            <FileText className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Collaborative Cases</p>
              <p className="text-2xl font-bold text-gray-900">
                {teamStats.collaborativeCases}
              </p>
            </div>
            <Share2 className="w-8 h-8 text-pink-600" />
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg flex-wrap gap-4">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowInviteModal(true)}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
        >
          <UserPlus className="w-5 h-5" />
          <span>Invite Member</span>
        </motion.button>
      </div>

      {/* Team Members List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {member.avatar}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {member.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {member.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(
                        member.role
                      )}`}
                    >
                      {member.role === "admin" && (
                        <Crown className="w-3 h-3 mr-1" />
                      )}
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {member.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        member.status
                      )}`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full mr-1.5 ${
                          member.status === "active" ? "bg-green-600" : "bg-gray-400"
                        }`}
                      ></span>
                      {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.lastActive}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-all">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredMembers.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No team members found</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderInvitesTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Mail className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-orange-900">
            <p className="font-medium mb-1">Pending Invitations</p>
            <p>
              Manage pending team invitations. Invited members will receive an
              email with instructions to join your team.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {pendingInvites.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sent By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sent Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingInvites.map((invite) => (
                  <tr key={invite.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Mail className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-900">
                          {invite.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(
                          invite.role
                        )}`}
                      >
                        {invite.role.charAt(0).toUpperCase() + invite.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invite.sentBy}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invite.sentDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-all text-sm font-medium">
                          Resend
                        </button>
                        <button
                          onClick={() => handleCancelInvite(invite.id)}
                          className="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-all text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Mail className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No pending invitations</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderRolesTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-purple-900">
            <p className="font-medium mb-1">Roles & Permissions</p>
            <p>
              Define team member roles and their access permissions within the
              system.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Admin Role */}
        <div className="bg-white border-2 border-purple-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Crown className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Admin</h3>
              <p className="text-sm text-gray-600">Full access</p>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center">
              <Check className="w-4 h-4 text-green-600 mr-2" />
              Manage team members
            </li>
            <li className="flex items-center">
              <Check className="w-4 h-4 text-green-600 mr-2" />
              Configure AI settings
            </li>
            <li className="flex items-center">
              <Check className="w-4 h-4 text-green-600 mr-2" />
              Access all diagnoses
            </li>
            <li className="flex items-center">
              <Check className="w-4 h-4 text-green-600 mr-2" />
              View analytics & reports
            </li>
            <li className="flex items-center">
              <Check className="w-4 h-4 text-green-600 mr-2" />
              Manage billing
            </li>
          </ul>
        </div>

        {/* Member Role */}
        <div className="bg-white border-2 border-blue-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Member</h3>
              <p className="text-sm text-gray-600">Standard access</p>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center">
              <Check className="w-4 h-4 text-green-600 mr-2" />
              Create diagnoses
            </li>
            <li className="flex items-center">
              <Check className="w-4 h-4 text-green-600 mr-2" />
              Access AI tools
            </li>
            <li className="flex items-center">
              <Check className="w-4 h-4 text-green-600 mr-2" />
              View own cases
            </li>
            <li className="flex items-center">
              <Check className="w-4 h-4 text-green-600 mr-2" />
              Collaborate on cases
            </li>
            <li className="flex items-center">
              <X className="w-4 h-4 text-red-600 mr-2" />
              Manage team settings
            </li>
          </ul>
        </div>

        {/* Viewer Role */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <UserX className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Viewer</h3>
              <p className="text-sm text-gray-600">Read-only access</p>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center">
              <Check className="w-4 h-4 text-green-600 mr-2" />
              View shared cases
            </li>
            <li className="flex items-center">
              <Check className="w-4 h-4 text-green-600 mr-2" />
              View reports
            </li>
            <li className="flex items-center">
              <X className="w-4 h-4 text-red-600 mr-2" />
              Create diagnoses
            </li>
            <li className="flex items-center">
              <X className="w-4 h-4 text-red-600 mr-2" />
              Modify cases
            </li>
            <li className="flex items-center">
              <X className="w-4 h-4 text-red-600 mr-2" />
              Access AI tools
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderActivityTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Activity className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-green-900">
            <p className="font-medium mb-1">Team Activity Log</p>
            <p>
              Track recent team activities, collaborations, and system usage.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="space-y-4">
          {[
            {
              user: "Dr. Sarah Johnson",
              action: "created a new diagnosis",
              case: "Patient #12345",
              time: "5 minutes ago",
              icon: FileText,
              color: "blue",
            },
            {
              user: "Dr. Michael Chen",
              action: "collaborated on",
              case: "Cardiology Case #789",
              time: "15 minutes ago",
              icon: Share2,
              color: "purple",
            },
            {
              user: "Dr. Emily Williams",
              action: "ran AI analysis on",
              case: "Oncology Scan",
              time: "1 hour ago",
              icon: Brain,
              color: "orange",
            },
            {
              user: "Dr. James Smith",
              action: "viewed report for",
              case: "Neurology Report #456",
              time: "2 hours ago",
              icon: TrendingUp,
              color: "green",
            },
          ].map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div
                key={index}
                className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div
                  className={`w-10 h-10 bg-${activity.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}
                >
                  <Icon className={`w-5 h-5 text-${activity.color}-600`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold">{activity.user}</span>{" "}
                    {activity.action}{" "}
                    <span className="font-medium">{activity.case}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Team Settings
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">
                Allow members to invite others
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Members can send team invitations
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">
                Enable collaboration features
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Allow real-time case collaboration
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Activity notifications</p>
              <p className="text-sm text-gray-600 mt-1">
                Notify team about member activities
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
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
        {/* Sidebar - All Settings Sections */}
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
                onClick={() => navigate("/settings/ai-configuration")}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Brain className="w-4 h-4 flex-shrink-0" />
                <span className="text-left">AI Configuration & Tuning</span>
              </button>

              <button
                onClick={() => setActiveTab("members")}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
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
              Team & Collaboration
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
            {activeTab === "members" && renderMembersTab()}
            {activeTab === "invites" && renderInvitesTab()}
            {activeTab === "roles" && renderRolesTab()}
            {activeTab === "activity" && renderActivityTab()}
            {activeTab === "settings" && renderSettingsTab()}
          </motion.div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Invite Team Member
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@hospital.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteEmail("");
                  setInviteRole("member");
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleInviteMember}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
              >
                Send Invite
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </SimpleLayout>
  );
};

export default TeamCollaborationPage;
