import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Minus } from 'lucide-react';

interface RestTimerProps {
  duration: number;
  onDismiss: () => void;
}

const RestTimer: React.FC<RestTimerProps> = ({ duration, onDismiss }) => {
  const [remaining, setRemaining] = useState(duration);
  const [total, setTotal] = useState(duration);

  useEffect(() => {
    if (remaining <= 0) {
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      setTimeout(onDismiss, 500);
      return;
    }
    const t = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, onDismiss]);

  const progress = remaining / total;
  const circumference = 2 * Math.PI * 70;
  const offset = circumference * (1 - progress);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border rounded-t-2xl px-6 py-8 safe-bottom"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm font-semibold text-muted-foreground">Rest Timer</span>
        <button onClick={onDismiss} className="p-2"><X size={18} className="text-muted-foreground" /></button>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative w-40 h-40 mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="70" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
            <circle
              cx="80" cy="80" r="70" fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold text-primary font-mono">{formatTime(remaining)}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => { setRemaining(r => Math.max(0, r - 15)); setTotal(t => Math.max(15, t - 15)); }}
            className="w-12 h-12 rounded-full bg-card-elevated border border-border flex items-center justify-center"
          >
            <Minus size={18} className="text-muted-foreground" />
          </button>
          <button
            onClick={onDismiss}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-sm"
          >
            Skip
          </button>
          <button
            onClick={() => { setRemaining(r => r + 30); setTotal(t => t + 30); }}
            className="w-12 h-12 rounded-full bg-card-elevated border border-border flex items-center justify-center"
          >
            <Plus size={18} className="text-muted-foreground" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default RestTimer;
