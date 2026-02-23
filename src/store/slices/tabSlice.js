export const createTabSlice = (set, get) => ({
    openTabs: [],
    activeTabId: null,
    previewTabId: null,

    openTab: (id, isPreview = false) => set(state => {
        const isAlreadyOpen = state.openTabs.includes(id);
        
        // Logic to determine view based on ID type
        let nextView = 'runner';
        if (state.monitorStates?.[id]) nextView = 'monitor';
        else if (state.workspaceEnvironments?.[state.activeWorkspaceId]?.some(e => e.id === id)) nextView = 'environment';

        if (isAlreadyOpen) {
        if (!isPreview && state.previewTabId === id) {
            return { activeTabId: id, previewTabId: null, activeView: nextView };
        }
        return { activeTabId: id, activeView: nextView };
        }

        let newTabs = [...state.openTabs];
        let newPreviewId = state.previewTabId;

        if (isPreview) {
        if (state.previewTabId) {
            const idx = newTabs.indexOf(state.previewTabId);
            if (idx !== -1) newTabs[idx] = id;
            else newTabs.push(id);
        } else {
            newTabs.push(id);
        }
        newPreviewId = id;
        } else {
        newTabs.push(id);
        }

        return {
        openTabs: newTabs,
        activeTabId: id,
        previewTabId: newPreviewId,
        activeView: nextView
        };
    }),

    closeTab: (id) => set(state => {
        const newTabs = state.openTabs.filter(t => t !== id);
        let newActive = state.activeTabId;
        let nextView = state.activeView;

        // If closing the active tab, switch to the last available one
        if (id === state.activeTabId) {
            newActive = newTabs.length > 0 ? newTabs[newTabs.length - 1] : null;

            // If we switched tabs, we must update the view
            if (newActive) {
                if (state.monitorStates[newActive]) nextView = 'monitor';
                else {
                    const wsId = state.activeWorkspaceId;
                    const envs = state.workspaceEnvironments[wsId] || [];
                    if (envs.some(e => e.id === newActive)) nextView = 'environment';
                    else nextView = 'runner';
                }
            } else {
                nextView = 'runner'; // Default if no tabs
            }
        }

        let newPreview = state.previewTabId === id ? null : state.previewTabId;
        return { openTabs: newTabs, activeTabId: newActive, previewTabId: newPreview, activeView: nextView };
    }),

    markTabPermanent: (id) => set(state => {
        if (state.previewTabId === id) return { previewTabId: null };
        return {};
    }),
});