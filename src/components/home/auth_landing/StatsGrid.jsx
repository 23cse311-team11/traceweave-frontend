'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingDown, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export const StatsGrid = () => {
  const stats = [
    { label: 'Total Requests', value: '2.4M', change: '+12%', color: 'text-emerald-500', icon: Activity },
    { label: 'Avg Latency', value: '127ms', change: '-8ms', color: 'text-emerald-500', icon: TrendingDown },
    { label: 'Error Rate', value: '0.4%', change: '+0.1%', color: 'text-red-500', icon: AlertCircle },
    { label: 'Active Services', value: '14', change: 'Stable', color: 'text-text-secondary', icon: CheckCircle2 },
  ];

  return (
    <motion.div 
       variants={containerVariants}
       initial="hidden"
       animate="show"
       className="grid grid-cols-1 md:grid-cols-4 gap-4"
    >
      {stats.map((stat, i) => (
        <motion.div key={i} variants={itemVariants} className="bg-bg-panel border border-border-subtle rounded-lg p-4 hover:border-border-strong transition-colors">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs text-text-secondary font-medium">{stat.label}</p>
            <stat.icon size={14} className="text-text-muted" />
          </div>
          <p className="text-2xl font-mono font-semibold text-text-primary">{stat.value}</p>
          <p className={`text-xs mt-1 ${stat.color} flex items-center gap-1`}>
             {stat.change === 'Stable' ? '' : stat.color.includes('emerald') ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
             {stat.change} <span className="text-text-muted opacity-60 ml-1">vs yesterday</span>
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
};