"""
🎨 Medical AI Visualization Infrastructure
Shared visualization components for all multi-agent system files
"""

import matplotlib.pyplot as plt
import matplotlib.patches as patches
import seaborn as sns
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import networkx as nx
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import base64
import io
from typing import Dict, List, Any, Optional

class MedicalAIVisualizationEngine:
    """
    Centralized visualization engine for all medical AI agents
    """
    
    def __init__(self):
        self.color_schemes = {
            'medical': ['#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6'],
            'pathology': ['#27AE60', '#F1C40F', '#E67E22', '#E74C3C'],
            'confidence': ['#2C3E50', '#34495E', '#7F8C8D', '#BDC3C7'],
            'risk_levels': {
                'critical': '#C0392B',
                'high': '#E74C3C', 
                'medium': '#F39C12',
                'low': '#27AE60',
                'minimal': '#2ECC71'
            }
        }
        
        # Set default style
        plt.style.use('default')
        sns.set_palette("husl")
        
    def create_agent_performance_dashboard(self, agent_metrics: Dict[str, Any]) -> go.Figure:
        """
        Create real-time agent performance dashboard
        """
        fig = make_subplots(
            rows=2, cols=3,
            subplot_titles=("Agent Response Times", "Confidence Scores", "Success Rates",
                          "Memory Usage", "Processing Queue", "Error Rates"),
            specs=[[{"type": "bar"}, {"type": "scatter"}, {"type": "pie"}],
                   [{"type": "scatter"}, {"type": "bar"}, {"type": "scatter"}]]
        )
        
        agents = list(agent_metrics.keys())
        
        # Agent response times
        response_times = [agent_metrics[agent].get('response_time', 0) for agent in agents]
        fig.add_trace(go.Bar(x=agents, y=response_times, name="Response Time (ms)",
                            marker_color=self.color_schemes['medical']), row=1, col=1)
        
        # Confidence scores over time
        for i, agent in enumerate(agents[:3]):  # Show top 3 agents
            confidence_history = agent_metrics[agent].get('confidence_history', [])
            times = list(range(len(confidence_history)))
            fig.add_trace(go.Scatter(x=times, y=confidence_history, 
                                   name=f"{agent} Confidence",
                                   line=dict(color=self.color_schemes['medical'][i])), 
                         row=1, col=2)
        
        # Success rates pie chart
        success_rates = [agent_metrics[agent].get('success_rate', 0) for agent in agents]
        fig.add_trace(go.Pie(labels=agents, values=success_rates, name="Success Rates"), 
                     row=1, col=3)
        
        # Memory usage
        memory_usage = [agent_metrics[agent].get('memory_mb', 0) for agent in agents]
        fig.add_trace(go.Scatter(x=agents, y=memory_usage, mode='markers+lines',
                               name="Memory (MB)", marker=dict(size=10)), row=2, col=1)
        
        # Processing queue
        queue_sizes = [agent_metrics[agent].get('queue_size', 0) for agent in agents]
        fig.add_trace(go.Bar(x=agents, y=queue_sizes, name="Queue Size",
                            marker_color='orange'), row=2, col=2)
        
        # Error rates
        error_rates = [agent_metrics[agent].get('error_rate', 0) for agent in agents]
        fig.add_trace(go.Scatter(x=agents, y=error_rates, mode='markers+lines',
                               name="Error Rate (%)", line=dict(color='red')), row=2, col=3)
        
        fig.update_layout(
            title_text="🤖 Multi-Agent System Performance Dashboard",
            showlegend=False,
            height=800
        )
        
        return fig
        
    def create_medical_network_graph(self, connections: Dict[str, List[str]], 
                                   node_data: Dict[str, Dict]) -> go.Figure:
        """
        Create network graph showing connections between medical entities
        """
        G = nx.Graph()
        
        # Add nodes
        for node, data in node_data.items():
            G.add_node(node, **data)
            
        # Add edges
        for source, targets in connections.items():
            for target in targets:
                if target in node_data:
                    G.add_edge(source, target)
        
        # Calculate layout
        pos = nx.spring_layout(G, k=3, iterations=50)
        
        # Create edge traces
        edge_x = []
        edge_y = []
        for edge in G.edges():
            x0, y0 = pos[edge[0]]
            x1, y1 = pos[edge[1]]
            edge_x.extend([x0, x1, None])
            edge_y.extend([y0, y1, None])
            
        edge_trace = go.Scatter(x=edge_x, y=edge_y,
                              line=dict(width=2, color='#888'),
                              hoverinfo='none',
                              mode='lines')
        
        # Create node traces
        node_x = []
        node_y = []
        node_text = []
        node_colors = []
        node_sizes = []
        
        for node in G.nodes():
            x, y = pos[node]
            node_x.append(x)
            node_y.append(y)
            
            node_info = G.nodes[node]
            node_text.append(f"{node}<br>Type: {node_info.get('type', 'Unknown')}")
            
            # Color by type
            node_type = node_info.get('type', 'default')
            type_colors = {
                'agent': '#3498DB',
                'notebook': '#E74C3C', 
                'database': '#2ECC71',
                'api': '#F39C12',
                'model': '#9B59B6'
            }
            node_colors.append(type_colors.get(node_type, '#95A5A6'))
            
            # Size by importance
            importance = node_info.get('importance', 1)
            node_sizes.append(20 + importance * 10)
        
        node_trace = go.Scatter(x=node_x, y=node_y,
                              mode='markers+text',
                              hoverinfo='text',
                              text=[node for node in G.nodes()],
                              textposition="middle center",
                              hovertext=node_text,
                              marker=dict(size=node_sizes,
                                        color=node_colors,
                                        line=dict(width=2)))
        
        fig = go.Figure(data=[edge_trace, node_trace],
                       layout=go.Layout(
                            title='🔗 Medical AI System Network Architecture',
                            showlegend=False,
                            hovermode='closest',
                            margin=dict(b=20,l=5,r=5,t=40),
                            xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
                            yaxis=dict(showgrid=False, zeroline=False, showticklabels=False)))
        
        return fig
        
    def create_real_time_analysis_chart(self, analysis_data: List[Dict]) -> go.Figure:
        """
        Create real-time analysis visualization
        """
        fig = go.Figure()
        
        # Process analysis data
        timestamps = [datetime.fromisoformat(item['timestamp']) for item in analysis_data]
        confidence_scores = [item['confidence'] for item in analysis_data]
        analysis_types = [item['type'] for item in analysis_data]
        
        # Group by analysis type
        type_groups = {}
        for i, analysis_type in enumerate(analysis_types):
            if analysis_type not in type_groups:
                type_groups[analysis_type] = {'timestamps': [], 'confidences': []}
            type_groups[analysis_type]['timestamps'].append(timestamps[i])
            type_groups[analysis_type]['confidences'].append(confidence_scores[i])
        
        # Add traces for each analysis type
        colors = self.color_schemes['medical']
        for i, (analysis_type, data) in enumerate(type_groups.items()):
            fig.add_trace(go.Scatter(
                x=data['timestamps'],
                y=data['confidences'],
                mode='lines+markers',
                name=f"{analysis_type} Analysis",
                line=dict(color=colors[i % len(colors)], width=3),
                marker=dict(size=8)
            ))
        
        fig.update_layout(
            title='📈 Real-Time Medical Analysis Confidence Tracking',
            xaxis_title='Time',
            yaxis_title='Confidence Score',
            yaxis=dict(range=[0, 1]),
            hovermode='x unified',
            width=900,
            height=500
        )
        
        return fig
        
    def create_medical_heatmap(self, data_matrix: np.ndarray, 
                             row_labels: List[str], 
                             col_labels: List[str],
                             title: str = "Medical Data Heatmap") -> plt.Figure:
        """
        Create medical data heatmap with proper styling
        """
        fig, ax = plt.subplots(figsize=(12, 8))
        
        # Create heatmap
        im = ax.imshow(data_matrix, cmap='RdYlGn', aspect='auto', vmin=0, vmax=1)
        
        # Set ticks and labels
        ax.set_xticks(np.arange(len(col_labels)))
        ax.set_yticks(np.arange(len(row_labels)))
        ax.set_xticklabels(col_labels, rotation=45, ha='right')
        ax.set_yticklabels(row_labels)
        
        # Add colorbar
        cbar = plt.colorbar(im)
        cbar.set_label('Score', rotation=270, labelpad=15)
        
        # Add text annotations
        for i in range(len(row_labels)):
            for j in range(len(col_labels)):
                text = ax.text(j, i, f'{data_matrix[i, j]:.2f}',
                             ha="center", va="center",
                             color="white" if data_matrix[i, j] < 0.5 else "black",
                             fontweight='bold')
        
        plt.title(title, fontsize=16, fontweight='bold', pad=20)
        plt.tight_layout()
        return fig
        
    def save_chart_as_base64(self, fig) -> str:
        """
        Convert matplotlib or plotly figure to base64 string
        """
        if hasattr(fig, 'to_html'):  # Plotly figure
            return fig.to_html(include_plotlyjs='cdn')
        else:  # Matplotlib figure
            buffer = io.BytesIO()
            fig.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
            buffer.seek(0)
            image_png = buffer.getvalue()
            buffer.close()
            
            graphic = base64.b64encode(image_png)
            graphic = graphic.decode('utf-8')
            return f"data:image/png;base64,{graphic}"
    
    def create_patient_timeline_viz(self, patient_events: List[Dict]) -> go.Figure:
        """
        Create patient timeline visualization
        """
        fig = go.Figure()
        
        # Sort events by timestamp
        sorted_events = sorted(patient_events, key=lambda x: x['timestamp'])
        
        timestamps = [datetime.fromisoformat(event['timestamp']) for event in sorted_events]
        event_types = [event['type'] for event in sorted_events]
        descriptions = [event['description'] for event in sorted_events]
        
        # Create timeline
        for i, (timestamp, event_type, description) in enumerate(zip(timestamps, event_types, descriptions)):
            color = self.color_schemes['risk_levels'].get(event_type, '#3498DB')
            
            fig.add_trace(go.Scatter(
                x=[timestamp],
                y=[i],
                mode='markers+text',
                marker=dict(size=15, color=color),
                text=description,
                textposition="middle right" if i % 2 == 0 else "middle left",
                name=event_type,
                showlegend=False,
                hovertemplate=f"<b>{description}</b><br>{timestamp}<br>Type: {event_type}<extra></extra>"
            ))
        
        fig.update_layout(
            title='📅 Patient Medical Timeline',
            xaxis_title='Date/Time',
            yaxis_title='Events',
            yaxis=dict(showticklabels=False),
            height=max(400, len(patient_events) * 30),
            showlegend=False
        )
        
        return fig

# Global visualization engine instance
medical_viz = MedicalAIVisualizationEngine()