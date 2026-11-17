'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

const Dropdown = ({ 
  icon: Icon, 
  value, 
  options, 
  onSelect, 
  label, 
  onOpen,
  enableSearch = false,
  searchPlaceholder = "Search...",
  customFooter = null,
  menuWidth = "w-56" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const ref = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Clear search when closed
  useEffect(() => {
    if (!isOpen) setSearchQuery('');
  }, [isOpen]);

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState && onOpen) onOpen();
  };

  const filteredOptions = options.filter(opt => {
    if (!enableSearch) return true;
    const optionLabel = typeof opt === 'object' && opt !== null ? opt.label : opt;
    return optionLabel.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="relative" ref={ref}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        className={`
          flex items-center gap-2 px-2.5 py-1 rounded-md cursor-pointer border transition-colors
          ${isOpen 
            ? 'bg-[#18181c] border-brand-primary/50 text-white' 
            : 'bg-white/[0.04] border-white/[0.08] hover:border-white/[0.14] hover:bg-white/[0.06] text-zinc-300 hover:text-white'
          }
        `}
      >
        {Icon && <Icon size={13} className={isOpen ? "text-brand-primary" : "text-zinc-400"} />}
        <span className="text-xs font-medium max-w-[120px] truncate">
          {value || 'Select...'}
        </span>
        <ChevronDown 
          size={12} 
          className={`text-zinc-500 transition-transform duration-150 ${isOpen ? 'rotate-180 text-brand-primary' : ''}`} 
        />
      </button>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`
          absolute top-full left-0 mt-1.5 ${menuWidth} z-[100]
          bg-[#121215] border border-white/[0.1] rounded-lg shadow-2xl overflow-hidden
          animate-in fade-in zoom-in-95 duration-150 origin-top-left
          flex flex-col
        `}>
          {/* Header Label */}
          {label && (
            <div className="px-3 py-1.5 text-[10px] font-medium text-zinc-500 uppercase tracking-wider border-b border-white/[0.06] shrink-0">
              {label}
            </div>
          )}

          {/* Search Section */}
          {enableSearch && (
            <div className="p-1.5 border-b border-white/[0.06] shrink-0">
              <div className="relative flex items-center">
                <Search size={12} className="absolute left-2.5 text-zinc-500" />
                <input
                  type="text"
                  autoFocus
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#18181c] text-xs text-white rounded-md py-1.5 pl-7 pr-2 border border-white/[0.08] focus:border-brand-primary/50 focus:outline-none transition-colors placeholder:text-zinc-500"
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-64 overflow-y-auto custom-scrollbar p-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-6 text-xs text-zinc-500 italic text-center">
                No results found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isObject = typeof opt === 'object' && opt !== null;
                const optionLabel = isObject ? opt.label : opt;
                const optionValue = isObject ? opt.value : opt;
                const isSelected = value === optionLabel;

                return (
                  <div
                    key={optionValue} 
                    onClick={() => { onSelect(opt); setIsOpen(false); }}
                    className={`
                      px-2.5 py-1.5 text-xs cursor-pointer flex items-center justify-between rounded-md transition-colors mb-0.5 last:mb-0
                      ${isSelected ? 'bg-violet-500/15 text-violet-300 font-medium' : 'text-zinc-300 hover:bg-white/[0.06] hover:text-white'}
                    `}
                  >
                    <span className="truncate pr-2">
                      {optionLabel}
                    </span>
                    
                    {isSelected && (
                      <Check size={13} className="text-brand-primary shrink-0" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {customFooter && (
            <div className="border-t border-white/[0.06] p-1 shrink-0 bg-white/[0.02]">
              <div onClick={() => setIsOpen(false)}>
                {customFooter}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dropdown;