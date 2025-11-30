import React, { useState, useCallback, useRef, useEffect, memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getSmoothStepPath, useReactFlow } from '@xyflow/react';

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  selected,
}: EdgeProps) => {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [labelText, setLabelText] = useState((label as string) || '');
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync state if label changes externally (e.g. undo/redo)
  useEffect(() => {
    setLabelText((label as string) || '');
  }, [label]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
        inputRef.current.focus();
    }
  }, [isEditing]);

  const onEdgeDoubleClick = useCallback((evt: React.MouseEvent) => {
    evt.stopPropagation();
    evt.preventDefault();
    setIsEditing(true);
  }, []);

  const onLabelBlur = useCallback(() => {
    setIsEditing(false);
    setEdges((edges) => edges.map((e) => {
      if (e.id === id) {
        return { ...e, label: labelText };
      }
      return e;
    }));
  }, [id, labelText, setEdges]);

  const onLabelKeyDown = useCallback((evt: React.KeyboardEvent) => {
    if (evt.key === 'Enter') {
        onLabelBlur();
    }
  }, [onLabelBlur]);

  const onLabelChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    setLabelText(evt.target.value);
  }, []);

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      
      {/* Invisible wider path for easier interaction (Double click anywhere on edge) */}
      <path
        d={edgePath}
        fill="none"
        strokeOpacity={0}
        strokeWidth={20}
        className="react-flow__edge-interaction"
        onDoubleClick={onEdgeDoubleClick}
        style={{ cursor: 'pointer', pointerEvents: 'stroke' }} 
      />

      <EdgeLabelRenderer>
        {(isEditing || label) && (
          <div
            style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                pointerEvents: 'all',
                zIndex: 10,
            }}
            className="nodrag nopan"
          >
              {isEditing ? (
                  <input
                      ref={inputRef}
                      value={labelText}
                      onChange={onLabelChange}
                      onBlur={onLabelBlur}
                      onKeyDown={onLabelKeyDown}
                      className="text-xs border border-blue-500 rounded px-2 py-1 bg-white shadow-sm outline-none font-sans text-slate-700"
                      style={{ minWidth: '60px', textAlign: 'center' }}
                      placeholder="Label..."
                  />
              ) : (
                  <div 
                      onDoubleClick={onEdgeDoubleClick}
                      className={
                          `px-2 py-0.5 rounded text-xs font-medium transition-all cursor-pointer flex items-center justify-center bg-white border border-slate-200 text-slate-600 hover:shadow-sm hover:border-blue-300
                           ${selected ? '!border-blue-500 shadow-sm' : ''}
                          `
                      }
                      title="Double click to edit label"
                  >
                      {label}
                  </div>
              )}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
};

export default memo(CustomEdge);