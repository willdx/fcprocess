import React, { useState, useEffect, useCallback } from 'react';
import { 
  ReactFlow, 
  ReactFlowProvider, 
  Background, 
  useNodesState, 
  useEdgesState, 
  Node,
  ProOptions,
  useReactFlow,
  DefaultEdgeOptions,
  MarkerType
} from '@xyflow/react';

import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MousePointer2, Eye, Box, ChevronUp, ChevronDown, AlertTriangle, Terminal } from 'lucide-react';
import CustomNode from '../components/CustomNode';
import NoteNode from '../components/NoteNode';
import CustomEdge from '../components/CustomEdge';
import NodeConfigPanel from '../components/NodeConfigPanel';
import CanvasControls from '../components/CanvasControls';
import { getLayoutedElements } from '../utils/layoutUtils';
import { LogEntry, AlertEntry } from '../types';
import { workflowService } from '../services/workflowService';

const nodeTypes = {
  custom: CustomNode,
  note: NoteNode,
};

const edgeTypes = {
  smoothstep: CustomEdge,
};

const proOptions: ProOptions = { hideAttribution: true };

// Initial default edge options (will be overridden by loaded data)
const initialDefaultEdgeOptions: DefaultEdgeOptions = {
  type: 'smoothstep',
  interactionWidth: 25, 
  style: { stroke: '#94a3b8', strokeWidth: 1.5, strokeDasharray: '5 5' },
  markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
};

const ViewerContent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const reactFlowInstance = useReactFlow();
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [workflowName, setWorkflowName] = useState('Loading...');
  const [defaultEdgeOptions, setDefaultEdgeOptions] = useState<DefaultEdgeOptions>(initialDefaultEdgeOptions);
  
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'logs' | 'alerts'>('logs');

  // Mock Live Data
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [alerts, setAlerts] = useState<AlertEntry[]>([
    { id: 'a1', severity: 'WARNING', service: 'Order Service', message: 'High CPU Usage (85%)', active: true }
  ]);

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      if (id) {
        // Load metadata
        const wf = await workflowService.getWorkflowById(id);
        if (wf) setWorkflowName(wf.name);
        else if (id === 'new') setWorkflowName('New Workflow');

        // Load graph
        const graph = await workflowService.getWorkflowGraph(id);
        
        // Load nodes and edges directly (same as Editor)
        setNodes(graph.nodes);
        setEdges(graph.edges);
        
        // Load defaultEdgeOptions if saved
        if (graph.defaultEdgeOptions) {
          setDefaultEdgeOptions(graph.defaultEdgeOptions);
        }
      }
    };
    loadData();
  }, [id, setNodes, setEdges]);

  // Simulate incoming logs
  useEffect(() => {
    const interval = setInterval(() => {
      const services = ['API Gateway', 'Auth Service', 'Order Service', 'Redis', 'Postgresql'];
      const levels: ('INFO' | 'WARN' | 'ERROR')[] = ['INFO', 'INFO', 'INFO', 'WARN', 'ERROR'];
      const messages = [
        'Request processed successfully',
        'Connection established',
        'Cache miss',
        'Database query took 200ms',
        'Invalid token signature',
        'Retry attempt 1/3'
      ];
      
      const newLog: LogEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        level: levels[Math.floor(Math.random() * levels.length)],
        service: services[Math.floor(Math.random() * services.length)],
        message: messages[Math.floor(Math.random() * messages.length)]
      };

      setLogs(prev => [newLog, ...prev].slice(0, 50));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleLayout = useCallback(() => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        'LR'
      );
      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
      setTimeout(() => reactFlowInstance.fitView({ padding: 0.2, duration: 800 }), 50);
    }, [nodes, edges, reactFlowInstance, setNodes, setEdges]);
  
    const handleFitView = useCallback(() => {
      reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
    }, [reactFlowInstance]);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-20 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-md text-slate-500">
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Box size={16} className="text-blue-600" />
              <span className="font-semibold text-slate-900 text-sm">{workflowName}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
           {/* Edit Mode Toggle */}
           <button
            onClick={() => navigate(`/editor/${id}`)}
            className="p-2 hover:bg-slate-100 rounded-md text-slate-600 transition-colors flex items-center gap-2 text-sm font-medium"
            title="Switch to Editor Mode"
          >
            <MousePointer2 size={18} />
          </button>
        </div>
      </header>

      {/* Main Area */}
      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 h-full relative flex flex-col">
          <div className="flex-1 relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              // Allow dragging in Read mode per request
              nodesDraggable={true} 
              // Prevent connections in Read mode
              nodesConnectable={false}
              proOptions={proOptions}
              defaultEdgeOptions={defaultEdgeOptions}
              fitView
              className="bg-slate-50"
            >
              <Background color="#cbd5e1" />
              
              <CanvasControls 
                onFitView={handleFitView}
                onLayout={handleLayout}
                showHistory={false}
              />
            </ReactFlow>
          </div>

          {/* Observability Panel */}
          <div 
            className={`bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] transition-all duration-300 ease-in-out flex flex-col z-20 ${
              isPanelOpen ? 'h-64' : 'h-10'
            }`}
          >
            <div 
              className="h-10 bg-slate-50 border-b border-slate-200 flex items-center justify-between px-4 cursor-pointer hover:bg-slate-100"
              onClick={() => setIsPanelOpen(!isPanelOpen)}
            >
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 font-semibold text-xs text-slate-600 uppercase tracking-wide">
                  <Terminal size={14} /> System Observability
                </div>
                <div className="flex gap-2">
                   <button 
                     onClick={(e) => { e.stopPropagation(); setActiveTab('logs'); setIsPanelOpen(true); }}
                     className={`px-3 py-0.5 rounded-full text-xs font-medium ${activeTab === 'logs' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-200'}`}
                   >
                     Logs
                   </button>
                   <button 
                     onClick={(e) => { e.stopPropagation(); setActiveTab('alerts'); setIsPanelOpen(true); }}
                     className={`px-3 py-0.5 rounded-full text-xs font-medium ${activeTab === 'alerts' ? 'bg-red-100 text-red-700' : 'text-slate-500 hover:bg-slate-200'}`}
                   >
                     Alerts {alerts.length > 0 && `(${alerts.length})`}
                   </button>
                </div>
              </div>
              {isPanelOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </div>

            {isPanelOpen && (
              <div className="flex-1 overflow-auto p-0 font-mono text-xs">
                {activeTab === 'logs' ? (
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-slate-500 font-medium w-32">Timestamp</th>
                        <th className="px-4 py-2 text-slate-500 font-medium w-24">Level</th>
                        <th className="px-4 py-2 text-slate-500 font-medium w-32">Service</th>
                        <th className="px-4 py-2 text-slate-500 font-medium">Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map(log => (
                        <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-4 py-1.5 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                          <td className="px-4 py-1.5">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              log.level === 'ERROR' ? 'bg-red-100 text-red-700' :
                              log.level === 'WARN' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {log.level}
                            </span>
                          </td>
                          <td className="px-4 py-1.5 text-blue-600 font-medium">{log.service}</td>
                          <td className="px-4 py-1.5 text-slate-700">{log.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-4 space-y-2">
                    {alerts.map(alert => (
                      <div key={alert.id} className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-md">
                        <AlertTriangle className="text-red-600" size={18} />
                        <div className="flex-1">
                          <h4 className="text-red-900 font-bold">{alert.service}</h4>
                          <p className="text-red-700">{alert.message}</p>
                        </div>
                        <span className="px-2 py-1 bg-red-200 text-red-800 text-[10px] font-bold rounded uppercase">
                          {alert.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel (Read Only) - Hide for note */}
        {selectedNode && selectedNode.type !== 'note' && (
          <NodeConfigPanel 
            selectedNode={selectedNode} 
            onUpdate={() => {}} 
            onClose={() => setSelectedNode(null)}
            readOnly={true} 
          />
        )}
      </div>
    </div>
  );
};

const Viewer = () => (
  <ReactFlowProvider>
    <ViewerContent />
  </ReactFlowProvider>
);

export default Viewer;