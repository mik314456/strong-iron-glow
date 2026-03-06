import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { WorkoutSession, PersonalRecord, AppSettings, UserProfile, TrainingGoal, ExperienceLevel } from '@/types/workout';
import { format, subWeeks, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { Trophy, Pencil } from 'lucide-react';
import { useUserProfile, DEFAULT_USER_PROFILE } from '@/hooks/useWorkoutStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface ProfileTabProps {
  sessions: WorkoutSession[];
  records: PersonalRecord[];
  settings: AppSettings;
  convertWeight: (kg: number) => number;
  updateSettings: (partial: Partial<AppSettings>) => void;
  onResetData: () => void;
}

function getWeightKg(p: UserProfile | null | undefined): number | null {
  if (!p) return null;
  try {
    if (p.weightKg != null && typeof p.weightKg === 'number' && !isNaN(p.weightKg)) return p.weightKg;
    if (p.weightLbs != null && typeof p.weightLbs === 'number' && !isNaN(p.weightLbs)) return p.weightLbs / 2.2046;
  } catch {}
  return null;
}
function getHeightM(p: UserProfile | null | undefined): number | null {
  if (!p) return null;
  try {
    if (p.heightCm != null && typeof p.heightCm === 'number' && !isNaN(p.heightCm)) return p.heightCm / 100;
    const ft = p.heightFeet != null && typeof p.heightFeet === 'number' ? p.heightFeet : null;
    const inch = p.heightInches != null && typeof p.heightInches === 'number' ? p.heightInches : 0;
    if (ft != null && !isNaN(ft)) return ft * 0.3048 + (inch || 0) * 0.0254;
  } catch {}
  return null;
}
function getWeightLbs(p: UserProfile | null | undefined): number | null {
  if (!p) return null;
  try {
    if (p.weightLbs != null && typeof p.weightLbs === 'number' && !isNaN(p.weightLbs)) return p.weightLbs;
    if (p.weightKg != null && typeof p.weightKg === 'number' && !isNaN(p.weightKg)) return p.weightKg * 2.2046;
  } catch {}
  return null;
}
function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}
function bmiColor(bmi: number): string {
  if (bmi < 18.5) return 'text-amber-400';
  if (bmi < 25) return 'text-emerald-400';
  if (bmi < 30) return 'text-orange-400';
  return 'text-red-400';
}
function mifflinStJeor(age: number, heightCm: number, weightKg: number): number {
  return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
}
function activityFactor(daysPerWeek: number | null): number {
  if (daysPerWeek == null || daysPerWeek < 2) return 1.2;
  return 1.2 + (daysPerWeek - 1) * 0.075;
}
const GOAL_LABELS: Record<TrainingGoal, string> = {
  build_muscle: 'Building Muscle',
  lose_fat: 'Losing Fat',
  get_stronger: 'Getting Stronger',
  stay_consistent: 'Staying Consistent',
};
const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

function safeFormatDate(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '—' : format(d, 'MMM d, yyyy');
  } catch {
    return '—';
  }
}

function safeDateTimestamp(dateStr: string | undefined): number {
  if (!dateStr) return 0;
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  } catch {
    return 0;
  }
}

function safeBmi(weightKg: number | null, heightM: number | null): number | null {
  try {
    if (weightKg == null || heightM == null || heightM <= 0 || typeof weightKg !== 'number' || typeof heightM !== 'number') return null;
    if (isNaN(weightKg) || isNaN(heightM)) return null;
    const bmi = weightKg / (heightM * heightM);
    return isNaN(bmi) || !isFinite(bmi) ? null : bmi;
  } catch {
    return null;
  }
}
function safeFfmi(weightKg: number | null, heightM: number | null, bodyFatPct: number | null | undefined): number | null {
  try {
    if (weightKg == null || heightM == null || heightM <= 0 || bodyFatPct == null) return null;
    if (typeof bodyFatPct !== 'number' || isNaN(bodyFatPct)) return null;
    const ffm = weightKg * (1 - bodyFatPct / 100);
    const ffmi = ffm / (heightM * heightM);
    return isNaN(ffmi) || !isFinite(ffmi) ? null : ffmi;
  } catch {
    return null;
  }
}
function safeMaintenanceCals(age: number | null, heightCm: number | null, weightKg: number | null, daysPerWeek: number | null): number | null {
  try {
    if (age == null || heightCm == null || weightKg == null) return null;
    if (typeof age !== 'number' || typeof heightCm !== 'number' || typeof weightKg !== 'number') return null;
    if (isNaN(age) || isNaN(heightCm) || isNaN(weightKg)) return null;
    const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    const factor = daysPerWeek == null || daysPerWeek < 2 ? 1.2 : 1.2 + (daysPerWeek - 1) * 0.075;
    const cals = bmr * factor;
    return isNaN(cals) || !isFinite(cals) ? null : Math.round(cals);
  } catch {
    return null;
  }
}
function safeProteinGrams(weightLbs: number | null): number | null {
  try {
    if (weightLbs == null || typeof weightLbs !== 'number' || isNaN(weightLbs)) return null;
    const g = weightLbs * 0.8;
    return isNaN(g) ? null : Math.round(g);
  } catch {
    return null;
  }
}

const SECTION_ERROR_FALLBACK = (
  <div className="py-4 px-4 rounded-[20px] bg-[#111111] border border-[#252525] text-white/60 text-sm text-center">
    Something went wrong
  </div>
);

const ProfileTab: React.FC<ProfileTabProps> = ({
  sessions, records, settings, convertWeight, updateSettings, onResetData,
}) => {
  const { profile: rawProfile, updateProfile } = useUserProfile();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const profile: UserProfile = React.useMemo(() => {
    const p = rawProfile ?? DEFAULT_USER_PROFILE;
    if (!p || typeof p !== 'object') return DEFAULT_USER_PROFILE;
    return {
      name: typeof p.name === 'string' ? p.name : (p.name ?? ''),
      age: p.age != null && typeof p.age === 'number' && !isNaN(p.age) ? p.age : null,
      heightCm: p.heightCm != null && typeof p.heightCm === 'number' && !isNaN(p.heightCm) ? p.heightCm : null,
      heightFeet: p.heightFeet != null && typeof p.heightFeet === 'number' && !isNaN(p.heightFeet) ? p.heightFeet : null,
      heightInches: p.heightInches != null && typeof p.heightInches === 'number' && !isNaN(p.heightInches) ? p.heightInches : null,
      heightUnit: p.heightUnit === 'ft' ? 'ft' : 'cm',
      weightKg: p.weightKg != null && typeof p.weightKg === 'number' && !isNaN(p.weightKg) ? p.weightKg : null,
      weightLbs: p.weightLbs != null && typeof p.weightLbs === 'number' && !isNaN(p.weightLbs) ? p.weightLbs : null,
      weightUnit: p.weightUnit === 'lbs' ? 'lbs' : 'kg',
      bodyFatPct: p.bodyFatPct != null && typeof p.bodyFatPct === 'number' && !isNaN(p.bodyFatPct) ? p.bodyFatPct : null,
      goal: p.goal != null && typeof p.goal === 'string' && p.goal in GOAL_LABELS ? (p.goal as TrainingGoal) : null,
      experience: p.experience != null && typeof p.experience === 'string' && p.experience in EXPERIENCE_LABELS ? (p.experience as ExperienceLevel) : null,
      daysPerWeek: p.daysPerWeek != null && typeof p.daysPerWeek === 'number' && !isNaN(p.daysPerWeek) ? p.daysPerWeek : null,
      completedOnboardingAt: typeof p.completedOnboardingAt === 'string' ? p.completedOnboardingAt : (p.completedOnboardingAt ?? null),
    };
  }, [rawProfile]);

  const safeSessions = Array.isArray(sessions) ? sessions : [];
  const safeRecords = Array.isArray(records) ? records : [];
  const totalVolume = safeSessions.reduce((s, w) => s + (w?.totalVolume ?? 0), 0);
  const avgDuration = useMemo(() => {
    const withEnd = safeSessions.filter(s => s?.endTime && s?.startTime);
    if (!withEnd.length) return 0;
    let totalMin = 0;
    withEnd.forEach(s => {
      const end = safeDateTimestamp(s.endTime!);
      const start = safeDateTimestamp(s.startTime);
      if (end > 0 && start > 0) totalMin += (end - start) / 60000;
    });
    return Math.round(totalMin / withEnd.length);
  }, [safeSessions]);

  // Streak (safe date handling)
  const streak = useMemo(() => {
    if (!safeSessions.length) return { current: 0, best: 0 };
    const days = new Set<string>();
    safeSessions.forEach(s => {
      try {
        const d = s?.startTime ? new Date(s.startTime) : null;
        if (d && !isNaN(d.getTime())) days.add(format(d, 'yyyy-MM-dd'));
      } catch {}
    });
    const sorted = Array.from(days).sort().reverse();
    let current = 0;
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
    if (sorted[0] === today || sorted[0] === yesterday) {
      current = 1;
      for (let i = 1; i < sorted.length; i++) {
        const t1 = safeDateTimestamp(sorted[i - 1]);
        const t2 = safeDateTimestamp(sorted[i]);
        if (t1 > 0 && t2 > 0 && (t1 - t2) / 86400000 <= 1) current++;
        else break;
      }
    }
    return { current, best: Math.max(current, 0) };
  }, [safeSessions]);

  // Most lifted exercise
  const topExercise = useMemo(() => {
    const volumes: Record<string, { name: string; vol: number }> = {};
    safeSessions.forEach(s => (s?.exercises ?? []).forEach(ex => {
      const v = ex.sets.filter(set => set.completed && !set.isWarmup).reduce((sum, set) => sum + (set.weight || 0) * (set.reps || 0), 0);
      if (!volumes[ex.exerciseId]) volumes[ex.exerciseId] = { name: ex.exerciseName, vol: 0 };
      volumes[ex.exerciseId].vol += v;
    }));
    const sorted = Object.values(volumes).sort((a, b) => b.vol - a.vol);
    return sorted[0]?.name || '—';
  }, [safeSessions]);

  // Weekly volume chart (safe dates)
  const weeklyData = useMemo(() => {
    const data: { week: string; volume: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 });
      let vol = 0;
      safeSessions.forEach(s => {
        const t = s?.startTime ? new Date(s.startTime) : null;
        if (t && !isNaN(t.getTime()) && isWithinInterval(t, { start: weekStart, end: weekEnd })) {
          vol += s.totalVolume ?? 0;
        }
      });
      try {
        data.push({ week: format(weekStart, 'MMM d'), volume: Math.round(typeof convertWeight === 'function' ? convertWeight(vol) : vol) });
      } catch {
        data.push({ week: format(weekStart, 'MMM d'), volume: 0 });
      }
    }
    return data;
  }, [safeSessions, convertWeight]);

  const stats = [
    { label: 'Total Workouts', value: safeSessions.length },
    { label: 'Total Volume', value: `${Math.round(convertWeight(totalVolume))} ${settings?.units ?? 'kg'}` },
    { label: 'Current Streak', value: `${streak.current} days` },
    { label: 'Best Streak', value: `${streak.best} days` },
    { label: 'Top Exercise', value: topExercise },
    { label: 'Avg Duration', value: `${avgDuration}m` },
  ];

  const sortedRecords = useMemo(
    () => [...safeRecords].sort(
      (a, b) => safeDateTimestamp(b?.achievedAt) - safeDateTimestamp(a?.achievedAt),
    ),
    [safeRecords],
  );

  const initials = useMemo(() => {
    const name = profile?.name?.trim() || settings?.userName?.trim();
    if (!name) return 'A';
    const parts = name.split(' ');
    const first = parts[0]?.[0] ?? '';
    const second = parts[1]?.[0] ?? '';
    return (first + second).toUpperCase();
  }, [profile?.name, settings?.userName]);

  const weightKg = getWeightKg(profile) ?? null;
  const heightM = getHeightM(profile) ?? null;
  const heightCm: number | null = (() => {
    try {
      if (profile.heightCm != null && typeof profile.heightCm === 'number' && !isNaN(profile.heightCm)) return profile.heightCm;
      const ft = profile.heightFeet ?? null;
      const inch = profile.heightInches ?? 0;
      if (ft != null && typeof ft === 'number' && !isNaN(ft)) return ft * 30.48 + (typeof inch === 'number' && !isNaN(inch) ? inch : 0) * 2.54;
      return null;
    } catch {
      return null;
    }
  })();
  const weightLbs = getWeightLbs(profile) ?? null;
  const bmi = safeBmi(weightKg, heightM);
  const ffmi = safeFfmi(weightKg, heightM, profile.bodyFatPct ?? null);
  const maintenanceCals = safeMaintenanceCals(profile.age ?? null, heightCm, weightKg, profile.daysPerWeek ?? null);
  const proteinGrams = safeProteinGrams(weightLbs);

  const openEdit = (field: string) => {
    setEditingField(field);
    const age = profile?.age ?? null;
    const heightCm = profile?.heightCm ?? null;
    const heightFeet = profile?.heightFeet ?? null;
    const heightInches = profile?.heightInches ?? 0;
    const weightKg = profile?.weightKg ?? null;
    const weightLbs = profile?.weightLbs ?? null;
    const bodyFatPct = profile?.bodyFatPct ?? null;
    if (field === 'age') setEditValue(age != null ? String(age) : '');
    else if (field === 'height') setEditValue(heightCm != null ? String(heightCm) : (heightFeet != null ? `${heightFeet},${heightInches}` : ''));
    else if (field === 'weight') setEditValue(weightKg != null ? String(weightKg) : (weightLbs != null ? String(weightLbs) : ''));
    else if (field === 'bodyfat') setEditValue(bodyFatPct != null ? String(bodyFatPct) : '');
  };

  const saveEdit = () => {
    if (!editingField) return;
    const heightUnit = profile?.heightUnit ?? 'cm';
    const weightUnit = profile?.weightUnit ?? 'kg';
    if (editingField === 'age') {
      const n = parseInt(editValue, 10);
      updateProfile({ age: isNaN(n) ? null : n });
    } else if (editingField === 'height') {
      if (heightUnit === 'ft') {
        const parts = editValue.split(',').map(s => parseInt(s.trim(), 10));
        const ft = parts[0];
        const inVal = parts[1];
        updateProfile({ heightFeet: ft != null && !isNaN(ft) ? ft : null, heightInches: inVal != null && !isNaN(inVal) ? inVal : null });
      } else {
        const n = parseFloat(editValue);
        updateProfile({ heightCm: isNaN(n) ? null : n });
      }
    } else if (editingField === 'weight') {
      if (weightUnit === 'lbs') {
        const n = parseFloat(editValue);
        updateProfile({ weightLbs: isNaN(n) ? null : n });
      } else {
        const n = parseFloat(editValue);
        updateProfile({ weightKg: isNaN(n) ? null : n });
      }
    } else if (editingField === 'bodyfat') {
      const n = parseFloat(editValue);
      updateProfile({ bodyFatPct: isNaN(n) ? null : Math.min(40, Math.max(5, n)) });
    }
    setEditingField(null);
  };

  const statRow = (label: string, value: string | number | null, onEdit?: () => void) => (
    <div key={label} className="flex items-center justify-between py-2 border-b border-[#252525] last:border-0">
      <span className="text-xs text-white/50">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-medium text-white">{value ?? '—'}</span>
        {onEdit && (
          <button type="button" onClick={onEdit} className="p-1 rounded hover:bg-white/10 text-white/40">
            <Pencil size={12} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <ErrorBoundary
      name="ProfileTab"
      fallback={
        <div className="px-4 pt-12 pb-24">
          <div className="py-8 px-4 rounded-[20px] bg-[#111111] border border-[#252525] text-white/80 text-center">
            <p className="font-semibold">Something went wrong</p>
            <p className="text-sm text-white/50 mt-2">The profile screen couldn’t load. Try refreshing.</p>
          </div>
        </div>
      }
    >
    <div className="px-4 pt-12 pb-24">
      {/* Your Body card */}
      <div className="bg-[#111111] rounded-[20px] border border-[#252525] p-5 mb-6 shadow-premium">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#f97316] to-[#ea580c] flex items-center justify-center text-xl font-bold text-white shadow-premium-glow">
            {initials}
          </div>
          <div className="flex-1">
            <input
              value={(profile?.name ?? '') || ''}
              onChange={(e) => {
                const v = e.target.value;
                updateProfile({ name: v });
                updateSettings({ userName: v });
              }}
              className="w-full bg-transparent outline-none text-xl font-semibold text-white placeholder:text-white/40"
              placeholder="Your name"
            />
            {profile.goal != null && profile.goal in GOAL_LABELS && (
              <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full bg-[#f97316]/20 text-[#f97316] text-xs font-semibold">
                {GOAL_LABELS[profile.goal as TrainingGoal]}
              </span>
            )}
            {profile.experience != null && profile.experience in EXPERIENCE_LABELS && (
              <p className="text-xs text-white/50 mt-1">{EXPERIENCE_LABELS[profile.experience as ExperienceLevel]}</p>
            )}
          </div>
        </div>
        <div className="space-y-0">
          {statRow('Age', (profile.age ?? null) != null ? String(profile.age) : null, () => openEdit('age'))}
          {statRow('Height', (profile.heightCm ?? null) != null ? `${profile.heightCm} cm` : ((profile.heightFeet ?? null) != null ? `${profile.heightFeet}'${profile.heightInches ?? 0}"` : null), () => openEdit('height'))}
          {statRow('Weight', weightKg != null ? `${Math.round((weightKg ?? 0) * 2) / 2} kg` : (weightLbs != null ? `${weightLbs} lbs` : null), () => openEdit('weight'))}
          {statRow('Body fat', (profile.bodyFatPct ?? null) != null ? `${profile.bodyFatPct}%` : null, () => openEdit('bodyfat'))}
        </div>
      </div>

      {/* Body Metrics */}
      <ErrorBoundary name="Body Metrics" fallback={SECTION_ERROR_FALLBACK}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40 mb-3">Progress metrics</p>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {bmi != null && (
            <div className="bg-[#111111] rounded-[20px] border border-[#252525] p-4">
              <p className="text-2xl font-bold text-white tabular-nums">{bmi.toFixed(1)}</p>
              <p className={`text-xs font-semibold mt-0.5 ${bmiColor(bmi)}`}>{bmiCategory(bmi)}</p>
              <p className="text-[11px] text-white/50 mt-1">BMI — body mass index</p>
            </div>
          )}
          {ffmi != null && (
            <div className="bg-[#111111] rounded-[20px] border border-[#252525] p-4">
              <p className="text-2xl font-bold text-white tabular-nums">{ffmi.toFixed(1)}</p>
              <p className="text-xs text-white/70 mt-0.5">FFMI</p>
              <p className="text-[11px] text-white/50 mt-1">Fat-free mass index</p>
            </div>
          )}
          {maintenanceCals != null && (
            <div className="bg-[#111111] rounded-[20px] border border-[#252525] p-4">
              <p className="text-2xl font-bold text-white tabular-nums">{maintenanceCals}</p>
              <p className="text-xs text-white/70 mt-0.5">kcal/day</p>
              <p className="text-[11px] text-white/50 mt-1">Est. maintenance</p>
            </div>
          )}
          {proteinGrams != null && (
            <div className="bg-[#111111] rounded-[20px] border border-[#252525] p-4">
              <p className="text-2xl font-bold text-white tabular-nums">{proteinGrams}g</p>
              <p className="text-xs text-white/70 mt-0.5">Protein</p>
              <p className="text-[11px] text-white/50 mt-1">Daily target</p>
            </div>
          )}
          {bmi == null && ffmi == null && maintenanceCals == null && proteinGrams == null && (
            <p className="col-span-2 text-sm text-white/50">Complete your body stats above to see metrics.</p>
          )}
        </div>
      </ErrorBoundary>

      {/* Stats Grid */}
      <ErrorBoundary name="Stats Grid" fallback={SECTION_ERROR_FALLBACK}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40 mb-3">Activity</p>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {stats.map(({ label, value }) => (
            <div
              key={label}
              className="bg-[#111111] rounded-[20px] border border-[#252525] border-l-2 border-l-[#f97316]/50 p-4 shadow-premium"
            >
              <p className="text-3xl font-bold tabular-nums text-white leading-tight">{value}</p>
              <p className="text-xs text-white/50 mt-1 uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>
      </ErrorBoundary>

      {/* Weekly Volume Chart — fixed height to avoid Recharts zero-height crash */}
      <ErrorBoundary name="Weekly Volume Chart" fallback={SECTION_ERROR_FALLBACK}>
        <p className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-3">Weekly volume</p>
        <div className="bg-[#111111] rounded-[20px] border border-[#252525] p-4 mb-6 w-full shadow-premium">
          <div className="w-full" style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'hsl(0,0%,63%)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(0,0%,63%)' }} width={40} />
                <Tooltip contentStyle={{ backgroundColor: '#1c1c1c', border: '1px solid #2a2a2a', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="volume" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </ErrorBoundary>

      {/* Personal Records */}
      <ErrorBoundary name="Personal Records" fallback={SECTION_ERROR_FALLBACK}>
        {sortedRecords.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-3">Personal bests</p>
            <div className="space-y-2">
              {sortedRecords.map((r) => (
                <div
                  key={`${r.exerciseId}-${r.achievedAt}`}
                  className="bg-[#111111] rounded-[20px] border border-[#252525] p-4 flex items-center justify-between shadow-premium"
                >
                  <div className="w-10 h-10 rounded-full bg-[#f97316]/20 border border-[#f97316]/40 flex items-center justify-center mr-3">
                    <Trophy size={18} className="text-[#f97316]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{r.exerciseName}</p>
                    <p className="text-xs text-white/50 mt-0.5 tabular-nums">
                      {Math.round(convertWeight(r?.weight ?? 0) * 10) / 10} {settings?.units ?? 'kg'} × {r?.reps ?? 0}
                    </p>
                  </div>
                  <p className="text-xs text-white/40 ml-3">
                    {safeFormatDate(r.achievedAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </ErrorBoundary>

      {/* Settings */}
      <ErrorBoundary name="Settings" fallback={SECTION_ERROR_FALLBACK}>
        <p className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-3">Preferences</p>
        <div className="space-y-3">
          <div className="bg-[#111111] rounded-[20px] border border-[#252525] p-4 flex items-center justify-between shadow-premium">
            <span className="text-sm text-white/80">Units</span>
            <div className="flex bg-[#0a0a0a] rounded-full overflow-hidden border border-[#252525] p-0.5">
              {(['kg', 'lbs'] as const).map(u => (
                <button
                  key={u}
                  onClick={() => updateSettings({ units: u })}
                  className={`px-4 py-2 text-xs font-semibold rounded-full transition-colors ${
                    (settings?.units ?? 'kg') === u ? 'bg-[#f97316] text-white' : 'text-white/50'
                  }`}
                >{u.toUpperCase()}</button>
              ))}
            </div>
          </div>
          <div className="bg-[#111111] rounded-[20px] border border-[#252525] p-4 shadow-premium">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/80">Rest timer</span>
              <span className="text-sm text-[#f97316] font-semibold tabular-nums">{settings?.restTimerDuration ?? 90}s</span>
            </div>
            <input
              type="range"
              min={30}
              max={300}
              step={15}
              value={settings?.restTimerDuration ?? 90}
              onChange={(e) => updateSettings({ restTimerDuration: Number(e.target.value) })}
              className="w-full accent-[#f97316]"
            />
          </div>
          <div className="bg-[#111111] rounded-[20px] border border-[#252525] p-4 flex items-center justify-between shadow-premium">
            <span className="text-sm text-white/80">Bodyweight</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="decimal"
                value={settings?.bodyweight ?? ''}
                onChange={(e) => updateSettings({ bodyweight: e.target.value ? Number(e.target.value) : null })}
                placeholder="—"
                className="w-20 bg-[#0a0a0a] border border-[#252525] rounded-xl px-3 py-2 text-sm text-right text-white outline-none focus:border-[#f97316]/50"
              />
              <span className="text-xs text-white/50">{settings?.units ?? 'kg'}</span>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.99 }}
            onClick={() => setShowResetConfirm(true)}
            className="w-full bg-transparent rounded-[20px] border border-[#ef4444]/40 p-4 text-sm text-[#ef4444] font-semibold text-center hover:bg-[#ef4444]/10 transition-colors"
          >
            Clear all data
          </motion.button>
          {showResetConfirm && (
            <div className="bg-[#111111] rounded-[20px] border border-[#ef4444]/40 p-4 space-y-3 shadow-premium">
              <p className="text-sm text-white/90 font-medium">This will permanently delete all workouts, exercises, and records. This cannot be undone.</p>
              <div className="flex gap-3">
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowResetConfirm(false)} className="flex-1 py-2.5 rounded-xl bg-white/10 border border-[#252525] text-sm text-white/80 font-semibold">Cancel</motion.button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => { onResetData(); setShowResetConfirm(false); }} className="flex-1 py-2.5 rounded-xl bg-[#ef4444] text-white text-sm font-semibold">Delete everything</motion.button>
              </div>
            </div>
          )}
        </div>
      </ErrorBoundary>

      {editingField && (
        <Dialog open={true} onOpenChange={(open) => !open && setEditingField(null)}>
          <DialogContent className="bg-[#111111] border-[#252525] text-white">
          <DialogHeader>
            <DialogTitle>
              {editingField === 'age' && 'Age'}
              {editingField === 'height' && ((profile?.heightUnit ?? 'cm') === 'ft' ? 'Height (ft, in)' : 'Height (cm)')}
              {editingField === 'weight' && ((profile?.weightUnit ?? 'kg') === 'lbs' ? 'Weight (lbs)' : 'Weight (kg)')}
              {editingField === 'bodyfat' && 'Body fat %'}
            </DialogTitle>
          </DialogHeader>
          <input
            type="text"
            inputMode={editingField === 'age' || editingField === 'bodyfat' ? 'numeric' : 'decimal'}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder={editingField === 'height' && (profile?.heightUnit ?? 'cm') === 'ft' ? '5, 10' : ''}
            className="w-full bg-[#0a0a0a] border border-[#252525] rounded-xl px-4 py-3 text-white focus:border-[#f97316]/50 outline-none"
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditingField(null)} className="flex-1 rounded-full bg-[#111111] border-[#252525] text-white">Cancel</Button>
            <Button onClick={saveEdit} className="flex-1 rounded-full bg-[#f97316] text-white">Save</Button>
          </div>
        </DialogContent>
        </Dialog>
      )}
    </div>
    </ErrorBoundary>
  );
};

export default ProfileTab;
