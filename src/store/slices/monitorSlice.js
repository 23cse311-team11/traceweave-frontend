import { createId } from '@/utils/helpers'; // Assuming you put createId in a helper file

export const createMonitorSlice = (set, get) => ({
  monitorStates: {},

  createMonitor: () => set(state => {
    const newId = createId();
    const newMonitor = {
      id: newId,
      name: 'New Monitor',
      type: 'monitor',
      pinned: false,
      status: 'healthy',
      interval: 10000
    };

    // Cross-slice update: Add to openTabs and switch view
    const newTabs = [...state.openTabs, newId];

    return {
      monitorStates: { ...state.monitorStates, [newId]: newMonitor },
      openTabs: newTabs,
      activeTabId: newId,
      activeView: 'monitor' // Switch UI to Monitor view
    };
  }),

  deleteMonitor: (id) => set(state => {
    // Remove from monitorStates
    const { [id]: deleted, ...remainingMonitors } = state.monitorStates;

    // Cross-slice update: Remove from openTabs and reset activeTabId if necessary
    const newTabs = state.openTabs.filter(t => t !== id);
    const newActive = state.activeTabId === id ? (newTabs[newTabs.length - 1] || null) : state.activeTabId;

    return {
      monitorStates: remainingMonitors,
      openTabs: newTabs,
      activeTabId: newActive
    };
  }),

  // --- Helper Actions for Facades ---
  // These are called by the generic togglePinItem/duplicateItem in the main store

  toggleMonitorPin: (id) => set(state => {
    const mon = state.monitorStates[id];
    if (!mon) return {};

    return {
      monitorStates: {
        ...state.monitorStates,
        [id]: { ...mon, pinned: !mon.pinned }
      }
    };
  }),

  duplicateMonitor: (id) => set(state => {
    const mon = state.monitorStates[id];
    if (!mon) return {};

    const newId = createId();
    const newMon = { ...mon, id: newId, name: `${mon.name} Copy`, pinned: false };

    return {
      monitorStates: { ...state.monitorStates, [newId]: newMon }
    };
  }),
  
  renameMonitor: (id, newName) => set(state => {
      const mon = state.monitorStates[id];
      if(!mon) return {};
      
      return {
          monitorStates: {
              ...state.monitorStates,
              [id]: { ...mon, name: newName }
          }
      }
  })
});