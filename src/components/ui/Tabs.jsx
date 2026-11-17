'use client';
import React from 'react';

export const Tabs = ({ tabs, activeTab, onTabClick }) => {
    return (
        <div className="flex items-center gap-5 text-xs border-b border-white/[0.08] select-none px-1">
            {tabs.map((tab) => (
                <button
                    key={tab}
                    onClick={() => onTabClick(tab)}
                    className={`
                        pb-2.5 pt-1 text-xs font-medium cursor-pointer border-b-2 -mb-px transition-colors
                        ${activeTab === tab
                            ? 'text-zinc-100 border-brand-primary font-semibold'
                            : 'text-zinc-400 border-transparent hover:text-zinc-200 hover:border-zinc-700'
                        }
                    `}
                >
                    {tab}
                </button>
            ))}
        </div>
    );
};