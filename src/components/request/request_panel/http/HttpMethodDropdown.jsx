import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
const METHOD_COLORS = {
  GET: 'text-emerald-500',
  POST: 'text-amber-500',
  PUT: 'text-blue-500',
  DELETE: 'text-red-500',
  PATCH: 'text-violet-500',
};

export default function HttpMethodDropdown({ activeId }) {
  const store = useAppStore();
  const activeReqState = store.requestStates[activeId] || { config: { method: 'GET' } };
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative h-full border-r border-border-subtle">
      <div 
        className="h-full px-3 flex items-center gap-2 cursor-pointer hover:bg-bg-panel transition-colors min-w-[100px]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`text-xs font-bold flex-1 ${METHOD_COLORS[activeReqState.config.method] || 'text-text-primary'}`}>
          {activeReqState.config.method}
        </span>
        <ChevronDown size={12} className="text-text-secondary" />
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-[120px] bg-bg-panel border border-border-strong rounded shadow-xl py-1 z-[70]">
            {METHODS.map(method => (
              <div
                key={method}
                onClick={() => {
                  store.updateActiveRequest('method', method);
                  setIsOpen(false);
                }}
                className={`px-3 py-2 text-xs font-bold cursor-pointer hover:bg-bg-input/50 transition-colors flex items-center justify-between ${METHOD_COLORS[method] || 'text-text-primary'}`}
              >
                <span>{method}</span>
                {activeReqState.config.method === method && <Check size={14} />}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}