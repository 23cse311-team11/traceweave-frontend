'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { GitMerge, Plus, Search, Play, Clock, MoreVertical } from 'lucide-react';

export default function WorkflowsDashboard() {
  const router = useRouter();
  const { workspaceId } = useParams();
  const { workflows, activeWorkspaceId, workspaces = [], fetchWorkspacesWorkflows, createWorkflow, setActiveSidebarItem } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Make sure sidebar highlights 'Workflows'
  useEffect(() => {
    setActiveSidebarItem('Workflows');
  }, [setActiveSidebarItem]);

  useEffect(() => {
    if (workspaceId) {
        fetchWorkspacesWorkflows(workspaceId);
    }
  }, [workspaceId]);

  const handleCreateWorkflow = async () => {
      const workspace = workspaceId || activeWorkspaceId || (workspaces.length > 0 ? workspaces[0].id : null);
      if (!workspace) {
          alert("Please select a workspace first to create a workflow.");
          return;
      }
      try {
          const newWf = await createWorkflow(workspace, 'Untitled Workflow', 'A new automated workflow');
          router.push(`/workspace/${workspace}/workflows/${newWf.id}`);
      } catch(e) {
          console.error(e);
      }
  };

  const filteredWorkflows = workflows.filter(wf => 
    wf.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-transparent text-text-primary flex flex-col p-8 w-full relative z-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <GitMerge size={28} className="text-brand-orange" />
            Visual Workflows
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Build, test, and automate complex multi-step API sequences.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-orange" size={16} />
            <input
              type="text"
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-bg-panel border border-border-subtle rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-orange"
            />
          </div>
          <button 
            onClick={handleCreateWorkflow}
            className="flex items-center gap-2 bg-brand-orange text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-600 transition-all shadow-[0_0_15px_rgba(255,108,55,0.2)] whitespace-nowrap"
          >
            <Plus size={16} /> New Workflow
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWorkflows.map((wf) => (
          <div 
            key={wf.id} 
            className="group bg-bg-panel border border-border-subtle rounded-xl p-5 hover:border-brand-orange/50 transition-all hover:shadow-[0_4px_24px_rgba(0,0,0,0.3)] flex flex-col"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg text-text-primary group-hover:text-brand-orange transition-colors">
                {wf.name}
              </h3>
              <button className="text-text-muted hover:text-text-primary p-1">
                <MoreVertical size={16} />
              </button>
            </div>
            
            <p className="text-sm text-text-secondary mb-6 flex-1">{wf.description}</p>
            
            <div className="flex items-center justify-between border-t border-border-subtle pt-4">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <Clock size={14} /> Last run 2h ago
              </div>
              <button 
                onClick={() => router.push(`/workspace/${workspaceId}/workflows/${wf.id}`)}
                className="flex items-center gap-1.5 text-xs font-bold text-brand-orange bg-brand-orange/10 px-3 py-1.5 rounded-md hover:bg-brand-orange hover:text-white transition-colors"
              >
                <Play size={12} fill="currentColor" /> Open Builder
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}