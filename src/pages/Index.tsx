import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import BottomTabBar, { TabId } from '@/components/BottomTabBar';
import WorkoutTab from '@/components/WorkoutTab';
import HistoryTab from '@/components/HistoryTab';
import ExercisesTab from '@/components/ExercisesTab';
import ProfileTab from '@/components/ProfileTab';
import {
  useExercises, useTemplates, useSessions, useRecords,
  useSettings, useActiveWorkout,
} from '@/hooks/useWorkoutStore';
import { WorkoutSession, SessionExercise, WorkoutTemplate, STORAGE_KEYS } from '@/types/workout';
import { formatDistanceToNow } from 'date-fns';

const Index = () => {
  const [tab, setTab] = useState<TabId>('workout');
  const { exercises, addExercise } = useExercises();
  const { templates } = useTemplates();
  const { sessions, addSession } = useSessions();
  const { records, checkAndUpdatePR, setRecords } = useRecords();
  const { settings, updateSettings, convertWeight, toKg } = useSettings();
  const { activeWorkout, setActiveWorkout, clearActiveWorkout } = useActiveWorkout();
  const [showResumeBanner, setShowResumeBanner] = useState(!!activeWorkout);

  const startWorkout = useCallback((template: WorkoutTemplate | null) => {
    const now = new Date().toISOString();
    const exerciseIds = template?.exerciseIds || [];
    const sessionExercises: SessionExercise[] = exerciseIds.map(eid => {
      const ex = exercises.find(e => e.id === eid);
      return {
        id: crypto.randomUUID(),
        sessionId: '',
        exerciseId: eid,
        exerciseName: ex?.name || eid,
        sets: Array.from({ length: 3 }, (_, i) => ({
          id: crypto.randomUUID(),
          setNumber: i + 1,
          weight: null,
          reps: null,
          completed: false,
          isWarmup: false,
        })),
      };
    });

    const session: WorkoutSession = {
      id: crypto.randomUUID(),
      templateId: template?.id,
      templateName: template?.name || 'Custom Workout',
      startTime: now,
      totalVolume: 0,
      exercises: sessionExercises,
    };

    setActiveWorkout({ session, exercises: sessionExercises, startTime: now });
    setShowResumeBanner(false);
  }, [exercises, setActiveWorkout]);

  const finishWorkout = useCallback((session: WorkoutSession) => {
    addSession(session);
    clearActiveWorkout();
  }, [addSession, clearActiveWorkout]);

  const discardWorkout = useCallback(() => {
    clearActiveWorkout();
    setShowResumeBanner(false);
  }, [clearActiveWorkout]);

  const resetData = useCallback(() => {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    window.location.reload();
  }, []);

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      {/* Resume Banner */}
      {showResumeBanner && activeWorkout && !activeWorkout.session && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-primary/10 border-b border-primary/30 px-4 py-3 flex items-center justify-between max-w-lg mx-auto">
          <p className="text-sm">Unfinished workout from {formatDistanceToNow(new Date(activeWorkout.startTime))} ago</p>
          <div className="flex gap-2">
            <button onClick={discardWorkout} className="text-xs text-muted-foreground px-3 py-1.5 rounded-md bg-card border border-border">Discard</button>
            <button onClick={() => setShowResumeBanner(false)} className="text-xs text-primary font-semibold px-3 py-1.5 rounded-md bg-primary/20">Resume</button>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {tab === 'workout' && (
            <WorkoutTab
              templates={templates}
              exercises={exercises}
              sessions={sessions}
              activeWorkout={activeWorkout}
              onStartWorkout={startWorkout}
              onFinishWorkout={finishWorkout}
              onDiscardWorkout={discardWorkout}
              onUpdateActiveWorkout={setActiveWorkout}
              settings={settings}
              convertWeight={convertWeight}
              toKg={toKg}
              checkAndUpdatePR={checkAndUpdatePR}
            />
          )}
          {tab === 'history' && (
            <HistoryTab
              sessions={sessions}
              settings={settings}
              convertWeight={convertWeight}
              onStartWorkout={() => { setTab('workout'); }}
            />
          )}
          {tab === 'exercises' && (
            <ExercisesTab
              exercises={exercises}
              sessions={sessions}
              records={records}
              settings={settings}
              convertWeight={convertWeight}
              onAddExercise={addExercise}
            />
          )}
          {tab === 'profile' && (
            <ProfileTab
              sessions={sessions}
              records={records}
              settings={settings}
              convertWeight={convertWeight}
              updateSettings={updateSettings}
              onResetData={resetData}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <BottomTabBar active={tab} onTabChange={setTab} />
    </div>
  );
};

export default Index;
