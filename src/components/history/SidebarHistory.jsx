'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { format, isValid } from 'date-fns';
import { Search, Trash2, CheckCircle2, AlertCircle, Clock, Trash, Loader2 } from 'lucide-react';

export default function SidebarHistory() {
  const historyList = useAppStore(state => state.history);
  const fetchHistory = useAppStore(state => state.fetchHistory);
  const clearHistory = useAppStore(state => state.clearHistory);
  const removeFromHistory = useAppStore(state => state.removeFromHistory);
  
  const [filterText, setFilterText] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [scope, setScope] = useState('workspace');
  
  // Pagination & Loading State
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  // Initial Load & Scope Change
  useEffect(() => {
    const loadInitialHistory = async () => {
      setIsLoading(true);
      setPage(1);
      const pagination = await fetchHistory(scope, 1);
      if (pagination) {
        setHasMore(pagination.page < pagination.pages);
      }
      setIsLoading(false);
    };
    
    loadInitialHistory();
  }, [scope, fetchHistory]);

  // Load More Handler
  const handleLoadMore = async () => {
    if (isFetchingMore || !hasMore) return;
    
    setIsFetchingMore(true);
    const nextPage = page + 1;
    const pagination = await fetchHistory(scope, nextPage);
    
    if (pagination) {
      setPage(nextPage);
      setHasMore(pagination.page < pagination.pages);
    }
    setIsFetchingMore(false);
  };

  const groupedHistory = useMemo(() => {
    if (!historyList || !Array.isArray(historyList)) return {};

    const sorted = [...historyList].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
    });

    const filtered = sorted.filter(item => {
      const matchesText =
        (item?.url || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (item?.method && item?.method?.toLowerCase().includes(filterText.toLowerCase()));

      if (filterType === 'success') return matchesText && item.status >= 200 && item.status < 300;
      if (filterType === 'error') return matchesText && item.status >= 400;

      return matchesText;
    });

    return filtered.reduce((groups, item) => {
      const dateStr = item.createdAt; 
      let dateLabel = 'Unknown Date';
      
      if (dateStr) {
          const date = new Date(dateStr);
          if (isValid(date)) {
              const today = new Date();
              const yesterday = new Date(today);
              yesterday.setDate(yesterday.getDate() - 1);

              if (date.toDateString() === today.toDateString()) {
                  dateLabel = 'Today';
              } else if (date.toDateString() === yesterday.toDateString()) {
                  dateLabel = 'Yesterday';
              } else {
                  dateLabel = format(date, 'MMM d, yyyy');
              }
          }
      }

      if (!groups[dateLabel]) groups[dateLabel] = [];
      groups[dateLabel].push(item);
      return groups;
    }, {});
  }, [historyList, filterText, filterType]);

  const getMethodColor = (method) => {
    switch (method) {
      case 'GET': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'POST': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'PUT': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'DELETE': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'PATCH': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'text-gray-500';
    if (status >= 200 && status < 300) return 'text-green-500';
    if (status >= 400) return 'text-red-500';
    return 'text-yellow-500';
  };

  return (
    <div className="flex flex-col h-full bg-bg-secondary/30">
      {/* Search and Filter Header */}
      <div className="p-3 border-b border-border-subtle sticky top-0 bg-bg-secondary z-10 shadow-sm">
        <div className="relative mb-3">
          <Search size={14} className="absolute left-2.5 top-2 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search URLs or methods..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full bg-bg-input pl-8 pr-3 py-1.5 text-xs rounded-md border border-border-subtle focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20 transition-all outline-none text-text-primary placeholder:text-text-tertiary"
          />
        </div>

        <div className="flex flex-col gap-2.5 w-full text-xs">
          <div className="flex bg-bg-input p-0.5 rounded-md self-start w-full">
            <button
              onClick={() => setScope('workspace')}
              className={`flex-1 py-1 rounded text-[11px] font-medium transition-all ${scope === 'workspace' ? 'bg-bg-secondary text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-secondary'}`}
            >
              Workspace
            </button>
            <button
              onClick={() => setScope('all')}
              className={`flex-1 py-1 rounded text-[11px] font-medium transition-all ${scope === 'all' ? 'bg-bg-secondary text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-secondary'}`}
            >
              Global
            </button>
          </div>

          <div className="flex justify-between items-center w-full">
            <div className="flex gap-1.5">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors ${filterType === 'all' ? 'bg-text-secondary/10 text-text-primary' : 'text-text-tertiary hover:bg-bg-input'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('success')}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors ${filterType === 'success' ? 'bg-green-500/10 text-green-500' : 'text-text-tertiary hover:bg-bg-input'}`}
              >
                Success
              </button>
              <button
                onClick={() => setFilterType('error')}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors ${filterType === 'error' ? 'bg-red-500/10 text-red-500' : 'text-text-tertiary hover:bg-bg-input'}`}
              >
                Error
              </button>
            </div>

            <button
              onClick={() => clearHistory && clearHistory()}
              className="p-1.5 text-text-tertiary hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
              title="Clear All History"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 relative">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-40 text-text-tertiary gap-2">
            <Loader2 size={24} className="animate-spin opacity-50" />
            <span className="text-xs">Loading history...</span>
          </div>
        ) : Object.entries(groupedHistory).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-text-tertiary gap-2">
            <Clock size={32} className="opacity-30" />
            <span className="text-xs font-medium">No history found</span>
            {filterText || filterType !== 'all' ? (
              <span className="text-[10px] opacity-70">Try adjusting your filters</span>
            ) : null}
          </div>
        ) : (
          <div className="pb-4">
            {Object.entries(groupedHistory).map(([date, items]) => (
              <div key={date} className="mb-5">
                <div className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-2 px-2 sticky top-0 bg-bg-secondary/95 backdrop-blur-sm py-1.5 z-0 rounded-md">
                  {date}
                </div>
                <div className="grid gap-1 px-1">
                  {items.map((item) => (
                    <div
                      key={item._id || item.id}
                      className="group relative flex flex-col p-2.5 rounded-lg hover:bg-bg-input cursor-pointer border border-transparent hover:border-border-subtle transition-all duration-200"
                      onClick={() => {
                        console.log('Restore history item:', item);
                      }}
                    >
                      <div className="flex justify-between items-start mb-1.5 gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getMethodColor(item?.method)}`}>
                            {item?.method || 'GET'}
                          </span>
                          <span className="text-xs text-text-primary truncate font-mono" title={item?.url}>
                            {item?.url?.replace(/^https?:\/\//, '') || 'No URL'}
                          </span>
                        </div>
                        <span className="text-[10px] text-text-tertiary whitespace-nowrap pt-0.5">
                          {isValid(new Date(item.createdAt)) ? format(new Date(item.createdAt), 'h:mm a') : ''}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] flex items-center gap-1 font-medium ${getStatusColor(item.status)}`}>
                            {item.status < 400 ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                            {item.status || 'Error'}
                          </span>
                          <span className="text-[10px] text-text-tertiary">
                            {item.timings?.total ? `${item.timings.total} ms` : ''}
                          </span>
                        </div>

                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); removeFromHistory && removeFromHistory(item._id || item.id); }}
                            className="p-1.5 hover:bg-bg-secondary rounded-md text-text-tertiary hover:text-red-400 transition-colors"
                            title="Delete from history"
                          >
                            <Trash size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {/* Load More Button */}
            {hasMore && (
              <div className="mt-4 mb-2 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isFetchingMore}
                  className="px-4 py-1.5 rounded-full text-xs font-medium bg-bg-input text-text-secondary hover:text-text-primary hover:bg-border-subtle transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isFetchingMore ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load Older Requests'
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}