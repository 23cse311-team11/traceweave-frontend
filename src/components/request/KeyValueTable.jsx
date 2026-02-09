'use client';
import { Check, Trash2, Plus } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function KeyValueTable({ listKey, data }) {
    const store = useAppStore();

    // 1. Calculate if all items are currently active
    // We check if data exists AND every item is active.
    const isAllSelected = Array.isArray(data) && data.length > 0 && data.every((item) => item.active);

    const handleAdd = () => {
        const lastIndex = Array.isArray(data) ? data.length : 0;
        store.updateRequestListConfig(listKey, lastIndex, 'key', '');
    };

    // 2. Handle "Select All" toggle
    const handleToggleAll = () => {
        // If currently all selected, we want to deselect all (false).
        // Otherwise (if some or none are selected), we select all (true).
        const newValue = !isAllSelected;

        // Loop through and update every item in the store
        // Note: Ideally your store would have a 'bulkUpdate' action, 
        // but looping here works fine for param lists.
        data.forEach((_, index) => {
            store.updateRequestListConfig(listKey, index, 'active', newValue);
        });
    };

    return (
        <div className="border border-border-subtle rounded overflow-hidden select-none bg-bg-base">
            {/* Header */}
            <div className="grid grid-cols-[30px_1fr_1fr_1fr_30px] bg-bg-input border-b border-border-subtle text-xs font-bold text-text-secondary py-1.5 items-center">

                {/* 3. Header Checkbox (Select All) */}
                <div className="flex justify-center items-center h-full">
                    <div
                        className={`w-3 h-3 border rounded-sm flex items-center justify-center cursor-pointer transition-colors
                     ${isAllSelected ? 'bg-brand-orange border-brand-orange' : 'border-border-strong hover:border-text-secondary'}
                     ${data.length === 0 ? 'opacity-50 pointer-events-none' : ''} 
                   `}
                        onClick={handleToggleAll}
                    >
                        {isAllSelected && <Check size={10} className="text-black" strokeWidth={3} />}
                    </div>
                </div>

                <div className="pl-2 border-l border-border-subtle">KEY</div>
                <div className="pl-2 border-l border-border-subtle">VALUE</div>
                <div className="pl-2 border-l border-border-subtle">DESCRIPTION</div>
                <div></div>
            </div>

            <div className="flex flex-col">
                {(Array.isArray(data) ? data : []).map((item, index) => (
                    <div key={index} className="grid grid-cols-[30px_1fr_1fr_1fr_30px] border-b border-border-subtle text-xs text-text-primary group hover:bg-bg-input/30 transition-colors items-center">

                        {/* Row Active Checkbox */}
                        <div className="flex justify-center items-center h-full">
                            <div
                                className={`w-3 h-3 border rounded-sm flex items-center justify-center cursor-pointer ${item.active ? 'bg-brand-orange border-brand-orange' : 'border-border-strong'}`}
                                onClick={() => store.updateRequestListConfig(listKey, index, 'active', !item.active)}
                            >
                                {item.active && <Check size={10} className="text-black" strokeWidth={3} />}
                            </div>
                        </div>

                        {/* Key Input */}
                        <input
                            type="text"
                            placeholder="Key"
                            value={item.key}
                            onChange={(e) => store.updateRequestListConfig(listKey, index, 'key', e.target.value)}
                            className="bg-transparent px-2 py-1.5 border-l border-border-subtle focus:outline-none placeholder:text-text-muted h-full"
                        />

                        {/* Value Input */}
                        <input
                            type="text"
                            placeholder="Value"
                            value={item.value}
                            onChange={(e) => store.updateRequestListConfig(listKey, index, 'value', e.target.value)}
                            className="bg-transparent px-2 py-1.5 border-l border-border-subtle focus:outline-none placeholder:text-text-muted h-full"
                        />

                        {/* Description Input */}
                        <input
                            type="text"
                            placeholder="Description"
                            value={item.description || ''}
                            onChange={(e) => store.updateRequestListConfig(listKey, index, 'description', e.target.value)}
                            className="bg-transparent px-2 py-1.5 border-l border-border-subtle focus:outline-none placeholder:text-text-muted h-full"
                        />

                        {/* Delete Button */}
                        <div className="flex justify-center items-center h-full opacity-0 group-hover:opacity-100 cursor-pointer text-text-secondary hover:text-red-500 transition-opacity"
                            onClick={() => store.removeRequestListItem(listKey, index)}
                        >
                            <Trash2 size={12} />
                        </div>
                    </div>
                ))}

                {/* Always Visible Add Button Row */}
                <div
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-bg-input/50 transition-colors text-text-secondary hover:text-text-primary"
                >
                    <div className="flex justify-center w-[30px]">
                        <Plus size={14} />
                    </div>
                    <span className="text-xs italic text-text-muted">Add new item...</span>
                </div>
            </div>
        </div>
    );
}