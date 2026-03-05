'use client';
import { Handle, Position } from '@xyflow/react';
import { Globe, Settings2 } from 'lucide-react';

export default function RequestNode({ data }) {
    return (
        <div className={`bg-bg-panel border rounded-xl shadow-lg min-w-[220px] transition-colors group relative ${data.executionStatus === 'running' ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]' :
                data.executionStatus === 'success' ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                    data.executionStatus === 'failed' ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                        'border-border-strong hover:border-brand-blue'
            }`}>
            {/* Input dot */}
            <Handle type="target" position={Position.Left} className="w-3 h-3 bg-border-strong group-hover:bg-brand-blue border-2 border-bg-panel" />

            <div className="p-3 border-b border-border-subtle flex items-center justify-between bg-bg-base/50 rounded-t-xl">
                <div className="flex items-center gap-2">
                    <Globe size={14} className="text-brand-blue" />
                    <span className="font-bold text-xs text-text-primary">HTTP Request</span>
                </div>
                <Settings2 size={12} className="text-text-muted opacity-0 group-hover:opacity-100 cursor-pointer hover:text-brand-orange transition-all" />
            </div>

            <div className="p-3 flex items-center gap-2">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${data.method === 'GET' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-brand-orange/10 text-brand-orange'}`}>
                    {data.method || 'GET'}
                </span>
                <span className="text-xs text-text-secondary truncate max-w-[140px] font-mono">
                    {data.url || 'Select endpoint...'}
                </span>
            </div>

            {/* Output dot */}
            <Handle type="source" position={Position.Right} className="w-3 h-3 bg-border-strong group-hover:bg-brand-blue border-2 border-bg-panel" />
        </div>
    );
}