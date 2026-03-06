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
        className="fixed inset-0 z-[90] bg-bg-deep flex flex-col items-center justify-center p-6"
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
              stroke="var(--green)"
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
          className="text-2xl font-sans font-bold text-text-primary mb-2"
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
            <div key={label} className="bg-bg-card rounded-[16px] border border-border p-3 text-center">
              <p className="text-xl font-display font-normal tabular-nums text-text-primary">{value}</p>
              <p className="text-[11px] font-sans uppercase tracking-[0.2em] text-text-secondary mt-0.5">{label}</p>
            </div>
          ))}
        </motion.div>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleShare}
          className="mb-4 px-6 py-3 rounded-[10px] border border-border text-text-primary text-sm font-sans font-medium flex items-center gap-2 transition-smooth"
        >
          <Share2 size={18} />
          {shared ? 'Copied to clipboard!' : 'Share'}
        </motion.button>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleDone}
          className="px-8 h-14 rounded-[10px] bg-accent text-[#0a0a0a] font-sans font-bold text-[15px] uppercase tracking-wider"
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
      className="fixed inset-0 z-[90] bg-bg-deep/90 backdrop-blur-sm flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-bg-card rounded-[24px] border border-border border-t-2 border-t-accent p-6 w-full max-w-sm"
      >
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-success/20 border border-success/50">
            <span className="block h-3 w-3 rounded-full bg-success" />
          </span>
          <h2 className="text-lg font-sans font-bold text-text-primary">Session complete</h2>
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
              className="bg-bg-raised/60 rounded-[16px] border border-border p-3 text-center"
            >
              <p className="text-2xl font-display font-normal tabular-nums text-text-primary">{value}</p>
              <p className="text-[11px] font-sans uppercase tracking-[0.2em] text-text-secondary mt-1">
                {label}
              </p>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.99 }}
            onClick={onDiscard}
            className="flex-1 h-12 rounded-[10px] bg-transparent border border-danger/50 text-sm font-sans font-semibold text-danger hover:bg-danger/10 transition-smooth"
          >
            Discard
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.99 }}
            onClick={handleSave}
            className="flex-1 h-12 rounded-[10px] bg-accent text-[#0a0a0a] text-sm font-sans font-bold uppercase tracking-wider"
          >
            Save session
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WorkoutSummary;
