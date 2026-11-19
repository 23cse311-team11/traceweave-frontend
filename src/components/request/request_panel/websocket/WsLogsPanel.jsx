import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Trash2, Activity, ArrowUp, Download, MoreHorizontal } from 'lucide-react';
import StatusBadge from './StatusBadge';
import LogEntry from './LogEntry';

export default function WsLogsPanel({ wsState }) {
  const { logs, clearLogs, isConnected, connectionInfo } = wsState;
  
  const [logFilter, setLogFilter] = useState('All Messages');
  const [logSearch, setLogSearch] = useState('');
  const [isScrolledDown, setIsScrolledDown] = useState(false);

  const logsScrollRef = useRef(null);

  const filteredLogs = logs.filter(log => {
    if (logFilter === 'Sent' && log.type !== 'out') return false;
    if (logFilter === 'Received' && log.type !== 'in') return false;
    if (logSearch && !log.msg.toLowerCase().includes(logSearch.toLowerCase())) return false;
    return true;
  });

  const msgCounts = {
    sent: logs.filter(l => l.type === 'out').length,
    received: logs.filter(l => l.type === 'in').length
  };

  const handleLogsScroll = () => {
    if (!logsScrollRef.current) return;
    const { scrollTop } = logsScrollRef.current;
    setIsScrolledDown(scrollTop > 50);
  };

  useEffect(() => {
    if (!isScrolledDown && logsScrollRef.current) {
      logsScrollRef.current.scrollTop = 0;
    }
  }, [logs, isScrolledDown]);

  const handleSaveResponse = () => {
    if (!logs || logs.length === 0) return;
    const exportData = logs.map(({ id, ...rest }) => rest);
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `websocket-logs-${new Date().toISOString().slice(0, 19).replace(/[:]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      {/* Response Header */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border-subtle bg-bg-panel shrink-0">
        <span className="text-xs font-semibold text-text-primary">Response</span>
        
        <div className="flex items-center gap-1.5">
          <AnimatePresence>
            {msgCounts.sent > 0 && (
              <motion.span key="sent" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1 px-1.5 py-0.5 bg-brand-primary/10 border border-brand-primary/20 rounded text-[10px] text-brand-primary font-mono">
                ↑ {msgCounts.sent}
              </motion.span>
            )}
            {msgCounts.received > 0 && (
              <motion.span key="recv" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1 px-1.5 py-0.5 bg-green-500/10 border border-green-500/20 rounded text-[10px] text-green-400 font-mono">
                ↓ {msgCounts.received}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1" />
        <StatusBadge connected={isConnected} connectionInfo={connectionInfo} />

        <button 
          onClick={handleSaveResponse}
          disabled={logs.length === 0}
          className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] text-text-muted hover:text-text-secondary disabled:opacity-40 disabled:cursor-not-allowed border border-transparent hover:border-border-subtle rounded transition-colors"
          title="Save logs to JSON"
        >
          <Download size={11} /> Save Response
        </button>

        <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-bg-input text-text-muted hover:text-text-secondary transition-colors">
          <MoreHorizontal size={14} />
        </button>
      </div>

      {/* Log Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border-subtle bg-bg-base shrink-0">
        <div className="flex items-center gap-1.5 h-7 bg-bg-input border border-border-subtle rounded px-2.5 flex-1 max-w-[220px]">
          <Search size={11} className="text-text-muted shrink-0" />
          <input type="text" value={logSearch} onChange={e => setLogSearch(e.target.value)} placeholder="Search messages…" className="bg-transparent text-[11px] text-text-primary focus:outline-none placeholder-text-muted flex-1 min-w-0" />
          <AnimatePresence>
            {logSearch && (
              <motion.button key="clear" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} onClick={() => setLogSearch('')} className="text-text-muted hover:text-text-secondary">
                <X size={10} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-0.5 bg-bg-input border border-border-subtle rounded overflow-hidden h-7">
          {['All Messages', 'Sent', 'Received'].map(f => (
            <button key={f} onClick={() => setLogFilter(f)} className={`px-2.5 h-full text-[10px] transition-colors ${logFilter === f ? 'bg-[#252525] text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}>
              {f}
            </button>
          ))}
        </div>

        <div className="flex-1" />
        <button onClick={clearLogs} className="flex items-center gap-1.5 px-2.5 h-7 text-[11px] text-text-muted hover:text-red-400 border border-transparent hover:border-red-500/30 rounded transition-colors">
          <Trash2 size={11} /> Clear
        </button>
      </div>

      {/* Log List (Latest at the top) */}
      <div ref={logsScrollRef} onScroll={handleLogsScroll} className="flex-1 overflow-auto custom-scrollbar">
        {filteredLogs.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full gap-3">
            <Activity size={28} className="text-text-muted opacity-20" />
            <p className="text-[11px] text-text-muted opacity-50">
              {logs.length === 0 ? 'No messages yet — connect and send something.' : 'No messages match your filter.'}
            </p>
          </motion.div>
        ) : (
          filteredLogs.map((log, i) => (
            <LogEntry key={log.id || `${log.time}-${i}`} log={log} index={i} /> 
          ))
        )}
      </div>

      {/* Scroll-to-top (Latest) FAB */}
      <AnimatePresence>
        {isScrolledDown && filteredLogs.length > 0 && (
          <motion.button 
            initial={{ opacity: 0, y: 8, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: 8, scale: 0.9 }} 
            transition={{ duration: 0.15 }} 
            onClick={() => { 
              logsScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
              setIsScrolledDown(false); 
            }} 
            title="Jump to latest"
            className="absolute bottom-5 right-4 h-8 px-3 rounded-full bg-[#1E1E1E] border border-[#333] shadow-xl flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary hover:border-[#444] transition-colors z-20"
          >
            <ArrowUp size={13} className="text-brand-primary" />
            <span className="text-[11px] font-medium">Latest</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
