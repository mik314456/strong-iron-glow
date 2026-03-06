import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Minus } from 'lucide-react';

function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  } catch {}
}

interface RestTimerProps {
  duration: number;
  onDismiss: () => void;
}

const RestTimer: React.FC<RestTimerProps> = ({ duration, onDismiss }) => {
  const [remaining, setRemaining] = useState(duration);
  const [total, setTotal] = useState(duration);
  const [flash, setFlash] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    if (remaining <= 0) {
      if (!completedRef.current) {
        completedRef.current = true;
        playBeep();
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        setFlash(true);
        const t = setTimeout(() => {
          setFlash(false);
          onDismiss();
        }, 400);
        return () => clearTimeout(t);
      }
      return;
    }
    const t = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, onDismiss]);

  const progress = remaining / total;
  const circumference = 2 * Math.PI * 60;
  const offset = circumference * (1 - progress);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <>
      {flash && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] pointer-events-none border-[4px] border-accent"
        />
      )}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-bg-card/98 backdrop-blur-xl border-t border-[#1e1e1e] rounded-t-[28px] px-6 py-8 safe-bottom"
        onClick={(e) => e.stopPropagation()}
      >
      <div className="flex justify-between items-center mb-6">
        <span className="text-xs font-sans font-semibold uppercase tracking-[0.16em] text-text-secondary">Recover</span>
        <motion.button whileTap={{ scale: 0.99 }} onClick={onDismiss} className="p-2 rounded-full hover:bg-bg-raised transition-smooth">
          <X size={18} className="text-text-secondary" />
        </motion.button>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative w-40 h-40 mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="60" fill="none" stroke="var(--border)" strokeWidth="8" />
            <circle
              cx="70" cy="70" r="60" fill="none"
              stroke="var(--accent)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl font-bold text-accent font-mono">{formatTime(remaining)}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.99 }}
            onClick={() => { setRemaining(r => Math.max(0, r - 15)); setTotal(t => Math.max(15, t - 15)); }}
            className="px-4 h-10 rounded-[10px] bg-bg-raised border border-border flex items-center justify-center text-xs text-text-primary font-sans transition-smooth"
          >
            <Minus size={16} className="mr-1" />
            -15s
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.99 }}
            onClick={onDismiss}
            className="px-6 h-10 rounded-[10px] border border-accent text-xs font-sans font-semibold text-accent bg-transparent transition-smooth"
          >
            Skip
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.99 }}
            onClick={() => { setRemaining(r => r + 30); setTotal(t => t + 30); }}
            className="px-4 h-10 rounded-[10px] bg-bg-raised border border-border flex items-center justify-center text-xs text-text-primary font-sans transition-smooth"
          >
            <Plus size={16} className="mr-1" />
            +30s
          </motion.button>
        </div>
      </div>
    </motion.div>
    </>
  );
};

export default RestTimer;
