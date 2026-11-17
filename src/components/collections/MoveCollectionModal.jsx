'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { Folder, FolderTree, X, CornerUpLeft } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function MoveCollectionModal({ isOpen, onClose, collection }) {
  const store = useAppStore();
  const { collections, setCollectionParent, activeWorkspaceId, getFilteredCollections } = store;

  if (!isOpen || !collection) return null;

  const allWorkspaceCols = getFilteredCollections ? getFilteredCollections() : collections;

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

  const forbiddenIds = new Set([collection.id, ...getDescendantIds(collection.id, allWorkspaceCols)]);

  const eligibleCollections = allWorkspaceCols.filter(
    c => !forbiddenIds.has(c.id)
  );

  const handleSelect = async (targetParentId) => {
    await setCollectionParent(collection.id, targetParentId);
    onClose();
  };

  const isAlreadyAtRoot = collection.parentId === null || collection.parentId === undefined;

  const modalContent = (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#121215] border border-white/[0.1] rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-100">
            <FolderTree size={15} className="text-brand-primary" />
            <span>Move &quot;{collection.name}&quot;</span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-white/[0.08] transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-3 max-h-[350px] overflow-y-auto custom-scrollbar space-y-1">
          <p className="text-[11px] text-zinc-400 mb-2 px-1">Select a destination collection or move to Root:</p>

          {/* Option: Top Level / Root */}
          <button
            type="button"
            disabled={isAlreadyAtRoot}
            onClick={() => handleSelect(null)}
            className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left text-xs transition-colors border ${
              isAlreadyAtRoot
                ? 'bg-violet-500/10 border-violet-500/30 text-violet-300 font-medium opacity-80 cursor-default'
                : 'hover:bg-white/[0.06] border-transparent text-zinc-300 hover:text-white cursor-pointer'
            }`}
          >
            <div className="w-7 h-7 rounded bg-violet-500/15 flex items-center justify-center text-brand-primary shrink-0">
              <CornerUpLeft size={13} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">Root (Top Level)</div>
              <div className="text-[10px] text-zinc-500">Place collection as a normal root collection</div>
            </div>
            {isAlreadyAtRoot && (
              <span className="text-[10px] text-brand-primary font-medium px-2 py-0.5 rounded bg-violet-500/15 shrink-0">
                Current
              </span>
            )}
          </button>

          {/* List all eligible collections */}
          {eligibleCollections.map(col => {
            const isCurrentParent = collection.parentId === col.id;
            return (
              <button
                key={col.id}
                type="button"
                disabled={isCurrentParent}
                onClick={() => handleSelect(col.id)}
                className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left text-xs transition-colors border ${
                  isCurrentParent
                    ? 'bg-violet-500/10 border-violet-500/30 text-violet-300 font-medium opacity-80 cursor-default'
                    : 'hover:bg-white/[0.06] border-transparent text-zinc-300 hover:text-white cursor-pointer'
                }`}
              >
                <div className="w-7 h-7 rounded bg-white/[0.05] flex items-center justify-center text-zinc-400 shrink-0">
                  <Folder size={13} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{col.name}</div>
                  <div className="text-[10px] text-zinc-500">
                    {col.parentId ? 'Sub-collection' : 'Root collection'} • {col.itemIds?.length || 0} requests
                  </div>
                </div>
                {isCurrentParent && (
                  <span className="text-[10px] text-brand-primary font-medium px-2 py-0.5 rounded bg-violet-500/15 shrink-0">
                    Current
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="px-4 py-2.5 border-t border-white/[0.08] bg-zinc-900/30 flex justify-end">
          <button
            onClick={onClose}
            className="text-xs text-zinc-400 hover:text-white px-3 py-1 rounded-md hover:bg-white/[0.08] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
