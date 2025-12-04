import React, { memo, useState, useCallback, useEffect } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { ICON_MAP, CATEGORY_COLORS, NODE_TYPES_LIST } from '../constants';
import clsx from 'clsx';
import { StickyNote } from 'lucide-react';
import SimpleIcon from './SimpleIcon';

const CustomNode = ({ id, data, selected }: NodeProps) => {
  const { updateNodeData } = useReactFlow();
  const nodeTypeConfig = NODE_TYPES_LIST.find(t => t.type === data.type) || NODE_TYPES_LIST[0];
  
  // Icon Override
  const iconName = (data.style as any)?.icon || nodeTypeConfig.iconName;
  const Icon = ICON_MAP[iconName] || ICON_MAP['Server'];
  
  // Default category color
  const defaultColorClass = CATEGORY_COLORS[nodeTypeConfig.category] || 'bg-slate-100 text-slate-600';
  
  // Custom style overrides
  const customStyle = data.style as { 
      backgroundColor?: string; 
      color?: string;
      containerBg?: string;
      borderColor?: string;
      borderWidth?: number;
      borderRadius?: number;
      labelColor?: string;
      shape?: 'rectangle' | 'rounded' | 'circle' | 'diamond';
      shadow?: string;
  } | undefined;

  const hasCustomIconStyle = !!customStyle?.backgroundColor || !!customStyle?.color;

  const attachedNote = data.attachedNote as string || '';
  const [showNote, setShowNote] = useState(false);
  const [noteContent, setNoteContent] = useState(attachedNote);
  
  const readOnly = data?.readOnly as boolean;

  // Sync local state if data changes externally
  useEffect(() => {
    setNoteContent(attachedNote);
  }, [attachedNote]);

  const toggleNote = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); 
    setShowNote((prev) => !prev);
  }, []);

  const handleNoteChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNoteContent(e.target.value);
  }, []);

  const handleNoteBlur = useCallback(() => {
    updateNodeData(id, { attachedNote: noteContent });
  }, [id, noteContent, updateNodeData]);

  const hasNote = !!attachedNote && attachedNote.trim().length > 0;

  // Determine layout based on category
  const isHorizontalLayout = ['General', 'Application'].includes(nodeTypeConfig.category);

  const handleVisibilityClass = readOnly 
    ? "opacity-0 pointer-events-none" 
    : "opacity-0 group-hover:opacity-100";
  
  const commonHandleClass = `!w-2 !h-2 transition-opacity duration-200 ${handleVisibilityClass}`;

  // Calculate shape styles
  const shape = customStyle?.shape || 'rounded';
  const isCircle = shape === 'circle';
  const isDiamond = shape === 'diamond';
  
  const borderRadius = isCircle 
    ? '50%' 
    : customStyle?.borderRadius 
        ? `${customStyle.borderRadius}px` 
        : shape === 'rectangle' ? '0px' : undefined; 
  
  const finalBorderRadius = borderRadius ?? (shape === 'rectangle' ? '0px' : undefined);

  return (
    <div className="relative group">
      <div 
        className={clsx(
          "transition-all duration-200 relative z-10",
          isCircle ? "w-[80px] h-[80px] flex items-center justify-center" : (isHorizontalLayout ? "w-[180px]" : "w-auto"),
          isDiamond && "w-[120px] h-[120px] flex items-center justify-center", // Diamond needs square container
          !finalBorderRadius && !isDiamond && "rounded-lg", // Default radius if not overridden and not diamond
          !isDiamond && "border", // Diamond handles border differently
          !customStyle?.shadow && !isDiamond && (isHorizontalLayout ? "shadow-sm" : "shadow-none"), // No shadow for vertical layout
          selected && !isDiamond ? "shadow-md ring-1 ring-blue-500" : (!isDiamond && isHorizontalLayout && "hover:border-blue-300"),
          // Default styles if no custom styles
          !customStyle?.containerBg && !isDiamond && (isHorizontalLayout ? "bg-white" : "bg-transparent"),
          !customStyle?.borderColor && !isDiamond && (selected ? "border-blue-500" : (isHorizontalLayout ? "border-slate-200" : "border-transparent"))
        )}
        style={{
            backgroundColor: !isDiamond ? customStyle?.containerBg : undefined,
            borderColor: !isDiamond ? customStyle?.borderColor : undefined,
            borderWidth: !isDiamond && customStyle?.borderWidth ? `${customStyle.borderWidth}px` : undefined,
            borderRadius: finalBorderRadius,
            boxShadow: !isDiamond ? customStyle?.shadow : undefined
        }}
      >
        {/* Diamond Shape Visual Layer */}
        {isDiamond && (
            <div 
                className={clsx(
                    "absolute inset-0 m-auto w-[70.7%] h-[70.7%] rotate-45 transition-all duration-200",
                    "border shadow-sm",
                    selected ? "shadow-md ring-1 ring-blue-500 border-blue-500" : "hover:border-blue-300 border-slate-200",
                    !customStyle?.containerBg && "bg-white"
                )}
                style={{
                    backgroundColor: customStyle?.containerBg,
                    borderColor: customStyle?.borderColor,
                    borderWidth: customStyle?.borderWidth ? `${customStyle.borderWidth}px` : undefined,
                }}
            />
        )}
        {/* Target Handles (Input) - 每边3个连接点 */}
        {/* 上边 */}
        <Handle type="target" position={Position.Top} id="t-top-left" style={{ left: '25%' }} className={clsx("!bg-slate-400 !-top-1", commonHandleClass)} />
        <Handle type="target" position={Position.Top} id="t-top" style={{ left: '50%' }} className={clsx("!bg-slate-400 !-top-1", commonHandleClass)} />
        <Handle type="target" position={Position.Top} id="t-top-right" style={{ left: '75%' }} className={clsx("!bg-slate-400 !-top-1", commonHandleClass)} />
        
        {/* 右边 */}
        <Handle type="target" position={Position.Right} id="t-right-top" style={{ top: '25%' }} className={clsx("!bg-slate-400 !-right-1", commonHandleClass)} />
        <Handle type="target" position={Position.Right} id="t-right" style={{ top: '50%' }} className={clsx("!bg-slate-400 !-right-1", commonHandleClass)} />
        <Handle type="target" position={Position.Right} id="t-right-bottom" style={{ top: '75%' }} className={clsx("!bg-slate-400 !-right-1", commonHandleClass)} />
        
        {/* 下边 */}
        <Handle type="target" position={Position.Bottom} id="t-bottom-left" style={{ left: '25%' }} className={clsx("!bg-slate-400 !-bottom-1", commonHandleClass)} />
        <Handle type="target" position={Position.Bottom} id="t-bottom" style={{ left: '50%' }} className={clsx("!bg-slate-400 !-bottom-1", commonHandleClass)} />
        <Handle type="target" position={Position.Bottom} id="t-bottom-right" style={{ left: '75%' }} className={clsx("!bg-slate-400 !-bottom-1", commonHandleClass)} />
        
        {/* 左边 */}
        <Handle type="target" position={Position.Left} id="t-left-top" style={{ top: '25%' }} className={clsx("!bg-slate-400 !-left-1", commonHandleClass)} />
        <Handle type="target" position={Position.Left} id="t-left" style={{ top: '50%' }} className={clsx("!bg-slate-400 !-left-1", commonHandleClass)} />
        <Handle type="target" position={Position.Left} id="t-left-bottom" style={{ top: '75%' }} className={clsx("!bg-slate-400 !-left-1", commonHandleClass)} />

        {/* Source Handles (Output) - 每边3个连接点 */}
        {/* 上边 */}
        <Handle type="source" position={Position.Top} id="s-top-left" style={{ left: '25%' }} className={clsx("!bg-blue-500 !-top-1", commonHandleClass)} />
        <Handle type="source" position={Position.Top} id="s-top" style={{ left: '50%' }} className={clsx("!bg-blue-500 !-top-1", commonHandleClass)} />
        <Handle type="source" position={Position.Top} id="s-top-right" style={{ left: '75%' }} className={clsx("!bg-blue-500 !-top-1", commonHandleClass)} />
        
        {/* 右边 */}
        <Handle type="source" position={Position.Right} id="s-right-top" style={{ top: '25%' }} className={clsx("!bg-blue-500 !-right-1", commonHandleClass)} />
        <Handle type="source" position={Position.Right} id="s-right" style={{ top: '50%' }} className={clsx("!bg-blue-500 !-right-1", commonHandleClass)} />
        <Handle type="source" position={Position.Right} id="s-right-bottom" style={{ top: '75%' }} className={clsx("!bg-blue-500 !-right-1", commonHandleClass)} />
        
        {/* 下边 */}
        <Handle type="source" position={Position.Bottom} id="s-bottom-left" style={{ left: '25%' }} className={clsx("!bg-blue-500 !-bottom-1", commonHandleClass)} />
        <Handle type="source" position={Position.Bottom} id="s-bottom" style={{ left: '50%' }} className={clsx("!bg-blue-500 !-bottom-1", commonHandleClass)} />
        <Handle type="source" position={Position.Bottom} id="s-bottom-right" style={{ left: '75%' }} className={clsx("!bg-blue-500 !-bottom-1", commonHandleClass)} />
        
        {/* 左边 */}
        <Handle type="source" position={Position.Left} id="s-left-top" style={{ top: '25%' }} className={clsx("!bg-blue-500 !-left-1", commonHandleClass)} />
        <Handle type="source" position={Position.Left} id="s-left" style={{ top: '50%' }} className={clsx("!bg-blue-500 !-left-1", commonHandleClass)} />
        <Handle type="source" position={Position.Left} id="s-left-bottom" style={{ top: '75%' }} className={clsx("!bg-blue-500 !-left-1", commonHandleClass)} />
        
        {/* Header / Main Body */}
        <div className={clsx(
            "p-2 flex relative z-10", // z-10 to sit above diamond background
            (isCircle || isDiamond) && "flex-col justify-center text-center p-1",
            !isCircle && !isDiamond && (isHorizontalLayout ? "flex-row items-center gap-2" : "flex-col items-center justify-center gap-1.5")
        )}>
          {/* Icon Container */}
          <div 
            className={clsx(
              "rounded-md flex items-center justify-center shrink-0",
              isHorizontalLayout ? "w-8 h-8" : "w-12 h-12",
              !hasCustomIconStyle && !nodeTypeConfig.brandColor && defaultColorClass,
              data.type === 'step' && "rounded-full bg-yellow-100 text-yellow-600 font-bold",
              data.type === 'user' && "bg-purple-500 text-white",
              data.type === 'message' && "bg-purple-500 text-white"
            )}
            style={hasCustomIconStyle ? { 
                backgroundColor: customStyle?.backgroundColor, 
                color: customStyle?.color 
            } : nodeTypeConfig.brandColor ? {
                backgroundColor: nodeTypeConfig.brandColor,
                color: 'white'
            } : undefined}
          >
            {data.type === 'step' ? (
                <span>{data.stepNumber as string || '1'}</span>
            ) : nodeTypeConfig.simpleIconName ? (
                <SimpleIcon 
                  name={nodeTypeConfig.simpleIconName} 
                  size={isHorizontalLayout ? 16 : 24}
                  color="white"
                />
            ) : (
                <Icon size={isHorizontalLayout ? 16 : 24} />
            )}
          </div>
          
          {/* Content */}
          <div className={clsx(
              "min-w-0",
              (isCircle || isDiamond) ? "w-full" : (isHorizontalLayout ? "flex-1 mr-4" : "w-full")
          )}>
            <h3 
                className={clsx(
                    "text-xs font-semibold",
                    (isCircle || isDiamond) && "text-[10px]",
                    isHorizontalLayout ? "truncate" : "text-center whitespace-nowrap"
                )}
                style={{ color: customStyle?.labelColor || '#0f172a' }} // Default slate-900
            >
              {(data.label as string) || nodeTypeConfig.label}
            </h3>
          </div>

          {/* Note Toggle Icon (Top Right) */}
          {!['step', 'user', 'message'].includes(data.type as string) && (
            <div className={clsx(
                "absolute",
                isCircle ? "top-0 right-0" : isDiamond ? "-top-2 -right-2" : "top-1 right-1"
            )}>
                <button 
                onClick={toggleNote}
                className={clsx(
                    "p-0.5 rounded transition-colors",
                    showNote 
                    ? "bg-yellow-100 text-yellow-600" 
                    : hasNote 
                        ? "text-yellow-500 hover:bg-yellow-50" 
                        : "text-slate-300 hover:text-slate-500 hover:bg-slate-100"
                )}
                title={showNote ? "Hide Note" : "Show/Edit Note"}
                >
                <StickyNote size={12} className={clsx(hasNote && !showNote && "fill-yellow-100")} />
                </button>
            </div>
          )}
        </div>
      </div>

      {/* Node Appendix (Attached Note) */}
      {showNote && (
        <div className="absolute top-full left-0 right-0 mt-2 p-1 bg-yellow-50 border border-yellow-200 rounded-md shadow-sm z-20 animate-in slide-in-from-top-2 duration-200">
          <textarea
            value={noteContent}
            onChange={handleNoteChange}
            onBlur={handleNoteBlur}
            readOnly={readOnly}
            placeholder={readOnly ? "No attached note" : "Add a note..."}
            className={clsx(
              "w-full bg-transparent text-xs text-slate-700 placeholder:text-yellow-700/30 resize-y min-h-[60px] max-h-[200px] outline-none p-2 nodrag",
              readOnly && "resize-none"
            )}
          />
        </div>
      )}
    </div>
  );
};

export default memo(CustomNode);