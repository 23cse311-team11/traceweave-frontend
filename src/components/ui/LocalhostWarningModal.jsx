'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MonitorDown, X, ShieldAlert, Zap, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LocalhostWarningModal({ isOpen, onClose }) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleDownloadClick = () => {
    onClose();
    router.push('/download');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 font-sans">
        
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Decorative Top Glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-primary via-brand-glow to-brand-orange" />
          
          <div className="p-6 md:p-8 flex flex-col items-center text-center relative z-10">
            
            {/* Visual Icon Header */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-brand-primary/20 blur-xl rounded-full" />
              <div className="w-16 h-16 bg-[#141414] border border-brand-primary/30 rounded-2xl flex items-center justify-center relative z-10 shadow-glow">
                <MonitorDown size={32} className="text-brand-primary" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-[#141414] border border-border-subtle rounded-full p-1.5 z-20">
                <ShieldAlert size={14} className="text-brand-orange" />
              </div>
            </div>

            <h2 className="text-2xl font-black tracking-tight text-white mb-3">
              Localhost Blocked by Browser
            </h2>
            
            <p className="text-sm text-text-secondary leading-relaxed mb-6">
              Modern web browsers enforce strict security policies that prevent cloud websites from pinging your local network (<code className="text-xs bg-white/5 px-1 py-0.5 rounded text-brand-orange">localhost</code>).
            </p>

            {/* Feature Pitch */}
            <div className="w-full bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3 mb-8 text-left">
              <div className="flex items-start gap-3">
                <Zap size={16} className="text-brand-primary mt-0.5 shrink-0" />
                <p className="text-xs text-text-primary">
                  <span className="font-bold">Bypass CORS & Security Flags.</span> The Desktop App runs natively, granting direct access to your local servers.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Globe size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                <p className="text-xs text-text-primary">
                  <span className="font-bold">Everything stays synced.</span> Your workspaces, history, and environments sync instantly between Web and Desktop.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col w-full gap-3">
              <button
                onClick={handleDownloadClick}
                className="w-full bg-brand-primary hover:bg-brand-glow text-black font-bold py-3 rounded-xl transition-all shadow-glow-sm flex items-center justify-center gap-2"
              >
                <MonitorDown size={18} />
                Get Desktop App
              </button>
              <button
                onClick={onClose}
                className="w-full bg-transparent hover:bg-white/5 text-text-muted hover:text-white font-medium py-3 rounded-xl transition-colors text-sm"
              >
                Maybe later
              </button>
            </div>

          </div>

          {/* Close Button (Top Right) */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-text-muted hover:text-white hover:bg-white/10 rounded-lg transition-colors z-20"
          >
            <X size={16} />
          </button>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}