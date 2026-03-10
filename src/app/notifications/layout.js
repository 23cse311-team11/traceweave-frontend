'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { PacmanLoader } from 'react-spinners';
import { Zap } from 'lucide-react';
import { ResizableSidebar } from '@/components/home/auth_landing/ResizableSidebar';
import { Sidebar } from '@/components/home/auth_landing/Sidebar';
import { DashboardHeader } from '@/components/home/auth_landing/DashboardHeader';
import NotificationProvider from '@/components/providers/NotificationProvider';

export default function NotificationsLayout({ children }) {
  const router = useRouter();
  const { user, isChecking, checkAuth, logout } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isChecking && !user) {
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

  return (
    <div className="flex h-screen bg-bg-base text-text-primary overflow-hidden font-sans selection:bg-brand-primary/30">
      {/* Immersive Background Glows */}
      <div className="fixed top-[-20%] right-[-10%] w-[800px] h-[800px] bg-brand-primary/10 blur-[180px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-brand-glow/10 blur-[180px] rounded-full pointer-events-none z-0" />

      <ResizableSidebar>
        <div className="h-14 flex items-center px-5 border-b border-border-subtle shrink-0 bg-white/[0.02] relative z-10">
          <div
            className="flex items-center gap-2.5 group cursor-pointer"
            onClick={() => router.push('/')}
          >
            <div className="p-1.5 rounded-lg bg-brand-primary/10 border border-brand-primary/20 group-hover:border-brand-primary/40 transition-all">
              <Zap size={18} className="text-brand-primary fill-brand-primary/20" />
            </div>
            <span className="font-black text-sm uppercase tracking-widest text-white/90 group-hover:text-white transition-colors">
              Trace-weave
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
          <Sidebar />
        </div>
      </ResizableSidebar>

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0A0A0F]/50 backdrop-blur-xl border-l border-white/5 relative z-10">
        <DashboardHeader user={user} logout={logout} />

        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </main>
      </div>
    </div>
  );
}
