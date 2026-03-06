import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { TrainingSplit, SplitDay, Exercise } from '@/types/workout';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface SplitBuilderProps {
  open: boolean;
  onClose: () => void;
  exercises: Exercise[];
  initialSplit?: TrainingSplit | null;
  onSave: (split: Omit<TrainingSplit, 'createdAt' | 'updatedAt'> & { createdAt?: string; updatedAt?: string }) => void;
}

const DAY_COUNTS = [2, 3, 4, 5, 6, 7];

const SplitBuilder: React.FC<SplitBuilderProps> = ({
  open, onClose, exercises, initialSplit, onSave,
}) => {
  const isEdit = !!initialSplit?.id;
  const [step, setStep] = useState(1);
  const [name, setName] = useState(initialSplit?.name ?? '');
  const [numDays, setNumDays] = useState(initialSplit?.days?.length ?? 3);
  const [days, setDays] = useState<SplitDay[]>(() => {
    if (initialSplit?.days?.length) return initialSplit.days.map(d => ({ ...d }));
    return Array.from({ length: 3 }, (_, i): SplitDay => ({
      id: crypto.randomUUID(),
      name: `Day ${i + 1}`,
      exerciseIds: [],
      order: i,
    }));
  });

  const reset = useCallback(() => {
    setStep(1);
    setName(initialSplit?.name ?? '');
    setNumDays(initialSplit?.days?.length ?? 3);
    const defaultDays: SplitDay[] = Array.from({ length: 3 }, (_, i) => ({
      id: crypto.randomUUID(),
      name: `Day ${i + 1}`,
      exerciseIds: [],
      order: i,
    }));
    setDays(initialSplit?.days?.length ? initialSplit.days.map(d => ({ ...d })) : defaultDays);
  }, [initialSplit]);

  const handleOpenChange = (open: boolean) => {
    if (!open) { reset(); onClose(); }
  };

  const syncDaysCount = useCallback(() => {
    setDays(prev => {
      const next = [...prev];
      if (numDays > next.length) {
        for (let i = next.length; i < numDays; i++) {
          next.push({
            id: crypto.randomUUID(),
            name: `Day ${i + 1}`,
            exerciseIds: [],
            order: i,
          });
        }
      } else if (numDays < next.length) {
        return next.slice(0, numDays).map((d, i) => ({ ...d, order: i }));
      }
      return next.map((d, i) => ({ ...d, order: i }));
    });
  }, [numDays]);

  const setDayName = (dayIndex: number, value: string) => {
    setDays(prev => prev.map((d, i) => i === dayIndex ? { ...d, name: value } : d));
  };

  const setDayExerciseIds = (dayIndex: number, exerciseIds: string[]) => {
    setDays(prev => prev.map((d, i) => i === dayIndex ? { ...d, exerciseIds } : d));
  };

  const moveExercise = (dayIndex: number, fromIdx: number, direction: 'up' | 'down') => {
    setDays(prev => {
      const day = prev[dayIndex];
      const ids = [...day.exerciseIds];
      const toIdx = direction === 'up' ? fromIdx - 1 : fromIdx + 1;
      if (toIdx < 0 || toIdx >= ids.length) return prev;
      [ids[fromIdx], ids[toIdx]] = [ids[toIdx], ids[fromIdx]];
      return prev.map((d, i) => i === dayIndex ? { ...d, exerciseIds: ids } : d);
    });
  };

  const removeExerciseFromDay = (dayIndex: number, exerciseId: string) => {
    setDays(prev => prev.map((d, i) =>
      i === dayIndex ? { ...d, exerciseIds: d.exerciseIds.filter(id => id !== exerciseId) } : d
    ));
  };

  useEffect(() => {
    if (step === 3) syncDaysCount();
  }, [step]);

  const handleNext = () => {
    if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  };

  const handleSave = () => {
    const now = new Date().toISOString();
    const split: TrainingSplit = {
      id: initialSplit?.id ?? crypto.randomUUID(),
      name: name.trim() || 'My Split',
      days: days.slice(0, numDays).map((d, i) => ({ ...d, order: i })),
      createdAt: initialSplit?.createdAt ?? now,
      updatedAt: now,
    };
    onSave(split);
    handleOpenChange(false);
  };

  const canSave = name.trim().length > 0 && days.slice(0, numDays).every(d => d.name.trim().length > 0);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl border-t border-[#252525] bg-[#0a0a0a]">
        <SheetHeader className="border-b border-[#252525] pb-4">
          <SheetTitle className="text-white">
            {isEdit ? 'Edit split' : 'Create split'}
          </SheetTitle>
        </SheetHeader>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="pt-6"
            >
              <label className="text-sm font-medium text-white/80 block mb-2">Split name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. PPL, Bro Split, Upper Lower"
                className="w-full bg-[#111111] border border-[#252525] rounded-xl px-4 py-3.5 text-white text-lg placeholder:text-white/40 focus:border-[#f97316]/50 outline-none"
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="pt-6"
            >
              <label className="text-sm font-medium text-white/80 block mb-3">Training days per week</label>
              <div className="flex flex-wrap gap-2">
                {DAY_COUNTS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNumDays(n)}
                    className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                      numDays === n
                        ? 'bg-[#f97316] text-white'
                        : 'bg-[#111111] text-white/70 border border-[#252525] hover:border-[#f97316]/50'
                    }`}
                  >
                    {n}x
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="pt-4 pb-8 overflow-y-auto max-h-[calc(90vh-180px)]"
            >
              {days.slice(0, numDays).map((day, dayIndex) => (
                <div key={day.id} className="mb-6">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-2">
                    Day {dayIndex + 1}
                  </label>
                  <input
                    type="text"
                    value={day.name}
                    onChange={(e) => setDayName(dayIndex, e.target.value)}
                    placeholder="e.g. Push, Pull, Legs"
                    className="w-full bg-[#111111] border border-[#252525] rounded-xl px-3 py-2.5 text-white text-sm mb-3 focus:border-[#f97316]/50 outline-none"
                  />
                  <ExercisePicker
                    exercises={exercises}
                    selectedIds={day.exerciseIds}
                    onSelect={(id) => setDayExerciseIds(dayIndex, [...day.exerciseIds, id])}
                    onRemove={(id) => removeExerciseFromDay(dayIndex, id)}
                    onMoveUp={(idx) => moveExercise(dayIndex, idx, 'up')}
                    onMoveDown={(idx) => moveExercise(dayIndex, idx, 'down')}
                  />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#0a0a0a] border-t border-[#252525] flex gap-2">
          {step > 1 ? (
            <Button type="button" variant="outline" onClick={handleBack} className="flex-1 rounded-full bg-[#111111] border-[#252525] text-white">
              <ChevronLeft size={18} /> Back
            </Button>
          ) : (
            <div className="flex-1" />
          )}
          {step < 3 ? (
            <Button type="button" onClick={handleNext} className="flex-1 rounded-full bg-[#f97316] text-white hover:bg-[#ea580c]">
              Continue <ChevronRight size={18} />
            </Button>
          ) : (
            <Button type="button" onClick={handleSave} disabled={!canSave} className="flex-1 rounded-full bg-[#f97316] text-white hover:bg-[#ea580c]">
              {isEdit ? 'Save changes' : 'Save split'}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

interface ExercisePickerProps {
  exercises: Exercise[];
  selectedIds: string[];
  onSelect: (exerciseId: string) => void;
  onRemove: (exerciseId: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

const ExercisePicker: React.FC<ExercisePickerProps> = ({
  exercises, selectedIds, onSelect, onRemove, onMoveUp, onMoveDown,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const selected = selectedIds.map(id => exercises.find(e => e.id === id)).filter(Boolean) as Exercise[];
  const available = exercises.filter(e => !selectedIds.includes(e.id));

  return (
    <div>
      <div className="space-y-1.5 mb-2">
        {selected.map((ex, idx) => (
          <div
            key={ex.id}
            className="flex items-center gap-2 bg-[#111111] rounded-lg px-3 py-2 border border-[#252525]"
          >
            <div className="flex flex-col gap-0">
              <button type="button" onClick={() => onMoveUp(idx)} className="p-0.5 text-white/40 hover:text-white">
                <ChevronRight size={14} className="rotate-[-90deg]" />
              </button>
              <button type="button" onClick={() => onMoveDown(idx)} className="p-0.5 text-white/40 hover:text-white">
                <ChevronRight size={14} className="rotate-90" />
              </button>
            </div>
            <span className="flex-1 text-sm text-white">{ex.name}</span>
            <button type="button" onClick={() => onRemove(ex.id)} className="p-1 text-white/40 hover:text-red-400">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setShowPicker(true)}
        className="w-full py-2.5 rounded-xl border border-dashed border-[#252525] text-white/60 text-sm font-medium flex items-center justify-center gap-2 hover:bg-white/5"
      >
        <Plus size={16} /> Add exercises
      </button>

      {showPicker && (
        <Sheet open={showPicker} onOpenChange={setShowPicker}>
          <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl border-t border-[#252525] bg-[#0a0a0a]">
            <SheetHeader>
              <SheetTitle className="text-white">Choose exercise</SheetTitle>
            </SheetHeader>
            <div className="overflow-y-auto py-4 space-y-1">
              {available.map((ex) => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => { onSelect(ex.id); setShowPicker(false); }}
                  className="w-full text-left px-4 py-3 rounded-xl bg-[#111111] border border-[#252525] text-white hover:border-[#f97316]/50"
                >
                  {ex.name}
                  <span className="text-xs text-white/50 block">{ex.muscleGroup}</span>
                </button>
              ))}
              {available.length === 0 && (
                <p className="text-white/50 text-sm text-center py-4">All exercises added</p>
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};

export default SplitBuilder;
