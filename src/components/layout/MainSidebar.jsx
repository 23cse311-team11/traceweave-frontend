'use client';

import { Layout, Clock, Box, Layers, Settings, Activity, LogOut, GitBranch, User } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import logo from '@/assets/traceWeaveLogo.png';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const SIDEBAR_ITEMS = [
  { id: 'Collections', icon: Layout, view: 'runner' },
  { id: 'Monitor', icon: Activity, view: 'runner' },
  { id: 'Environments', icon: Layers, view: 'runner' },
  { id: 'History', icon: Clock, view: 'runner' },
  { id: 'Workflows', icon: GitBranch, view: 'workflow' },
  { id: 'APIs', icon: Box, view: 'runner' },
];

export default function MainSidebar() {
  const router = useRouter();
  const { workspaceId } = useParams();
  const { activeSidebarItem, setActiveSidebarItem, setActiveView } = useAppStore();

  // NEW: State to track which item is hovered and where it is on the screen
  const [hoveredData, setHoveredData] = useState(null);

  const handleClick = (item) => {
    setActiveSidebarItem(item.id);
    setActiveView(item.view);
    router.push(`/workspace/${workspaceId}/${item.id.toLowerCase()}`);
  };

  return (
    <aside className="w-16 h-dvh bg-[#0d0d10] flex flex-col border-r border-white/[0.08] z-30 shrink-0 select-none relative no-scrollbar">
      {/* 1. TOP SECTION - LOGO */}
      <div className="flex flex-col items-center pt-5 pb-2 relative z-10 shrink-0">
        <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
          <Image src={logo} alt="TraceWeave Logo" className="w-8 h-8 rounded-lg border border-white/[0.08]" />
        </motion.div>
      </div>

      {/* 2. MIDDLE SECTION - NAV ITEMS */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-4 flex flex-col items-center gap-1.5 relative z-10">
        {SIDEBAR_ITEMS.map((item) => (
          <SidebarItem
            key={item.id}
            item={item}
            active={activeSidebarItem === item.id}
            onClick={() => handleClick(item)}
            onHover={(rect) => setHoveredData({ label: item.id, rect })}
            onLeave={() => setHoveredData(null)}
          />
        ))}
      </div>

      {/* 3. BOTTOM SECTION */}
      <div className="mt-auto flex flex-col items-center gap-5 pb-6 relative z-10 shrink-0">
        <UserPopup
          onHover={(rect) => setHoveredData({ label: 'Profile', rect })}
          onLeave={() => setHoveredData(null)}
        />

        <div
          className="relative flex justify-center"
          onMouseEnter={(e) => setHoveredData({ label: 'Workspace Settings', rect: e.currentTarget.getBoundingClientRect() })}
          onMouseLeave={() => setHoveredData(null)}
        >
          <button
            onClick={() => {
              setActiveSidebarItem('Settings');
              setActiveView('settings');
              router.push(`/workspace/${workspaceId}/settings`);
            }}
            className={`p-2 rounded-lg transition-colors ${
              activeSidebarItem === 'Settings' 
                ? 'bg-violet-500/15 text-violet-400' 
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
            }`}
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* 4. TOOLTIP */}
      <AnimatePresence>
        {hoveredData && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              top: hoveredData.rect.top + hoveredData.rect.height / 2,
              left: hoveredData.rect.right + 8,
              transform: 'translateY(-50%)'
            }}
            className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-md shadow-xl z-[999] pointer-events-none whitespace-nowrap"
          >
            <p className="text-xs font-medium text-zinc-200">
              {hoveredData.label}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}

const SidebarItem = ({ item, active, onClick, onHover, onLeave }) => {
  const itemRef = useRef(null);

  return (
    <div
      ref={itemRef}
      className="relative w-full flex justify-center px-1.5"
      onMouseEnter={() => onHover(itemRef.current.getBoundingClientRect())}
      onMouseLeave={onLeave}
    >
      <button
        onClick={onClick}
        className={`
          group flex flex-col items-center justify-center py-2 px-1 w-full rounded-lg cursor-pointer transition-colors relative
          ${active 
            ? 'bg-violet-500/10 text-white' 
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]'
          }
        `}
      >
        {active && (
          <motion.div
            layoutId="activeSideIndicator"
            className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-brand-primary rounded-full"
          />
        )}

        <div
          className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
            active
              ? 'bg-violet-500/15 text-brand-primary'
              : 'group-hover:text-zinc-100'
          }`}
        >
          <item.icon
            size={18}
            strokeWidth={active ? 2.25 : 1.75}
          />
        </div>

        <span className={`text-[9px] mt-0.5 font-medium tracking-normal transition-colors ${
          active ? 'text-brand-primary font-semibold' : 'text-zinc-500 group-hover:text-zinc-300'
        }`}>
          {item.id}
        </span>
      </button>
    </div>
  );
};

const UserPopup = ({ onHover, onLeave }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative flex justify-center w-full" ref={popupRef}>
      <button
        onMouseEnter={() => onHover(popupRef.current.getBoundingClientRect())}
        onMouseLeave={onLeave}
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full border border-white/[0.12] bg-zinc-800 flex items-center justify-center text-xs font-medium text-white overflow-hidden hover:border-brand-primary/50 transition-colors"
      >
        {user?.avatarUrl ? (
          <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          user?.fullName?.[0] + (user?.fullName?.split(' ')[1]?.[0] || '') || 'U'
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 8, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-0 left-12 w-52 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-1 z-50 overflow-hidden"
          >
            <div className="px-3.5 py-2.5 border-b border-zinc-800">
              <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Signed in as</p>
              <p className="text-xs font-semibold text-zinc-100 truncate mt-0.5">{user?.fullName || 'User'}</p>
              <p className="text-[11px] text-zinc-400 truncate font-mono mt-0.5">{user?.email}</p>
            </div>
            <div className="p-1 space-y-0.5">
              <Link href="/profile" className="w-full text-left px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-md transition-colors flex items-center gap-2">
                <User size={13} className="text-zinc-400" /> Profile
              </Link>
              <button onClick={logout} className="w-full text-left px-2.5 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-colors flex items-center gap-2">
                <LogOut size={13} /> Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};