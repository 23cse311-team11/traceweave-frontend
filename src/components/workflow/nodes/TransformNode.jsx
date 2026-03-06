'use client';
import { Handle, Position } from '@xyflow/react';
import { FileJson, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function TransformNode({ data }) {
    return (
        <div className={`bg-bg-panel border-2 rounded-xl shadow-lg min-w-[220px] transition-all group relative ${
            data.executionStatus === 'running' ? 'border-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.4)]' :
            data.executionStatus === 'success' ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
            data.executionStatus === 'failed' ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' :
            'border-border-strong hover:border-blue-400'
        }`}>
            <Handle type="target" position={Position.Left} className="w-3 h-3 bg-border-strong group-hover:bg-blue-400 border-2 border-bg-panel" />

            <div className="p-3 border-b border-border-subtle flex items-center justify-between bg-bg-base/50 rounded-t-xl">
                <div className="flex items-center gap-2">
                    <FileJson size={14} className="text-blue-400" />
                    <span className="font-bold text-xs text-text-primary">Transform</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {data.executionStatus === 'running' && <Loader2 size={14} className="text-blue-400 animate-spin" />}
                    {data.executionStatus === 'success' && <CheckCircle2 size={14} className="text-emerald-500" />}
                    {data.executionStatus === 'failed' && <AlertCircle size={14} className="text-red-500" />}
                </div>
            </div>

            <div className="p-3">
                <div className="text-xs text-text-secondary font-mono bg-bg-input p-2 rounded border border-border-subtle truncate" title={`${data.variable} = ${data.expression}`}>
                    {data.variable ? `${data.variable} = ${data.expression}` : 'variables.x = y'}
                </div>
                {data.error && (
                    <div className="text-[10px] text-red-400 bg-red-500/10 p-1.5 rounded mt-2 border border-red-500/20 leading-tight">
                        {data.error}
                    </div>
                )}
            </div>

            <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-400 border-2 border-bg-panel" />
        </div>
    );
}