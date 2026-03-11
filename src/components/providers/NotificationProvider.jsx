'use client';

import React, { useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';

export default function NotificationProvider({ children }) {
  const { addRealtimeNotification, fetchNotifications } = useAppStore();
  const wsRef = useRef(null);

  useEffect(() => {
    // Fetch initial state
    fetchNotifications();

    // Determine WS URL (WSS for production, WS for dev)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.NEXT_PUBLIC_API_URL 
      ? new URL(process.env.NEXT_PUBLIC_API_URL).host 
      : 'localhost:5000';
    
    const wsUrl = `${protocol}//${host}/api/v1/notifications`;

    const connectWs = () => {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('Connected to Real-Time Notifications');
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'NEW_NOTIFICATION') {
            addRealtimeNotification(data.payload);
            
            // Optional: Trigger a browser/toast notification here
            // toast.info(data.payload.title);
          }
        } catch (err) {
          console.error('Failed to parse WS message', err);
        }
      };

      wsRef.current.onclose = () => {
        console.log('Notification WS disconnected. Reconnecting in 5s...');
        setTimeout(connectWs, 5000); // Simple auto-reconnect
      };
    };

    connectWs();

    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null; // Prevent reconnect loop on unmount
        wsRef.current.close();
      }
    };
  }, [addRealtimeNotification, fetchNotifications]);

  return <>{children}</>;
}