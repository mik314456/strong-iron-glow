import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PersonalRecord } from '@/types/workout';

interface PRCelebrationProps {
  record: PersonalRecord;
  onDismiss: () => void;
}

const PRCelebration: React.FC<PRCelebrationProps> = ({ record, onDismiss }) => {
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.2 },
      colors: ['#f97316', '#fb923c', '#fdba74', '#ffffff'],
    });
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onDismiss}
      className="fixed inset-0 z-[100] bg-background/90 flex items-center justify-center p-8"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="text-center"
      >
        <div className="w-20 h-20 mx-auto mb-6 bg-primary/20 rounded-full flex items-center justify-center">
          <Trophy size={40} className="text-primary" />
        </div>
        <p className="text-2xl font-black tracking-wider text-primary mb-2">NEW PERSONAL RECORD</p>
        <p className="text-lg font-semibold mb-1">{record.exerciseName}</p>
        <p className="text-3xl font-bold text-primary">{record.weight}kg × {record.reps}</p>
        <p className="text-sm text-muted-foreground mt-2">Est. 1RM: {record.estimatedOneRM}kg</p>
      </motion.div>
    </motion.div>
  );
};

export default PRCelebration;
