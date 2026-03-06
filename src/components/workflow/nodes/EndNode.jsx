'use client';
import { Handle, Position } from '@xyflow/react';
import { Flag, CheckCircle2 } from 'lucide-react';

export default function EndNode({ data }) {
    return (
        <div className={`bg-bg-panel border-2 rounded-full shadow-lg w-16 h-16 flex flex-col items-center justify-center transition-all group relative ${
            data.executionStatus === 'success' ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] bg-emerald-500/10' :
            'border-red-500/50 hover:border-red-500 bg-red-500/10'
        }`}>
            <Handle type="target" position={Position.Left} className="w-3 h-3 bg-red-500 border-2 border-bg-panel" />
            {data.executionStatus === 'success' ? <CheckCircle2 size={18} className="text-emerald-500 mb-1" /> : <Flag size={18} className="text-red-500 mb-1" />}
            <span className={`font-bold text-[10px] uppercase tracking-widest ${data.executionStatus === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>End</span>
        </div>
    );
}