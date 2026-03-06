import React, { useState, useMemo } from 'react';
import { Search, Plus, ChevronRight, TrendingUp } from 'lucide-react';
import { Exercise, MuscleGroup, WorkoutSession, PersonalRecord } from '@/types/workout';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { format } from 'date-fns';

const FILTERS: (MuscleGroup | 'All')[] = ['All', 'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Cardio'];

interface ExercisesTabProps {
  exercises: Exercise[];
  sessions: WorkoutSession[];
  records: PersonalRecord[];
  settings: { units: 'kg' | 'lbs' };
  convertWeight: (kg: number) => number;
  onAddExercise: (ex: Exercise) => void;
}

const ExercisesTab: React.FC<ExercisesTabProps> = ({
  exercises, sessions, records, settings, convertWeight, onAddExercise,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<MuscleGroup | 'All'>('All');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const filtered = useMemo(() => {
    return exercises.filter(e => {
      if (filter !== 'All' && e.muscleGroup !== filter) return false;
      if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [exercises, filter, search]);

  const getExerciseHistory = (exerciseId: string) => {
    const history: { date: string; volume: number; topWeight: number; topReps: number; setCount: number }[] = [];
    sessions.forEach(s => {
      const ex = s.exercises?.find(e => e.exerciseId === exerciseId);
      if (ex) {
        const workingSets = ex.sets.filter(set => set.completed && !set.isWarmup);
        const volume = workingSets.reduce((sum, set) => sum + (set.weight || 0) * (set.reps || 0), 0);
        const topSet = [...workingSets].sort((a, b) => (b.weight || 0) - (a.weight || 0))[0];
        history.push({
          date: format(new Date(s.startTime), 'MMM d'),
          volume: Math.round(convertWeight(volume)),
          topWeight: topSet ? convertWeight(topSet.weight || 0) : 0,
          topReps: topSet?.reps || 0,
          setCount: workingSets.length,
        });
      }
    });
    return history.reverse();
  };

  return (
    <div className="px-4 pt-12 pb-24">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-display text-3xl font-normal italic text-text-primary" style={{ letterSpacing: '-1px' }}>Library</h1>
          <p className="text-sm text-text-secondary font-sans mt-0.5">Exercises & movements</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.99 }}
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 h-12 px-4 rounded-[10px] bg-accent text-primary-foreground font-sans font-bold text-[13px] uppercase tracking-wider"
        >
          <Plus size={18} /> New
        </motion.button>
      </div>

      {/* Search — 48px height, bg #111, border #222, focus #e8e0d0 */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search movements..."
          className="w-full h-12 bg-bg-card border border-[#222] rounded-[10px] pl-11 pr-4 text-[15px] text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent font-sans transition-smooth"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 -mx-4 px-4">
        {FILTERS.map(f => (
          <motion.button
            key={f}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-[11px] font-sans font-semibold flex-shrink-0 border transition-smooth ${
              filter === f
                ? 'bg-bg-raised text-text-primary border-accent'
                : 'bg-bg-card border-border text-text-secondary hover:border-border-bright'
            }`}
          >
            {f}
          </motion.button>
        ))}
      </div>

      {/* List — subtle dividers */}
      <div className="space-y-2">
        {filtered.map(ex => (
          <motion.button
            key={ex.id}
            whileTap={{ scale: 0.99 }}
            onClick={() => setSelectedExercise(ex)}
            className="w-full bg-transparent border-b border-bg-raised py-4 flex items-center justify-between text-left transition-smooth"
          >
            <div>
              <p className="font-sans font-semibold text-text-primary">{ex.name}</p>
              <div className="flex gap-2 mt-1.5">
                <span className="text-[11px] font-sans px-2.5 py-1 rounded-full bg-bg-raised border border-border text-text-secondary">{ex.muscleGroup}</span>
                <span className="text-[11px] font-sans px-2.5 py-1 rounded-full bg-[#222] border border-border text-text-secondary">{ex.equipment}</span>
              </div>
            </div>
            <ChevronRight size={20} className="text-muted-foreground" />
          </motion.button>
        ))}
      </div>

      {/* Exercise Detail Sheet */}
      <AnimatePresence>
        {selectedExercise && (
          <ExerciseDetail
            exercise={selectedExercise}
            history={getExerciseHistory(selectedExercise.id)}
            record={records.find(r => r.exerciseId === selectedExercise.id)}
            settings={settings}
            convertWeight={convertWeight}
            onClose={() => setSelectedExercise(null)}
          />
        )}
      </AnimatePresence>

      {/* Create Exercise Sheet */}
      <AnimatePresence>
        {showCreate && (
          <CreateExerciseSheet
            onClose={() => setShowCreate(false)}
            onSave={(ex) => { onAddExercise(ex); setShowCreate(false); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const ExerciseDetail: React.FC<{
  exercise: Exercise;
  history: { date: string; volume: number; topWeight: number; topReps: number; setCount: number }[];
  record?: PersonalRecord;
  settings: { units: 'kg' | 'lbs' };
  convertWeight: (kg: number) => number;
  onClose: () => void;
}> = ({ exercise, history, record, settings, convertWeight, onClose }) => {
  const chartData = history.slice(-10);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto"
    >
      <div className="px-4 pt-12 pb-24 max-w-lg mx-auto">
        <button onClick={onClose} className="text-primary text-sm font-semibold mb-4 hover:underline">← Back</button>
        <h2 className="text-2xl font-bold tracking-tight text-foreground mb-1">{exercise.name}</h2>
        <div className="flex gap-2 mb-6">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-teal-900/60 text-teal-200 border border-teal-700/50">{exercise.muscleGroup}</span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-700/60 text-zinc-300 border border-zinc-600/40">{exercise.equipment}</span>
        </div>

        {record && (
          <div className="bg-primary/5 border border-border rounded-[20px] p-4 mb-6 shadow-premium">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={18} className="text-primary" />
              <span className="text-sm font-semibold text-primary">All-time PR</span>
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">{convertWeight(record.weight)} {settings.units} × {record.reps}</p>
            <p className="text-xs text-muted-foreground mt-1">Est. 1RM: {Math.round(convertWeight(record.estimatedOneRM))} {settings.units} · {format(new Date(record.achievedAt), 'MMM d, yyyy')}</p>
          </div>
        )}

        {history.length > 0 ? (
          <>
            <p className="text-sm font-semibold text-foreground mb-3">Weight progression (last 10 sessions)</p>
            <div className="bg-card rounded-[20px] border border-border p-4 mb-6 h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} stroke="rgba(255,255,255,0.1)" />
                  <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} width={36} stroke="rgba(255,255,255,0.1)" />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12, color: 'hsl(var(--foreground))' }}
                    formatter={(value: number) => [`${value} ${settings.units}`, 'Top weight']}
                  />
                  <Line type="monotone" dataKey="topWeight" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: 'hsl(var(--primary))' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <p className="text-sm font-semibold text-foreground mb-3">Session history</p>
            <div className="bg-card rounded-[20px] border border-border overflow-hidden mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Sets</th>
                    <th className="py-3 px-4 text-right">Top weight</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, i) => (
                    <tr key={i} className="border-b border-border/80 last:border-0">
                      <td className="py-3 px-4 text-foreground">{h.date}</td>
                      <td className="py-3 px-4 text-muted-foreground">{h.setCount}</td>
                      <td className="py-3 px-4 text-right font-medium text-foreground tabular-nums">{h.topWeight} {settings.units}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-sm font-semibold text-foreground mb-2">Muscles worked</p>
            <div className="bg-card rounded-[20px] border border-border p-4">
              <p className="text-sm text-foreground"><span className="text-muted-foreground">Primary:</span> {exercise.muscleGroup}</p>
              <p className="text-sm text-foreground mt-1"><span className="text-muted-foreground">Secondary:</span> —</p>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No history yet. Ready when you are.</p>
            <p className="text-sm font-semibold text-foreground mt-4 mb-2">Muscles worked</p>
            <div className="bg-card rounded-[20px] border border-border p-4 text-left">
              <p className="text-sm text-foreground"><span className="text-muted-foreground">Primary:</span> {exercise.muscleGroup}</p>
              <p className="text-sm text-foreground mt-1"><span className="text-muted-foreground">Secondary:</span> —</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const CreateExerciseSheet: React.FC<{
  onClose: () => void;
  onSave: (ex: Exercise) => void;
}> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>('Chest');
  const [equipment, setEquipment] = useState<Exercise['equipment']>('Barbell');

  const muscles: MuscleGroup[] = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Cardio'];
  const equips: Exercise['equipment'][] = ['Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight', 'Other'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto"
    >
      <div className="px-4 pt-12 pb-24 max-w-lg mx-auto">
        <button onClick={onClose} className="text-primary text-sm font-semibold mb-4 hover:underline">← Cancel</button>
        <h2 className="text-2xl font-bold tracking-tight text-foreground mb-6">New movement</h2>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Exercise name"
          className="w-full bg-card border border-border rounded-[14px] px-4 py-3 text-sm min-h-[48px] mb-4 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors"
        />

        <p className="text-sm font-semibold mb-2">Muscle Group</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {muscles.map(m => (
            <button
              key={m}
              onClick={() => setMuscleGroup(m)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border ${muscleGroup === m ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground'}`}
            >{m}</button>
          ))}
        </div>

        <p className="text-sm font-semibold mb-2">Equipment</p>
        <div className="flex flex-wrap gap-2 mb-8">
          {equips.map(e => (
            <button
              key={e}
              onClick={() => setEquipment(e)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border ${equipment === e ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground'}`}
            >{e}</button>
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.99 }}
          onClick={() => {
            if (!name.trim()) return;
            onSave({
              id: crypto.randomUUID(),
              name: name.trim(),
              muscleGroup,
              equipment,
              isCustom: true,
            });
          }}
          disabled={!name.trim()}
          className="w-full py-3.5 rounded-[14px] bg-primary text-primary-foreground font-semibold text-sm shadow-premium-glow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add to library
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ExercisesTab;
