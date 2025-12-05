import React, { useState, useCallback } from 'react';
import { NodeResizer, NodeProps, useReactFlow, Node, Handle, Position } from '@xyflow/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

const GroupNode = ({ id, data, selected }: NodeProps) => {
  const { setNodes } = useReactFlow();
  const [isHovered, setIsHovered] = useState(false);
  
  const isCollapsed = data.collapsed as boolean;
  const label = (data.label as string) || 'Group';
  const style = (data.style as any) || {};
  
  const backgroundColor = style.containerBg || style.backgroundColor || 'rgba(240, 244, 255, 0.3)';
  const borderColor = style.borderColor || '#3b82f6';
  const color = style.color || '#1e293b';

  const handleToggleCollapse = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    setNodes((nodes) => {
      // Find the group node to get its current state
      const groupNode = nodes.find((n) => n.id === id);
      if (!groupNode) return nodes;

      const newCollapsedState = !groupNode.data.collapsed;
      
      return nodes.map((node) => {
        // 1. Update the group node itself
        if (node.id === id) {
          const currentData = node.data;
          let newData = { ...currentData, collapsed: newCollapsedState };
          let newStyle = { ...node.style };

          if (newCollapsedState) {
            // Collapsing: Save height and set to header height
            if (!(currentData as any).expandedHeight) {
               newData = { ...newData, expandedHeight: node.measured?.height || node.style?.height || 300 } as any;
            }
            newStyle = { ...newStyle, height: 40 };
          } else {
            // Expanding: Restore height
            newStyle = { ...newStyle, height: (currentData as any).expandedHeight || 300 };
          }

          return { ...node, data: newData, style: newStyle };
        }

        // 2. Update children visibility
        if (node.parentId === id) {
          return { ...node, hidden: newCollapsedState };
        }

        return node;
      });
    });
  }, [id, setNodes]);

  const handleVisibilityClass = "opacity-0 group-hover:opacity-100";
  const commonHandleClass = `!w-2 !h-2 transition-opacity duration-200 ${handleVisibilityClass}`;

  return (
    <div 
      className="relative w-full h-full group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <NodeResizer 
        isVisible={(selected || isHovered) && !isCollapsed} 
        minWidth={100} 
        minHeight={50} 
        lineStyle={{ border: '1px solid #3b82f6', opacity: 0.5 }}
        handleStyle={{ width: 12, height: 12, borderRadius: 2, backgroundColor: '#3b82f6', border: '2px solid white' }}
      />
      
      <div 
        className="relative w-full h-full rounded-lg border-2 transition-all duration-200 overflow-hidden"
        style={{
          backgroundColor: isCollapsed ? 'white' : backgroundColor,
          borderColor: borderColor,
          borderStyle: 'dashed',
        }}
      >
        {/* Header */}
        <div 
          className="absolute top-0 left-0 right-0 h-10 flex items-center px-2 bg-white/50 hover:bg-white/80 transition-colors cursor-pointer"
          onClick={handleToggleCollapse}
        >
          <div className="p-1 rounded hover:bg-slate-200 mr-2">
             {isCollapsed ? <ChevronRight size={14} className="text-slate-600" /> : <ChevronDown size={14} className="text-slate-600" />}
          </div>
          <span className="text-sm font-semibold select-none" style={{ color }}>{label}</span>
        </div>

        {/* Content Area (only visible when not collapsed) */}
        {!isCollapsed && (
          <div className="w-full h-full pt-10" />
        )}
      </div>

      {/* Connection Handles - Matching CustomNode Style */}
      {/* Top */}
      <Handle type="target" position={Position.Top} id="t-top-left" style={{ left: '25%', top: -6 }} className={clsx("!bg-slate-400", commonHandleClass)} />
      <Handle type="target" position={Position.Top} id="t-top" style={{ left: '50%', top: -6 }} className={clsx("!bg-slate-400", commonHandleClass)} />
      <Handle type="target" position={Position.Top} id="t-top-right" style={{ left: '75%', top: -6 }} className={clsx("!bg-slate-400", commonHandleClass)} />

      <Handle type="source" position={Position.Top} id="s-top-left" style={{ left: '25%', top: -6 }} className={clsx("!bg-blue-500", commonHandleClass)} />
      <Handle type="source" position={Position.Top} id="s-top" style={{ left: '50%', top: -6 }} className={clsx("!bg-blue-500", commonHandleClass)} />
      <Handle type="source" position={Position.Top} id="s-top-right" style={{ left: '75%', top: -6 }} className={clsx("!bg-blue-500", commonHandleClass)} />
      
      {/* Right */}
      <Handle type="target" position={Position.Right} id="t-right-top" style={{ top: '25%', right: -6 }} className={clsx("!bg-slate-400", commonHandleClass)} />
      <Handle type="target" position={Position.Right} id="t-right" style={{ top: '50%', right: -6 }} className={clsx("!bg-slate-400", commonHandleClass)} />
      <Handle type="target" position={Position.Right} id="t-right-bottom" style={{ top: '75%', right: -6 }} className={clsx("!bg-slate-400", commonHandleClass)} />

      <Handle type="source" position={Position.Right} id="s-right-top" style={{ top: '25%', right: -6 }} className={clsx("!bg-blue-500", commonHandleClass)} />
      <Handle type="source" position={Position.Right} id="s-right" style={{ top: '50%', right: -6 }} className={clsx("!bg-blue-500", commonHandleClass)} />
      <Handle type="source" position={Position.Right} id="s-right-bottom" style={{ top: '75%', right: -6 }} className={clsx("!bg-blue-500", commonHandleClass)} />

      {/* Bottom */}
      <Handle type="target" position={Position.Bottom} id="t-bottom-left" style={{ left: '25%', bottom: -6 }} className={clsx("!bg-slate-400", commonHandleClass)} />
      <Handle type="target" position={Position.Bottom} id="t-bottom" style={{ left: '50%', bottom: -6 }} className={clsx("!bg-slate-400", commonHandleClass)} />
      <Handle type="target" position={Position.Bottom} id="t-bottom-right" style={{ left: '75%', bottom: -6 }} className={clsx("!bg-slate-400", commonHandleClass)} />

      <Handle type="source" position={Position.Bottom} id="s-bottom-left" style={{ left: '25%', bottom: -6 }} className={clsx("!bg-blue-500", commonHandleClass)} />
      <Handle type="source" position={Position.Bottom} id="s-bottom" style={{ left: '50%', bottom: -6 }} className={clsx("!bg-blue-500", commonHandleClass)} />
      <Handle type="source" position={Position.Bottom} id="s-bottom-right" style={{ left: '75%', bottom: -6 }} className={clsx("!bg-blue-500", commonHandleClass)} />

      {/* Left */}
      <Handle type="target" position={Position.Left} id="t-left-top" style={{ top: '25%', left: -6 }} className={clsx("!bg-slate-400", commonHandleClass)} />
      <Handle type="target" position={Position.Left} id="t-left" style={{ top: '50%', left: -6 }} className={clsx("!bg-slate-400", commonHandleClass)} />
      <Handle type="target" position={Position.Left} id="t-left-bottom" style={{ top: '75%', left: -6 }} className={clsx("!bg-slate-400", commonHandleClass)} />

      <Handle type="source" position={Position.Left} id="s-left-top" style={{ top: '25%', left: -6 }} className={clsx("!bg-blue-500", commonHandleClass)} />
      <Handle type="source" position={Position.Left} id="s-left" style={{ top: '50%', left: -6 }} className={clsx("!bg-blue-500", commonHandleClass)} />
      <Handle type="source" position={Position.Left} id="s-left-bottom" style={{ top: '75%', left: -6 }} className={clsx("!bg-blue-500", commonHandleClass)} />
    </div>
  );
};

export default GroupNode;
