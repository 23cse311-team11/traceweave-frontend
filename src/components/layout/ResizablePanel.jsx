'use client';
import { useState, useRef, useEffect } from 'react';
import { Search, Plus, FolderPlus, Activity, Sparkles, X, Globe, ChevronsRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';

// Keep your existing relative imports logic
import SidebarCollections from '../collections/SidebarCollections';
import SidebarEnvironments from '../environments/SidebarEnvironments';
import SidebarHistory from '../history/SidebarHistory';
import SidebarMonitors from '../monitors/SidebarMonitors';
import NewArtifactModal from './NewArtifactModal';

export default function ResizablePanel() {
  const store = useAppStore();
  const [isResizing, setIsResizing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Resize Logic (Preserved)
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = Math.max(200, Math.min(500, e.clientX - 70));
      store.setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, store]);

  // Dynamic Content Switcher (Preserved)
  const renderContent = () => {
    switch (store.activeSidebarItem) {
      case 'Collections': return <SidebarCollections />;
      case 'Environments': return <SidebarEnvironments />;
      case 'History': return <SidebarHistory />;
      case 'Monitor': return <SidebarMonitors />;
      default: return <div className="p-4 text-xs text-text-secondary">Coming Soon</div>;
    }
  };

  // Context Specific Actions (Preserved Logic)
  const getHeaderAction = () => {
    if (store.activeSidebarItem === 'Collections') {
      return (
        <div
          onClick={(e) => {
            e.stopPropagation(); // Prevent bubbling
            store.createCollection();
          }}
          className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-bg-input rounded cursor-pointer transition-colors"
          title="Quick Create Collection"
        >
          <FolderPlus size={16} />
        </div>
      );
    }
    if (store.activeSidebarItem === 'Monitor') {
      return (
        <div
          onClick={(e) => {
            e.stopPropagation();
            store.createMonitor();
          }}
          className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-bg-input rounded cursor-pointer transition-colors"
          title="Quick Create Monitor"
        >
          <Activity size={16} />
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div style={{ width: store.sidebarWidth }} className="bg-[#0d0d10] flex flex-col shrink-0 relative group z-10 h-full border-r border-white/[0.08] overflow-hidden select-none">
        {/* Header Region */}
        <div className="p-3 flex items-center gap-2 border-b border-white/[0.08] shrink-0 relative z-10">
          {/* Search Bar */}
          <div className="flex-1 flex items-center bg-zinc-900/60 border border-white/[0.08] rounded-md px-2.5 py-1 text-xs focus-within:border-brand-primary/50 focus-within:bg-zinc-900 transition-all group/search">
            <Search size={13} className="text-zinc-500 group-focus-within/search:text-brand-primary transition-colors mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Filter..."
              className="bg-transparent focus:outline-none w-full placeholder:text-zinc-500 text-zinc-200 text-xs font-normal"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {/* Context Action */}
            {getHeaderAction() && (
              <div>
                {getHeaderAction()}
              </div>
            )}

            {/* The "New" Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-7 h-7 bg-violet-600 hover:bg-violet-500 text-white rounded-md transition-colors flex items-center justify-center shrink-0"
              title="Create New..."
            >
              <Plus size={15} strokeWidth={2.25} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar relative z-10">
          <div className="p-1">
            {renderContent()}
          </div>
        </div>

        {/* Resize Handle */}
        <div
          onMouseDown={(e) => { e.preventDefault(); setIsResizing(true); }}
          className={`absolute right-0 top-0 bottom-0 w-1 transition-colors z-40 cursor-col-resize 
            ${isResizing ? 'bg-violet-500' : 'bg-transparent hover:bg-violet-500/50'}`}
        />
      </div>

      {/* Modal Injection */}
      <NewArtifactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
