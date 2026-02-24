import { api } from '@/lib/api';

export const requestApi = {
    createRequest: async (collectionId, data) => {
        const response = await api.post(`/requests/${collectionId}`, data);
        return response.data;
    },

    getRequestsByCollection: async (collectionId) => {
        const response = await api.get(`/requests/collection/${collectionId}`);
        return response.data;
    },

    updateRequest: async (id, data) => {
        const response = await api.patch(`/requests/${id}`, data);
        return response.data;
    },

    deleteRequest: async (id) => {
        const response = await api.delete(`/requests/${id}`);
        return response.data;
    },

    executeRequest: async (requestId, payload) => {
        const isElectron = typeof window !== "undefined" && window.electronAPI;

        if (isElectron) {
            const result = await window.electronAPI.executeRequest({
                type: "saved",
                requestId,
                payload,
            });
            return result;
        }

        const config = payload instanceof FormData
            ? { headers: { 'Content-Type': 'multipart/form-data' } }
            : {};

        const res = await api.post(`/requests/${requestId}/send`, payload, config);
        return res.data;
    },

    executeAdHocRequest: async (payload) => {
        const isElectron = typeof window !== "undefined" && window.electronAPI;

        if (isElectron) {
            const result = await window.electronAPI.executeRequest({
                type: "adhoc",
                payload,
            });
            return result;
        }

        const config = payload instanceof FormData
            ? { headers: { 'Content-Type': 'multipart/form-data' } }
            : {};

        const response = await api.post('/requests/execute', payload, config);
        return response.data;
    },

    getRequestHistory: async (id) => {
        const response = await api.get(`/requests/${id}/history`);
        return response.data;
    },

    getJarCookies: async (workspaceId, domain = null) => {
        const isElectron = typeof window !== "undefined" && window.electronAPI;
        if (isElectron) {
            return await window.electronAPI.getJarCookies({ domain });
        }

        const params = { workspaceId };
        if (domain) params.domain = domain;
        const res = await api.get(`/requests/jar/cookies`, { params });
        return res.data;
    },

    createJarCookie: async (cookieData) => {
        const isElectron = typeof window !== "undefined" && window.electronAPI;
        if (isElectron) {
            // ✨ FIX: Safely fallback between 'key' and 'name'
            const cookieName = cookieData.key || cookieData.name || 'unnamed_cookie';
            const cookieValue = cookieData.value || '';
            return await window.electronAPI.createJarCookie({
                url: cookieData.domain.startsWith('http') ? cookieData.domain : `http://${cookieData.domain}`,
                cookieString: `${cookieName}=${cookieValue}; Domain=${cookieData.domain}; Path=${cookieData.path || '/'}`
            });
        }

        const res = await api.post(`/requests/jar/cookies`, cookieData);
        return res.data;
    },

    updateJarCookie: async (cookieId, cookieData) => {
        const isElectron = typeof window !== "undefined" && window.electronAPI;
        if (isElectron) {
            // ✨ FIX: Safely fallback between 'key' and 'name'
            const cookieName = cookieData.key || cookieData.name || 'unnamed_cookie';
            const cookieValue = cookieData.value || '';
            return await window.electronAPI.createJarCookie({
                url: cookieData.domain.startsWith('http') ? cookieData.domain : `http://${cookieData.domain}`,
                cookieString: `${cookieName}=${cookieValue}; Domain=${cookieData.domain}; Path=${cookieData.path || '/'}`
            });
        }

        const res = await api.patch(`/requests/jar/cookies/${cookieId}`, cookieData);
        return res.data;
    },

    deleteJarCookie: async (cookieId, domain, key) => { 
        const isElectron = typeof window !== "undefined" && window.electronAPI;
        if (isElectron) {
            return await window.electronAPI.deleteJarCookie({ domain, key });
        }

        await api.delete(`/requests/jar/cookies/${cookieId}`);
    },

    clearJarCookies: async (domain, workspaceId) => { 
        const isElectron = typeof window !== "undefined" && window.electronAPI;
        if (isElectron) {
            return await window.electronAPI.clearJarCookies({ domain });
        }

        await api.delete(`/requests/jar/cookies`, { params: { domain, workspaceId } });
    },

    connectWs: async (connectionId, url, headers = {}, params = {}, environmentId = null, workspaceId = null) => {
        const isElectron = typeof window !== "undefined" && window.electronAPI;

        if (isElectron) {
            return window.electronAPI.wsConnect({
                connectionId,
                url,
                headers,
                params,
                environmentId,
                workspaceId,
            });
        }

        const response = await api.post('/requests/ws/connect', { 
            connectionId, 
            url, 
            headers, 
            params, 
            environmentId, 
            workspaceId 
        });

        return response.data;
    },

    sendWsMessage: async (connectionId, message) => {
        const isElectron = typeof window !== "undefined" && window.electronAPI;

        if (isElectron) {
            return window.electronAPI.wsSend({ connectionId, message });
        }

        const response = await api.post('/requests/ws/send', { connectionId, message });
        return response.data;
    },

    disconnectWs: async (connectionId) => {
        const isElectron = typeof window !== "undefined" && window.electronAPI;

        if (isElectron) {
            return window.electronAPI.wsDisconnect({ connectionId });
        }

        const response = await api.post('/requests/ws/disconnect', { connectionId });
        return response.data;
    },

    syncExecutionHistory: async (payload) => {
        // Fire-and-forget payload sent to the backend
        const response = await api.post('/requests/history/sync', payload);
        return response.data;
    },
};