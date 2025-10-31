#!/usr/bin/env python3
"""
📊 Multi-Agent Medical AI Visualization Demo
Generate comprehensive visualizations from the multi-agent system analysis
"""

import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
import seaborn as sns
from datetime import datetime, timedelta
import pandas as pd
import json
import sys
import os

# Set style for professional medical charts
plt.style.use('default')
sns.set_palette("husl")

class MultiAgentVisualizationDemo:
    def __init__(self):
        self.demo_results = {
            "patient_info": {
                "name": "John Doe",
                "age": 65,
                "gender": "Male"
            },
            "image_analysis": {
                "cardiomegaly": {"confidence": 0.87, "severity": "Moderate"},
                "pulmonary_edema": {"confidence": 0.73, "severity": "Mild"},
                "pleural_effusion": {"confidence": 0.23, "severity": "None"}
            },
            "drug_safety": {
                "safety_score": 0.85,
                "interactions": ["Lisinopril-Aspirin"],
                "adherence": 0.85
            },
            "clinical_decision": {
                "diagnosis": "NSTEMI",
                "confidence": 0.78,
                "mortality_risk": 0.081,
                "treatments": ["Dual Antiplatelet", "Statin", "ACE Inhibitor"]
            },
            "research": {
                "trials_found": 2,
                "match_scores": [0.89, 0.82],
                "publications": 4
            },
            "risk_factors": {
                "HbA1c": 7.2,
                "LDL": 165,
                "BP_systolic": 150,
                "BP_diastolic": 95,
                "eGFR": 75
            }
        }
        
    def create_agent_confidence_radar(self):
        """Create radar chart showing confidence levels of each agent"""
        fig, ax = plt.subplots(figsize=(10, 8), subplot_kw=dict(projection='polar'))
        
        # Agent confidence data
        agents = ['Image\nAnalysis', 'Drug\nSafety', 'Clinical\nDecision', 
                 'Research\nAgent', 'History\nSynthesis', 'Coordination']
        confidences = [0.87, 0.85, 0.78, 0.84, 0.88, 0.84]
        
        # Calculate angles for each agent
        angles = np.linspace(0, 2 * np.pi, len(agents), endpoint=False).tolist()
        confidences += confidences[:1]  # Complete the circle
        angles += angles[:1]
        
        # Plot
        ax.plot(angles, confidences, 'o-', linewidth=2, label='Confidence Scores', color='#2E86AB')
        ax.fill(angles, confidences, alpha=0.25, color='#2E86AB')
        
        # Customize
        ax.set_xticks(angles[:-1])
        ax.set_xticklabels(agents, fontsize=10)
        ax.set_ylim(0, 1)
        ax.set_yticks([0.2, 0.4, 0.6, 0.8, 1.0])
        ax.set_yticklabels(['20%', '40%', '60%', '80%', '100%'])
        ax.grid(True)
        
        plt.title('🤖 Multi-Agent Confidence Levels\nJohn Doe Analysis', 
                 size=16, fontweight='bold', pad=20)
        plt.tight_layout()
        plt.savefig('agent_confidence_radar.png', dpi=300, bbox_inches='tight')
        plt.show()
        
    def create_risk_factor_dashboard(self):
        """Create dashboard showing patient risk factors"""
        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 10))
        
        # 1. Risk Factors Bar Chart
        risk_factors = ['HbA1c\n(%)', 'LDL\n(mg/dL)', 'Systolic BP\n(mmHg)', 'eGFR\n(mL/min)']
        values = [7.2, 165, 150, 75]
        targets = [7.0, 100, 120, 90]  # Target values
        colors = ['#FF6B6B' if v > t else '#4ECDC4' for v, t in zip(values, targets)]
        
        bars = ax1.bar(risk_factors, values, color=colors, alpha=0.8)
        ax1.axhline(y=np.mean(targets), color='green', linestyle='--', alpha=0.7, label='Target Range')
        ax1.set_title('📊 Risk Factor Analysis', fontweight='bold', fontsize=12)
        ax1.set_ylabel('Values')
        
        # Add value labels on bars
        for bar, val in zip(bars, values):
            ax1.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 2, 
                    f'{val}', ha='center', va='bottom', fontweight='bold')
        
        # 2. Image Analysis Findings Pie Chart
        findings = ['Cardiomegaly\n(87%)', 'Pulmonary Edema\n(73%)', 'Normal\n(27%)']
        sizes = [43, 37, 20]  # Approximate percentages
        colors_pie = ['#FF9999', '#FFD700', '#90EE90']
        
        wedges, texts, autotexts = ax2.pie(sizes, labels=findings, colors=colors_pie, 
                                          autopct='%1.1f%%', startangle=90)
        ax2.set_title('🧠 MONAI Image Analysis\nFindings Distribution', fontweight='bold', fontsize=12)
        
        # 3. Drug Safety Matrix
        medications = ['Metformin', 'Lisinopril', 'Aspirin', 'Atorvastatin']
        safety_matrix = np.array([[1.0, 0.9, 0.95, 0.98],
                                 [0.9, 1.0, 0.6, 0.95],  # Lisinopril-Aspirin interaction
                                 [0.95, 0.6, 1.0, 0.9],
                                 [0.98, 0.95, 0.9, 1.0]])
        
        im = ax3.imshow(safety_matrix, cmap='RdYlGn', vmin=0.5, vmax=1.0)
        ax3.set_xticks(range(len(medications)))
        ax3.set_yticks(range(len(medications)))
        ax3.set_xticklabels(medications, rotation=45, ha='right')
        ax3.set_yticklabels(medications)
        ax3.set_title('💊 Drug Interaction Matrix\n(Safety Scores)', fontweight='bold', fontsize=12)
        
        # Add text annotations
        for i in range(len(medications)):
            for j in range(len(medications)):
                text = ax3.text(j, i, f'{safety_matrix[i, j]:.2f}',
                               ha="center", va="center", color="black", fontweight='bold')
        
        # 4. Clinical Timeline
        dates = pd.date_range('2019-01-01', '2025-10-11', freq='6M')
        events = ['Previous MI', 'Statin Start', 'ACE Inhibitor', 'Diabetes Dx', 
                 'Stable Period', 'BP Control', 'Lipid Check', 'Current Episode']
        
        ax4.scatter(dates[:len(events)], range(len(events)), 
                   c=['red', 'blue', 'blue', 'orange', 'green', 'blue', 'yellow', 'red'], 
                   s=100, alpha=0.8)
        
        for i, (date, event) in enumerate(zip(dates[:len(events)], events)):
            ax4.text(date, i + 0.1, event, fontsize=9, rotation=15)
            
        ax4.set_ylim(-0.5, len(events) - 0.5)
        ax4.set_title('📋 Medical History Timeline', fontweight='bold', fontsize=12)
        ax4.set_xlabel('Date')
        ax4.tick_params(axis='x', rotation=45)
        
        plt.suptitle('🏥 Multi-Agent Medical Analysis Dashboard\nPatient: John Doe (65M)', 
                    fontsize=16, fontweight='bold')
        plt.tight_layout()
        plt.savefig('medical_dashboard.png', dpi=300, bbox_inches='tight')
        plt.show()
        
    def create_ai_decision_tree(self):
        """Create decision tree visualization for AI reasoning"""
        fig, ax = plt.subplots(figsize=(14, 10))
        
        # Decision nodes
        nodes = {
            'root': {'pos': (0.5, 0.9), 'text': '🤖 AI Analysis\nInitiation', 'color': '#E8F4FD'},
            'imaging': {'pos': (0.2, 0.75), 'text': '🧠 Image Analysis\nCardiomegaly: 87%', 'color': '#FFE6E6'},
            'drugs': {'pos': (0.8, 0.75), 'text': '💊 Drug Safety\nInteraction Found', 'color': '#E6F7FF'},
            'clinical': {'pos': (0.35, 0.6), 'text': '🩺 Clinical Decision\nNSTEMI: 78%', 'color': '#F0F8E6'},
            'research': {'pos': (0.65, 0.6), 'text': '🔬 Research Agent\n2 Trials Found', 'color': '#FFF2E6'},
            'synthesis': {'pos': (0.5, 0.45), 'text': '📋 History Synthesis\nRisk Factors ID', 'color': '#F5E6FF'},
            'coordination': {'pos': (0.5, 0.3), 'text': '🤝 Final Coordination\nIntegrated Analysis', 'color': '#E6FFE6'},
            'diagnosis': {'pos': (0.5, 0.15), 'text': '🎯 FINAL DIAGNOSIS\nAcute Coronary Syndrome\nHigh Risk - Immediate Care', 'color': '#FFD700'}
        }
        
        # Draw connections
        connections = [
            ('root', 'imaging'), ('root', 'drugs'),
            ('imaging', 'clinical'), ('drugs', 'research'),
            ('clinical', 'synthesis'), ('research', 'synthesis'),
            ('synthesis', 'coordination'), ('coordination', 'diagnosis')
        ]
        
        for start, end in connections:
            start_pos = nodes[start]['pos']
            end_pos = nodes[end]['pos']
            ax.annotate('', xy=end_pos, xytext=start_pos,
                       arrowprops=dict(arrowstyle='->', lw=2, color='#666666'))
        
        # Draw nodes
        for node_id, node_info in nodes.items():
            x, y = node_info['pos']
            if node_id == 'diagnosis':
                # Special styling for final diagnosis
                circle = plt.Circle((x, y), 0.08, color=node_info['color'], 
                                  ec='red', lw=3, alpha=0.9)
            else:
                circle = plt.Circle((x, y), 0.06, color=node_info['color'], 
                                  ec='black', lw=1.5, alpha=0.8)
            ax.add_patch(circle)
            
            # Add text
            ax.text(x, y, node_info['text'], ha='center', va='center', 
                   fontsize=9, fontweight='bold', wrap=True)
        
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        ax.set_aspect('equal')
        ax.axis('off')
        
        plt.title('🧠 Multi-Agent AI Decision Process\nReasoning Flow for Patient Analysis', 
                 fontsize=16, fontweight='bold', pad=20)
        plt.tight_layout()
        plt.savefig('ai_decision_tree.png', dpi=300, bbox_inches='tight')
        plt.show()
        
    def create_research_integration_chart(self):
        """Create chart showing research integration and clinical trial matching"""
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 6))
        
        # 1. Clinical Trial Matching Scores
        trials = ['PCSK9 Inhibitors\nPost-MI + Diabetes\nPhase III', 
                 'AI-Guided Cardiac\nRehabilitation\nPhase II']
        match_scores = [89, 82]
        eligibility = [95, 88]
        
        x = np.arange(len(trials))
        width = 0.35
        
        bars1 = ax1.bar(x - width/2, match_scores, width, label='Match Score (%)', 
                       color='#4CAF50', alpha=0.8)
        bars2 = ax1.bar(x + width/2, eligibility, width, label='Eligibility (%)', 
                       color='#2196F3', alpha=0.8)
        
        ax1.set_xlabel('Clinical Trials')
        ax1.set_ylabel('Score (%)')
        ax1.set_title('🔬 Clinical Trial Matching Analysis', fontweight='bold')
        ax1.set_xticks(x)
        ax1.set_xticklabels(trials)
        ax1.legend()
        ax1.set_ylim(0, 100)
        
        # Add value labels on bars
        for bars in [bars1, bars2]:
            for bar in bars:
                height = bar.get_height()
                ax1.text(bar.get_x() + bar.get_width()/2., height + 1,
                        f'{height}%', ha='center', va='bottom', fontweight='bold')
        
        # 2. Research Impact Timeline
        years = ['2022', '2023', '2024', '2025']
        publications = [12, 18, 25, 15]  # Relevant publications per year
        impact_factors = [15.2, 18.5, 22.1, 24.0]  # Average impact factor
        
        ax2_twin = ax2.twinx()
        
        # Bar chart for publications
        bars = ax2.bar(years, publications, alpha=0.7, color='#FF9800', label='Publications Count')
        
        # Line chart for impact factor
        line = ax2_twin.plot(years, impact_factors, color='#E91E63', marker='o', 
                           linewidth=3, markersize=8, label='Avg Impact Factor')
        
        ax2.set_xlabel('Year')
        ax2.set_ylabel('Publication Count', color='#FF9800')
        ax2_twin.set_ylabel('Average Impact Factor', color='#E91E63')
        ax2.set_title('📚 Research Evidence Integration\nRelevant Literature Analysis', fontweight='bold')
        
        # Add legends
        ax2.legend(loc='upper left')
        ax2_twin.legend(loc='upper right')
        
        plt.tight_layout()
        plt.savefig('research_integration.png', dpi=300, bbox_inches='tight')
        plt.show()
        
    def generate_all_visualizations(self):
        """Generate all visualization charts"""
        print("🎨 Generating Multi-Agent Medical AI Visualizations...")
        print("=" * 60)
        
        print("📊 1. Creating Agent Confidence Radar Chart...")
        self.create_agent_confidence_radar()
        
        print("📋 2. Creating Medical Dashboard...")
        self.create_risk_factor_dashboard()
        
        print("🧠 3. Creating AI Decision Tree...")
        self.create_ai_decision_tree()
        
        print("🔬 4. Creating Research Integration Charts...")
        self.create_research_integration_chart()
        
        print("\n" + "="*60)
        print("✅ All Visualizations Generated Successfully!")
        print("📁 Files saved:")
        print("   • agent_confidence_radar.png")
        print("   • medical_dashboard.png") 
        print("   • ai_decision_tree.png")
        print("   • research_integration.png")
        print("🎯 Multi-Agent AI Analysis Visualizations Complete!")

def main():
    """Main function to run visualization demo"""
    print("🚀 Starting Multi-Agent Medical AI Visualization Demo...")
    
    # Check if matplotlib is available
    try:
        import matplotlib.pyplot as plt
        import seaborn as sns
        print("✅ Visualization libraries loaded successfully")
    except ImportError as e:
        print(f"❌ Error: {e}")
        print("💡 Please install required packages: pip install matplotlib seaborn")
        return False
    
    # Create and run visualizations
    demo = MultiAgentVisualizationDemo()
    demo.generate_all_visualizations()
    
    return True

if __name__ == "__main__":
    success = main()
    print(f"\n🏆 Visualization Demo Result: {'SUCCESS!' if success else 'Failed - Install Requirements'}")