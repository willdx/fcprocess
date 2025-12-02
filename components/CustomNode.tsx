import React, { memo, useState, useCallback, useEffect } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { ICON_MAP, CATEGORY_COLORS, NODE_TYPES_LIST } from '../constants';
import clsx from 'clsx';
import { StickyNote } from 'lucide-react';

const CustomNode = ({ id, data, selected }: NodeProps) => {
  const { updateNodeData } = useReactFlow();
  const nodeTypeConfig = NODE_TYPES_LIST.find(t => t.type === data.type) || NODE_TYPES_LIST[0];
  const Icon = ICON_MAP[nodeTypeConfig.iconName] || ICON_MAP['Server'];
  const colorClass = CATEGORY_COLORS[nodeTypeConfig.category] || 'bg-slate-100 text-slate-600';
  
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

  return (
    <div className="relative group">
      <div className={clsx(
        "w-[180px] bg-white rounded-lg border shadow-sm transition-all duration-200 relative z-10",
        selected ? "border-blue-500 shadow-md ring-1 ring-blue-500" : "border-slate-200 hover:border-blue-300"
      )}>
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
        <div className="p-2 flex items-center gap-2">
          {/* Icon Container */}
          <div className={clsx("w-8 h-8 rounded-md flex items-center justify-center shrink-0", colorClass)}>
            <Icon size={16} />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0 mr-4">
            <h3 className="text-xs font-semibold text-slate-900 truncate">
              {(data.label as string) || nodeTypeConfig.label}
            </h3>
          </div>

          {/* Note Toggle Icon (Top Right) */}
          <div className="absolute top-1 right-1">
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