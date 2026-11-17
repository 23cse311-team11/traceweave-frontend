'use client';

import React, { useState, useEffect } from 'react';
import { Search, Layers, Eye, Briefcase, UserPlus, Home, Plus, Monitor } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import Dropdown from '../ui/Dropdown';
import { CreateWorkspaceModal } from '@/components/home/auth_landing/CreateWorkspaceModal';
import InviteMembersModal from './InviteMembersModal';
import CommandPalette from '../ui/CommandPalette'; 
// 1. Import the new Notification Bell
import NotificationBell from '@/components/layout/NotificationBell';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Header() {
  const store = useAppStore();
  const {
    availableWorkspaces,
    isLoadingWorkspaces,
    activeWorkspaceId,
    availableEnvironments,
    fetchWorkspaces,
    fetchEnvironments,
  } = store;
  const router = useRouter();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const handleWorkspaceCreated = (workspace) => {
    setIsCreateWorkspaceOpen(false);
    store.fetchWorkspaces();
    if (workspace?.id) {
      router.push(`/workspace/${workspace.id}/collections`);
    }
  };

  useEffect(() => {
    if ((!availableWorkspaces || availableWorkspaces?.length === 0) && !isLoadingWorkspaces) {
      fetchWorkspaces();
    }
    if (activeWorkspaceId && (!availableEnvironments || availableEnvironments?.length === 0)) {
      fetchEnvironments(activeWorkspaceId);
    }
  }, [activeWorkspaceId, availableWorkspaces, availableEnvironments, isLoadingWorkspaces, fetchWorkspaces, fetchEnvironments]);

  const envs = store.getWorkspaceEnvironments();
  const currentEnv = (envs && store.selectedEnvIndex >= 0 && store.selectedEnvIndex < envs.length)
    ? envs[store.selectedEnvIndex]
    : null;
  const envOptions = [
    { label: 'No Environment', value: -1, className: 'text-text-muted italic' },
    ...envs.map((e, idx) => ({
      label: e.name, value: idx, className: 'text-white'
    }))
  ];
  const selectedOption = envOptions.find(opt => opt.value === store.selectedEnvIndex) || envOptions[0];

  return (
    <>
      <header className="h-13 bg-[#0d0d10] border-b border-white/[0.08] flex items-center px-4 justify-between shrink-0 z-40 select-none relative">
        {/* Workspace Dropdown & Nav */}
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex items-center gap-1">
            <Dropdown
              icon={Briefcase}
              value={availableWorkspaces.find(ws => ws.id === activeWorkspaceId)?.name}
              options={availableWorkspaces.map(ws => ws.name)}
              onSelect={(name) => {
                const ws = availableWorkspaces.find(w => w.name === name);
                if (ws) {
                  store.setActiveWorkspace(ws.id);
                  const currentTab = store.activeSidebarItem?.toLowerCase() || 'collections';
                  router.push(`/workspace/${ws.id}/${currentTab}`);
                }
              }}
              onOpen={() => fetchWorkspaces()}
              label="Workspaces"
              className="font-medium text-xs text-white"
              enableSearch={true}
              searchPlaceholder="Find workspace..."
              menuWidth="w-60"
              customFooter={
                <button
                  onClick={() => setIsCreateWorkspaceOpen(true)}
                  className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium text-brand-primary hover:bg-brand-primary/10 transition-colors"
                >
                  <Plus size={13} />
                  <span>New Workspace</span>
                </button>
              }
            />
          </div>

          <div className="h-4 w-px bg-white/[0.08]" />

          <div className="flex items-center gap-1.5">
            <Link
              href="/"
              className="flex items-center justify-center w-7 h-7 hover:bg-white/[0.06] rounded-md text-text-muted hover:text-white transition-colors"
              title="Back to Home"
            >
              <Home size={15} />
            </Link>
            <button
              onClick={() => setIsInviteOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 hover:bg-white/[0.06] rounded-md text-text-muted hover:text-white transition-colors text-xs font-medium border border-transparent hover:border-white/[0.08]"
            >
              <UserPlus size={13} />
              <span>Invite</span>
            </button>
          </div>
        </div>

        {/* Command Palette Search Trigger */}
        <div className="flex-1 max-w-xl mx-8 relative z-10">
          <div 
            className="flex items-center justify-between h-8 px-3 rounded-lg bg-zinc-900/60 hover:bg-zinc-900 border border-white/[0.08] hover:border-white/[0.14] text-xs text-zinc-400 hover:text-zinc-300 transition-all cursor-pointer group"
            onClick={() => setIsCommandPaletteOpen(true)}
          >
            <div className="flex items-center gap-2.5">
              <Search size={13} className="text-zinc-500 group-hover:text-zinc-300 transition-colors" />
              <span className="text-xs text-zinc-400 group-hover:text-zinc-300 font-normal">Search traces, collections, or requests...</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800/90 border border-white/[0.08] text-[10px] text-zinc-400 font-mono">⌘K</kbd>
            </div>
          </div>
        </div>

        {/* Actions & Environment */}
        <div className="flex items-center gap-3 relative z-10">
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
              if (activeWorkspaceId) fetchEnvironments(activeWorkspaceId)
            }}
            label="Environments"
            className="font-medium text-xs text-text-muted hover:text-white"
          />

          <div className="h-4 w-px bg-white/[0.08] hidden lg:block" />

          {/* DESKTOP APP BUTTON */}
          <Link href="/download">
            <button
              className="flex items-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.14] px-2.5 py-1 rounded-md text-xs font-medium text-zinc-300 hover:text-white transition-colors"
              title="Download Desktop App"
            >
              <Monitor size={13} className="text-brand-primary" />
              <span>Desktop App</span>
            </button>
          </Link>

          <NotificationBell />
        </div>
      </header>

      {/* Mount Modals */}
      <InviteMembersModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />
      <CreateWorkspaceModal
        isOpen={isCreateWorkspaceOpen}
        onClose={() => setIsCreateWorkspaceOpen(false)}
        onSuccess={handleWorkspaceCreated}
      />
      
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
      />
    </>
  );
}