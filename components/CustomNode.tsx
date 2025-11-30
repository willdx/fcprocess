import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { ICON_MAP, CATEGORY_COLORS, NODE_TYPES_LIST } from '../constants';
import clsx from 'clsx';

const CustomNode = ({ data, selected }: NodeProps) => {
  const nodeTypeConfig = NODE_TYPES_LIST.find(t => t.type === data.type) || NODE_TYPES_LIST[0];
  const Icon = ICON_MAP[nodeTypeConfig.iconName] || ICON_MAP['Server'];
  const colorClass = CATEGORY_COLORS[nodeTypeConfig.category] || 'bg-slate-100 text-slate-600';

  return (
    <div className={clsx(
      "w-[220px] bg-white rounded-lg border shadow-sm transition-all duration-200",
      selected ? "border-blue-500 shadow-md ring-1 ring-blue-500" : "border-slate-200 hover:border-blue-300"
    )}>
      <Handle type="target" position={Position.Left} className="!bg-slate-400 !w-2 !h-2" />
      
      <div className="p-3 flex items-start gap-3">
        {/* Icon Container */}
        <div className={clsx("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", colorClass)}>
          <Icon size={20} />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-900 truncate">
            {(data.label as string) || nodeTypeConfig.label}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
            {(data.description as string) || nodeTypeConfig.description || "No description provided."}
          </p>
          {/* Category label removed as requested */}
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="!bg-blue-500 !w-2 !h-2" />
    </div>
  );
};

export default memo(CustomNode);