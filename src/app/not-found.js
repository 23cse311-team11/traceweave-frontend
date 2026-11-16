import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center h-screen bg-bg-base">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-4xl font-bold text-text-primary">404 - Page Not Found</h1>
        <p className="text-text-secondary">The page you are looking for does not exist.</p>
        <Link 
          href="/" 
          className="px-6 py-3 bg-brand-primary text-brand-surface font-black uppercase tracking-widest rounded-2xl hover:bg-brand-primary/90 transition-all shadow-glow-sm"
        >
          GO BACK HOME
        </Link>
      </div>
    </div>
  );
}
