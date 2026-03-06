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
          <h1 className="text-3xl font-bold tracking-tight text-white">Library</h1>
          <p className="text-sm text-white/50 mt-0.5">Exercises & movements</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-[#f97316] text-white px-4 py-2 rounded-full text-sm font-semibold shadow-premium-glow"
        >
          <Plus size={18} /> New
        </motion.button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search movements..."
          className="w-full bg-[#111111] border border-[#252525] rounded-[14px] pl-11 pr-4 py-3 text-sm min-h-[48px] text-white placeholder:text-white/40 outline-none focus:border-[#f97316]/50 transition-colors"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 -mx-4 px-4">
        {FILTERS.map(f => (
          <motion.button
            key={f}
            whileTap={{ scale: 0.97 }}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-xs font-semibold flex-shrink-0 border transition-colors ${
              filter === f
                ? 'bg-[#f97316] text-white border-[#f97316] shadow-premium-glow'
                : 'bg-[#111111] border-[#252525] text-white/50 hover:text-white/70'
            }`}
          >
            {f}
          </motion.button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.map(ex => (
          <motion.button
            key={ex.id}
            whileTap={{ scale: 0.99 }}
            onClick={() => setSelectedExercise(ex)}
            className="w-full bg-[#111111] rounded-[20px] border border-[#252525] p-4 flex items-center justify-between text-left shadow-premium"
          >
            <div>
              <p className="font-semibold text-white">{ex.name}</p>
              <div className="flex gap-2 mt-1.5">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${MUSCLE_GROUP_COLORS[ex.muscleGroup] || 'bg-white/10 text-white/70'}`}>{ex.muscleGroup}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/50">{ex.equipment}</span>
              </div>
            </div>
            <ChevronRight size={20} className="text-white/40" />
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
      className="fixed inset-0 z-50 bg-[#080808]/95 backdrop-blur-sm overflow-y-auto"
    >
      <div className="px-4 pt-12 pb-24 max-w-lg mx-auto">
        <button onClick={onClose} className="text-[#f97316] text-sm font-semibold mb-4 hover:underline">← Back</button>
        <h2 className="text-2xl font-bold tracking-tight text-white mb-1">{exercise.name}</h2>
        <div className="flex gap-2 mb-6">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${MUSCLE_GROUP_COLORS[exercise.muscleGroup]}`}>{exercise.muscleGroup}</span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-white/60">{exercise.equipment}</span>
        </div>

        {record && (
          <div className="bg-gradient-to-br from-[#f97316]/20 to-[#ea580c]/10 border border-[#f97316]/40 rounded-[20px] p-4 mb-6 shadow-premium">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={18} className="text-[#f97316]" />
              <span className="text-sm font-semibold text-[#f97316]">All-time PR</span>
            </div>
            <p className="text-2xl font-bold text-white tabular-nums">{convertWeight(record.weight)} {settings.units} × {record.reps}</p>
            <p className="text-xs text-white/50 mt-1">Est. 1RM: {Math.round(convertWeight(record.estimatedOneRM))} {settings.units} · {format(new Date(record.achievedAt), 'MMM d, yyyy')}</p>
          </div>
        )}

        {history.length > 0 ? (
          <>
            <p className="text-sm font-semibold text-white/80 mb-3">Weight progression (last 10 sessions)</p>
            <div className="bg-[#111111] rounded-[20px] border border-[#252525] p-4 mb-6 h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} stroke="rgba(255,255,255,0.1)" />
                  <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} width={36} stroke="rgba(255,255,255,0.1)" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1c1c1c', border: '1px solid #252525', borderRadius: 12, fontSize: 12, color: '#fff' }}
                    formatter={(value: number) => [`${value} ${settings.units}`, 'Top weight']}
                  />
                  <Line type="monotone" dataKey="topWeight" stroke="#f97316" strokeWidth={2.5} dot={{ r: 4, fill: '#f97316' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <p className="text-sm font-semibold text-white/80 mb-3">Session history</p>
            <div className="bg-[#111111] rounded-[20px] border border-[#252525] overflow-hidden mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#252525] text-left text-xs text-white/50 uppercase tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Sets</th>
                    <th className="py-3 px-4 text-right">Top weight</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, i) => (
                    <tr key={i} className="border-b border-[#252525]/80 last:border-0">
                      <td className="py-3 px-4 text-white">{h.date}</td>
                      <td className="py-3 px-4 text-white/70">{h.setCount}</td>
                      <td className="py-3 px-4 text-right font-medium text-white tabular-nums">{h.topWeight} {settings.units}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-sm font-semibold text-white/80 mb-2">Muscles worked</p>
            <div className="bg-[#111111] rounded-[20px] border border-[#252525] p-4">
              <p className="text-sm text-white/90"><span className="text-white/50">Primary:</span> {exercise.muscleGroup}</p>
              <p className="text-sm text-white/90 mt-1"><span className="text-white/50">Secondary:</span> —</p>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-white/50">No history yet. Ready when you are.</p>
            <p className="text-sm font-semibold text-white/80 mt-4 mb-2">Muscles worked</p>
            <div className="bg-[#111111] rounded-[20px] border border-[#252525] p-4 text-left">
              <p className="text-sm text-white/90"><span className="text-white/50">Primary:</span> {exercise.muscleGroup}</p>
              <p className="text-sm text-white/90 mt-1"><span className="text-white/50">Secondary:</span> —</p>
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
      className="fixed inset-0 z-50 bg-[#080808]/95 backdrop-blur-sm overflow-y-auto"
    >
      <div className="px-4 pt-12 pb-24 max-w-lg mx-auto">
        <button onClick={onClose} className="text-[#f97316] text-sm font-semibold mb-4 hover:underline">← Cancel</button>
        <h2 className="text-2xl font-bold tracking-tight text-white mb-6">New movement</h2>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Exercise name"
          className="w-full bg-[#111111] border border-[#252525] rounded-[14px] px-4 py-3 text-sm min-h-[48px] mb-4 text-white placeholder:text-white/40 outline-none focus:border-[#f97316]/50 transition-colors"
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
          className="w-full py-3.5 rounded-[14px] bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white font-semibold text-sm shadow-premium-glow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add to library
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ExercisesTab;
