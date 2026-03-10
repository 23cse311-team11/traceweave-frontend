'use client';

import React, { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import Link from 'next/link';
import { CheckCheck, Bell, Workflow, Users, ShieldAlert } from 'lucide-react';

export default function NotificationsPage() {
  const { notifications, fetchNotifications, markAllNotificationsRead } = useAppStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getIcon = (type) => {
    if (type.includes('WORKFLOW')) return <Workflow size={16} className="text-brand-primary" />;
    if (type.includes('MEMBER') || type.includes('INVITE')) return <Users size={16} className="text-emerald-500" />;
    return <ShieldAlert size={16} className="text-amber-500" />;
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Notifications</h1>
          <p className="text-text-muted mt-1">Stay updated on your workspaces and workflows.</p>
        </div>
        <button 
          onClick={markAllNotificationsRead}
          className="flex items-center gap-2 px-4 py-2 bg-bg-input border border-border-subtle rounded-lg text-sm hover:text-white transition-colors"
        >
          <CheckCheck size={16} /> Mark all as read
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {notifications.length === 0 ? (
          <div className="py-20 flex flex-col items-center text-text-muted border border-dashed border-border-subtle rounded-2xl">
            <Bell size={40} className="opacity-20 mb-4" />
            <p>You're all caught up!</p>
          </div>
        ) : (
          notifications.map(notif => (
            <Link 
              key={notif.id} 
              href={`/notifications/${notif.id}`} // Routes to the smart interceptor
              className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                notif.isRead 
                  ? 'bg-bg-panel/50 border-border-subtle opacity-70' 
                  : 'bg-bg-panel border-brand-primary/30 shadow-[0_0_15px_rgba(var(--brand-primary-rgb),0.1)]'
              }`}
            >
              <div className="mt-1 p-2 rounded-lg bg-bg-input">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1">
                <h3 className={`text-sm ${notif.isRead ? 'font-medium' : 'font-bold text-brand-primary'}`}>
                  {notif.title}
                </h3>
                <p className="text-sm text-text-secondary mt-1">{notif.message}</p>
                <span className="text-[10px] text-text-muted mt-3 block uppercase tracking-wider">
                  {new Date(notif.createdAt).toLocaleString()}
                </span>
              </div>
              {!notif.isRead && <div className="w-2 h-2 rounded-full bg-brand-primary mt-2"></div>}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}