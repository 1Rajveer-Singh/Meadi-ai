import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Pages - Optimized Consolidated Structure
import LandingPage from "@pages/LandingPage";
import SimpleDashboard from "@pages/SimpleDashboard";
import SimplePatientsPage from "@pages/SimplePatientsPage";
import AnalyzePage from "@pages/AnalyzePage";
import SafetyPage from "@pages/SafetyPage";
import InsightsPage from "@pages/InsightsPage";
import ProfilePage from "@pages/ProfilePage";
import SettingsPage from "@pages/SettingsPage";
import AIConfigurationPage from "@pages/AIConfigurationPage";
import TeamCollaborationPage from "@pages/TeamCollaborationPage";

// Providers
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />

              {/* All Protected Routes - Optimized Consolidated Structure */}
              <Route path="/dashboard" element={<SimpleDashboard />} />
              <Route path="/patients" element={<SimplePatientsPage />} />

              {/* Consolidated Analyze Hub - All analysis workflows */}
              <Route path="/diagnosis/new" element={<AnalyzePage />} />
              <Route
                path="/diagnosis/processing/:diagnosisId?"
                element={<AnalyzePage />}
              />
              <Route
                path="/diagnosis/results/:diagnosisId?"
                element={<AnalyzePage />}
              />
              <Route path="/analysis/images" element={<AnalyzePage />} />

              {/* Consolidated Safety Hub - Drug checker + Guidelines + Protocols */}
              <Route path="/drug-checker" element={<SafetyPage />} />
              <Route path="/safety/*" element={<SafetyPage />} />

              {/* Consolidated Insights Hub - Analytics + Reports + Research + AI */}
              <Route path="/analytics" element={<InsightsPage />} />
              <Route path="/reports" element={<InsightsPage />} />
              <Route path="/research" element={<InsightsPage />} />
              <Route path="/ai-insights" element={<InsightsPage />} />
              <Route path="/insights/*" element={<InsightsPage />} />

              {/* Profile & Settings */}
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/settings/ai-configuration" element={<AIConfigurationPage />} />
              <Route path="/settings/team-collaboration" element={<TeamCollaborationPage />} />

              {/* Legacy Routes - Redirect to consolidated pages */}
              <Route path="/new-diagnosis" element={<AnalyzePage />} />
              <Route path="/image-analysis" element={<AnalyzePage />} />
              <Route path="/reports-analytics" element={<InsightsPage />} />
            </Routes>

            {/* Global Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#363636",
                  color: "#fff",
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: "#10b981",
                    secondary: "#fff",
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: "#ef4444",
                    secondary: "#fff",
                  },
                },
              }}
            />
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
