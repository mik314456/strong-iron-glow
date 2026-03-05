import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Play, ChevronRight } from 'lucide-react';
import { WorkoutTemplate, WorkoutSession, SessionExercise, ExerciseSet, Exercise } from '@/types/workout';
import { MUSCLE_GROUP_COLORS } from '@/data/exercises';
import ActiveWorkoutScreen from './ActiveWorkoutScreen';
import { format, formatDistanceToNow } from 'date-fns';

interface WorkoutTabProps {
  templates: WorkoutTemplate[];
  exercises: Exercise[];
  sessions: WorkoutSession[];
  activeWorkout: { session: WorkoutSession; exercises: SessionExercise[]; startTime: string } | null;
  onStartWorkout: (template: WorkoutTemplate | null) => void;
  onFinishWorkout: (session: WorkoutSession) => void;
  onDiscardWorkout: () => void;
  onUpdateActiveWorkout: (workout: { session: WorkoutSession; exercises: SessionExercise[]; startTime: string }) => void;
  settings: { units: 'kg' | 'lbs'; restTimerDuration: number };
  convertWeight: (kg: number) => number;
  toKg: (display: number) => number;
  checkAndUpdatePR: (exerciseId: string, exerciseName: string, weight: number, reps: number) => any;
}

const WorkoutTab: React.FC<WorkoutTabProps> = ({
  templates, exercises, sessions, activeWorkout,
  onStartWorkout, onFinishWorkout, onDiscardWorkout, onUpdateActiveWorkout,
  settings, convertWeight, toKg, checkAndUpdatePR,
}) => {
  if (activeWorkout) {
    return (
      <ActiveWorkoutScreen
        workout={activeWorkout}
        exercises={exercises}
        sessions={sessions}
        onFinish={onFinishWorkout}
        onDiscard={onDiscardWorkout}
        onUpdate={onUpdateActiveWorkout}
        settings={settings}
        convertWeight={convertWeight}
        toKg={toKg}
        checkAndUpdatePR={checkAndUpdatePR}
      />
    );
  }

  const recentSessions = sessions.slice(0, 3);

  return (
    <div className="px-4 pt-12 pb-24">
      <h1 className="text-3xl font-bold mb-6">What are you training today?</h1>

      {/* Template Cards */}
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4">
        {templates.map((t) => (
          <motion.button
            key={t.id}
            whileTap={{ scale: 0.97 }}
            onClick={() => onStartWorkout(t)}
            className="flex-shrink-0 w-40 h-48 bg-card rounded-lg border border-border p-4 flex flex-col justify-between text-left hover:border-primary transition-colors"
          >
            <span className="text-3xl">{t.icon || '🏋️'}</span>
            <div>
              <p className="font-semibold text-sm">{t.name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {t.exerciseIds.length} exercises · ~{t.exerciseIds.length * 8}min
              </p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Recent Workouts */}
      {recentSessions.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Recent Workouts</h2>
          <div className="space-y-2">
            {recentSessions.map((s) => (
              <div key={s.id} className="bg-card rounded-lg border border-border p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{s.templateName}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(s.startTime), 'EEE, MMM d')} · {Math.round(s.totalVolume)}
                    {settings.units}
                  </p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => onStartWorkout(null)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30 z-40"
      >
        <Plus size={24} className="text-primary-foreground" />
      </motion.button>
    </div>
  );
};

export default WorkoutTab;
