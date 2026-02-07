'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export const LandingNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [time, setTime] = useState('');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-[#0A0A0A]/60 backdrop-blur-3xl border-b border-white/10 shadow-lg shadow-black/20' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          
          {/* Left: Logo + Status */}
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Image src="/logo.png" alt="Trace-weave" width={32} height={32} className="brightness-110" />
                <motion.div 
                  className="absolute -inset-2 bg-brand-orange/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={false}
                />
              </motion.div>
              <span className="font-bold text-xl tracking-[-0.02em] text-white font-mono">TRACE–WEAVE</span>
            </Link>
            
            <motion.div 
              className="hidden lg:flex items-center gap-2 text-[10px] font-mono text-white/40 uppercase tracking-wider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div 
                className="w-1.5 h-1.5 bg-green-500 rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span>v1.0.3 • {time}</span>
            </motion.div>
          </div>

          {/* Center: Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {['Platform', 'Solutions', 'Docs', 'Pricing'].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                <Link 
                  href={`#${item.toLowerCase()}`}
                  className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 rounded transition-all duration-200"
                >
                  {item}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Right: CTA */}
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Link 
              href="/login"
              className="hidden sm:block px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              Log in
            </Link>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/login"
                className="relative px-6 py-2.5 bg-brand-orange text-black text-sm font-bold rounded
                            transition-all duration-200 ease-out
                            hover:bg-[#ff7a4d] hover:shadow-[0_8px_30px_rgba(255,108,55,0.35)]
                            active:scale-[0.97]"
                >
                Start Tracing
              </Link>

            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
};