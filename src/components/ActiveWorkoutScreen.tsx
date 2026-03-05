import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, Trash2, ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import { WorkoutSession, SessionExercise, ExerciseSet, Exercise, PersonalRecord } from '@/types/workout';
import { MUSCLE_GROUP_COLORS } from '@/data/exercises';
import { getPreviousSets } from '@/hooks/useWorkoutStore';
import RestTimer from './RestTimer';
import PRCelebration from './PRCelebration';
import WorkoutSummary from './WorkoutSummary';

interface ActiveWorkoutScreenProps {
  workout: { session: WorkoutSession; exercises: SessionExercise[]; startTime: string };
  exercises: Exercise[];
  sessions: WorkoutSession[];
  onFinish: (session: WorkoutSession) => void;
  onDiscard: () => void;
  onUpdate: (workout: { session: WorkoutSession; exercises: SessionExercise[]; startTime: string }) => void;
  settings: { units: 'kg' | 'lbs'; restTimerDuration: number };
  convertWeight: (kg: number) => number;
  toKg: (display: number) => number;
  checkAndUpdatePR: (exerciseId: string, exerciseName: string, weight: number, reps: number) => PersonalRecord | null;
}

const ActiveWorkoutScreen: React.FC<ActiveWorkoutScreenProps> = ({
  workout, exercises: allExercises, sessions, onFinish, onDiscard, onUpdate,
  settings, convertWeight, toKg, checkAndUpdatePR,
}) => {
  const [elapsed, setElapsed] = useState(0);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [prRecord, setPrRecord] = useState<PersonalRecord | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const startRef = useRef(new Date(workout.startTime).getTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // WakeLock
  useEffect(() => {
    let wl: any;
    (async () => {
      try {
        if ('wakeLock' in navigator) {
          wl = await (navigator as any).wakeLock.request('screen');
        }
      } catch {}
    })();
    return () => { wl?.release(); };
  }, []);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const updateSet = (exIdx: number, setIdx: number, field: 'weight' | 'reps', value: string) => {
    const updated = { ...workout };
    const exs = [...updated.exercises];
    const sets = [...exs[exIdx].sets];
    sets[setIdx] = { ...sets[setIdx], [field]: value === '' ? null : Number(value) };
    exs[exIdx] = { ...exs[exIdx], sets };
    updated.exercises = exs;
    onUpdate(updated);
  };

  const completeSet = (exIdx: number, setIdx: number) => {
    const updated = { ...workout };
    const exs = [...updated.exercises];
    const sets = [...exs[exIdx].sets];
    const set = sets[setIdx];

    // If no weight/reps entered, use previous session values as defaults
    const prevSets = getPreviousSets(sessions, exs[exIdx].exerciseId);
    const w = set.weight ?? (prevSets[setIdx]?.weight ?? 0);
    const r = set.reps ?? (prevSets[setIdx]?.reps ?? 0);

    sets[setIdx] = {
      ...set,
      weight: w,
      reps: r,
      completed: !set.completed,
      completedAt: !set.completed ? new Date().toISOString() : undefined,
    };
    exs[exIdx] = { ...exs[exIdx], sets };
    updated.exercises = exs;
    onUpdate(updated);

    if (!set.completed && w > 0 && r > 0) {
      const pr = checkAndUpdatePR(exs[exIdx].exerciseId, exs[exIdx].exerciseName, w, r);
      if (pr) setPrRecord(pr);
      setShowRestTimer(true);
    }
  };

  const addSet = (exIdx: number) => {
    const updated = { ...workout };
    const exs = [...updated.exercises];
    const sets = [...exs[exIdx].sets];
    sets.push({
      id: crypto.randomUUID(),
      setNumber: sets.length + 1,
      weight: null,
      reps: null,
      completed: false,
      isWarmup: false,
    });
    exs[exIdx] = { ...exs[exIdx], sets };
    updated.exercises = exs;
    onUpdate(updated);
  };

  const removeSet = (exIdx: number, setIdx: number) => {
    const updated = { ...workout };
    const exs = [...updated.exercises];
    const sets = exs[exIdx].sets.filter((_, i) => i !== setIdx).map((s, i) => ({ ...s, setNumber: i + 1 }));
    exs[exIdx] = { ...exs[exIdx], sets };
    updated.exercises = exs;
    onUpdate(updated);
  };

  const handleFinish = () => setShowSummary(true);

  const totalVolume = workout.exercises.reduce((sum, ex) =>
    sum + ex.sets.filter(s => s.completed).reduce((s2, set) => s2 + (set.weight || 0) * (set.reps || 0), 0), 0);

  const completedSets = workout.exercises.reduce((sum, ex) =>
    sum + ex.sets.filter(s => s.completed).length, 0);

  const confirmFinish = () => {
    const session: WorkoutSession = {
      ...workout.session,
      endTime: new Date().toISOString(),
      totalVolume,
      exercises: workout.exercises,
    };
    onFinish(session);
  };

  return (
    <div className="pb-24">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm">{workout.session.templateName}</p>
          <p className="text-primary font-mono text-lg font-bold">{formatTime(elapsed)}</p>
        </div>
        <button
          onClick={handleFinish}
          className="bg-destructive text-destructive-foreground px-5 py-2 rounded-lg font-semibold text-sm"
        >
          Finish
        </button>
      </div>

      {/* Exercise Cards */}
      <div className="px-4 pt-4 space-y-4">
        {workout.exercises.map((ex, exIdx) => {
          const exerciseData = allExercises.find(e => e.id === ex.exerciseId);
          const prevSets = getPreviousSets(sessions, ex.exerciseId);
          const muscleGroup = exerciseData?.muscleGroup || 'Chest';

          return (
            <div key={ex.id} className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="px-4 py-3 flex items-center justify-between">
                <p className="font-semibold">{ex.exerciseName}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${MUSCLE_GROUP_COLORS[muscleGroup] || ''}`}>
                  {muscleGroup}
                </span>
              </div>

              {/* Notes toggle */}
              <button
                onClick={() => {
                  const s = new Set(expandedNotes);
                  s.has(ex.id) ? s.delete(ex.id) : s.add(ex.id);
                  setExpandedNotes(s);
                }}
                className="px-4 pb-1 text-xs text-muted-foreground flex items-center gap-1"
              >
                Notes {expandedNotes.has(ex.id) ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
              {expandedNotes.has(ex.id) && (
                <div className="px-4 pb-2">
                  <input
                    className="w-full bg-card-elevated rounded-md px-3 py-2 text-xs text-foreground min-h-[40px] border border-border"
                    placeholder="Add notes..."
                  />
                </div>
              )}

              {/* Set Table */}
              <div className="px-4">
                <div className="grid grid-cols-[40px_1fr_1fr_1fr_48px] gap-1 text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                  <span>Set</span>
                  <span>Previous</span>
                  <span>{settings.units.toUpperCase()}</span>
                  <span>Reps</span>
                  <span></span>
                </div>

                {ex.sets.map((set, setIdx) => {
                  const prev = prevSets[setIdx];
                  return (
                    <motion.div
                      key={set.id}
                      className={`grid grid-cols-[40px_1fr_1fr_1fr_48px] gap-1 items-center py-1.5 rounded-md mb-1 transition-colors ${
                        set.completed ? 'bg-set-complete border-l-[3px] border-l-set-complete-border pl-1' : ''
                      }`}
                    >
                      <span className="text-sm font-medium text-muted-foreground text-center">{set.setNumber}</span>
                      <span className="text-xs text-muted-foreground">
                        {prev ? `${convertWeight(prev.weight)}×${prev.reps}` : '—'}
                      </span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={set.weight ?? ''}
                        placeholder={prev ? String(convertWeight(prev.weight)) : '0'}
                        onChange={(e) => updateSet(exIdx, setIdx, 'weight', e.target.value)}
                        className="bg-card-elevated rounded-md px-2 py-2 text-sm text-center font-medium min-h-[44px] w-full border border-border focus:border-primary outline-none"
                      />
                      <input
                        type="text"
                        inputMode="numeric"
                        value={set.reps ?? ''}
                        placeholder={prev ? String(prev.reps) : '0'}
                        onChange={(e) => updateSet(exIdx, setIdx, 'reps', e.target.value)}
                        className="bg-card-elevated rounded-md px-2 py-2 text-sm text-center font-medium min-h-[44px] w-full border border-border focus:border-primary outline-none"
                      />
                      <div className="flex items-center justify-center gap-1">
                        <motion.button
                          whileTap={{ scale: 0.8 }}
                          onClick={() => completeSet(exIdx, setIdx)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors ${
                            set.completed
                              ? 'bg-primary border-primary'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          {set.completed && (
                            <motion.div
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              className="animate-check-bounce"
                            >
                              <Check size={16} className="text-primary-foreground" />
                            </motion.div>
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <button
                onClick={() => addSet(exIdx)}
                className="w-full py-3 text-sm text-muted-foreground font-medium border-t border-border hover:bg-card-elevated transition-colors"
              >
                + Add Set
              </button>
            </div>
          );
        })}
      </div>

      {/* Rest Timer */}
      <AnimatePresence>
        {showRestTimer && (
          <RestTimer
            duration={settings.restTimerDuration}
            onDismiss={() => setShowRestTimer(false)}
          />
        )}
      </AnimatePresence>

      {/* PR Celebration */}
      <AnimatePresence>
        {prRecord && (
          <PRCelebration record={prRecord} onDismiss={() => setPrRecord(null)} />
        )}
      </AnimatePresence>

      {/* Summary Modal */}
      <AnimatePresence>
        {showSummary && (
          <WorkoutSummary
            duration={elapsed}
            totalVolume={totalVolume}
            exerciseCount={workout.exercises.length}
            setCount={completedSets}
            units={settings.units}
            convertWeight={convertWeight}
            onSave={confirmFinish}
            onDiscard={onDiscard}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActiveWorkoutScreen;
