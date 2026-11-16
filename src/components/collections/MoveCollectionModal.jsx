'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { Folder, FolderTree, X, CornerUpLeft } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function MoveCollectionModal({ isOpen, onClose, collection }) {
  const { collections, setCollectionParent, activeWorkspaceId } = useAppStore();

  if (!isOpen || !collection) return null;

  // Filter out the collection itself and all its descendants to prevent cycles
  const getDescendantIds = (colId, allCols) => {
    let ids = [];
    const children = allCols.filter(c => c.parentId === colId);
    children.forEach(ch => {
      ids.push(ch.id);
      ids = ids.concat(getDescendantIds(ch.id, allCols));
    });
    return ids;
  };

  const forbiddenIds = new Set([collection.id, ...getDescendantIds(collection.id, collections)]);

  const eligibleCollections = collections.filter(
    c => c.workspaceId === activeWorkspaceId && !forbiddenIds.has(c.id)
  );

  const handleSelect = async (targetParentId) => {
    await setCollectionParent(collection.id, targetParentId);
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-bg-panel border border-border-strong rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between bg-bg-base/40">
          <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
            <FolderTree size={16} className="text-brand-primary" />
            <span>Move &quot;{collection.name}&quot;</span>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1 rounded-md hover:bg-bg-input transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 max-h-[350px] overflow-y-auto custom-scrollbar space-y-1.5">
          <p className="text-xs text-text-muted mb-2 px-1">Select a destination collection or move to top level:</p>

          {/* Option: Top Level / Root */}
          <button
            type="button"
            onClick={() => handleSelect(null)}
            className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left text-xs transition-colors border ${
              collection.parentId === null
                ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary font-semibold'
                : 'hover:bg-white/5 border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <div className="w-7 h-7 rounded bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
              <CornerUpLeft size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">Root (Top Level)</div>
              <div className="text-[10px] text-text-muted">Place collection at the top level</div>
            </div>
          </button>

          {/* List all eligible collections */}
          {eligibleCollections.map(col => {
            const isCurrentParent = collection.parentId === col.id;
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => handleSelect(col.id)}
                className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left text-xs transition-colors border ${
                  isCurrentParent
                    ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary font-semibold'
                    : 'hover:bg-white/5 border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                <div className="w-7 h-7 rounded bg-white/5 flex items-center justify-center text-brand-primary/80 shrink-0">
                  <Folder size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{col.name}</div>
                  <div className="text-[10px] text-text-muted">
                    {col.parentId ? 'Sub-collection' : 'Root collection'} • {col.itemIds?.length || 0} requests
                  </div>
                </div>
                {isCurrentParent && (
                  <span className="text-[10px] text-brand-primary font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-primary/10">
                    Current
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="px-5 py-3 border-t border-border-subtle bg-bg-base/30 flex justify-end">
          <button
            onClick={onClose}
            className="text-xs text-text-secondary hover:text-text-primary px-3 py-1.5 rounded hover:bg-bg-input transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
