'use client';
import { useState, useEffect } from 'react';
import { Search, Plus, FolderPlus, Activity, Sparkles } from 'lucide-react';
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
      <div style={{ width: store.sidebarWidth }} className="bg-bg-base border-r border-border-subtle flex flex-col shrink-0 relative group z-10 h-full">
        
        {/* Header Region */}
        <div className="p-2 flex items-center gap-2 border-b border-border-subtle shrink-0">
          
          {/* Search Bar */}
          <div className="flex-1 flex items-center bg-bg-input rounded px-2 py-1.5 text-xs focus-within:ring-1 focus-within:ring-brand-orange/50 transition-all">
            <Search size={12} className="text-text-secondary mr-2" />
            <input 
              type="text" 
              placeholder="Filter..." 
              className="bg-transparent focus:outline-none w-full placeholder:text-text-muted text-text-primary" 
            />
          </div>

          {/* Separation Divider */}
          <div className="h-4 w-[1px] bg-border-subtle mx-1"></div>

          {/* Context Action (Existing logic maintained) */}
          {getHeaderAction()}

          {/* The "New" Button - Primary Trigger for Modal */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-1.5 bg-brand-orange/10 text-brand-orange hover:bg-brand-orange hover:text-white rounded-md transition-all duration-200 flex items-center justify-center shadow-sm"
            title="Create New..."
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {renderContent()}
        </div>

        {/* Resize Handle */}
        <div
          onMouseDown={(e) => { e.preventDefault(); setIsResizing(true); }}
          className="absolute right-0 top-0 bottom-0 w-[4px] cursor-col-resize hover:bg-brand-blue/50 active:bg-brand-blue z-40 opacity-0 group-hover:opacity-100 transition-opacity"
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