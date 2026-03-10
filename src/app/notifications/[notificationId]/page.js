'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { PacmanLoader } from 'react-spinners';

export default function NotificationRedirector() {
  const router = useRouter();
  const { notificationId } = useParams();
  const { markNotificationRead, setActiveWorkspace } = useAppStore();
  const hasHandled = useRef(false);

  useEffect(() => {
    if (hasHandled.current) return;
    hasHandled.current = true;

    const handleRoute = async () => {
      // 1. Mark as read immediately
      await markNotificationRead(notificationId);

      // 2. Read notification state imperatively to avoid adding it to deps (which causes an infinite loop
      //    because markNotificationRead updates the notifications array, re-triggering this effect).
      const notification = useAppStore.getState().notifications.find(n => n.id === notificationId);
      
      if (!notification) {
        router.push('/notifications');
        return;
      }

      const { type, metadata, actionUrl } = notification;

      // 3. Explicit URL always wins
      if (actionUrl) {
        if (metadata?.workspaceId) {
          setActiveWorkspace(metadata.workspaceId);
        }
        router.push(actionUrl);
        return;
      }

      // 4. Type-based smart routing
      if (type === 'WORKFLOW_SUCCESS' || type === 'WORKFLOW_FAILED') {
        if (metadata?.workspaceId && metadata.workspaceId !== useAppStore.getState().activeWorkspaceId) {
          setActiveWorkspace(metadata.workspaceId);
        }
        router.push(`/workspace/${metadata?.workspaceId}/workflows/${metadata?.workflowId}?exec=${metadata?.executionId}`);
        return;
      }

      if (type === 'WORKSPACE_INVITE') {
        router.push(`/invites/${metadata?.inviteId}`);
        return;
      }

      // 5. Fallback
      router.push('/notifications');
    };

    handleRoute();
  }, [notificationId, markNotificationRead, setActiveWorkspace, router]);

  // Show a blank/loading screen for the split second it takes to redirect
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <PacmanLoader color="#EAC2FF" size={24} />
    </div>
  );
}