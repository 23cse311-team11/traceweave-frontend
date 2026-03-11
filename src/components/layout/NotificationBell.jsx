'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Workflow, Users, ShieldAlert, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const router = useRouter();
  
  const { notifications, unreadCount, markAllNotificationsRead } = useAppStore();

  // Handle click outside to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type) => {
    if (!type) return <Bell size={14} className="text-text-muted" />;
    if (type.includes('WORKFLOW')) return <Workflow size={14} className="text-brand-primary" />;
    if (type.includes('MEMBER') || type.includes('INVITE')) return <Users size={14} className="text-emerald-500" />;
    return <ShieldAlert size={14} className="text-amber-500" />;
  };

  const handleNotificationClick = (id) => {
    setIsOpen(false);
    // Push to the smart interceptor route we built
    router.push(`/notifications/${id}`);
  };

  const getRelativeTime = (dateString) => {
    const diffInSeconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="relative flex items-center" ref={containerRef}>
      {/* The Bell Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="text-text-muted hover:text-text-primary transition-colors relative flex items-center justify-center p-1"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[14px] h-[14px] px-1 bg-brand-primary text-brand-surface text-[9px] font-bold rounded-full border border-bg-base shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </motion.button>

      {/* The Dropdown Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full mt-3 w-[340px] sm:w-[380px] bg-bg-panel border border-border-strong rounded-xl shadow-2xl z-[100] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border-subtle flex justify-between items-center bg-bg-base/50 shrink-0">
              <span className="font-bold text-sm text-white">Notifications</span>
              {unreadCount > 0 && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    markAllNotificationsRead();
                  }} 
                  className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-brand-primary hover:text-brand-glow transition-colors"
                >
                  <CheckCheck size={12} /> Mark all read
                </button>
              )}
            </div>

            {/* Notification List (Shows up to 10) */}
            <div className="max-h-[380px] overflow-y-auto custom-scrollbar flex flex-col bg-bg-base/20">
              {notifications.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-text-muted">
                  <Bell size={32} className="opacity-20 mb-3" />
                  <p className="text-sm font-medium">You're all caught up!</p>
                  <p className="text-xs mt-1 opacity-60">No new notifications</p>
                </div>
              ) : (
                notifications.slice(0, 10).map(notif => (
                  <button
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif.id)}
                    className={`flex items-start gap-3 p-4 text-left border-b border-border-subtle/40 hover:bg-white/5 transition-colors group ${
                      !notif.isRead ? 'bg-brand-primary/[0.04]' : ''
                    }`}
                  >
                    <div className={`mt-0.5 p-1.5 rounded-md transition-colors ${!notif.isRead ? 'bg-brand-primary/20 text-brand-primary' : 'bg-bg-input text-text-muted group-hover:text-white'}`}>
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h4 className={`text-xs truncate ${!notif.isRead ? 'font-bold text-white' : 'font-medium text-text-primary group-hover:text-white transition-colors'}`}>
                        {notif.title}
                      </h4>
                      <p className="text-[11px] text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                      <span className="text-[9px] text-text-muted mt-2 block uppercase tracking-wider">
                        {getRelativeTime(notif.createdAt)}
                      </span>
                    </div>
                    {!notif.isRead && (
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0 mt-1.5 shadow-[0_0_8px_rgba(var(--brand-primary-rgb),0.8)]" />
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-border-subtle bg-bg-base/80 shrink-0">
              <Link 
                href="/notifications" 
                onClick={() => setIsOpen(false)} 
                className="flex items-center justify-center w-full py-2 text-xs font-bold uppercase tracking-wider text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                View all notifications
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}