import React from 'react';

const AgentPrecisionMedicine = () => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-4 text-green-700">Precision Medicine Agent</h1>
    <p className="mb-6 text-gray-700">
      This agent delivers personalized medicine by analyzing genomics, pharmacogenomics, and patient-specific data. It supports tailored therapies, rare disease insights, and advanced risk prediction.
    </p>
    <ul className="list-disc ml-8 mb-6 text-gray-800">
      <li>Genomic and pharmacogenomic analysis</li>
      <li>Personalized drug recommendations</li>
      <li>Rare disease detection and management</li>
      <li>Advanced risk prediction models</li>
      <li>Interactive notebook for precision medicine</li>
    </ul>
    <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
      <h2 className="text-xl font-semibold mb-2 text-green-600">Try it in the interactive notebook:</h2>
      <a
        href="/notebooks/Ultra_Advanced_Precision_Medicine.ipynb"
        className="text-green-700 underline font-medium"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open Ultra_Advanced_Precision_Medicine.ipynb
      </a>
    </div>
  </div>
);

export default AgentPrecisionMedicine;
