import React, { useState } from 'react';
import { format, isThisWeek } from 'date-fns';
import { ChevronRight, Dumbbell } from 'lucide-react';
import { WorkoutSession } from '@/types/workout';
import { AnimatePresence, motion } from 'framer-motion';

const TEMPLATE_BORDER_CLASSES: Record<string, string> = {
  'push-day': 'border-l-accent',
  'pull-day': 'border-l-[#888880]',
  'leg-day': 'border-l-[#666660]',
  'upper-body': 'border-l-[#aaa8a0]',
  'full-body': 'border-l-[#ccc8c0]',
};

interface HistoryTabProps {
  sessions: WorkoutSession[];
  settings: { units: 'kg' | 'lbs' };
  convertWeight: (kg: number) => number;
  onStartWorkout: () => void;
}

const HistoryTab: React.FC<HistoryTabProps> = ({ sessions, settings, convertWeight, onStartWorkout }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] px-8 text-center">
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Dumbbell size={56} className="text-text-tertiary mb-4" />
        </motion.div>
        <p className="text-xl font-sans font-semibold text-text-primary mb-2">No sessions yet</p>
        <p className="text-sm text-text-secondary font-sans mb-6">Your first rep is waiting. Let's go.</p>
        <motion.button
          whileTap={{ scale: 0.99 }}
          onClick={onStartWorkout}
          className="h-14 px-6 rounded-[10px] bg-accent text-primary-foreground font-sans font-bold text-[15px] uppercase tracking-wider"
        >
          Start workout
        </motion.button>
      </div>
    );
  }

  // Group by period
  const groups: { label: string; items: WorkoutSession[] }[] = [];
  const thisWeek: WorkoutSession[] = [];
  const lastWeek: WorkoutSession[] = [];
  const byMonth: Record<string, WorkoutSession[]> = {};

  sessions.forEach(s => {
    const d = new Date(s.startTime);
    if (isThisWeek(d, { weekStartsOn: 1 })) thisWeek.push(s);
    else if (isLastWeek(d)) lastWeek.push(s);
    else {
      const key = format(d, 'MMMM yyyy');
      (byMonth[key] ??= []).push(s);
    }
  });

  if (thisWeek.length) groups.push({ label: 'This Week', items: thisWeek });
  if (lastWeek.length) groups.push({ label: 'Last Week', items: lastWeek });
  Object.entries(byMonth).forEach(([label, items]) => groups.push({ label, items }));

  const formatDuration = (s: WorkoutSession) => {
    if (!s.endTime) return '';
    const mins = Math.round((new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 60000);
    return `${mins}m`;
  };

  const getBorderClass = (s: WorkoutSession) => {
    if (s.templateId && TEMPLATE_BORDER_CLASSES[s.templateId]) {
      return TEMPLATE_BORDER_CLASSES[s.templateId];
    }
    const name = s.templateName.toLowerCase();
    if (name.includes('push')) return 'border-l-accent';
    if (name.includes('pull')) return 'border-l-[#888880]';
    if (name.includes('leg')) return 'border-l-[#666660]';
    if (name.includes('upper')) return 'border-l-[#aaa8a0]';
    if (name.includes('full')) return 'border-l-[#ccc8c0]';
    return 'border-l-border';
  };

  return (
    <div className="px-4 pt-12 pb-24">
      <h1 className="font-display text-3xl font-normal italic text-text-primary mb-1" style={{ letterSpacing: '-1px' }}>Log</h1>
      <p className="text-sm text-text-secondary font-sans mb-6">Your training history</p>
      {groups.map(g => (
        <div key={g.label} className="mb-8">
          <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-text-secondary mb-3">{g.label}</p>
          <div className="space-y-2">
            {g.items.map(s => {
              const isExpanded = expandedId === s.id;
              return (
                <motion.div
                  key={s.id}
                  layout
                  className={`bg-bg-card border border-border border-l-[3px] border-l-accent p-4 cursor-pointer overflow-hidden transition-smooth ${getBorderClass(s)}`}
                  onClick={() => setExpandedId(prev => (prev === s.id ? null : s.id))}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(s.startTime), 'EEEE, MMMM d')}
                      </p>
                      <p className="font-semibold text-sm mt-0.5">{s.templateName}</p>
                    </div>
                    <div className="text-right mr-1">
                      <p className="text-xs text-muted-foreground">{formatDuration(s)}</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round(convertWeight(s.totalVolume))} {settings.units}
                      </p>
                    </div>
                    <motion.div
                      initial={false}
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                    >
                      <ChevronRight size={16} className="text-muted-foreground" />
                    </motion.div>
                  </div>

                  <AnimatePresence initial={false}>
                    {isExpanded && s.exercises && (
                      <motion.div
                        key="details"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.18 }}
                        className="mt-3 border-t border-border/60 pt-3 space-y-2"
                      >
                        {s.exercises.map(ex => (
                          <div
                            key={ex.id}
                            className="bg-card-elevated rounded-lg border border-border/70 p-3"
                          >
                            <p className="text-sm font-semibold mb-1">{ex.exerciseName}</p>
                            <div className="space-y-1">
                              {ex.sets
                                .filter(set => set.completed)
                                .map(set => (
                                  <p
                                    key={set.id}
                                    className="text-xs text-muted-foreground"
                                  >
                                    Set {set.setNumber}:{' '}
                                    {set.weight != null && set.reps != null
                                      ? `${Math.round(convertWeight(set.weight))} ${settings.units} × ${set.reps}`
                                      : '—'}
                                  </p>
                                ))}
                              {ex.sets.filter(set => set.completed).length === 0 && (
<p className="text-xs text-muted-foreground">
                                No sets logged
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// Helper
function isLastWeek(date: Date): boolean {
  const now = new Date();
  const lastWeekStart = new Date(now);
  lastWeekStart.setDate(now.getDate() - now.getDay() - 6);
  const lastWeekEnd = new Date(now);
  lastWeekEnd.setDate(now.getDate() - now.getDay());
  return date >= lastWeekStart && date < lastWeekEnd;
}

export default HistoryTab;
