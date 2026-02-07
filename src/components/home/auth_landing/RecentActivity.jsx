import React from 'react';
import Link from 'next/link';

export const RecentActivity = () => {
  const recentTraces = [
    { method: 'POST', url: '/api/v1/payment', code: 200, time: '1m' },
    { method: 'GET', url: '/api/users?id=12', code: 200, time: '4m' },
    { method: 'POST', url: '/api/auth/login', code: 401, time: '12m' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-text-primary">Recent Traces</h3>
        <Link href="/traces" className="text-xs text-brand-orange hover:underline">View All</Link>
      </div>
      <div className="space-y-2">
        {recentTraces.map((trace, i) => (
          <div key={i} className="flex items-center justify-between p-2.5 bg-bg-panel border border-border-subtle rounded-md text-xs font-mono hover:border-text-muted transition-colors cursor-pointer">
             <div className="flex items-center gap-2 overflow-hidden">
               <span className={`font-bold ${trace.method === 'GET' ? 'text-emerald-500' : 'text-amber-500'}`}>{trace.method}</span>
               <span className="truncate text-text-secondary max-w-[120px]">{trace.url}</span>
             </div>
             <div className="flex items-center gap-2">
               <span className={trace.code === 200 ? 'text-emerald-500' : 'text-red-500'}>{trace.code}</span>
               <span className="text-text-muted">{trace.time}</span>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};