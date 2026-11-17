'use client';
import { useState, useRef, useMemo, useEffect } from 'react';
import { Plus, X, Globe, Activity, ChevronsRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import UnsavedChangesModal from '@/components/ui/UnsavedChangesModal';

// Sub-panels
import EnvironmentTab from './EnvironmentTab';
import DashboardPanel from '../dashboard/DashboardPanel';
import HttpRequestPanel from './request_panel/HttpRequestPanel';
import GraphqlRequestPanel from './request_panel/GraphqlRequestPanel';
import GrpcRequestPanel from './request_panel/GrpcRequestPanel';
import WebSocketRequestPanel from './request_panel/WebSocketRequestPanel';

import LocalhostWarningModal from '@/components/ui/LocalhostWarningModal';

export default function RequestPanel() {
  const store = useAppStore();
  const activeId = store.activeTabId;

  // --- MODAL STATE ---
  const [closeCandidateId, setCloseCandidateId] = useState(null);

  // --- OVERFLOW TAB STATE ---
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(1000); // Default safe width
  const [showDropdown, setShowDropdown] = useState(false);

  // 1. Accurately measure the parent container's width
  useEffect(() => {
    if (!containerRef.current) return;

    // Set initial width immediately
    setContainerWidth(containerRef.current.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- HANDLERS ---
  const handleTabClose = (e, tabId) => {
    e.stopPropagation();
    if (store.unsavedRequests.has(tabId)) {
      setCloseCandidateId(tabId);
    } else {
      store.closeTab(tabId);
    }
  };

  const handleDiscard = () => {
    if (closeCandidateId) {
      store.closeTab(closeCandidateId);
      setCloseCandidateId(null);
    }
  };

  const handleSaveAndClose = () => {
    if (!closeCandidateId) return;
    const isRequest = store.requestStates[closeCandidateId];
    const isEnv = store.getEnvironmentById(closeCandidateId);

    if (isRequest) store.saveRequest(closeCandidateId);
    else if (isEnv) store.saveEnvironment(closeCandidateId);

    store.closeTab(closeCandidateId);
    setCloseCandidateId(null);
  };

  const getCandidateName = () => {
    if (!closeCandidateId) return 'this item';
    const req = store.requestStates[closeCandidateId];
    if (req) return req.name || 'Untitled Request';
    const env = store.getEnvironmentById(closeCandidateId);
    if (env) return env.name;
    return 'this item';
  };

  // --- TAB DATA HELPER ---
  const getTabInfo = (tabId) => {
    const req = store.requestStates[tabId];
    const env = store.getEnvironmentById(tabId);
    const monitor = store.monitorStates[tabId];

    const methodColors = {
      GET: 'text-method-get',
      POST: 'text-method-post',
      PUT: 'text-method-put',
      DELETE: 'text-method-delete',
      PATCH: 'text-method-patch'
    };

    let name = 'Unknown';
    let icon = <Globe size={10} />;

    if (req) {
      name = req.name;
      icon = (
        <span className={`font-bold text-[10px] ${
          methodColors[req.config.method] || 'text-brand-primary'
        }`}>
          {req.config.method}
        </span>
      );
    } else if (env) {
      name = env.name;
      icon = <Globe size={10} className="text-brand-primary" />;
    } else if (monitor) {
      name = monitor.name;
      icon = <Activity size={10} className="text-brand-primary" />;
    }

    return {
      name,
      icon,
      isPreview: store.previewTabId === tabId,
      isDirty: store.unsavedRequests.has(tabId),
      isActive: tabId === activeId
    };
  };

  // Filter tabs strictly belonging to the active workspace
  const currentWorkspaceTabs = useMemo(() => {
    if (!store.activeWorkspaceId) return store.openTabs;
    return store.openTabs.filter(tabId => {
      // 1. Check if request
      const req = store.requestStates[tabId];
      if (req) {
        if (req.workspaceId && req.workspaceId !== store.activeWorkspaceId) return false;
        if (req.collectionId) {
          const col = store.collections.find(c => c.id === req.collectionId);
          if (col && col.workspaceId && col.workspaceId !== store.activeWorkspaceId) return false;
        }
        return true;
      }
      // 2. Check if environment
      const env = store.getEnvironmentById(tabId);
      if (env) {
        return !env.workspaceId || env.workspaceId === store.activeWorkspaceId;
      }
      // 3. Check if monitor
      const monitor = store.monitorStates[tabId];
      if (monitor) {
        return !monitor.workspaceId || monitor.workspaceId === store.activeWorkspaceId;
      }
      return true;
    });
  }, [store.openTabs, store.requestStates, store.collections, store.activeWorkspaceId, store.workspaceEnvironments, store.monitorStates]);

  useEffect(() => {
    if (activeId && currentWorkspaceTabs.length > 0 && !currentWorkspaceTabs.includes(activeId)) {
      store.openTab(currentWorkspaceTabs[currentWorkspaceTabs.length - 1]);
    }
  }, [activeId, currentWorkspaceTabs, store]);

  // --- Mathematical calculation for visible tabs ---
  const TAB_WIDTH = 176; // w-44 = 176px. Exact width locking ensures perfect math.
  const BUTTONS_WIDTH = 100; // Plus button + Dropdown trigger space
  const maxVisible = Math.max(1, Math.floor((containerWidth - BUTTONS_WIDTH) / TAB_WIDTH));

  let visibleTabs = currentWorkspaceTabs;
  let hiddenTabs = [];

  if (currentWorkspaceTabs.length > maxVisible) {
    const activeIndex = currentWorkspaceTabs.indexOf(activeId);

    // If the active tab gets pushed to the hidden area, swap it into the visible array
    if (activeIndex !== -1 && activeIndex >= maxVisible) {
      visibleTabs = currentWorkspaceTabs.slice(0, maxVisible);
      visibleTabs[maxVisible - 1] = currentWorkspaceTabs[activeIndex]; // Overwrite the last slot
      hiddenTabs = currentWorkspaceTabs.filter(id => !visibleTabs.includes(id));
    } else {
      visibleTabs = currentWorkspaceTabs.slice(0, maxVisible);
      hiddenTabs = currentWorkspaceTabs.slice(maxVisible);
    }
  }

  // --- CONTENT RENDERER ---
  const renderContent = () => {
    if (!activeId) return <div className="flex-1 flex items-center justify-center text-text-secondary">No tabs open</div>;
    if (store.monitorStates[activeId]) return <DashboardPanel />;
    if (store.getEnvironmentById(activeId)) return <EnvironmentTab envId={activeId} />;

    const req = store.requestStates[activeId];
    if (req) {
      switch (req.protocol || 'http') {
        case 'http': case 'https': return <HttpRequestPanel activeId={activeId} />;
        case 'graphql': return <GraphqlRequestPanel activeId={activeId} />;
        case 'grpc': return <GrpcRequestPanel activeId={activeId} />;
        case 'websocket': return <WebSocketRequestPanel activeId={activeId} />;
        default: return <HttpRequestPanel activeId={activeId} />;
      }
    }
    return <div className="flex-1 flex items-center justify-center text-text-secondary">Unknown Tab Type</div>;
  };

  return (
    <main className="flex-1 bg-[#121215] border-l border-white/[0.08] flex flex-col min-w-0 h-full relative z-0 overflow-hidden">
      {/* --- UNIFIED MULTI-TAB BAR --- */}
      <div
        ref={containerRef}
        className="flex items-center border-b border-white/[0.08] bg-[#0d0d10] shrink-0 h-9 w-full relative z-[9999] px-1 overflow-x-hidden"
      >
        {visibleTabs.map(tabId => {
          const { name, icon, isPreview, isDirty, isActive } = getTabInfo(tabId);

          return (
            <div
              key={tabId}
              onClick={() => store.openTab(tabId)}
              onDoubleClick={() => store.markTabPermanent(tabId)}
              className={`
                group flex items-center gap-2 px-3 h-full text-xs font-medium 
                cursor-pointer max-w-[190px] min-w-[110px] shrink-0 relative select-none transition-colors border-r border-white/[0.06]
                ${isActive
                  ? 'bg-[#121215] text-zinc-100 border-t-2 border-t-brand-primary'
                  : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]'}
              `}
            >
              <div className="shrink-0">{icon}</div>
              <span className={`truncate flex-1 ${isPreview ? 'italic text-zinc-500' : ''}`}>{name}</span>

              <div className="w-4 h-4 flex items-center justify-center shrink-0">
                {isDirty && <div className="w-1.5 h-1.5 rounded-full bg-brand-primary group-hover:hidden" />}
                <X
                  size={13}
                  className={`text-zinc-500 hover:text-white hover:bg-white/[0.1] rounded p-0.5 transition-colors ${isDirty ? 'hidden group-hover:block' : 'opacity-0 group-hover:opacity-100'}`}
                  onClick={(e) => handleTabClose(e, tabId)}
                />
              </div>
            </div>
          );
        })}

        {/* --- OVERFLOW DROPDOWN --- */}
        {hiddenTabs.length > 0 && (
          <div className="relative flex items-center shrink-0 h-full ml-1" ref={dropdownRef}>
            <button
              className={`px-2.5 py-1 text-xs font-medium cursor-pointer flex items-center gap-1.5 transition-colors rounded-md ${showDropdown ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'}`}
              onClick={() => setShowDropdown(!showDropdown)}
              title="View hidden tabs"
            >
              <ChevronsRight size={13} className="text-brand-primary" />
              <span>+{hiddenTabs.length}</span>
            </button>

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute top-[100%] right-0 mt-1 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-1 z-[10000] max-h-96 overflow-y-auto custom-scrollbar p-1"
                >
                  {hiddenTabs.map(tabId => {
                    const { name, icon, isDirty, isPreview } = getTabInfo(tabId);
                    return (
                      <div
                        key={tabId}
                        onClick={() => { store.openTab(tabId); setShowDropdown(false); }}
                        className="group flex items-center justify-between px-3 py-2 text-xs font-medium text-zinc-400 hover:bg-white/[0.06] hover:text-white cursor-pointer rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-2 overflow-hidden flex-1 mr-2">
                          <div className="shrink-0">{icon}</div>
                          <span className={`truncate ${isPreview ? 'italic text-zinc-500' : ''}`}>{name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isDirty && <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />}
                          <X
                            size={13}
                            className="text-zinc-500 hover:text-white hover:bg-white/[0.1] rounded p-0.5 opacity-0 group-hover:opacity-100 transition-colors"
                            onClick={(e) => handleTabClose(e, tabId)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Plus Button - Detached Request */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          className="ml-2 px-3 py-2 text-text-muted hover:text-brand-primary cursor-pointer shrink-0 flex items-center h-full transition-colors"
          onClick={() => store.createDetachedRequest('http')}
          title="Create Ad-Hoc Request"
        >
          <Plus size={18} strokeWidth={2.5} />
        </motion.div>
      </div>

      {/* --- VIEWPORT --- */}
      {renderContent()}

      {/* --- CONFIRMATION MODAL --- */}
      <UnsavedChangesModal
        isOpen={!!closeCandidateId}
        itemName={getCandidateName()}
        onClose={() => setCloseCandidateId(null)}
        onDiscard={handleDiscard}
        onSave={handleSaveAndClose}
      />

      <LocalhostWarningModal 
        isOpen={store.showLocalhostModal}
        onClose={() => store.setShowLocalhostModal(false)}
      />
    </main>
  );
}