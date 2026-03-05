'use client';
import { Handle, Position } from '@xyflow/react';
import { Play } from 'lucide-react';

export default function StartNode({ data }) {
    return (
        <div className={`bg-bg-panel border rounded-xl shadow-lg min-w-[150px] overflow-visible ${data.executionStatus === 'running' ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]' :
                data.executionStatus === 'success' ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                    data.executionStatus === 'failed' ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                        'border-emerald-500/50 hover:border-emerald-500'
            }`}>
            <div className="bg-emerald-500/10 p-3 flex items-center justify-center gap-2 rounded-xl">
                <Play size={16} className="text-emerald-500 fill-emerald-500" />
                <span className="font-bold text-sm text-text-primary">Start</span>
            </div>
            {/* The output dot */}
            <Handle
                type="source"
                position={Position.Right}
                className="w-3 h-3 bg-emerald-500 border-2 border-bg-panel"
            />
        </div>
    );
}