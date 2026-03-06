'use client';
import { Handle, Position } from '@xyflow/react';
import { Play, CheckCircle2 } from 'lucide-react';

export default function StartNode({ data }) {
    return (
        <div className={`bg-bg-panel border-2 rounded-xl shadow-lg min-w-[150px] overflow-visible transition-all ${
            data.executionStatus === 'running' ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' :
            data.executionStatus === 'success' ? 'border-emerald-500/50 opacity-80' :
            'border-emerald-500 hover:border-emerald-400'
        }`}>
            <div className="bg-emerald-500/10 p-3 flex items-center justify-center gap-2 rounded-xl">
                {data.executionStatus === 'success' ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Play size={16} className="text-emerald-500 fill-emerald-500" />}
                <span className="font-bold text-sm text-emerald-500">Start</span>
            </div>
            <Handle type="source" position={Position.Right} className="w-3 h-3 bg-emerald-500 border-2 border-bg-panel" />
        </div>
    );
}