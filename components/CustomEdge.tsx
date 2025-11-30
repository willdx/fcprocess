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
  data = {},
}: EdgeProps) => {
  const { setEdges, getZoom } = useReactFlow();
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // State for dragging
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const originalOffset = useRef({ x: 0, y: 0 });

  // Read properties from data
  const readOnly = data?.readOnly as boolean;
  const labelOffset = (data?.labelOffset as { x: number; y: number }) || { x: 0, y: 0 };

  // Sync state if label changes externally (e.g. undo/redo)
  useEffect(() => {
    setLabelText((label as string) || '');
  }, [label]);

  // Focus textarea when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
        textareaRef.current.focus();
        // Move cursor to end
        textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
    }
  }, [isEditing]);

  const onEdgeDoubleClick = useCallback((evt: React.MouseEvent) => {
    evt.stopPropagation();
    evt.preventDefault();
    if (!readOnly) {
      setIsEditing(true);
    }
  }, [readOnly]);

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
    // Press Ctrl+Enter or Cmd+Enter to save, simple Enter allows new line
    if (evt.key === 'Enter' && (evt.ctrlKey || evt.metaKey)) {
        onLabelBlur();
    }
  }, [onLabelBlur]);

  const onLabelChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLabelText(evt.target.value);
  }, []);

  const onMouseDown = (evt: React.MouseEvent) => {
    if (readOnly || isEditing) return;
    
    // Allow default behavior if clicking controls/inputs, but here it's a div
    evt.stopPropagation();
    evt.preventDefault();

    isDragging.current = true;
    dragStart.current = { x: evt.clientX, y: evt.clientY };
    originalOffset.current = labelOffset;

    const onMouseMove = (moveEvt: MouseEvent) => {
        if (!isDragging.current) return;
        
        const zoom = getZoom();
        const dx = (moveEvt.clientX - dragStart.current.x) / zoom;
        const dy = (moveEvt.clientY - dragStart.current.y) / zoom;

        const newOffset = {
            x: originalOffset.current.x + dx,
            y: originalOffset.current.y + dy
        };

        setEdges((edges) => edges.map((e) => {
            if (e.id === id) {
                return { 
                    ...e, 
                    data: { ...e.data, labelOffset: newOffset } 
                };
            }
            return e;
        }));
    };

    const onMouseUp = () => {
        isDragging.current = false;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const finalX = labelX + labelOffset.x;
  const finalY = labelY + labelOffset.y;

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      
      {/* Invisible wider path for easier interaction */}
      <path
        d={edgePath}
        fill="none"
        strokeOpacity={0}
        strokeWidth={20}
        className="react-flow__edge-interaction"
        onDoubleClick={onEdgeDoubleClick}
        style={{ cursor: readOnly ? 'default' : 'pointer', pointerEvents: 'stroke' }} 
      />

      <EdgeLabelRenderer>
        {(isEditing || label) && (
          <div
            style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${finalX}px,${finalY}px)`,
                pointerEvents: 'all',
                zIndex: 10,
            }}
            className="nodrag nopan"
          >
              {isEditing ? (
                  <textarea
                      ref={textareaRef}
                      value={labelText}
                      onChange={onLabelChange}
                      onBlur={onLabelBlur}
                      onKeyDown={onLabelKeyDown}
                      className="text-xs border border-blue-500 rounded px-2 py-1 bg-white shadow-sm outline-none font-sans text-slate-700 resize"
                      style={{ minWidth: '80px', minHeight: '40px', textAlign: 'center' }}
                      placeholder="Label..."
                  />
              ) : (
                  <div 
                      onDoubleClick={onEdgeDoubleClick}
                      onMouseDown={onMouseDown}
                      className={
                          `px-2 py-1 rounded text-xs font-medium transition-all flex items-center justify-center bg-white border border-slate-200 text-slate-600 whitespace-pre-wrap text-center
                           ${!readOnly ? 'cursor-move hover:shadow-sm hover:border-blue-300' : ''}
                           ${selected ? '!border-blue-500 shadow-sm' : ''}
                          `
                      }
                      title={readOnly ? '' : "Double click to edit, drag to move"}
                      style={{ maxWidth: '200px' }}
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