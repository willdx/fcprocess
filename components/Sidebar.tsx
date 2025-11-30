import React, { useMemo, useState } from 'react';
import { NODE_TYPES_LIST, ICON_MAP, CATEGORY_COLORS } from '../constants';
import { Search, ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
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
        "bg-white border-r border-slate-200 h-full shrink-0 transition-all duration-300 relative z-10 flex flex-col",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-3 scrollbar-hide">
        
        {/* Search Section */}
        <div className="mb-6">
          {!isCollapsed ? (
            <div className="relative group">
              <Search className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
              <input 
                type="text"
                placeholder="Filter..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          ) : (
             <div className="flex justify-center py-2" title="Search">
               <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                  <Search size={20} />
               </div>
             </div>
          )}
        </div>
      
        {/* List Content */}
        <div className="space-y-6">
          {categories.map(category => {
            const nodes = groupedNodes[category];
            if (!nodes || nodes.length === 0) return null;

            if (isCollapsed) {
               // Collapsed View: Just show icons centered
               return (
                 <div key={category} className="flex flex-col items-center gap-2 mb-3">
                   {nodes.map(node => {
                      const Icon = ICON_MAP[node.iconName];
                      const colorClass = CATEGORY_COLORS[node.category];
                      return (
                        <div
                          key={node.type}
                          className={clsx(
                            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-blue-500/50 transition-all relative group/icon",
                            colorClass
                          )}
                          onDragStart={(event) => onDragStart(event, node.type)}
                          draggable
                        >
                          {Icon && <Icon size={20} />}
                          {/* Tooltip for collapsed view */}
                          <div className="absolute left-full ml-3 px-2 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-md opacity-0 group-hover/icon:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl">
                            {node.label}
                            {/* Little triangle pointer */}
                            <div className="absolute top-1/2 -left-1 -mt-1 border-4 border-transparent border-r-slate-800"></div>
                          </div>
                        </div>
                      )
                   })}
                   <div className="w-6 h-px bg-slate-100 my-1"></div>
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
      </div>

      {/* Footer Toggle Area */}
      <div className="p-3 border-t border-slate-100 bg-white">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <PanelLeftOpen size={20} />
          ) : (
            <div className="flex items-center gap-2 w-full">
              <PanelLeftClose size={18} />
              <span className="text-xs font-semibold text-slate-600">Collapse Sidebar</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;