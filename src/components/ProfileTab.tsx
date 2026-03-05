import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { WorkoutSession, PersonalRecord, AppSettings } from '@/types/workout';
import { format, subWeeks, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

interface ProfileTabProps {
  sessions: WorkoutSession[];
  records: PersonalRecord[];
  settings: AppSettings;
  convertWeight: (kg: number) => number;
  updateSettings: (partial: Partial<AppSettings>) => void;
  onResetData: () => void;
}

const ProfileTab: React.FC<ProfileTabProps> = ({
  sessions, records, settings, convertWeight, updateSettings, onResetData,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const totalVolume = sessions.reduce((s, w) => s + w.totalVolume, 0);
  const avgDuration = sessions.length > 0
    ? Math.round(sessions.filter(s => s.endTime).reduce((sum, s) =>
        sum + (new Date(s.endTime!).getTime() - new Date(s.startTime).getTime()) / 60000, 0) / sessions.length)
    : 0;

  // Streak
  const streak = useMemo(() => {
    if (!sessions.length) return { current: 0, best: 0 };
    const days = new Set(sessions.map(s => format(new Date(s.startTime), 'yyyy-MM-dd')));
    const sorted = Array.from(days).sort().reverse();
    let current = 0;
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
    if (sorted[0] === today || sorted[0] === yesterday) {
      current = 1;
      for (let i = 1; i < sorted.length; i++) {
        const diff = (new Date(sorted[i - 1]).getTime() - new Date(sorted[i]).getTime()) / 86400000;
        if (diff <= 1) current++;
        else break;
      }
    }
    return { current, best: Math.max(current, 0) };
  }, [sessions]);

  // Most lifted exercise
  const topExercise = useMemo(() => {
    const volumes: Record<string, { name: string; vol: number }> = {};
    sessions.forEach(s => s.exercises?.forEach(ex => {
      const v = ex.sets.filter(s => s.completed).reduce((sum, s) => sum + (s.weight || 0) * (s.reps || 0), 0);
      if (!volumes[ex.exerciseId]) volumes[ex.exerciseId] = { name: ex.exerciseName, vol: 0 };
      volumes[ex.exerciseId].vol += v;
    }));
    const sorted = Object.values(volumes).sort((a, b) => b.vol - a.vol);
    return sorted[0]?.name || '—';
  }, [sessions]);

  // Weekly volume chart
  const weeklyData = useMemo(() => {
    const data: { week: string; volume: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 });
      const vol = sessions
        .filter(s => isWithinInterval(new Date(s.startTime), { start: weekStart, end: weekEnd }))
        .reduce((sum, s) => sum + s.totalVolume, 0);
      data.push({ week: format(weekStart, 'MMM d'), volume: Math.round(convertWeight(vol)) });
    }
    return data;
  }, [sessions, convertWeight]);

  const stats = [
    { label: 'Total Workouts', value: sessions.length },
    { label: 'Total Volume', value: `${Math.round(convertWeight(totalVolume))} ${settings.units}` },
    { label: 'Current Streak', value: `${streak.current} days` },
    { label: 'Best Streak', value: `${streak.best} days` },
    { label: 'Top Exercise', value: topExercise },
    { label: 'Avg Duration', value: `${avgDuration}m` },
  ];

  return (
    <div className="px-4 pt-12 pb-24">
      <input
        value={settings.userName}
        onChange={(e) => updateSettings({ userName: e.target.value })}
        className="text-3xl font-bold bg-transparent outline-none mb-6 w-full"
        placeholder="Your Name"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {stats.map(({ label, value }) => (
          <div key={label} className="bg-card rounded-lg border border-border p-4">
            <p className="text-xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Weekly Chart */}
      <p className="text-sm font-semibold mb-3">Weekly Volume</p>
      <div className="bg-card rounded-lg border border-border p-4 mb-8 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyData}>
            <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'hsl(0,0%,63%)' }} />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(0,0%,63%)' }} width={40} />
            <Tooltip contentStyle={{ backgroundColor: '#1c1c1c', border: '1px solid #2a2a2a', borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="volume" fill="#f97316" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Settings */}
      <p className="text-sm font-semibold mb-3">Settings</p>
      <div className="space-y-3">
        {/* Units */}
        <div className="bg-card rounded-lg border border-border p-4 flex items-center justify-between">
          <span className="text-sm">Units</span>
          <div className="flex bg-card-elevated rounded-lg overflow-hidden border border-border">
            {(['kg', 'lbs'] as const).map(u => (
              <button
                key={u}
                onClick={() => updateSettings({ units: u })}
                className={`px-4 py-2 text-xs font-semibold transition-colors ${
                  settings.units === u ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                }`}
              >{u.toUpperCase()}</button>
            ))}
          </div>
        </div>

        {/* Rest Timer */}
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Default Rest Timer</span>
            <span className="text-sm text-primary font-semibold">{settings.restTimerDuration}s</span>
          </div>
          <input
            type="range"
            min={30}
            max={300}
            step={15}
            value={settings.restTimerDuration}
            onChange={(e) => updateSettings({ restTimerDuration: Number(e.target.value) })}
            className="w-full accent-primary"
          />
        </div>

        {/* Bodyweight */}
        <div className="bg-card rounded-lg border border-border p-4 flex items-center justify-between">
          <span className="text-sm">Bodyweight</span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="decimal"
              value={settings.bodyweight ?? ''}
              onChange={(e) => updateSettings({ bodyweight: e.target.value ? Number(e.target.value) : null })}
              placeholder="—"
              className="w-20 bg-card-elevated border border-border rounded-md px-3 py-2 text-sm text-right outline-none focus:border-primary"
            />
            <span className="text-xs text-muted-foreground">{settings.units}</span>
          </div>
        </div>

        {/* Reset */}
        <button
          onClick={() => setShowResetConfirm(true)}
          className="w-full bg-card rounded-lg border border-destructive/30 p-4 text-sm text-destructive font-semibold text-center"
        >
          Reset All Data
        </button>

        {showResetConfirm && (
          <div className="bg-card rounded-lg border border-destructive p-4 space-y-3">
            <p className="text-sm text-destructive font-semibold">Are you sure? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-2 rounded-lg bg-card-elevated border border-border text-sm">Cancel</button>
              <button onClick={() => { onResetData(); setShowResetConfirm(false); }} className="flex-1 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold">Delete Everything</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileTab;
