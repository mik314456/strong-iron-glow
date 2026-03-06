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
  splitId?: string;
  splitDayIndex?: number;
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  estimatedOneRM: number;
  achievedAt: string;
  previousWeight?: number;
  previousReps?: number;
  previousEstimatedOneRM?: number;
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

// User profile (onboarding + YOU tab)
export type TrainingGoal = 'build_muscle' | 'lose_fat' | 'get_stronger' | 'stay_consistent';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export interface UserProfile {
  name: string;
  age: number | null;
  heightCm: number | null;
  heightFeet: number | null;
  heightInches: number | null;
  heightUnit: 'cm' | 'ft';
  weightKg: number | null;
  weightLbs: number | null;
  weightUnit: 'kg' | 'lbs';
  bodyFatPct: number | null;
  goal: TrainingGoal | null;
  experience: ExperienceLevel | null;
  daysPerWeek: number | null;
  completedOnboardingAt: string | null;
}

// Custom split: weekly schedule (e.g. PPL = 3 days, each day has name + exerciseIds)
export interface SplitDay {
  id: string;
  name: string;
  exerciseIds: string[];
  order: number;
}

export interface TrainingSplit {
  id: string;
  name: string;
  days: SplitDay[];
  createdAt: string;
  updatedAt: string;
}

export const STORAGE_KEYS = {
  EXERCISES: 'iron_exercises',
  TEMPLATES: 'iron_templates',
  SESSIONS: 'iron_sessions',
  RECORDS: 'iron_records',
  SETTINGS: 'iron_settings',
  ACTIVE_WORKOUT: 'iron_active_workout',
  USER_PROFILE: 'iron_user_profile',
  SPLITS: 'iron_splits',
  LAST_SPLIT_DAY_INDEX: 'iron_last_split_day',
} as const;

export const DEFAULT_SETTINGS: AppSettings = {
  units: 'kg',
  restTimerDuration: 90,
  bodyweight: null,
  userName: 'Athlete',
};
