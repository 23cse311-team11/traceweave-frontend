'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { PacmanLoader } from 'react-spinners';
import { Zap } from 'lucide-react';

// Import your shell components (adjust the paths if they are located elsewhere)
import { ResizableSidebar } from '@/components/home/auth_landing/ResizableSidebar';
import { Sidebar } from '@/components/home/auth_landing/Sidebar';
import { DashboardHeader } from '@/components/home/auth_landing/DashboardHeader';
import NotificationProvider from '@/components/providers/NotificationProvider';
import Link from 'next/link';
import Image from 'next/image';
import traceWeaveLogo from '@/assets/traceWeaveLogo.png';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isChecking, checkAuth, logout } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isChecking && !user) {
      console.log('User not authenticated, redirecting');
      router.push('/login');
    }
  }, [isChecking, user, router]);

  if (isChecking) {
    return (
        <div className="flex items-center justify-center h-screen bg-bg-base text-brand-primary">
            <PacmanLoader color="#EAC2FF" size={24} />
        </div>
    );
  }

  if (!user) {
    return null;
  }

  // LOGIC: Hide sidebar if the path starts with /workspace/ AND has an ID after it.
  // We check length > 11 so the main '/workspace' route still gets the sidebar.
  const isWorkspaceDetail = pathname?.startsWith('/workspace/') && pathname.length > 11;

  // --- VIEW 1: SINGLE WORKSPACE (NO SIDEBAR) ---
  if (isWorkspaceDetail) {
    return (
      <div className="relative min-h-screen bg-bg-base overflow-x-hidden w-full flex flex-col">
          {/* Immersive Background Glows */}
          <div className="fixed top-[-20%] right-[-10%] w-[800px] h-[800px] bg-brand-primary/10 blur-[180px] rounded-full pointer-events-none z-0" />
          <div className="fixed bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-brand-glow/10 blur-[180px] rounded-full pointer-events-none z-0" />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vh] h-[120vh] bg-brand-surface/5 blur-[200px] rounded-full pointer-events-none z-0" />
          
          <div className="relative z-10 flex-1 flex flex-col w-full h-full min-h-screen">
            <NotificationProvider >
              {children}
            </NotificationProvider>
          </div>
      </div>
    );
  }

  // --- VIEW 2: GLOBAL DASHBOARD (WITH SIDEBAR) ---
  return (
    <div className="flex h-screen bg-bg-base text-text-primary overflow-hidden font-sans selection:bg-brand-primary/30">
      
      {/* Immersive Background Glows */}
      <div className="fixed top-[-20%] right-[-10%] w-[800px] h-[800px] bg-brand-primary/10 blur-[180px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-brand-glow/10 blur-[180px] rounded-full pointer-events-none z-0" />
      
      <ResizableSidebar>
        {/* Sidebar Brand Header */}
        <div className="h-14 flex items-center px-5 border-b border-border-subtle shrink-0 bg-white/[0.02]">
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer no-underline">
            <div className="relative w-8 h-8 shrink-0">
              <Image 
                src={traceWeaveLogo} 
                alt="Trace-weave" 
                fill // This ensures it fills the container div
                className="object-contain brightness-125 transition-all group-hover:scale-110" 
                priority // Ensures the logo loads immediately
              />
            </div>
            <span className="font-black text-sm uppercase tracking-widest text-white/90 group-hover:text-white transition-colors">
                Trace-weave
            </span>
          </Link>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
          <Sidebar />
        </div>
      </ResizableSidebar>

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0A0A0F]/50 backdrop-blur-xl border-l border-white/5 relative z-10">
        <DashboardHeader user={user} logout={logout} />
        
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <NotificationProvider >
            {children}
          </NotificationProvider>
        </main>
      </div>
    </div>
  );
}