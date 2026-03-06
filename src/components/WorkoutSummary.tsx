import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2 } from 'lucide-react';

interface WorkoutSummaryProps {
  duration: number;
  totalVolume: number;
  exerciseCount: number;
  setCount: number;
  units: 'kg' | 'lbs';
  sessionName?: string;
  convertWeight: (kg: number) => number;
  onSave: () => void;
  onDiscard: () => void;
}

const WorkoutSummary: React.FC<WorkoutSummaryProps> = ({
  duration, totalVolume, exerciseCount, setCount, units, sessionName, convertWeight, onSave, onDiscard,
}) => {
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);
  const displayVolume = Math.round(convertWeight(totalVolume));

  const formatDuration = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const shareText = [
    sessionName ? `"${sessionName}"` : 'Workout',
    `Duration: ${formatDuration(duration)}`,
    `Volume: ${displayVolume} ${units}`,
    `Exercises: ${exerciseCount} · Sets: ${setCount}`,
    '',
    'Built with Iron 💪',
  ].join('\n');

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {}
  };

  const handleSave = () => {
    setSaved(true);
  };

  const handleDone = () => {
    onSave();
  };

  if (saved) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] bg-[#080808] flex flex-col items-center justify-center p-6"
      >
        <motion.div
          className="w-28 h-28 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <motion.path
              d="M20 52 L42 72 L80 28"
              fill="none"
              stroke="#22c55e"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
            />
          </svg>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-bold text-white mb-2"
        >
          Session saved.
        </motion.h2>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 gap-3 w-full max-w-xs mb-8"
        >
          {[
            { label: 'Duration', value: formatDuration(duration) },
            { label: 'Volume', value: `${displayVolume} ${units}` },
            { label: 'Exercises', value: String(exerciseCount) },
            { label: 'Sets', value: String(setCount) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#111111] rounded-xl border border-[#252525] p-3 text-center">
              <p className="text-xl font-bold tabular-nums text-white">{value}</p>
              <p className="text-xs text-white/50 mt-0.5 uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </motion.div>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleShare}
          className="mb-4 px-6 py-3 rounded-full border border-[#252525] text-white/80 text-sm font-medium flex items-center gap-2"
        >
          <Share2 size={18} />
          {shared ? 'Copied to clipboard!' : 'Share'}
        </motion.button>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleDone}
          className="px-8 py-3.5 rounded-full bg-[#f97316] text-white font-semibold"
        >
          Done
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-[#111111] rounded-[24px] border border-[#252525] border-t-2 border-t-[#f97316] p-6 w-full max-w-sm shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_4px_24px_rgba(0,0,0,0.4)]"
      >
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#22c55e]/20 border border-[#22c55e]/50">
            <span className="block h-3 w-3 rounded-full bg-[#22c55e]" />
          </span>
          <h2 className="text-lg font-bold text-white">Session complete</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { label: 'Duration', value: formatDuration(duration) },
            { label: 'Volume', value: `${displayVolume} ${units}` },
            { label: 'Exercises', value: String(exerciseCount) },
            { label: 'Sets', value: String(setCount) },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-[#181818] rounded-[16px] border border-[#252525] p-3 text-center shadow-[0_0_0_1px_rgba(255,255,255,0.03)]"
            >
              <p className="text-2xl font-bold tabular-nums text-white">{value}</p>
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-[0.14em]">
                {label}
              </p>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onDiscard}
            className="flex-1 py-3 rounded-[14px] bg-transparent border border-[#ef4444]/50 text-sm font-semibold text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors"
          >
            Discard
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            className="flex-1 py-3 rounded-[14px] bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white text-sm font-semibold shadow-premium-glow"
          >
            Save session
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WorkoutSummary;
