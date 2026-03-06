'use client';
import { Handle, Position } from '@xyflow/react';
import { Terminal, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ScriptNode({ data }) {
    return (
        <div className={`bg-bg-panel border-2 rounded-xl shadow-lg min-w-[220px] transition-all group relative ${
            data.executionStatus === 'running' ? 'border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]' :
            data.executionStatus === 'success' ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
            data.executionStatus === 'failed' ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' :
            'border-border-strong hover:border-cyan-400'
        }`}>
            <Handle type="target" position={Position.Left} className="w-3 h-3 bg-border-strong group-hover:bg-cyan-400 border-2 border-bg-panel" />
            <div className="p-3 border-b border-border-subtle flex items-center justify-between bg-bg-base/50 rounded-t-xl">
                <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-cyan-400" />
                    <span className="font-bold text-xs text-text-primary">Script</span>
                </div>
                <div className="flex items-center gap-2">
                    {data.executionStatus === 'running' && <Loader2 size={14} className="text-cyan-400 animate-spin" />}
                    {data.executionStatus === 'success' && <CheckCircle2 size={14} className="text-emerald-500" />}
                    {data.executionStatus === 'failed' && <AlertCircle size={14} className="text-red-500" />}
                </div>
            </div>
            <div className="p-3">
                <div className="text-[10px] text-cyan-400/70 font-mono bg-bg-input p-2 rounded border border-border-subtle h-[40px] overflow-hidden opacity-80">
                    {data.script || '// write custom JS'}
                </div>
                {data.error && <div className="text-[10px] text-red-400 bg-red-500/10 p-1.5 rounded mt-2 border border-red-500/20">{data.error}</div>}
            </div>
            <Handle type="source" position={Position.Right} className="w-3 h-3 bg-cyan-400 border-2 border-bg-panel" />
        </div>
    );
}