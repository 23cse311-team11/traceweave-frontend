'use client';

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Globe, Lock, MoreVertical, Star, Users, Folder, Edit3, Trash2, Copy } from 'lucide-react';

export function WorkspaceItem({
    ws,
    viewMode,
    isStarred,
    onToggleStar,
    activeMenuId,
    setActiveMenuId,
    onEdit,
    onDelete,
    onDuplicate
}) {
    const router = useRouter();
    const isGrid = viewMode === 'grid';
    const memberCount = ws.members?.length || 1;
    const derivedType = memberCount > 1 ? 'Team' : 'Personal';
    const derivedAccess = memberCount > 1 ? 'Shared' : 'Private';
    const collectionCount = ws._count?.collections || 0;

    const lastActiveDate = new Date(ws.updatedAt).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });

    const handleAction = (e, action) => {
        e.preventDefault();
        e.stopPropagation();
        e.nativeEvent?.stopImmediatePropagation();
        setActiveMenuId(e, null);
        action(ws);
    };

    const handleCardClick = (e) => {
        if (e.target.closest('button') || e.target.closest('.dropdown-container')) return;
        e.preventDefault();
        router.push(`/workspace/${ws.id}`);
    };

    // FIX: Extracted as a variable, NOT a component function, to prevent React from unmounting it mid-animation
    const dropdownMenuUi = (
        <AnimatePresence>
            {activeMenuId === ws.id && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                    className="absolute right-0 top-full mt-2 w-48 glass-strong border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col p-1.5"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                >
                    <button onClick={(e) => handleAction(e, onEdit)} className="w-full text-left px-4 py-2 text-[10px] font-black hover:bg-white/5 text-white rounded-xl transition-all flex items-center gap-2.5 uppercase tracking-wider">
                        <Edit3 size={14} className="text-brand-primary" /> Edit Settings
                    </button>
                    <button onClick={(e) => handleAction(e, onDuplicate)} className="w-full text-left px-4 py-2 text-[10px] font-black hover:bg-white/5 text-white rounded-xl transition-all flex items-center gap-2.5 uppercase tracking-wider">
                        <Copy size={14} className="text-brand-primary" /> Duplicate
                    </button>
                    <div className="h-px bg-white/5 my-1 mx-2" />
                    <button onClick={(e) => handleAction(e, onDelete)} className="w-full text-left px-4 py-2 text-[10px] font-black hover:bg-red-500/10 text-red-400 rounded-xl transition-all flex items-center gap-2.5 uppercase tracking-wider">
                        <Trash2 size={14} /> Terminate
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <div
            onClick={handleCardClick}
            // FIX: Added dynamic z-index so the open menu doesn't slide under other cards in grid view
            className={`group block h-full cursor-pointer relative glass-strong border border-white/5 rounded-3xl hover:border-brand-primary/30 transition-all hover:shadow-glow-sm hover:translate-y-[-2px] overflow-visible ${isGrid ? 'flex flex-col p-6' : 'flex items-center p-4'} ${activeMenuId === ws.id ? 'z-50' : 'z-10'}`}
        >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

            {/* Grid View Menu Trigger */}
            {isGrid && (
                <div className="flex justify-between items-start mb-6 relative z-10 w-full">
                    <div className="w-12 h-12 rounded-2xl bg-brand-surface/50 border border-brand-primary/20 flex items-center justify-center text-white font-mono text-base font-black group-hover:scale-110 transition-transform shadow-inner">
                        {ws.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="relative dropdown-container">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                e.nativeEvent?.stopImmediatePropagation();
                                setActiveMenuId(e, ws.id);
                            }}
                            className={`p-2 rounded-xl transition-all block opacity-100 ${activeMenuId === ws.id ? 'bg-white/10 text-white' : 'text-text-muted hover:text-white hover:bg-white/5'}`}
                        >
                            <MoreVertical size={18} />
                        </button>
                        {dropdownMenuUi}
                    </div>
                </div>
            )}

            {!isGrid && (
                <div className="w-12 h-12 flex-shrink-0 rounded-2xl bg-brand-surface/50 border border-brand-primary/20 flex items-center justify-center text-sm font-black font-mono text-white group-hover:scale-110 transition-transform shadow-inner mr-6 relative z-10">
                    {ws.name.substring(0, 2).toUpperCase()}
                </div>
            )}

            <div className="flex-1 min-w-0 relative z-10">
                <div className="flex items-center gap-3 mb-2">
                    <h3 className={`${isGrid ? 'text-xl font-black' : 'text-base font-bold'} text-white truncate tracking-tight`}>{ws.name}</h3>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.nativeEvent?.stopImmediatePropagation();
                            onToggleStar(e, ws.id);
                        }}
                        className="focus:outline-none"
                    >
                        <Star
                            size={16}
                            className={`flex-shrink-0 transition-all ${isStarred ? 'text-yellow-500 fill-yellow-500' : 'text-text-muted hover:text-yellow-500'}`}
                        />
                    </button>
                </div>
                <p className={`text-text-muted text-sm leading-relaxed ${isGrid ? 'line-clamp-2 mb-8' : 'truncate max-w-md'}`}>
                    {ws.description || "No description provided."}
                </p>
            </div>

            {/* List View Menu Trigger */}
            {!isGrid && (
                <div className="flex items-center gap-4 sm:gap-12 ml-6 relative z-10">
                    <div className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.1em]">
                        <div className="w-24 flex items-center gap-2.5 text-text-muted"><Users size={14} className="text-brand-primary" /> <span>{derivedType}</span></div>
                        <div className="w-24 flex items-center gap-2.5 text-text-muted">{derivedAccess === 'Private' ? <Lock size={14} className="text-brand-primary" /> : <Globe size={14} className="text-brand-primary" />} <span>{derivedAccess}</span></div>
                        <div className="w-32 flex items-center gap-2.5 font-mono text-text-muted"><Clock size={14} className="text-brand-primary" /> <span>{lastActiveDate}</span></div>
                    </div>
                    <div className="relative dropdown-container">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                e.nativeEvent?.stopImmediatePropagation();
                                setActiveMenuId(e, ws.id);
                            }}
                            className={`p-2 rounded-xl transition-all block opacity-100 ${activeMenuId === ws.id ? 'bg-white/10 text-white' : 'text-text-muted hover:text-white hover:bg-white/5'}`}
                        >
                            <MoreVertical size={18} />
                        </button>
                        {dropdownMenuUi}
                    </div>
                </div>
            )}

            {isGrid && (
                <div className="mt-auto pt-5 border-t border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest relative z-10 w-full">
                    <div className="flex items-center gap-2.5 text-text-muted"><Users size={16} className="text-brand-primary" /> <span>{memberCount} MEMBERS</span></div>
                    <div className="flex items-center gap-2.5 text-text-muted"><Folder size={16} className="text-brand-primary" /> <span>{collectionCount} COLLECTIONS</span></div>
                </div>
            )}
        </div>
    );
}