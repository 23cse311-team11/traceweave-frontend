'use client';
import { useAppStore } from '@/store/useAppStore';
import KeyValueTable from './KeyValueTable';

export default function ParamsEditor() {
    const store = useAppStore();
    const activeId = store.activeTabId;
    
    // Fallback to empty array to prevent mapping errors
    const params = store.requestStates[activeId]?.config?.params || [];

    return (
        <div className="flex-1 bg-bg-base p-4 overflow-y-auto custom-scrollbar h-full">
            <h3 className="text-xs font-semibold text-text-secondary mb-3">Query Params</h3>
            
            {/* Pass the exact path array your slice expects */}
            <KeyValueTable listKey={['config', 'params']} data={params} />
            
        </div>
    );
}