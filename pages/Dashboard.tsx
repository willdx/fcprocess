import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Clock, MoreVertical, Search, Box, LogOut, Loader2 } from 'lucide-react';
import { workflowService } from '../services/workflowService';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFlowName, setNewFlowName] = useState('');
  const [newFlowDesc, setNewFlowDesc] = useState('');
  
  // Data State
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Profile Menu State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Load workflows on mount and when searchTerm changes
  useEffect(() => {
    const fetchWorkflows = async () => {
      setIsLoading(true);
      try {
        const data = await workflowService.getWorkflows(searchTerm);
        setWorkflows(data);
      } catch (error) {
        console.error("Failed to fetch workflows", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchWorkflows();
    }, 300); // Debounce search slightly

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Call Mock API to create workflow
      const newFlow = await workflowService.createWorkflow(newFlowName, newFlowDesc);
      
      // Close modal
      setIsModalOpen(false);
      
      // Navigate to editor with the new ID
      navigate(`/editor/${newFlow.id}`);
    } catch (error) {
      console.error("Failed to create workflow", error);
    }
  };

  const handleLogout = () => {
    // Perform any cleanup (clearing tokens, local storage, etc.)
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 w-full">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
               <Box size={20} />
             </div>
             <h1 className="text-xl font-bold text-slate-900 tracking-tight">Fucai</h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center px-3 py-1.5 bg-slate-100 rounded-md border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
               <Search size={16} className="text-slate-400 mr-2" />
               <input 
                 type="text" 
                 placeholder="Search workflows..." 
                 className="bg-transparent border-none text-sm focus:outline-none w-48 text-slate-700 placeholder:text-slate-400" 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
             </div>
             
             {/* Profile Dropdown */}
             <div className="relative" ref={profileMenuRef}>
               <button 
                 onClick={() => setIsProfileOpen(!isProfileOpen)}
                 className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
               >
                  <img src="https://picsum.photos/100/100" alt="Avatar" className="w-full h-full object-cover" />
               </button>
               
               {isProfileOpen && (
                 <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-slate-200 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                   <div className="px-4 py-2 border-b border-slate-100">
                     <p className="text-sm font-medium text-slate-900">Demo User</p>
                     <p className="text-xs text-slate-500 truncate">demo@fucai.com</p>
                   </div>
                   <button 
                     onClick={handleLogout}
                     className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                   >
                     <LogOut size={14} />
                     Sign out
                   </button>
                 </div>
               )}
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Workflows</h2>
            <p className="text-slate-500 mt-1">Manage your microservice architecture diagrams.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm transition-all active:scale-95"
          >
            <Plus size={20} />
            New Workflow
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Loader2 size={32} className="animate-spin mb-3 text-blue-500" />
            <p>Loading workflows...</p>
          </div>
        ) : workflows.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((flow) => (
              <div 
                key={flow.id} 
                onClick={() => navigate(`/editor/${flow.id}`)}
                className="group bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer relative"
              >
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); /* Add menu logic later */ }}
                    className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"
                  >
                    <MoreVertical size={20} />
                  </button>
                </div>
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Box size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{flow.name}</h3>
                <p className="text-slate-500 text-sm mb-6 line-clamp-2 h-10">{flow.description}</p>
                <div className="flex items-center text-xs text-slate-400 pt-4 border-t border-slate-100">
                  <Clock size={14} className="mr-1.5" />
                  Updated {flow.updatedAt}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-dashed border-slate-300">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Search size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No workflows found</h3>
            <p className="text-slate-500 max-w-xs text-center mt-1">
              We couldn't find any workflows matching "{searchTerm}". Try creating a new one.
            </p>
          </div>
        )}
      </main>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Create New Workflow</h3>
            <form onSubmit={handleCreate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                  <input 
                    type="text" 
                    required
                    value={newFlowName}
                    onChange={(e) => setNewFlowName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    placeholder="e.g. Payment Gateway Flow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea 
                    rows={3}
                    value={newFlowDesc}
                    onChange={(e) => setNewFlowDesc(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                    placeholder="Brief description of the architecture..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Create Workflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
