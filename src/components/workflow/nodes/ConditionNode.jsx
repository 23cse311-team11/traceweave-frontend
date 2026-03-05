'use client';
import { Handle, Position } from '@xyflow/react';
import { GitBranch } from 'lucide-react';

export default function ConditionNode({ data }) {
    return (
        <div className={`bg-bg-panel border rounded-xl shadow-lg min-w-[220px] transition-colors group relative ${data.executionStatus === 'running' ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]' :
                data.executionStatus === 'success' ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                    data.executionStatus === 'failed' ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                        'border-border-strong hover:border-purple-500'
            }`}>
            <Handle type="target" position={Position.Left} className="w-3 h-3 bg-border-strong group-hover:bg-purple-500 border-2 border-bg-panel" />

            <div className="p-3 border-b border-border-subtle flex items-center gap-2 bg-bg-base/50 rounded-t-xl">
                <GitBranch size={14} className="text-purple-500" />
                <span className="font-bold text-xs text-text-primary">Condition</span>
            </div>

            <div className="p-3">
                <div className="text-xs text-text-secondary font-mono bg-bg-input p-2 rounded border border-border-subtle truncate" title={data.expression}>
                    {data.expression || 'response.status === 200'}
                </div>
            </div>

            {/* TRUE Handle */}
            <Handle type="source" position={Position.Right} id="true" style={{ top: '35%' }} className="w-3 h-3 bg-emerald-500 border-2 border-bg-panel" />
            <div className="absolute -right-8 top-[27%] text-[9px] font-bold text-emerald-500">TRUE</div>

            {/* FALSE Handle */}
            <Handle type="source" position={Position.Right} id="false" style={{ top: '65%' }} className="w-3 h-3 bg-red-500 border-2 border-bg-panel" />
            <div className="absolute -right-9 top-[57%] text-[9px] font-bold text-red-500">FALSE</div>
        </div>
    );
}