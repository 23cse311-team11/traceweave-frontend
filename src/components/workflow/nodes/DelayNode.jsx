'use client';
import { Handle, Position } from '@xyflow/react';
import { Clock } from 'lucide-react';

export default function DelayNode({ data }) {
    return (
        <div className={`bg-bg-panel border rounded-xl shadow-lg min-w-[150px] transition-colors group relative ${data.executionStatus === 'running' ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]' :
                data.executionStatus === 'success' ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                    data.executionStatus === 'failed' ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                        'border-border-strong hover:border-yellow-500'
            }`}>
            <Handle type="target" position={Position.Left} className="w-3 h-3 bg-border-strong group-hover:bg-yellow-500 border-2 border-bg-panel" />

            <div className="p-3 border-b border-border-subtle flex items-center gap-2 bg-bg-base/50 rounded-t-xl">
                <Clock size={14} className="text-yellow-500" />
                <span className="font-bold text-xs text-text-primary">Delay</span>
            </div>

            <div className="p-3">
                <div className="text-xs text-yellow-500/80 font-mono text-center">
                    {data.delay || 1000} ms
                </div>
            </div>

            <Handle type="source" position={Position.Right} className="w-3 h-3 bg-yellow-500 border-2 border-bg-panel" />
        </div>
    );
}
