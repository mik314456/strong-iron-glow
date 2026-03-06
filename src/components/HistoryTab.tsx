import React, { useState } from 'react';
import { format, isThisWeek } from 'date-fns';
import { ChevronRight, Dumbbell } from 'lucide-react';
import { WorkoutSession } from '@/types/workout';
import { AnimatePresence, motion } from 'framer-motion';

const TEMPLATE_BORDER_CLASSES: Record<string, string> = {
  'push-day': 'border-l-sky-500',
  'pull-day': 'border-l-emerald-500',
  'leg-day': 'border-l-orange-500',
  'upper-body': 'border-l-indigo-500',
  'full-body': 'border-l-amber-400',
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
        <Dumbbell size={56} className="text-white/20 mb-4" />
        <p className="text-xl font-bold text-white mb-2">No sessions yet</p>
        <p className="text-sm text-white/50 mb-6">Your first rep is waiting. Let's go.</p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onStartWorkout}
          className="bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white px-6 py-3.5 rounded-full font-semibold text-sm shadow-premium-glow"
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
    if (name.includes('push')) return 'border-l-sky-500';
    if (name.includes('pull')) return 'border-l-emerald-500';
    if (name.includes('leg')) return 'border-l-orange-500';
    if (name.includes('upper')) return 'border-l-indigo-500';
    if (name.includes('full')) return 'border-l-amber-400';
    return 'border-l-slate-700';
  };

  return (
    <div className="px-4 pt-12 pb-24">
      <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Log</h1>
      <p className="text-sm text-white/50 mb-6">Your training history</p>
      {groups.map(g => (
        <div key={g.label} className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">{g.label}</p>
          <div className="space-y-2">
            {g.items.map(s => {
              const isExpanded = expandedId === s.id;
              return (
                <motion.div
                  key={s.id}
                  layout
                  className={`bg-[#111111] rounded-[20px] border border-[#252525] p-4 cursor-pointer overflow-hidden border-l-4 shadow-premium ${getBorderClass(s)}`}
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
                                <p className="text-xs text-white/40">
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
