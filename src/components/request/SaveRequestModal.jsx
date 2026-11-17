'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, FolderPlus, Folder, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function SaveRequestModal({ isOpen, onClose, requestId }) {
    const store = useAppStore();
    const [selectedCollectionId, setSelectedCollectionId] = useState(null);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [isCreatingCol, setIsCreatingCol] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Portal mounting state
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Get Request Name
    const request = store.requestStates[requestId];
    const [requestName, setRequestName] = useState(request?.name || 'My Request');

    const collections = store.getFilteredCollections();

    // Auto-select first collection if none selected and collections exist
    useEffect(() => {
        if (collections.length > 0 && !selectedCollectionId) {
            setSelectedCollectionId(collections[0].id);
        }
    }, [collections, selectedCollectionId]);

    if (!isOpen || !mounted) return null;

    const handleSave = async () => {
        if (!selectedCollectionId || isSaving) return;
        setIsSaving(true);
        try {
            await store.attachRequestToCollection(requestId, selectedCollectionId, requestName.trim() || 'My Request');
            onClose();
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateCollection = async () => {
        if (!newCollectionName.trim() || isCreating) return;
        setIsCreating(true);
        try {
            const newCol = await store.createCollection(newCollectionName.trim());
            if (newCol && newCol.id) {
                setSelectedCollectionId(newCol.id);
            }
            setIsCreatingCol(false);
            setNewCollectionName('');
        } finally {
            setIsCreating(false);
        }
    };

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-bg-panel border border-border-strong rounded-lg shadow-2xl w-[450px] overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="px-5 py-3 border-b border-border-subtle flex justify-between items-center bg-bg-base">
                    <h2 className="text-sm font-bold text-text-primary">Save Request</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary"><X size={16} /></button>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 overflow-y-auto">
                    {/* Request Name Input */}
                    <div className="mb-4">
                        <label className="text-xs font-semibold text-text-secondary mb-1 block">Request Name</label>
                        <input
                            type="text"
                            value={requestName}
                            onChange={(e) => setRequestName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSave();
                            }}
                            className="w-full bg-bg-input border border-border-subtle rounded p-2 text-sm text-text-primary focus:border-brand-primary outline-none"
                            autoFocus
                        />
                    </div>

                    {/* Collection Selection */}
                    <div className="mb-2 flex justify-between items-end">
                        <label className="text-xs font-semibold text-text-secondary block">Select a Collection</label>
                        <button
                            type="button"
                            onClick={() => setIsCreatingCol(!isCreatingCol)}
                            className="text-[10px] text-brand-blue hover:underline flex items-center gap-1 font-medium"
                        >
                            <FolderPlus size={12} /> New Collection
                        </button>
                    </div>

                    {/* Inline Create Collection */}
                    {isCreatingCol && (
                        <div className="flex gap-2 mb-3 animate-in fade-in slide-in-from-top-2">
                            <input
                                type="text"
                                placeholder="Collection Name"
                                value={newCollectionName}
                                onChange={(e) => setNewCollectionName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCreateCollection();
                                    if (e.key === 'Escape') setIsCreatingCol(false);
                                }}
                                disabled={isCreating}
                                className="flex-1 bg-bg-base border border-brand-primary rounded px-2 py-1 text-xs text-text-primary focus:outline-none"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={handleCreateCollection}
                                disabled={isCreating || !newCollectionName.trim()}
                                className="text-xs bg-brand-primary text-black font-semibold px-3 py-1 rounded hover:bg-brand-primary/90 disabled:opacity-50 flex items-center gap-1"
                            >
                                {isCreating ? <Loader2 size={12} className="animate-spin" /> : 'Create'}
                            </button>
                        </div>
                    )}

                    {/* Collection List */}
                    <div className="border border-border-subtle rounded bg-bg-base h-40 overflow-y-auto custom-scrollbar">
                        {collections.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-text-secondary text-xs opacity-70 p-4 text-center">
                                <Folder size={24} className="mb-2 text-text-muted" />
                                <p className="mb-2">No collections found in this workspace.</p>
                                <button
                                    type="button"
                                    onClick={() => setIsCreatingCol(true)}
                                    className="text-brand-primary text-xs font-semibold hover:underline flex items-center gap-1"
                                >
                                    <FolderPlus size={12} />
                                    <span>Create your first collection</span>
                                </button>
                            </div>
                        ) : (
                            collections.map(col => (
                                <div
                                    key={col.id}
                                    onClick={() => setSelectedCollectionId(col.id)}
                                    className={`px-3 py-2 flex items-center gap-2 cursor-pointer text-xs border-b border-border-subtle last:border-0 hover:bg-bg-input transition-colors ${selectedCollectionId === col.id ? 'bg-brand-primary/20 text-brand-primary font-semibold' : 'text-text-primary'}`}
                                >
                                    <Folder size={14} className={selectedCollectionId === col.id ? 'fill-brand-primary text-brand-primary' : 'text-text-muted'} />
                                    <span className="truncate">{col.name}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-border-subtle bg-bg-base flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSaving}
                        className="px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={!selectedCollectionId || isSaving}
                        className="bg-brand-primary text-black px-4 py-1.5 rounded text-xs font-bold hover:bg-brand-glow transition disabled:opacity-50 disabled:cursor-not-allowed shadow-glow-sm flex items-center gap-1.5"
                    >
                        {isSaving && <Loader2 size={12} className="animate-spin" />}
                        <span>Save</span>
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
