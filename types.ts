import { Edge, Node } from '@xyflow/react';

export interface Workflow {
  id: string;
  name: string;
  description: string;
  updatedAt: string;
  nodes: Node[];
  edges: Edge[];
}

export interface NodeTypeConfig {
  type: string;
  label: string;
  category: NodeCategory;
  iconName: string; // Lucide icon name
  simpleIconName?: string; // Simple Icons name (e.g., 'siMysql', 'siRedis')
  brandColor?: string; // Brand color for the icon container
  description?: string;
}

export type NodeCategory = 
  | 'Application'
  | 'Database'
  | 'Storage'
  | 'Middleware'
  | 'Observability'
  | 'Coordination'
  | 'General';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  service?: string;
}

export interface AlertEntry {
  id: string;
  severity: 'CRITICAL' | 'WARNING';
  service: string;
  message: string;
  active: boolean;
}
