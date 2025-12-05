import React from 'react';
import { Panel } from '@xyflow/react';
import { 
  RotateCcw, RotateCw, Maximize, Layout, 
  Spline, Minus, CornerDownRight, Waypoints,
  MoreHorizontal, Play, Pause,
  MousePointer2, Hand
} from 'lucide-react';
import { Edge } from '@xyflow/react';

interface CanvasControlsProps {
  onFitView: () => void;
  onLayout: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  showHistory?: boolean;
  selectedEdge?: Edge | null;
  onEdgeUpdate?: (edgeId: string, data: any) => void;
  interactionMode?: 'pan' | 'select';
  onInteractionModeChange?: (mode: 'pan' | 'select') => void;
}

const ControlButton = ({ onClick, disabled, icon: Icon, label, active }: any) => (
  <div className="relative group">
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed
        ${active ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100 text-slate-600'}
      `}
      aria-label={label}
    >
      <Icon size={18} />
    </button>
    {/* Tooltip */}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
      {label}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
    </div>
  </div>
);

const CanvasControls: React.FC<CanvasControlsProps> = ({
  onFitView,
  onLayout,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  showHistory = true,
  selectedEdge,
  onEdgeUpdate,
  interactionMode = 'pan',
  onInteractionModeChange
}) => {
  const handleStyleChange = (key: string, value: any) => {
    if (selectedEdge && onEdgeUpdate) {
      if (key === 'animated') {
        onEdgeUpdate(selectedEdge.id, { animated: value });
      } else if (key === 'style') {
        onEdgeUpdate(selectedEdge.id, { style: { ...selectedEdge.style, ...value } });
      } else {
        onEdgeUpdate(selectedEdge.id, { data: { ...selectedEdge.data, [key]: value } });
      }
    }
  };

  const currentPathType = selectedEdge?.data?.pathType || 'smoothstep';
  const isDashed = selectedEdge?.style?.strokeDasharray === '5 5';
  const isDotted = selectedEdge?.style?.strokeDasharray === '2 2';
  const isSolid = !selectedEdge?.style?.strokeDasharray;

  return (
    <Panel position="bottom-center" className="mb-8 flex flex-col gap-2 items-center">
      {/* Edge controls removed as they are now in the right panel */}
      <div className="bg-white p-1 rounded-lg shadow-lg border border-slate-200 flex items-center gap-1">
        {onInteractionModeChange && (
          <>
            <ControlButton 
              onClick={() => onInteractionModeChange('select')} 
              active={interactionMode === 'select'}
              icon={MousePointer2} 
              label="Select Mode" 
            />
            <ControlButton 
              onClick={() => onInteractionModeChange('pan')} 
              active={interactionMode === 'pan'}
              icon={Hand} 
              label="Pan Mode" 
            />
            <div className="w-px h-6 bg-slate-200 mx-1" />
          </>
        )}

        {showHistory && (
          <>
            <ControlButton 
              onClick={onUndo} 
              disabled={!canUndo} 
              icon={RotateCcw} 
              label="Undo" 
            />
            <ControlButton 
              onClick={onRedo} 
              disabled={!canRedo} 
              icon={RotateCw} 
              label="Redo" 
            />
            <div className="w-px h-6 bg-slate-200 mx-1" />
          </>
        )}
        
        <ControlButton 
          onClick={onFitView} 
          disabled={false} 
          icon={Maximize} 
          label="Fit View" 
        />
      </div>
    </Panel>
  );
};

export default CanvasControls;