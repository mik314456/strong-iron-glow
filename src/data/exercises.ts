import { Exercise, MuscleGroup } from '@/types/workout';

const e = (id: string, name: string, muscleGroup: MuscleGroup, equipment: Exercise['equipment']): Exercise => ({
  id, name, muscleGroup, equipment, isCustom: false,
});

export const DEFAULT_EXERCISES: Exercise[] = [
  // Chest
  e('bench-press', 'Bench Press', 'Chest', 'Barbell'),
  e('incline-bench', 'Incline Bench Press', 'Chest', 'Barbell'),
  e('decline-bench', 'Decline Bench Press', 'Chest', 'Barbell'),
  e('dumbbell-fly', 'Dumbbell Fly', 'Chest', 'Dumbbell'),
  e('cable-fly', 'Cable Fly', 'Chest', 'Cable'),
  e('push-up', 'Push Up', 'Chest', 'Bodyweight'),
  e('incline-db-press', 'Incline Dumbbell Press', 'Chest', 'Dumbbell'),
  // Back
  e('deadlift', 'Deadlift', 'Back', 'Barbell'),
  e('barbell-row', 'Barbell Row', 'Back', 'Barbell'),
  e('lat-pulldown', 'Lat Pulldown', 'Back', 'Cable'),
  e('seated-cable-row', 'Seated Cable Row', 'Back', 'Cable'),
  e('pull-up', 'Pull Up', 'Back', 'Bodyweight'),
  e('face-pull', 'Face Pull', 'Back', 'Cable'),
  e('single-arm-db-row', 'Single Arm Dumbbell Row', 'Back', 'Dumbbell'),
  // Shoulders
  e('overhead-press', 'Overhead Press', 'Shoulders', 'Barbell'),
  e('db-shoulder-press', 'Dumbbell Shoulder Press', 'Shoulders', 'Dumbbell'),
  e('lateral-raise', 'Lateral Raise', 'Shoulders', 'Dumbbell'),
  e('front-raise', 'Front Raise', 'Shoulders', 'Dumbbell'),
  e('rear-delt-fly', 'Rear Delt Fly', 'Shoulders', 'Dumbbell'),
  e('arnold-press', 'Arnold Press', 'Shoulders', 'Dumbbell'),
  // Arms
  e('barbell-curl', 'Barbell Bicep Curl', 'Arms', 'Barbell'),
  e('dumbbell-curl', 'Dumbbell Bicep Curl', 'Arms', 'Dumbbell'),
  e('hammer-curl', 'Hammer Curl', 'Arms', 'Dumbbell'),
  e('tricep-pushdown', 'Tricep Pushdown', 'Arms', 'Cable'),
  e('skull-crusher', 'Skull Crusher', 'Arms', 'Barbell'),
  e('dips', 'Dips', 'Arms', 'Bodyweight'),
  e('overhead-tricep-ext', 'Overhead Tricep Extension', 'Arms', 'Cable'),
  // Legs
  e('back-squat', 'Back Squat', 'Legs', 'Barbell'),
  e('front-squat', 'Front Squat', 'Legs', 'Barbell'),
  e('leg-press', 'Leg Press', 'Legs', 'Machine'),
  e('romanian-deadlift', 'Romanian Deadlift', 'Legs', 'Barbell'),
  e('leg-extension', 'Leg Extension', 'Legs', 'Machine'),
  e('leg-curl', 'Leg Curl', 'Legs', 'Machine'),
  e('calf-raise', 'Calf Raise', 'Legs', 'Machine'),
  e('hip-thrust', 'Hip Thrust', 'Legs', 'Barbell'),
  e('lunges', 'Lunges', 'Legs', 'Dumbbell'),
  // Core
  e('plank', 'Plank', 'Core', 'Bodyweight'),
  e('crunches', 'Crunches', 'Core', 'Bodyweight'),
  e('leg-raises', 'Leg Raises', 'Core', 'Bodyweight'),
  e('cable-crunch', 'Cable Crunch', 'Core', 'Cable'),
  e('ab-wheel', 'Ab Wheel Rollout', 'Core', 'Other'),
];

export const DEFAULT_TEMPLATES = [
  {
    id: 'push-day',
    name: 'Push Day',
    icon: '💪',
    exerciseIds: ['bench-press', 'overhead-press', 'incline-db-press', 'lateral-raise', 'tricep-pushdown', 'cable-fly'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pull-day',
    name: 'Pull Day',
    icon: '🏋️',
    exerciseIds: ['deadlift', 'barbell-row', 'lat-pulldown', 'face-pull', 'barbell-curl', 'hammer-curl'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'leg-day',
    name: 'Leg Day',
    icon: '🦵',
    exerciseIds: ['back-squat', 'leg-press', 'romanian-deadlift', 'leg-extension', 'leg-curl', 'calf-raise'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'upper-body',
    name: 'Upper Body',
    icon: '🔥',
    exerciseIds: ['bench-press', 'barbell-row', 'overhead-press', 'lat-pulldown', 'barbell-curl', 'tricep-pushdown'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'full-body',
    name: 'Full Body',
    icon: '⚡',
    exerciseIds: ['back-squat', 'bench-press', 'deadlift', 'overhead-press', 'barbell-row'],
    createdAt: new Date().toISOString(),
  },
];

export const MUSCLE_GROUP_COLORS: Record<string, string> = {
  Chest: 'bg-red-500/20 text-red-400',
  Back: 'bg-blue-500/20 text-blue-400',
  Shoulders: 'bg-yellow-500/20 text-yellow-400',
  Arms: 'bg-purple-500/20 text-purple-400',
  Legs: 'bg-green-500/20 text-green-400',
  Core: 'bg-orange-500/20 text-orange-400',
  Cardio: 'bg-cyan-500/20 text-cyan-400',
};
