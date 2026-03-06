import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Play,
  ChevronRight,
  Dumbbell,
  ArrowDown,
  Footprints,
  Users,
  Zap,
  MoreVertical,
} from 'lucide-react';
import { WorkoutTemplate, WorkoutSession, SessionExercise, Exercise, TrainingSplit } from '@/types/workout';
import { MUSCLE_GROUP_COLORS } from '@/data/exercises';
import ActiveWorkoutScreen from './ActiveWorkoutScreen';
import SplitBuilder from './SplitBuilder';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

interface WorkoutTabProps {
  templates: WorkoutTemplate[];
  splits: TrainingSplit[];
  exercises: Exercise[];
  sessions: WorkoutSession[];
  activeWorkout: { session: WorkoutSession; exercises: SessionExercise[]; startTime: string } | null;
  onStartWorkout: (template: WorkoutTemplate | null) => void;
  onStartFromSplit: (splitId: string) => void;
  onAddSplit: (split: TrainingSplit) => void;
  onUpdateSplit: (id: string, updates: Partial<TrainingSplit>) => void;
  onDeleteSplit: (id: string) => void;
  onFinishWorkout: (session: WorkoutSession) => void;
  onDiscardWorkout: () => void;
  onUpdateActiveWorkout: (workout: { session: WorkoutSession; exercises: SessionExercise[]; startTime: string }) => void;
  settings: { units: 'kg' | 'lbs'; restTimerDuration: number };
  convertWeight: (kg: number) => number;
  toKg: (display: number) => number;
  checkAndUpdatePR: (exerciseId: string, exerciseName: string, weight: number, reps: number) => any;
}

const getTemplateIcon = (id: string) => {
  const cls = 'w-10 h-10 text-white';
  switch (id) {
    case 'push-day':
      return <Dumbbell className={cls} />;
    case 'pull-day':
      return <ArrowDown className={cls} />;
    case 'leg-day':
      return <Footprints className={cls} />;
    case 'upper-body':
      return <Users className={cls} />;
    case 'full-body':
      return <Zap className={cls} />;
    case 'custom':
      return <Plus className={cls} />;
    default:
      return <Dumbbell className={cls} />;
  }
};

const getTemplateGradient = (id: string) => {
  switch (id) {
    case 'push-day':
      return 'bg-gradient-to-br from-[#1e3a8a] via-[#4f46e5] to-[#020617]';
    case 'pull-day':
      return 'bg-gradient-to-br from-[#14532d] via-[#0d9488] to-[#020617]';
    case 'leg-day':
      return 'bg-gradient-to-br from-[#7c2d12] via-[#ea580c] to-[#020617]';
    case 'upper-body':
      return 'bg-gradient-to-br from-[#312e81] via-[#1d4ed8] to-[#020617]';
    case 'full-body':
      return 'bg-gradient-to-br from-[#78350f] via-[#ea580c] to-[#020617]';
    default:
      return 'bg-[#111111]';
  }
};

const WorkoutTab: React.FC<WorkoutTabProps> = ({
  templates, splits, exercises, sessions, activeWorkout,
  onStartWorkout, onStartFromSplit, onAddSplit, onUpdateSplit, onDeleteSplit,
  onFinishWorkout, onDiscardWorkout, onUpdateActiveWorkout,
  settings, convertWeight, toKg, checkAndUpdatePR,
}) => {
  const [selectedId, setSelectedId] = useState<string | 'custom' | null>(null);
  const [splitBuilderOpen, setSplitBuilderOpen] = useState(false);
  const [editingSplit, setEditingSplit] = useState<TrainingSplit | null>(null);

  if (activeWorkout) {
    return (
      <ActiveWorkoutScreen
        workout={activeWorkout}
        exercises={exercises}
        sessions={sessions}
        onFinish={onFinishWorkout}
        onDiscard={onDiscardWorkout}
        onUpdate={onUpdateActiveWorkout}
        settings={settings}
        convertWeight={convertWeight}
        toKg={toKg}
        checkAndUpdatePR={checkAndUpdatePR}
      />
    );
  }

  const recentSessions = sessions.slice(0, 3);
  const todayLabel = format(new Date(), 'EEEE, MMMM d');

  const handleStartSelected = () => {
    if (!selectedId) return;
    const template = selectedId === 'custom'
      ? null
      : templates.find(t => t.id === selectedId) || null;
    onStartWorkout(template);
  };

  return (
    <div className="px-4 pt-12 pb-24">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          What are you training today?
        </h1>
        <p className="mt-2 text-sm text-white/50">
          {todayLabel}
        </p>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {templates.map((t) => {
          const isSelected = selectedId === t.id;
          const todayStr = format(new Date(), 'yyyy-MM-dd');
          const doneToday = sessions.some(s => format(new Date(s.startTime), 'yyyy-MM-dd') === todayStr && s.templateId === t.id);
          return (
            <motion.button
              key={t.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedId(t.id)}
              className={`relative h-40 rounded-[20px] px-4 py-4 flex flex-col justify-between text-left overflow-hidden border shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_4px_24px_rgba(0,0,0,0.4)] ${
                isSelected ? 'ring-2 ring-offset-2 ring-offset-black ring-[#f97316] border-2 border-[#f97316]' : 'border-[#252525]'
              } ${getTemplateGradient(t.id)}`}
            >
              {/* Large blurred gradient glow behind */}
              <div className={`pointer-events-none absolute -inset-8 opacity-70 blur-3xl ${getTemplateGradient(t.id)}`} />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
              {!doneToday && (
                <div className="pointer-events-none absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent" />
              )}
              {doneToday && (
                <div className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-[#22c55e] flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <div className="relative z-10 flex items-center justify-center mt-2 mb-4">
                {getTemplateIcon(t.id)}
              </div>
              <div className="relative z-10">
                <p className="font-semibold text-[15px] text-white">{t.name}</p>
                <p className="text-xs text-white/60 mt-1">
                  {t.exerciseIds.length} movements · ~{t.exerciseIds.length * 8} min
                </p>
              </div>
            </motion.button>
          );
        })}

        {/* Custom card */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setSelectedId('custom')}
          className={`relative h-40 rounded-[20px] px-4 py-4 flex flex-col justify-between text-left overflow-hidden bg-[#111111] border-2 border-dashed ${
            selectedId === 'custom' ? 'border-[#f97316] ring-2 ring-offset-2 ring-offset-black ring-[#f97316]' : 'border-[#252525]'
          } shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_4px_24px_rgba(0,0,0,0.4)]`}
        >
          <div className="flex items-center justify-center mt-2 mb-4">
            {getTemplateIcon('custom')}
          </div>
          <div>
            <p className="font-semibold text-[15px] text-white">Custom</p>
            <p className="text-xs text-white/60 mt-1">Build your own session</p>
          </div>
        </motion.button>
      </div>

      <div className="mb-8">
        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={!selectedId}
          onClick={handleStartSelected}
          className={`w-full h-12 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
            selectedId
              ? 'bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_4px_24px_rgba(0,0,0,0.4)]'
              : 'bg-[#111111] text-muted-foreground border border-[#252525] cursor-not-allowed'
          }`}
        >
          <Play size={20} className={selectedId ? 'text-white' : 'text-white/40'} />
          <span>Start session</span>
        </motion.button>
      </div>

      {/* My Splits */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">
            My Splits
          </p>
          <button
            type="button"
            onClick={() => { setEditingSplit(null); setSplitBuilderOpen(true); }}
            className="text-sm font-semibold text-[#f97316] hover:text-[#ea580c]"
          >
            + Create
          </button>
        </div>
        {splits.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-[#252525] bg-[#111111]/50 py-8 px-4 text-center">
            <p className="text-white/50 text-sm mb-2">No custom splits yet</p>
            <p className="text-white/40 text-xs mb-4">Build a weekly schedule (e.g. PPL, Upper/Lower)</p>
            <button
              type="button"
              onClick={() => { setEditingSplit(null); setSplitBuilderOpen(true); }}
              className="text-[#f97316] text-sm font-semibold"
            >
              Create your first split
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {splits.map((split) => (
              <motion.div
                key={split.id}
                layout
                className="bg-[#111111] rounded-[20px] border border-[#252525] p-4 flex items-center justify-between shadow-[0_0_0_1px_rgba(255,255,255,0.05)]"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{split.name}</p>
                  <p className="text-xs text-white/50 mt-0.5">{split.days.length} days · {split.days.map(d => d.name).join(', ')}</p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onStartFromSplit(split.id)}
                    className="px-4 py-2 rounded-full bg-[#f97316] text-white text-sm font-semibold flex items-center gap-1.5"
                  >
                    <Play size={16} /> Start
                  </motion.button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 rounded-full hover:bg-white/10 text-white/60">
                        <MoreVertical size={18} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#111111] border-[#252525]">
                      <DropdownMenuItem className="text-white focus:bg-white/10" onClick={() => { setEditingSplit(split); setSplitBuilderOpen(true); }}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-400 focus:bg-red-500/10 focus:text-red-400" onClick={() => onDeleteSplit(split.id)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <SplitBuilder
        open={splitBuilderOpen}
        onClose={() => { setSplitBuilderOpen(false); setEditingSplit(null); }}
        exercises={exercises}
        initialSplit={editingSplit}
        onSave={(split) => {
          if (editingSplit) {
            onUpdateSplit(split.id, { name: split.name, days: split.days, updatedAt: split.updatedAt });
          } else {
            onAddSplit(split as TrainingSplit);
          }
        }}
      />

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <div className="mt-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40 mb-3">
            Recent activity
          </p>
          <div className="space-y-2">
            {recentSessions.map((s) => (
              <motion.div
                key={s.id}
                layout
                className="bg-[#111111] rounded-[20px] border border-[#252525] p-4 flex items-center justify-between shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_4px_24px_rgba(0,0,0,0.4)]"
              >
                <div>
                  <p className="font-medium text-sm text-white">{s.templateName}</p>
                  <p className="text-xs text-secondary mt-1">
                    {format(new Date(s.startTime), 'EEE, MMM d')} · {Math.round(convertWeight(s.totalVolume))} {settings.units}
                  </p>
                </div>
                <ChevronRight size={20} className="text-muted-foreground" />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutTab;
