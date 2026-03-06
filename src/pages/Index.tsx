import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import BottomTabBar, { TabId } from '@/components/BottomTabBar';
import WorkoutTab from '@/components/WorkoutTab';
import HistoryTab from '@/components/HistoryTab';
import ExercisesTab from '@/components/ExercisesTab';
import ProfileTab from '@/components/ProfileTab';
import Onboarding from '@/components/Onboarding';
import SplitSelectionScreen from '@/components/SplitSelectionScreen';
import {
  useExercises, useTemplates, useSessions, useRecords,
  useSettings, useActiveWorkout, useUserProfile, useSplits,
  getLastSplitDayIndex, setLastSplitDayIndex,
} from '@/hooks/useWorkoutStore';
import { WorkoutSession, SessionExercise, WorkoutTemplate, STORAGE_KEYS } from '@/types/workout';
import { formatDistanceToNow } from 'date-fns';

const Index = () => {
  const [tab, setTab] = useState<TabId>('workout');
  const { profile, setProfile, updateProfile, hasCompletedOnboarding } = useUserProfile();
  const { exercises, addExercise } = useExercises();
  const { templates } = useTemplates();
  const { sessions, addSession } = useSessions();
  const { records, checkAndUpdatePR } = useRecords();
  const { settings, updateSettings, convertWeight, toKg } = useSettings();
  const { activeWorkout, setActiveWorkout, clearActiveWorkout } = useActiveWorkout();
  const { splits, addSplit, updateSplit, deleteSplit } = useSplits();
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
    if (session.splitId != null && session.splitDayIndex != null) {
      setLastSplitDayIndex(session.splitId, session.splitDayIndex);
    }
    clearActiveWorkout();
  }, [addSession, clearActiveWorkout]);

  const startWorkoutFromSplit = useCallback((splitId: string) => {
    const split = splits.find(s => s.id === splitId);
    if (!split || split.days.length === 0) return;
    const lastIndex = getLastSplitDayIndex(splitId);
    const dayIndex = (lastIndex + 1) % split.days.length;
    const day = split.days[dayIndex];
    const now = new Date().toISOString();
    const sessionExercises: SessionExercise[] = day.exerciseIds.map(eid => {
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
      templateName: `${split.name} – ${day.name}`,
      startTime: now,
      totalVolume: 0,
      exercises: sessionExercises,
      splitId,
      splitDayIndex: dayIndex,
    };
    setActiveWorkout({ session, exercises: sessionExercises, startTime: now });
    setShowResumeBanner(false);
  }, [splits, exercises, setActiveWorkout]);

  const discardWorkout = useCallback(() => {
    clearActiveWorkout();
    setShowResumeBanner(false);
  }, [clearActiveWorkout]);

  const resetData = useCallback(() => {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    window.location.reload();
  }, []);

  if (!hasCompletedOnboarding) {
    return (
      <Onboarding
        onComplete={(p) => {
          setProfile(p);
        }}
      />
    );
  }

  if (!profile.hasCompletedSplitSelection) {
    return (
      <SplitSelectionScreen
        profile={profile}
        exercises={exercises}
        onAddSplit={addSplit}
        onComplete={() => updateProfile({ hasCompletedSplitSelection: true })}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-deep max-w-lg mx-auto relative">
      {/* Resume banner */}
      {showResumeBanner && activeWorkout && tab !== 'workout' && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-bg-card border-b border-border-subtle px-4 py-3.5 flex items-center justify-between max-w-lg mx-auto">
          <p className="text-sm text-text-primary font-sans">
            Session in progress <span className="text-text-secondary">·</span> {formatDistanceToNow(new Date(activeWorkout.startTime))} ago
          </p>
          <div className="flex gap-2">
            <button onClick={discardWorkout} className="text-xs text-text-secondary px-3 py-2 rounded-[10px] bg-bg-raised border border-border hover:border-border-bright transition-smooth">Discard</button>
            <button onClick={() => setShowResumeBanner(false)} className="text-xs font-sans font-bold uppercase tracking-wider text-primary-foreground px-3 py-2 rounded-[10px] bg-accent transition-smooth hover:bg-[#f0e8d8] active:scale-[0.99]">Resume</button>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-bg-deep">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="min-h-full"
          >
          {tab === 'workout' && (
            <WorkoutTab
              templates={templates}
              splits={splits}
              exercises={exercises}
              sessions={sessions}
              activeWorkout={activeWorkout}
              onStartWorkout={startWorkout}
              onStartFromSplit={startWorkoutFromSplit}
              onAddSplit={addSplit}
              onUpdateSplit={updateSplit}
              onDeleteSplit={deleteSplit}
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
      </div>

      <BottomTabBar active={tab} onTabChange={setTab} />
    </div>
  );
};

export default Index;
