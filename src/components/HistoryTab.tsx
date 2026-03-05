import React from 'react';
import { format, isThisWeek } from 'date-fns';
import { ChevronRight, Dumbbell } from 'lucide-react';
import { WorkoutSession } from '@/types/workout';
import { motion } from 'framer-motion';

interface HistoryTabProps {
  sessions: WorkoutSession[];
  settings: { units: 'kg' | 'lbs' };
  convertWeight: (kg: number) => number;
  onStartWorkout: () => void;
}

const HistoryTab: React.FC<HistoryTabProps> = ({ sessions, settings, convertWeight, onStartWorkout }) => {
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] px-8 text-center">
        <Dumbbell size={64} className="text-muted-foreground/30 mb-4" />
        <p className="text-lg font-semibold mb-2">No workouts logged yet</p>
        <p className="text-sm text-muted-foreground mb-6">Start your first session</p>
        <button onClick={onStartWorkout} className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold text-sm">
          Start Workout
        </button>
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

  return (
    <div className="px-4 pt-12 pb-24">
      <h1 className="text-3xl font-bold mb-6">History</h1>
      {groups.map(g => (
        <div key={g.label} className="mb-6">
          <p className="text-sm font-semibold text-muted-foreground mb-2">{g.label}</p>
          <div className="space-y-2">
            {g.items.map(s => (
              <div key={s.id} className="bg-card rounded-lg border border-border p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{format(new Date(s.startTime), 'EEE, MMM d')}</span>
                  </div>
                  <p className="font-semibold text-sm mt-0.5">{s.templateName}</p>
                </div>
                <div className="text-right mr-2">
                  <p className="text-xs text-muted-foreground">{formatDuration(s)}</p>
                  <p className="text-xs text-muted-foreground">{Math.round(convertWeight(s.totalVolume))} {settings.units}</p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" />
              </div>
            ))}
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
