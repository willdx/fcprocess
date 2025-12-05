import { MOCK_WORKFLOWS } from '../constants';
import { Node, Edge, DefaultEdgeOptions } from '@xyflow/react';
import { dbService } from './db';

// Default mock nodes for the "E-Commerce Order System" (wf-1)
const DEFAULT_NODES_WF1: Node[] = [
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

const DEFAULT_EDGES_WF1: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, type: 'smoothstep' },
  { id: 'e1-3', source: '1', target: '3', animated: true, type: 'smoothstep' },
];

// WF-2 Data
const WF2_NODES: Node[] = [
    { id: 'start', type: 'custom', data: { type: 'gateway', label: 'Start', description: 'User initiates redemption' }, position: { x: 50, y: 300 } },
    { id: 'check_auth', type: 'custom', data: { type: 'service', label: 'Auth Check', description: 'Verify user login' }, position: { x: 250, y: 300 } },
    { id: 'check_stock', type: 'custom', data: { type: 'service', label: 'Stock Check', description: 'Check prize availability' }, position: { x: 450, y: 200 } },
    { id: 'check_risk', type: 'custom', data: { type: 'service', label: 'Risk Control', description: 'Fraud detection' }, position: { x: 450, y: 400 } },
    { id: 'deduct_points', type: 'custom', data: { type: 'service', label: 'Deduct Points', description: 'Consume user points' }, position: { x: 650, y: 300 } },
    { id: 'issue_prize', type: 'custom', data: { type: 'service', label: 'Issue Prize', description: 'Send prize to user' }, position: { x: 850, y: 300 } },
    { id: 'notify', type: 'custom', data: { type: 'service', label: 'Notify User', description: 'Send success message' }, position: { x: 1050, y: 300 } },
    { id: 'end', type: 'custom', data: { type: 'gateway', label: 'End', description: 'Process complete' }, position: { x: 1250, y: 300 } },
];
const WF2_EDGES: Edge[] = [
    { id: 'e1', source: 'start', target: 'check_auth', animated: true, type: 'smoothstep' },
    { id: 'e2', source: 'check_auth', target: 'check_stock', animated: true, type: 'smoothstep' },
    { id: 'e3', source: 'check_auth', target: 'check_risk', animated: true, type: 'smoothstep' },
    { id: 'e4', source: 'check_stock', target: 'deduct_points', animated: true, type: 'smoothstep' },
    { id: 'e5', source: 'check_risk', target: 'deduct_points', animated: true, type: 'smoothstep' },
    { id: 'e6', source: 'deduct_points', target: 'issue_prize', animated: true, type: 'smoothstep' },
    { id: 'e7', source: 'issue_prize', target: 'notify', animated: true, type: 'smoothstep' },
    { id: 'e8', source: 'notify', target: 'end', animated: true, type: 'smoothstep' },
];

// WF-5 Data
const WF5_NODES: Node[] = [
    { id: 'lvs', type: 'custom', data: { type: 'loadBalancer', label: 'LVS', description: '10.9.130.200\n10.10.130.200' }, position: { x: 0, y: 300 } },
    { id: 'filter_sys', type: 'custom', data: { type: 'service', label: '兑奖过滤系统', description: 'Accessor-nio\nAccessor-nio-new' }, position: { x: 250, y: 300 } },
    { id: 'accessor_impl', type: 'custom', data: { type: 'service', label: 'Accessor-impl', description: '' }, position: { x: 550, y: 300 } },
    
    // Top Dependencies
    { id: 'wldbservice', type: 'custom', data: { type: 'service', label: 'wldbservice', description: '仅做依赖' }, position: { x: 450, y: 50 } },
    { id: 'dbservice', type: 'custom', data: { type: 'service', label: 'dbservice', description: '仅做依赖' }, position: { x: 650, y: 50 } },
    { id: 'zookeeper', type: 'custom', data: { type: 'zookeeper', label: 'zookeeper', description: '' }, position: { x: 550, y: 150 } },
    { id: 'qpid', type: 'custom', data: { type: 'rocketmq', label: 'QPID', description: '' }, position: { x: 800, y: 50 } },
    { id: 'redis', type: 'custom', data: { type: 'redis', label: 'Redis', description: '' }, position: { x: 800, y: 150 } },
    
    // Bottom Dependencies
    { id: 'kafka', type: 'custom', data: { type: 'kafka', label: 'Kafka', description: '' }, position: { x: 400, y: 500 } },
    { id: 'oceanbase_pcf', type: 'custom', data: { type: 'oceanbase', label: 'Oceanbase', description: 'pcf数据库' }, position: { x: 600, y: 500 } },

    // Main Flow Right
    { id: 'uap_interim', type: 'custom', data: { type: 'service', label: 'uap-cash-platform-interim', description: '' }, position: { x: 850, y: 300 } },
    { id: 'platform_gateway', type: 'custom', data: { type: 'gateway', label: 'platform-gateway', description: '' }, position: { x: 1100, y: 300 } },
    { id: 'scratcher_platform', type: 'custom', data: { type: 'service', label: 'scratcher-cash-platform', description: '统一系统此处会判断票绑定关系' }, position: { x: 1350, y: 300 } },
    
    // Scratcher Branch
    { id: 'scratcher_cash', type: 'custom', data: { type: 'service', label: 'scratcher-cash', description: '' }, position: { x: 1500, y: 150 } },
    { id: 'scratcher_core', type: 'custom', data: { type: 'service', label: 'scratcher-cash-core', description: '兑奖过滤' }, position: { x: 1700, y: 300 } },
    { id: 'oceanbase_verify', type: 'custom', data: { type: 'oceanbase', label: 'OceanBase', description: '验奖' }, position: { x: 1700, y: 450 } },
];
const WF5_EDGES: Edge[] = [
    { id: 'e_lvs_filter', source: 'lvs', target: 'filter_sys', type: 'smoothstep', sourceHandle: 's-right', targetHandle: 't-left' },
    { id: 'e_filter_accessor', source: 'filter_sys', target: 'accessor_impl', type: 'smoothstep', sourceHandle: 's-right', targetHandle: 't-left' },
    { id: 'e_filter_kafka', source: 'filter_sys', target: 'kafka', type: 'smoothstep', sourceHandle: 's-bottom', targetHandle: 't-left' },
    { id: 'e_filter_ob', source: 'filter_sys', target: 'oceanbase_pcf', type: 'smoothstep', sourceHandle: 's-bottom', targetHandle: 't-left' },
    
    { id: 'e_wl_zk', source: 'wldbservice', target: 'zookeeper', type: 'smoothstep', sourceHandle: 's-bottom', targetHandle: 't-top' },
    { id: 'e_db_zk', source: 'dbservice', target: 'zookeeper', type: 'smoothstep', sourceHandle: 's-bottom', targetHandle: 't-top' },
    { id: 'e_acc_zk', source: 'accessor_impl', target: 'zookeeper', type: 'smoothstep', sourceHandle: 's-top', targetHandle: 't-bottom' },
    
    { id: 'e_acc_qpid', source: 'accessor_impl', target: 'qpid', type: 'smoothstep', sourceHandle: 's-top', targetHandle: 't-left' },
    { id: 'e_acc_redis', source: 'accessor_impl', target: 'redis', type: 'smoothstep', sourceHandle: 's-top', targetHandle: 't-left' },
    { id: 'e_acc_ob', source: 'accessor_impl', target: 'oceanbase_pcf', type: 'smoothstep', sourceHandle: 's-bottom', targetHandle: 't-top' },
    { id: 'e_acc_kafka', source: 'accessor_impl', target: 'kafka', type: 'smoothstep', sourceHandle: 's-bottom', targetHandle: 't-right' },
    
    { id: 'e_acc_uap', source: 'accessor_impl', target: 'uap_interim', type: 'smoothstep', sourceHandle: 's-right', targetHandle: 't-left' },
    { id: 'e_uap_gw', source: 'uap_interim', target: 'platform_gateway', type: 'smoothstep', sourceHandle: 's-right', targetHandle: 't-left' },
    { id: 'e_gw_scratcher', source: 'platform_gateway', target: 'scratcher_platform', type: 'smoothstep', sourceHandle: 's-right', targetHandle: 't-left' },
    
    { id: 'e_sp_sc', source: 'scratcher_platform', target: 'scratcher_cash', label: '统一系统兑奖', type: 'smoothstep', sourceHandle: 's-top', targetHandle: 't-left' },
    { id: 'e_sp_core', source: 'scratcher_platform', target: 'scratcher_core', label: '兑奖过滤', type: 'smoothstep', sourceHandle: 's-right', targetHandle: 't-left' },
    { id: 'e_sc_core', source: 'scratcher_cash', target: 'scratcher_core', label: '统一系统查询票...', type: 'smoothstep', sourceHandle: 's-right', targetHandle: 't-top' },
    
    { id: 'e_core_ob', source: 'scratcher_core', target: 'oceanbase_verify', type: 'smoothstep', sourceHandle: 's-bottom', targetHandle: 't-top' },
];

const seedData = async () => {
  const workflows = await dbService.query('SELECT * FROM workflows');
  if (workflows.length > 0) return;

  console.log('Seeding initial data...');

  // Seed Workflows
  for (const wf of MOCK_WORKFLOWS) {
    await dbService.run(
      'INSERT INTO workflows (id, name, description, updated_at) VALUES (?, ?, ?, ?)',
      [wf.id, wf.name, wf.description, wf.updatedAt]
    );
  }

  // Seed Graphs
  // WF-1
  await dbService.run(
    'INSERT INTO graphs (workflow_id, nodes, edges) VALUES (?, ?, ?)',
    ['wf-1', JSON.stringify(DEFAULT_NODES_WF1), JSON.stringify(DEFAULT_EDGES_WF1)]
  );

  // WF-2
  await dbService.run(
    'INSERT INTO graphs (workflow_id, nodes, edges) VALUES (?, ?, ?)',
    ['wf-2', JSON.stringify(WF2_NODES), JSON.stringify(WF2_EDGES)]
  );

  // WF-5
  await dbService.run(
    'INSERT INTO graphs (workflow_id, nodes, edges) VALUES (?, ?, ?)',
    ['wf-5', JSON.stringify(WF5_NODES), JSON.stringify(WF5_EDGES)]
  );
};

export const workflowService = {
  /**
   * Fetches workflows, optionally filtered by a search query.
   */
  getWorkflows: async (query: string = ''): Promise<any[]> => {
    await seedData();
    
    let sql = 'SELECT * FROM workflows';
    const params: any[] = [];

    if (query.trim()) {
      sql += ' WHERE name LIKE ? OR description LIKE ?';
      params.push(`%${query}%`, `%${query}%`);
    }
    
    sql += ' ORDER BY updated_at DESC'; // Optional: sort by updated_at

    const rows = await dbService.query(sql, params);
    
    // Map snake_case to camelCase if needed, but for now let's keep it consistent or map it
    return rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        updatedAt: row.updated_at
    }));
  },

  /**
   * Fetches a single workflow by ID.
   */
  getWorkflowById: async (id: string): Promise<any | undefined> => {
    await seedData();
    const row = await dbService.queryOne('SELECT * FROM workflows WHERE id = ?', [id]);
    if (!row) return undefined;
    
    return {
        id: row.id,
        name: row.name,
        description: row.description,
        updatedAt: row.updated_at
    };
  },

  /**
   * Creates a new workflow and adds it to the store.
   */
  createWorkflow: async (name: string, description: string): Promise<any> => {
    const id = `wf-${Date.now()}`;
    const updatedAt = 'Just now';
    
    await dbService.run(
      'INSERT INTO workflows (id, name, description, updated_at) VALUES (?, ?, ?, ?)',
      [id, name, description, updatedAt]
    );
    
    // Initialize empty graph
    await dbService.run(
        'INSERT INTO graphs (workflow_id, nodes, edges) VALUES (?, ?, ?)',
        [id, JSON.stringify([]), JSON.stringify([])]
    );

    return { id, name, description, updatedAt };
  },

  /**
   * Get graph data (nodes and edges) for a workflow
   */
  getWorkflowGraph: async (id: string): Promise<{ nodes: Node[], edges: Edge[], defaultEdgeOptions?: DefaultEdgeOptions }> => {
    await seedData();
    const row = await dbService.queryOne('SELECT * FROM graphs WHERE workflow_id = ?', [id]);
    
    if (!row) {
        return { nodes: [], edges: [] };
    }

    return {
        nodes: JSON.parse(row.nodes || '[]'),
        edges: JSON.parse(row.edges || '[]'),
        defaultEdgeOptions: row.default_edge_options ? JSON.parse(row.default_edge_options) : undefined
    };
  },

  /**
   * Save graph data for a workflow
   */
  saveWorkflowGraph: async (id: string, nodes: Node[], edges: Edge[], defaultEdgeOptions?: DefaultEdgeOptions): Promise<void> => {
    await dbService.run(
        `INSERT OR REPLACE INTO graphs (workflow_id, nodes, edges, default_edge_options) 
         VALUES (?, ?, ?, ?)`,
        [
            id, 
            JSON.stringify(nodes), 
            JSON.stringify(edges), 
            defaultEdgeOptions ? JSON.stringify(defaultEdgeOptions) : null
        ]
    );
    
    // Update timestamp on workflow
    await dbService.run(
        'UPDATE workflows SET updated_at = ? WHERE id = ?',
        ['Just now', id]
    );
  }
};