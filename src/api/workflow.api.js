import { api } from '@/lib/api';

export const workflowApi = {
    createWorkflow: async (data) => {
        const response = await api.post('/workflows', data);
        return response.data;
    },

    getWorkflows: async (workspaceId) => {
        const response = await api.get(`/workflows/workspace/${workspaceId}`);
        return response.data;
    },

    updateWorkflow: async (id, data) => {
        const response = await api.patch(`/workflows/${id}`, data);
        return response.data;
    },

    deleteWorkflow: async (id) => {
        const response = await api.delete(`/workflows/${id}`);
        return response.data;
    },

    executeWorkflow: async (id) => {
        const response = await api.post(`/workflows/${id}/run`);
        return response.data;
    },

    getWorkflowHistory: async (id) => {
        const response = await api.get(`/workflows/${id}/history`);
        return response.data;
    }
};
