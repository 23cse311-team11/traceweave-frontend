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
        const config = payload instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
        const res = await api.post(`/requests/${requestId}/send`, payload, config);
        return res.data;
    },

    executeAdHocRequest: async (payload) => {
        const config = payload instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
        const response = await api.post('/requests/execute', payload, config);
        return response.data;
    },

    getRequestHistory: async (id) => {
        const response = await api.get(`/requests/${id}/history`);
        return response.data;
    },

    getJarCookies: async (workspaceId, domain = null) => {
        const params = { workspaceId };
        if (domain) params.domain = domain;
        
        const res = await api.get(`/requests/jar/cookies`, { params });
        return res.data;
    },

    createJarCookie: async (cookieData) => {
        const res = await api.post(`/requests/jar/cookies`, cookieData);
        return res.data;
    },

    updateJarCookie: async (cookieId, cookieData) => {
        const res = await api.patch(`/requests/jar/cookies/${cookieId}`, cookieData);
        return res.data;
    },

    deleteJarCookie: async (cookieId) => {
        await api.delete(`/requests/jar/cookies/${cookieId}`);
    },

    clearJarCookies: async (domain, workspaceId) => { 
        await api.delete(`/requests/jar/cookies`, { params: { domain, workspaceId } });
    },

    connectWs: async (connectionId, url, headers = {}, params = {}, environmentId = null, workspaceId = null) => {
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
        const response = await api.post('/requests/ws/send', { connectionId, message });
        return response.data;
    },

    disconnectWs: async (connectionId) => {
        const response = await api.post('/requests/ws/disconnect', { connectionId });
        return response.data;
    },
};