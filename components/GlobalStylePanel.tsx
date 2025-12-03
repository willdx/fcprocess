import React, { useState } from 'react';
import { DefaultEdgeOptions, MarkerType } from '@xyflow/react';
import { X, Spline, Minus, CornerDownRight, Waypoints, MoreHorizontal } from 'lucide-react';

interface GlobalStylePanelProps {
  defaultOptions: DefaultEdgeOptions;
  onUpdateDefault: (newOptions: DefaultEdgeOptions) => void;
  onApplyToAll: () => void;
  onClose: () => void;
}

const GlobalStylePanel: React.FC<GlobalStylePanelProps> = ({ defaultOptions, onUpdateDefault, onApplyToAll, onClose }) => {
  // Local state initialized from props
  const [pathType, setPathType] = useState(defaultOptions.data?.pathType || 'smoothstep');
  const [strokeWidth, setStrokeWidth] = useState(Number(defaultOptions.style?.strokeWidth) || 1.5);
  const [strokeColor, setStrokeColor] = useState(defaultOptions.style?.stroke as string || '#94a3b8');
  const [strokeDasharray, setStrokeDasharray] = useState(defaultOptions.style?.strokeDasharray as string || '5 5');
  const [animated, setAnimated] = useState(defaultOptions.animated || false);

  const handleUpdate = (key: string, value: any, isStyle = false, isData = false) => {
    const newOptions = { ...defaultOptions };
    
    if (isStyle) {
        newOptions.style = { ...newOptions.style, [key]: value };
    } else if (isData) {
        newOptions.data = { ...newOptions.data, [key]: value };
    } else {
        (newOptions as any)[key] = value;
    }

    // Special handling for color to sync with marker
    if (key === 'stroke' && isStyle) {
        newOptions.markerEnd = { type: MarkerType.ArrowClosed, color: value };
    }

    onUpdateDefault(newOptions);
  };

  return (
    <aside className="w-80 bg-white border-l border-slate-200 h-full flex flex-col shadow-xl z-10 absolute right-0 top-0 bottom-0">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <h2 className="font-semibold text-slate-800">Global Settings</h2>
        <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded text-slate-500">
          <X size={18} />
        </button>
      </div>

      <div className="p-6 space-y-8 flex-1 overflow-y-auto">
        
        {/* Default Edge Settings Section */}
        <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-bold text-slate-700">Default Edge Style</h3>
                <span className="text-xs text-slate-400 font-normal">(New connections)</span>
            </div>

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
                            handleUpdate('pathType', type, false, true); // isData=true
                        }}
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

            {/* Style Controls */}
            <div className="space-y-4 pt-2">
                {/* Stroke Style */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 w-20">Type</span>
                    <div className="flex bg-slate-100 p-1 rounded-md flex-1">
                        {[
                            { val: '', icon: Minus, label: 'Solid' },
                            { val: '5 5', icon: MoreHorizontal, label: 'Dashed' },
                            { val: '2 2', icon: MoreHorizontal, label: 'Dotted' },
                        ].map((opt, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setStrokeDasharray(opt.val);
                                    handleUpdate('strokeDasharray', opt.val, true); // isStyle=true
                                }}
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
                                handleUpdate('stroke', e.target.value, true); // isStyle=true
                            }}
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
                            handleUpdate('strokeWidth', val, true); // isStyle=true
                        }}
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
                            handleUpdate('animated', newVal);
                        }}
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
        </section>



      </div>
    </aside>
  );
};

export default GlobalStylePanel;
