import React from 'react';
import { Panel } from '@xyflow/react';
import { RotateCcw, RotateCw, Maximize, Layout } from 'lucide-react';

interface CanvasControlsProps {
  onFitView: () => void;
  onLayout: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  showHistory?: boolean;
}

const ControlButton = ({ onClick, disabled, icon: Icon, label }: any) => (
  <div className="relative group">
    <button
      onClick={onClick}
      disabled={disabled}
      className="p-2 hover:bg-slate-100 text-slate-600 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
  showHistory = true
}) => {
  return (
    <Panel position="bottom-center" className="mb-8">
      <div className="bg-white p-1 rounded-lg shadow-lg border border-slate-200 flex items-center gap-1">
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
        <ControlButton 
          onClick={onLayout} 
          disabled={false} 
          icon={Layout} 
          label="Re-layout" 
        />
      </div>
    </Panel>
  );
};

export default CanvasControls;