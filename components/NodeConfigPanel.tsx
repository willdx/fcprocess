import React, { useEffect, useState } from 'react';
import { Node } from '@xyflow/react';
import { X, Database, Palette, ChevronDown } from 'lucide-react';
import { ICON_MAP } from '../constants';

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

const ICON_OPTIONS = Object.keys(ICON_MAP);

const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({ selectedNode, onUpdate, onClose, readOnly = false }) => {
  const [activeTab, setActiveTab] = useState<'data' | 'style'>('data');
  
  // Data State
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [namespace, setNamespace] = useState('yf-pro-biz');
  const [stepNumber, setStepNumber] = useState('');
  
  // Style State
  const [icon, setIcon] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('');
  const [textColor, setTextColor] = useState('');
  const [containerBg, setContainerBg] = useState('');
  const [borderColor, setBorderColor] = useState('');
  const [borderWidth, setBorderWidth] = useState<number | undefined>(undefined);
  const [borderRadius, setBorderRadius] = useState<number | undefined>(undefined);
  const [labelColor, setLabelColor] = useState('');

  useEffect(() => {
    if (selectedNode) {
      // Data
      setLabel(selectedNode.data.label as string || '');
      setDescription(selectedNode.data.description as string || '');
      setNamespace(selectedNode.data.namespace as string || 'yf-pro-biz');
      setStepNumber(selectedNode.data.stepNumber as string || '');
      
      // Style
      const style = selectedNode.data.style as any || {};
      setIcon(style.icon || '');
      setBackgroundColor(style.backgroundColor || '');
      setTextColor(style.color || '');
      setContainerBg(style.containerBg || '');
      setBorderColor(style.borderColor || '');
      setBorderWidth(style.borderWidth);
      setBorderRadius(style.borderRadius);
      setLabelColor(style.labelColor || '');
    }
  }, [selectedNode]);

  if (!selectedNode) return null;

  // Commit changes to the global state
  const handleUpdate = (updates: any) => {
    if (readOnly) return;
    
    // If updating style, we need to merge it into the 'style' object in data
    if (updates.style) {
        const currentStyle = (selectedNode.data.style as object) || {};
        onUpdate(selectedNode.id, {
            ...selectedNode.data,
            style: { ...currentStyle, ...updates.style }
        });
    } else {
        // Normal data update
        onUpdate(selectedNode.id, {
            ...selectedNode.data,
            ...updates
        });
    }
  };

  return (
    <aside className="w-80 bg-white border-l border-slate-200 h-full flex flex-col shadow-xl z-10 absolute right-0 top-0 bottom-0">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <h2 className="font-semibold text-slate-800">Configuration</h2>
        <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded text-slate-500">
          <X size={18} />
        </button>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
            onClick={() => setActiveTab('data')}
            className={`flex-1 py-3 text-xs font-medium flex items-center justify-center gap-2 border-b-2 transition-colors
                ${activeTab === 'data' ? 'border-blue-500 text-blue-600 bg-blue-50/30' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}
            `}
        >
            <Database size={14} />
            Data
        </button>
        <button
            onClick={() => setActiveTab('style')}
            className={`flex-1 py-3 text-xs font-medium flex items-center justify-center gap-2 border-b-2 transition-colors
                ${activeTab === 'style' ? 'border-blue-500 text-blue-600 bg-blue-50/30' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}
            `}
        >
            <Palette size={14} />
            Style
        </button>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase">Node ID</label>
          <div className="p-2 bg-slate-100 rounded text-xs font-mono text-slate-600 truncate select-all">
            {selectedNode.id}
          </div>
        </div>

        {activeTab === 'data' ? (
            <>
                <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">NAME</label>
                <input 
                    type="text" 
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    onBlur={() => handleUpdate({ label })}
                    disabled={readOnly}
                    className="w-full p-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                />
                </div>

                {selectedNode.type === 'custom' && (selectedNode.data.type === 'step') && (
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Step Number</label>
                        <input 
                            type="text" 
                            value={stepNumber}
                            onChange={(e) => setStepNumber(e.target.value)}
                            onBlur={() => handleUpdate({ stepNumber })}
                            disabled={readOnly}
                            className="w-full p-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                        />
                    </div>
                )}

                <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Namespace</label>
                <div className="relative">
                    <select
                    value={namespace}
                    onChange={(e) => {
                        const newVal = e.target.value;
                        setNamespace(newVal);
                        handleUpdate({ namespace: newVal });
                    }}
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
                    onBlur={() => handleUpdate({ description })}
                    disabled={readOnly}
                    rows={4}
                    className="w-full p-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none disabled:bg-slate-50 disabled:text-slate-500"
                />
                </div>
            </>
        ) : (
            <div className="space-y-6">
                {/* Icon Settings - Hide for Group nodes */}
                {selectedNode.type !== 'group' && (
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-900 border-b pb-1">ICON SETTINGS</h3>
                    
                    {/* Icon Selector */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Icon</label>
                        <div className="relative">
                            <select
                                value={icon}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setIcon(val);
                                    handleUpdate({ style: { icon: val || undefined } });
                                }}
                                disabled={readOnly}
                                className="w-full p-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none bg-white"
                            >
                                <option value="">Default</option>
                                {ICON_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                <ChevronDown size={14} />
                            </div>
                        </div>
                    </div>

                    {/* Icon Background */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Icon Background</label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="color" 
                                value={backgroundColor || '#ffffff'}
                                onChange={(e) => {
                                    setBackgroundColor(e.target.value);
                                    handleUpdate({ style: { backgroundColor: e.target.value } });
                                }}
                                disabled={readOnly}
                                className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
                            />
                            <div className="flex-1 flex gap-2">
                                <input 
                                    type="text" 
                                    value={backgroundColor}
                                    onChange={(e) => setBackgroundColor(e.target.value)}
                                    onBlur={(e) => handleUpdate({ style: { backgroundColor: e.target.value } })}
                                    placeholder="Default"
                                    className="flex-1 p-1.5 border border-slate-200 rounded text-xs font-mono"
                                />
                                {backgroundColor && (
                                    <button 
                                        onClick={() => {
                                            setBackgroundColor('');
                                            handleUpdate({ style: { backgroundColor: undefined } });
                                        }}
                                        className="text-xs text-slate-400 hover:text-red-500"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Icon Color */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Icon Color</label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="color" 
                                value={textColor || '#000000'}
                                onChange={(e) => {
                                    setTextColor(e.target.value);
                                    handleUpdate({ style: { color: e.target.value } });
                                }}
                                disabled={readOnly}
                                className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
                            />
                            <div className="flex-1 flex gap-2">
                                <input 
                                    type="text" 
                                    value={textColor}
                                    onChange={(e) => setTextColor(e.target.value)}
                                    onBlur={(e) => handleUpdate({ style: { color: e.target.value } })}
                                    placeholder="Default"
                                    className="flex-1 p-1.5 border border-slate-200 rounded text-xs font-mono"
                                />
                                {textColor && (
                                    <button 
                                        onClick={() => {
                                            setTextColor('');
                                            handleUpdate({ style: { color: undefined } });
                                        }}
                                        className="text-xs text-slate-400 hover:text-red-500"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                )}

                {/* Container Settings */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-900 border-b pb-1">CONTAINER SETTINGS</h3>

                    {/* Shape Selector */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Shape</label>
                        <div className="grid grid-cols-4 gap-2">
                            {['rounded', 'rectangle', 'circle', 'diamond'].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => {
                                        // setShape(s); // We need to add state for shape
                                        handleUpdate({ style: { shape: s } });
                                    }}
                                    className={`
                                        py-2 px-1 rounded border text-xs capitalize transition-colors
                                        ${(selectedNode.data.style as any)?.shape === s || (!((selectedNode.data.style as any)?.shape) && s === 'rounded')
                                            ? 'bg-blue-50 border-blue-500 text-blue-600 font-medium'
                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}
                                    `}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Container Background */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Background</label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="color" 
                                value={containerBg || '#ffffff'}
                                onChange={(e) => {
                                    setContainerBg(e.target.value);
                                    handleUpdate({ style: { containerBg: e.target.value } });
                                }}
                                disabled={readOnly}
                                className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
                            />
                            <div className="flex-1 flex gap-2">
                                <input 
                                    type="text" 
                                    value={containerBg}
                                    onChange={(e) => setContainerBg(e.target.value)}
                                    onBlur={(e) => handleUpdate({ style: { containerBg: e.target.value } })}
                                    placeholder="Default (White)"
                                    className="flex-1 p-1.5 border border-slate-200 rounded text-xs font-mono"
                                />
                                {containerBg && (
                                    <button 
                                        onClick={() => {
                                            setContainerBg('');
                                            handleUpdate({ style: { containerBg: undefined } });
                                        }}
                                        className="text-xs text-slate-400 hover:text-red-500"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Border Color */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Border Color</label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="color" 
                                value={borderColor || '#e2e8f0'}
                                onChange={(e) => {
                                    setBorderColor(e.target.value);
                                    handleUpdate({ style: { borderColor: e.target.value } });
                                }}
                                disabled={readOnly}
                                className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
                            />
                            <div className="flex-1 flex gap-2">
                                <input 
                                    type="text" 
                                    value={borderColor}
                                    onChange={(e) => setBorderColor(e.target.value)}
                                    onBlur={(e) => handleUpdate({ style: { borderColor: e.target.value } })}
                                    placeholder="Default"
                                    className="flex-1 p-1.5 border border-slate-200 rounded text-xs font-mono"
                                />
                                {borderColor && (
                                    <button 
                                        onClick={() => {
                                            setBorderColor('');
                                            handleUpdate({ style: { borderColor: undefined } });
                                        }}
                                        className="text-xs text-slate-400 hover:text-red-500"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Border Width & Radius */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Border Width</label>
                            <input 
                                type="number" 
                                min="0"
                                max="10"
                                value={borderWidth !== undefined ? borderWidth : ''}
                                onChange={(e) => {
                                    const val = e.target.value ? Number(e.target.value) : undefined;
                                    setBorderWidth(val);
                                    handleUpdate({ style: { borderWidth: val } });
                                }}
                                placeholder="Default"
                                className="w-full p-2 border border-slate-200 rounded-md text-sm outline-none"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Radius</label>
                            <input 
                                type="number" 
                                min="0"
                                max="50"
                                value={borderRadius !== undefined ? borderRadius : ''}
                                onChange={(e) => {
                                    const val = e.target.value ? Number(e.target.value) : undefined;
                                    setBorderRadius(val);
                                    handleUpdate({ style: { borderRadius: val } });
                                }}
                                placeholder="Default"
                                className="w-full p-2 border border-slate-200 rounded-md text-sm outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Label Settings */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-900 border-b pb-1">LABEL SETTINGS</h3>
                    
                    {/* Label Color */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Text Color</label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="color" 
                                value={labelColor || '#0f172a'}
                                onChange={(e) => {
                                    setLabelColor(e.target.value);
                                    handleUpdate({ style: { labelColor: e.target.value } });
                                }}
                                disabled={readOnly}
                                className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
                            />
                            <div className="flex-1 flex gap-2">
                                <input 
                                    type="text" 
                                    value={labelColor}
                                    onChange={(e) => setLabelColor(e.target.value)}
                                    onBlur={(e) => handleUpdate({ style: { labelColor: e.target.value } })}
                                    placeholder="Default"
                                    className="flex-1 p-1.5 border border-slate-200 rounded text-xs font-mono"
                                />
                                {labelColor && (
                                    <button 
                                        onClick={() => {
                                            setLabelColor('');
                                            handleUpdate({ style: { labelColor: undefined } });
                                        }}
                                        className="text-xs text-slate-400 hover:text-red-500"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
    </aside>
  );
};

export default NodeConfigPanel;