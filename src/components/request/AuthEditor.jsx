'use client';
import { useAppStore } from '@/store/useAppStore';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

const AUTH_TYPES = [
    { id: 'noauth', label: 'No Auth' },
    { id: 'apikey', label: 'API Key' },
    { id: 'bearer', label: 'Bearer Token' },
    { id: 'basic', label: 'Basic Auth' },
];

export default function AuthEditor() {
    const store = useAppStore();
    const activeId = store.activeTabId;
    const authState = store.requestStates[activeId]?.auth || { type: 'noauth' };

    const updateAuth = (path, value) => {
        store.updateActiveRequestDeep(['auth', ...path], value);
    };

    return (
        <div className="flex h-full bg-bg-base">
            {/* Type Selector Sidebar */}
            <div className="w-48 border-r border-border-subtle p-2">
                <h3 className="text-xs font-bold text-text-secondary mb-2 px-2 uppercase tracking-wide">Type</h3>
                <div className="flex flex-col gap-1">
                    {AUTH_TYPES.map(type => (
                        <button
                            key={type.id}
                            onClick={() => updateAuth(['type'], type.id)}
                            className={`text-left px-3 py-2 text-xs rounded transition-colors ${authState.type === type.id
                                ? 'bg-bg-input text-text-primary font-medium border-l-2 border-brand-orange'
                                : 'text-text-secondary hover:bg-bg-input/50'
                                }`}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Configuration Panel */}
            <div className="flex-1 p-6 overflow-y-auto">
                {authState.type === 'noauth' && (
                    <div className="flex flex-col items-center justify-center h-full text-text-tertiary opacity-60">
                        <span className="text-sm">This request does not use any authorization.</span>
                    </div>
                )}

                {authState.type === 'bearer' && (
                    <div className="max-w-xl">
                        <h3 className="text-sm font-semibold text-text-primary mb-4">Bearer Token</h3>
                        <div className="flex gap-4 items-start">
                            <div className="w-32 text-xs text-text-secondary pt-2 text-right">Token</div>
                            <div className="flex-1">
                                <textarea
                                    value={authState.bearer?.token || ''}
                                    onChange={(e) => updateAuth(['bearer', 'token'], e.target.value)}
                                    className="w-full bg-bg-input border border-border-subtle rounded p-2 text-sm text-text-primary focus:border-brand-orange outline-none min-h-[100px] font-mono"
                                    placeholder="Paste token here"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {authState.type === 'basic' && (
                    <div className="max-w-xl space-y-4">
                        <h3 className="text-sm font-semibold text-text-primary mb-4">Basic Auth</h3>
                        <div className="flex gap-4 items-center">
                            <div className="w-32 text-xs text-text-secondary text-right">Username</div>
                            <input
                                type="text"
                                value={authState.basic?.username || ''}
                                onChange={(e) => updateAuth(['basic', 'username'], e.target.value)}
                                className="flex-1 bg-bg-input border border-border-subtle rounded p-2 text-sm text-text-primary focus:border-brand-orange outline-none"
                            />
                        </div>
                        <div className="flex gap-4 items-center">
                            <div className="w-32 text-xs text-text-secondary text-right">Password</div>
                            <input
                                type="password"
                                value={authState.basic?.password || ''}
                                onChange={(e) => updateAuth(['basic', 'password'], e.target.value)}
                                className="flex-1 bg-bg-input border border-border-subtle rounded p-2 text-sm text-text-primary focus:border-brand-orange outline-none"
                            />
                        </div>
                    </div>
                )}

                {authState.type === 'apikey' && (
                    <div className="max-w-xl space-y-4">
                        <h3 className="text-sm font-semibold text-text-primary mb-4">API Key</h3>
                        <div className="flex gap-4 items-center">
                            <div className="w-32 text-xs text-text-secondary text-right">Key</div>
                            <input
                                type="text"
                                placeholder="Header Name (e.g. X-API-KEY)"
                                value={authState.apikey?.key || ''}
                                onChange={(e) => updateAuth(['apikey', 'key'], e.target.value)}
                                className="flex-1 bg-bg-input border border-border-subtle rounded p-2 text-sm text-text-primary focus:border-brand-orange outline-none"
                            />
                        </div>
                        <div className="flex gap-4 items-center">
                            <div className="w-32 text-xs text-text-secondary text-right">Value</div>
                            <input
                                type="text"
                                placeholder="Value"
                                value={authState.apikey?.value || ''}
                                onChange={(e) => updateAuth(['apikey', 'value'], e.target.value)}
                                className="flex-1 bg-bg-input border border-border-subtle rounded p-2 text-sm text-text-primary focus:border-brand-orange outline-none"
                            />
                        </div>
                        <div className="flex gap-4 items-center">
                            <div className="w-32 text-xs text-text-secondary text-right">Add to</div>
                            <select
                                value={authState.apikey?.add_to || 'header'}
                                onChange={(e) => updateAuth(['apikey', 'add_to'], e.target.value)}
                                className="bg-bg-input border border-border-subtle rounded p-2 text-sm text-text-primary outline-none"
                            >
                                <option value="header">Header</option>
                                <option value="query">Query Params</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}