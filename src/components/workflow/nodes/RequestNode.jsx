'use client';
import { Handle, Position } from '@xyflow/react';
import { Globe, Settings2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function RequestNode({ data }) {
    const { requestStates } = useAppStore();
    const request = data.requestId ? requestStates[data.requestId] : null;
    const reqName = request ? request.name : 'Unconfigured Request';
    const reqMethod = request?.config?.method || data.method || 'GET';
    const reqUrl = request?.config?.url || data.url || (data.requestId ? 'No URL Configured' : 'Select endpoint...');
    return (
        <div className={`bg-bg-panel border rounded-xl shadow-lg min-w-[220px] transition-colors group relative ${data.executionStatus === 'running' ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]' :
            data.executionStatus === 'success' ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                data.executionStatus === 'failed' ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                    'border-border-strong hover:border-brand-blue'
            }`}>
            {/* Input dot */}
            <Handle type="target" position={Position.Left} className="w-3 h-3 bg-border-strong group-hover:bg-brand-blue border-2 border-bg-panel" />

            <div className="p-3 border-b border-border-subtle flex items-center justify-between bg-bg-base/50 rounded-t-xl group-hover:bg-bg-input/50 transition-colors">
                <div className="flex items-center gap-2 overflow-hidden pr-2">
                    <Globe size={14} className="text-brand-blue shrink-0" />
                    <span className="font-bold text-xs text-text-primary truncate" title={reqName}>{reqName}</span>
                </div>
                <Settings2 size={12} className="text-text-muted opacity-0 group-hover:opacity-100 cursor-pointer hover:text-brand-orange transition-all shrink-0" />
            </div>

            <div className="p-3 bg-black/20 flex flex-col gap-1.5 rounded-b-xl">
                <div className="flex items-center gap-2 overflow-hidden">
                    <span className={`text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded uppercase shrink-0 ${reqMethod === 'GET' ? 'bg-emerald-500/10 text-emerald-500' :
                        reqMethod === 'POST' ? 'bg-amber-500/10 text-amber-500' :
                            reqMethod === 'PUT' ? 'bg-blue-500/10 text-blue-500' :
                                reqMethod === 'DELETE' ? 'bg-rose-500/10 text-rose-500' :
                                    'bg-brand-orange/10 text-brand-orange'
                        }`}>
                        {reqMethod}
                    </span>
                    <span className="text-[10px] text-text-secondary truncate font-mono flex-1" title={reqUrl}>
                        {reqUrl}
                    </span>
                </div>
            </div>

            {/* Output dot */}
            <Handle type="source" position={Position.Right} className="w-3 h-3 bg-border-strong group-hover:bg-brand-blue border-2 border-bg-panel" />
        </div>
    );
}