'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Edit2, Check, X, AlertCircle, Plus, Layers, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';

const FloatingTooltip = ({ data, onSave, onManage, onCreateEnv, onSelectEnv, onMouseEnter, onMouseLeave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(data?.resolvedValue || '');
    const [newVarValue, setNewVarValue] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setIsEditing(false);
        setEditValue(data?.resolvedValue || '');
        setNewVarValue('');
    }, [data?.varName]);

    useEffect(() => {
        if (!isEditing) {
            setEditValue(data?.resolvedValue || '');
        }
    }, [data?.resolvedValue, isEditing]);

    if (!data) return null;

    const {
        rect,
        name,
        varName,
        resolvedValue,
        selectedEnvName,
        selectedEnv,
        isSystemNoEnv,
        hasEnvironments,
        envs
    } = data;

    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const tooltipWidth = 320;
    const leftPos = Math.max(12, Math.min(rect.left, screenWidth - tooltipWidth - 20));

    const style = {
        top: `${rect.bottom + 6}px`,
        left: `${leftPos}px`,
    };

    const handleSaveClick = async () => {
        setIsSubmitting(true);
        try {
            await onSave(varName, editValue);
            setIsEditing(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleQuickCreate = async () => {
        setIsSubmitting(true);
        try {
            await onCreateEnv(varName, newVarValue);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateEmpty = async () => {
        setIsSubmitting(true);
        try {
            await onCreateEnv(null, null);
        } finally {
            setIsSubmitting(false);
        }
    };

    return createPortal(
        <div
            className="fixed z-[9998] w-80 bg-bg-panel border border-border-strong rounded-lg shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-200"
            style={style}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {/* CASE 1: No Environment Created in Workspace */}
            {!hasEnvironments ? (
                <>
                    <div className="text-[10px] uppercase font-bold mb-2 tracking-wider border-b border-border-subtle pb-1 flex justify-between items-center">
                        <span className="text-amber-400 flex items-center gap-1.5 font-semibold">
                            <AlertCircle size={12} /> No Environment Found
                        </span>
                        <span className="text-[10px] text-text-muted">Unresolved</span>
                    </div>

                    <div className="text-xs text-text-secondary mb-2.5">
                        Variables require an environment to store their values.
                    </div>

                    <div className="bg-bg-input p-2.5 rounded border border-border-subtle mb-3 space-y-2">
                        <div className="text-[11px] text-text-secondary font-medium">
                            Set initial value for <span className="font-mono text-brand-primary">{name}</span>:
                        </div>
                        <div className="flex items-center gap-1.5">
                            <input
                                type="text"
                                placeholder="e.g. https://api.example.com"
                                value={newVarValue}
                                onChange={(e) => setNewVarValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleQuickCreate();
                                }}
                                disabled={isSubmitting}
                                autoFocus
                                className="flex-1 bg-bg-base border border-border-subtle rounded px-2 py-1 text-xs text-text-primary focus:outline-none focus:border-brand-primary font-mono placeholder:text-text-muted/50"
                            />
                            <button
                                onClick={handleQuickCreate}
                                disabled={isSubmitting}
                                className="px-2.5 py-1 bg-brand-primary text-black text-xs font-semibold rounded hover:bg-brand-primary/90 transition flex items-center gap-1 disabled:opacity-50"
                                title="Create environment and save this variable"
                            >
                                {isSubmitting ? (
                                    <Loader2 size={12} className="animate-spin" />
                                ) : (
                                    <Check size={12} strokeWidth={2.5} />
                                )}
                                <span>Save</span>
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleCreateEmpty}
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-bg-base hover:bg-bg-input border border-border-subtle rounded text-xs text-text-secondary hover:text-text-primary transition mb-3"
                    >
                        <Plus size={12} />
                        <span>Create "Development" Environment</span>
                    </button>
                </>
            ) : isSystemNoEnv ? (
                /* CASE 2: Environments exist, but "No Environment" is currently selected */
                <>
                    <div className="text-[10px] uppercase font-bold mb-2 tracking-wider border-b border-border-subtle pb-1 flex justify-between items-center">
                        <span className="text-amber-400 flex items-center gap-1.5 font-semibold">
                            <AlertCircle size={12} /> No Environment Selected
                        </span>
                        <span className="text-[10px] text-text-muted">Unresolved</span>
                    </div>

                    <div className="text-xs text-text-secondary mb-2">
                        Select an environment to resolve and update <span className="font-mono text-brand-primary">{name}</span>:
                    </div>

                    <div className="mb-3">
                        <select
                            className="w-full bg-bg-input border border-border-subtle rounded px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-brand-primary cursor-pointer font-medium"
                            onChange={(e) => {
                                const idx = parseInt(e.target.value, 10);
                                if (!isNaN(idx)) onSelectEnv(idx);
                            }}
                            defaultValue=""
                        >
                            <option value="" disabled>Choose an active environment...</option>
                            {envs.map((env, idx) => (
                                <option key={env.id} value={idx}>{env.name}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleCreateEmpty}
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-1.5 py-1 px-2 bg-bg-base hover:bg-bg-input border border-border-subtle rounded text-[11px] text-text-secondary hover:text-text-primary transition mb-3"
                    >
                        <Plus size={11} />
                        <span>Create New Environment</span>
                    </button>
                </>
            ) : (
                /* CASE 3: Active environment selected */
                <>
                    <div className="text-[10px] uppercase font-bold mb-2 tracking-wider border-b border-border-subtle pb-1 flex justify-between items-center">
                        <span>Resolved in: <span className="text-brand-primary font-semibold">{selectedEnvName}</span></span>
                    </div>

                    <div className="text-xs mb-1 text-text-secondary">Current Value:</div>

                    {isEditing ? (
                        <div className="flex items-center gap-1 mb-3">
                            <input
                                className="flex-1 bg-bg-input border border-brand-primary/50 rounded px-2 py-1 text-sm text-text-primary focus:outline-none font-mono"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveClick();
                                    if (e.key === 'Escape') setIsEditing(false);
                                }}
                                autoFocus
                            />
                            <button
                                onClick={handleSaveClick}
                                disabled={isSubmitting}
                                className="p-1 bg-brand-primary text-black rounded hover:bg-brand-primary/90 transition flex items-center justify-center"
                                title="Save value"
                            >
                                {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} strokeWidth={2.5} />}
                            </button>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="p-1 bg-bg-base text-text-secondary rounded hover:text-text-primary transition"
                                title="Cancel"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ) : (
                        <div className="text-sm text-text-primary font-mono bg-bg-input p-2 rounded break-all border border-border-subtle mb-3 flex justify-between items-start group/val">
                            <span>{resolvedValue !== null && resolvedValue !== undefined ? resolvedValue : <span className="text-red-500 italic">Unresolved</span>}</span>
                            <button
                                onClick={() => { setIsEditing(true); setEditValue(resolvedValue || ''); }}
                                className="opacity-0 group-hover/val:opacity-100 p-1 hover:bg-bg-base rounded text-text-secondary hover:text-text-primary transition"
                                title="Edit variable"
                            >
                                <Edit2 size={11} />
                            </button>
                        </div>
                    )}
                </>
            )}

            <div className="text-[10px] text-text-muted flex justify-between items-center border-t border-border-subtle/50 pt-2">
                <span>Scope: Environment</span>
                <span
                    onClick={onManage}
                    className="text-brand-blue cursor-pointer hover:underline"
                >
                    {hasEnvironments && !isSystemNoEnv ? 'Manage Variables →' : 'Manage Environments →'}
                </span>
            </div>
        </div>,
        document.body
    );
};

export const UrlBar = ({ value, onChange }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [tooltipData, setTooltipData] = useState(null);

    // Refs for scrolling synchronization
    const inputRef = useRef(null);
    const overlayRef = useRef(null);
    const hoverTimeoutRef = useRef(null);

    const store = useAppStore();
    const getEnvVariable = store.getEnvVariable;
    const selectedEnvIndex = store.selectedEnvIndex;
    const envs = store.getWorkspaceEnvironments();
    const hasEnvironments = Array.isArray(envs) && envs.length > 0;
    const selectedEnv = (hasEnvironments && selectedEnvIndex >= 0 && selectedEnvIndex < envs.length)
        ? envs[selectedEnvIndex]
        : null;

    const isSystemNoEnv = !selectedEnv;
    const selectedEnvName = selectedEnv?.name || 'No Environment';

    // SCROLL SYNC: When input scrolls, scroll overlay matching it
    const handleScroll = () => {
        if (inputRef.current && overlayRef.current) {
            overlayRef.current.scrollLeft = inputRef.current.scrollLeft;
        }
    };

    const handleVarMouseEnter = (e, varNameRaw) => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

        const rect = e.target.getBoundingClientRect();
        const varName = varNameRaw.slice(2, -2).trim();
        const resolvedValue = getEnvVariable(varName);

        setTooltipData({
            rect,
            name: varNameRaw,
            varName,
            resolvedValue,
            selectedEnv,
            selectedEnvIndex,
            selectedEnvName,
            isSystemNoEnv,
            hasEnvironments,
            envs: envs || []
        });
    };

    const handleVarMouseLeave = () => {
        hoverTimeoutRef.current = setTimeout(() => {
            setTooltipData(null);
        }, 300);
    };

    const handleUpdateVar = async (key, newValue) => {
        if (!selectedEnv) return;
        const vars = selectedEnv.variables || [];
        const idx = vars.findIndex(v => v.key === key);
        if (idx !== -1) {
            await store.updateEnvironmentVariable(selectedEnv.id, idx, 'value', newValue);
        } else {
            await store.addEnvironmentVariable(selectedEnv.id, { key, value: newValue, enabled: true });
        }
        setTooltipData(prev => prev ? ({ ...prev, resolvedValue: newValue }) : null);
    };

    const handleCreateEnv = async (initialVarName, initialVarValue) => {
        const initialVars = initialVarName 
            ? [{ key: initialVarName, value: initialVarValue || '', enabled: true }] 
            : [];
        const newEnv = await store.createEnvironment({
            name: 'Development',
            variables: initialVars,
            openTab: false,
            selectImmediately: true
        });
        if (newEnv) {
            const updatedEnvs = store.getWorkspaceEnvironments();
            const targetIdx = updatedEnvs.findIndex(e => e.id === newEnv.id);
            const resolvedIdx = targetIdx !== -1 ? targetIdx : (updatedEnvs.length - 1);
            store.setSelectedEnvIndex(resolvedIdx);

            setTooltipData(prev => prev ? ({
                ...prev,
                selectedEnv: newEnv,
                selectedEnvIndex: resolvedIdx,
                selectedEnvName: newEnv.name,
                isSystemNoEnv: false,
                hasEnvironments: true,
                envs: updatedEnvs,
                resolvedValue: initialVarValue !== null && initialVarValue !== undefined ? initialVarValue : null
            }) : null);
        }
    };

    const handleSelectEnv = (envIndex) => {
        store.setSelectedEnvIndex(envIndex);
        const targetEnv = envs[envIndex];
        if (targetEnv) {
            const found = (targetEnv.variables || []).find(v => v.key === tooltipData?.varName && v.enabled !== false);
            const resolved = found ? found.value : null;
            setTooltipData(prev => prev ? ({
                ...prev,
                selectedEnv: targetEnv,
                selectedEnvIndex: envIndex,
                selectedEnvName: targetEnv.name,
                isSystemNoEnv: false,
                resolvedValue: resolved
            }) : null);
        }
    };

    const handleVarClick = () => {
        inputRef.current?.focus();
    };

    const handleManageClick = () => {
        if (selectedEnv) {
            store.openEnvironmentTab(selectedEnv.id);
        } else {
            store.setActiveSidebarItem('Environments');
        }
        setTooltipData(null);
    };

    const renderRichText = (text) => {
        if (!text) return null;
        const parts = text.split(/(\{\{.*?\}\})/g);
        return parts.map((part, i) => {
            if (part.startsWith('{{') && part.endsWith('}}')) {
                const varName = part.slice(2, -2).trim();
                const isResolved = getEnvVariable(varName) !== null;

                const statusClasses = isResolved
                    ? 'text-emerald-500 border-emerald-500/30'
                    : 'text-red-500 border-red-500/30';

                return (
                    <span
                        key={i}
                        onMouseEnter={(e) => handleVarMouseEnter(e, part)}
                        onMouseLeave={handleVarMouseLeave}
                        onClick={handleVarClick}
                        className={`inline-block cursor-help border-b border-dotted mx-0.5 pointer-events-auto ${statusClasses}`}
                    >
                        {part}
                    </span>
                );
            }
            // Standard text must match input color (white/primary)
            return <span key={i} className="text-text-primary">{part}</span>;
        });
    };

    return (
        <>
            <div className="relative flex-1 h-full font-mono text-sm bg-bg-input">
                {/* OVERLAY (The Colors) 
                    - Always visible (no !isFocused check)
                    - Pointer events none (so clicks go to input)
                    - Hidden overflow (scrolled via JS)
                */}
                <div
                    ref={overlayRef}
                    className="absolute inset-0 flex items-center px-3 whitespace-pre overflow-hidden z-20 pointer-events-none"
                >
                    <div className="min-w-full">
                        {renderRichText(value)}
                    </div>
                </div>

                {/* INPUT (The Typing)
                    - text-transparent (hides raw text)
                    - caret-text-primary (keeps cursor visible)
                    - z-10 (sits on top)
                    - onScroll (syncs background)
                */}
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onScroll={handleScroll}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`
                        relative z-10 w-full h-full bg-transparent px-3 
                        focus:outline-none focus:border-border-strong border border-transparent transition-colors
                        text-transparent caret-text-primary 
                        selection:bg-brand-blue/30 selection:text-transparent
                    `}
                    spellCheck="false"
                    placeholder={!value ? "Enter URL or paste request" : ""}
                />
            </div>

            {tooltipData && (
                <FloatingTooltip
                    data={tooltipData}
                    onSave={handleUpdateVar}
                    onManage={handleManageClick}
                    onCreateEnv={handleCreateEnv}
                    onSelectEnv={handleSelectEnv}
                    onMouseEnter={() => {
                        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                    }}
                    onMouseLeave={handleVarMouseLeave}
                />
            )}
        </>
    );
};
