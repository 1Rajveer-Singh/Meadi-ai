import React from 'react';

const AgentImageAnalysis = () => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-4 text-blue-700">Image Analysis Agent (MONAI + NIH Dataset)</h1>
    <p className="mb-6 text-gray-700">
      This agent leverages deep learning (MONAI) for medical image analysis, supporting X-rays, MRIs, and CT scans. It integrates the NIH Chest X-ray dataset for real-world diagnostics, generates visual heatmaps, and provides confidence scores for findings.
    </p>
    <ul className="list-disc ml-8 mb-6 text-gray-800">
      <li>Upload and analyze DICOM, PNG, or JPEG medical images</li>
      <li>Visualize AI-generated heatmaps and segmentation overlays</li>
      <li>Review confidence scores and abnormality detection</li>
      <li>Download annotated images and reports</li>
      <li>Real-time WebSocket updates for analysis progress</li>
    </ul>
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
      <h2 className="text-xl font-semibold mb-2 text-blue-600">Try it in the interactive notebook:</h2>
      <a
        href="/notebooks/Ultra_Advanced_Image_Analysis.ipynb"
        className="text-blue-700 underline font-medium"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open Ultra_Advanced_Image_Analysis.ipynb
      </a>
    </div>
  </div>
);

export default AgentImageAnalysis;
