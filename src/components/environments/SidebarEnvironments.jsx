'use client';

import { useState } from 'react';
import { Layers, Plus, Edit2, Globe, Check, MoreHorizontal, Pin } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import ContextMenu from '../ui/ContextMenu';
import { useModal } from '@/components/providers/ModalProvider';

export default function SidebarEnvironments() {
    const store = useAppStore();
    const envs = store.getWorkspaceEnvironments();
    const [contextMenu, setContextMenu] = useState({ x: null, y: null, targetId: null });
    const [renamingId, setRenamingId] = useState(null);
    const [renameValue, setRenameValue] = useState('');
    const { showConfirm } = useModal();

    const handleContextMenu = (e, envId) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, targetId: envId });
    };

    const startRenaming = (env) => {
        setRenamingId(env.id);
        setRenameValue(env.name);
        setContextMenu({ x: null, y: null, targetId: null });
    };

    const submitRename = () => {
        if (renamingId && renameValue.trim()) {
            store.renameItem(renamingId, renameValue.trim(), false); // false = don't mark as unsaved (auto-save)
        }
        setRenamingId(null);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') submitRename();
        if (e.key === 'Escape') setRenamingId(null);
    };

    const pinnedEnvs = envs.filter(e => e.pinned);
    const unpinnedEnvs = envs.filter(e => !e.pinned);

    const renderEnvItem = (env) => {
        const isRenaming = renamingId === env.id;
        const globalIdx = envs.findIndex(e => e.id === env.id);

        return (
            <div
                key={env.id}
                className={`group flex items-center justify-between px-2.5 py-1.5 rounded-md cursor-pointer border border-transparent transition-colors mb-0.5 ${
                    isRenaming ? 'bg-white/[0.08]' : 'hover:bg-white/[0.05]'
                }`}
                onClick={() => !isRenaming && store.openTab(env.id, true)}
                onDoubleClick={() => !isRenaming && store.openTab(env.id, false)}
                onContextMenu={(e) => !isRenaming && handleContextMenu(e, env.id)}
            >
                <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                    {/* Active Selection Checkbox */}
                    <div
                        onClick={(e) => { e.stopPropagation(); store.setSelectedEnvIndex(globalIdx); }}
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                            globalIdx === store.selectedEnvIndex
                                ? 'bg-violet-600 border-violet-600 text-white'
                                : 'border-white/[0.15] hover:border-violet-400'
                        }`}
                        title={globalIdx === store.selectedEnvIndex ? 'Active Environment' : 'Select Environment'}
                    >
                        {globalIdx === store.selectedEnvIndex && <Check size={9} strokeWidth={3} />}
                    </div>

                    {isRenaming ? (
                        <input
                            autoFocus
                            className="bg-transparent text-xs w-full outline-none text-white border-b border-brand-primary py-0.5"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onBlur={submitRename}
                            onKeyDown={handleKeyDown}
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <div className="flex items-center gap-2 overflow-hidden w-full">
                            <span className="text-xs font-medium truncate text-zinc-300 group-hover:text-white flex-1">{env.name}</span>
                            {env.pinned && <Pin size={10} className="text-brand-primary shrink-0 rotate-45" />}
                        </div>
                    )}
                </div>

                {!isRenaming && (
                    <div
                        className="text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-white rounded hover:bg-white/[0.08]"
                        onClick={(e) => handleContextMenu(e, env.id)}
                    >
                        <MoreHorizontal size={14} />
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            <div className="flex-1 flex flex-col h-full bg-transparent">
                <div className="p-3">
                    <div className="flex justify-between items-center mb-4 px-2">
                        <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Environments</span>
                        <button
                            onClick={() => store.createEnvironment({ isTemp: true })}
                            className="text-text-secondary hover:text-brand-primary hover:bg-bg-input p-1 rounded transition"
                            title="Create Environment"
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    <div className="space-y-1">
                        {/* Globals - Fixed */}
                        <div className="flex items-center gap-3 p-2 rounded text-text-secondary hover:bg-bg-input mb-2 opacity-70">
                            <Globe size={14} />
                            <span className="text-sm">Globals</span>
                        </div>

                        {/* Pinned Environments */}
                        {pinnedEnvs.length > 0 && (
                            <div className="mb-2 pb-2 border-b border-border-subtle/30">
                                <div className="text-[10px] uppercase font-bold text-text-tertiary px-2 mb-1">Pinned</div>
                                {pinnedEnvs.map(env => renderEnvItem(env))}
                            </div>
                        )}

                        {/* Unpinned Environments */}
                        {unpinnedEnvs.map(env => renderEnvItem(env))}

                        {envs.length === 0 && (
                            <div className="text-center py-6 px-4 border border-dashed border-border-subtle/50 rounded-lg mt-2">
                                <p className="text-xs text-text-muted mb-2">No environments yet</p>
                                <button
                                    onClick={() => store.createEnvironment({ isTemp: true })}
                                    className="text-xs text-brand-primary hover:underline font-medium inline-flex items-center gap-1"
                                >
                                    <Plus size={12} />
                                    <span>Create Environment</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {contextMenu.targetId && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu({ x: null, y: null, targetId: null })}
                    isPinned={envs.find(e => e.id === contextMenu.targetId)?.pinned}
                    onPin={() => {
                        store.togglePinItem(contextMenu.targetId);
                        setContextMenu({ x: null, y: null, targetId: null });
                    }}
                    onRename={() => startRenaming(envs.find(e => e.id === contextMenu.targetId))}
                    onDuplicate={() => {
                        store.createEnvironment({ name: `${envs.find(e => e.id === contextMenu.targetId)?.name} Copy`, isTemp: true });
                        setContextMenu({ x: null, y: null, targetId: null });
                    }}
                    onDelete={() => {
                        showConfirm(
                            'Are you sure you want to delete this environment?',
                            () => {
                                store.deleteEnvironment(contextMenu.targetId);
                            },
                            'Delete Environment'
                        );
                        setContextMenu({ x: null, y: null, targetId: null });
                    }}
                />
            )}
        </>
    );
}
