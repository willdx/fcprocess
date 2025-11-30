import React, { memo, useState, useRef, useEffect } from 'react';
import { NodeProps, NodeResizer, useReactFlow } from '@xyflow/react';
import ReactMarkdown from 'react-markdown';
import clsx from 'clsx';

const NoteNode = ({ id, data, selected }: NodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(data.label as string || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { setNodes } = useReactFlow();
  
  const readOnly = data?.readOnly as boolean;

  useEffect(() => {
    setContent(data.label as string || '');
  }, [data.label]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    if (!readOnly) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    // Update the node data in the global flow state
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, label: content } };
        }
        return node;
      })
    );
  };

  return (
    <>
      <NodeResizer 
        minWidth={160} 
        minHeight={60} 
        isVisible={selected && !readOnly} 
        lineClassName="border-blue-500" 
        handleClassName="h-3 w-3 bg-white border border-blue-500 rounded"
      />
      
      <div 
        className={clsx(
          "h-full w-full bg-yellow-50 border transition-shadow duration-200 overflow-hidden flex flex-col",
          selected ? "border-blue-500 shadow-md ring-1 ring-blue-500" : "border-yellow-200 shadow-sm hover:shadow",
          "rounded-sm"
        )}
        onDoubleClick={handleDoubleClick}
      >
        {isEditing ? (
          <textarea
            ref={textareaRef}
            className="w-full h-full p-4 bg-yellow-50 resize-none outline-none font-mono text-sm text-slate-700"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              e.stopPropagation(); 
            }}
          />
        ) : (
          <div className="w-full h-full p-4 overflow-y-auto markdown-content text-slate-800 text-sm">
            {content ? (
              <ReactMarkdown>{content}</ReactMarkdown>
            ) : (
              <span className="text-slate-400 italic">
                {readOnly ? '' : 'Double click to add a note...'}
              </span>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default memo(NoteNode);