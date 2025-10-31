import React from 'react';

const AgentDrugInteraction = () => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-4 text-red-700">Drug Interaction Agent (Real-time Checking)</h1>
    <p className="mb-6 text-gray-700">
      This agent performs real-time drug interaction checks, allergy validation, and dosage recommendations. It uses a large drug database and pharmacogenomics for safety alerts and personalized therapy.
    </p>
    <ul className="list-disc ml-8 mb-6 text-gray-800">
      <li>Check for drug-drug and drug-allergy interactions</li>
      <li>Pharmacogenomic analysis for personalized dosing</li>
      <li>Real-time safety alerts and contraindication detection</li>
      <li>Dosage recommendations based on patient profile</li>
      <li>Interactive notebook for advanced drug checking</li>
    </ul>
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
      <h2 className="text-xl font-semibold mb-2 text-red-600">Try it in the interactive notebook:</h2>
      <a
        href="/notebooks/Ultra_Advanced_Drug_Interaction.ipynb"
        className="text-red-700 underline font-medium"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open Ultra_Advanced_Drug_Interaction.ipynb
      </a>
    </div>
  </div>
);

export default AgentDrugInteraction;
