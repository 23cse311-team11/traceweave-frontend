'use client';
import { Handle, Position } from '@xyflow/react';
import { Terminal } from 'lucide-react';

export default function ScriptNode({ data }) {
    return (
        <div className={`bg-bg-panel border rounded-xl shadow-lg min-w-[220px] transition-colors group relative ${data.executionStatus === 'running' ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]' :
                data.executionStatus === 'success' ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                    data.executionStatus === 'failed' ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                        'border-border-strong hover:border-cyan-400'
            }`}>
            <Handle type="target" position={Position.Left} className="w-3 h-3 bg-border-strong group-hover:bg-cyan-400 border-2 border-bg-panel" />

            <div className="p-3 border-b border-border-subtle flex items-center gap-2 bg-bg-base/50 rounded-t-xl">
                <Terminal size={14} className="text-cyan-400" />
                <span className="font-bold text-xs text-text-primary">Script</span>
            </div>

            <div className="p-3">
                <div className="text-[10px] text-cyan-400/70 font-mono bg-bg-input p-2 rounded border border-border-subtle h-[40px] overflow-hidden opacity-80 decoration-slice">
                    {data.script || '// write custom JS'}
                </div>
            </div>

            <Handle type="source" position={Position.Right} className="w-3 h-3 bg-cyan-400 border-2 border-bg-panel" />
        </div>
    );
}
