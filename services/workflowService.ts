import { MOCK_WORKFLOWS } from '../constants';
import { Node, Edge } from '@xyflow/react';

// Default mock nodes for the "E-Commerce Order System" (wf-1) or new flows to start with something
const DEFAULT_NODES: Node[] = [
  { 
    id: '1', 
    type: 'custom', 
    data: { type: 'gateway', label: 'API Gateway', description: 'Entry point for all client requests' }, 
    position: { x: 50, y: 150 } 
  },
  { 
    id: '2', 
    type: 'custom', 
    data: { type: 'service', label: 'Auth Service', description: 'Handles JWT authentication' }, 
    position: { x: 350, y: 50 } 
  },
  { 
    id: '3', 
    type: 'custom', 
    data: { type: 'service', label: 'Order Service', description: 'Process customer orders' }, 
    position: { x: 350, y: 250 } 
  },
];

const DEFAULT_EDGES: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, type: 'smoothstep' },
  { id: 'e1-3', source: '1', target: '3', animated: true, type: 'smoothstep' },
];

// In-memory storage to simulate a database for the session
let workflows: any[] = [...MOCK_WORKFLOWS];

// In-memory storage for graph data (nodes and edges) keyed by workflow ID
const workflowGraphs: Record<string, { nodes: Node[], edges: Edge[] }> = {
  'wf-1': { nodes: DEFAULT_NODES, edges: DEFAULT_EDGES }
};

export const workflowService = {
  /**
   * Fetches workflows, optionally filtered by a search query.
   */
  getWorkflows: async (query: string = ''): Promise<any[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!query.trim()) {
          resolve([...workflows]);
          return;
        }

        const lowerQuery = query.toLowerCase();
        const filtered = workflows.filter(wf => 
          wf.name.toLowerCase().includes(lowerQuery) || 
          wf.description.toLowerCase().includes(lowerQuery)
        );
        resolve(filtered);
      }, 300);
    });
  },

  /**
   * Fetches a single workflow by ID.
   */
  getWorkflowById: async (id: string): Promise<any | undefined> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const wf = workflows.find(w => w.id === id);
            resolve(wf);
        }, 200);
    });
  },

  /**
   * Creates a new workflow and adds it to the store.
   */
  createWorkflow: async (name: string, description: string): Promise<any> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const id = `wf-${Date.now()}`;
        const newWorkflow = {
          id,
          name,
          description,
          updatedAt: 'Just now',
        };

        // Add to list
        workflows = [newWorkflow, ...workflows];
        // Initialize empty graph
        workflowGraphs[id] = { nodes: [], edges: [] };
        
        resolve(newWorkflow);
      }, 500);
    });
  },

  /**
   * Get graph data (nodes and edges) for a workflow
   */
  getWorkflowGraph: async (id: string): Promise<{ nodes: Node[], edges: Edge[] }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Return stored graph or default if specific ID not found (fallback for demo)
        const graph = workflowGraphs[id] || { nodes: [], edges: [] };
        // Deep copy to prevent reference issues in mock
        resolve(JSON.parse(JSON.stringify(graph)));
      }, 300);
    });
  },

  /**
   * Save graph data for a workflow
   */
  saveWorkflowGraph: async (id: string, nodes: Node[], edges: Edge[]): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        workflowGraphs[id] = { nodes, edges };
        resolve();
      }, 300);
    });
  }
};