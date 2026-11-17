import { environmentApi } from '@/api/environment.api';

export const createEnvironmentSlice = (set, get) => ({
  // --- State ---
  selectedEnvIndex: 0,
  setSelectedEnvIndex: (idx) => set({ selectedEnvIndex: idx }),
  workspaceEnvironments: {}, // { workspaceId: [envs] }
  globalEnvironments: [],
  isGlobalEnvironmentsLoading: false,

  // --- Getters ---
  getWorkspaceEnvironments: () => {
    const { activeWorkspaceId, workspaceEnvironments } = get();
    return workspaceEnvironments[activeWorkspaceId] || [];
  },

  getEnvironmentById: (id) => {
    const { activeWorkspaceId, workspaceEnvironments } = get();
    const envs = workspaceEnvironments[activeWorkspaceId] || [];
    return envs.find(e => e.id === id);
  },

  getEnvVariable: (key) => {
    const { activeWorkspaceId, selectedEnvIndex, workspaceEnvironments } = get();
    const envs = workspaceEnvironments[activeWorkspaceId] || [];
    const activeEnv = (envs && selectedEnvIndex >= 0 && selectedEnvIndex < envs.length)
      ? envs[selectedEnvIndex]
      : null;
    if (!activeEnv || !activeEnv.variables) return null;
    const found = activeEnv.variables.find(v => v.key === key && v.enabled !== false);
    return found ? found.value : null;
  },

  // --- Actions ---
  fetchEnvironments: async (workspaceId) => {
    try {
      const data = await environmentApi.getEnvironments(workspaceId);
      const envs = (data || []).map(env => ({
          ...env,
          variables: (env.variables || []).map(v => ({
            ...v,
            enabled: v.enabled ?? true
          }))
      }));
      
      set(state => {
        let newIdx = state.selectedEnvIndex;
        if (envs.length === 0) {
          newIdx = -1;
        } else if (newIdx === -1 || newIdx >= envs.length) {
          newIdx = 0;
        }

        return {
          workspaceEnvironments: {
            ...state.workspaceEnvironments,
            [workspaceId]: envs
          },
          selectedEnvIndex: newIdx
        };
      });
    } catch (error) {
      console.warn("Failed to fetch environments", error);
    }
  },

  fetchGlobalEnvironments: async () => {
        set({ isGlobalEnvironmentsLoading: true });
        try {
            const response = await environmentApi.getGlobalEnvironments();
            set({ 
                globalEnvironments: response.data || [], 
                isGlobalEnvironmentsLoading: false 
            });
        } catch (error) {
            console.error("Failed to fetch global environments:", error);
            set({ isGlobalEnvironmentsLoading: false });
        }
    },

  createEnvironment: async ({ name, variables, isTemp = false, openTab = true, selectImmediately = true } = {}) => {
    const { activeWorkspaceId } = get();
    if (!activeWorkspaceId) return null;

    try {
      const data = await environmentApi.createEnvironment(activeWorkspaceId, {
        name: name || 'Untitled Environment',
        variables: (variables || []).map(v => ({
          key: v.key,
          value: v.value,
          enabled: v.enabled ?? true
        }))
      });
      const newEnv = {
        ...data,
        variables: (data.variables || variables || []).map(v => ({
          ...v,
          enabled: v.enabled ?? true
        }))
      };

      set(state => {
        const currentEnvs = state.workspaceEnvironments[activeWorkspaceId] || [];
        const newEnvs = [...currentEnvs, newEnv];
        const newIndex = newEnvs.length - 1;

        const currentTabs = [...state.openTabs];
        if (openTab && !currentTabs.includes(newEnv.id)) currentTabs.push(newEnv.id);

        return {
          workspaceEnvironments: { ...state.workspaceEnvironments, [activeWorkspaceId]: newEnvs },
          ...(openTab ? { activeTabId: newEnv.id, openTabs: currentTabs, activeView: 'environment' } : {}),
          ...(selectImmediately || state.selectedEnvIndex === -1 || currentEnvs.length === 0 ? { selectedEnvIndex: newIndex } : {})
        };
      });

      return newEnv;
    } catch (err) {
      console.warn("Failed to create environment", err);
      return null;
    }
  },

  deleteEnvironment: async (envId) => {
    const { activeWorkspaceId } = get();
    try {
      await environmentApi.deleteEnvironment(envId);

      set(state => {
        const currentEnvs = state.workspaceEnvironments[activeWorkspaceId] || [];
        const newEnvs = currentEnvs.filter(e => e.id !== envId);

        const newTabs = state.openTabs.filter(t => t !== envId);
        const newActive = state.activeTabId === envId ? (newTabs[newTabs.length - 1] || null) : state.activeTabId;

        const nextEnvIdx = newEnvs.length === 0 ? -1 : Math.min(Math.max(0, state.selectedEnvIndex), newEnvs.length - 1);

        return {
          workspaceEnvironments: { ...state.workspaceEnvironments, [activeWorkspaceId]: newEnvs },
          openTabs: newTabs,
          activeTabId: newActive,
          selectedEnvIndex: nextEnvIdx
        };
      });
    } catch (err) {
      console.warn("Failed to delete environment", err);
    }
  },

  updateEnvironment: async (envId, updates) => {
    const { activeWorkspaceId } = get();
    
    // Optimistic update
    set(state => {
      const currentEnvs = state.workspaceEnvironments[activeWorkspaceId] || [];
      const idx = currentEnvs.findIndex(e => e.id === envId);
      if (idx === -1) return {};

      const newEnvs = [...currentEnvs];
      newEnvs[idx] = { ...newEnvs[idx], ...updates };
      return { workspaceEnvironments: { ...state.workspaceEnvironments, [activeWorkspaceId]: newEnvs } };
    });

    // API call
    try {
        await environmentApi.updateEnvironment(envId, updates);
    } catch (e) { console.warn(e); }
  },
  
  renameEnvironment: async (id, newName) => {
      const { activeWorkspaceId } = get();
      
      // Optimistic
      set(state => {
          const envs = state.workspaceEnvironments[activeWorkspaceId] || [];
          const idx = envs.findIndex(e => e.id === id);
          if (idx === -1) return {};
          
          const newEnvs = [...envs];
          newEnvs[idx] = { ...newEnvs[idx], name: newName };
          return { workspaceEnvironments: { ...state.workspaceEnvironments, [activeWorkspaceId]: newEnvs }};
      });

      try {
          await environmentApi.updateEnvironment(id, { name: newName });
      } catch (e) { console.warn(e); }
  },

  // --- Variable Management ---

  addEnvironmentVariable: async (envId, { key, value, enabled }) => {
    const { activeWorkspaceId } = get();
    const tempId = 'temp_' + Date.now();
    const newVar = { id: tempId, key, value, enabled: enabled ?? true };

    // Optimistic Update
    set(state => {
      const currentEnvs = state.workspaceEnvironments[activeWorkspaceId] || [];
      const idx = currentEnvs.findIndex(e => e.id === envId);
      if (idx === -1) return {};

      const env = currentEnvs[idx];
      const newVars = [...(env.variables || []), newVar];
      const newEnvs = [...currentEnvs];
      newEnvs[idx] = { ...env, variables: newVars };

      return { workspaceEnvironments: { ...state.workspaceEnvironments, [activeWorkspaceId]: newEnvs } };
    });

    try {
      const data = await environmentApi.createVariable(envId, { key, value, enabled: enabled ?? true });
      if (data && data.id) {
        set(state => {
          const currentEnvs = state.workspaceEnvironments[activeWorkspaceId] || [];
          const idx = currentEnvs.findIndex(e => e.id === envId);
          if (idx === -1) return {};

          const env = currentEnvs[idx];
          const newVars = (env.variables || []).map(v => v.id === tempId ? { ...data, enabled: data.enabled ?? true } : v);
          const newEnvs = [...currentEnvs];
          newEnvs[idx] = { ...env, variables: newVars };

          return { workspaceEnvironments: { ...state.workspaceEnvironments, [activeWorkspaceId]: newEnvs } };
        });
      }
      return data;
    } catch (err) {
      console.warn("Failed to add environment variable", err);
      // Rollback
      set(state => {
        const currentEnvs = state.workspaceEnvironments[activeWorkspaceId] || [];
        const idx = currentEnvs.findIndex(e => e.id === envId);
        if (idx === -1) return {};

        const env = currentEnvs[idx];
        const newVars = (env.variables || []).filter(v => v.id !== tempId);
        const newEnvs = [...currentEnvs];
        newEnvs[idx] = { ...env, variables: newVars };

        return { workspaceEnvironments: { ...state.workspaceEnvironments, [activeWorkspaceId]: newEnvs } };
      });
      return null;
    }
  },

  updateEnvironmentVariable: async (envId, varIndex, field, value) => {
    const { activeWorkspaceId, workspaceEnvironments } = get();
    const envs = workspaceEnvironments[activeWorkspaceId] || [];
    const env = envs.find(e => e.id === envId);
    if (!env || !env.variables[varIndex]) return;

    const variable = env.variables[varIndex];
    const updates = { [field]: value };

    // Optimistic Update
    set(state => {
      const currentEnvs = state.workspaceEnvironments[activeWorkspaceId] || [];
      const idx = currentEnvs.findIndex(e => e.id === envId);
      if (idx === -1) return {};

      const newEnvs = [...currentEnvs];
      const newVars = [...newEnvs[idx].variables];
      newVars[varIndex] = { ...newVars[varIndex], ...updates };
      newEnvs[idx] = { ...newEnvs[idx], variables: newVars };

      return { workspaceEnvironments: { ...state.workspaceEnvironments, [activeWorkspaceId]: newEnvs } };
    });

    // API Call
    try {
      if (field === 'key') {
        await environmentApi.renameVariable(envId, variable.id, value);
      } else {
        await environmentApi.updateVariable(envId, variable.id, updates);
      }
    } catch (err) { console.warn(err); }
  },

  removeEnvironmentVariable: async (envId, varIndex) => {
    const { activeWorkspaceId, workspaceEnvironments } = get();
    const envs = workspaceEnvironments[activeWorkspaceId] || [];
    const env = envs.find(e => e.id === envId);
    if (!env || !env.variables[varIndex]) return;

    const variable = env.variables[varIndex];

    // Optimistic Update
    set(state => {
      const currentEnvs = state.workspaceEnvironments[activeWorkspaceId] || [];
      const idx = currentEnvs.findIndex(e => e.id === envId);
      if (idx === -1) return {};

      const newEnvs = [...currentEnvs];
      const newVars = newEnvs[idx].variables.filter((_, i) => i !== varIndex);
      newEnvs[idx] = { ...newEnvs[idx], variables: newVars };

      return { workspaceEnvironments: { ...state.workspaceEnvironments, [activeWorkspaceId]: newEnvs } };
    });

    try {
      await environmentApi.deleteVariable(envId, variable.id);
    } catch (err) { console.warn(err); }
  },

  openEnvironmentTab: (envId) => {
    set((state) => {
      // 1. Add to openTabs if not present
      const currentTabs = state.openTabs || [];
      const newTabs = currentTabs.includes(envId) ? currentTabs : [...currentTabs, envId];

      return {
        openTabs: newTabs,
        activeTabId: envId,
        activeView: 'environment',
      };
    });
  },
});