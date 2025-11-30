import React, { useMemo, useState } from 'react';
import { NODE_TYPES_LIST, ICON_MAP, CATEGORY_COLORS } from '../constants';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { NodeCategory } from '../types';
import clsx from 'clsx';

const Sidebar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const groupedNodes = useMemo(() => {
    const groups: Record<string, typeof NODE_TYPES_LIST> = {};
    NODE_TYPES_LIST.forEach(node => {
      if (node.label.toLowerCase().includes(searchTerm.toLowerCase())) {
        if (!groups[node.category]) groups[node.category] = [];
        groups[node.category].push(node);
      }
    });
    return groups;
  }, [searchTerm]);

  const categories: NodeCategory[] = [
    'General', 'Application', 'Database', 'Storage', 'Middleware', 'Observability', 'Coordination'
  ];

  return (
    <aside 
      className={clsx(
        "bg-white border-r border-slate-200 flex flex-col h-full shrink-0 transition-all duration-300 relative z-10",
        isCollapsed ? "w-12" : "w-64"
      )}
    >
      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-3 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-blue-600 shadow-sm z-20"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Header / Search - Redesigned */}
      <div className={clsx("shrink-0 sticky top-0 bg-white z-10 border-b border-slate-100", isCollapsed ? "p-3" : "p-3")}>
        {!isCollapsed ? (
          <div className="relative group">
            <Search className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input 
              type="text"
              placeholder="Filter components..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        ) : (
           <div className="flex justify-center py-1" title="Search">
             <Search size={20} className="text-slate-400" />
           </div>
        )}
      </div>
      
      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-5 scrollbar-hide">
        {categories.map(category => {
          const nodes = groupedNodes[category];
          if (!nodes || nodes.length === 0) return null;

          if (isCollapsed) {
             // Collapsed View: Just show icons
             return (
               <div key={category} className="flex flex-col items-center gap-2 mb-3">
                 {nodes.map(node => {
                    const Icon = ICON_MAP[node.iconName];
                    const colorClass = CATEGORY_COLORS[node.category];
                    return (
                      <div
                        key={node.type}
                        className={clsx(
                          "w-8 h-8 rounded-md flex items-center justify-center shrink-0 cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-blue-500/50 transition-all relative group/icon",
                          colorClass
                        )}
                        onDragStart={(event) => onDragStart(event, node.type)}
                        draggable
                      >
                        {Icon && <Icon size={16} />}
                        {/* Tooltip for collapsed view */}
                        <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover/icon:opacity-100 pointer-events-none whitespace-nowrap z-50">
                          {node.label}
                        </div>
                      </div>
                    )
                 })}
                 <div className="w-4 h-px bg-slate-200 my-1"></div>
               </div>
             )
          }

          // Expanded View
          return (
            <div key={category}>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                {category}
              </h3>
              <div className="space-y-1.5">
                {nodes.map(node => {
                  const Icon = ICON_MAP[node.iconName];
                  const colorClass = CATEGORY_COLORS[node.category];
                  
                  return (
                    <div
                      key={node.type}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-grab active:cursor-grabbing transition-all group"
                      onDragStart={(event) => onDragStart(event, node.type)}
                      draggable
                    >
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${colorClass}`}>
                        {Icon && <Icon size={16} />}
                      </div>
                      <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600">
                        {node.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;