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
  LayoutGrid, Settings, Sliders
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import CustomNode from '../components/CustomNode';
import NoteNode from '../components/NoteNode';
import CustomEdge from '../components/CustomEdge';
import NodeConfigPanel from '../components/NodeConfigPanel';
import EdgeConfigPanel from '../components/EdgeConfigPanel';
import GlobalStylePanel from '../components/GlobalStylePanel';
import CanvasControls from '../components/CanvasControls';
import Toast from '../components/Toast';
import GroupNode from '../components/GroupNode';
import { getLayoutedElements } from '../utils/layoutUtils';
import { NODE_TYPES_LIST } from '../constants';
import { workflowService } from '../services/workflowService';

const nodeTypes = {
  custom: CustomNode,
  note: NoteNode,
  group: GroupNode,
};

const edgeTypes = {
  smoothstep: CustomEdge,
  bezier: CustomEdge,
};

const proOptions: ProOptions = { hideAttribution: true };

// Make edges easier to interact with by increasing the hit area
// Make edges easier to interact with by increasing the hit area
const initialDefaultEdgeOptions: DefaultEdgeOptions = {
  type: 'bezier',
  interactionWidth: 25, 
  style: { stroke: '#94a3b8', strokeWidth: 1.5, strokeDasharray: '5 5' }, // Dashed neutral gray line
  markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' }, // Match arrow color
  animated: false,
  data: { pathType: 'bezier' }
};

const EditorContent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const reactFlowInstance = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [defaultEdgeOptions, setDefaultEdgeOptions] = useState<DefaultEdgeOptions>(initialDefaultEdgeOptions);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [showGlobalSettings, setShowGlobalSettings] = useState(false);
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
        if (graph.defaultEdgeOptions) {
          setDefaultEdgeOptions(graph.defaultEdgeOptions);
        }
        
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
    const newEdges = addEdge({ 
      ...params, 
      animated: defaultEdgeOptions.animated, 
      type: 'smoothstep', // Always use custom edge component
      style: defaultEdgeOptions.style,
      markerEnd: defaultEdgeOptions.markerEnd,
      data: { ...defaultEdgeOptions.data }
    }, edges);
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
      const isGroup = type === 'group';

      const newNode: Node = {
        id: `node_${Date.now()}`,
        type: isNote ? 'note' : (isGroup ? 'group' : 'custom'),
        position,
        // Set default style dimensions for Note - SMALLER default size
        data: { 
          type, 
          label: isNote ? '# New Note\nDouble click to edit' : (isGroup ? '分组' : (config?.label || 'Node')),
          description: config?.description || 'New Node',
          stepNumber: type === 'step' ? '1' : undefined,
          collapsed: false, // Initialize group as expanded
          style: (type === 'user') 
            ? { shape: 'circle', containerBg: 'transparent', borderColor: 'transparent', shadow: 'none' } 
            : (type === 'message')
                ? { containerBg: 'transparent', borderColor: 'transparent', borderWidth: 0, shadow: 'none' }
                : (type === 'step')
                    ? { containerBg: 'transparent', borderColor: 'transparent', shadow: 'none' }
                    : (isGroup)
                        ? { containerBg: 'rgba(240, 244, 255, 0.3)', borderColor: '#3b82f6' }
                        : undefined
        },
        style: isNote ? { width: 220, height: 80 } : (isGroup ? { width: 400, height: 300 } : undefined),
      };

      const newNodes = nodes.concat(newNode);
      setNodes(newNodes);
      addToHistory(newNodes, edges);
      setIsDirty(true);
    },
    [reactFlowInstance, nodes, edges, setNodes, setEdges]
  );

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      // Only allow reparenting for non-group nodes
      if (node.type === 'group') return;

      const intersections = reactFlowInstance.getIntersectingNodes(node).filter((n) => n.type === 'group');
      const groupNode = intersections[0];

      // Case 1: Dragged into a group
      if (groupNode && node.parentId !== groupNode.id) {
        setNodes((nds) => nds.map((n) => {
          if (n.id === node.id) {
            // Get the node's current absolute position
            // If it already has a parent, we need to convert from relative to absolute first
            let absoluteX = n.position.x;
            let absoluteY = n.position.y;
            
            if (n.parentId) {
              const oldParent = nds.find(p => p.id === n.parentId);
              if (oldParent) {
                absoluteX = n.position.x + oldParent.position.x;
                absoluteY = n.position.y + oldParent.position.y;
              }
            }

            // Now convert to relative position within the new group
            return {
              ...n,
              parentId: groupNode.id,
              position: {
                x: absoluteX - groupNode.position.x,
                y: absoluteY - groupNode.position.y,
              },
            };
          }
          return n;
        }));
        
        setIsDirty(true);
      }
      
      // Case 2: Dragged out of a group
      else if (!groupNode && node.parentId) {
        setNodes((nds) => nds.map((n) => {
          if (n.id === node.id) {
            // Convert from relative to absolute position
            const oldParent = nds.find(p => p.id === n.parentId);
            let absoluteX = n.position.x;
            let absoluteY = n.position.y;
            
            if (oldParent) {
              absoluteX = n.position.x + oldParent.position.x;
              absoluteY = n.position.y + oldParent.position.y;
            }
            
            // Remove parent and use absolute position
            const { parentId, extent, ...rest } = n;
            return {
              ...rest,
              position: {
                x: absoluteX,
                y: absoluteY,
              },
            };
          }
          return n;
        }));

        setIsDirty(true);
      }
    },
    [reactFlowInstance, nodes, edges, setNodes]
  );

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
    setShowGlobalSettings(false);
    setMenu(null);
  }, []);

  const onEdgeClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
    setShowGlobalSettings(false);
    setMenu(null);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
    // Don't close global settings on pane click, user might want to keep it open
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

  const handleEdgeUpdate = (edgeId: string, updates: any) => {
    const newEdges = edges.map(e => {
      if (e.id === edgeId) {
        // Merge updates into the edge object
        // updates can be { data: ... }, { style: ... }, { animated: ... }
        const updatedEdge = { ...e, ...updates };
        // If data is being updated, merge it deeply
        if (updates.data) {
          updatedEdge.data = { ...e.data, ...updates.data };
        }
        // If style is being updated, merge it deeply
        if (updates.style) {
          updatedEdge.style = { ...e.style, ...updates.style };
        }
        setSelectedEdge(updatedEdge); // Update selection state
        return updatedEdge;
      }
      return e;
    });
    setEdges(newEdges);
    addToHistory(nodes, newEdges);
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
      await workflowService.saveWorkflowGraph(id, nodes, edges, defaultEdgeOptions);
      setIsDirty(false);
      setShowToast(true);
    }
  };

  const handleApplyGlobalToAll = () => {
    const newEdges = edges.map(e => ({
      ...e,
      style: { ...e.style, ...defaultEdgeOptions.style },
      markerEnd: defaultEdgeOptions.markerEnd,
      animated: defaultEdgeOptions.animated,
      data: { ...e.data, ...defaultEdgeOptions.data }
    }));
    setEdges(newEdges);
    addToHistory(nodes, newEdges);
    setIsDirty(true);
    setShowToast(true); // Reuse toast to show success
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

  const reactFlowWrapper = useRef(null);

  const handleUpdateDefaultEdgeOptions = (newOptions: DefaultEdgeOptions) => {
    setDefaultEdgeOptions(newOptions);
    setIsDirty(true);
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
            <span className="text-xs text-slate-400">
              {isDirty ? 'Unsaved changes' : 'All changes saved'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
           {/* View Mode Toggle */}
           <button
            onClick={() => handleNavigation(`/viewer/${id}`)}
            className="p-2 hover:bg-slate-100 rounded-md text-slate-600 transition-colors flex items-center gap-2 text-sm font-medium"
            title="Switch to Reader Mode"
          >
            <Eye size={18} />
          </button>

           {/* Global Settings Toggle */}
           <button
            onClick={() => setShowGlobalSettings(!showGlobalSettings)}
            className={`p-2 rounded-md transition-colors flex items-center gap-2 text-sm font-medium
              ${showGlobalSettings ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-100 text-slate-600'}
            `}
            title="Global Settings"
          >
            <Settings size={18} />
          </button>

          <div className="h-6 w-px bg-slate-200 mx-2" />

          <button
            onClick={handleSave}
            disabled={!isDirty}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
              ${isDirty 
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
            `}
          >
            <Save size={16} />
            Save
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeDragStop={onNodeDragStop}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            onNodeContextMenu={onNodeContextMenu}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            proOptions={proOptions}
            fitView
            className="bg-slate-50"
          >
            <Background color="#e2e8f0" variant={BackgroundVariant.Dots} />
            
            <CanvasControls 
              onFitView={() => reactFlowInstance?.fitView({ duration: 800 })}
              onLayout={handleLayout}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < history.length - 1}
              showHistory={true}
              selectedEdge={selectedEdge}
              onEdgeUpdate={handleEdgeUpdate}
            />
          </ReactFlow>

          {/* Right Side Panels */}
          {selectedNode && (
            <NodeConfigPanel 
              selectedNode={selectedNode} 
              onUpdate={handleUpdateNode}
              onClose={() => setSelectedNode(null)}
            />
          )}
          
          {/* Context Menu */}
          {menu && (
            <div 
              style={{ top: menu.top, left: menu.left }} 
              className="absolute z-50 bg-white rounded-lg shadow-xl border border-slate-100 py-1 min-w-[160px] animate-in fade-in zoom-in-95 duration-100"
            >
              <button 
                onClick={handleCopyNode}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <Copy size={14} />
                Duplicate
              </button>
              <button 
                onClick={handleDeleteNode}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <Toast 
          message="Workflow saved successfully" 
          isVisible={showToast}
          onClose={() => setShowToast(false)} 
        />
      )}



        {/* Edge Config Panel */}
        {selectedEdge && (
          <EdgeConfigPanel
            selectedEdge={selectedEdge}
            onUpdate={handleEdgeUpdate}
            onClose={() => setSelectedEdge(null)}
          />
        )}

        {/* Global Style Panel */}
        {showGlobalSettings && (
          <GlobalStylePanel
            defaultOptions={defaultEdgeOptions}
            onUpdateDefault={handleUpdateDefaultEdgeOptions}
            onApplyToAll={handleApplyGlobalToAll}
            onClose={() => setShowGlobalSettings(false)}
          />
        )}
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