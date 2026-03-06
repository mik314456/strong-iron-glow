import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, Trash2, ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import { WorkoutSession, SessionExercise, ExerciseSet, Exercise, PersonalRecord } from '@/types/workout';
import { MUSCLE_GROUP_COLORS } from '@/data/exercises';
import { getPreviousSets } from '@/hooks/useWorkoutStore';
import RestTimer from './RestTimer';
import PRCelebration from './PRCelebration';
import WorkoutSummary from './WorkoutSummary';

const MUSCLE_GROUP_BORDER_CLASSES: Record<string, string> = {
  Chest: 'border-l-sky-500',
  Back: 'border-l-emerald-500',
  Shoulders: 'border-l-violet-500',
  Arms: 'border-l-rose-500',
  Legs: 'border-l-orange-500',
  Core: 'border-l-amber-400',
  Cardio: 'border-l-cyan-400',
};

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
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [prRecord, setPrRecord] = useState<PersonalRecord | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [durationSec, setDurationSec] = useState(0);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const startRef = useRef(new Date(workout.startTime).getTime());

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

  const elapsed = Math.floor((Date.now() - startRef.current) / 1000);

  const workingSetsTotal = workout.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter(s => !s.isWarmup).length,
    0
  );
  const workingSetsCompleted = workout.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter(s => !s.isWarmup && s.completed).length,
    0
  );
  const progressPct = workingSetsTotal > 0 ? (workingSetsCompleted / workingSetsTotal) * 100 : 0;

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
    const workingIndex = sets.slice(0, setIdx).filter(s => !s.isWarmup).length;
    const prevSets = getPreviousSets(sessions, exs[exIdx].exerciseId);
    const prev = set.isWarmup ? undefined : prevSets[workingIndex];
    const w = set.weight ?? (prev?.weight ?? 0);
    const r = set.reps ?? (prev?.reps ?? 0);

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

    if (!set.completed && w > 0 && r > 0 && !set.isWarmup) {
      const pr = checkAndUpdatePR(exs[exIdx].exerciseId, exs[exIdx].exerciseName, w, r);
      if (pr) setPrRecord(pr);
      setShowRestTimer(true);
    }
  };

  const addWarmupSet = (exIdx: number) => {
    const updated = { ...workout };
    const exs = [...updated.exercises];
    const sets = [...exs[exIdx].sets];
    const warmupCount = sets.filter(s => s.isWarmup).length;
    const newSet: ExerciseSet = {
      id: crypto.randomUUID(),
      setNumber: 0,
      weight: null,
      reps: null,
      completed: false,
      isWarmup: true,
    };
    sets.splice(warmupCount, 0, newSet);
    exs[exIdx] = { ...exs[exIdx], sets };
    updated.exercises = exs;
    onUpdate(updated);
  };

  const addSet = (exIdx: number) => {
    const updated = { ...workout };
    const exs = [...updated.exercises];
    const sets = [...exs[exIdx].sets];
    const workingSets = sets.filter(s => !s.isWarmup);
    sets.push({
      id: crypto.randomUUID(),
      setNumber: workingSets.length + 1,
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
    const sets = exs[exIdx].sets.filter((_, i) => i !== setIdx);
    let workingNum = 0;
    const renumbered = sets.map(s =>
      s.isWarmup ? s : { ...s, setNumber: ++workingNum }
    );
    exs[exIdx] = { ...exs[exIdx], sets: renumbered };
    updated.exercises = exs;
    onUpdate(updated);
  };

  const handleFinish = () => {
    setDurationSec(Math.floor((Date.now() - startRef.current) / 1000));
    setShowSummary(true);
  };

  const totalVolume = workout.exercises.reduce((sum, ex) =>
    sum + ex.sets.filter(s => s.completed && !s.isWarmup).reduce((s2, set) => s2 + (set.weight || 0) * (set.reps || 0), 0), 0);

  const completedSets = workout.exercises.reduce((sum, ex) =>
    sum + ex.sets.filter(s => s.completed && !s.isWarmup).length, 0);

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
      {/* Progress bar — thin orange line */}
      <div className="sticky top-0 z-30 bg-black/90 backdrop-blur-xl border-b border-[#252525]">
        <div className="h-0.5 w-full bg-white/10">
          <motion.div
            className="h-full bg-[#f97316]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="px-5 py-3 flex items-center justify-between">
          <p className="font-semibold text-lg tracking-tight text-white">{workout.session.templateName}</p>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleFinish}
            className="bg-[#ef4444] hover:bg-[#dc2626] text-white px-5 py-2.5 rounded-full font-semibold text-sm"
          >
            Finish
          </motion.button>
        </div>
      </div>

      {/* Exercise Cards */}
      <div className="px-5 pt-5 space-y-5">
        {workout.exercises.map((ex, exIdx) => {
          const exerciseData = allExercises.find(e => e.id === ex.exerciseId);
          const prevSets = getPreviousSets(sessions, ex.exerciseId);
          const muscleGroup = exerciseData?.muscleGroup || 'Chest';

          return (
            <div
              key={ex.id}
              className={`bg-[#111111] rounded-[20px] border border-[#252525] overflow-hidden shadow-premium border-l-4 ${
                MUSCLE_GROUP_BORDER_CLASSES[muscleGroup] || 'border-l-white/20'
              }`}
            >
              <div className="px-5 py-4 flex items-center justify-between">
                <p className="font-semibold text-lg text-white">{ex.exerciseName}</p>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${MUSCLE_GROUP_COLORS[muscleGroup] || 'bg-white/10 text-white/80'}`}>
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
                className="px-5 pb-2 text-xs text-white/50 flex items-center gap-1 hover:text-white/70 transition-colors"
              >
                Notes {expandedNotes.has(ex.id) ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
              {expandedNotes.has(ex.id) && (
                <div className="px-5 pb-3">
                  <input
                    className="w-full bg-[#0a0a0a] rounded-[14px] px-3 py-2.5 text-xs text-white border border-[#252525] focus:border-[#f97316]/50 outline-none transition-colors"
                    placeholder="Add notes for this exercise..."
                  />
                </div>
              )}

              {/* Set Table */}
              <div className="px-5 pb-4">
                <div className="grid grid-cols-[48px_1fr_1fr_1fr_56px] gap-2 text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2">
                  <span>Set</span>
                  <span>Previous</span>
                  <span>{settings.units.toUpperCase()}</span>
                  <span>Reps</span>
                  <span></span>
                </div>

                {(() => {
                  const warmupSets = ex.sets.filter(s => s.isWarmup);
                  const workingSets = ex.sets.filter(s => !s.isWarmup);
                  let workingIdx = 0;
                  return (
                    <>
                      {warmupSets.map((set) => {
                        const setIdx = ex.sets.findIndex(s => s.id === set.id);
                        return (
                          <motion.div
                            key={set.id}
                            className={`grid grid-cols-[48px_1fr_1fr_1fr_56px] gap-2 items-center rounded-lg mb-1.5 transition-colors bg-white/[0.04] ${
                              set.completed ? 'ring-1 ring-amber-500/30' : ''
                            }`}
                          >
                            <span className="text-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-amber-500/20 text-amber-400 text-sm font-bold">W</span>
                            </span>
                            <span className="text-xs text-white/40 font-mono">—</span>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={set.weight ?? ''}
                              placeholder="0"
                              onChange={(e) => updateSet(exIdx, setIdx, 'weight', e.target.value)}
                              className="h-16 rounded-xl px-2 text-lg font-bold text-white text-center w-full bg-[#0a0a0a] border border-[#252525] focus:border-amber-500/50 outline-none"
                            />
                            <input
                              type="text"
                              inputMode="numeric"
                              value={set.reps ?? ''}
                              placeholder="0"
                              onChange={(e) => updateSet(exIdx, setIdx, 'reps', e.target.value)}
                              className="h-16 rounded-xl px-2 text-lg font-bold text-white text-center w-full bg-[#0a0a0a] border border-[#252525] focus:border-amber-500/50 outline-none"
                            />
                            <div className="flex justify-center">
                              <motion.button
                                whileTap={{ scale: 0.8 }}
                                onClick={() => completeSet(exIdx, setIdx)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                                  set.completed ? 'bg-amber-500 border-amber-500' : 'border-white/30 hover:border-amber-500/50'
                                }`}
                              >
                                {set.completed && <Check size={18} className="text-black" />}
                              </motion.button>
                            </div>
                          </motion.div>
                        );
                      })}

                      {warmupSets.length > 0 && (
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.99 }}
                          onClick={() => addWarmupSet(exIdx)}
                          className="w-full py-2 mb-2 text-xs text-amber-400/80 font-medium rounded-lg border border-dashed border-amber-500/30 hover:bg-amber-500/5 transition-colors"
                        >
                          Add warm-up set
                        </motion.button>
                      )}

                      {workingSets.map((set, i) => {
                        const setIdx = ex.sets.findIndex(s => s.id === set.id);
                        const prev = prevSets[i];
                        return (
                          <motion.div
                            key={set.id}
                            className={`grid grid-cols-[48px_1fr_1fr_1fr_56px] gap-2 items-center rounded-lg mb-1.5 transition-colors ${
                              set.completed ? 'bg-set-complete border-l-[3px] border-l-set-complete-border pl-1' : ''
                            }`}
                          >
                            <span className="text-lg font-bold text-[#f97316] text-center">{set.setNumber}</span>
                            <span className="text-xs font-mono">
                              {prev ? (
                                <span className="inline-flex px-2 py-1 rounded-full bg-white/10 text-white/60">
                                  {convertWeight(prev.weight)}{settings.units} × {prev.reps}
                                </span>
                              ) : (
                                <span className="text-white/40">—</span>
                              )}
                            </span>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={set.weight ?? ''}
                              placeholder={prev ? String(convertWeight(prev.weight)) : '0'}
                              onChange={(e) => updateSet(exIdx, setIdx, 'weight', e.target.value)}
                              className="h-16 rounded-xl px-2 text-lg font-bold text-white text-center w-full bg-[#0a0a0a] border border-[#252525] focus:border-[#f97316]/60 outline-none"
                            />
                            <input
                              type="text"
                              inputMode="numeric"
                              value={set.reps ?? ''}
                              placeholder={prev ? String(prev.reps) : '0'}
                              onChange={(e) => updateSet(exIdx, setIdx, 'reps', e.target.value)}
                              className="h-16 rounded-xl px-2 text-lg font-bold text-white text-center w-full bg-[#0a0a0a] border border-[#252525] focus:border-[#f97316]/60 outline-none"
                            />
                            <div className="flex justify-center">
                              <motion.button
                                whileTap={{ scale: 0.8 }}
                                onClick={() => completeSet(exIdx, setIdx)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                                  set.completed ? 'bg-primary border-primary' : 'border-border hover:border-primary/50'
                                }`}
                              >
                                {set.completed && (
                                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="animate-check-bounce">
                                    <Check size={18} className="text-primary-foreground" />
                                  </motion.div>
                                )}
                              </motion.button>
                            </div>
                          </motion.div>
                        );
                      })}

                      {warmupSets.length === 0 && (
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.99 }}
                          onClick={() => addWarmupSet(exIdx)}
                          className="w-full py-2 mb-2 text-xs text-amber-400/80 font-medium rounded-lg border border-dashed border-amber-500/30 hover:bg-amber-500/5 transition-colors"
                        >
                          Add warm-up set
                        </motion.button>
                      )}
                    </>
                  );
                })()}
              </div>

              <motion.button
                whileTap={{ scale: 0.99 }}
                onClick={() => addSet(exIdx)}
                className="w-full py-3.5 text-sm text-white/50 font-medium border-t border-[#252525] hover:bg-white/[0.03] hover:text-white/70 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={18} className="opacity-70" />
                Add set
              </motion.button>
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
          <PRCelebration
            record={prRecord}
            units={settings.units}
            onDismiss={() => setPrRecord(null)}
          />
        )}
      </AnimatePresence>

      {/* Summary Modal */}
      <AnimatePresence>
        {showSummary && (
          <WorkoutSummary
            duration={durationSec}
            totalVolume={totalVolume}
            exerciseCount={workout.exercises.length}
            setCount={completedSets}
            units={settings.units}
            sessionName={workout.session.templateName}
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
