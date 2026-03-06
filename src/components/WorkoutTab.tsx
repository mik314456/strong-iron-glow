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

/* 3px left border accent only — no gradients */
const TEMPLATE_LEFT_BORDER: Record<string, string> = {
  'push-day': '#e8e0d0',   /* platinum */
  'pull-day': '#888880',   /* muted steel */
  'leg-day': '#666660',    /* dark steel */
  'upper-body': '#aaa8a0', /* silver */
  'full-body': '#ccc8c0',  /* light platinum */
  'custom': '#333330',     /* near black */
};

const getTemplateIcon = (id: string, isSelected: boolean) => {
  const cls = `w-7 h-7 ${isSelected ? 'text-accent' : 'text-text-tertiary'}`;
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
    <div className="px-4 pt-12 pb-32">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-normal italic tracking-tight text-text-primary" style={{ letterSpacing: '-1px' }}>
          What are you training today?
        </h1>
        <p className="mt-2 text-sm text-text-secondary font-sans">
          {todayLabel}
        </p>
      </div>

      {/* Template Grid — solid #111, 3px left border only */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {templates.map((t) => {
          const isSelected = selectedId === t.id;
          const todayStr = format(new Date(), 'yyyy-MM-dd');
          const doneToday = sessions.some(s => format(new Date(s.startTime), 'yyyy-MM-dd') === todayStr && s.templateId === t.id);
          const leftBorder = TEMPLATE_LEFT_BORDER[t.id] ?? '#2a2a2a';
          return (
            <motion.button
              key={t.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedId(t.id)}
              className={`relative rounded-[16px] p-5 flex flex-col justify-between text-left border border-border transition-smooth ${
                isSelected
                  ? 'bg-bg-raised border-accent shadow-premium-active'
                  : 'bg-bg-card hover:bg-[#161616] hover:border-border-bright'
              }`}
              style={{
                borderLeftWidth: 3,
                borderLeftColor: isSelected ? '#e8e0d0' : leftBorder,
              }}
            >
              {doneToday && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-success flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <div className="flex items-center justify-center mt-1 mb-3">
                {getTemplateIcon(t.id, isSelected)}
              </div>
              <div>
                <p className="font-sans font-semibold text-[15px] text-text-primary">{t.name}</p>
                <p className="text-xs text-text-secondary mt-1 font-sans">
                  {t.exerciseIds.length} movements · ~{t.exerciseIds.length * 8} min
                </p>
              </div>
            </motion.button>
          );
        })}

        {/* Custom card */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setSelectedId('custom')}
          className={`relative rounded-[16px] p-5 flex flex-col justify-between text-left border border-dashed transition-smooth ${
            selectedId === 'custom'
              ? 'bg-bg-raised border-accent shadow-premium-active'
              : 'border-border bg-bg-card hover:bg-[#161616] hover:border-border-bright'
          }`}
          style={{
            borderLeftWidth: 3,
            borderLeftColor: selectedId ? '#e8e0d0' : '#333330',
          }}
        >
          <div className="flex items-center justify-center mt-1 mb-3">
            {getTemplateIcon('custom', selectedId === 'custom')}
          </div>
          <div>
            <p className="font-sans font-semibold text-[15px] text-text-primary">Custom</p>
            <p className="text-xs text-text-secondary mt-1 font-sans">Build your own session</p>
          </div>
        </motion.button>
      </div>

      {/* Primary button — 56px, platinum, no glow */}
      <div className="mb-8">
        <motion.button
          whileTap={{ scale: 0.99 }}
          disabled={!selectedId}
          onClick={handleStartSelected}
          className={`w-full flex items-center justify-center gap-2 font-sans font-bold text-[15px] uppercase tracking-wider rounded-[10px] transition-smooth ${
            selectedId
              ? 'h-14 bg-accent text-primary-foreground hover:bg-[#f0e8d8]'
              : 'h-14 bg-bg-raised text-text-tertiary border border-border cursor-not-allowed'
          }`}
        >
          <Play size={20} className={selectedId ? 'text-primary-foreground' : 'text-text-tertiary'} />
          <span>Start session</span>
        </motion.button>
      </div>

      {/* My Splits */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-text-secondary">
            My Splits
          </p>
          <button
            type="button"
            onClick={() => { setEditingSplit(null); setSplitBuilderOpen(true); }}
            className="text-sm font-sans font-semibold text-accent transition-smooth hover:opacity-90"
          >
            + Create
          </button>
        </div>
        {splits.length === 0 ? (
          <div className="rounded-[16px] border border-dashed border-border bg-bg-raised py-8 px-4 text-center">
            <p className="text-text-secondary text-sm font-sans mb-2">No custom splits yet</p>
            <p className="text-text-tertiary text-xs font-sans mb-4">Build a weekly schedule (e.g. PPL, Upper/Lower)</p>
            <button
              type="button"
              onClick={() => { setEditingSplit(null); setSplitBuilderOpen(true); }}
              className="text-accent text-sm font-sans font-semibold"
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
                className="bg-bg-card rounded-[16px] border border-border p-5 flex items-center justify-between transition-smooth"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-sans font-semibold text-text-primary truncate">{split.name}</p>
                  <p className="text-xs text-text-secondary mt-0.5 font-sans">{split.days.length} days · {split.days.map(d => d.name).join(', ')}</p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <motion.button
                    whileTap={{ scale: 0.99 }}
                    onClick={() => onStartFromSplit(split.id)}
                    className="px-4 py-2 rounded-[10px] bg-accent text-primary-foreground text-sm font-sans font-bold uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <Play size={16} /> Start
                  </motion.button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 rounded-lg hover:bg-bg-raised text-text-secondary transition-smooth">
                        <MoreVertical size={18} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-bg-card border-border">
                      <DropdownMenuItem className="text-text-primary focus:bg-bg-raised font-sans" onClick={() => { setEditingSplit(split); setSplitBuilderOpen(true); }}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-danger focus:bg-danger/10 font-sans" onClick={() => onDeleteSplit(split.id)}>
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
          <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-text-secondary mb-3">
            Recent activity
          </p>
          <div className="space-y-2">
            {recentSessions.map((s) => (
              <motion.div
                key={s.id}
                layout
                className="bg-bg-card rounded-[16px] border border-border p-4 flex items-center justify-between transition-smooth"
              >
                <div>
                  <p className="font-sans font-medium text-sm text-text-primary">{s.templateName}</p>
                  <p className="text-xs text-text-secondary mt-1 font-sans">
                    {format(new Date(s.startTime), 'EEE, MMM d')} · {Math.round(convertWeight(s.totalVolume))} {settings.units}
                  </p>
                </div>
                <ChevronRight size={20} className="text-text-tertiary" />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutTab;
