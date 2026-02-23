import { collectionApi } from '@/api/collection.api';

export const createCollectionSlice = (set, get) => ({
    collections: [],

    fetchCollections: async (workspaceId) => {
        try {
            const data = await collectionApi.getCollections(workspaceId);
            const rawCollections = data || [];

            const newRequestStates = { ...get().requestStates };
            const normalizedCollections = rawCollections.map(col => {
                const colRequests = col.requests || [];
                const itemIds = colRequests.map(r => r.id);

                // Add requests to state map
                colRequests.forEach(r => {
                    newRequestStates[r.id] = { ...r, collectionId: col.id };
                });

                return {
                    ...col,
                    workspaceId: workspaceId,
                    itemIds: itemIds,
                    requests: undefined 
                };
            });

            set({
                collections: normalizedCollections,
                requestStates: newRequestStates
            });

        } catch (error) { console.warn(error); }
    },

    getFilteredCollections: () => {
        const { collections, requestStates, activeWorkspaceId } = get();
        return collections
            .filter(c => c.workspaceId === activeWorkspaceId)
            .map(c => ({
                ...c,
                items: c.itemIds.map(id => requestStates[id]).filter(Boolean)
            }));
    },

    createCollection: async (name) => {
        const { activeWorkspaceId } = get();
        try {
            const data = await collectionApi.createCollection(activeWorkspaceId, { name: name || 'New Collection' });
            const newCol = { ...data, itemIds: [], workspaceId: activeWorkspaceId };
            set(state => ({ collections: [...state.collections, newCol] }));
        } catch (error) {
            console.warn("Create Collection Error:", error.response?.data || error);
        }
    },

    toggleCollectionCollapse: (colId) => set(state => ({
        collections: state.collections.map(c =>
            c.id === colId ? { ...c, collapsed: !c.collapsed } : c
        )
    })),

    // Used by duplicateItem facade
    duplicateCollection: async (id) => {
        const { activeWorkspaceId, collections } = get();
        const collection = collections.find(c => c.id === id);
        
        if (collection) {
            try {
                const newColData = await collectionApi.createCollection(activeWorkspaceId, {
                    name: `${collection.name} Copy`
                });
                const newCol = { ...newColData, itemIds: [], workspaceId: activeWorkspaceId };
                set(state => ({
                    collections: [...state.collections, newCol]
                }));
            } catch (e) { console.warn(e); }
        }
    },

    renameCollection: async (id, newName) => {
        set(state => ({
            collections: state.collections.map(c => c.id === id ? { ...c, name: newName } : c)
        }));
        try {
            await collectionApi.updateCollection(id, { name: newName });
        } catch (e) { console.warn(e); }
    },

    deleteCollection: async (id) => {
        try {
            await collectionApi.deleteCollection(id);
            set(state => ({ 
                collections: state.collections.filter(c => c.id !== id) 
            }));
        } catch (e) { console.warn(e); }
    },

    // Used by togglePinItem facade
    toggleCollectionPin: (id) => set(state => {
        const colIndex = state.collections.findIndex(c => c.id === id);
        if (colIndex === -1) return {};

        const targetCol = state.collections[colIndex];
        const isNowPinned = !targetCol.pinned;
        const updatedTarget = { ...targetCol, pinned: isNowPinned };
        
        const others = state.collections.filter(c => c.id !== id);
        const othersPinned = others.filter(c => c.pinned);
        const othersUnpinned = others.filter(c => !c.pinned);
        
        let newCollections;
        if (isNowPinned) newCollections = [updatedTarget, ...othersPinned, ...othersUnpinned];
        else newCollections = [...othersPinned, updatedTarget, ...othersUnpinned];
        
        return { collections: newCollections };
    }),

    moveCollection: (activeId, overId) => set(state => {
        const activeCol = state.collections.find(c => c.id === activeId);
        const overCol = state.collections.find(c => c.id === overId);

        if (activeCol?.pinned || overCol?.pinned) return {};

        const activeIndex = state.collections.findIndex(c => c.id === activeId);
        const overIndex = state.collections.findIndex(c => c.id === overId);

        if (activeIndex !== -1 && overIndex !== -1) {
            const newCollections = [...state.collections];
            const [moved] = newCollections.splice(activeIndex, 1);
            newCollections.splice(overIndex, 0, moved);
            return { collections: newCollections };
        }
        return {};
    }),

    moveRequest: (activeId, overId) => set(state => {
        const activeReq = state.requestStates[activeId];
        const overReq = state.requestStates[overId];

        if (activeReq?.pinned || overReq?.pinned) return {};

        const sourceCol = state.collections.find(c => c.itemIds.includes(activeId));
        let targetCol = state.collections.find(c => c.id === overId);
        if (!targetCol) targetCol = state.collections.find(c => c.itemIds.includes(overId));

        if (!sourceCol || !targetCol) return {};

        const newCollections = state.collections.map(col => ({
            ...col,
            itemIds: [...col.itemIds]
        }));

        const sCol = newCollections.find(c => c.id === sourceCol.id);
        const tCol = newCollections.find(c => c.id === targetCol.id);

        // Same Collection Sort
        if (sCol.id === tCol.id) {
            const oldIndex = sCol.itemIds.indexOf(activeId);
            let newIndex;
            if (overId === tCol.id) newIndex = 0;
            else newIndex = sCol.itemIds.indexOf(overId);

            if (newIndex === 0 && sCol.itemIds.length > 0) {
                const topItemId = sCol.itemIds[0];
                if (state.requestStates[topItemId]?.pinned && topItemId !== activeId) {
                    return {};
                }
            }
            sCol.itemIds.splice(oldIndex, 1);
            sCol.itemIds.splice(newIndex, 0, activeId);
        } 
        // Different Collection Move
        else {
            const oldIndex = sCol.itemIds.indexOf(activeId);
            sCol.itemIds.splice(oldIndex, 1);

            let newIndex;
            if (overId === tCol.id) newIndex = tCol.itemIds.length;
            else newIndex = tCol.itemIds.indexOf(overId);

            if (newIndex < tCol.itemIds.length) {
                const itemAtNewPos = state.requestStates[tCol.itemIds[newIndex]];
                if (itemAtNewPos?.pinned) return {};
            }

            tCol.itemIds.splice(newIndex, 0, activeId);

            const newRequestStates = { ...state.requestStates };
            newRequestStates[activeId] = { ...newRequestStates[activeId], collectionId: targetCol.id };
            return { collections: newCollections, requestStates: newRequestStates };
        }

        return { collections: newCollections };
    }),
});