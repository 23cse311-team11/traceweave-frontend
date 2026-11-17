import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Wifi, WifiOff } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Tabs } from '@/components/ui/Tabs';
import ProtocolSwitcher from '@/components/request/ProtocolSwitcher';

export default function WsHeader({ activeId, configTab, setConfigTab, wsState, onOpenSaveModal }) {
  const store = useAppStore();
  const activeReqState = store.requestStates[activeId] || { config: { url: '' } };
  
  const parentCollection = store.collections?.find(c => c.id === activeReqState.collectionId);
  const collectionName = parentCollection ? parentCollection.name : 'Unassigned';
  const activeItemName = activeReqState.name || 'New Request';
  
  const isDirty = store.unsavedRequests?.has(activeId) || false;
  const isNew = !activeReqState.collectionId || activeReqState.isDetached;
  const requiresSave = isNew || isDirty;

  const [isRenaming, setIsRenaming] = useState(false);
  const [tempName, setTempName] = useState('');

  const { isConnected, isConnecting, toggleConnection } = wsState;

  const handleRename = () => {
    setIsRenaming(false);
    if (tempName.trim() && store.updateActiveRequest) {
      store.updateActiveRequest('name', tempName.trim());
    }
  };

  const handleSave = () => {
    if (isNew) onOpenSaveModal();
    else if (store.saveRequest) store.saveRequest(activeId);
  };

  return (
    <div className="px-4 pt-4 pb-0 border-b border-border-subtle shrink-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-xs text-text-secondary min-w-0">
          <span className={`shrink-0 ${isNew ? 'italic opacity-60' : ''}`}>
            {collectionName}
          </span>
          <span className="text-text-muted">/</span>

          {isRenaming ? (
            <input
              autoFocus
              type="text"
              value={tempName}
              onChange={e => setTempName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={e => e.key === 'Enter' && handleRename()}
              className="bg-bg-input text-text-primary border border-brand-primary px-1.5 py-0.5 rounded text-xs focus:outline-none"
            />
          ) : (
            <span
              className="text-text-primary font-medium cursor-text truncate"
              onDoubleClick={() => { setTempName(activeItemName); setIsRenaming(true); }}
              title="Double-click to rename"
            >
              {activeItemName}
            </span>
          )}

          <ProtocolSwitcher
            currentProtocol={activeReqState.protocol || 'ws'}
            onChange={id => store.updateActiveRequest('protocol', id)}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={!requiresSave}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors shrink-0 ${
            requiresSave
              ? 'bg-violet-500/15 border-violet-500/40 text-violet-300 hover:bg-violet-500/25 cursor-pointer'
              : 'bg-transparent border-white/[0.06] text-zinc-500 opacity-60 cursor-not-allowed'
          }`}
          title={requiresSave ? (isNew ? "Save to Collection" : "Save changes") : "All changes saved"}
        >
          <Save size={13} />
          {isNew ? 'Save' : (isDirty ? 'Save*' : 'Saved')}
        </button>
      </div>

      <div className="flex h-9.5 mb-3 rounded-lg border border-white/[0.1] bg-[#18181c] overflow-hidden focus-within:border-brand-primary/50 transition-colors">
        <input
          className="flex-1 bg-transparent px-3 text-xs text-text-primary focus:outline-none placeholder:text-zinc-600 font-mono"
          placeholder="wss://echo.websocket.org"
          value={activeReqState.config?.url || ''}
          onChange={e => store.updateActiveRequest('url', e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !isConnected && !isConnecting && toggleConnection()}
        />
        <button
          onClick={toggleConnection}
          disabled={isConnecting}
          className={`text-white text-xs font-medium px-4 flex items-center gap-1.5 min-w-[100px] justify-center transition-colors ${
            isConnected ? 'bg-red-600 hover:bg-red-500' : 'bg-emerald-600 hover:bg-emerald-500'
          } disabled:opacity-50 shrink-0`}
        >
          <AnimatePresence mode="wait">
            {isConnecting ? (
              <motion.span key="loading" className="flex items-center gap-1.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full block animate-spin" />
                Connecting
              </motion.span>
            ) : isConnected ? (
              <motion.span key="stop" className="flex items-center gap-1.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <WifiOff size={13} /> Disconnect
              </motion.span>
            ) : (
              <motion.span key="connect" className="flex items-center gap-1.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Wifi size={13} /> Connect
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      <Tabs tabs={['Message', 'Params', 'Headers', 'Settings']} activeTab={configTab} onTabClick={setConfigTab} />
    </div>
  );
}
