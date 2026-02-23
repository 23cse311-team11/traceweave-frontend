import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';

function ConnectionDot({ connected }) {
  return (
    <span className="relative flex h-2 w-2 shrink-0">
      {connected && (
        <motion.span
          className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
          animate={{ scale: [1, 1.9, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      <span className={`relative inline-flex h-2 w-2 rounded-full ${connected ? 'bg-green-400' : 'bg-neutral-600'}`} />
    </span>
  );
}

export default function StatusBadge({ connected, connectionInfo }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <motion.button
        whileTap={{ scale: 0.97 }}
        className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold rounded border transition-colors ${
          connected ? 'bg-green-500/10 border-green-500/40 text-green-400' : 'bg-red-500/10 border-red-500/40 text-red-400'
        }`}
      >
        <ConnectionDot connected={connected} />
        {connected ? 'Connected' : 'Disconnected'}
      </motion.button>

      <AnimatePresence>
        {show && connectionInfo && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.14 }}
            className="absolute bottom-full right-0 mb-2 w-64 bg-[#1A1A1A] border border-[#333] rounded-lg shadow-2xl z-50 p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-[#222] border border-[#333] flex items-center justify-center">
                <Info size={11} className="text-text-secondary" />
              </div>
              <span className="text-xs font-semibold text-text-primary">Connection details</span>
            </div>
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[11px]">
              <span className="text-text-muted">Connected</span>
              <span className="text-text-primary">{connectionInfo.connectedAt}</span>
              <span className="text-text-muted">Extensions</span>
              <span className="text-text-secondary leading-relaxed">{connectionInfo.extensions}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}