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
      colors: ['#171717', '#404040', '#737373', '#ffffff'],
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
      className="fixed inset-0 z-[100] bg-bg-deep/90 backdrop-blur-sm flex items-center justify-center p-8"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="relative text-center max-w-sm w-full"
      >
        <div className="w-20 h-20 mx-auto mb-6 bg-accent/10 border border-accent rounded-full flex items-center justify-center">
          <Trophy size={48} className="text-accent" />
        </div>
        <p className="text-[13px] font-sans font-semibold tracking-[0.25em] text-accent mb-3 uppercase">
          New personal record
        </p>
        <p className="text-2xl font-sans font-bold mb-1 text-text-primary">{record.exerciseName}</p>
        <p className="text-xl font-display font-normal text-accent">
          {record.weight} {units} × {record.reps}
        </p>
        <p className="text-sm font-sans text-text-secondary mt-3">
          Est. 1RM: {record.estimatedOneRM} {units}
        </p>
        <p className="text-xs font-sans text-text-secondary mt-1">
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
