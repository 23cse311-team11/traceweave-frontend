import { api } from '@/lib/api';

export const createWorkflowSlice = (set, get) => ({
    workflows: [],
    activeWorkflow: null,

    fetchWorkspacesWorkflows: async (workspaceId) => {
        try {
            const res = await api.get(`/workflows/workspace/${workspaceId}`);
            set({ workflows: res.data });
        } catch (error) {
            console.error('Failed to fetch workflows', error);
        }
    },

    createWorkflow: async (workspaceId, name, description) => {
        try {
            const res = await api.post(`/workflows`, {
                workspaceId, name, description, flowData: { nodes: [], edges: [] }
            });
            set(state => ({ workflows: [...state.workflows, res.data] }));
            return res.data;
        } catch (error) {
            console.error('Failed to create workflow', error);
            throw error;
        }
    },

    fetchWorkflow: async (workflowId) => {
        try {
            const res = await api.get(`/workflows/${workflowId}`);
            set({ activeWorkflow: Object.assign({}, res.data, {
                // Ensure flowData is parsed or default if missing
                flowData: res.data.flowData || { nodes: [], edges: [] }
            }) });
        } catch (error) {
            console.error('Failed to fetch individual workflow', error);
        }
    },

    setActiveWorkflow: (workflowId) => {
        const wf = get().workflows.find(w => w.id === workflowId);
        // If it exists in state locally set it, else empty flowData
        set({ activeWorkflow: wf ? Object.assign({}, wf, { flowData: wf.flowData || { nodes: [], edges: [] } }) : null });
    },

    saveWorkflowGraph: async (workflowId, flowData) => {
        try {
            await api.patch(`/workflows/${workflowId}`, {
                flowData
            });
            // Update local state
            set(state => ({
                workflows: state.workflows.map(w => w.id === workflowId ? { ...w, flowData } : w)
            }));
        } catch (error) {
            console.error(`Failed to save workflow ${workflowId}`, error);
        }
    }
});