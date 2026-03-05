import { useState, useEffect, useCallback } from 'react';
import {
  Exercise, WorkoutTemplate, WorkoutSession, PersonalRecord,
  AppSettings, ActiveWorkout, STORAGE_KEYS, DEFAULT_SETTINGS,
} from '@/types/workout';
import { DEFAULT_EXERCISES, DEFAULT_TEMPLATES } from '@/data/exercises';

function getStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>(() =>
    getStorage(STORAGE_KEYS.EXERCISES, DEFAULT_EXERCISES)
  );

  useEffect(() => setStorage(STORAGE_KEYS.EXERCISES, exercises), [exercises]);

  const addExercise = useCallback((ex: Exercise) => {
    setExercises(prev => [...prev, ex]);
  }, []);

  return { exercises, setExercises, addExercise };
}

export function useTemplates() {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>(() =>
    getStorage(STORAGE_KEYS.TEMPLATES, DEFAULT_TEMPLATES)
  );

  useEffect(() => setStorage(STORAGE_KEYS.TEMPLATES, templates), [templates]);

  return { templates, setTemplates };
}

export function useSessions() {
  const [sessions, setSessions] = useState<WorkoutSession[]>(() =>
    getStorage(STORAGE_KEYS.SESSIONS, [])
  );

  useEffect(() => setStorage(STORAGE_KEYS.SESSIONS, sessions), [sessions]);

  const addSession = useCallback((session: WorkoutSession) => {
    setSessions(prev => [session, ...prev]);
  }, []);

  return { sessions, setSessions, addSession };
}

export function useRecords() {
  const [records, setRecords] = useState<PersonalRecord[]>(() =>
    getStorage(STORAGE_KEYS.RECORDS, [])
  );

  useEffect(() => setStorage(STORAGE_KEYS.RECORDS, records), [records]);

  const checkAndUpdatePR = useCallback((exerciseId: string, exerciseName: string, weight: number, reps: number): PersonalRecord | null => {
    if (weight <= 0 || reps <= 0) return null;
    const estimated1RM = weight * (1 + reps / 30);
    const existing = records.find(r => r.exerciseId === exerciseId);
    if (!existing || estimated1RM > existing.estimatedOneRM) {
      const newPR: PersonalRecord = {
        exerciseId, exerciseName, weight, reps,
        estimatedOneRM: Math.round(estimated1RM * 10) / 10,
        achievedAt: new Date().toISOString(),
      };
      setRecords(prev => {
        const filtered = prev.filter(r => r.exerciseId !== exerciseId);
        return [...filtered, newPR];
      });
      return newPR;
    }
    return null;
  }, [records]);

  return { records, setRecords, checkAndUpdatePR };
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() =>
    getStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)
  );

  useEffect(() => setStorage(STORAGE_KEYS.SETTINGS, settings), [settings]);

  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  }, []);

  const convertWeight = useCallback((kg: number): number => {
    if (settings.units === 'lbs') {
      return Math.round(kg * 2.2046 * 2) / 2;
    }
    return Math.round(kg * 2) / 2;
  }, [settings.units]);

  const toKg = useCallback((display: number): number => {
    if (settings.units === 'lbs') {
      return Math.round((display / 2.2046) * 2) / 2;
    }
    return display;
  }, [settings.units]);

  return { settings, updateSettings, convertWeight, toKg };
}

export function useActiveWorkout() {
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(() =>
    getStorage(STORAGE_KEYS.ACTIVE_WORKOUT, null)
  );

  useEffect(() => {
    if (activeWorkout) {
      setStorage(STORAGE_KEYS.ACTIVE_WORKOUT, activeWorkout);
    }
  }, [activeWorkout]);

  // Auto-save every 10 seconds
  useEffect(() => {
    if (!activeWorkout) return;
    const interval = setInterval(() => {
      setStorage(STORAGE_KEYS.ACTIVE_WORKOUT, activeWorkout);
    }, 10000);
    return () => clearInterval(interval);
  }, [activeWorkout]);

  const clearActiveWorkout = useCallback(() => {
    setActiveWorkout(null);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
  }, []);

  return { activeWorkout, setActiveWorkout, clearActiveWorkout };
}

export function getPreviousSets(sessions: WorkoutSession[], exerciseId: string): { weight: number; reps: number }[] {
  for (const session of sessions) {
    const ex = session.exercises?.find(e => e.exerciseId === exerciseId);
    if (ex && ex.sets.length > 0) {
      return ex.sets
        .filter(s => s.completed && s.weight !== null && s.reps !== null)
        .map(s => ({ weight: s.weight!, reps: s.reps! }));
    }
  }
  return [];
}
