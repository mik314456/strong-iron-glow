import React, { useState, useMemo } from 'react';
import { Search, Plus, ChevronRight, TrendingUp } from 'lucide-react';
import { Exercise, MuscleGroup, WorkoutSession, PersonalRecord } from '@/types/workout';
import { MUSCLE_GROUP_COLORS } from '@/data/exercises';
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
    const history: { date: string; volume: number; topWeight: number; topReps: number }[] = [];
    sessions.forEach(s => {
      const ex = s.exercises?.find(e => e.exerciseId === exerciseId);
      if (ex) {
        const volume = ex.sets.filter(s => s.completed).reduce((sum, s) => sum + (s.weight || 0) * (s.reps || 0), 0);
        const topSet = ex.sets.filter(s => s.completed).sort((a, b) => (b.weight || 0) - (a.weight || 0))[0];
        history.push({
          date: format(new Date(s.startTime), 'MMM d'),
          volume: Math.round(convertWeight(volume)),
          topWeight: topSet ? convertWeight(topSet.weight || 0) : 0,
          topReps: topSet?.reps || 0,
        });
      }
    });
    return history.reverse();
  };

  return (
    <div className="px-4 pt-12 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Exercises</h1>
        <button onClick={() => setShowCreate(true)} className="text-primary text-sm font-semibold flex items-center gap-1">
          <Plus size={16} /> Create
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search exercises..."
          className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-3 text-sm min-h-[48px] outline-none focus:border-primary"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 -mx-4 px-4">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0 border transition-colors ${
              filter === f ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-1">
        {filtered.map(ex => (
          <button
            key={ex.id}
            onClick={() => setSelectedExercise(ex)}
            className="w-full bg-card rounded-lg border border-border p-4 flex items-center justify-between text-left"
          >
            <div>
              <p className="font-medium text-sm">{ex.name}</p>
              <div className="flex gap-2 mt-1">
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${MUSCLE_GROUP_COLORS[ex.muscleGroup] || ''}`}>{ex.muscleGroup}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{ex.equipment}</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
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
  history: { date: string; volume: number; topWeight: number; topReps: number }[];
  record?: PersonalRecord;
  settings: { units: 'kg' | 'lbs' };
  convertWeight: (kg: number) => number;
  onClose: () => void;
}> = ({ exercise, history, record, settings, convertWeight, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 bg-background/95 overflow-y-auto"
  >
    <div className="px-4 pt-12 pb-24 max-w-lg mx-auto">
      <button onClick={onClose} className="text-primary text-sm font-semibold mb-4">← Back</button>
      <h2 className="text-2xl font-bold mb-1">{exercise.name}</h2>
      <div className="flex gap-2 mb-6">
        <span className={`text-xs px-2 py-0.5 rounded ${MUSCLE_GROUP_COLORS[exercise.muscleGroup]}`}>{exercise.muscleGroup}</span>
        <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">{exercise.equipment}</span>
      </div>

      {record && (
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-primary" />
            <span className="text-sm font-semibold text-primary">Personal Record</span>
          </div>
          <p className="text-2xl font-bold">{convertWeight(record.weight)} {settings.units} × {record.reps}</p>
          <p className="text-xs text-muted-foreground mt-1">Est. 1RM: {Math.round(convertWeight(record.estimatedOneRM))} {settings.units} · {format(new Date(record.achievedAt), 'MMM d, yyyy')}</p>
        </div>
      )}

      {history.length > 0 ? (
        <>
          <p className="text-sm font-semibold mb-3">Volume Over Time</p>
          <div className="bg-card rounded-lg border border-border p-4 mb-6 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(0,0%,63%)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(0,0%,63%)' }} width={40} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1c1c1c', border: '1px solid #2a2a2a', borderRadius: 8, fontSize: 12 }}
                />
                <Line type="monotone" dataKey="volume" stroke="#f97316" strokeWidth={2} dot={{ r: 3, fill: '#f97316' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <p className="text-sm font-semibold mb-3">Session History</p>
          <div className="space-y-2">
            {history.map((h, i) => (
              <div key={i} className="bg-card rounded-lg border border-border p-3 flex justify-between">
                <span className="text-sm">{h.date}</span>
                <span className="text-sm text-muted-foreground">{h.topWeight} {settings.units} × {h.topReps} · {h.volume} {settings.units}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">You haven't trained this exercise yet</p>
        </div>
      )}
    </div>
  </motion.div>
);

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
      className="fixed inset-0 z-50 bg-background/95 overflow-y-auto"
    >
      <div className="px-4 pt-12 pb-24 max-w-lg mx-auto">
        <button onClick={onClose} className="text-primary text-sm font-semibold mb-4">← Cancel</button>
        <h2 className="text-2xl font-bold mb-6">Create Exercise</h2>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Exercise name"
          className="w-full bg-card border border-border rounded-lg px-4 py-3 text-sm min-h-[48px] mb-4 outline-none focus:border-primary"
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

        <button
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
          className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50"
        >
          Save Exercise
        </button>
      </div>
    </motion.div>
  );
};

export default ExercisesTab;
