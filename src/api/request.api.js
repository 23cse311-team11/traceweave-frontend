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

    executeRequest: async (id, environmentId = null) => {
        const response = await api.post(`/requests/${id}/send`, { environmentId });
        return response.data;
    },

    executeAdHocRequest: async (data) => {
        const response = await api.post('/requests/execute', data);
        return response.data;
    },

    getRequestHistory: async (id) => {
        const response = await api.get(`/requests/${id}/history`);
        return response.data;
    }
};
