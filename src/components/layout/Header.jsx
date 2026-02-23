'use client';

import React, { useState, useEffect } from 'react';
import { Search, Layers, Eye, Briefcase, UserPlus, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import Dropdown from '../ui/Dropdown';
import InviteMembersModal from './InviteMembersModal';
import Link from 'next/link';

export default function Header() {
  const store = useAppStore();
  const router = useRouter(); // <-- 2. Initialize router
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Initial load check
  useEffect(() => {
    if ((!store.availableWorkspaces || store.availableWorkspaces?.length === 0) && !store.isLoadingWorkspaces) {
      store.fetchWorkspaces();
    }
    if (store.activeWorkspaceId && (!store.availableEnvironments || store.availableEnvironments?.length === 0)) {
       store.fetchEnvironments(store.activeWorkspaceId);
    }
  }, [store.activeWorkspaceId]);

  // --- Logic for Environment Dropdown ---
  const currentEnv = store.getWorkspaceEnvironments()[store.selectedEnvIndex];
  
  // Create a list of options where each item is an object: { label, value, className? }
  const envOptions = [
    { 
      label: 'No Environment', 
      value: -1, 
      className: 'text-text-muted italic'
    }, 
    ...store.getWorkspaceEnvironments().map((e, idx) => ({ 
      label: e.name, 
      value: idx,
      className: 'text-text-primary'
    }))
  ];

  const selectedOption = envOptions.find(opt => opt.value === store.selectedEnvIndex) || envOptions[0];

  return (
    <>
      <header className="h-12 bg-bg-base border-b border-border-subtle flex items-center px-4 justify-between shrink-0 z-50 select-none relative">

        {/* Workspace Dropdown */}
        <div className="flex items-center gap-4">
          <Dropdown
            icon={Briefcase}
            value={store.availableWorkspaces.find(ws => ws.id === store.activeWorkspaceId)?.name}
            options={store.availableWorkspaces.map(ws => ws.name)}
            onSelect={(name) => {
              const ws = store.availableWorkspaces.find(w => w.name === name);
              if (ws) {
                store.setActiveWorkspace(ws.id);
                // <-- 3. Update the URL to match the newly selected workspace
                router.push(`/workspace/${ws.id}`); 
              }
            }}
            onOpen={() => store.fetchWorkspaces()} 
            label="Workspaces"
          />

          <Link
            href="/"
            className="flex items-center justify-center p-1.5 hover:bg-bg-input rounded text-text-secondary hover:text-text-primary transition-colors"
            title="Back to Home"
          >
            <Home size={16} />
          </Link>
          <button
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center gap-1.5 px-2 py-1 hover:bg-bg-input rounded text-text-secondary hover:text-text-primary transition-colors text-xs font-medium"
          >
            <UserPlus size={14} />
            <span>Invite</span>
          </button>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xl mx-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={14} className="text-text-secondary" />
            </div>
            <input
              type="text" placeholder="Search TraceWeave"
              className="w-full bg-bg-input text-sm text-text-primary rounded py-1.5 pl-9 pr-16 border border-transparent focus:border-border-strong focus:outline-none transition-all placeholder:text-text-muted"
            />
          </div>
        </div>

        {/* Actions & Environment */}
        <div className="flex items-center gap-3">
          <Dropdown
            icon={Layers}
            value={selectedOption.label} 
            options={envOptions}
            onSelect={(option) => {
              if (typeof option === 'object') {
                 store.setSelectedEnvIndex(option.value);
              } else {
                 const found = envOptions.find(o => o.label === option);
                 if (found) store.setSelectedEnvIndex(found.value);
              }
            }}
            onOpen={() => {
                if(store.activeWorkspaceId) store.fetchEnvironments(store.activeWorkspaceId)
            }}
            label="Environments"
          />
          <div className="h-4 w-[1px] bg-border-subtle mx-1"></div>
          <Eye size={18} className="text-text-secondary hover:text-text-primary cursor-pointer" />
          <button className="bg-brand-orange hover:bg-orange-600 text-white text-xs font-bold px-4 py-1.5 rounded transition">Upgrade</button>
        </div>
      </header>

      <InviteMembersModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />
    </>
  );
}