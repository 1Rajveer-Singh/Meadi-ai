import React from 'react';
import { ArrowRight, Lock, Shield } from 'lucide-react';

const DemoCredentialsSection = ({ onAuthClick }) => {
  const credentials = [
    {
      role: 'AI Radiologist',
      email: 'admin@example.com',
      password: 'admin123',
      icon: <Shield className="w-6 h-6 text-blue-500" />,
      features: [
        'Multi-Agent AI Image Analysis (MONAI)',
        'Explainable AI with Visual Heatmaps',
        'Real-time Drug Interaction Detection',
        'Clinical Trial Research Integration',
        'RAG-based Medical Knowledge'
      ],
      name: 'Dr. Jennifer Martinez',
      specialization: 'AI-Enhanced Radiology'
    },
    {
      role: 'Clinical Physician',
      email: 'doctor@example.com',
      password: 'doctor123',
      icon: <Lock className="w-6 h-6 text-green-600" />,
      features: [
        'History Synthesis Agent (EHR Integration)',
        'Drug Interaction Agent (Real-time)',
        'Patient Record Management',
        'AI-Assisted Diagnosis',
        'Clinical Decision Support'
      ],
      name: 'Dr. Michael Chen',
      specialization: 'AI-Assisted Clinical Medicine'
    },
    {
      role: 'Medical Researcher',
      email: 'researcher@example.com',
      password: 'research123',
      icon: <Shield className="w-6 h-6 text-purple-600" />,
      features: [
        'Research Agent (Clinical Trials)',
        'Rare Disease Research',
        'Medical Evidence Analysis',
        'Adaptive Learning Systems',
        'Advanced Analytics Dashboard'
      ],
      name: 'Dr. Sarah Kim',
      specialization: 'AI Medical Research'
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Try the Demo
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Use these credentials to explore the full functionality of AgenticAI HealthGuard
          </p>
        </div>

        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8 mt-12">
          {credentials.map((cred, index) => (
            <div 
              key={index}
              className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 transform transition-transform hover:scale-105"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  {cred.icon}
                  <div className="ml-3">
                    <h3 className="text-xl font-semibold text-gray-900">{cred.role}</h3>
                    <p className="text-sm text-gray-600">{cred.name}</p>
                    <p className="text-xs text-purple-600 font-medium">{cred.specialization}</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-md p-4 mb-6">
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <span className="text-gray-500 font-medium">Email:</span>
                    <code className="text-indigo-700 font-mono bg-indigo-50 px-2 rounded col-span-2">
                      {cred.email}
                    </code>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-500 font-medium">Password:</span>
                    <code className="text-indigo-700 font-mono bg-indigo-50 px-2 rounded col-span-2">
                      {cred.password}
                    </code>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-3">
                    Access Features:
                  </h4>
                  <ul className="space-y-2">
                    {cred.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-gray-600">
                        <span className="mr-2 text-green-500">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <button
                  onClick={() => onAuthClick('login')}
                  className="flex items-center justify-center w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Login as {cred.role}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <p className="text-gray-500 text-sm">
            Note: These are demonstration accounts with limited permissions.
            <br />All actions are performed in a sandboxed environment.
          </p>
        </div>
      </div>
    </section>
  );
};

export default DemoCredentialsSection;