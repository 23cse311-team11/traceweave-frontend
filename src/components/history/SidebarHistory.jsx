'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { format, isValid } from 'date-fns';
import { Search, Trash2, Clock, Trash, Globe, FolderSync } from 'lucide-react';

const METHOD_STYLES = {
  GET: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  POST: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  PUT: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  DELETE: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  PATCH: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  WS: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
};

const getMethodStyle = (method, protocol) => {
  if (protocol === 'ws') return METHOD_STYLES.WS;
  return METHOD_STYLES[method?.toUpperCase()] || 'text-zinc-300 bg-zinc-800 border-zinc-700';
};

const getStatusColor = (status) => {
  if (!status) return 'text-rose-400';
  if (status >= 200 && status < 300) return 'text-emerald-400';
  if (status >= 300 && status < 400) return 'text-blue-400';
  if (status >= 400 && status < 500) return 'text-amber-400';
  return 'text-rose-400';
};

const getCleanStatusText = (item) => {
  if (!item.status) return 'ERROR';
  const text = item.statusText || '';
  if (item.status !== 200 && text.toLowerCase() === 'ok') return '';
  return text;
};

const formatSize = (bytes) => {
  if (bytes === undefined || bytes === null || isNaN(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
};

export default function SidebarHistory() {
  const historyList = useAppStore(state => state.historyLogs);
  const fetchHistory = useAppStore(state => state.fetchHistory);
  const clearHistory = useAppStore(state => state.clearHistory);
  const removeFromHistory = useAppStore(state => state.removeFromHistory);
  const openTab = useAppStore(state => state.openTab);

  const [filterText, setFilterText] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [scope, setScope] = useState('workspace');

  useEffect(() => {
    fetchHistory?.(scope, 1, 40);
  }, [scope, fetchHistory]);

  const groupedHistory = useMemo(() => {
    if (!historyList || !Array.isArray(historyList)) return {};

    const filtered = historyList.filter(item => {
      const matchesText = (item?.url || '').toLowerCase().includes(filterText.toLowerCase()) ||
                          (item?.method?.toLowerCase().includes(filterText.toLowerCase()));
      if (filterType === 'success') return matchesText && item.status >= 200 && item.status < 300;
      if (filterType === 'error') return matchesText && (item.status >= 400 || item.status === 0 || !item.status);
      return matchesText;
    });

    return filtered.reduce((groups, item) => {
      const date = item?.createdAt ? new Date(item.createdAt) : new Date();
      const label = isValid(date) ? format(date, 'MMM d, yyyy') : 'Recent';
      if (!groups[label]) groups[label] = [];
      groups[label].push(item);
      return groups;
    }, {});
  }, [historyList, filterText, filterType]);

  const handleItemClick = (item) => {
    if (item.requestId && openTab) {
      openTab(item.requestId, true);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-transparent overflow-hidden select-none">
      
      {/* HEADER SECTION */}
      <div className="flex-none p-3 space-y-2.5 bg-transparent z-10 border-b border-white/[0.06]">
        {/* Scope Tabs */}
        <div className="flex bg-zinc-900/80 p-0.5 rounded-lg border border-white/[0.06]">
          <button
            onClick={() => setScope('workspace')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              scope === 'workspace' 
                ? 'bg-zinc-800 text-zinc-100 shadow-xs border border-white/[0.08]' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]'
            }`}
          >
            <FolderSync size={13} />
            <span>Workspace</span>
          </button>
          <button
            onClick={() => setScope('all')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              scope === 'all' 
                ? 'bg-zinc-800 text-zinc-100 shadow-xs border border-white/[0.08]' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]'
            }`}
          >
            <Globe size={13} />
            <span>Global</span>
          </button>
        </div>

        {/* Search & Filter Row */}
        <div className="flex flex-col gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search history..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full bg-zinc-900/60 pl-8 pr-7 py-1.5 text-xs rounded-md border border-white/[0.08] focus:border-brand-primary/50 focus:outline-none text-zinc-200 placeholder:text-zinc-500 transition-colors"
            />
            {filterText && (
              <button 
                type="button"
                onClick={() => setFilterText('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                title="Clear search"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex gap-0.5 bg-zinc-900/60 p-0.5 rounded-md border border-white/[0.06]">
              {['all', 'success', 'error'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase transition-all ${
                    filterType === t 
                      ? 'bg-zinc-800 text-zinc-100 shadow-xs border border-white/[0.08]' 
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {t === 'all' ? 'ALL' : t === 'success' ? '2XX' : '4XX+'}
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => clearHistory?.(scope)} 
              title="Clear all history"
              className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* SCROLLABLE LIST */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="p-3 space-y-4">
          {Object.entries(groupedHistory).length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <Clock size={20} className="text-zinc-600 mb-2 opacity-50" />
              <p className="text-xs text-zinc-400 font-medium">No request history found</p>
              <p className="text-[11px] text-zinc-600 mt-0.5">Executed requests will appear here</p>
            </div>
          ) : (
            Object.entries(groupedHistory).map(([date, items]) => (
              <div key={date} className="relative">
                {/* Date Header */}
                <div className="sticky top-0 z-10 py-1 bg-[#0d0d10]/95 backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                      {date}
                    </span>
                    <div className="h-px bg-white/[0.06] flex-1" />
                  </div>
                </div>

                {/* History Cards */}
                <div className="space-y-1.5 mt-1.5">
                  {items.map((item) => {
                    const timeDate = item.createdAt ? new Date(item.createdAt) : null;
                    const timeFormatted = timeDate && isValid(timeDate) ? format(timeDate, 'HH:mm') : '--:--';
                    const cleanStatusText = getCleanStatusText(item);
                    const isWs = item.protocol === 'ws';

                    return (
                      <div
                        key={item._id || item.id}
                        onClick={() => handleItemClick(item)}
                        className="group relative p-2.5 rounded-lg bg-zinc-900/40 border border-white/[0.06] hover:border-white/[0.14] hover:bg-zinc-800/40 transition-all cursor-pointer"
                      >
                        {/* Top Row: Method Badge + Timestamp + Action Button (never overlapping!) */}
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded border ${getMethodStyle(item.method, item.protocol)}`}>
                            {isWs ? 'WS' : item.method || 'GET'}
                          </span>
                          
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] text-zinc-500 font-mono tracking-tight select-none">
                              {timeFormatted}
                            </span>
                            <button 
                              type="button"
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                removeFromHistory?.(item._id || item.id); 
                              }}
                              title="Delete from history"
                              className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-all -mr-1"
                            >
                              <Trash size={12} />
                            </button>
                          </div>
                        </div>

                        {/* URL Row */}
                        <div 
                          className="text-xs text-zinc-300 font-mono truncate mb-1.5 hover:text-zinc-100 transition-colors"
                          title={item.url}
                        >
                          {item.url || 'Untitled Request'}
                        </div>

                        {/* Status & Timing Footer */}
                        <div className="flex items-center justify-between gap-2 text-[10px]">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className={`font-semibold font-mono ${getStatusColor(item.status)}`}>
                              {item.status ? `${item.status} ${cleanStatusText}`.trim() : 'ERROR'}
                            </span>
                            <span className="text-zinc-600">•</span>
                            <span className="text-zinc-400 font-mono flex items-center gap-1">
                              <Clock size={10} className="text-zinc-500 shrink-0" />
                              {item.timings?.total ?? item.time ?? 0}ms
                            </span>
                          </div>

                          {item.responseSize !== undefined && item.responseSize !== null && (
                            <span className="text-zinc-500 font-mono text-[9px] shrink-0">
                              {formatSize(item.responseSize)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
