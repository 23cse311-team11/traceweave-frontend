'use client';
import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { ChevronDown, Check, FileCode, UploadCloud } from 'lucide-react';
import Editor from '@monaco-editor/react';
import KeyValueTable from './KeyValueTable';

const BODY_TYPES = [
    { id: 'none', label: 'none' },
    { id: 'formdata', label: 'form-data' },
    { id: 'urlencoded', label: 'x-www-form-urlencoded' },
    { id: 'raw', label: 'raw' },
    { id: 'binary', label: 'binary' },
];

const RAW_LANGUAGES = [
    { id: 'json', label: 'JSON' },
    { id: 'text', label: 'Text' },
    { id: 'xml', label: 'XML' },
    { id: 'html', label: 'HTML' },
    { id: 'javascript', label: 'JavaScript' },
];

export default function BodyEditor() {
    const store = useAppStore();
    const [isRawDropdownOpen, setIsRawDropdownOpen] = useState(false);
    const rawDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (rawDropdownRef.current && !rawDropdownRef.current.contains(e.target)) {
                setIsRawDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const activeId = store.activeTabId;
    const request = store.requestStates[activeId];
    const bodyState = request?.body || { type: 'none', language: 'json', formdata: [] };

    const updateBody = (field, value) => {
        store.updateActiveRequestDeep(['body', field], value);
    };

    return (
        <div className="flex flex-col h-full bg-bg-base">
            {/* Type Selector (Radio-like) */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border-subtle text-xs bg-bg-base shrink-0">
                <div className="flex items-center gap-4">
                    {BODY_TYPES.map(type => (
                        <label key={type.id} className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio"
                                name="bodyType"
                                checked={bodyState.type === type.id}
                                onChange={() => updateBody('type', type.id)}
                                className="accent-brand-primary cursor-pointer"
                            />
                            <span className={bodyState.type === type.id ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'}>
                                {type.label}
                            </span>
                        </label>
                    ))}
                </div>

                {/* JSON Dropdown for Raw */}
                {bodyState.type === 'raw' && (
                    <div className="relative" ref={rawDropdownRef}>
                        <button
                            type="button"
                            onClick={() => setIsRawDropdownOpen(prev => !prev)}
                            className="flex items-center gap-1.5 px-2 py-1 rounded bg-bg-input/60 hover:bg-bg-input text-brand-primary font-bold text-xs border border-border-subtle/50 transition cursor-pointer select-none"
                        >
                            <span>{RAW_LANGUAGES.find(l => l.id === bodyState.language)?.label || 'JSON'}</span>
                            <ChevronDown size={11} className={`transition-transform duration-200 ${isRawDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isRawDropdownOpen && (
                            <div className="absolute right-0 top-full mt-1.5 w-32 bg-bg-panel border border-border-strong rounded-lg shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                                {RAW_LANGUAGES.map(lang => (
                                    <div
                                        key={lang.id}
                                        onClick={() => {
                                            updateBody('language', lang.id);
                                            setIsRawDropdownOpen(false);
                                        }}
                                        className={`px-3 py-1.5 text-xs flex items-center justify-between hover:bg-brand-primary/10 hover:text-brand-primary cursor-pointer transition ${
                                            bodyState.language === lang.id ? 'text-brand-primary font-bold bg-brand-primary/5' : 'text-text-secondary'
                                        }`}
                                    >
                                        <span>{lang.label}</span>
                                        {bodyState.language === lang.id && <Check size={12} className="text-brand-primary" />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Editor Content */}
            <div className="flex-1 overflow-hidden relative">
                {bodyState.type === 'none' && (
                    <div className="flex items-center justify-center h-full text-text-tertiary text-xs select-none">
                        This request does not have a body
                    </div>
                )}

                {bodyState.type === 'raw' && (
                    <Editor
                        height="100%"
                        defaultLanguage={bodyState.language || 'json'}
                        language={bodyState.language || 'json'}
                        value={bodyState.raw || ''}
                        theme="vs-dark"
                        onChange={(val) => updateBody('raw', val)}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 12,
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            fontFamily: 'monospace',
                            padding: { top: 10 }
                        }}
                    />
                )}

                {(bodyState.type === 'formdata' || bodyState.type === 'urlencoded') && (
                    <div className="p-4 h-full overflow-y-auto custom-scrollbar">
                        <KeyValueTable listKey="body.formdata" data={bodyState.formdata || []} />
                    </div>
                )}

                {bodyState.type === 'binary' && (
                    <div className="flex flex-col items-center justify-center h-full text-text-secondary">
                        <div className="border border-dashed border-border-strong rounded-lg p-8 flex flex-col items-center gap-4 bg-bg-input/20">
                            <UploadCloud size={32} className="text-brand-primary" />
                            <span className="text-xs">Select a file to upload</span>
                            <input
                                type="file"
                                className="text-xs text-text-primary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-primary file:text-white hover:file:bg-brand-glow"
                                onChange={(e) => updateBody('binaryPath', e.target.value)} // Mock path
                            />
                            {bodyState.binaryPath && <span className="text-[10px] font-mono text-text-muted">{bodyState.binaryPath}</span>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
