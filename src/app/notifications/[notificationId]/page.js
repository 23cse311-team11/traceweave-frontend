'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { PacmanLoader } from 'react-spinners';

export default function NotificationRedirector({ params }) {
  const router = useRouter();
  const { notificationId } = params;
  const { notifications, markNotificationRead, setActiveWorkspace } = useAppStore();

  useEffect(() => {
    const handleRoute = async () => {
      // 1. Mark as read immediately
      await markNotificationRead(notificationId);

      // 2. Find the notification to parse metadata
      const notification = notifications.find(n => n.id === notificationId);
      
      if (!notification) {
        router.push('/notifications');
        return;
      }

      // 3. Smart Routing
      if (notification.actionUrl) {
        // If it has a workspace context, switch Zustand to it before routing
        if (notification.metadata?.workspaceId) {
          setActiveWorkspace(notification.metadata.workspaceId);
        }
        router.push(notification.actionUrl);
      } else {
        // Fallback
        router.push('/notifications');
      }
    };

    handleRoute();
  }, [notificationId, notifications, markNotificationRead, setActiveWorkspace, router]);

  // Show a blank/loading screen for the split second it takes to redirect
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <PacmanLoader color="#EAC2FF" size={24} />
    </div>
  );
}