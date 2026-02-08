'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Edit2, Check, X } from 'lucide-react';
import { createPortal } from 'react-dom';

// 1. Separate Tooltip Component for cleanliness
// We use 'position: fixed' to ensure it floats above all other UI elements/overflows
const FloatingTooltip = ({ data, onSave, onClose, onMouseEnter, onMouseLeave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(data?.resolvedValue || '');

    if (!data) return null;

    const { rect, name, resolvedValue, selectedEnvName } = data;

    // Calculate position: Just below the hovered element
    const style = {
        top: `${rect.bottom + 5}px`,
        left: `${rect.left}px`,
    };

    const handleSaveClick = () => {
        onSave(data.varName, editValue);
        setIsEditing(false);
    };

    return createPortal(
        <div
            className="fixed z-[9999] min-w-[280px] bg-bg-panel border border-border-strong rounded-lg shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-200"
            style={style}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className="text-[10px] text-text-secondary uppercase font-bold mb-2 tracking-wider border-b border-border-subtle pb-1 flex justify-between">
                <span>Resolved in: <span className="text-brand-orange">{selectedEnvName}</span></span>
            </div>

            <div className="text-xs mb-1 text-text-secondary">Current Value:</div>

            {isEditing ? (
                <div className="flex items-center gap-1 mb-2">
                    <input
                        className="flex-1 bg-bg-input border border-brand-orange/50 rounded px-2 py-1 text-sm text-text-primary focus:outline-none"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        autoFocus
                    />
                    <button onClick={handleSaveClick} className="p-1 bg-brand-orange text-white rounded hover:bg-orange-600"><Check size={12} /></button>
                    <button onClick={() => setIsEditing(false)} className="p-1 bg-bg-base text-text-secondary rounded hover:text-text-primary"><X size={12} /></button>
                </div>
            ) : (
                <div className="text-sm text-text-primary font-mono bg-bg-input p-2 rounded break-all border border-border-subtle mb-3 flex justify-between items-start group/val">
                    <span>{resolvedValue !== null ? resolvedValue : <span className="text-red-500 italic">Unresolved</span>}</span>
                    <button
                        onClick={(e) => { setIsEditing(true); setEditValue(resolvedValue || ''); }}
                        className="opacity-0 group-hover/val:opacity-100 p-1 hover:bg-bg-base rounded text-text-secondary"
                    >
                        <Edit2 size={10} />
                    </button>
                </div>
            )}

            <div className="text-[10px] text-text-muted flex justify-between items-center">
                <span>Scope: Environment</span>
                <span className="text-brand-blue cursor-pointer hover:underline">Manage Variables →</span>
            </div>
        </div>,
        document.body // Portal renders this directly into the body tag, escaping all overflows
    );
};

export const UrlBar = ({ value, onChange }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [tooltipData, setTooltipData] = useState(null);
    const hoverTimeoutRef = useRef(null);

    const store = useAppStore();
    const getEnvVariable = store.getEnvVariable;
    const selectedEnvIndex = store.selectedEnvIndex;
    const envs = store.getWorkspaceEnvironments();
    const selectedEnv = envs[selectedEnvIndex];
    const selectedEnvName = selectedEnv?.name || 'No Environment';

    // --- Hover Logic ---
    const handleVarMouseEnter = (e, varNameRaw) => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

        const rect = e.target.getBoundingClientRect();
        const varName = varNameRaw.slice(2, -2);
        const resolvedValue = getEnvVariable(varName);

        setTooltipData({
            rect,
            name: varNameRaw,
            varName,
            resolvedValue,
            selectedEnvName
        });
    };

    const handleVarMouseLeave = () => {
        // Small delay to allow mouse to move from text to tooltip
        hoverTimeoutRef.current = setTimeout(() => {
            setTooltipData(null);
        }, 300); // 300ms grace period
    };

    const handleUpdateVar = (key, newValue) => {
        if (!selectedEnv) return;
        const idx = selectedEnv.variables.findIndex(v => v.key === key);
        if (idx !== -1) {
            store.updateEnvironmentVariable(selectedEnv.id, idx, 'value', newValue);
        } else {
            store.addEnvironmentVariable(selectedEnv.id, { key, value: newValue, enabled: true });
        }
        // Refresh tooltip data instantly
        setTooltipData(prev => ({ ...prev, resolvedValue: newValue }));
    };

    // --- Rendering ---

    const renderRichText = (text) => {
        if (!text) return null;
        const parts = text.split(/(\{\{.*?\}\})/g);
        return parts.map((part, i) => {
            if (part.startsWith('{{') && part.endsWith('}}')) {
                return (
                    <span
                        key={i}
                        onMouseEnter={(e) => handleVarMouseEnter(e, part)}
                        onMouseLeave={handleVarMouseLeave}
                        className="inline-block text-brand-orange cursor-help border-b border-brand-orange/30 border-dotted mx-0.5 pointer-events-auto"
                    >
                        {part}
                    </span>
                );
            }
            return <span key={i}>{part}</span>;
        });
    };

    return (
        <>
            <div className="relative flex-1 h-full font-mono text-sm bg-bg-input">
                {/* Overlay for syntax highlighting */}
                {!isFocused && (
                    <div className="absolute inset-0 flex items-center px-3 whitespace-pre overflow-hidden text-text-primary z-10 pointer-events-none">
                        <div className="truncate w-full">
                            {renderRichText(value)}
                        </div>
                    </div>
                )}

                {/* Actual Input */}
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`
                    w-full h-full bg-transparent px-3 focus:outline-none focus:border-border-strong border border-transparent transition-colors
                    ${!isFocused ? 'text-transparent selection:bg-transparent' : 'text-text-primary'}
                `}
                    spellCheck="false"
                    placeholder={!isFocused && !value ? "Enter URL or paste request" : ""}
                />
            </div>

            {/* Floating Tooltip (Rendered via Portal) */}
            {tooltipData && (
                <FloatingTooltip
                    data={tooltipData}
                    onSave={handleUpdateVar}
                    onMouseEnter={() => {
                        // If user enters the tooltip, cancel the close timer
                        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                    }}
                    onMouseLeave={handleVarMouseLeave}
                />
            )}
        </>
    );
};