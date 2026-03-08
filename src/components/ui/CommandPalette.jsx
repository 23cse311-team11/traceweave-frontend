'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Briefcase, Folder, FileCode, Layers, GitMerge, 
  Activity, ChevronDown, ChevronRight, X 
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function CommandPalette({ isOpen, onClose }) {
  const store = useAppStore();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [collapsedSections, setCollapsedSections] = useState({});
  const inputRef = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery(''); // Reset query on open
    }
  }, [isOpen]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const toggleSection = (title) => {
    setCollapsedSections(prev => ({ ...prev, [title]: !prev[title] }));
  };

  // --- Aggregating Data ---
  const searchData = useMemo(() => {
    const wsId = store.activeWorkspaceId;
    const lowerQuery = query.toLowerCase();

    // 1. Workspaces
    const workspaces = store.availableWorkspaces.map(w => ({
      id: w.id, name: w.name, type: 'Workspace', icon: Briefcase,
      action: () => {
        store.setActiveWorkspace(w.id);
        router.push(`/workspace/${w.id}/collections`);
      }
    }));

    // 2. Collections (Current Workspace)
    const collections = store.collections
      .filter(c => c.workspaceId === wsId)
      .map(c => ({
        id: c.id, name: c.name, type: 'Collection', icon: Folder,
        action: () => {
          store.setActiveSidebarItem('Collections');
          router.push(`/workspace/${wsId}/collections`);
        }
      }));

    // 3. Requests (Current Workspace)
    // We get requests that belong to collections in the current workspace, plus detached ones
    const currentWorkspaceCollectionIds = store.collections.filter(c => c.workspaceId === wsId).map(c => c.id);
    const requests = Object.values(store.requestStates)
      .filter(r => currentWorkspaceCollectionIds.includes(r.collectionId) || r.isDetached)
      .map(r => ({
        id: r.id, name: r.name, type: `Request (${r.protocol.toUpperCase()})`, icon: FileCode,
        action: () => {
          store.openTab(r.id);
          store.setActiveSidebarItem('Collections');
          router.push(`/workspace/${wsId}/collections`);
        }
      }));

    // 4. Environments (Current Workspace)
    const envs = (store.workspaceEnvironments[wsId] || []).map(e => ({
      id: e.id, name: e.name, type: 'Environment', icon: Layers,
      action: () => {
        store.openTab(e.id);
        router.push(`/workspace/${wsId}/environments`);
      }
    }));

    // 5. Workflows (Current Workspace)
    const workflows = store.workflows.map(w => ({
      id: w.id, name: w.name, type: 'Workflow', icon: GitMerge,
      action: () => {
        store.fetchWorkflow(w.id);
        router.push(`/workspace/${wsId}/workflows/${w.id}`); // Adjust path as needed
      }
    }));

    // 6. Monitors
    const monitors = Object.values(store.monitorStates).map(m => ({
      id: m.id, name: m.name, type: 'Monitor', icon: Activity,
      action: () => {
        store.openTab(m.id);
        router.push(`/workspace/${wsId}/monitors`); // Adjust path as needed
      }
    }));

    // --- Grouping & Filtering ---
    const filterFn = (item) => item.name.toLowerCase().includes(lowerQuery);

    return [
      { title: 'Requests', items: requests.filter(filterFn) },
      { title: 'Collections', items: collections.filter(filterFn) },
      { title: 'Environments', items: envs.filter(filterFn) },
      { title: 'Workflows', items: workflows.filter(filterFn) },
      { title: 'Monitors', items: monitors.filter(filterFn) },
      { title: 'Workspaces', items: workspaces.filter(filterFn) },
    ].filter(group => group.items.length > 0); // Only return groups that have results
  }, [store, query, router]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: -20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="relative w-full max-w-2xl bg-bg-panel border border-border-strong rounded-2xl shadow-2xl overflow-hidden flex flex-col mx-4"
        >
          {/* Search Input Header */}
          <div className="flex items-center px-4 py-3 border-b border-border-subtle bg-bg-base/50">
            <Search size={18} className="text-brand-primary" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search workspaces, requests, environments..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent border-none text-white text-lg px-4 py-1 focus:outline-none placeholder:text-text-muted"
            />
            <button onClick={onClose} className="p-1 text-text-muted hover:text-white rounded-md hover:bg-white/10 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Results Area */}
          <div className="max-h-[50vh] overflow-y-auto custom-scrollbar p-2">
            {searchData.length === 0 ? (
              <div className="py-12 text-center text-text-muted">
                <p>No results found for <span className="text-white font-medium">"{query}"</span></p>
              </div>
            ) : (
              searchData.map((group) => {
                const isCollapsed = collapsedSections[group.title];
                return (
                  <div key={group.title} className="mb-2">
                    {/* Group Header */}
                    <button 
                      onClick={() => toggleSection(group.title)}
                      className="flex items-center gap-2 w-full px-3 py-1.5 text-xs font-bold text-text-secondary uppercase tracking-wider hover:text-white transition-colors"
                    >
                      {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                      {group.title}
                      <span className="ml-auto text-[10px] bg-white/5 px-2 py-0.5 rounded-full">
                        {group.items.length}
                      </span>
                    </button>

                    {/* Group Items */}
                    {!isCollapsed && (
                      <div className="flex flex-col gap-1 mt-1">
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                item.action();
                                onClose();
                              }}
                              className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-brand-primary/10 hover:text-brand-primary transition-colors text-left group"
                            >
                              <div className="p-1.5 rounded-lg bg-bg-input group-hover:bg-brand-primary/20 transition-colors text-text-muted group-hover:text-brand-primary">
                                <Icon size={16} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-text-primary group-hover:text-white transition-colors">
                                  {item.name}
                                </span>
                                <span className="text-[10px] text-text-muted uppercase tracking-wider">
                                  {item.type}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
          
          {/* Footer Hints */}
          <div className="px-4 py-2 border-t border-border-subtle bg-bg-base flex justify-between items-center text-[10px] text-text-muted">
            <span>Use <kbd className="bg-white/10 px-1 rounded mx-1">↑</kbd><kbd className="bg-white/10 px-1 rounded mx-1">↓</kbd> to navigate</span>
            <span><kbd className="bg-white/10 px-1 rounded mx-1">esc</kbd> to close</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}