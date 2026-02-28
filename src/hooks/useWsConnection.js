import { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { requestApi } from '@/api/request.api';
import { useAppStore } from '@/store/useAppStore';

export function useWsConnection(activeId) {
  const store = useAppStore();
  const activeReqState = store.requestStates[activeId] || { config: { url: '' } };

  const connectionIdRef = useRef(uuidv4());
  const eventSourceRef = useRef(null);
  const ipcCleanupRef = useRef(null); // Track IPC listener cleanup

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState(null);
  const [logs, setLogs] = useState([]);

  const isElectron = typeof window !== "undefined" && window.electronAPI;

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
      // BRANCH: Desktop vs Web
      if (isElectron) {
        await window.electronAPI.wsDisconnect({ connectionId: connectionIdRef.current });
      } else {
        await requestApi.disconnectWs(connectionIdRef.current);
      }
    } catch (err) {
      addLog('system', `Failed to disconnect: ${err.message}`);
    }
    
    // Cleanup Web SSE
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    // Cleanup Electron IPC
    if (ipcCleanupRef.current) {
      ipcCleanupRef.current();
      ipcCleanupRef.current = null;
    }

    setIsConnected(false);
    setConnectionInfo(null);
    addLog('system', `Disconnected manually.`);
  }, [addLog, isElectron]);

  const connect = useCallback(async () => {
    const url = activeReqState.config?.url;
    if (!url) {
      addLog('system', 'Error: URL is required');
      return;
    }

    setIsConnecting(true);

    // Prepare headers, params, and env data (Shared logic for both environments)
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
    
    // Pass the actual environment values down so Electron can inject them natively
    const environmentValues = activeEnv ? activeEnv.variables.reduce((acc, v) => ({ ...acc, [v.key]: v.value }), {}) : {};

    // ==========================================================
    // BRANCH 1: ELECTRON NATIVE IPC LOGIC
    // ==========================================================
    if (isElectron) {
      addLog('system', `Preparing native IPC stream for ${url}...`);
      
      // 1. Setup Listener BEFORE firing connection
      ipcCleanupRef.current = window.electronAPI.onWsEvent((eventData) => {
        const { connectionId, type, data, error, code, reason } = eventData;
        
        // Ignore events not meant for this hook instance
        if (connectionId !== connectionIdRef.current) return;

        if (type === 'open') {
          setIsConnecting(false);
          setIsConnected(true);
          setConnectionInfo({ connectedAt: new Date().toLocaleString(), extensions: 'Native WS (Desktop)' });
          addLog('system', `Connected natively to ${url}`);
        } else if (type === 'message') {
          addLog('in', data);
        } else if (type === 'error') {
          setIsConnecting(false);
          setIsConnected(false);
          addLog('system', `Error: ${error}`);
        } else if (type === 'close') {
          setIsConnecting(false);
          setIsConnected(false);
          setConnectionInfo(null);
          addLog('system', `Disconnected by server (Code: ${code}, Reason: ${reason || 'None'})`);
          if (ipcCleanupRef.current) {
            ipcCleanupRef.current();
            ipcCleanupRef.current = null;
          }
        }
      });

      // 2. Fire Connection
      try {
        // We bypass requestApi here for Electron to inject the environmentValues directly
        await window.electronAPI.wsConnect({
          connectionId: connectionIdRef.current,
          url,
          headers,
          params,
          environmentValues // Electron Main needs this for variable injection
        });
      } catch (err) {
        setIsConnecting(false);
        addLog('system', `Connection Failed: ${err.message}`);
        if (ipcCleanupRef.current) ipcCleanupRef.current();
      }
    } 
    // ==========================================================
    // BRANCH 2: WEB SSE LOGIC (Legacy)
    // ==========================================================
    else {
      addLog('system', `Preparing SSE stream for ${url}...`);

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
        await requestApi.connectWs(
          connectionIdRef.current, url, headers, params, environmentId, store.activeWorkspaceId
        );
      } catch (err) {
        setIsConnecting(false);
        addLog('system', `Connection Failed: ${err.response?.data?.error || err.message}`);
      }
    }
  }, [activeReqState.config, store, addLog, isElectron]);

  const toggleConnection = useCallback(() => {
    if (isConnected) disconnect();
    else connect();
  }, [isConnected, connect, disconnect]);

  const sendMessage = useCallback(async (messageText) => {
    const trimmed = messageText.trim();
    if (!trimmed || !isConnected) return;
    
    try {
      // BRANCH: Desktop vs Web
      if (isElectron) {
        await window.electronAPI.wsSend({ 
          connectionId: connectionIdRef.current, 
          message: trimmed 
        });
      } else {
        await requestApi.sendWsMessage(connectionIdRef.current, trimmed);
      }
      
      addLog('out', trimmed); // Optimistic UI update
    } catch (err) {
      addLog('system', `Send failed: ${err.message}`);
    }
  }, [isConnected, addLog, isElectron]);

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