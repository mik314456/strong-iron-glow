import React from 'react';
import { motion } from 'framer-motion';

interface WorkoutSummaryProps {
  duration: number;
  totalVolume: number;
  exerciseCount: number;
  setCount: number;
  units: 'kg' | 'lbs';
  convertWeight: (kg: number) => number;
  onSave: () => void;
  onDiscard: () => void;
}

const WorkoutSummary: React.FC<WorkoutSummaryProps> = ({
  duration, totalVolume, exerciseCount, setCount, units, convertWeight, onSave, onDiscard,
}) => {
  const formatDuration = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] bg-background/95 flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-card rounded-lg border border-border p-6 w-full max-w-sm"
      >
        <h2 className="text-xl font-bold mb-6 text-center">Workout Complete 🎉</h2>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { label: 'Duration', value: formatDuration(duration) },
            { label: 'Volume', value: `${Math.round(convertWeight(totalVolume))} ${units}` },
            { label: 'Exercises', value: String(exerciseCount) },
            { label: 'Sets', value: String(setCount) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-card-elevated rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onDiscard}
            className="flex-1 py-3 rounded-lg bg-card-elevated border border-border text-sm font-semibold text-muted-foreground"
          >
            Discard
          </button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onSave}
            className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold"
          >
            Save Workout
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WorkoutSummary;
