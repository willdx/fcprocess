import React, { memo, useState, useCallback, useEffect } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { ICON_MAP, CATEGORY_COLORS, NODE_TYPES_LIST } from '../constants';
import clsx from 'clsx';
import { StickyNote } from 'lucide-react';

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
          isCircle ? "w-[80px] h-[80px] flex items-center justify-center" : "w-[180px]",
          isDiamond && "w-[120px] h-[120px] flex items-center justify-center", // Diamond needs square container
          !finalBorderRadius && !isDiamond && "rounded-lg", // Default radius if not overridden and not diamond
          !isDiamond && "border shadow-sm", // Diamond handles border differently
          selected && !isDiamond ? "shadow-md ring-1 ring-blue-500" : (!isDiamond && "hover:border-blue-300"),
          // Default styles if no custom styles
          !customStyle?.containerBg && !isDiamond && "bg-white",
          !customStyle?.borderColor && !isDiamond && (selected ? "border-blue-500" : "border-slate-200")
        )}
        style={{
            backgroundColor: !isDiamond ? customStyle?.containerBg : undefined,
            borderColor: !isDiamond ? customStyle?.borderColor : undefined,
            borderWidth: !isDiamond && customStyle?.borderWidth ? `${customStyle.borderWidth}px` : undefined,
            borderRadius: finalBorderRadius,
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
        {/* Target Handles (Input) */}
        <Handle type="target" position={Position.Top} id="t-top" className={clsx("!bg-slate-400 !-top-1", commonHandleClass)} />
        <Handle type="target" position={Position.Right} id="t-right" className={clsx("!bg-slate-400 !-right-1", commonHandleClass)} />
        <Handle type="target" position={Position.Bottom} id="t-bottom" className={clsx("!bg-slate-400 !-bottom-1", commonHandleClass)} />
        <Handle type="target" position={Position.Left} id="t-left" className={clsx("!bg-slate-400 !-left-1", commonHandleClass)} />

        {/* Source Handles (Output) */}
        <Handle type="source" position={Position.Top} id="s-top" className={clsx("!bg-blue-500 !-top-1", commonHandleClass)} />
        <Handle type="source" position={Position.Right} id="s-right" className={clsx("!bg-blue-500 !-right-1", commonHandleClass)} />
        <Handle type="source" position={Position.Bottom} id="s-bottom" className={clsx("!bg-blue-500 !-bottom-1", commonHandleClass)} />
        <Handle type="source" position={Position.Left} id="s-left" className={clsx("!bg-blue-500 !-left-1", commonHandleClass)} />
        
        {/* Header / Main Body */}
        <div className={clsx(
            "p-2 flex items-center gap-2 relative z-10", // z-10 to sit above diamond background
            (isCircle || isDiamond) && "flex-col justify-center text-center p-1"
        )}>
          {/* Icon Container */}
          <div 
            className={clsx(
              "w-8 h-8 rounded-md flex items-center justify-center shrink-0", 
              !hasCustomIconStyle && defaultColorClass
            )}
            style={hasCustomIconStyle ? { 
                backgroundColor: customStyle?.backgroundColor, 
                color: customStyle?.color 
            } : undefined}
          >
            <Icon size={16} />
          </div>
          
          {/* Content */}
          <div className={clsx(
              "min-w-0",
              (isCircle || isDiamond) ? "w-full" : "flex-1 mr-4"
          )}>
            <h3 
                className={clsx(
                    "text-xs font-semibold truncate",
                    (isCircle || isDiamond) && "text-[10px]"
                )}
                style={{ color: customStyle?.labelColor || '#0f172a' }} // Default slate-900
            >
              {(data.label as string) || nodeTypeConfig.label}
            </h3>
          </div>

          {/* Note Toggle Icon (Top Right) */}
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