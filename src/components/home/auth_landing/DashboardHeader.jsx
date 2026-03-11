'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Search, LogOut, User, Building2, Settings, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CommandPalette from '@/components/ui/CommandPalette';
import NotificationBell from '@/components/layout/NotificationBell';

export const DashboardHeader = ({ user, logout }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const profileRef = useRef(null);

  // Profile Dropdown click-outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cmd+K / Ctrl+K Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="h-14 border-b border-border-subtle bg-bg-base/80 backdrop-blur-md flex items-center justify-between px-6 z-20 sticky top-0">
        
        {/* Search Bar */}
        <div className="w-full max-w-md">
          <button 
            onClick={() => setIsCommandPaletteOpen(true)}
            className="flex items-center gap-2 w-full px-3 py-1.5 bg-bg-input border border-border-subtle rounded-md text-sm text-text-muted hover:border-border-strong transition-colors group"
          >
            <Search size={14} className="group-hover:text-text-primary transition-colors" />
            <span>Search workspaces, traces, or collections...</span>
            <div className="ml-auto flex items-center gap-1">
              <kbd className="hidden sm:inline-block px-1.5 text-[10px] font-mono bg-bg-panel border border-border-subtle rounded text-text-muted">⌘K</kbd>
            </div>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          
          {/* DESKTOP DOWNLOAD BUTTON */}
          <Link href="/download" className="hidden md:block">
            <motion.div 
              whileHover={{ y: -1 }} 
              whileTap={{ scale: 0.98 }}
              className="relative group flex items-center gap-2 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-brand-primary/40 px-3 py-1.5 rounded-full transition-all duration-300"
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-primary/10 group-hover:bg-brand-primary/20 transition-colors">
                <Monitor size={12} className="text-brand-primary group-hover:scale-110 transition-transform" />
              </div>
              
              <div className="flex flex-col items-start leading-none pr-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-white">Desktop App</span>
                <span className="text-[8px] text-text-muted font-medium group-hover:text-brand-primary transition-colors">Native Performance</span>
              </div>

              <div className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
              </div>
            </motion.div>
          </Link>

          <div className="h-6 w-px bg-white/10 mx-1 hidden lg:block"></div>

          <NotificationBell />

          {/* User Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 border border-border-subtle flex items-center justify-center text-xs font-medium text-white hover:ring-2 ring-border-subtle transition-all overflow-hidden shrink-0"
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.email?.substring(0, 2).toUpperCase() || 'ME'
              )}
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 bg-[#1A1A1A] border border-border-strong rounded-lg shadow-xl py-1 z-50"
                >
                  <div className="px-3 py-2 border-b border-border-subtle">
                    <p className="text-sm font-medium text-text-primary truncate">{user?.fullName || 'Engineer'}</p>
                    <p className="text-xs text-text-secondary truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors">
                      <User size={14} className="text-brand-primary" /> Profile
                    </Link>
                    <Link href="/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors">
                      <Settings size={14} className="text-text-muted" /> Settings
                    </Link>
                    <Link href="/billing" className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors">
                      <Building2 size={14} className="text-emerald-500" /> Billing & Plan
                    </Link>
                  </div>
                  <div className="py-1 border-t border-border-subtle">
                    <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10">
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Mount the Command Palette */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
      />
    </>
  );
};