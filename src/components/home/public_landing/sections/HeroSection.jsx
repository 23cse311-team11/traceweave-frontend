'use client';

import { useState, useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';
import { Play, Github, Terminal, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { VideoModal } from '../VideoModal';

export const HeroSection = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 20 - 10,
        y: (e.clientY / window.innerHeight) * 20 - 10
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const springConfig = { stiffness: 150, damping: 15 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  useEffect(() => {
    x.set(mousePosition.x);
    y.set(mousePosition.y);
  }, [mousePosition, x, y]);

  return (
    <section className="relative pt-32 pb-24 overflow-hidden min-h-[95vh] flex items-center">
      
      {/* Asymmetric glow with motion */}
      <motion.div 
        className="absolute top-[10%] right-[15%] w-[600px] h-[600px] bg-brand-orange/10 rounded-full blur-[120px] pointer-events-none"
        style={{ x, y }}
      />
      <motion.div 
        className="absolute bottom-[20%] left-[5%] w-[500px] h-[500px] bg-brand-blue/8 rounded-full blur-[100px] pointer-events-none"
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      
      <div className="max-w-[1600px] mx-auto px-8 relative z-10">
        
        {/* Headline + Subtext */}
        <div className="max-w-5xl mb-16">
          
          {/* Label */}
          <motion.div 
            className="flex items-center gap-4 mb-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="h-px w-12 bg-brand-orange"
              initial={{ width: 0 }}
              animate={{ width: 48 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            />
            <div className="px-3 py-1 border border-brand-orange/30 rounded text-[10px] font-mono text-brand-orange uppercase tracking-widest">
              Public Beta
            </div>
          </motion.div>
          
          {/* Main headline */}
          <motion.h1 
            className="text-[clamp(2.5rem,6vw,5rem)] font-black tracking-[-0.04em] leading-[0.95] text-white mb-6 font-mono"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            DEBUG APIs<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white/30 to-white/10">IN REAL</span>{' '}
            <span className="relative inline-block">
              TIME
              <motion.div 
                className="absolute -bottom-2 left-0 right-0 h-1 bg-brand-orange"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 1, duration: 0.8 }}
              />
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-lg text-white/50 leading-relaxed max-w-2xl font-light tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Enterprise-grade distributed tracing for microservices.{' '}
            <span className="text-white/70">Capture every request, replay failures, automate testing scenarios.</span>{' '}
            Zero instrumentation required.
          </motion.p>

          {/* CTA Row */}
          <motion.div 
            className="flex flex-wrap items-center gap-6 mt-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                href="/login"
                className="group relative px-8 py-4 bg-brand-orange text-black font-bold text-base rounded overflow-hidden flex items-center gap-2"
              >
                <span className="relative z-10">Start Weaving</span>
                <ArrowUpRight size={20} className="relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                <motion.div 
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button
                onClick={() => setIsVideoModalOpen(true)}
                className="group px-8 py-4 border-2 border-white/20 rounded font-semibold text-white hover:border-white/40 hover:bg-white/5 transition-all flex items-center gap-2 backdrop-blur-sm"
              >
                <Play size={18} className="group-hover:scale-110 transition-transform" />
                <span>Watch Demo</span>
              </button>
            </motion.div>
            
            <motion.button 
              className="flex items-center gap-3 px-6 py-4 text-white/60 hover:text-white transition-colors group"
              whileHover={{ x: 5 }}
            >
              <Github size={20} className="group-hover:rotate-12 transition-transform" />
              <div className="text-left">
                <div className="text-xs text-white/40 font-mono">GITHUB</div>
                <div className="font-medium">Star us</div>
              </div>
            </motion.button>
          </motion.div>

          {/* Stats Row */}
          <motion.div 
            className="flex flex-wrap gap-12 mt-16 pt-8 border-t border-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            {[
              { label: 'Traces/sec', value: '50K+' },
              { label: 'Latency', value: '<2ms' },
              { label: 'Protocols', value: '12+' }
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + (i * 0.1) }}
              >
                <div className="text-3xl font-bold text-white font-mono">{stat.value}</div>
                <div className="text-xs text-white/40 uppercase tracking-wider mt-1 font-mono">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Terminal Window - Enhanced */}
        <motion.div 
          className="relative mt-20"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <div className="absolute -top-20 -right-20 w-40 h-40 border border-brand-orange/20 rotate-45" />
          
          <motion.div 
            className="relative max-w-5xl ml-auto cursor-pointer"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={() => setIsVideoModalOpen(true)}
          >
            {/* Enhanced Glow */}
            <motion.div 
              className="absolute -inset-4 bg-brand-orange/20 blur-[60px] rounded-2xl"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            
            {/* Terminal */}
            <div className="relative bg-[#0A0A0A]/70 backdrop-blur-3xl border-2 border-white/15 rounded-lg overflow-hidden shadow-2xl">
              {/* Title bar with glassmorphism */}
              <div className="h-12 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-3xl border-b border-white/20 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <motion.div 
                      className="w-3 h-3 rounded-full bg-[#FF5F56]"
                      whileHover={{ scale: 1.2 }}
                    />
                    <motion.div 
                      className="w-3 h-3 rounded-full bg-[#FFBD2E]"
                      whileHover={{ scale: 1.2 }}
                    />
                    <motion.div 
                      className="w-3 h-3 rounded-full bg-[#27C93F]"
                      whileHover={{ scale: 1.2 }}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-white/60">
                    <Terminal size={12} />
                    <span>trace-weave-proxy:8080</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border border-white/20 rounded flex items-center justify-center text-white/40 text-xs">⌘</div>
                  <motion.div 
                    className="flex items-center gap-1.5 px-2 py-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded text-[10px] font-mono text-white/40"
                    whileHover={{ borderColor: "rgba(255,108,55,0.3)", color: "rgba(255,108,55,1)" }}
                  >
                    <Play size={10} />
                    <span>CLICK TO EXPAND</span>
                  </motion.div>
                </div>
              </div>

              {/* Video */}
              <div className="aspect-[16/9] bg-black relative group">
                <video 
                  src="/videos/HeroSectionVideo.mp4" 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileHover={{ scale: 1, opacity: 1 }}
                    className="w-20 h-20 rounded-full bg-brand-orange/90 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-brand-orange/50"
                  >
                    <Play size={32} className="text-white ml-1" />
                  </motion.div>
                </div>
                
                {/* Overlay elements */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className="px-3 py-1.5 bg-black/70 backdrop-blur-2xl border border-green-500/50 rounded text-[10px] font-mono text-green-400 flex items-center gap-2">
                    <motion.div 
                      className="w-1.5 h-1.5 bg-green-500 rounded-full"
                      animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    CAPTURING TRACES
                  </div>
                  <div className="text-[10px] font-mono text-white/60 bg-black/50 backdrop-blur-xl px-2 py-1 rounded border border-white/10">
                    127.0.0.1:8080
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

      </div>

      {/* Video Modal */}
      <VideoModal 
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoSrc="/videos/HeroSectionVideo.mp4"
      />
    </section>
  );
};