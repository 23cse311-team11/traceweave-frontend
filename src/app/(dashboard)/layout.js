'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { PacmanLoader } from 'react-spinners';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const { user, isChecking, checkAuth } = useAuthStore();

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
        <div className="flex items-center justify-center h-screen bg-bg-base text-text-secondary">
            <PacmanLoader color="#FF6F00" size={24} />
        </div>);
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
