'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { format, isValid } from 'date-fns';
import { Search, Trash2, CheckCircle2, AlertCircle, Clock, Trash, Loader2, Globe, FolderSync } from 'lucide-react';

export default function SidebarHistory() {
  const historyList = useAppStore(state => state.historyLogs);
  const fetchHistory = useAppStore(state => state.fetchHistory);
  const clearHistory = useAppStore(state => state.clearHistory);
  const removeFromHistory = useAppStore(state => state.removeFromHistory);

  const [filterText, setFilterText] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [scope, setScope] = useState('workspace');

  useEffect(() => {
    fetchHistory(scope, 1, 40);
  }, [scope, fetchHistory]);

  const groupedHistory = useMemo(() => {
    if (!historyList) return {};
    const filtered = historyList.filter(item => {
      const matchesText = (item?.url || '').toLowerCase().includes(filterText.toLowerCase()) ||
                         (item?.method?.toLowerCase().includes(filterText.toLowerCase()));
      if (filterType === 'success') return matchesText && item.status >= 200 && item.status < 300;
      if (filterType === 'error') return matchesText && (item.status >= 400 || item.status === 0 || !item.status);
      return matchesText;
    });

    return filtered.reduce((groups, item) => {
      const date = new Date(item.createdAt);
      const label = isValid(date) ? format(date, 'MMM d, yyyy') : 'Unknown';
      if (!groups[label]) groups[label] = [];
      groups[label].push(item);
      return groups;
    }, {});
  }, [historyList, filterText, filterType]);

  return (
    /**
     * LAYER 1: THE SHELL
     * We use h-screen (or h-full if parent is h-screen) and overflow-hidden.
     * This is the "Anchor". It never moves.
     */
    <div className="flex flex-col h-full w-full bg-transparent overflow-hidden">
      
      {/* LAYER 2: THE FIXED HEADER */}
      <div className="flex-none p-3 space-y-3 bg-transparent z-10 border-b border-white/5">
        {/* Scope Tabs */}
        <div className="flex bg-white/[0.03] p-0.5 rounded-lg border border-white/5">
          <button
            onClick={() => setScope('workspace')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors ${scope === 'workspace' ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            <FolderSync size={13} /> Workspace
          </button>
          <button
            onClick={() => setScope('all')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors ${scope === 'all' ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            <Globe size={13} /> Global
          </button>
        </div>

        {/* Search & Filter Row */}
        <div className="flex flex-col gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-2.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search history..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full bg-white/[0.03] pl-8 pr-3 py-1.5 text-xs rounded-md border border-white/10 focus:border-white/20 outline-none text-zinc-200 placeholder:text-zinc-500 transition-colors"
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex gap-1 bg-white/[0.02] p-0.5 rounded-md border border-white/5">
              {['all', 'success', 'error'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-2 py-1 rounded text-[10px] font-medium tracking-wide uppercase transition-colors ${filterType === t ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  {t === 'all' ? 'ALL' : t === 'success' ? '2XX' : '4XX+'}
                </button>
              ))}
            </div>
            <button 
              onClick={() => clearHistory?.()} 
              title="Clear History"
              className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* LAYER 3: SCROLLABLE LIST */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="p-3 space-y-4">
          {Object.entries(groupedHistory).length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">No request history found</div>
          ) : (
            Object.entries(groupedHistory).map(([date, items]) => (
              <div key={date} className="relative">
                <div className="sticky top-0 z-10 py-1.5 bg-[#0d0d0d]/95 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                      {date}
                    </span>
                    <div className="h-px bg-white/5 flex-1" />
                  </div>
                </div>

                <div className="space-y-1.5 mt-1.5">
                  {items.map((item) => (
                    <div
                      key={item._id || item.id}
                      className="group relative p-2.5 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/15 hover:bg-white/[0.04] transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white/5 text-zinc-300 border border-white/5">
                          {item.method}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {format(new Date(item.createdAt), 'HH:mm')}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-300 font-mono truncate mb-1">
                        {item.url}
                      </div>
                      <div className={`text-[10px] font-medium ${item.status >= 200 && item.status < 400 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {item.status ? `${item.status} ${item.statusText || ''}`.trim() : 'ERROR'} <span className="text-zinc-500 font-normal ml-1">— {item.timings?.total || 0}ms</span>
                      </div>
                      
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeFromHistory?.(item._id || item.id); }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-all"
                      >
                        <Trash size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}