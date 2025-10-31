import React from 'react';

const AgentResearch = () => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-4 text-purple-700">Research Agent (Clinical Trials & Evidence)</h1>
    <p className="mb-6 text-gray-700">
      This agent searches medical literature, synthesizes evidence, and matches patients to clinical trials. It integrates PubMed, clinical guidelines, and real-world evidence for advanced research support.
    </p>
    <ul className="list-disc ml-8 mb-6 text-gray-800">
      <li>Search and summarize latest medical research</li>
      <li>Match patients to relevant clinical trials</li>
      <li>Integrate clinical guidelines and systematic reviews</li>
      <li>Evidence-based recommendations for rare conditions</li>
      <li>Interactive notebook for research synthesis</li>
    </ul>
    <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-6">
      <h2 className="text-xl font-semibold mb-2 text-purple-600">Try it in the interactive notebook:</h2>
      <a
        href="/notebooks/Ultra_Advanced_Research.ipynb"
        className="text-purple-700 underline font-medium"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open Ultra_Advanced_Research.ipynb
      </a>
    </div>
  </div>
);

export default AgentResearch;
