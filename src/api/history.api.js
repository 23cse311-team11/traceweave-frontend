import { api } from '@/lib/api';

export const historyApi = {
    // We are reusing the global-history endpoint you already made for the list
    getGlobalHistory: async (params = { page: 1, limit: 20 }) => {
        const response = await api.get(`/workspaces/user/global-history`, { params });
        return response.data;
    },
    
    getWorkspaceHistory: async (workspaceId, params = { page: 1, limit: 20 }) => {
        const response = await api.get(`/workspaces/${workspaceId}/history`, { params });
        return response.data;
    },
    
    // Fetch detailed data for a specific execution
    getExecutionDetails: async (execId) => {
        const response = await api.get(`/executions/${execId}`);
        return response.data;
    },

    deleteExecution: async (execId) => {
        const response = await api.delete(`/executions/${execId}`);
        return response.data;
    },

    clearWorkspaceHistory: async (workspaceId) => {
        const response = await api.delete(`/workspaces/${workspaceId}/history`);
        return response.data;
    },

    clearGlobalHistory: async () => {
        const response = await api.delete(`/workspaces/user/global-history`);
        return response.data;
    }
};