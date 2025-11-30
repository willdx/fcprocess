import React, { useEffect, useState } from 'react';
import { Node } from '@xyflow/react';
import { X, Save } from 'lucide-react';

interface NodeConfigPanelProps {
  selectedNode: Node | null;
  onUpdate: (id: string, data: any) => void;
  onClose: () => void;
  readOnly?: boolean;
}

const NAMESPACE_OPTIONS = [
  'yf-pro-biz',
  'yf-pro-device',
  'yf-pro-webapp',
  'yf-pro-interim',
  'yf-pro-crypto'
];

const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({ selectedNode, onUpdate, onClose, readOnly = false }) => {
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [namespace, setNamespace] = useState('yf-pro-biz');

  useEffect(() => {
    if (selectedNode) {
      setLabel(selectedNode.data.label as string || '');
      setDescription(selectedNode.data.description as string || '');
      setNamespace(selectedNode.data.namespace as string || 'yf-pro-biz');
    }
  }, [selectedNode]);

  if (!selectedNode) return null;

  const handleSave = () => {
    onUpdate(selectedNode.id, {
      ...selectedNode.data,
      label,
      description,
      namespace
    });
  };

  return (
    <aside className="w-80 bg-white border-l border-slate-200 h-full flex flex-col shadow-xl z-10 absolute right-0 top-0 bottom-0">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <h2 className="font-semibold text-slate-800">Configuration</h2>
        <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded text-slate-500">
          <X size={18} />
        </button>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase">Node ID</label>
          <div className="p-2 bg-slate-100 rounded text-xs font-mono text-slate-600 truncate select-all">
            {selectedNode.id}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase">Service Name</label>
          <input 
            type="text" 
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            disabled={readOnly}
            className="w-full p-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase">Namespace</label>
          <div className="relative">
            <select
              value={namespace}
              onChange={(e) => setNamespace(e.target.value)}
              disabled={readOnly}
              className="w-full p-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-500 appearance-none bg-white"
            >
              {NAMESPACE_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase">Description</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={readOnly}
            rows={4}
            className="w-full p-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none disabled:bg-slate-50 disabled:text-slate-500"
          />
        </div>
      </div>

      {!readOnly && (
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <button 
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-md font-medium transition-colors"
          >
            <Save size={18} />
            Apply Changes
          </button>
        </div>
      )}
    </aside>
  );
};

export default NodeConfigPanel;