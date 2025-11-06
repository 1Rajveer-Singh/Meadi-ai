# 📱 Medical AI Platform - Mobile Frontend Build Specification

> Comprehensive build instructions to replicate the existing React web application as a React Native CLI mobile app with pixel-perfect dark theme fidelity.

---

## 🎯 Project Overview

This mobile app is a faithful 1:1 replica of the **Ultimate Medical AI Platform** web frontend. The web app is a comprehensive Multi-Agent AI diagnostic system featuring:

- **MONAI-powered medical imaging analysis** with visual heatmaps
- **Multi-agent coordination** (Image Analysis, Drug Safety, Clinical Decision, Research, History Synthesis agents)
- **Real-time activity feeds** showing AI diagnostic progress
- **Drug interaction checker** with safety alerts
- **Clinical trials matching** for rare diseases
- **Performance analytics** with charts and metrics
- **Patient management** with medical history timelines
- **AI configuration** dashboard with model tuning

**Your goal**: Build a React Native CLI mobile interface that mirrors every screen, component, color, animation, and interaction pattern from the web app, locked to dark mode only.

---

## 🛠️ Technical Stack & Constraints

- **Framework**: React Native CLI (no Expo)
- **Styling**: NativeWind (Tailwind CSS for React Native) or styled-components matching Tailwind utility classes
- **Navigation**: React Navigation v6+ with bottom tabs + nested stacks
- **Icons**: Lucide React Native (`lucide-react-native`)
- **Animations**: Reanimated 3 + Moti for Framer Motion equivalents
- **Charts**: Victory Native or React Native Charts Kit for analytics visualizations
- **State**: React Context API (AuthContext, ThemeContext, NotificationContext)
- **Data**: Local mock JSON fixtures (no backend calls)
- **Theme**: Dark mode only (no light mode implementation)

---

## 🎨 Design System (Exact Web Replication)

### Color Palette (Dark Mode)

```javascript
colors: {
  // Backgrounds
  background: {
    primary: '#111827',    // Main app background (gray-900)
    elevated: '#1f2937',   // Cards & panels (gray-800)
    overlay: '#374151',    // Modals & dropdowns (gray-700)
    subtle: '#4b5563',     // Dividers & borders (gray-600)
  },

  // Text
  text: {
    primary: '#f9fafb',    // Headings (gray-50)
    secondary: '#e5e7eb',  // Body text (gray-200)
    tertiary: '#9ca3af',   // Labels & captions (gray-400)
    disabled: '#6b7280',   // Disabled states (gray-500)
  },

  // Brand & Status
  primary: {
    DEFAULT: '#3b82f6',    // Primary blue (blue-600)
    light: '#60a5fa',      // blue-400
    dark: '#2563eb',       // blue-700
  },
  success: {
    DEFAULT: '#10b981',    // Emerald (emerald-500)
    light: '#34d399',      // emerald-400
  },
  warning: {
    DEFAULT: '#f59e0b',    // Amber (amber-500)
    light: '#fbbf24',      // amber-400
  },
  danger: {
    DEFAULT: '#ef4444',    // Red (red-500)
    light: '#f87171',      // red-400
  },

  // Agent-specific colors
  agents: {
    imaging: '#8b5cf6',    // Purple (MONAI)
    drugSafety: '#f97316', // Orange
    clinical: '#ec4899',   // Pink
    research: '#06b6d4',   // Cyan
  },
}
```

### Typography

```javascript
fontSizes: {
  xs: 12,      // Labels, captions
  sm: 14,      // Body text, secondary info
  base: 16,    // Primary body text
  lg: 18,      // Section headings
  xl: 20,      // Card titles
  '2xl': 24,   // Page titles
  '3xl': 30,   // Hero text
  '4xl': 36,   // Landing hero
}

fontWeights: {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
}
```

### Spacing & Layout

- Use 4px grid system (matching Tailwind's spacing scale)
- Cards: rounded-xl (12px radius), shadow-sm
- Inputs: rounded-lg (8px radius), border-gray-600
- Buttons: rounded-lg (8px), px-6 py-3 for primary CTAs
- Bottom tab bar: 72px height, frosted glass effect

### Shadows & Elevation

```javascript
shadows: {
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  DEFAULT: '0 1px 3px rgba(0,0,0,0.1)',
  md: '0 4px 6px rgba(0,0,0,0.1)',
  lg: '0 10px 15px rgba(0,0,0,0.1)',
  xl: '0 20px 25px rgba(0,0,0,0.1)',
}
```

---

## � Navigation Structure (Exact Web Mapping)

### Bottom Tab Navigation (5 tabs)

Replicate the optimized 5-tab structure from web NavigationBar component:

1. **Dashboard** (`LayoutDashboard` icon)

   - Badge: None
   - Description: "Hospital Overview"
   - Active indicator: Blue gradient underline

2. **Patients** (`Users` icon)

   - Badge: "247" (patient count)
   - Description: "Patient Management"
   - Active indicator: Green gradient underline

3. **Analyze** (`Zap` icon) - **PRIMARY CTA**

   - Special styling: Emerald gradient background, pulsing glow
   - Description: "AI Analysis Hub"
   - Active indicator: Full emerald gradient button
   - Routes to: `/diagnosis/new`

4. **Safety** (`Shield` icon)

   - Badge: None
   - Description: "Safety & Guidelines"
   - Active indicator: Orange gradient underline
   - Routes to: `/drug-checker`

5. **Insights** (`TrendingUp` icon)
   - Badge: None
   - Description: "Analytics & Research"
   - Active indicator: Purple gradient underline

### Top Navigation Elements

- **Left**: Hospital logo + greeting ("Good morning, Dr. Chen")
- **Right**:
  - Bell icon with unread notification badge
  - Profile avatar with dropdown menu
  - Dark mode toggle (locked to dark, visually present but disabled)

### Profile Dropdown Menu Items

- My Profile
- Settings
- AI Configuration
- Team Collaboration
- Help & Documentation
- Sign Out (with confirmation modal)

---

## 📱 Screen-by-Screen Implementation Guide

### 1. Dashboard (`SimpleDashboard.jsx`)

**Header Section**

- Title: "Hospital Dashboard" with Activity icon
- Subtitle: Current date formatted as "Monday, November 5, 2025"
- Live status indicator: Green pulsing dot + "Live Updates" / "Paused"
- Toggle button: Play/Pause real-time updates

**KPI Cards (Top Row - 4 cards)**

```javascript
[
  {
    title: "Diagnostics Today",
    value: 127,
    change: "+15.2%",
    changeType: "positive",
    description: "from yesterday",
    icon: "Activity",
    color: "blue",
  },
  {
    title: "Critical Alerts",
    value: 8,
    change: "-24%",
    changeType: "positive",
    description: "from last week",
    icon: "AlertTriangle",
    color: "orange",
  },
  {
    title: "Pending Reviews",
    value: 23,
    change: "+8",
    changeType: "negative",
    description: "requires attention",
    icon: "FileText",
    color: "red",
  },
  {
    title: "AI Accuracy",
    value: "97.8%",
    change: "+2.1%",
    changeType: "positive",
    description: "avg this week",
    icon: "TrendingUp",
    color: "green",
  },
];
```

- Each card: white/gray-800 bg, blue-500 left border, shadow-sm, rounded-xl
- CountUp animation on numbers
- Icons in colored rounded squares (blue-100 bg, blue-600 text)

**Real-Time Activity Feed**

- Title: "Real-Time Activity Feed" with Activity icon + "Live" badge
- Max height: 384px (max-h-96), vertical scroll
- Activity items with status icons:
  - Success: Green CheckCircle
  - Warning: Orange AlertTriangle
  - Processing: Blue Cpu (spinning animation)
  - Critical: Red AlertOctagon
- Each item shows:
  - Agent name ("Image Analysis Agent", "Drug Safety Agent", etc.)
  - Message with patient ID
  - Timestamp ("2 min ago")
  - Confidence badge ("95% confidence")
  - Gray-50/gray-700 background on hover

**Performance Analytics Chart**

- Title: "Weekly Performance Analytics"
- Subtitle: "AI diagnosis accuracy and case volume trends"
- Area chart (Victory Native or similar) with:
  - Blue gradient area: AI Accuracy (%)
  - Green gradient area: Patients Treated
  - X-axis: Mon-Sun
  - Y-axis: Dual scale
  - Frosted glass overlay on hover
- Chart legend below with colored dots

**Recent Diagnoses Table**

- Columns: Patient ID, Name, Diagnosis, Confidence, Status, Urgency, Doctor
- Status badges: "completed" (green), "processing" (blue), "pending" (yellow)
- Urgency badges: "critical" (red), "urgent" (orange), "routine" (gray)
- Confidence percentages with colored backgrounds
- Hover state: subtle scale + shadow increase

**Critical Alerts Section**

- 3 alert cards with colored left borders:
  - Drug Interaction (red-500 border)
  - Rare Disease Detection (orange-500 border)
  - System Update (blue-500 border)
- Each alert: icon, title, message, timestamp, action button

### 2. Analyze Page (`AnalyzePage.jsx`)

**Multi-Agent Analysis Type Selection**
Display 5 analysis cards in grid (2 columns on mobile):

```javascript
[
  {
    id: "comprehensive",
    name: "Multi-Agent Comprehensive",
    description: "Complete AI system with all specialized agents",
    icon: "Brain",
    color: "purple",
    agents: [
      "Image Analysis (MONAI)",
      "Drug Safety",
      "Clinical Decision",
      "Research",
      "History Synthesis",
    ],
    features: [
      "Visual Heatmaps",
      "Explainable AI",
      "Real-time Monitoring",
      "Clinical Trials Matching",
    ],
  },
  {
    id: "imaging",
    name: "Medical Imaging (MONAI)",
    description: "MONAI-powered medical image analysis",
    icon: "Microscope",
    color: "green",
    agents: ["Image Analysis Agent"],
    features: [
      "X-ray/MRI Processing",
      "Visual Heatmaps",
      "Pathology Detection",
    ],
  },
  // ... 3 more cards
];
```

**Upload Section**

- Drag-and-drop zone with dashed border
- File input button: "Choose Medical Image"
- Supported formats: "JPG, PNG, DICOM - Max 10MB"
- Preview thumbnail grid for uploaded files
- Remove button (X icon) on each thumbnail

**Patient Information Form**

- Input fields:
  - Patient ID (auto-generated suggestion)
  - Patient Name
  - Age & Gender (side-by-side)
  - Medical History (multiline textarea, 6 rows)
  - Current Medications (multiline textarea)
  - Chief Complaint (multiline textarea)
- All inputs: gray-700 bg, gray-600 border, blue-500 focus ring

**Processing Screen**

- Full-screen overlay with animated gradient background
- Center content:
  - Spinning loader (blue-600 border)
  - Progress steps indicator (Upload → Analyzing → Complete)
  - Status text: "AI Analysis in Progress..."
  - Agent activity logs scrolling in real-time:
    ```
    [MONAI] Preprocessing image... ✓
    [Image Agent] Detecting pathologies... ⏳
    [Drug Safety Agent] Cross-referencing medications...
    ```
  - Estimated time remaining countdown

**Results Screen**

- Hero section with gradient background (blue-900/purple-900)
- Primary diagnosis card:
  - Large diagnosis name
  - Confidence meter (circular progress, Victory Native)
  - Risk score badge (Low/Medium/High/Critical)
  - Priority badge (Routine/Urgent/Critical)
- Key findings list with checkmarks
- Visual heatmap image (placeholder with gradient overlay)
- Explainability section: "Why this diagnosis?"
- Recommendations accordion:
  - Clinical recommendations
  - Drug interactions warnings
  - Follow-up actions
  - Clinical trials (if rare disease detected)
- Action buttons:
  - "Save Report" (primary blue gradient)
  - "Share with Specialist" (secondary outline)
  - "Start New Analysis" (tertiary)

### 3. Patients Page (`SimplePatientsPage.jsx`)

**Search & Filter Bar**

- Search input with magnifying glass icon
- Filter pills: "All", "Critical", "Urgent", "Routine", "Stable"
- Sort dropdown: "Recent", "Name", "Risk Score"

**Patient Cards Grid**
Each card displays:

- Avatar (colored circle with initials)
- Name (bold, large)
- Patient ID (small gray text)
- Risk score meter (colored progress bar)
- Active alerts count (red badge)
- Last update timestamp
- Status indicator dot (green/yellow/red)
- Tap to navigate to detail screen

**Patient Detail Screen**

- Back button top-left
- Patient header:
  - Large avatar
  - Name, age, gender
  - Patient ID
  - Risk score prominent
- Tabs: Overview, Vitals, Medications, Imaging, AI Insights
- Timeline view of medical events:
  - Diagnosis entries
  - Medication changes
  - Test results
  - AI analysis history
- Each timeline item: left-line connector, colored dot, content card

### 4. Safety Page (Drug Checker)

**Drug Search Interface**

- Search bar: "Search medications..."
- Recent searches chips below
- Autocomplete dropdown with drug database

**Current Medication List**

- Added drugs displayed as cards:
  - Drug name (bold)
  - Dosage & frequency
  - Remove button (trash icon)
- "Add Medication" button (plus icon, dashed border)

**Interaction Results**

- Interaction severity badges:
  - Critical (red-500 bg, pulse animation)
  - High (orange-500 bg)
  - Moderate (yellow-500 bg)
  - Low (gray-400 bg)
- Expandable interaction cards:
  - Drugs involved
  - Interaction description
  - Clinical significance
  - Recommendations
  - References links

**Safety Protocols Tab**

- List of protocols with:
  - Icon + title
  - Category badge
  - Compliance status (green check / yellow warning)
  - "View Details" chevron button

### 5. Insights Page (Analytics)

**Tabs**: Performance | Reports | Research | Clinical Trials

**Performance Tab**

- KPI cards (2x2 grid):
  - Total Diagnoses (CountUp number)
  - Average Accuracy
  - Response Time
  - Cost Savings
- Weekly trends chart (line chart, Victory Native)
- Agent performance breakdown (bar chart)
- Top performing models table

**Reports Tab**

- Recent reports list:
  - Report thumbnail
  - Title & date
  - Download/Share icons
- Filter: Date range picker
- Export button: "Export All Reports (PDF)"

**Research Tab**

- Featured studies cards
- Clinical trials matching interface
- Literature search bar
- Saved research bookmarks

### 6. Profile Page (`ProfilePage.jsx`)

**Profile Header**

- Large gradient card (blue-50 to purple-50 in light, blue-900/20 to purple-900/20 in dark)
- Avatar: 80x80 circle with gradient border (blue-600 to purple-600)
- Name, role, specialization
- Verified badge (green checkmark)
- Edit profile button (top-right)

**Profile Sections**
Each section as collapsible accordion:

**Personal Information**

- Input fields: Full Name, Email, Phone, Date of Birth, Gender, Specialization
- All readonly mode by default, "Edit" button to unlock

**Medical Credentials**

- License number input
- Board certification dropdown
- Institution/Hospital input
- Years of experience input

**Professional Details**

- Department dropdown
- Position input
- Shift schedule display
- On-call status toggle

**Account Security**

- Email (verified badge)
- Phone (verified badge)
- Two-factor authentication toggle
- Connected devices list
- Biometric login toggle

**Statistics Display**

- Total diagnoses conducted
- Average confidence score
- Specialties covered
- Patient reviews rating

### 7. Settings Page (`SettingsPage.jsx`)

**Settings Sidebar** (or tab bar on mobile)
11 sections matching the web:

1. Profile
2. Account & Sign Out (highlighted)
3. Notifications & Alerts
4. Security & Authentication
5. Integrations & Connections
6. AI Configuration (navigates to separate page)
7. Team & Collaboration (navigates to separate page)
8. Compliance & Audit
9. Data & Backup
10. Mobile & Devices
11. Billing & Subscription

**Account & Sign Out Section**

- Current session card:
  - Avatar + name
  - Role badge
  - Active status dot
- Account details card:
  - Email (verified)
  - Phone (verified)
  - Account type badge
- Sign Out section:
  - Red gradient warning card
  - "Sign out of this device" button
  - "Sign out of all devices" button
  - Confirmation modal with:
    - Session summary
    - Optional feedback textarea
    - "Confirm Sign Out" (red gradient)
    - "Switch Account" (secondary)
    - "Cancel" (tertiary)

**Notifications Section**

- Notification preferences toggles:
  - Email notifications
  - Push notifications
  - SMS notifications
  - Diagnosis alerts
  - Critical findings
  - AI updates
  - System maintenance
  - Patient updates
  - Collaboration requests
  - Daily summary
  - Weekly report
- Alert rules list with severity badges
- Notification history timeline
- Filter: Unread only toggle + category dropdown

**Security Section**

- Password change form
- Two-factor authentication:
  - Toggle switch
  - Setup wizard (QR code, backup codes)
- Active sessions list:
  - Device name, location, last active
  - "Revoke" button per session
- API keys management:
  - Generated keys list
  - "Generate New Key" button
  - Expiration dates
  - Revoke buttons

### 8. AI Configuration Page (`AIConfigurationPage.jsx`)

**Header with Navigation**

- Back button
- Title: "AI System Configuration"
- Save button (top-right, blue gradient, sticky)

**Tabs** (horizontal scroll on mobile):

1. Models
2. Performance
3. RAG
4. Agents
5. Safety
6. Analytics

**Models Tab**

- Info banner: "Configure foundation models and specialized agents"
- Foundation model dropdown:
  - GPT-4
  - Claude 3
  - Gemini Pro
  - PaLM 2
- Vision model dropdown (MONAI, MedCLIP, etc.)
- Specialized models cards:
  - Drug interaction model
  - Clinical decision model
  - Research synthesis model
  - Each with version info + update button

**Performance Tab**

- Gradient banner: "Optimize AI performance and response times"
- Batch size slider (1-32, default 8)
- Max tokens slider (100-4096, default 2048)
- Temperature slider (0-1, default 0.7, step 0.1)
- Top-P slider (0-1, default 0.9, step 0.05)
- Cache settings toggle

**RAG Tab**

- Enable RAG toggle (prominent)
- Chunk size slider (128-2048, default 512)
- Chunk overlap slider (0-512, default 50)
- Top-K slider (1-20, default 5)
- Similarity threshold slider (0-1, default 0.7)

**Agents Tab**

- Multi-agent coordination toggle
- Agent priority order (drag-to-reorder list):
  - Image Analysis Agent (MONAI)
  - Drug Safety Agent
  - Clinical Decision Support Agent
  - Research Agent
  - History Synthesis Agent
- Per-agent configuration:
  - Enable/disable toggle
  - Confidence threshold slider
  - Timeout settings

**Safety Tab**

- Content filtering toggles
- Response validation toggle
- Clinical guidelines compliance slider
- Audit logging toggle
- Warning threshold slider
- Emergency protocols toggle

**Analytics Tab**

- Usage statistics cards
- Model performance metrics
- Cost tracking display
- Cache hit rate
- Response time distribution chart

### 9. Team Collaboration Page (`TeamCollaborationPage.jsx`)

**Team Members List**

- Search bar: "Search team members..."
- Member cards:
  - Avatar
  - Name + role badge
  - Status chip (Active, On-call, Surgery, Off-duty)
  - Specialization
  - Last active timestamp
  - Contact buttons (message, call)

**Collaboration Feed**

- Activity timeline:
  - Shared diagnosis
  - Mention notifications
  - Approval requests
  - Comments on cases
- Each item: avatar, action description, timestamp, "View Case" link

**Permissions Matrix**

- Horizontal scroll table or accordion sections:
  - Team member name column
  - Permission columns: View, Edit, Share, Delete, Configure
  - Checkboxes or toggle switches per cell
- "Invite New Member" button (bottom-right FAB)

---

## 🧩 Reusable Component Library

Build these atomic components matching web patterns:

### StatusBadge

```javascript
<StatusBadge
  status="critical" // critical, high, medium, low, info
  label="Critical Finding"
  icon={AlertCircle}
  pulse={true} // animated pulse for critical
/>
```

- Styles: rounded-full, px-3 py-1, text-xs font-medium
- Colors: red-500 (critical), orange-500 (high), yellow-500 (medium), gray-400 (low), blue-500 (info)
- Dark mode backgrounds: red-900/30, orange-900/30, etc.

### StatCard

```javascript
<StatCard
  title="Diagnostics Today"
  value={127}
  change="+15.2%"
  changeType="positive"
  description="from yesterday"
  icon={Activity}
  color="blue"
/>
```

- Card: white/gray-800 bg, rounded-xl, shadow-sm, border-l-4 with colored border
- Icon container: colored bg square (blue-100/blue-600)
- CountUp animation on value
- Trend indicator: green/red text with arrow icon

### ToggleSwitch

```javascript
<ToggleSwitch
  value={enabled}
  onValueChange={setEnabled}
  label="Enable Two-Factor Authentication"
  description="Add an extra layer of security"
  disabled={false}
/>
```

- Switch: w-11 h-6, gray-200/gray-700 bg, rounded-full
- Thumb: white circle, animated slide transition
- Checked state: blue-600 bg
- Label: text-base font-medium, description: text-sm text-gray-400

### RangeSlider

```javascript
<RangeSlider
  min={0}
  max={1}
  step={0.1}
  value={0.7}
  onChange={setValue}
  label="Temperature"
  currentValue="0.7"
  showValue={true}
/>
```

- Track: h-2, gray-200/gray-700 bg, rounded-lg
- Thumb: blue-600 circle with shadow
- Labels: text-sm, value display on right

### ProgressIndicator (Circular)

```javascript
<ProgressIndicator
  percentage={97.8}
  size={120}
  strokeWidth={8}
  color="emerald"
  label="Confidence"
/>
```

- SVG circle animation
- Gradient stroke (emerald-400 to emerald-600)
- Center text: large percentage + small label

### TimelineItem

```javascript
<TimelineItem
  icon={CheckCircle}
  iconColor="green"
  timestamp="2 min ago"
  title="Diagnosis completed"
  description="Pneumonia detected with 95% confidence"
  status="success"
/>
```

- Left connector line (gray-300/gray-600)
- Colored dot/icon (green, orange, blue, red)
- Content card: gray-50/gray-700 bg, rounded-lg, p-4

### BottomSheet

```javascript
<BottomSheet
  isVisible={showSheet}
  onClose={() => setShowSheet(false)}
  title="Select Hospital Unit"
  height={400}
/>
```

- Animated slide-up from bottom (Reanimated)
- Backdrop: dim overlay, tap-to-dismiss
- Handle: gray pill at top
- Rounded top corners: rounded-t-3xl

### GradientCard

```javascript
<GradientCard
  gradient={["#3b82f6", "#8b5cf6"]} // blue to purple
  title="Multi-Agent Analysis"
  subtitle="Complete AI diagnostic system"
  icon={Brain}
/>
```

- Background: LinearGradient (react-native-linear-gradient)
- Frosted glass overlay for text readability
- Icon: large, white/90% opacity

---

## 🔐 Authentication Flow

### Splash Screen

- App logo (centered)
- Animated AI orb (rotating gradient sphere)
- Version number (bottom)
- Auto-navigate to Login after 2s

### Login Screen

- Gradient background (blue-900 to purple-900)
- Logo + tagline
- Email input (gray-700 bg, rounded-lg)
- Password input (eye icon to toggle visibility)
- "Remember me" checkbox
- Biometric login button (Face ID / Touch ID icon)
- "Forgot password?" link
- "Sign In" button (emerald gradient, full-width)
- "Create Account" link (bottom)
- Demo credentials card (blue info banner):
  ```
  Demo Account
  Email: demo@medicalai.com
  Password: demo123
  ```

### Registration Screen

- Multi-step form (3 steps):
  1. Personal info (name, email, phone)
  2. Professional details (license, specialization, institution)
  3. Security setup (password, 2FA)
- Progress indicator at top (3 dots)
- "Next" / "Back" buttons
- Terms & conditions checkbox

### Onboarding Walkthrough (First Launch)

4 screens with illustrations:

1. "AI-Powered Diagnostics" - MONAI imaging showcase
2. "Multi-Agent Analysis" - Agent collaboration diagram
3. "Real-Time Insights" - Dashboard preview
4. "Clinical Safety" - Drug interaction alerts

- Skip button (top-right)
- Pagination dots (bottom)
- "Get Started" button (last screen)

---

## � Animations & Micro-interactions

### Page Transitions

- Fade + slight scale on navigation
- Slide from right for detail screens
- Slide from bottom for modals

### Button Press

- Scale down to 0.95 on press
- Haptic feedback
- Gradient shift on gradient buttons

### Loading States

- Skeleton loaders (gray-700/30 bg, shimmer animation)
- Spinners: rotating border (blue-600)
- Progress bars: animated fill (emerald gradient)

### Success/Error Feedback

- Checkmark animation (scale + fade)
- Error shake animation (horizontal wiggle)
- Toast notifications:
  - Top slide-in
  - Auto-dismiss after 4s
  - Swipe up to dismiss
  - Status colors: green (success), red (error), blue (info), orange (warning)

### List Animations

- Stagger appear (50ms delay between items)
- Swipe-to-delete gesture
- Pull-to-refresh (spinner + haptic)

### Chart Animations

- Line draw-in (Victory Native onLoad animation)
- Bar grow-up
- Pie slice expand

---

## 🌙 Theme Implementation

### ThemeProvider Setup

```javascript
// theme/dark.js
export const darkTheme = {
  colors: {
    background: {
      primary: "#111827",
      elevated: "#1f2937",
      overlay: "#374151",
    },
    text: {
      primary: "#f9fafb",
      secondary: "#e5e7eb",
      tertiary: "#9ca3af",
    },
    // ... full palette from Design System section
  },
  spacing: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64],
  borderRadius: {
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
    "2xl": 16,
    full: 9999,
  },
  shadows: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    // ... more shadows
  },
};

// contexts/ThemeContext.jsx
export const ThemeProvider = ({ children }) => {
  // Always use dark theme, no toggle
  const theme = darkTheme;
  return (
    <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>
  );
};
```

### NativeWind Dark Mode

If using NativeWind:

- Configure `tailwind.config.js` with `darkMode: 'class'`
- Apply `dark` class to root view
- Use `dark:` prefix on all className props (but fixed to dark, not togglable)

---

## � Mock Data Structures

### Patient Data (`data/patients.json`)

```json
[
  {
    "id": "P-2024-1154",
    "name": "John Doe",
    "age": 45,
    "gender": "Male",
    "mrn": "MRN-789456",
    "riskScore": 78,
    "status": "critical",
    "activeAlerts": 3,
    "lastUpdate": "2024-11-05T10:30:00Z",
    "chiefComplaint": "Chest pain and shortness of breath",
    "medicalHistory": ["Hypertension", "Type 2 Diabetes"],
    "currentMedications": [
      { "name": "Metformin", "dosage": "500mg", "frequency": "2x daily" },
      { "name": "Lisinopril", "dosage": "10mg", "frequency": "1x daily" }
    ],
    "vitalSigns": {
      "bloodPressure": "145/92",
      "heartRate": 88,
      "temperature": 98.6,
      "oxygenSaturation": 94
    }
  }
]
```

### Diagnosis Data (`data/diagnoses.json`)

```json
[
  {
    "id": "DX-2024-0891",
    "patientId": "P-2024-1154",
    "patientName": "John Doe",
    "diagnosisType": "comprehensive",
    "primaryDiagnosis": "Pneumonia",
    "confidence": 95.3,
    "riskScore": "High",
    "priority": "Urgent",
    "timestamp": "2024-11-05T10:15:00Z",
    "status": "completed",
    "agents": [
      "Image Analysis Agent (MONAI)",
      "Drug Safety Agent",
      "Clinical Decision Support Agent"
    ],
    "findings": [
      "Bilateral infiltrates visible on chest X-ray",
      "Elevated white blood cell count",
      "Positive bacterial culture"
    ],
    "recommendations": [
      "Start broad-spectrum antibiotics immediately",
      "Monitor oxygen saturation closely",
      "Consider ICU admission if condition worsens"
    ],
    "drugInteractions": [
      {
        "severity": "moderate",
        "drugs": ["Azithromycin", "Metformin"],
        "description": "May increase risk of lactic acidosis"
      }
    ],
    "clinicalTrials": []
  }
]
```

### Activity Feed Data (`data/activities.json`)

```json
[
  {
    "id": "ACT-001",
    "type": "diagnosis",
    "status": "success",
    "message": "Diagnosis completed for Patient #P-2024-1154",
    "agent": "Image Analysis Agent (MONAI)",
    "confidence": 95.3,
    "timestamp": "2 min ago",
    "patientId": "P-2024-1154"
  },
  {
    "id": "ACT-002",
    "type": "alert",
    "status": "warning",
    "message": "Drug interaction detected: Warfarin + Aspirin",
    "agent": "Drug Safety Agent",
    "confidence": null,
    "timestamp": "5 min ago",
    "patientId": "P-2024-1149"
  }
]
```

### Notification Data (`data/notifications.json`)

```json
[
  {
    "id": "NOTIF-001",
    "title": "Critical Drug Interaction",
    "message": "Warfarin + Aspirin detected for Patient #P-2024-1154",
    "category": "drug_safety",
    "severity": "critical",
    "created_at": "2024-11-05T10:25:00Z",
    "is_read": false,
    "action_url": "/drug-checker"
  }
]
```

### Team Members Data (`data/team.json`)

```json
[
  {
    "id": "USER-001",
    "name": "Dr. Sarah Chen",
    "role": "Radiologist",
    "avatar": "https://i.pravatar.cc/150?img=1",
    "status": "Active",
    "specialization": "Medical Imaging",
    "lastActive": "2 min ago",
    "permissions": {
      "view": true,
      "edit": true,
      "share": true,
      "delete": false,
      "configure": false
    }
  }
]
```

---

## ✅ Acceptance Criteria & Quality Standards

### Functional Requirements

1. ✅ All 9 primary screens implemented (Dashboard, Patients, Analyze, Safety, Insights, Profile, Settings, AI Config, Team)
2. ✅ Bottom tab navigation with 5 tabs matching web structure
3. ✅ Nested stack navigation for detail screens
4. ✅ Profile dropdown menu from top-right avatar
5. ✅ Notification panel with unread badge
6. ✅ Dark theme applied consistently across all screens
7. ✅ No light mode toggle (locked to dark)
8. ✅ All forms and inputs functional with validation
9. ✅ Mock data rendering correctly
10. ✅ No backend API calls

### Visual Requirements

1. ✅ Colors match web Tailwind palette exactly
2. ✅ Gradients replicate web patterns (blue-purple, emerald, etc.)
3. ✅ Lucide icons used throughout (match web icon choices)
4. ✅ Typography hierarchy matches web (font sizes, weights)
5. ✅ Spacing follows 4px grid system
6. ✅ Cards have rounded-xl corners + shadow-sm
7. ✅ Buttons have proper press states
8. ✅ Status badges color-coded by severity
9. ✅ Charts render with gradients
10. ✅ Animations smooth (60 FPS)

### Code Quality

1. ✅ TypeScript or JSDoc for type safety
2. ✅ Feature-based folder structure:
   ```
   src/
   ├── screens/
   │   ├── Dashboard/
   │   ├── Patients/
   │   ├── Analyze/
   │   ├── Safety/
   │   ├── Insights/
   │   ├── Profile/
   │   ├── Settings/
   │   ├── AIConfiguration/
   │   └── TeamCollaboration/
   ├── components/
   │   ├── StatusBadge.jsx
   │   ├── StatCard.jsx
   │   ├── ToggleSwitch.jsx
   │   └── ...
   ├── contexts/
   │   ├── AuthContext.jsx
   │   ├── ThemeContext.jsx
   │   └── NotificationContext.jsx
   ├── navigation/
   │   ├── RootNavigator.jsx
   │   ├── TabNavigator.jsx
   │   └── StackNavigators.jsx
   ├── theme/
   │   ├── dark.js
   │   └── index.js
   ├── data/
   │   └── fixtures/
   │       ├── patients.json
   │       ├── diagnoses.json
   │       └── ...
   └── utils/
       ├── formatters.js
       └── validators.js
   ```
3. ✅ Reusable components extracted
4. ✅ No hardcoded strings (use constants)
5. ✅ Proper error boundaries
6. ✅ Loading states for all async operations
7. ✅ Optimized re-renders (React.memo where needed)
8. ✅ Accessibility labels on all interactive elements

### Performance

1. ✅ Initial load < 3s
2. ✅ Navigation transitions < 300ms
3. ✅ Chart render < 500ms
4. ✅ No memory leaks (proper cleanup in useEffect)
5. ✅ Images optimized (lazy loading for large lists)
6. ✅ FlatList for long lists (virtualization)

---

## 📦 Deliverables Checklist

### Source Code

- [ ] Complete React Native CLI project
- [ ] All dependencies in package.json with versions
- [ ] ESLint + Prettier config
- [ ] TypeScript config (if using TS)

### Documentation

- [ ] README.md with:
  - Project overview
  - Installation steps
  - Run instructions (iOS & Android)
  - Project structure explanation
  - Mock data locations
  - Theme customization guide
- [ ] CONTRIBUTING.md (if open-source)
- [ ] Inline code comments for complex logic

### Assets

- [ ] App icon (iOS & Android sizes)
- [ ] Splash screen assets
- [ ] Placeholder images for mock data
- [ ] Lucide icon assets bundled

### Configuration

- [ ] .env.example file
- [ ] Metro bundler config
- [ ] iOS Podfile configured
- [ ] Android build.gradle configured

### Testing (Optional)

- [ ] Jest setup for unit tests
- [ ] Example test files
- [ ] Detox E2E test setup (optional)

---

## 🚀 Implementation Priority Order

### Phase 1: Foundation (Week 1)

1. Project setup (React Native CLI init)
2. Install dependencies (navigation, icons, charts)
3. Theme setup (dark palette, ThemeProvider)
4. Navigation structure (tabs + stacks)
5. Mock data files created
6. AuthContext + basic login screen

### Phase 2: Core Screens (Week 2)

1. Dashboard screen (complete with all widgets)
2. Patients list + detail screen
3. Navigation bar component
4. Profile dropdown menu
5. Notification panel

### Phase 3: Analysis & Safety (Week 3)

1. Analyze page (multi-agent selection)
2. Upload interface
3. Processing screen with animations
4. Results screen with charts
5. Safety page (drug checker)

### Phase 4: Insights & Settings (Week 4)

1. Insights page with tabs
2. Charts implementation
3. Settings page (all 11 sections)
4. AI Configuration page (6 tabs)
5. Team Collaboration page

### Phase 5: Polish & Optimization (Week 5)

1. Animations refinement
2. Performance optimization
3. Accessibility audit
4. Documentation completion
5. Final testing

---

## 🧠 Developer Instruction Prompt

**Copy and paste this to a developer or AI code generator:**

"""
Build a React Native CLI mobile application that is a pixel-perfect replica of the Medical AI Platform web frontend.

**Requirements:**

1. Use React Native CLI (not Expo)
2. Implement all 9 screens: Dashboard, Patients, Analyze, Safety, Insights, Profile, Settings, AI Configuration, Team Collaboration
3. Bottom tab navigation (5 tabs): Dashboard, Patients, Analyze (primary CTA with gradient), Safety, Insights
4. Dark theme only using the exact color palette specified in MOBILE_APP_FRONTEND_PROMPT.md
5. Use Lucide React Native icons throughout
6. Victory Native for charts
7. Framer Motion equivalent with Reanimated 3 + Moti
8. Mock data from JSON fixtures (no API calls)
9. Follow the component library specifications exactly
10. Match web design system: Tailwind colors, spacing, typography, shadows
11. Implement all micro-interactions and animations described
12. Create reusable components: StatusBadge, StatCard, ToggleSwitch, RangeSlider, ProgressIndicator, TimelineItem, BottomSheet, GradientCard
13. Set up ThemeProvider with darkTheme config
14. Implement AuthContext, NotificationContext
15. Use feature-based folder structure
16. Include README with full setup instructions
17. Provide mock data JSON files for: patients, diagnoses, activities, notifications, team members

Follow every detail in the MOBILE_APP_FRONTEND_PROMPT.md specification document. This is a 1:1 replication of the existing web UI adapted for mobile interaction patterns.
"""

---

**This specification replaces all previous versions. Use this as the single source of truth for building the mobile app.**
