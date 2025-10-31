import React from 'react';

const AgentHistorySynthesis = () => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-4 text-green-700">History Synthesis Agent (EHR Integration)</h1>
    <p className="mb-6 text-gray-700">
      This agent analyzes patient medical history, synthesizes timelines, and integrates EHR data using FHIR/HL7 standards. It identifies risk factors, previous diagnoses, and generates a comprehensive clinical summary for decision support.
    </p>
    <ul className="list-disc ml-8 mb-6 text-gray-800">
      <li>Import and analyze structured/unstructured EHR data</li>
      <li>Generate patient history timelines and risk profiles</li>
      <li>Integrate lab results, diagnoses, and medication history</li>
      <li>FHIR and HL7 compatibility for real-world interoperability</li>
      <li>Visualize history synthesis in interactive notebook</li>
    </ul>
    <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
      <h2 className="text-xl font-semibold mb-2 text-green-600">Try it in the interactive notebook:</h2>
      <a
        href="/notebooks/Ultra_Advanced_History_Synthesis.ipynb"
        className="text-green-700 underline font-medium"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open Ultra_Advanced_History_Synthesis.ipynb
      </a>
    </div>
  </div>
);

export default AgentHistorySynthesis;
