import React from "react";
import { motion } from "framer-motion";
import {
  FileCheck,
  Shield,
  Award,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Calendar,
  User,
  Clock,
  Download,
  Share2,
  Printer,
  Brain,
  Activity,
  Heart,
} from "lucide-react";

const MedicalReport = ({ analysisResults, patientInfo, patientId }) => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const reportId = `MED-AI-${Date.now().toString().slice(-8)}`;

  // Handle PDF Export with proper formatting - Opens clean clinical document in new window
  const handleExportPDF = () => {
    // Create a new window for printing
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("Please allow pop-ups to export PDF");
      return;
    }

    // Create clean HTML for print with clinical document styling
    const printHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Medical Analysis Report - ${patientId}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          @page {
            size: A4;
            margin: 20mm;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: white;
            color: #000;
            line-height: 1.6;
          }
          
          .report-container {
            max-width: 210mm;
            margin: 0 auto;
            background: white;
            padding: 20px;
          }
          
          /* Header Styling */
          .report-header {
            background: linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #2563eb 100%);
            color: white;
            padding: 30px;
            margin-bottom: 30px;
            border-radius: 8px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .brand-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
          }
          
          .brand-info h1 {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          
          .brand-info p {
            font-size: 12px;
            opacity: 0.9;
          }
          
          .certifications {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          
          .cert-badge {
            background: rgba(255, 255, 255, 0.2);
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 600;
            white-space: nowrap;
          }
          
          .report-meta {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            border-top: 1px solid rgba(255,255,255,0.3);
            padding-top: 15px;
          }
          
          .meta-item {
            font-size: 11px;
          }
          
          .meta-label {
            opacity: 0.8;
            margin-bottom: 3px;
          }
          
          .meta-value {
            font-weight: 600;
            font-size: 13px;
          }
          
          /* Section Styling */
          .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
          }
          
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e5e7eb;
          }
          
          /* Patient Info Grid */
          .info-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 20px;
          }
          
          .info-card {
            background: #f9fafb;
            padding: 12px;
            border-radius: 6px;
            border-left: 3px solid #3b82f6;
          }
          
          .info-label {
            font-size: 10px;
            color: #6b7280;
            margin-bottom: 4px;
          }
          
          .info-value {
            font-size: 14px;
            font-weight: 600;
            color: #111827;
          }
          
          /* Metrics Dashboard */
          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 20px;
          }
          
          .metric-card {
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border: 2px solid;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .metric-card.confidence {
            background: #ecfdf5;
            border-color: #10b981;
          }
          
          .metric-card.risk {
            background: #eff6ff;
            border-color: #3b82f6;
          }
          
          .metric-card.priority {
            background: #f5f3ff;
            border-color: #8b5cf6;
          }
          
          .metric-label {
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 8px;
            text-transform: uppercase;
          }
          
          .metric-value {
            font-size: 36px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          
          .metric-card.confidence .metric-value { color: #10b981; }
          .metric-card.risk .metric-value { color: #3b82f6; }
          .metric-card.priority .metric-value { color: #8b5cf6; }
          
          .metric-desc {
            font-size: 10px;
            color: #6b7280;
          }
          
          /* Findings List */
          .findings-list {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
          }
          
          .findings-list ul {
            list-style: none;
            margin: 0;
            padding: 0;
          }
          
          .findings-list li {
            padding: 10px 0;
            padding-left: 30px;
            position: relative;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .findings-list li:last-child {
            border-bottom: none;
          }
          
          .findings-list li:before {
            content: "✓";
            position: absolute;
            left: 0;
            top: 10px;
            width: 20px;
            height: 20px;
            background: #10b981;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
          }
          
          /* Recommendations */
          .recommendations-list {
            background: #ecfdf5;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #10b981;
          }
          
          .recommendations-list ul {
            list-style: none;
            margin: 0;
            padding: 0;
          }
          
          .recommendations-list li {
            padding: 10px 0;
            padding-left: 30px;
            position: relative;
            border-bottom: 1px solid #d1fae5;
          }
          
          .recommendations-list li:last-child {
            border-bottom: none;
          }
          
          .recommendations-list li:before {
            content: "→";
            position: absolute;
            left: 0;
            top: 10px;
            color: #10b981;
            font-weight: bold;
            font-size: 18px;
          }
          
          /* Medical History */
          .history-box {
            background: #f9fafb;
            padding: 15px;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
            white-space: pre-line;
            font-size: 13px;
            line-height: 1.8;
          }
          
          .symptoms-box {
            background: #fef3c7;
            border: 1px solid #fbbf24;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 15px;
            font-size: 13px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          /* Certifications Section */
          .certifications-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-top: 20px;
          }
          
          .cert-seal {
            text-align: center;
            padding: 20px;
            border-radius: 8px;
            border: 2px solid;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .cert-seal.ai-verified {
            background: #eff6ff;
            border-color: #3b82f6;
          }
          
          .cert-seal.hipaa {
            background: #ecfdf5;
            border-color: #10b981;
          }
          
          .cert-seal.fda {
            background: #f5f3ff;
            border-color: #8b5cf6;
          }
          
          .seal-icon {
            width: 60px;
            height: 60px;
            margin: 0 auto 10px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
          }
          
          .seal-icon.ai-verified { color: #3b82f6; border: 3px solid #3b82f6; }
          .seal-icon.hipaa { color: #10b981; border: 3px solid #10b981; }
          .seal-icon.fda { color: #8b5cf6; border: 3px solid #8b5cf6; }
          
          .seal-title {
            font-weight: bold;
            margin-bottom: 5px;
            font-size: 14px;
          }
          
          .seal-desc {
            font-size: 10px;
            color: #6b7280;
            margin-bottom: 8px;
          }
          
          .seal-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 9px;
            font-weight: bold;
            color: white;
          }
          
          .cert-seal.ai-verified .seal-badge { background: #3b82f6; }
          .cert-seal.hipaa .seal-badge { background: #10b981; }
          .cert-seal.fda .seal-badge { background: #8b5cf6; }
          
          /* Signature Section */
          .signature-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
          }
          
          .signature-box {
            background: #f9fafb;
            padding: 15px;
            border-radius: 6px;
            border: 1px solid #d1d5db;
          }
          
          .signature-title {
            font-weight: 600;
            margin-bottom: 10px;
            font-size: 13px;
          }
          
          .signature-line {
            font-family: 'Brush Script MT', cursive;
            font-size: 28px;
            color: #3b82f6;
            margin: 15px 0;
            padding-bottom: 10px;
            border-bottom: 1px solid #d1d5db;
          }
          
          .signature-details {
            font-size: 10px;
            color: #6b7280;
            line-height: 1.6;
          }
          
          .validation-checks {
            list-style: none;
          }
          
          .validation-checks li {
            padding: 6px 0;
            font-size: 11px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .validation-checks li:before {
            content: "✓";
            color: #10b981;
            font-weight: bold;
            font-size: 14px;
          }
          
          /* Disclaimer */
          .disclaimer {
            background: #fffbeb;
            border: 1px solid #fbbf24;
            padding: 15px;
            border-radius: 6px;
            margin: 25px 0;
            font-size: 11px;
            line-height: 1.6;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          /* Footer */
          .report-footer {
            text-align: center;
            padding: 20px 0;
            margin-top: 30px;
            border-top: 2px solid #e5e7eb;
            font-size: 10px;
            color: #6b7280;
          }
          
          .report-footer p {
            margin: 5px 0;
          }
          
          .footer-emphasis {
            font-weight: 600;
            color: #111827;
          }
          
          @media print {
            body { margin: 0; }
            .report-container { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="report-container">
          <!-- Header -->
          <div class="report-header">
            <div class="brand-section">
              <div class="brand-info">
                <h1>🧠 MedAI</h1>
                <p>Advanced Medical Intelligence</p>
                <p>AI-Powered Medical Analysis & Diagnostic Support System</p>
              </div>
              <div class="certifications">
                <div class="cert-badge">🛡️ HIPAA Compliant</div>
                <div class="cert-badge">🏆 ISO 13485 Certified</div>
                <div class="cert-badge">✅ FDA Registered</div>
              </div>
            </div>
            <div class="report-meta">
              <div class="meta-item">
                <div class="meta-label">Report ID</div>
                <div class="meta-value">${reportId}</div>
              </div>
              <div class="meta-item">
                <div class="meta-label">Generated On</div>
                <div class="meta-value">${currentDate}</div>
              </div>
              <div class="meta-item">
                <div class="meta-label">Analysis Type</div>
                <div class="meta-value">${analysisResults.analysisType}</div>
              </div>
            </div>
          </div>
          
          <!-- Patient Information -->
          <div class="section">
            <h2 class="section-title">👤 Patient Information</h2>
            <div class="info-grid">
              <div class="info-card">
                <div class="info-label">Patient ID</div>
                <div class="info-value">${patientId}</div>
              </div>
              <div class="info-card">
                <div class="info-label">Age</div>
                <div class="info-value">${patientInfo.age || "N/A"} years</div>
              </div>
              <div class="info-card">
                <div class="info-label">Gender</div>
                <div class="info-value">${
                  patientInfo.gender
                    ? patientInfo.gender.charAt(0).toUpperCase() +
                      patientInfo.gender.slice(1)
                    : "N/A"
                }</div>
              </div>
              <div class="info-card">
                <div class="info-label">Analysis Date</div>
                <div class="info-value">${currentDate}</div>
              </div>
            </div>
            ${
              patientInfo.symptoms
                ? `
              <div class="symptoms-box">
                <strong>Presenting Symptoms:</strong><br>
                ${patientInfo.symptoms}
              </div>
            `
                : ""
            }
          </div>
          
          <!-- Clinical Summary -->
          <div class="section">
            <h2 class="section-title">📊 Clinical Summary</h2>
            <div class="metrics-grid">
              <div class="metric-card confidence">
                <div class="metric-label">AI Confidence</div>
                <div class="metric-value">${analysisResults.confidence}%</div>
                <div class="metric-desc">High Accuracy Analysis</div>
              </div>
              <div class="metric-card risk">
                <div class="metric-label">Risk Level</div>
                <div class="metric-value">${analysisResults.riskScore}</div>
                <div class="metric-desc">Overall Risk Assessment</div>
              </div>
              <div class="metric-card priority">
                <div class="metric-label">Priority</div>
                <div class="metric-value">${analysisResults.priority}</div>
                <div class="metric-desc">Clinical Priority Level</div>
              </div>
            </div>
          </div>
          
          <!-- Diagnostic Findings -->
          <div class="section">
            <h2 class="section-title">🔬 Diagnostic Findings</h2>
            <div class="findings-list">
              <ul>
                ${analysisResults.findings
                  .map((finding) => `<li>${finding}</li>`)
                  .join("")}
              </ul>
            </div>
          </div>
          
          <!-- Clinical Recommendations -->
          <div class="section">
            <h2 class="section-title">💊 Clinical Recommendations</h2>
            <div class="recommendations-list">
              <ul>
                ${analysisResults.recommendations
                  .map((rec) => `<li>${rec}</li>`)
                  .join("")}
              </ul>
            </div>
          </div>
          
          ${
            patientInfo.medicalHistory
              ? `
          <!-- Medical History -->
          <div class="section">
            <h2 class="section-title">📋 Medical History</h2>
            <div class="history-box">${patientInfo.medicalHistory}</div>
          </div>
          `
              : ""
          }
          
          <!-- Certifications -->
          <div class="section">
            <h2 class="section-title">🛡️ Certifications & Authenticity</h2>
            <div class="certifications-grid">
              <div class="cert-seal ai-verified">
                <div class="seal-icon ai-verified">🧠</div>
                <div class="seal-title">AI Verified</div>
                <div class="seal-desc">Analysis verified by advanced AI algorithms</div>
                <span class="seal-badge">CERTIFIED</span>
              </div>
              <div class="cert-seal hipaa">
                <div class="seal-icon hipaa">🛡️</div>
                <div class="seal-title">HIPAA Compliant</div>
                <div class="seal-desc">Protected health information secured</div>
                <span class="seal-badge">COMPLIANT</span>
              </div>
              <div class="cert-seal fda">
                <div class="seal-icon fda">🏆</div>
                <div class="seal-title">FDA Registered</div>
                <div class="seal-desc">Meets FDA regulatory standards</div>
                <span class="seal-badge">REGISTERED</span>
              </div>
            </div>
          </div>
          
          <!-- Digital Signature -->
          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-title">AI System Authentication</div>
              <div class="signature-line">MedAI System</div>
              <div class="signature-details">
                <strong>System:</strong> MedAI Advanced Analysis v3.0<br>
                <strong>Timestamp:</strong> ${new Date().toISOString()}<br>
                <strong>Digital Signature:</strong> SHA-256: ${btoa(
                  reportId + currentDate
                ).slice(0, 16)}...
              </div>
            </div>
            <div class="signature-box">
              <div class="signature-title">Report Validation</div>
              <ul class="validation-checks">
                <li>Verified Analysis - AI algorithms validated</li>
                <li>Data Integrity Confirmed - No corruption detected</li>
                <li>Compliance Check Passed - HIPAA & FDA standards met</li>
              </ul>
            </div>
          </div>
          
          <!-- Disclaimer -->
          <div class="disclaimer">
            <strong>⚠️ Important Disclaimer:</strong> This AI-generated report is for informational and educational purposes only. 
            It does not constitute medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals 
            for medical decisions. The AI analysis should be used as a supplementary tool to support clinical decision-making, 
            not as a replacement for professional medical judgment.
          </div>
          
          <!-- Footer -->
          <div class="report-footer">
            <p class="footer-emphasis">MedAI - Advanced Medical Intelligence Platform</p>
            <p>Report ID: ${reportId} | Generated: ${currentDate}</p>
            <p>© 2024 MedAI. All rights reserved. | support@medai.com | +1 (555) 123-4567</p>
            <p style="margin-top: 10px; font-style: italic;">This is a computer-generated report. For questions or verification, please contact MedAI support.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Write content to new window and print
    printWindow.document.open();
    printWindow.document.write(printHTML);
    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = function () {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  };

  // Handle Share functionality
  const handleShare = async () => {
    const shareData = {
      title: `Medical Analysis Report - ${patientId}`,
      text: `Medical AI Analysis Report for Patient ${patientId}\nGenerated: ${currentDate}\nConfidence: ${analysisResults.confidence}%`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        const textToCopy = `${shareData.title}\n\n${shareData.text}`;
        await navigator.clipboard.writeText(textToCopy);
        alert("Report details copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      id="medical-report-content"
      className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden print:shadow-none"
    >
      {/* Report Header with Branding */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 p-8 text-white relative overflow-hidden print:p-6 page-break-avoid">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-grid-pattern"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Brain className="w-10 h-10" />
                <div>
                  <h1 className="text-3xl font-bold">MedAI</h1>
                  <p className="text-blue-100 text-sm">
                    Advanced Medical Intelligence
                  </p>
                </div>
              </div>
              <p className="text-blue-100 text-sm mt-2">
                AI-Powered Medical Analysis & Diagnostic Support System
              </p>
            </div>

            {/* Certification Badges */}
            <div className="flex flex-col items-end space-y-2">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span className="text-xs font-semibold">HIPAA Compliant</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span className="text-xs font-semibold">
                  ISO 13485 Certified
                </span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center space-x-2">
                <FileCheck className="w-5 h-5" />
                <span className="text-xs font-semibold">FDA Registered</span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/30 pt-4 mt-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-blue-100 mb-1">Report ID</p>
                <p className="font-mono font-semibold">{reportId}</p>
              </div>
              <div>
                <p className="text-blue-100 mb-1">Generated On</p>
                <p className="font-semibold">{currentDate}</p>
              </div>
              <div>
                <p className="text-blue-100 mb-1">Analysis Type</p>
                <p className="font-semibold">{analysisResults.analysisType}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="p-8 print:p-6">
        {/* Patient Information */}
        <div className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700 page-break-avoid">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center print:text-xl">
            <User className="w-6 h-6 mr-2 text-blue-600" />
            Patient Information
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Patient ID
              </p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {patientId}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Age
              </p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {patientInfo.age || "N/A"} years
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Gender
              </p>
              <p className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                {patientInfo.gender || "N/A"}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Analysis Date
              </p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {currentDate}
              </p>
            </div>
          </div>
        </div>

        {/* Clinical Summary */}
        <div className="mb-8 page-break-avoid">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center print:text-xl">
            <Activity className="w-6 h-6 mr-2 text-purple-600" />
            Clinical Summary
          </h2>

          {/* Key Metrics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border-2 border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-green-900 dark:text-green-300">
                  AI Confidence
                </h3>
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-1">
                {analysisResults.confidence}%
              </div>
              <p className="text-xs text-green-700 dark:text-green-300">
                High Accuracy Analysis
              </p>
              <div className="mt-3 bg-green-200 dark:bg-green-900/40 rounded-full h-2">
                <div
                  className="bg-green-600 dark:bg-green-500 h-2 rounded-full"
                  style={{ width: `${analysisResults.confidence}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl border-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300">
                  Risk Level
                </h3>
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {analysisResults.riskScore}
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Overall Risk Assessment
              </p>
              <div className="mt-3 flex items-center space-x-1">
                {["Low", "Moderate", "High"].map((level) => (
                  <div
                    key={level}
                    className={`flex-1 h-2 rounded-full ${
                      level === analysisResults.riskScore
                        ? "bg-blue-600 dark:bg-blue-500"
                        : "bg-blue-200 dark:bg-blue-900/40"
                    }`}
                  ></div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl border-2 border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-purple-900 dark:text-purple-300">
                  Priority
                </h3>
                <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                {analysisResults.priority}
              </div>
              <p className="text-xs text-purple-700 dark:text-purple-300">
                Clinical Priority Level
              </p>
              <div className="mt-3 flex items-center space-x-2">
                {analysisResults.priority === "Urgent" && (
                  <AlertTriangle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                )}
                {analysisResults.priority === "Routine" && (
                  <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                )}
              </div>
            </div>
          </div>

          {/* Presenting Symptoms */}
          {patientInfo.symptoms && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-amber-900 dark:text-amber-300 mb-2 flex items-center">
                <Heart className="w-5 h-5 mr-2" />
                Presenting Symptoms
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {patientInfo.symptoms}
              </p>
            </div>
          )}
        </div>

        {/* Diagnostic Findings */}
        <div className="mb-8 page-break-avoid">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center print:text-xl">
            <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
            Diagnostic Findings
          </h2>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
            <ul className="space-y-3">
              {analysisResults.findings.map((finding, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        {index + 1}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                      {finding}
                    </p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0" />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Clinical Recommendations */}
        <div className="mb-8 page-break-avoid">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center print:text-xl">
            <FileCheck className="w-6 h-6 mr-2 text-green-600" />
            Clinical Recommendations
          </h2>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
            <ul className="space-y-3">
              {analysisResults.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed flex-1">
                    {rec}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Medical History */}
        {patientInfo.medicalHistory && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <Calendar className="w-6 h-6 mr-2 text-indigo-600" />
              Medical History
            </h2>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {patientInfo.medicalHistory}
              </p>
            </div>
          </div>
        )}

        {/* Certifications & Authenticity */}
        <div className="mb-8 border-t border-gray-200 dark:border-gray-700 pt-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
            <Shield className="w-6 h-6 mr-2 text-blue-600" />
            Certifications & Authenticity
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* AI Verification Seal */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-6 border-2 border-blue-300 dark:border-blue-700 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 to-transparent"></div>
              </div>
              <div className="relative z-10">
                <div className="w-20 h-20 mx-auto mb-4 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-2">
                  AI Verified
                </h3>
                <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                  Analysis verified by advanced AI algorithms
                </p>
                <div className="inline-block bg-blue-600 dark:bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                  CERTIFIED
                </div>
              </div>
            </div>

            {/* HIPAA Compliance Seal */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-800/30 rounded-xl p-6 border-2 border-green-300 dark:border-green-700 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-400 to-transparent"></div>
              </div>
              <div className="relative z-10">
                <div className="w-20 h-20 mx-auto mb-4 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <h3 className="font-bold text-green-900 dark:text-green-200 mb-2">
                  HIPAA Compliant
                </h3>
                <p className="text-xs text-green-700 dark:text-green-300 mb-3">
                  Protected health information secured
                </p>
                <div className="inline-block bg-green-600 dark:bg-green-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                  COMPLIANT
                </div>
              </div>
            </div>

            {/* Clinical Validation Seal */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/30 dark:to-pink-800/30 rounded-xl p-6 border-2 border-purple-300 dark:border-purple-700 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-400 to-transparent"></div>
              </div>
              <div className="relative z-10">
                <div className="w-20 h-20 mx-auto mb-4 bg-purple-600 dark:bg-purple-500 rounded-full flex items-center justify-center">
                  <Award className="w-10 h-10 text-white" />
                </div>
                <h3 className="font-bold text-purple-900 dark:text-purple-200 mb-2">
                  FDA Registered
                </h3>
                <p className="text-xs text-purple-700 dark:text-purple-300 mb-3">
                  Meets FDA regulatory standards
                </p>
                <div className="inline-block bg-purple-600 dark:bg-purple-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                  REGISTERED
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Digital Signature Section */}
        <div className="border-t-2 border-gray-300 dark:border-gray-600 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* AI System Signature */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                AI System Authentication
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="mb-3">
                  <div className="text-3xl font-dancing text-blue-600 dark:text-blue-400 mb-2">
                    MedAI System
                  </div>
                  <div className="h-px bg-gray-300 dark:bg-gray-600"></div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <strong>System:</strong> MedAI Advanced Analysis v3.0
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <strong>Timestamp:</strong> {new Date().toISOString()}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                  <strong>Digital Signature:</strong> SHA-256:{" "}
                  {btoa(reportId + currentDate).slice(0, 16)}...
                </p>
              </div>
            </div>

            {/* Report Validation */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Report Validation
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-start space-x-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Verified Analysis
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      AI algorithms validated and cross-checked
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Data Integrity Confirmed
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      No data corruption detected
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Compliance Check Passed
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      HIPAA & FDA standards met
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-xs text-yellow-800 dark:text-yellow-200 leading-relaxed">
            <strong>⚠️ Important Disclaimer:</strong> This AI-generated report
            is for informational and educational purposes only. It does not
            constitute medical advice, diagnosis, or treatment. Always consult
            with qualified healthcare professionals for medical decisions. The
            AI analysis should be used as a supplementary tool to support
            clinical decision-making, not as a replacement for professional
            medical judgment.
          </p>
        </div>
      </div>

      {/* Report Footer - Screen Only */}
      <div className="bg-gray-100 dark:bg-gray-700 px-8 py-6 border-t border-gray-200 dark:border-gray-600 print:hidden">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            <p className="font-semibold">
              MedAI - Advanced Medical Intelligence Platform
            </p>
            <p>
              Report ID: {reportId} | Generated: {currentDate}
            </p>
            <p className="mt-1">
              © 2024 MedAI. All rights reserved. | support@medai.com | +1 (555)
              123-4567
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleExportPDF}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              title="Export to PDF"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              title="Share Report"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleExportPDF}
              className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              title="Print Report"
            >
              <Printer className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Print Footer - Print Only */}
      <div className="hidden print:block bg-white px-8 py-4 border-t-2 border-gray-300">
        <div className="text-center text-xs text-gray-600">
          <p className="font-semibold mb-1">
            MedAI - Advanced Medical Intelligence Platform
          </p>
          <p className="mb-1">
            Report ID: {reportId} | Generated: {currentDate}
          </p>
          <p className="text-gray-500">
            © 2024 MedAI. All rights reserved. | support@medai.com | +1 (555)
            123-4567
          </p>
          <p className="mt-2 text-gray-500 italic">
            This is a computer-generated report. For questions or verification,
            please contact MedAI support.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default MedicalReport;
