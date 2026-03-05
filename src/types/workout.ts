// Types for Iron workout tracker

export type MuscleGroup = 'Chest' | 'Back' | 'Shoulders' | 'Arms' | 'Legs' | 'Core' | 'Cardio';
export type Equipment = 'Barbell' | 'Dumbbell' | 'Cable' | 'Machine' | 'Bodyweight' | 'Other';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  isCustom: boolean;
  notes?: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  exerciseIds: string[];
  icon?: string;
  createdAt: string;
}

export interface ExerciseSet {
  id: string;
  setNumber: number;
  weight: number | null;
  reps: number | null;
  completed: boolean;
  isWarmup: boolean;
  completedAt?: string;
}

export interface SessionExercise {
  id: string;
  sessionId: string;
  exerciseId: string;
  exerciseName: string;
  sets: ExerciseSet[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  templateId?: string;
  templateName: string;
  startTime: string;
  endTime?: string;
  totalVolume: number;
  notes?: string;
  exercises: SessionExercise[];
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  estimatedOneRM: number;
  achievedAt: string;
}

export interface AppSettings {
  units: 'kg' | 'lbs';
  restTimerDuration: number;
  bodyweight: number | null;
  userName: string;
}

export interface ActiveWorkout {
  session: WorkoutSession;
  exercises: SessionExercise[];
  startTime: string;
}

export const STORAGE_KEYS = {
  EXERCISES: 'iron_exercises',
  TEMPLATES: 'iron_templates',
  SESSIONS: 'iron_sessions',
  RECORDS: 'iron_records',
  SETTINGS: 'iron_settings',
  ACTIVE_WORKOUT: 'iron_active_workout',
} as const;

export const DEFAULT_SETTINGS: AppSettings = {
  units: 'kg',
  restTimerDuration: 90,
  bodyweight: null,
  userName: 'Athlete',
};
