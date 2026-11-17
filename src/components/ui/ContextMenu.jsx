'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Copy, Edit2, Trash2, Pin, PinOff, CornerUpLeft, FolderInput } from 'lucide-react';

export default function ContextMenu({ 
    x, y, onClose, onRename, onDuplicate, onDelete, isPinned, onPin,
    onMoveToRoot, onMoveTo
}) {
    const ref = useRef(null);
    
    // Start hidden so we can measure it before the user sees it
    const [style, setStyle] = useState({ top: y, left: x, visibility: 'hidden' });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    // useLayoutEffect runs synchronously immediately after React has performed all DOM mutations
    useLayoutEffect(() => {
        if (ref.current && x !== null && y !== null) {
            const rect = ref.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            let adjustedX = x;
            let adjustedY = y;

            // Collision Detection: Right Edge
            if (x + rect.width > viewportWidth) {
                adjustedX = x - rect.width;
            }

            // Collision Detection: Bottom Edge
            if (y + rect.height > viewportHeight) {
                adjustedY = y - rect.height;
            }

            // Apply adjusted coordinates and make it visible
            setStyle({ 
                top: adjustedY, 
                left: adjustedX, 
                visibility: 'visible' 
            });
        }
    }, [x, y]);

    if (x === null || y === null) return null;

    return (
        <div
            ref={ref}
            style={style}
            className="fixed z-[9999] w-44 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl p-1 flex flex-col"
        >
            <button onClick={onPin} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors text-left">
                {isPinned ? <PinOff size={13} /> : <Pin size={13} />} {isPinned ? 'Unpin' : 'Pin to Top'}
            </button>
            <div className="h-px bg-white/[0.08] my-1" />
            <button onClick={onRename} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors text-left">
                <Edit2 size={13} /> Rename
            </button>
            <button onClick={onDuplicate} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors text-left">
                <Copy size={13} /> Duplicate
            </button>
            {onMoveTo && (
                <button onClick={onMoveTo} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors text-left">
                    <FolderInput size={13} /> Move to...
                </button>
            )}
            {onMoveToRoot && (
                <button onClick={onMoveToRoot} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 transition-colors text-left">
                    <CornerUpLeft size={13} /> Move to Root
                </button>
            )}
            <div className="h-px bg-white/[0.08] my-1" />
            <button onClick={onDelete} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left">
                <Trash2 size={13} /> Delete
            </button>
        </div>
    );
}