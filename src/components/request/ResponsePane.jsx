'use client';
import { useState } from 'react';
import { Send, Loader2, AlertTriangle, CheckCircle, XCircle, Clock, Activity, FileJson, List } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import TraceViewer from './TraceViewer';

// Enhanced Status Logic Component
const StatusBadge = ({ status, text, time, size }) => {
  // Color Logic
  let statusColor = 'text-green-500';
  let StatusIcon = CheckCircle;
  
  if (status >= 300 && status < 400) { statusColor = 'text-blue-500'; }
  else if (status >= 400 && status < 500) { statusColor = 'text-yellow-500'; StatusIcon = AlertTriangle; }
  else if (status >= 500) { statusColor = 'text-red-500'; StatusIcon = XCircle; }

  // Latency Health Thresholds (Microservice Standards)
  let timeColor = 'text-green-500';
  if (time > 200) timeColor = 'text-yellow-500'; // Warning
  if (time > 500) timeColor = 'text-red-500';    // Critical

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    return (bytes / 1024).toFixed(2) + ' KB';
  };

  return (
    <div className="flex items-center gap-6 text-xs select-text">
      <div className={`flex items-center gap-1.5 font-semibold ${statusColor}`}>
        <StatusIcon size={14} />
        <span>{status} {text}</span>
      </div>
      <div className={`flex items-center gap-1.5 ${timeColor}`}>
        <Clock size={14} />
        <span className="font-mono">{time} ms</span>
      </div>
      <div className="flex gap-1 text-text-secondary">
        <span className="font-mono">{formatSize(size)}</span>
      </div>
    </div>
  );
};

export default function ResponsePane({ height }) {
  const { response, isLoading, error } = useAppStore();
  const [activeTab, setActiveTab] = useState('Body'); 

  return (
    <div style={{ height }} className="border-t border-border-subtle bg-bg-base flex flex-col shrink-0 min-h-[50px]">
       
       {/* Response Header */}
       <div className="flex items-center justify-between px-4 py-2 bg-bg-input border-b border-border-subtle shrink-0 h-10">
          <div className="flex items-center gap-4">
             <div className="text-xs text-text-secondary font-medium">Response</div>
             
             {/* Response Viewer Tabs */}
             <div className="flex items-center gap-4 text-xs text-text-secondary select-none border-l border-border-subtle pl-4 h-5">
                {[
                  { id: 'Body', icon: FileJson }, 
                  { id: 'Headers', icon: List }, 
                  { id: 'Trace', icon: Activity }
                ].map(tab => (
                    <span 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            cursor-pointer hover:text-text-primary transition-colors flex items-center gap-1.5 
                            ${activeTab === tab.id ? 'text-text-primary font-bold' : ''}
                        `}
                    >
                        <tab.icon size={12} />
                        {tab.id}
                    </span>
                ))}
             </div>
          </div>
          
          {response && !isLoading && <StatusBadge {...response} />}
       </div>

       {/* Content Area */}
       <div className="flex-1 overflow-hidden bg-bg-base relative">
          
          {/* 1. Loading State */}
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-base/90 z-10">
               <Loader2 className="animate-spin text-brand-orange mb-2" size={32} />
               <span className="text-xs text-text-secondary">Executing Request...</span>
            </div>
          )}

          {/* 2. Error State (Network Level) */}
          {!isLoading && error && (
            <div className="p-4 text-red-500 text-sm font-mono bg-red-900/10 h-full">
              <div className="flex items-center gap-2 mb-2 font-bold"><XCircle size={16}/> System Error</div>
              {error}
            </div>
          )}

          {/* 3. Success State - Tabbed View */}
          {!isLoading && response && (
            <div className="h-full w-full">
                {activeTab === 'Body' && (
                    <pre className="h-full overflow-auto text-xs font-mono text-text-primary p-4 leading-5 selection:bg-brand-orange/30 custom-scrollbar">
                        {JSON.stringify(response.data, null, 2)}
                    </pre>
                )}
                {activeTab === 'Headers' && (
                    <div className="h-full overflow-auto p-0 custom-scrollbar">
                        <table className="w-full text-left text-xs font-mono">
                            <tbody>
                                {Object.entries(response.headers).map(([k,v]) => (
                                    <tr key={k} className="border-b border-border-subtle hover:bg-bg-input/50">
                                        <td className="p-2 text-text-secondary w-40 truncate border-r border-border-subtle pl-4">{k}</td>
                                        <td className="p-2 text-text-primary break-all">{v}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {activeTab === 'Trace' && (
                    <TraceViewer traceData={response.trace || []} />
                )}
            </div>
          )}

          {/* 4. Empty State */}
          {!isLoading && !response && !error && (
            <div className="flex-1 h-full flex flex-col items-center justify-center text-text-secondary opacity-50 select-none">
                <div className="w-20 h-16 border border-dashed border-text-secondary rounded mb-4 flex items-center justify-center">
                  <Send strokeWidth={1} size={32} />
                </div>
                <span className="text-sm">Enter the URL and click Send to get a response</span>
            </div>
          )}
       </div>
    </div>
  );
}