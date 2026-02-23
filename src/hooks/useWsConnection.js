import { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { requestApi } from '@/api/request.api';
import { useAppStore } from '@/store/useAppStore';

export function useWsConnection(activeId) {
  const store = useAppStore();
  const activeReqState = store.requestStates[activeId] || { config: { url: '' } };

  const connectionIdRef = useRef(uuidv4());
  const eventSourceRef = useRef(null);

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState(null);
  const [logs, setLogs] = useState([]);

  const addLog = useCallback((type, msg) => {
    const time = new Date().toLocaleTimeString('en-US', {
      hour12: false, hour: '2-digit', minute: '2-digit',
      second: '2-digit', fractionalSecondDigits: 3,
    });
    setLogs(prev => [...prev, { type, msg, time }]);
  }, []);

  const clearLogs = useCallback(() => setLogs([]), []);

  const disconnect = useCallback(async () => {
    try {
      await requestApi.disconnectWs(connectionIdRef.current);
    } catch (err) {
      addLog('system', `Failed to disconnect: ${err.message}`);
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
    setConnectionInfo(null);
    addLog('system', `Disconnected manually.`);
  }, [addLog]);

  const connect = useCallback(async () => {
    const url = activeReqState.config?.url;
    if (!url) {
      addLog('system', 'Error: URL is required');
      return;
    }

    setIsConnecting(true);
    addLog('system', `Preparing stream for ${url}...`);

    const sseUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/requests/ws/stream?connectionId=${connectionIdRef.current}`;

    if (eventSourceRef.current) eventSourceRef.current.close();
    eventSourceRef.current = new EventSource(sseUrl);

    eventSourceRef.current.addEventListener('ws_status', (e) => {
      const data = JSON.parse(e.data);
      if (data.status === 'connected') {
        setIsConnecting(false);
        setIsConnected(true);
        setConnectionInfo({ connectedAt: new Date().toLocaleString(), extensions: 'Standard WS' });
        addLog('system', `Connected to ${data.url}`);
      } else if (data.status === 'disconnected') {
        setIsConnecting(false);
        setIsConnected(false);
        setConnectionInfo(null);
        addLog('system', `Disconnected by server (Code: ${data.code}, Reason: ${data.reason || 'None'})`);
        eventSourceRef.current.close();
      }
    });

    eventSourceRef.current.addEventListener('ws_message', (e) => {
      const data = JSON.parse(e.data);
      addLog(data.direction === 'incoming' ? 'in' : 'out', data.message);
    });

    eventSourceRef.current.addEventListener('ws_error', (e) => {
      const data = JSON.parse(e.data);
      setIsConnecting(false);
      setIsConnected(false);
      addLog('system', `Error: ${data.error}`);
      eventSourceRef.current.close();
    });

    try {
      // Setup payload matching your existing logic
      let headers = {};
      if (Array.isArray(activeReqState.config.headers)) {
        activeReqState.config.headers.forEach(h => { if(h.key && h.active !== false) headers[h.key] = h.value; });
      }

      let params = {};
      if (Array.isArray(activeReqState.config.params)) {
        activeReqState.config.params.forEach(p => { if(p.key && p.active !== false) params[p.key] = p.value; });
      }

      const envs = store.workspaceEnvironments[store.activeWorkspaceId] || [];
      const activeEnv = envs[store.selectedEnvIndex];
      const environmentId = activeEnv ? activeEnv.id : null;

      await requestApi.connectWs(
        connectionIdRef.current, url, headers, params, environmentId, store.activeWorkspaceId
      );
    } catch (err) {
      setIsConnecting(false);
      addLog('system', `Connection Failed: ${err.response?.data?.error || err.message}`);
    }
  }, [activeReqState.config, store, addLog]);

  const toggleConnection = useCallback(() => {
    if (isConnected) disconnect();
    else connect();
  }, [isConnected, connect, disconnect]);

  const sendMessage = useCallback(async (messageText) => {
    const trimmed = messageText.trim();
    if (!trimmed || !isConnected) return;
    try {
      await requestApi.sendWsMessage(connectionIdRef.current, trimmed);
    } catch (err) {
      addLog('system', `Send failed: ${err.message}`);
    }
  }, [isConnected, addLog]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isConnected) disconnect();
    };
  }, [disconnect, isConnected]);

  return {
    isConnected,
    isConnecting,
    connectionInfo,
    logs,
    clearLogs,
    toggleConnection,
    sendMessage
  };
}