import React, { useState, useCallback, useRef, useEffect, memo } from 'react';
import { 
  BaseEdge, 
  EdgeLabelRenderer, 
  EdgeProps, 
  useReactFlow,
  getSmoothStepPath,
  getBezierPath,
  getStraightPath
} from '@xyflow/react';

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

  const pathType = data?.pathType || 'smoothstep';

  // Read custom control points from data or calculate defaults
  const getDefaultControlPoints = () => {
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    
    // Default control points for bezier curve (at 1/3 and 2/3 positions)
    return {
      controlPoint1: { x: sourceX + dx * 0.25, y: sourceY + dy * 0.25 },
      controlPoint2: { x: sourceX + dx * 0.75, y: sourceY + dy * 0.75 }
    };
  };

  const savedControlPoints = data?.controlPoints as { controlPoint1: { x: number; y: number }; controlPoint2: { x: number; y: number } } | undefined;
  const defaultControlPoints = getDefaultControlPoints();
  const controlPoints = savedControlPoints || defaultControlPoints;

  const getPath = () => {
    const params = {
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    };

    switch (pathType) {
      case 'bezier':
        // Use custom control points if available to create a cubic bezier curve
        if (savedControlPoints) {
          const cp1 = controlPoints.controlPoint1;
          const cp2 = controlPoints.controlPoint2;
          // SVG cubic bezier path: M sourceX,sourceY C cp1.x,cp1.y cp2.x,cp2.y targetX,targetY
          const path = `M ${sourceX},${sourceY} C ${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${targetX},${targetY}`;
          // Calculate label position (midpoint of the curve, approximately)
          const labelX = (sourceX + cp1.x + cp2.x + targetX) / 4;
          const labelY = (sourceY + cp1.y + cp2.y + targetY) / 4;
          return [path, labelX, labelY];
        }
        return getBezierPath(params);
      case 'straight':
        return getStraightPath(params);
      case 'step':
        return getSmoothStepPath({ ...params, borderRadius: 0 });
      case 'smoothstep':
      default:
        return getSmoothStepPath({ ...params, borderRadius: 20 });
    }
  };

  const [edgePath, labelX, labelY] = getPath();

  const [isEditing, setIsEditing] = useState(false);
  const [labelText, setLabelText] = useState((label as string) || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // State for dragging label
  const isDraggingLabel = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const originalOffset = useRef({ x: 0, y: 0 });

  // State for dragging control points
  const [draggingControlPoint, setDraggingControlPoint] = useState<'cp1' | 'cp2' | null>(null);

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

  const onLabelMouseDown = (evt: React.MouseEvent) => {
    if (readOnly || isEditing) return;
    
    evt.stopPropagation();
    evt.preventDefault();

    isDraggingLabel.current = true;
    dragStart.current = { x: evt.clientX, y: evt.clientY };
    originalOffset.current = labelOffset;

    const onMouseMove = (moveEvt: MouseEvent) => {
        if (!isDraggingLabel.current) return;
        
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
        isDraggingLabel.current = false;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Handle control point dragging
  const onControlPointMouseDown = (evt: React.MouseEvent, cpType: 'cp1' | 'cp2') => {
    evt.stopPropagation();
    evt.preventDefault();

    setDraggingControlPoint(cpType);
    const startPos = { x: evt.clientX, y: evt.clientY };
    const currentCP = cpType === 'cp1' ? controlPoints.controlPoint1 : controlPoints.controlPoint2;

    const onMouseMove = (moveEvt: MouseEvent) => {
      const zoom = getZoom();
      const dx = (moveEvt.clientX - startPos.x) / zoom;
      const dy = (moveEvt.clientY - startPos.y) / zoom;

      const newCP = {
        x: currentCP.x + dx,
        y: currentCP.y + dy
      };

      const newControlPoints = {
        controlPoint1: cpType === 'cp1' ? newCP : controlPoints.controlPoint1,
        controlPoint2: cpType === 'cp2' ? newCP : controlPoints.controlPoint2
      };

      setEdges((edges) => edges.map((e) => {
        if (e.id === id) {
          return {
            ...e,
            data: { ...e.data, controlPoints: newControlPoints }
          };
        }
        return e;
      }));
    };

    const onMouseUp = () => {
      setDraggingControlPoint(null);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const finalX = (labelX as number) + labelOffset.x;
  const finalY = (labelY as number) + labelOffset.y;

  return (
    <>
      <BaseEdge path={edgePath as string} markerEnd={markerEnd} style={style} />
      
      {/* Invisible wider path for easier interaction */}
      <path
        d={edgePath as string}
        fill="none"
        strokeOpacity={0}
        strokeWidth={20}
        className="react-flow__edge-interaction"
        onDoubleClick={onEdgeDoubleClick}
        style={{ cursor: readOnly ? 'default' : 'pointer', pointerEvents: 'stroke' }} 
      />

      {/* Control points for Bezier edges (only show when selected) */}
      {selected && pathType === 'bezier' && !readOnly && (
        <EdgeLabelRenderer>
          {/* Control Point 1 */}
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${controlPoints.controlPoint1.x}px, ${controlPoints.controlPoint1.y}px)`,
              pointerEvents: 'all',
              zIndex: 1000,
            }}
            className="nodrag nopan"
          >
            {/* Line from source to CP1 */}
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                overflow: 'visible',
              }}
            >
              <line
                x1={sourceX - controlPoints.controlPoint1.x}
                y1={sourceY - controlPoints.controlPoint1.y}
                x2={0}
                y2={0}
                stroke="#94a3b8"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
            </svg>
            <div
              onMouseDown={(e) => onControlPointMouseDown(e, 'cp1')}
              className="w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-move hover:scale-125 transition-transform shadow-md"
              title="拖拽以调整曲线"
            />
          </div>

          {/* Control Point 2 */}
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${controlPoints.controlPoint2.x}px, ${controlPoints.controlPoint2.y}px)`,
              pointerEvents: 'all',
              zIndex: 1000,
            }}
            className="nodrag nopan"
          >
            {/* Line from CP2 to target */}
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                overflow: 'visible',
              }}
            >
              <line
                x1={0}
                y1={0}
                x2={targetX - controlPoints.controlPoint2.x}
                y2={targetY - controlPoints.controlPoint2.y}
                stroke="#94a3b8"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
            </svg>
            <div
              onMouseDown={(e) => onControlPointMouseDown(e, 'cp2')}
              className="w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-move hover:scale-125 transition-transform shadow-md"
              title="拖拽以调整曲线"
            />
          </div>
        </EdgeLabelRenderer>
      )}

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
                      onMouseDown={onLabelMouseDown}
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