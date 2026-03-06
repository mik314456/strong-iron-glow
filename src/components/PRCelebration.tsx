import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PersonalRecord } from '@/types/workout';

interface PRCelebrationProps {
  record: PersonalRecord;
  units: 'kg' | 'lbs';
  onDismiss: () => void;
}

const PRCelebration: React.FC<PRCelebrationProps> = ({ record, units, onDismiss }) => {
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.2 },
      colors: ['#f97316', '#fb923c', '#fdba74', '#ffffff'],
    });
    const t = setTimeout(onDismiss, 2500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onDismiss}
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-8"
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-64 h-64 rounded-full bg-[radial-gradient(circle_at_center,_rgba(249,115,22,0.7),_transparent_60%)] blur-3xl opacity-70" />
      </div>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="relative text-center max-w-sm w-full"
      >
        <div className="w-20 h-20 mx-auto mb-6 bg-orange-500/20 border border-orange-400/60 rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(249,115,22,0.6)]">
          <Trophy size={48} className="text-orange-400" />
        </div>
        <p className="text-[13px] font-semibold tracking-[0.25em] text-[#f97316] mb-3 uppercase">
          New personal record
        </p>
        <p className="text-2xl font-bold mb-1 text-white">{record.exerciseName}</p>
        <p className="text-xl font-bold text-[#f97316]">
          {record.weight} {units} × {record.reps}
        </p>
        <p className="text-sm text-white/50 mt-3">
          Est. 1RM: {record.estimatedOneRM} {units}
        </p>
        <p className="text-xs text-white/40 mt-1">
          Previous:{' '}
          {record.previousWeight != null && record.previousReps != null
            ? `${record.previousWeight} ${units} × ${record.previousReps}`
            : 'First time logging'}
        </p>
      </motion.div>
    </motion.div>
  );
};

export default PRCelebration;
