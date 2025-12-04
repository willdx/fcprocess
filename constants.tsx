import React from 'react';
import { 
  Server, Network, Globe, Database, HardDrive, 
  Layers, Activity, BarChart3, Search, Share2, 
  StickyNote, LayoutGrid, Cpu, ShieldCheck,
  Circle, User, Mail
} from 'lucide-react';
import { NodeCategory, NodeTypeConfig } from './types';

// Map icon strings to components for rendering
export const ICON_MAP: Record<string, React.FC<any>> = {
  Server, Network, Globe, Database, HardDrive, 
  Layers, Activity, BarChart3, Search, Share2, 
  StickyNote, LayoutGrid, Cpu, ShieldCheck,
  Circle, User, Mail
};

export const CATEGORY_COLORS: Record<NodeCategory, string> = {
  General: 'bg-slate-100 text-slate-600',
  Application: 'bg-blue-100 text-blue-600',
  Database: 'bg-emerald-100 text-emerald-600',
  Storage: 'bg-orange-100 text-orange-600',
  Middleware: 'bg-purple-100 text-purple-600',
  Observability: 'bg-yellow-100 text-yellow-600',
  Coordination: 'bg-pink-100 text-pink-600',
};

export const NODE_TYPES_LIST: NodeTypeConfig[] = [
  // General
  { type: 'note', label: '备注', category: 'General', iconName: 'StickyNote' },
  { type: 'step', label: '步骤', category: 'General', iconName: 'Circle' },
  { type: 'user', label: '用户', category: 'General', iconName: 'User' },
  { type: 'message', label: '消息', category: 'General', iconName: 'Mail' },
  { type: 'group', label: '分组', category: 'General', iconName: 'LayoutGrid' },

  
  // Application
  { type: 'loadBalancer', label: 'LoadBalancer', category: 'Application', iconName: 'Network' },
  { type: 'gateway', label: 'Gateway', category: 'Application', iconName: 'Globe' },
  { type: 'service', label: 'Service', category: 'Application', iconName: 'Server' },
  
  // Database
  { type: 'mysql', label: 'Mysql', category: 'Database', iconName: 'Database' },
  { type: 'postgresql', label: 'Postgresql', category: 'Database', iconName: 'Database' },
  { type: 'redis', label: 'Redis', category: 'Database', iconName: 'Layers' },
  { type: 'oceanbase', label: 'OceanBase', category: 'Database', iconName: 'Database' },
  
  // Storage
  { type: 'minio', label: 'MinIO', category: 'Storage', iconName: 'HardDrive' },
  
  // Middleware
  { type: 'kafka', label: 'Kafka', category: 'Middleware', iconName: 'Activity' },
  { type: 'rocketmq', label: 'RocketMQ', category: 'Middleware', iconName: 'Activity' },
  
  // Observability
  { type: 'prometheus', label: 'Prometheus', category: 'Observability', iconName: 'Activity' },
  { type: 'grafana', label: 'Grafana', category: 'Observability', iconName: 'BarChart3' },
  { type: 'elasticsearch', label: 'ElasticSearch', category: 'Observability', iconName: 'Search' },
  
  // Coordination
  { type: 'zookeeper', label: 'Zookeeper', category: 'Coordination', iconName: 'Share2' },
  { type: 'nacos', label: 'Nacos', category: 'Coordination', iconName: 'Share2' },
];

export const MOCK_WORKFLOWS = [
  {
    id: 'wf-1',
    name: '即开票售票',
    description: '即开型彩票销售核心业务流程，包含库存管理与实时扣款。',
    updatedAt: '10 mins ago',
    nodes: [],
    edges: []
  },
  {
    id: 'wf-2',
    name: '电脑票售票',
    description: '电脑票（乐透/数字型）投注、出票与交易确认流程。',
    updatedAt: '2 hours ago',
    nodes: [],
    edges: []
  },
  {
    id: 'wf-3',
    name: '双色球开奖',
    description: '双色球定期开奖、号码封存与奖金计算自动化流程。',
    updatedAt: '1 day ago',
    nodes: [],
    edges: []
  },
  {
    id: 'wf-4',
    name: '快乐八开奖',
    description: '快乐八高频彩种开奖数据处理与多级派奖逻辑。',
    updatedAt: '3 days ago',
    nodes: [],
    edges: []
  },
  {
    id: 'wf-5',
    name: '兑奖业务',
    description: '线上线下全渠道小额与大额奖金兑付核销流程。',
    updatedAt: '1 week ago',
    nodes: [],
    edges: []
  }
];