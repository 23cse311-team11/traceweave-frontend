import { useState } from 'react';
import { Save, Loader2, CookieIcon, Code2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { UrlBar } from '@/components/request/UrlBar';
import { Tabs } from '@/components/ui/Tabs';
import HttpMethodDropdown from './HttpMethodDropdown';
import ProtocolSwitcher from '@/components/request/ProtocolSwitcher';

export default function HttpHeader({ 
  activeId, 
  configTab, 
  setConfigTab, 
  onOpenSaveModal, 
  onOpenCookieModal, 
  onOpenCodeModal 
}) {
  const store = useAppStore();
  const activeReqState = store.requestStates[activeId] || { config: { url: '', method: 'GET' } };

  const [isRenaming, setIsRenaming] = useState(false);
  const [tempName, setTempName] = useState('');

  const isDirty = store.unsavedRequests.has(activeId);
  const activeItemName = activeReqState.name || 'Untitled Request';
  const isNew = !activeReqState.collectionId || activeReqState.isDetached;

  let collectionName = 'Scratchpad';
  if (activeReqState.collectionId) {
    const parentCol = store.collections.find(c => c.id === activeReqState.collectionId);
    if (parentCol) collectionName = parentCol.name;
  }

  const handleRenameStart = () => { setTempName(activeItemName); setIsRenaming(true); };
  const handleRenameSave = () => { store.renameItem(activeId, tempName); setIsRenaming(false); };
  
  const handleSaveClick = () => {
    if (isNew) onOpenSaveModal();
    else store.saveRequest(activeId);
  };

  return (
    <div className="p-4 border-b border-border-subtle shrink-0">
      <div className="flex items-center justify-between mb-3 h-6">
        <div className="flex items-center gap-2 text-xs text-text-secondary select-none w-full">
          <span className={isNew ? 'italic opacity-70' : ''}>{collectionName}</span>
          <span>/</span>

          {isRenaming ? (
            <input
              autoFocus
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={handleRenameSave}
              onKeyDown={(e) => e.key === 'Enter' && handleRenameSave()}
              className="bg-bg-input text-text-primary border border-brand-primary px-1 py-0.5 rounded focus:outline-none"
            />
          ) : (
            <span
              className="text-text-primary font-medium cursor-text hover:border-b hover:border-text-secondary"
              onDoubleClick={handleRenameStart}
            >
              {activeItemName}
            </span>
          )}

          <ProtocolSwitcher
            currentProtocol={activeReqState.protocol || 'http'}
            onChange={(id) => store.updateActiveRequest('protocol', id)}
          />
        </div>

        <div className="flex gap-1.5 shrink-0">
          {/* --- GENERATE CODE BUTTON --- */}
          <button
            onClick={onOpenCodeModal}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-white/[0.08] text-zinc-300 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.14] transition-colors"
            title="Generate Code Snippet"
          >
            <Code2 size={13} /> Code
          </button>

          <button
            onClick={onOpenCookieModal}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-white/[0.08] text-zinc-300 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.14] transition-colors"
            title="View Persistent Cookies (Jar)"
          >
            <CookieIcon size={13} /> Cookies
          </button>

          <button
            onClick={handleSaveClick}
            disabled={!isDirty && !isNew}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
              isDirty || isNew
                ? 'bg-violet-500/15 border-violet-500/40 text-violet-300 hover:bg-violet-500/25 cursor-pointer' 
                : 'bg-transparent border-white/[0.06] text-zinc-500 opacity-60 cursor-not-allowed'
            }`}
            title={isDirty || isNew ? (isNew ? "Save to Collection" : "Save changes") : "All changes saved"}
          >
            <Save size={13} /> {isDirty || isNew ? 'Save*' : 'Saved'}
          </button>
        </div>
      </div>

      <div className="flex h-9.5 mb-3 rounded-lg border border-white/[0.1] bg-[#18181c] focus-within:border-brand-primary/50 transition-colors z-50 relative overflow-hidden">
        <HttpMethodDropdown activeId={activeId} />
        <UrlBar 
          value={activeReqState.config?.url || ''} 
          onChange={(val) => store.updateActiveRequest('url', val)} 
        />
        <button
          onClick={store.executeRequest}
          disabled={store.isLoading}
          className="bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs px-4 flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px] justify-center shrink-0"
        >
          {store.isLoading ? <Loader2 className="animate-spin" size={14} /> : 'Send'}
        </button>
      </div>

      <Tabs
        tabs={['Params', 'Headers', 'Body', 'Cookies', 'Authorization', 'Scripts', 'Notes']}
        activeTab={configTab}
        onTabClick={setConfigTab}
      />
    </div>
  );
}