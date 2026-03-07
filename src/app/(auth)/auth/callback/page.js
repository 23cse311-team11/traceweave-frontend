'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      await checkAuth();
      router.push('/');
    };

    init();
  }, []); // Run once on mount

  return (
    <div className="flex items-center justify-center h-screen bg-bg-base text-text-primary">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-text-secondary">Finalizing secure login...</p>
      </div>
    </div>
  );
}