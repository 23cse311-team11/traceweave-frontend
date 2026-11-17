'use client';
import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronRight, ChevronDown, FolderOpen, Folder, Plus, FolderPlus, MoreHorizontal, GripVertical, Pin } from 'lucide-react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableRequest } from './SortableRequest';
import { useAppStore } from '@/store/useAppStore';
import ContextMenu from '../ui/ContextMenu';
import { useModal } from '@/components/providers/ModalProvider';
import MoveCollectionModal from './MoveCollectionModal';

export function SortableCollection({ collection, activeRequestId, onToggle, onRequestClick }) {
  const store = useAppStore();
  const { showConfirm, showPrompt } = useModal();

  const allCollections = store.getFilteredCollections();
  const childCollections = allCollections.filter(c => c.parentId === collection.id);

  const { setNodeRef, attributes, listeners, transform, transition, isDragging, isOver } = useSortable({
    id: collection.id,
    data: { type: 'collection' },
    disabled: collection.pinned
  });

  const [contextMenu, setContextMenu] = useState({ x: null, y: null });
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleCreateRequest = (e) => {
    e.stopPropagation();
    store.createRequest(collection.id);
    if (collection.collapsed) onToggle(collection.id);
  };

  const handleCreateSubCollection = (e) => {
    e.stopPropagation();
    showPrompt(
      "Enter a name for the new sub-collection:",
      (newName) => {
        if (newName && newName.trim() !== '') {
          store.createCollection(newName.trim(), collection.id); 
          if (collection.collapsed) onToggle(collection.id);
        }
      },
      "New Folder",
      "Create Sub-collection"
    );
  };

  const sortableItemIds = [
    ...childCollections.map(c => c.id),
    ...(collection.items || []).map(i => i.id)
  ];

  const isEmpty = childCollections.length === 0 && (!collection.items || collection.items.length === 0);

  // Helper to check if this folder (or its children) contains the active request
  const isFolderActive = () => {
    if (!activeRequestId) return false;
    // Check direct items
    if (collection.items?.some(req => req.id === activeRequestId)) return true;
    // Check sub-collections recursively
    const checkChildren = (children) => {
      for (const child of children) {
        if (child.items?.some(req => req.id === activeRequestId)) return true;
        const subChildren = allCollections.filter(c => c.parentId === child.id);
        if (checkChildren(subChildren)) return true;
      }
      return false;
    };
    return checkChildren(childCollections);
  };

  const hasActiveItem = isFolderActive();

  return (
    <>
      <div ref={setNodeRef} style={style} className="mb-1 select-none min-w-0">
        <div
          className={`group flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-md relative transition-colors ${
            hasActiveItem && collection.collapsed 
              ? 'bg-brand-primary/10 text-white' 
              : 'text-zinc-300 hover:text-white hover:bg-white/[0.05]'
          } ${isOver && !isDragging ? 'ring-1 ring-brand-primary bg-brand-primary/10' : ''}`}
          onClick={() => onToggle(collection.id)}
          onContextMenu={handleContextMenu}
        >
          {collection.pinned ? (
            <div className="w-4 h-4 shrink-0" />
          ) : (
            <div
              {...attributes}
              {...listeners}
              className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-0.5 text-zinc-500 hover:text-zinc-200 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical size={13} />
            </div>
          )}

          <div className={`p-0.5 relative shrink-0 ${hasActiveItem && collection.collapsed ? 'text-brand-primary' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
            {collection.collapsed ? <Folder size={14} /> : <FolderOpen size={14} />}
            {collection.pinned && <div className="absolute -top-1 -right-1 bg-zinc-900 rounded-full p-[1px]"><Pin size={8} className="text-zinc-200 fill-current" /></div>}
          </div>

          {/* min-w-0 ensures truncation works deeply nested */}
          <span className="text-xs font-medium select-none flex-1 truncate min-w-0 text-zinc-200 group-hover:text-white">
            {collection.name}
          </span>

          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <div
              role="button"
              onClick={handleCreateSubCollection}
              className="p-1 hover:bg-white/[0.08] rounded text-zinc-400 hover:text-brand-primary transition-colors"
              title="Add Sub-collection"
            >
              <FolderPlus size={13} />
            </div>
            <div
              role="button"
              onClick={handleCreateRequest}
              className="p-1 hover:bg-white/[0.08] rounded text-zinc-400 hover:text-brand-primary transition-colors"
              title="Add Request"
            >
              <Plus size={13} />
            </div>
            <div
              role="button"
              onClick={(e) => { e.stopPropagation(); setContextMenu({ x: e.clientX, y: e.clientY }); }}
              className="p-1 hover:bg-white/[0.08] rounded text-zinc-400 hover:text-white transition-colors"
              title="More options"
            >
              <MoreHorizontal size={13} />
            </div>
          </div>

          <div className="text-zinc-500 shrink-0">
            {collection.collapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
          </div>
        </div>

        {!collection.collapsed && (
          <div className={`flex flex-col gap-[2px] mt-1 pl-1 border-l ml-3 ${hasActiveItem ? 'border-brand-primary/40' : 'border-white/[0.08]'}`}>
            {isEmpty ? (
              <div className="py-2 pl-4 pr-2">
                <div className="text-[10px] text-zinc-500 italic py-2 px-3 border border-dashed border-white/[0.08] rounded-md flex items-center justify-center pointer-events-none">
                  Empty collection
                </div>
              </div>
            ) : (
              <SortableContext items={sortableItemIds} strategy={verticalListSortingStrategy}>
                {childCollections.map(childCol => (
                  <SortableCollection
                    key={childCol.id}
                    collection={childCol}
                    activeRequestId={activeRequestId}
                    onToggle={onToggle}
                    onRequestClick={onRequestClick}
                  />
                ))}

                {collection.items && collection.items.map(req => {
                  const liveReq = store.requestStates[req.id];
                  const method = liveReq?.config?.method || liveReq?.method || req.config?.method || req.method || 'GET';
                  const name = liveReq?.name || req.name;
                  return (
                    <SortableRequest
                      key={req.id}
                      {...req}
                      name={name}
                      protocol={liveReq?.protocol || req.protocol || 'http'}
                      method={method}
                      active={activeRequestId === req.id}
                      onClick={() => onRequestClick(req.id)}
                    />
                  );
                })}
              </SortableContext>
            )}
          </div>
        )}
      </div>

      {contextMenu.x !== null && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu({ x: null, y: null })}
          onRename={() => {
            setContextMenu({ x: null, y: null });
            showPrompt(
              "Enter a new name for this collection:",
              (newName) => {
                if (newName && newName.trim() !== '') {
                  store.renameItem(collection.id, newName.trim());
                }
              },
              collection.name,
              "Rename Collection"
            );
          }}
          onDuplicate={() => { 
            store.duplicateItem(collection.id); 
            setContextMenu({ x: null, y: null }); 
          }}
          onDelete={() => { 
            setContextMenu({ x: null, y: null });
            showConfirm(
              `Are you sure you want to delete the collection "${collection.name}"?`,
              () => store.deleteItem(collection.id),
              "Delete Collection"
            );
          }}
          isPinned={collection.pinned}
          onPin={() => { 
            store.togglePinItem(collection.id); 
            setContextMenu({ x: null, y: null }); 
          }}
          onMoveTo={() => {
            setContextMenu({ x: null, y: null });
            setIsMoveModalOpen(true);
          }}
          onMoveToRoot={collection.parentId ? () => {
            store.setCollectionParent(collection.id, null);
            setContextMenu({ x: null, y: null });
          } : null}
        />
      )}

      <MoveCollectionModal
        isOpen={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        collection={collection}
      />
    </>
  );
}
