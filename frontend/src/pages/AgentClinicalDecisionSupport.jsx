import React from 'react';

const AgentClinicalDecisionSupport = () => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-4 text-blue-700">Clinical Decision Support Agent</h1>
    <p className="mb-6 text-gray-700">
      This agent provides advanced clinical decision support by integrating patient data, guidelines, and AI-driven recommendations. It leverages FHIR/HL7 standards, risk calculators, and real-time alerts for clinicians.
    </p>
    <ul className="list-disc ml-8 mb-6 text-gray-800">
      <li>AI-powered diagnostic and treatment suggestions</li>
      <li>Guideline-based care pathways</li>
      <li>Risk stratification and predictive analytics</li>
      <li>Real-time clinical alerts and reminders</li>
      <li>Interactive notebook for clinical scenarios</li>
    </ul>
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
      <h2 className="text-xl font-semibold mb-2 text-blue-600">Try it in the interactive notebook:</h2>
      <a
        href="/notebooks/Ultra_Advanced_Clinical_Decision_Support.ipynb"
        className="text-blue-700 underline font-medium"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open Ultra_Advanced_Clinical_Decision_Support.ipynb
      </a>
    </div>
  </div>
);

export default AgentClinicalDecisionSupport;
