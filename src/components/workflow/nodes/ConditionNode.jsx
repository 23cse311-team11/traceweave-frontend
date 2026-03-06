'use client';
import { Handle, Position } from '@xyflow/react';
import { GitBranch, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ConditionNode({ data }) {
    return (
        <div className={`bg-bg-panel border-2 rounded-xl shadow-lg min-w-[220px] transition-all group relative ${
            data.executionStatus === 'running' ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]' :
            data.executionStatus === 'success' ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
            data.executionStatus === 'failed' ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' :
            'border-border-strong hover:border-purple-500'
        }`}>
            <Handle type="target" position={Position.Left} className="w-3 h-3 bg-border-strong group-hover:bg-purple-500 border-2 border-bg-panel" />

            <div className="p-3 border-b border-border-subtle flex items-center justify-between bg-bg-base/50 rounded-t-xl">
                <div className="flex items-center gap-2">
                    <GitBranch size={14} className="text-purple-500" />
                    <span className="font-bold text-xs text-text-primary">Condition</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {data.executionStatus === 'running' && <Loader2 size={14} className="text-purple-500 animate-spin" />}
                    {data.executionStatus === 'success' && <CheckCircle2 size={14} className="text-emerald-500" />}
                    {data.executionStatus === 'failed' && <AlertCircle size={14} className="text-red-500" />}
                </div>
            </div>

            <div className="p-3">
                <div className="text-xs text-text-secondary font-mono bg-bg-input p-2 rounded border border-border-subtle truncate" title={data.expression}>
                    {data.expression || 'response.status === 200'}
                </div>
                {data.error && (
                    <div className="text-[10px] text-red-400 bg-red-500/10 p-1.5 rounded mt-2 border border-red-500/20 leading-tight">
                        {data.error}
                    </div>
                )}
            </div>

            <Handle type="source" position={Position.Right} id="true" style={{ top: '35%' }} className="w-3 h-3 bg-emerald-500 border-2 border-bg-panel" />
            <div className="absolute -right-8 top-[27%] text-[9px] font-bold text-emerald-500">TRUE</div>

            <Handle type="source" position={Position.Right} id="false" style={{ top: '65%' }} className="w-3 h-3 bg-red-500 border-2 border-bg-panel" />
            <div className="absolute -right-9 top-[57%] text-[9px] font-bold text-red-500">FALSE</div>
        </div>
    );
}