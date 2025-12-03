import React, { useEffect, useState } from 'react';
import { Edge, MarkerType } from '@xyflow/react';
import { X, Spline, Minus, CornerDownRight, Waypoints, MoreHorizontal, Play, Pause } from 'lucide-react';

interface EdgeConfigPanelProps {
  selectedEdge: Edge | null;
  onUpdate: (id: string, updates: any) => void;
  onClose: () => void;
  readOnly?: boolean;
}

const EdgeConfigPanel: React.FC<EdgeConfigPanelProps> = ({ selectedEdge, onUpdate, onClose, readOnly = false }) => {
  const [label, setLabel] = useState('');
  const [pathType, setPathType] = useState('smoothstep');
  const [strokeWidth, setStrokeWidth] = useState(1.5);
  const [strokeColor, setStrokeColor] = useState('#94a3b8');
  const [strokeDasharray, setStrokeDasharray] = useState('5 5'); // Default dashed
  const [animated, setAnimated] = useState(false);
  const [markerEndType, setMarkerEndType] = useState<MarkerType | undefined>(MarkerType.ArrowClosed);

  useEffect(() => {
    if (selectedEdge) {
      setLabel((selectedEdge.label as string) || '');
      setPathType(selectedEdge.data?.pathType as string || 'smoothstep');
      setStrokeWidth(Number(selectedEdge.style?.strokeWidth) || 1.5);
      setStrokeColor(selectedEdge.style?.stroke as string || '#94a3b8');
      setStrokeDasharray(selectedEdge.style?.strokeDasharray as string || '');
      setAnimated(selectedEdge.animated || false);
      
      // Handle markerEnd safely
      const mEnd = selectedEdge.markerEnd;
      if (typeof mEnd === 'object' && mEnd !== null) {
          setMarkerEndType(mEnd.type as MarkerType);
      } else if (typeof mEnd === 'string') {
          // If it's just a string ID (less common in simple setups but possible)
           setMarkerEndType(undefined);
      } else {
          setMarkerEndType(undefined);
      }
    }
  }, [selectedEdge]);

  if (!selectedEdge) return null;

  const handleUpdate = (updates: any) => {
    if (readOnly) return;
    onUpdate(selectedEdge.id, updates);
  };

  const updateStyle = (styleUpdates: any) => {
    const newStyle = { ...selectedEdge.style, ...styleUpdates };
    handleUpdate({ style: newStyle });
  };

  const updateData = (dataUpdates: any) => {
    const newData = { ...selectedEdge.data, ...dataUpdates };
    handleUpdate({ data: newData });
  };

  return (
    <aside className="w-80 bg-white border-l border-slate-200 h-full flex flex-col shadow-xl z-10 absolute right-0 top-0 bottom-0">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <h2 className="font-semibold text-slate-800">Edge Configuration</h2>
        <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded text-slate-500">
          <X size={18} />
        </button>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        {/* ID Display */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase">Edge ID</label>
          <div className="p-2 bg-slate-100 rounded text-xs font-mono text-slate-600 truncate select-all">
            {selectedEdge.id}
          </div>
        </div>

        {/* Label */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase">Label</label>
          <input 
            type="text" 
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={() => handleUpdate({ label })}
            disabled={readOnly}
            className="w-full p-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-500"
            placeholder="Enter label..."
          />
        </div>

        <hr className="border-slate-100" />

        {/* Path Type */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase">Path Type</label>
          <div className="grid grid-cols-4 gap-2">
             {[
                { type: 'bezier', icon: Spline, label: 'Bezier' },
                { type: 'straight', icon: Minus, label: 'Straight' },
                { type: 'step', icon: CornerDownRight, label: 'Step' },
                { type: 'smoothstep', icon: Waypoints, label: 'Smooth' },
             ].map(({ type, icon: Icon, label }) => (
               <button
                 key={type}
                 onClick={() => {
                     setPathType(type);
                     updateData({ pathType: type });
                 }}
                 disabled={readOnly}
                 className={`flex flex-col items-center justify-center p-2 rounded border transition-all text-xs gap-1
                   ${pathType === type 
                     ? 'bg-blue-50 border-blue-500 text-blue-600' 
                     : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-slate-50'}
                 `}
                 title={label}
               >
                 <Icon size={16} />
                 <span className="scale-90">{label}</span>
               </button>
             ))}
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Style Controls */}
        <div className="space-y-4">
            <label className="text-xs font-semibold text-slate-500 uppercase">Style</label>
            
            {/* Stroke Style */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600 w-20">Type</span>
                <div className="flex bg-slate-100 p-1 rounded-md flex-1">
                    {[
                        { val: '', icon: Minus, label: 'Solid' },
                        { val: '5 5', icon: MoreHorizontal, label: 'Dashed' },
                        { val: '2 2', icon: MoreHorizontal, label: 'Dotted' }, // Re-using icon but logic differs
                    ].map((opt, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setStrokeDasharray(opt.val);
                                updateStyle({ strokeDasharray: opt.val });
                            }}
                            disabled={readOnly}
                            className={`flex-1 flex justify-center py-1 rounded text-xs transition-colors
                                ${strokeDasharray === opt.val 
                                    ? 'bg-white shadow-sm text-blue-600 font-medium' 
                                    : 'text-slate-500 hover:text-slate-700'}
                            `}
                            title={opt.label}
                        >
                            {opt.label === 'Dotted' ? <span className="tracking-widest">...</span> : <opt.icon size={14} />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Color */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600 w-20">Color</span>
                <div className="flex items-center gap-2 flex-1">
                    <input 
                        type="color" 
                        value={strokeColor}
                        onChange={(e) => {
                            setStrokeColor(e.target.value);
                            updateStyle({ stroke: e.target.value });
                            // Also update marker color to match
                            handleUpdate({ markerEnd: { type: markerEndType, color: e.target.value } });
                        }}
                        disabled={readOnly}
                        className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
                    />
                    <span className="text-xs text-slate-500 font-mono">{strokeColor}</span>
                </div>
            </div>

            {/* Width */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600 w-20">Width</span>
                <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    step="0.5"
                    value={strokeWidth}
                    onChange={(e) => {
                        const val = Number(e.target.value);
                        setStrokeWidth(val);
                        updateStyle({ strokeWidth: val });
                    }}
                    disabled={readOnly}
                    className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="text-xs text-slate-500 w-6 text-right">{strokeWidth}px</span>
            </div>

            {/* Animation */}
            <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-slate-600">Animated</span>
                <button
                    onClick={() => {
                        const newVal = !animated;
                        setAnimated(newVal);
                        handleUpdate({ animated: newVal });
                    }}
                    disabled={readOnly}
                    className={`
                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                        ${animated ? 'bg-blue-600' : 'bg-slate-200'}
                    `}
                >
                    <span
                        className={`
                            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                            ${animated ? 'translate-x-6' : 'translate-x-1'}
                        `}
                    />
                </button>
            </div>
        </div>

      </div>
    </aside>
  );
};

export default EdgeConfigPanel;
