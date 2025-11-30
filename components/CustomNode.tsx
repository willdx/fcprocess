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

  return (
    <div className="relative group">
      <div className={clsx(
        "w-[220px] bg-white rounded-lg border shadow-sm transition-all duration-200 relative z-10",
        selected ? "border-blue-500 shadow-md ring-1 ring-blue-500" : "border-slate-200 hover:border-blue-300"
      )}>
        <Handle type="target" position={Position.Left} className="!bg-slate-400 !w-2 !h-2" />
        
        {/* Header / Main Body */}
        <div className="p-3 flex items-start gap-3">
          {/* Icon Container */}
          <div className={clsx("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", colorClass)}>
            <Icon size={20} />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0 mr-5">
            <h3 className="text-sm font-semibold text-slate-900 truncate">
              {(data.label as string) || nodeTypeConfig.label}
            </h3>
            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
              {(data.description as string) || nodeTypeConfig.description || "No description provided."}
            </p>
          </div>

          {/* Note Toggle Icon (Top Right) */}
          <div className="absolute top-2 right-2">
            <button 
              onClick={toggleNote}
              className={clsx(
                "p-1 rounded transition-colors",
                showNote 
                  ? "bg-yellow-100 text-yellow-600" 
                  : hasNote 
                    ? "text-yellow-500 hover:bg-yellow-50" 
                    : "text-slate-300 hover:text-slate-500 hover:bg-slate-100"
              )}
              title={showNote ? "Hide Note" : "Show/Edit Note"}
            >
              <StickyNote size={14} className={clsx(hasNote && !showNote && "fill-yellow-100")} />
            </button>
          </div>
        </div>

        <Handle type="source" position={Position.Right} className="!bg-blue-500 !w-2 !h-2" />
      </div>

      {/* Node Appendix (Attached Note) */}
      {showNote && (
        <div className="absolute top-full left-0 right-0 mt-2 p-1 bg-yellow-50 border border-yellow-200 rounded-md shadow-sm z-20 animate-in slide-in-from-top-2 duration-200">
          <textarea
            value={noteContent}
            onChange={handleNoteChange}
            onBlur={handleNoteBlur}
            placeholder="Add a note..."
            className="w-full bg-transparent text-xs text-slate-700 placeholder:text-yellow-700/30 resize-y min-h-[60px] max-h-[200px] outline-none p-2 nodrag"
            // 'nodrag' class ensures dragging text selection doesn't move the node
          />
        </div>
      )}
    </div>
  );
};

export default memo(CustomNode);