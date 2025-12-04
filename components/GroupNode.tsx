import React, { useState, useCallback } from 'react';
import { NodeResizer, NodeProps, useReactFlow, Node } from '@xyflow/react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const GroupNode = ({ id, data, selected }: NodeProps) => {
  const { getNodes, setNodes } = useReactFlow();
  // We use internal state for UI toggle, but actual logic should be based on data to persist
  const isCollapsed = data.collapsed as boolean;

  const style = (data.style as any) || {};
  const label = (data.label as string) || 'Group';
  const backgroundColor = style.containerBg || style.backgroundColor || 'rgba(240, 244, 255, 0.3)';
  const borderColor = style.borderColor || '#3b82f6';
  const color = style.color || '#1e293b';

  const handleToggleCollapse = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    const nodes = getNodes();
    const children = nodes.filter(n => n.parentId === id);
    
    const newCollapsedState = !isCollapsed;

    // 1. Update Group Node (self)
    // We need to store the original height to restore it later
    setNodes((nds) => nds.map((n) => {
      if (n.id === id) {
        const currentStyle = n.style || {};
        const currentData = n.data || {};
        
        let newStyle = { ...currentStyle };
        let newData = { ...currentData, collapsed: newCollapsedState };

        if (newCollapsedState) {
          // Collapsing
          // Save original height if not already saved
          if (!(currentData as any).expandedHeight) {
             newData = { ...newData, expandedHeight: n.measured?.height || n.style?.height || 300 } as any;
          }
          newStyle.height = 40; // Header height
        } else {
          // Expanding
          // Restore height
          newStyle.height = (currentData as any).expandedHeight || 300;
        }

        return {
          ...n,
          data: newData,
          style: newStyle
        };
      }
      
      // 2. Update Children (Hide/Show)
      if (n.parentId === id) {
        return {
          ...n,
          hidden: newCollapsedState
        };
      }
      
      return n;
    }));

  }, [id, isCollapsed, getNodes, setNodes]);

  return (
    <>
      <NodeResizer 
        isVisible={selected && !isCollapsed} 
        minWidth={100} 
        minHeight={50} 
        lineStyle={{ border: 'none' }}
        handleStyle={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#3b82f6', border: '2px solid white' }}
      />
      
      <div 
        className="relative w-full h-full rounded-lg border-2 transition-all duration-200 group overflow-hidden"
        style={{
          backgroundColor: isCollapsed ? 'white' : backgroundColor,
          minHeight: '50px',
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
    </>
  );
};

export default GroupNode;
