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
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl border-t border-border bg-bg-deep flex flex-col overflow-hidden">
        <SheetHeader className="flex-shrink-0 border-b border-border pb-4">
          <SheetTitle className="text-text-primary font-sans font-semibold">
            {isEdit ? 'Edit split' : 'Create split'}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="pt-6"
            >
              <label className="text-sm font-sans font-medium text-text-primary block mb-2">Split name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. PPL, Bro Split, Upper Lower"
                className="w-full h-[52px] bg-bg-card border border-border rounded-[10px] px-4 text-text-primary text-[15px] placeholder:text-text-tertiary focus:border-accent outline-none font-sans transition-smooth"
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
              <label className="text-sm font-sans font-medium text-text-primary block mb-3">Training days per week</label>
              <div className="flex flex-wrap gap-2">
                {DAY_COUNTS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNumDays(n)}
                    className={`px-4 py-2.5 rounded-full text-sm font-sans font-semibold transition-smooth ${
                      numDays === n
                        ? 'bg-accent text-[#0a0a0a]'
                        : 'bg-bg-card text-text-primary border border-border hover:border-accent'
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
              className="pt-4 overflow-y-auto overflow-x-hidden flex-1 min-h-0"
              style={{ maxHeight: 'calc(90vh - 200px)', paddingBottom: '100px' }}
            >
              {days.slice(0, numDays).map((day, dayIndex) => (
                <div key={day.id} className="mb-6">
                  <label className="text-[11px] font-sans font-semibold text-text-secondary uppercase tracking-[0.2em] block mb-2">
                    Day {dayIndex + 1}
                  </label>
                  <input
                    type="text"
                    value={day.name}
                    onChange={(e) => setDayName(dayIndex, e.target.value)}
                    placeholder="e.g. Push, Pull, Legs"
                    className="w-full bg-bg-card border border-border rounded-[10px] px-3 py-2.5 text-text-primary text-sm mb-3 focus:border-accent outline-none font-sans transition-smooth"
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
        </div>

        <div className="flex-shrink-0 p-4 bg-bg-deep border-t border-border flex gap-2">
          {step > 1 ? (
            <Button type="button" variant="outline" onClick={handleBack} className="flex-1 h-12 rounded-[10px] bg-bg-card border-border text-text-primary font-sans">
              <ChevronLeft size={18} /> Back
            </Button>
          ) : (
            <div className="flex-1" />
          )}
          {step < 3 ? (
            <Button type="button" onClick={handleNext} className="flex-1 h-14 rounded-[10px] bg-accent text-[#0a0a0a] font-sans font-bold text-[15px] uppercase tracking-wider hover:bg-[#f0e8d8]">
              Continue <ChevronRight size={18} />
            </Button>
          ) : (
            <Button type="button" onClick={handleSave} disabled={!canSave} className="flex-1 h-14 rounded-[10px] bg-accent text-[#0a0a0a] font-sans font-bold text-[15px] uppercase tracking-wider hover:bg-[#f0e8d8] disabled:bg-bg-raised disabled:text-text-tertiary">
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
            className="flex items-center gap-2 bg-bg-card rounded-[10px] px-3 py-2 border border-border"
          >
            <div className="flex flex-col gap-0">
              <button type="button" onClick={() => onMoveUp(idx)} className="p-0.5 text-text-tertiary hover:text-text-primary transition-smooth">
                <ChevronRight size={14} className="rotate-[-90deg]" />
              </button>
              <button type="button" onClick={() => onMoveDown(idx)} className="p-0.5 text-text-tertiary hover:text-text-primary transition-smooth">
                <ChevronRight size={14} className="rotate-90" />
              </button>
            </div>
            <span className="flex-1 text-sm font-sans text-text-primary">{ex.name}</span>
            <button type="button" onClick={() => onRemove(ex.id)} className="p-1 text-text-tertiary hover:text-danger transition-smooth">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setShowPicker(true)}
        className="w-full py-2.5 rounded-[10px] border border-dashed border-border text-text-secondary text-sm font-sans font-medium flex items-center justify-center gap-2 hover:bg-bg-raised/50 transition-smooth"
      >
        <Plus size={16} /> Add exercises
      </button>

      {showPicker && (
        <Sheet open={showPicker} onOpenChange={setShowPicker}>
          <SheetContent side="bottom" className="rounded-t-3xl border-t border-border bg-bg-deep flex flex-col max-h-[85vh]">
            <SheetHeader className="flex-shrink-0">
              <SheetTitle className="text-text-primary font-sans font-semibold">Choose exercise</SheetTitle>
            </SheetHeader>
            <div
              className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-4 space-y-1"
              style={{ maxHeight: 'calc(70vh - 80px)' }}
            >
              {available.map((ex) => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => { onSelect(ex.id); setShowPicker(false); }}
                  className="w-full text-left px-4 py-3 rounded-[10px] bg-bg-card border border-border text-text-primary hover:border-accent font-sans transition-smooth"
                >
                  {ex.name}
                  <span className="text-xs text-text-secondary block">{ex.muscleGroup}</span>
                </button>
              ))}
              {available.length === 0 && (
                <p className="text-text-secondary text-sm font-sans text-center py-4">All exercises added</p>
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};

export default SplitBuilder;
