'use client';

import React from 'react';
import { Plus, Download, Terminal } from 'lucide-react';

export const QuickActions = () => {
  return (
    <div className="bg-bg-panel border border-border-subtle rounded-lg p-5">
      <h3 className="text-sm font-bold text-text-primary mb-4">Start Building</h3>
      <div className="space-y-2">
        <button className="w-full flex items-center gap-3 p-2.5 rounded-md hover:bg-white/5 text-left text-sm text-text-secondary hover:text-text-primary transition-colors border border-transparent hover:border-border-subtle">
          <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center text-blue-500"><Plus size={16} /></div>
          <div>
            <p className="font-medium">New HTTP Request</p>
            <p className="text-xs text-text-muted">Test an endpoint instantly</p>
          </div>
        </button>
        <button className="w-full flex items-center gap-3 p-2.5 rounded-md hover:bg-white/5 text-left text-sm text-text-secondary hover:text-text-primary transition-colors border border-transparent hover:border-border-subtle">
          <div className="w-8 h-8 rounded bg-purple-500/10 flex items-center justify-center text-purple-500"><Download size={16} /></div>
          <div>
            <p className="font-medium">Import cURL</p>
            <p className="text-xs text-text-muted">Paste raw command</p>
          </div>
        </button>
        <button className="w-full flex items-center gap-3 p-2.5 rounded-md hover:bg-white/5 text-left text-sm text-text-secondary hover:text-text-primary transition-colors border border-transparent hover:border-border-subtle">
          <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-500"><Terminal size={16} /></div>
          <div>
            <p className="font-medium">CLI Setup</p>
            <p className="text-xs text-text-muted">Configure local proxy</p>
          </div>
        </button>
      </div>
    </div>
  );
};