import { historyApi } from '@/api/history.api';

export const createHistorySlice = (set, get) => ({
    historyLogs: [],
    historyPagination: { total: 0, page: 1, limit: 20, pages: 1 },
    activeExecution: null,
    isHistoryLoading: false,

    fetchHistory: async (page = 1, limit = 20) => {
        set({ isHistoryLoading: true });
        try {
            const data = await historyApi.getGlobalHistory({ page, limit });
            set({ 
                historyLogs: data.data || [], 
                historyPagination: data.pagination || { total: 0, page: 1, limit: 20, pages: 1 },
                isHistoryLoading: false 
            });
        } catch (error) {
            console.error("Failed to fetch history:", error);
            set({ isHistoryLoading: false });
        }
    },

    fetchExecutionDetails: async (execId) => {
        set({ isHistoryLoading: true, activeExecution: null });
        try {
            const data = await historyApi.getExecutionDetails(execId);
            set({ activeExecution: data.data, isHistoryLoading: false });
        } catch (error) {
            console.error("Failed to fetch execution details:", error);
            set({ isHistoryLoading: false });
        }
    },
    
    clearActiveExecution: () => set({ activeExecution: null })
});