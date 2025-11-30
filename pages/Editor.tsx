import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  ReactFlow, 
  ReactFlowProvider, 
  addEdge, 
  useNodesState, 
  useEdgesState, 
  Background, 
  Node,
  Edge,
  Connection,
  BackgroundVariant,
  useReactFlow,
  ProOptions,
  NodeChange,
  EdgeChange,
  DefaultEdgeOptions,
  MarkerType
} from '@xyflow/react';

import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Save, 
  MousePointer2, Eye, Box, Copy, Trash2, AlertTriangle,
  LayoutGrid
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import CustomNode from '../components/CustomNode';
import NoteNode from '../components/NoteNode';
import CustomEdge from '../components/CustomEdge';
import NodeConfigPanel from '../components/NodeConfigPanel';
import CanvasControls from '../components/CanvasControls';
import Toast from '../components/Toast';
import { getLayoutedElements } from '../utils/layoutUtils';
import { NODE_TYPES_LIST } from '../constants';
import { workflowService } from '../services/workflowService';

const nodeTypes = {
  custom: CustomNode,
  note: NoteNode,
};

const edgeTypes = {
  smoothstep: CustomEdge,
};

const proOptions: ProOptions = { hideAttribution: true };

// Make edges easier to interact with by increasing the hit area
const defaultEdgeOptions: DefaultEdgeOptions = {
  type: 'smoothstep',
  interactionWidth: 25, 
  style: { stroke: '#94a3b8', strokeWidth: 1.5, strokeDasharray: '5 5' }, // Dashed neutral gray line
  markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' }, // Match arrow color
};

const EditorContent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const reactFlowInstance = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [workflowName, setWorkflowName] = useState('Loading...');
  const [isLoading, setIsLoading] = useState(true);
  
  // History State
  const [history, setHistory] = useState<{nodes: Node[], edges: Edge[]}[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // UI State
  const [menu, setMenu] = useState<{id: string, top: number, left: number} | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  // Navigation Guard State
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  
  // Ref to track if initial data load is complete to prevent false dirty state
  const isLoadedRef = useRef(false);

  // Handle Window Close/Refresh with unsaved changes (Browser level)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      if (id) {
        setIsLoading(true);
        // Reset loading state
        isLoadedRef.current = false;
        // Don't show dirty state while loading
        setIsDirty(false);

        // Load metadata
        const wf = await workflowService.getWorkflowById(id);
        if (wf) setWorkflowName(wf.name);
        else if (id === 'new') setWorkflowName('New Workflow');

        // Load graph
        const graph = await workflowService.getWorkflowGraph(id);
        setNodes(graph.nodes);
        setEdges(graph.edges);
        
        // Init history
        setHistory([{ nodes: graph.nodes, edges: graph.edges }]);
        setHistoryIndex(0);
        
        setIsLoading(false);
        
        // Use a timeout to allow React Flow to handle initial dimensions 
        // before enabling dirty state tracking
        setTimeout(() => {
          isLoadedRef.current = true;
        }, 500);
      }
    };
    loadData();
  }, [id, setNodes, setEdges]);

  // Wrapped Change Handlers to track dirty state
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes);
    
    if (!isLoadedRef.current) return;

    const isStructuralChange = changes.some(c => c.type !== 'select');
    
    if (isStructuralChange) {
       setIsDirty(true);
    }
  }, [onNodesChange]);

  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    onEdgesChange(changes);

    if (!isLoadedRef.current) return;

    const isStructuralChange = changes.some(c => c.type !== 'select');
    if (isStructuralChange) {
      setIsDirty(true);
    }
  }, [onEdgesChange]);

  const onConnect = useCallback((params: Connection) => {
    const newEdges = addEdge({ ...params, animated: true, type: 'smoothstep' }, edges);
    setEdges(newEdges);
    addToHistory(nodes, newEdges);
    setIsDirty(true);
  }, [edges, nodes, setNodes, setEdges]);

  const addToHistory = (n: Node[], e: Edge[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: n, edges: e });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const config = NODE_TYPES_LIST.find(t => t.type === type);
      
      const isNote = type === 'note';

      const newNode: Node = {
        id: `node_${Date.now()}`,
        type: isNote ? 'note' : 'custom',
        position,
        // Set default style dimensions for Note - SMALLER default size
        style: isNote ? { width: 220, height: 80 } : undefined,
        data: { 
          type, 
          label: isNote ? '# New Note\nDouble click to edit' : (config?.label || 'Node'),
          description: config?.description || 'New Node'
        },
      };

      const newNodes = nodes.concat(newNode);
      setNodes(newNodes);
      addToHistory(newNodes, edges);
      setIsDirty(true);
    },
    [reactFlowInstance, nodes, edges, setNodes, setEdges]
  );

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setMenu(null);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setMenu(null);
  }, []);

  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    // Only allow context menu for custom nodes (functional nodes), not standalone notes
    if (node.type === 'custom') {
      setMenu({
        id: node.id,
        top: event.clientY,
        left: event.clientX,
      });
    }
  }, []);

  const handleLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges,
      'LR'
    );
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
    addToHistory([...layoutedNodes], [...layoutedEdges]);
    setIsDirty(true);
    setTimeout(() => reactFlowInstance.fitView({ padding: 0.2, duration: 800 }), 50);
  }, [nodes, edges, reactFlowInstance, setNodes, setEdges]);

  const handleFitView = useCallback(() => {
    reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
  }, [reactFlowInstance]);

  const handleUpdateNode = (id: string, data: any) => {
    const newNodes = nodes.map(n => n.id === id ? { ...n, data } : n);
    setNodes(newNodes);
    addToHistory(newNodes, edges);
    setIsDirty(true);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setNodes(prev.nodes);
      setEdges(prev.edges);
      setHistoryIndex(historyIndex - 1);
      setIsDirty(true);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setNodes(next.nodes);
      setEdges(next.edges);
      setHistoryIndex(historyIndex + 1);
      setIsDirty(true);
    }
  };

  const handleSave = async () => {
    if (id) {
      await workflowService.saveWorkflowGraph(id, nodes, edges);
      setIsDirty(false);
      setShowToast(true);
    }
  };

  // Safe Navigation with Custom Modal
  const handleNavigation = (path: string) => {
    if (isDirty) {
      setPendingPath(path);
      setShowExitDialog(true);
    } else {
      navigate(path);
    }
  };

  const confirmExit = () => {
    setShowExitDialog(false);
    if (pendingPath) {
      navigate(pendingPath);
    }
  };

  const cancelExit = () => {
    setShowExitDialog(false);
    setPendingPath(null);
  };

  // Context Menu Actions
  const handleCopyNode = () => {
    if (!menu) return;
    const targetId = menu.id;
    setMenu(null);
    
    // Slight delay to allow UI to update
    setTimeout(() => {
      const nodeToCopy = nodes.find(n => n.id === targetId);
      if (nodeToCopy) {
        const newNode = {
          ...nodeToCopy,
          id: `node_${Date.now()}`,
          position: { x: nodeToCopy.position.x + 50, y: nodeToCopy.position.y + 50 },
          selected: false
        };
        const newNodes = [...nodes, newNode];
        setNodes(newNodes);
        addToHistory(newNodes, edges);
        setIsDirty(true);
      }
    }, 10);
  };

  const handleDeleteNode = () => {
    if (!menu) return;
    const targetId = menu.id;
    setMenu(null);

    setTimeout(() => {
      const newNodes = nodes.filter(n => n.id !== targetId);
      const newEdges = edges.filter(e => e.source !== targetId && e.target !== targetId);
      setNodes(newNodes);
      setEdges(newEdges);
      addToHistory(newNodes, newEdges);
      setIsDirty(true);
      setSelectedNode(null);
    }, 10);
  };

  return (
    <div className="flex flex-col h-screen">
      <Toast 
        message="Workflow saved successfully" 
        isVisible={showToast} 
        onClose={() => setShowToast(false)} 
      />

      {/* Exit Confirmation Dialog */}
      {showExitDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="text-amber-600" size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Unsaved Changes</h3>
            </div>
            <p className="text-slate-600 mb-6 text-sm leading-relaxed">
              You have unsaved changes in your workflow. If you leave now, your changes will be lost.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={cancelExit}
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={confirmExit}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-sm text-sm"
              >
                Leave without saving
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-20 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => handleNavigation('/dashboard')} className="p-2 hover:bg-slate-100 rounded-md text-slate-500 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Box size={16} className="text-blue-600" />
              <span className="font-semibold text-slate-900 text-sm">{workflowName}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
           <button className="flex items-center gap-2 px-3 py-1.5 bg-white text-blue-600 shadow-sm rounded-md text-xs font-semibold">
              <MousePointer2 size={14} />
              Editor
           </button>
           <button 
             onClick={() => handleNavigation(`/viewer/${id}`)}
             className="flex items-center gap-2 px-3 py-1.5 text-slate-500 hover:text-slate-800 rounded-md text-xs font-semibold transition-colors"
           >
              <Eye size={14} />
              Read
           </button>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleSave} 
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              isDirty 
                ? "bg-amber-500 hover:bg-amber-600 text-white shadow-md ring-2 ring-amber-200" 
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            <Save size={16} />
            {isDirty ? "Save Changes" : "Save"}
          </button>
        </div>
      </header>

      {/* Main Area */}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        
        <div className="flex-1 h-full relative" onDragOver={onDragOver} onDrop={onDrop}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onNodeContextMenu={onNodeContextMenu}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            proOptions={proOptions}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
            snapToGrid
            className="bg-slate-50"
          >
            <Background color="#cbd5e1" variant={BackgroundVariant.Dots} />
            
            <CanvasControls 
              onUndo={handleUndo}
              onRedo={handleRedo}
              onFitView={handleFitView}
              onLayout={handleLayout}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < history.length - 1}
              showHistory={true}
            />

          </ReactFlow>
          
          {/* Empty State Overlay */}
          {!isLoading && nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl border-2 border-dashed border-slate-300 text-center max-w-md shadow-sm pointer-events-auto animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LayoutGrid size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Start Building Your Flow</h3>
                <p className="text-slate-500 leading-relaxed text-sm mb-6">
                  Drag and drop components from the left sidebar to create your architecture.
                </p>
                <div className="flex items-center justify-center gap-2 text-amber-700 text-xs font-semibold bg-amber-50 py-2.5 px-4 rounded-lg border border-amber-100">
                   <AlertTriangle size={14} className="shrink-0" /> 
                   <span>Remember to save your changes often!</span>
                </div>
              </div>
            </div>
          )}

          {/* Context Menu */}
          {menu && (
            <div 
              className="fixed bg-white shadow-xl border border-slate-200 rounded-lg py-1 z-50 w-32"
              style={{ top: menu.top, left: menu.left }}
            >
              <button onClick={handleCopyNode} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                <Copy size={14} /> Copy
              </button>
              <button onClick={handleDeleteNode} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>

        {/* Right Panel - Conditional Render: Don't show for 'note' type */}
        {selectedNode && selectedNode.type !== 'note' && (
          <NodeConfigPanel 
            selectedNode={selectedNode} 
            onUpdate={handleUpdateNode} 
            onClose={() => setSelectedNode(null)} 
          />
        )}
      </div>
    </div>
  );
};

// Wrap in provider for useReactFlow hook
const Editor = () => (
  <ReactFlowProvider>
    <EditorContent />
  </ReactFlowProvider>
);

export default Editor;