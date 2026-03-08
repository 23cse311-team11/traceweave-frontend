'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppStore } from '@/store/useAppStore';
import { ResizableSidebar } from './auth_landing/ResizableSidebar';
import { Sidebar } from './auth_landing/Sidebar';
import { DashboardHeader } from './auth_landing/DashboardHeader';
import { WelcomeSection } from './auth_landing/WelcomeSection';
import { StatsGrid } from './auth_landing/StatsGrid';
import { WorkspacesList } from './auth_landing/WorkspacesList';
import { QuickActions } from './auth_landing/QuickActions';
import { RecentActivity } from './auth_landing/RecentActivity';
import { Zap } from 'lucide-react';

export default function AuthenticatedHome() {
  const { user, logout } = useAuthStore();
  const { availableWorkspaces, fetchWorkspaces, fetchGlobalHistory, fetchGlobalStats } = useAppStore();

  useEffect(() => {
    fetchWorkspaces();
    fetchGlobalHistory();
    fetchGlobalStats();
  }, [fetchWorkspaces, fetchGlobalHistory, fetchGlobalStats]);

  return (
    <div className="flex h-screen bg-bg-base text-text-primary overflow-hidden font-sans selection:bg-brand-primary/30">
      
      {/* Refined Sidebar Container */}
      <ResizableSidebar>
        {/* Sidebar Brand Header */}
        <div className="h-14 flex items-center px-5 border-b border-border-subtle shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <div className="p-1.5 rounded-lg bg-brand-primary/10 border border-brand-primary/20 group-hover:border-brand-primary/40 transition-all">
                <Zap size={18} className="text-brand-primary fill-brand-primary/20" />
            </div>
            <span className="font-black text-sm uppercase tracking-widest text-white/90 group-hover:text-white transition-colors">
                Trace-weave
            </span>
          </div>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <Sidebar />
        </div>
      </ResizableSidebar>

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0A0A0F] relative">
        {/* Subtle Background Radial Glow */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(157,90,229,0.05)_0%,transparent_50%)] pointer-events-none" />
        
        <DashboardHeader user={user} logout={logout} />
        
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 relative z-10">
          <div className="max-w-7xl mx-auto space-y-10 pb-20">
            <WelcomeSection user={user} />
            
            <StatsGrid />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8">
                <WorkspacesList workspaces={availableWorkspaces} />
              </div>
              <div className="lg:col-span-4 space-y-8">
                <QuickActions />
                <RecentActivity />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}