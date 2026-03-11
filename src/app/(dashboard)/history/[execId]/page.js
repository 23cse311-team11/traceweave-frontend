'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { 
  ArrowLeft, Clock, Server, ArrowDownToLine, 
  ArrowUpFromLine, Activity, Copy, Check, 
  MessageSquare, ArrowRightLeft, File, FileText 
} from 'lucide-react';
import { PacmanLoader } from 'react-spinners';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// --- UTILS ---
const formatJson = (data) => {
  if (data === undefined || data === null || data === '') return '';
  if (typeof data === 'string') {
    try { return JSON.stringify(JSON.parse(data), null, 2); } 
    catch (e) { return data; }
  }
  return JSON.stringify(data, null, 2);
};

const hasValue = (value) => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
};

const normalizeHeaders = (headers) => {
  if (!headers) return {};

  if (Array.isArray(headers)) {
    return headers.reduce((acc, item) => {
      if (item?.key) acc[item.key] = item.value;
      return acc;
    }, {});
  }

  if (typeof headers === 'string') {
    try {
      const parsed = JSON.parse(headers);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  return typeof headers === 'object' ? headers : {};
};

const getSerializedSize = (value) => {
  if (!hasValue(value)) return 0;

  const rawValue = typeof value === 'string' ? value : JSON.stringify(value);
  return new TextEncoder().encode(rawValue).length;
};

const getTimingMetrics = (timings) => {
  const total = Number(timings?.total) || 0;
  if (!total) {
    return {
      dnsLookup: 0,
      tcpConnection: 0,
      tlsHandshake: 0,
      firstByte: 0,
      download: 0,
      total: 0,
      source: 'missing',
    };
  }

  const measured = {
    dnsLookup: Number(timings?.dnsLookup) || 0,
    tcpConnection: Number(timings?.tcpConnection) || 0,
    tlsHandshake: Number(timings?.tlsHandshake) || 0,
    firstByte: Number(timings?.firstByte) || 0,
    download: Number(timings?.download) || 0,
  };

  const hasMeasuredBreakdown = Object.values(measured).some(value => value > 0);
  if (hasMeasuredBreakdown) {
    return { ...measured, total, source: 'live' };
  }

  return {
    dnsLookup: Math.ceil(total * 0.10),
    tcpConnection: Math.ceil(total * 0.05),
    tlsHandshake: 0,
    firstByte: Math.ceil(total * 0.60),
    download: Math.max(total - Math.ceil(total * 0.10) - Math.ceil(total * 0.05) - Math.ceil(total * 0.60), 0),
    total,
    source: 'estimated',
  };
};

const normalizeExecutionLog = (log) => {
  if (!log) return null;

  const requestHeaders = normalizeHeaders(log.requestHeaders);
  const responseHeaders = normalizeHeaders(log.responseHeaders);
  const timings = getTimingMetrics(log.timings);
  const responseSize = Number(log.responseSize) || getSerializedSize(log.responseBody);
  const isWs = log.protocol === 'ws';

  const hasRequestHeaders = Object.keys(requestHeaders).length > 0;
  const hasResponseHeaders = Object.keys(responseHeaders).length > 0;
  const hasRequestBody = hasValue(log.requestBody);
  const hasResponseBody = isWs ? Array.isArray(log.responseBody) && log.responseBody.length > 0 : hasValue(log.responseBody);

  return {
    ...log,
    requestHeaders,
    responseHeaders,
    timings,
    responseSize,
    hasRequestHeaders,
    hasResponseHeaders,
    hasRequestBody,
    hasResponseBody,
    isSummaryOnly: !isWs && !hasRequestHeaders && !hasResponseHeaders && !hasRequestBody && !hasResponseBody,
  };
};

const EmptyState = ({ message }) => (
  <div className="p-8 text-center text-sm text-text-muted font-mono italic">{message}</div>
);

const getStatusColor = (code) => {
  if (!code) return 'text-text-muted';
  if (code === 101) return 'text-purple-400';
  if (code >= 200 && code < 300) return 'text-emerald-500';
  if (code >= 300 && code < 400) return 'text-blue-500';
  if (code >= 400 && code < 500) return 'text-amber-500';
  return 'text-red-500';
};

const getMethodColor = (method, protocol) => {
  if (protocol === 'ws') return 'text-purple-400';
  const m = method?.toUpperCase() || '';
  if (m === 'GET') return 'text-blue-400';
  if (m === 'POST') return 'text-emerald-400';
  if (m === 'PUT' || m === 'PATCH') return 'text-amber-400';
  if (m === 'DELETE') return 'text-red-400';
  return 'text-brand-orange';
};

// --- COMPONENTS ---
const CopyButton = ({ textValue }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (!textValue) return;
    navigator.clipboard.writeText(textValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  if (!textValue) return null;
  return (
    <button 
      onClick={handleCopy}
      className="p-1.5 rounded hover:bg-bg-input text-text-muted hover:text-text-primary transition-colors flex items-center justify-center"
      title="Copy"
    >
      {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
    </button>
  );
};

const HeadersDisplay = ({ headers, emptyMessage = 'No headers available' }) => {
  if (!headers || Object.keys(headers).length === 0) {
    return <EmptyState message={emptyMessage} />;
  }
  return (
    <div className="flex flex-col text-[12px] font-mono divide-y divide-border-subtle">
      {Object.entries(headers).map(([key, value]) => (
        <div key={key} className="flex px-6 py-3 hover:bg-bg-base/40 transition-colors">
          <span className="text-text-muted font-semibold w-1/4 shrink-0">{key}</span>
          <span className="text-emerald-400 break-all">{String(value)}</span>
        </div>
      ))}
    </div>
  );
};

// ✨ NEW: Smart Request Body Renderer (Handles Form-Data & Files without crashing)
const RequestBodyDisplay = ({ body, emptyMessage = 'No request body' }) => {
  if (!body || body.type === 'none') return <EmptyState message={emptyMessage} />;

  // Render FormData (Files + Text)
  if (body.type === 'formdata') {
    return (
      <div className="flex flex-col text-[12px] font-mono divide-y divide-border-subtle">
        {body.formdata?.map((item, i) => (
          <div key={i} className="flex px-6 py-3 hover:bg-bg-base/40 transition-colors items-center">
            <span className="text-text-muted font-semibold w-1/4 shrink-0 truncate">{item.key || 'unnamed'}</span>
            <div className="flex-1">
              {item.isFile ? (
                <div className="inline-flex items-center gap-2 text-brand-orange bg-brand-orange/10 px-2 py-1 rounded border border-brand-orange/20">
                  <File size={14} />
                  <span className="truncate max-w-[200px]">{item.value?.name || 'File Uploaded'}</span>
                  <span className="text-[10px] bg-bg-base px-1.5 rounded text-text-muted ml-1">{item.value?.type || 'binary'}</span>
                </div>
              ) : (
                <span className="text-emerald-400 break-all">{String(item.value)}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Render URL Encoded
  if (body.type === 'urlencoded') {
    return (
      <div className="flex flex-col text-[12px] font-mono divide-y divide-border-subtle">
        {body.urlencoded?.map((item, i) => (
          <div key={i} className="flex px-6 py-3 hover:bg-bg-base/40 transition-colors items-center">
            <span className="text-text-muted font-semibold w-1/4 shrink-0 truncate">{item.key || 'unnamed'}</span>
            <span className="text-emerald-400 break-all">{String(item.value)}</span>
          </div>
        ))}
      </div>
    );
  }

  // Render Single Binary File
  if (body.type === 'binary') {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 text-brand-orange bg-brand-orange/5 p-4 rounded-lg border border-brand-orange/20 max-w-sm">
          <FileText size={24} />
          <div className="flex flex-col">
            <span className="font-semibold text-sm font-mono">{body.binaryFile?.name || 'Binary Data Attached'}</span>
            <span className="text-xs text-text-muted font-mono">{body.binaryFile?.type || 'application/octet-stream'}</span>
          </div>
        </div>
      </div>
    );
  }

  // Fallback to Raw/GraphQL JSON rendering
  const rawData = body.raw || formatJson(body);
  return (
    <SyntaxHighlighter language="json" style={vscDarkPlus} customStyle={{ margin: 0, padding: '1.5rem', background: 'transparent', fontSize: '13px' }}>
      {rawData}
    </SyntaxHighlighter>
  );
};

const TimingBar = ({ label, value, startPercent, widthPercent, colorClass }) => {
  if (widthPercent <= 0 && value <= 0) return null; // Hide segments with 0ms

  return (
    <div className="group flex items-center h-8 hover:bg-white/5 px-2 transition-colors">
      {/* Label and Value */}
      <div className="w-40 shrink-0 flex flex-col justify-center">
        <span className="text-[11px] text-text-muted group-hover:text-text-secondary truncate uppercase tracking-tighter">
          {label}
        </span>
      </div>

      {/* The Track */}
      <div className="flex-1 h-full relative border-l border-border-subtle/30 flex items-center">
        {/* The Actual Bar */}
        <div 
          className={`h-2.5 rounded-sm shadow-sm transition-all duration-700 ease-out ${colorClass}`}
          style={{ 
            marginLeft: `${startPercent}%`, 
            width: `${Math.max(widthPercent, 0.5)}%`, // Ensure it's at least visible
          }}
          title={`${label}: ${value}ms`}
        />
        {/* Value Label (only shows on hover or if there's space) */}
        <span className="ml-2 text-[10px] font-mono text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">
          {value}ms
        </span>
      </div>
    </div>
  );
};

const WsMessageTimeline = ({ messages }) => {
  if (!Array.isArray(messages) || messages.length === 0) {
    return <EmptyState message="No messages recorded in this session." />;
  }
  return (
    <div className="flex flex-col gap-4 p-6 overflow-y-auto custom-scrollbar h-full">
      {messages.map((msg, idx) => {
        const isOutgoing = msg.direction === 'outgoing';
        return (
          <div key={idx} className={`flex flex-col max-w-[80%] ${isOutgoing ? 'self-end items-end' : 'self-start items-start'}`}>
            <div className="flex items-center gap-2 mb-1.5 px-1">
              {isOutgoing ? <ArrowUpFromLine size={12} className="text-brand-orange" /> : <ArrowDownToLine size={12} className="text-emerald-500" />}
              <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">
                {isOutgoing ? 'Sent' : 'Received'}
              </span>
              <span className="text-[10px] text-text-muted font-mono ml-2">
                {new Date(msg.time).toLocaleTimeString()}
              </span>
            </div>
            <div className={`p-3 rounded-lg border text-[13px] font-mono break-all ${
              isOutgoing 
                ? 'bg-brand-orange/10 border-brand-orange/20 text-text-primary rounded-tr-none' 
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 rounded-tl-none'
            }`}>
              {msg.data}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function ExecutionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { execId } = params;
  
  const { activeExecution: log, isHistoryLoading, fetchExecutionDetails, clearActiveExecution } = useAppStore();
  const [activeTab, setActiveTab] = useState('');
  const execution = useMemo(() => normalizeExecutionLog(log), [log]);

  useEffect(() => {
    if (execId) fetchExecutionDetails(execId);
    return () => clearActiveExecution();
  }, [execId, fetchExecutionDetails, clearActiveExecution]);

  if (isHistoryLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-bg-base text-text-secondary">
        <PacmanLoader color="#EAC2FF" size={20} />
      </div>
    );
  }

  if (!execution) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-bg-base text-text-secondary px-6">
        <div className="text-lg font-semibold text-text-primary">Execution details unavailable</div>
        <p className="text-sm text-text-muted text-center max-w-md">
          This record could not be loaded. It may have been deleted or you may no longer have access to it.
        </p>
        <button
          onClick={() => router.push('/history')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border-subtle hover:bg-bg-input transition-colors"
        >
          <ArrowLeft size={16} /> Back to History
        </button>
      </div>
    );
  }

  const isWs = execution.protocol === 'ws';
  const formattedResBody = !isWs ? formatJson(execution.responseBody) : '';
  const emptyDetailMessage = execution.isSummaryOnly
    ? 'This history entry only stored summary metadata. Re-run the request to capture full headers, body, and timing details.'
    : 'No data available for this section.';

  const tabs = isWs ? [
    { id: 'ws-messages', label: 'Message History', icon: MessageSquare },
    { id: 'req-headers', label: 'Connection Headers', icon: Server },
  ] : [
    { id: 'req-headers', label: 'Req Headers', icon: Server },
    { id: 'req-body', label: 'Req Body', icon: ArrowUpFromLine },
    { id: 'res-headers', label: 'Res Headers', icon: Server },
    { id: 'res-body', label: 'Res Body', icon: ArrowDownToLine },
    { id: 'waterfall', label: 'Waterfall', icon: Activity },
  ];
  const currentTab = tabs.some(tab => tab.id === activeTab)
    ? activeTab
    : (isWs ? 'ws-messages' : 'res-body');

  return (
    // ✨ Full bleed, IDE-like layout
    <div className="h-screen bg-bg-base text-text-primary flex flex-col w-full overflow-hidden">
      
      {/* 1. Header Area */}
      <div className="flex flex-col shrink-0">
        {/* Nav Bar */}
        <div className="flex items-center px-6 py-3 border-b border-border-subtle bg-bg-panel/40">
          <button 
            onClick={() => router.push('/history')}
            className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} /> History
          </button>
          <div className="ml-auto text-xs text-text-muted font-mono flex items-center gap-2">
            <Clock size={12} /> {new Date(execution.createdAt).toLocaleString()}
          </div>
        </div>

        {/* Overview Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-5 border-b border-border-subtle bg-bg-base">
          <div className="flex items-center gap-4">
            <span className={`font-bold text-lg w-14 text-center ${getMethodColor(execution.method, execution.protocol)}`}>
              {isWs ? 'WS' : execution.method}
            </span>
            <div className="h-8 w-px bg-border-subtle hidden md:block"></div>
            <span className="text-text-primary font-mono text-base break-all flex-1">{execution.url}</span>
          </div>
          
          <div className="flex items-center gap-6 shrink-0 md:pl-6 md:border-l border-border-subtle">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Status</span>
              <span className={`font-mono font-bold text-sm ${getStatusColor(execution.status)}`}>
                {execution.status || 'ERR'} {execution.statusText}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Time</span>
              <span className="font-mono font-bold text-sm text-emerald-500">{execution.timings.total || 0} ms</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Size</span>
              <span className="font-mono font-bold text-sm text-text-primary">
                {execution.responseSize ? (execution.responseSize / 1024).toFixed(2) : 0} KB
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Content Area (Split Pane Feel) */}
      <div className="flex flex-col flex-1 overflow-hidden bg-[#141414]">
        
        {/* Tab Bar */}
        <div className="flex items-center px-4 border-b border-border-subtle bg-bg-panel/20 shrink-0">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                  isActive 
                    ? 'border-brand-purple text-text-primary' 
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-brand-purple' : ''} />
                {tab.label}
              </button>
            );
          })}
          
          {/* Action Buttons */}
          <div className="ml-auto flex items-center">
            {currentTab === 'res-body' && !isWs && <CopyButton textValue={formattedResBody} />}
            {currentTab === 'req-headers' && <CopyButton textValue={JSON.stringify(execution.requestHeaders, null, 2)} />}
          </div>
        </div>

        {/* Scrollable Tab Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {currentTab === 'req-headers' && <HeadersDisplay headers={execution.requestHeaders} emptyMessage={emptyDetailMessage} />}
          {currentTab === 'res-headers' && !isWs && <HeadersDisplay headers={execution.responseHeaders} emptyMessage={emptyDetailMessage} />}
          
          {/* Form-Data / JSON Smart Renderer */}
          {currentTab === 'req-body' && !isWs && <RequestBodyDisplay body={execution.requestBody} emptyMessage={emptyDetailMessage} />}

          {currentTab === 'res-body' && !isWs && (
            formattedResBody ? (
              <SyntaxHighlighter language="json" style={vscDarkPlus} customStyle={{ margin: 0, padding: '1.5rem', background: 'transparent', fontSize: '13px' }}>
                {formattedResBody}
              </SyntaxHighlighter>
            ) : <EmptyState message={emptyDetailMessage} />
          )}

          {currentTab === 'ws-messages' && isWs && <WsMessageTimeline messages={execution.responseBody} />}

          {currentTab === 'waterfall' && !isWs && (
            <div className="p-6 max-w-4xl animate-in fade-in slide-in-from-bottom-2">
              <div className="mb-6 flex items-center justify-between gap-4">
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                  <Activity size={14} className="text-brand-purple" />
                  Timing Waterfall
                </h3>
                <span className="text-[10px] uppercase tracking-widest text-text-muted font-mono">
                  {execution.timings.source === 'live' ? 'Measured breakdown' : execution.timings.source === 'estimated' ? 'Estimated from total time' : 'No timing data'}
                </span>
              </div>

              <div className="bg-bg-panel/20 border border-border-subtle rounded-lg overflow-hidden">
                {/* Timeline Header (Markers) */}
                <div className="flex border-b border-border-subtle bg-bg-panel/40 h-8 items-center text-[10px] text-text-muted font-mono">
                  <div className="w-40 shrink-0 px-4">PHASE</div>
                  <div className="flex-1 relative h-full">
                    <div className="absolute left-0 top-0 bottom-0 border-l border-border-subtle/50" />
                    <div className="absolute left-1/4 top-2 bottom-0 border-l border-border-subtle/20" />
                    <div className="absolute left-2/4 top-2 bottom-0 border-l border-border-subtle/20" />
                    <div className="absolute left-3/4 top-2 bottom-0 border-l border-border-subtle/20" />
                    <div className="flex justify-between px-2 pt-2 w-full">
                      <span>0ms</span>
                      <span>{Math.round(execution.timings.total * 0.5)}ms</span>
                      <span>{execution.timings.total}ms</span>
                    </div>
                  </div>
                </div>

                {/* The Bars */}
                <div className="py-2 divide-y divide-border-subtle/10">
                  <TimingBar 
                    label="DNS Lookup" 
                    value={execution.timings.dnsLookup} 
                    startPercent={0} 
                    widthPercent={(execution.timings.dnsLookup / execution.timings.total) * 100} 
                    colorClass="bg-teal-500/80" 
                  />
                  
                  <TimingBar 
                    label="TCP Connection" 
                    value={execution.timings.tcpConnection} 
                    startPercent={(execution.timings.dnsLookup / execution.timings.total) * 100} 
                    widthPercent={(execution.timings.tcpConnection / execution.timings.total) * 100} 
                    colorClass="bg-amber-500/80" 
                  />
                  
                  <TimingBar 
                    label="TLS Handshake" 
                    value={execution.timings.tlsHandshake} 
                    startPercent={((execution.timings.dnsLookup || 0) + (execution.timings.tcpConnection || 0)) / execution.timings.total * 100} 
                    widthPercent={(execution.timings.tlsHandshake / execution.timings.total) * 100} 
                    colorClass="bg-purple-500/80" 
                  />
                  
                  <TimingBar 
                    label="Waiting (TTFB)" 
                    value={execution.timings.firstByte} 
                    startPercent={((execution.timings.dnsLookup || 0) + (execution.timings.tcpConnection || 0) + (execution.timings.tlsHandshake || 0)) / execution.timings.total * 100} 
                    widthPercent={(execution.timings.firstByte / execution.timings.total) * 100} 
                    colorClass="bg-blue-500/80" 
                  />
                  
                  <TimingBar 
                    label="Content Download" 
                    value={execution.timings.download} 
                    startPercent={((execution.timings.dnsLookup || 0) + (execution.timings.tcpConnection || 0) + (execution.timings.tlsHandshake || 0) + (execution.timings.firstByte || 0)) / execution.timings.total * 100} 
                    widthPercent={(execution.timings.download / execution.timings.total) * 100} 
                    colorClass="bg-emerald-500/80" 
                  />
                </div>

                {/* Total Footer */}
                <div className="bg-bg-panel/40 border-t border-border-subtle px-4 py-2 flex justify-between items-center text-[11px]">
                  <span className="text-text-muted">Total Request Time</span>
                  <span className="font-mono font-bold text-emerald-400">{execution.timings.total} ms</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}