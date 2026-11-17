'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Send, CheckCircle, AlertTriangle, XCircle, Info, Clock, Database, Network
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import Editor from '@monaco-editor/react';
import WaterfallTooltip from './response_panel/WaterfallTooltip';
import BodyToolbar from './response_panel/BodyToolbar';
import TooltipContainer from './response_panel/TooltipContainer';

// --- SUB-COMPONENTS (Defined outside to prevent re-initialization on every render) ---

const HTTP_STATUS_INFO = {
  // 1xx Informational
  100: { text: 'Continue', desc: 'The server received request headers; client should proceed to send the body.' },
  101: { text: 'Switching Protocols', desc: 'The server agrees to switch protocols as requested by the client.' },
  102: { text: 'Processing', desc: 'The server has received and is processing the request, but no response is available yet.' },
  103: { text: 'Early Hints', desc: 'Used to return some response headers before final HTTP message.' },

  // 2xx Success
  200: { text: 'OK', desc: 'The request succeeded.' },
  201: { text: 'Created', desc: 'The request succeeded, and a new resource was created.' },
  202: { text: 'Accepted', desc: 'The request has been received but not yet acted upon.' },
  203: { text: 'Non-Authoritative Information', desc: 'The returned meta-information is from a local or third-party copy.' },
  204: { text: 'No Content', desc: 'The server successfully processed the request and is not returning any content.' },
  205: { text: 'Reset Content', desc: 'The server successfully processed the request, but is not returning any content; requires requester to reset document view.' },
  206: { text: 'Partial Content', desc: 'The server is delivering only part of the resource due to a Range header sent by the client.' },
  207: { text: 'Multi-Status', desc: 'Conveys information about multiple resources in situations where multiple status codes might be appropriate.' },
  208: { text: 'Already Reported', desc: 'Used inside a DAV: propstat response element to avoid repeatedly enumerating internal members of multiple bindings.' },
  226: { text: 'IM Used', desc: 'The server has fulfilled a GET request for the resource, and the response is an instance-manipulation.' },

  // 3xx Redirection
  300: { text: 'Multiple Choices', desc: 'The request has more than one possible response.' },
  301: { text: 'Moved Permanently', desc: 'The URL of the requested resource has been changed permanently.' },
  302: { text: 'Found', desc: 'The URI of the requested resource has been changed temporarily.' },
  303: { text: 'See Other', desc: 'The response can be found under another URI using the GET method.' },
  304: { text: 'Not Modified', desc: 'The resource has not been modified since the last request.' },
  305: { text: 'Use Proxy', desc: 'The requested resource must be accessed through a proxy.' },
  307: { text: 'Temporary Redirect', desc: 'The request should be repeated with another URI; future requests should still use the original URI.' },
  308: { text: 'Permanent Redirect', desc: 'The request and all future requests should be repeated using another URI.' },

  // 4xx Client Errors
  400: { text: 'Bad Request', desc: 'The server could not understand the request due to invalid syntax.' },
  401: { text: 'Unauthorized', desc: 'Authentication is required to access the requested resource.' },
  402: { text: 'Payment Required', desc: 'Reserved for future use.' },
  403: { text: 'Forbidden', desc: 'The client does not have access rights to the content.' },
  404: { text: 'Not Found', desc: 'The server cannot find the requested resource.' },
  405: { text: 'Method Not Allowed', desc: 'The request method is known by the server but not supported by the resource.' },
  406: { text: 'Not Acceptable', desc: 'The server cannot produce a response matching the list of acceptable values defined in request headers.' },
  407: { text: 'Proxy Authentication Required', desc: 'The client must first authenticate itself with the proxy.' },
  408: { text: 'Request Timeout', desc: 'The server timed out waiting for the request.' },
  409: { text: 'Conflict', desc: 'The request conflicts with the current state of the server.' },
  410: { text: 'Gone', desc: 'The target resource has been permanently deleted.' },
  411: { text: 'Length Required', desc: 'The server refuses to accept the request without a defined Content-Length.' },
  412: { text: 'Precondition Failed', desc: 'One or more conditions given in the request header fields evaluated to false.' },
  413: { text: 'Payload Too Large', desc: 'Request entity is larger than limits defined by server.' },
  414: { text: 'URI Too Long', desc: 'The URI requested by the client is longer than the server is willing to interpret.' },
  415: { text: 'Unsupported Media Type', desc: 'The media format of the requested data is not supported by the server.' },
  416: { text: 'Range Not Satisfiable', desc: 'The client has asked for a portion of the file that cannot be provided.' },
  417: { text: 'Expectation Failed', desc: 'The expectation given in the Expect request-header could not be met.' },
  418: { text: "I'm a teapot", desc: 'The server refuses the attempt to brew coffee with a teapot.' },
  421: { text: 'Misdirected Request', desc: 'The request was directed at a server that is not able to produce a response.' },
  422: { text: 'Unprocessable Entity', desc: 'The request was well-formed but unable to be followed due to semantic errors.' },
  423: { text: 'Locked', desc: 'The resource that is being accessed is locked.' },
  424: { text: 'Failed Dependency', desc: 'The request failed because it depended on another request that failed.' },
  425: { text: 'Too Early', desc: 'The server is unwilling to risk processing a request that might be replayed.' },
  426: { text: 'Upgrade Required', desc: 'The server refuses to perform the request using the current protocol.' },
  428: { text: 'Precondition Required', desc: 'The origin server requires the request to be conditional.' },
  429: { text: 'Too Many Requests', desc: 'The client has sent too many requests in a given amount of time.' },
  431: { text: 'Request Header Fields Too Large', desc: 'The server is unwilling to process the request because header fields are too large.' },
  451: { text: 'Unavailable For Legal Reasons', desc: 'The user agent requested a resource that cannot lawfully be provided.' },

  // 5xx Server Errors
  500: { text: 'Internal Server Error', desc: 'The server encountered an unexpected condition that prevented it from fulfilling the request.' },
  501: { text: 'Not Implemented', desc: 'The server does not support the functionality required to fulfill the request.' },
  502: { text: 'Bad Gateway', desc: 'The server received an invalid response from the upstream server.' },
  503: { text: 'Service Unavailable', desc: 'The server is currently unable to handle the request due to temporary overloading or maintenance.' },
  504: { text: 'Gateway Timeout', desc: 'The server did not get a timely response from the upstream server.' },
  505: { text: 'HTTP Version Not Supported', desc: 'The server does not support the HTTP protocol version used in the request.' },
  506: { text: 'Variant Also Negotiates', desc: 'Transparent content negotiation for the request results in a circular reference.' },
  507: { text: 'Insufficient Storage', desc: 'The server is unable to store the representation needed to complete the request.' },
  508: { text: 'Loop Detected', desc: 'The server detected an infinite loop while processing the request.' },
  510: { text: 'Not Extended', desc: 'Further extensions to the request are required for the server to fulfill it.' },
  511: { text: 'Network Authentication Required', desc: 'The client needs to authenticate to gain network access.' },

  0: { text: 'Network Error', desc: 'Could not connect to the server. Check your network connection, DNS, or CORS policy.' }
};

const StatusBadge = ({ response }) => {
  if (!response) return null;

  let status = 0;
  let statusText = 'Unknown';
  let description = 'Unknown status code.';

  if (response.isWorkflow) {
    status = response.status === 'COMPLETED' ? 200 : 500;
    statusText = response.status; // e.g., "COMPLETED" or "FAILED"
    description = response.status === 'COMPLETED' 
      ? 'All workflow steps executed successfully.' 
      : 'One or more workflow steps failed during execution.';
  } else {
    status = typeof response.status === 'number' ? response.status : (parseInt(response.status, 10) || 0);
    const info = HTTP_STATUS_INFO[status];

    // Protect against non-200 responses erroneously having statusText: "OK"
    const isMismatchedOk = status !== 200 && typeof response.statusText === 'string' && response.statusText.trim().toLowerCase() === 'ok';
    
    if (isMismatchedOk || !response.statusText) {
      statusText = info?.text || (status === 0 ? 'Network Error' : 'Unknown');
    } else {
      statusText = response.statusText;
    }

    if (status === 0 && (response.data?.error || response.error)) {
      description = response.data?.error || response.error;
    } else {
      description = info?.desc || 'No detailed description available for this status code.';
    }
  }

  const displayText = status === 0
    ? (statusText && statusText !== 'Unknown' ? statusText : 'Network Error')
    : `${status} ${statusText}`.trim();

  // Color and Icon mapping logic
  let color = 'text-emerald-400';
  let bgColor = 'bg-emerald-500/10';
  let borderColor = 'hover:border-emerald-500/20';
  let Icon = CheckCircle;

  if (status >= 100 && status < 300) {
    color = 'text-emerald-400';
    bgColor = 'bg-emerald-500/10';
    borderColor = 'hover:border-emerald-500/20';
    Icon = CheckCircle;
  } else if (status >= 300 && status < 400) {
    color = 'text-blue-400';
    bgColor = 'bg-blue-500/10';
    borderColor = 'hover:border-blue-500/20';
    Icon = Info;
  } else if (status >= 400 && status < 500) {
    color = 'text-amber-400';
    bgColor = 'bg-amber-500/10';
    borderColor = 'hover:border-amber-500/20';
    Icon = AlertTriangle;
  } else if (status >= 500 || status === 0) { // Catch 5xx and 0 (Network Error)
    color = 'text-rose-400';
    bgColor = 'bg-rose-500/10';
    borderColor = 'hover:border-rose-500/20';
    Icon = XCircle;
  }

  return (
    <div className="relative group">
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md cursor-help transition-all ${bgColor} border border-transparent ${borderColor}`}
      >
        <Icon size={13} className={color} />
        <span className={`font-semibold ${color} text-xs tracking-wide whitespace-nowrap`}>
          {displayText}
        </span>
      </motion.div>

      {/* Tooltip implementation using existing wrapper */}
      <div className="hidden group-hover:block">
        <TooltipContainer width="w-72">
          <div className={`flex items-center gap-2 mb-2 pb-2 border-b border-white/10 ${color}`}>
            <Icon size={14} />
            <span className="font-bold text-xs tracking-wide">{displayText}</span>
          </div>
          <div className="text-xs text-zinc-400 leading-relaxed">
            {description}
          </div>
          {status === 0 && (
            <div className="mt-2.5 p-1.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] tracking-wide text-center">
              {response.data?.error ? `Cause: ${response.data.error}` : 'Check target URL, network connection, DNS, or CORS policy'}
            </div>
          )}
        </TooltipContainer>
      </div>
    </div>
  );
};

const TimeBadge = ({ response, metrics }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  if (!response) return null;

  const duration = response.isWorkflow ? response.totalDuration : response.time;
  const isLive = metrics?.source === 'Live';

  return (
    <div
      className="relative"
      onMouseEnter={() => !response.isWorkflow && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-all bg-[#1A1A1A] hover:bg-[#252525] group/time"
      >
        <Clock size={14} className={isLive ? "text-green-500" : "text-[#999]"} />
        <span className="text-xs font-mono text-[#EDEDED]">{duration || 0} ms</span>

        {!response.isWorkflow && (
          <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-yellow-500/50'}`} />
        )}
      </motion.div>

      <AnimatePresence>
        {showTooltip && metrics && (
          <div className="absolute top-full right-0 mt-2 z-[100] min-w-[260px] pointer-events-none">
            <WaterfallTooltip metrics={metrics} />
            <div className="mt-1.5 px-3 py-1 bg-[#0A0A0A] border border-[#252525] rounded shadow-xl text-[9px] text-right text-[#666] uppercase tracking-widest backdrop-blur-md">
              Source: <span className={isLive ? "text-green-500 font-bold" : "text-yellow-500"}>{metrics.source}</span> Data
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SizeBadge = ({ metrics }) => {
  if (!metrics) return null;
  
  // Safety check to ensure numbers
  const bodySize = Number(metrics.size?.body) || 0;
  const headerSize = Number(metrics.size?.headers) || 0;
  const totalSizeKB = (bodySize + headerSize) / 1024;

  return (
    <div className="relative group">
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-all bg-[#1A1A1A] hover:bg-[#252525]"
      >
        <Database size={14} className="text-[#999]" />
        <span className="text-xs font-mono text-[#EDEDED]">{totalSizeKB.toFixed(2)} KB</span>
      </motion.div>

      <div className="hidden group-hover:block">
        <TooltipContainer width="w-56">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#1F1F1F]">
            <span className="font-semibold text-xs text-[#EDEDED] tracking-wide uppercase">RESPONSE SIZE</span>
            <span className="text-xs font-mono font-bold text-[var(--brand-primary)]">{totalSizeKB.toFixed(2)} KB</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#999]">Headers</span>
              <span className="font-mono text-[#EDEDED]">{headerSize} B</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#999]">Body</span>
              <span className="font-mono text-[#EDEDED]">{(bodySize / 1024).toFixed(2)} KB</span>
            </div>
          </div>
        </TooltipContainer>
      </div>
    </div>
  );
};

const NetworkBadge = ({ metrics }) => {
  if (!metrics || !metrics.network) return null;
  return (
    <div className="relative group">
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="p-1.5 rounded-md cursor-pointer transition-all bg-[#1A1A1A] hover:bg-[#252525]"
      >
        <Network size={14} className="text-[#999]" />
      </motion.div>

      <div className="hidden group-hover:block">
        <TooltipContainer width="w-72">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#1F1F1F]">
            <Network size={14} className="text-[var(--brand-primary)]" />
            <span className="font-semibold text-xs text-[#EDEDED] tracking-wide uppercase">NETWORK INFO</span>
          </div>
          <div className="space-y-2.5">
            <div className="grid grid-cols-[100px_1fr] gap-2 text-xs">
              <span className="text-[#666]">Protocol</span>
              <span className="text-[#EDEDED] font-mono">{(metrics.network.proto || 'HTTP').toUpperCase()}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2 text-xs">
              <span className="text-[#666]">Remote</span>
              <span className="text-[#EDEDED] font-mono text-[10px]">{metrics.network.remote || 'Unknown'}</span>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2 text-xs">
              <span className="text-[#666]">Local</span>
              <span className="text-[#EDEDED] font-mono">{metrics.network.local || 'Unknown'}</span>
            </div>
          </div>
        </TooltipContainer>
      </div>
    </div>
  );
};

const WorkflowReport = ({ report }) => {
  if (!report) return null;
  return (
    <div className="h-full overflow-auto custom-scrollbar p-6 bg-[#050505]">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between p-4 rounded-lg bg-[#0A0A0A] border border-[#1A1A1A]">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${report.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              {report.status === 'COMPLETED' ? <CheckCircle size={24} /> : <XCircle size={24} />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#EDEDED]">Workflow {report.status}</h3>
              <p suppressHydrationWarning className="text-xs text-[#666]">
                Executed {report.startTime ? new Date(report.startTime).toLocaleString() : 'Just now'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-mono text-[var(--brand-primary)] font-bold">{report.totalDuration}ms</div>
            <div className="text-[10px] text-[#666] uppercase tracking-widest">Total Duration</div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#444] font-bold mb-4">Execution Steps ({report.steps?.length || 0})</h4>
          {report.steps?.map((step, idx) => (
            <motion.div
              key={step.stepId || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group flex flex-col p-4 rounded-lg bg-[#0A0A0A] border border-[#1A1A1A] hover:border-[#333] transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded bg-[#1A1A1A] flex items-center justify-center text-[10px] text-[#666] font-mono">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-[#EDEDED]">{step.requestName || 'Unknown Request'}</div>
                    <div className="text-[10px] text-[#444] font-mono">{step.requestId}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`text-xs font-bold ${step.success ? 'text-green-500' : 'text-red-500'}`}>
                      {step.status} {step.success ? 'OK' : 'FAIL'}
                    </div>
                    <div className="flex items-center justify-end gap-1.5 mt-0.5">
                      <span className="text-[10px] text-[#666] font-mono">{step.executionTime}ms</span>
                    </div>
                  </div>
                  {step.success ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-red-500" />}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

export default function ResponsePane({ height }) {
  const { response, isLoading, error } = useAppStore();
  const [activeTab, setActiveTab] = useState('Body');
  const [isWrapped, setIsWrapped] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const editorRef = useRef(null);

  useEffect(() => {
    if (response?.isWorkflow && activeTab !== 'Workflow') {
      setActiveTab('Workflow');
    } else if (!response?.isWorkflow && activeTab === 'Workflow') {
      setActiveTab('Body');
    }
  }, [response, activeTab]);

  const metrics = useMemo(() => {
    if (!response || response.isWorkflow) return null;
    const timings = response.timings || {};
    const total = response.time || timings.total || 0;
    const headersSize = response.headers ? JSON.stringify(response.headers).length : 0;

    return {
      total: total,
      dns: timings.dnsLookup !== undefined ? timings.dnsLookup : Math.ceil(total * 0.10),
      tcp: timings.tcpConnection !== undefined ? timings.tcpConnection : Math.ceil(total * 0.05),
      tls: timings.tlsHandshake || 0,
      ttfb: timings.firstByte !== undefined ? timings.firstByte : Math.ceil(total * 0.60),
      download: timings.download !== undefined ? timings.download : Math.ceil(total * 0.25),
      size: {
        body: response.size || (response.data ? JSON.stringify(response.data).length : 0),
        headers: headersSize
      },
      network: {
        remote: response.remoteIp || '127.0.0.1:443',
        local: '::1',
        proto: (response.protocol || 'http/1.1').toUpperCase()
      },
      source: response.timings ? 'Live' : 'Estimated'
    };
  }, [response]);

  const handleCopyBody = async () => {
    const bodyText = response.isWorkflow ? JSON.stringify(response, null, 2) : JSON.stringify(response.data, null, 2);
    await navigator.clipboard.writeText(bodyText);
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (editorRef.current && term) {
      editorRef.current.trigger('response-pane', 'actions.find');
    }
  };

  const tabs = response?.isWorkflow
    ? ['Workflow', 'Body']
    : ['Body', 'Cookies', 'Headers', 'Test Results'];

  return (
    <div style={{ height }} className="border-t border-[#1A1A1A] bg-[#050505] flex flex-col shrink-0 min-h-[50px]">
      <div className="flex items-center justify-between px-4 bg-[#0A0A0A] border-b border-[#1A1A1A] shrink-0 h-11">
        <div className="flex items-center h-full gap-6 overflow-x-auto no-scrollbar">
          {tabs.map(tab => {
            const count = tab === 'Headers' ? Object.keys(response?.headers || {}).length
              : tab === 'Cookies' ? Object.keys(response?.cookies || {}).length
                : 0;
            return (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                whileHover={{ y: -1 }}
                className={`relative h-full text-xs font-semibold transition-all flex items-center gap-2 tracking-wide whitespace-nowrap ${activeTab === tab ? 'text-[var(--brand-primary)]' : 'text-[#999] hover:text-[#EDEDED]'}`}
              >
                {tab}
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${activeTab === tab ? 'bg-[var(--brand-primary)]/20 text-[var(--brand-primary)]' : 'bg-[#1A1A1A] text-[#666]'}`}>
                    {count}
                  </span>
                )}
                {activeTab === tab && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--brand-primary)]" />
                )}
              </motion.button>
            )
          })}
        </div>

        {response && !isLoading && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 shrink-0 ml-4">
            <StatusBadge response={response} />
            <TimeBadge response={response} metrics={metrics} />
            <SizeBadge metrics={metrics} />
            <NetworkBadge metrics={metrics} />
          </motion.div>
        )}
      </div>

      {activeTab === 'Body' && response && !isLoading && (
        <BodyToolbar
          onWrapToggle={() => setIsWrapped(!isWrapped)}
          onSearch={handleSearch}
          onFilter={() => console.log('Filter clicked')}
          onCopy={handleCopyBody}
          onCopyLink={handleCopyLink}
          isWrapped={isWrapped}
        />
      )}

      <div className="flex-1 overflow-hidden relative bg-[#050505]">
        <AnimatePresence>
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505]/90 z-20 backdrop-blur-sm">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <Loader2 className="text-[var(--brand-primary)]" size={36} />
              </motion.div>
              <span className="text-xs text-[#999] font-semibold tracking-widest mt-4">
                {response?.isWorkflow ? "EXECUTING WORKFLOW..." : "SENDING REQUEST..."}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {!response && !isLoading && !error && (
          <div className="flex-1 h-full flex flex-col items-center justify-center text-[#666]">
            <Send size={72} strokeWidth={0.5} className="mb-6 opacity-20" />
            <span className="text-sm font-medium">Enter a URL and hit Send to get a response</span>
          </div>
        )}

        {error && !isLoading && (
          <div className="flex-1 h-full flex items-center justify-center p-8">
            <div className="flex flex-col items-center gap-4 max-w-md text-center">
              <AlertTriangle size={48} className="text-red-500/50" />
              <div>
                <div className="font-bold text-red-400 mb-1">Request Failed</div>
                <div className="text-sm text-[#666]">{error}</div>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {response && !isLoading && (
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="h-full w-full">
              {activeTab === 'Workflow' && response.isWorkflow && <WorkflowReport report={response} />}
              {activeTab === 'Body' && (
                <Editor
                  height="100%"
                  defaultLanguage="json"
                  value={response.isWorkflow ? JSON.stringify(response, null, 2) : (typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2))}
                  theme="vs-dark"
                  onMount={(editor) => { editorRef.current = editor; }}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 13,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    fontFamily: 'JetBrains Mono, monospace',
                    wordWrap: isWrapped ? 'on' : 'off',
                    padding: { top: 16, bottom: 16 },
                  }}
                />
              )}
              {activeTab === 'Cookies' && (
                <div className="h-full overflow-auto p-4">
                  {Object.keys(response.cookies || {}).length > 0 ? (
                    <div className="space-y-2">
                        {Object.entries(response.cookies).map(([key, val]) => (
                            <div key={key} className="bg-[#111] border border-[#222] rounded p-3 text-xs flex flex-col gap-1">
                                <span className="font-bold text-[#EDEDED] font-mono">{key}</span>
                                <span className="text-[#888] font-mono break-all">{val}</span>
                            </div>
                        ))}
                    </div>
                  ) : <div className="text-center text-[#444] mt-10">No cookies were returned by the server.</div>}
                </div>
              )}
              {activeTab === 'Headers' && (
                <div className="h-full overflow-auto p-6">
                  {Object.entries(response.headers || {}).map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[200px_1fr] gap-4 py-2 border-b border-[#1A1A1A]">
                      <div className="text-xs font-bold text-[#EDEDED] font-mono">{k}</div>
                      <div className="text-xs text-[#666] font-mono break-all">
                        {Array.isArray(v) ? v.join('; ') : v}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
