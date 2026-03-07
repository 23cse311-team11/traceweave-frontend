export const createUISlice = (set, get) => ({
  sidebarWidth: 260,
  setSidebarWidth: (width) => set({ sidebarWidth: width }),
  activeSidebarItem: 'Collections',
  setActiveSidebarItem: (item) => set({ activeSidebarItem: item }),
  activeView: 'runner', // 'runner' | 'environment' | 'monitor' | 'dashboard'
  setActiveView: (view) => set({ activeView: view }),
  responsePaneHeight: 350,
  setResponsePaneHeight: (height) => set({ responsePaneHeight: height }),
});