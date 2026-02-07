'use client';

import React from 'react';
import Image from 'next/image';
import { useAuthStore } from '@/store/useAuthStore';
import { ResizableSidebar } from './auth_landing/ResizableSidebar';
import { Sidebar } from './auth_landing/Sidebar';
import { DashboardHeader } from './auth_landing/DashboardHeader';
import { WelcomeSection } from './auth_landing/WelcomeSection';
import { StatsGrid } from './auth_landing/StatsGrid';
import { WorkspacesList } from './auth_landing/WorkspacesList';
import { QuickActions } from './auth_landing/QuickActions';
import { RecentActivity } from './auth_landing/RecentActivity';

/* --- MAIN DASHBOARD CONTENT --- */
export default function AuthenticatedHome() {
  const { user, logout } = useAuthStore();

  const workspaces = [
    { id: '1', name: 'Payments Service V2', status: 'healthy', metrics: { req: '1.2M', err: '0.01%', lat: '45ms' }, updated: '2m ago' },
    { id: '2', name: 'Auth Gateway', status: 'warning', metrics: { req: '890k', err: '1.4%', lat: '120ms' }, updated: '15m ago' },
    { id: '3', name: 'Notification Worker', status: 'healthy', metrics: { req: '45k', err: '0%', lat: '210ms' }, updated: '1h ago' },
    { id: '4', name: 'Legacy API (V1)', status: 'error', metrics: { req: '12k', err: '5.2%', lat: '800ms' }, updated: '4h ago' },
  ];

  return (
    <div className="flex h-screen bg-bg-base text-text-primary overflow-hidden font-sans">
      
      {/* 1. SIDEBAR */}
      <ResizableSidebar>
        <div className="h-14 flex items-center px-4 border-b border-border-subtle">
           <Image src="/logo.png" alt="Trace-weave Logo" width={35} height={35} />
           <span className="font-bold text-m tracking-tight">Trace-weave</span>
        </div>
        <Sidebar />
      </ResizableSidebar>

      {/* 2. MAIN AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <DashboardHeader user={user} logout={logout} />

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Greeting & Stats */}
            <WelcomeSection user={user} />

            {/* Quick Stats Grid */}
            <StatsGrid />

            {/* Main Sections Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Workspaces (2/3) */}
              <WorkspacesList workspaces={workspaces} />

              {/* Right Column: Quick Actions & Links (1/3) */}
              <div className="space-y-6">
                 
                 {/* Quick Actions */}
                 <QuickActions />

                 {/* Recent Activity Mini-List */}
                 <RecentActivity />

              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}