'use client';
import { Handle, Position } from '@xyflow/react';
import { Flag } from 'lucide-react';

export default function EndNode({ data }) {
    return (
        <div className={`bg-bg-panel border-2 rounded-full shadow-lg w-16 h-16 flex flex-col items-center justify-center transition-colors group relative ${data.executionStatus === 'running' ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]' :
                data.executionStatus === 'success' ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                    data.executionStatus === 'failed' ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                        'border-red-500/50 hover:border-red-500 bg-red-500/10'
            }`}>
            <Handle type="target" position={Position.Left} className="w-3 h-3 bg-red-500 border-2 border-bg-panel" />

            <Flag size={18} className="text-red-500 mb-1" />
            <span className="font-bold text-[10px] text-red-500 uppercase tracking-widest">End</span>
        </div>
    );
}
