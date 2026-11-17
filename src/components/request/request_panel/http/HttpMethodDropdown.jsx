import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
const METHOD_COLORS = {
  GET: 'text-emerald-400',
  POST: 'text-amber-400',
  PUT: 'text-blue-400',
  DELETE: 'text-rose-400',
  PATCH: 'text-violet-400',
};

export default function HttpMethodDropdown({ activeId }) {
  const store = useAppStore();
  const activeReqState = store.requestStates[activeId] || {};
  const currentMethod = activeReqState.config?.method || activeReqState.method || 'GET';
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative h-full border-r border-white/10 shrink-0">
      <button 
        type="button"
        className="h-full px-3 flex items-center gap-2 cursor-pointer hover:bg-white/[0.04] transition-colors min-w-[96px] rounded-l-lg outline-none select-none text-left"
        onClick={() => setIsOpen(!isOpen)}
        title="Change HTTP Method"
      >
        <span className={`text-xs font-bold flex-1 ${METHOD_COLORS[currentMethod] || 'text-zinc-200'}`}>
          {currentMethod}
        </span>
        <ChevronDown size={12} className={`text-zinc-400 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)} />
          <div className="absolute top-[calc(100%+4px)] left-0 w-32 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl p-1 z-[9999] flex flex-col">
            {METHODS.map(method => (
              <button
                type="button"
                key={method}
                onClick={() => {
                  store.updateActiveRequest('method', method, activeId);
                  setIsOpen(false);
                }}
                className={`px-2.5 py-1.5 text-xs font-semibold cursor-pointer hover:bg-white/[0.08] rounded-md transition-colors flex items-center justify-between text-left ${METHOD_COLORS[method] || 'text-zinc-200'}`}
              >
                <span>{method}</span>
                {currentMethod === method && <Check size={13} className="text-white" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}