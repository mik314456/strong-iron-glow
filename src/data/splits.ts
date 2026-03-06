import { SplitDay, TrainingSplit } from '@/types/workout';

export interface PremadeSplitTemplate {
  id: string;
  name: string;
  daysBreakdown: string;
  badge?: 'Most Popular' | 'Recommended';
  dayNames: string[];
}

export const PREMADE_SPLIT_TEMPLATES: PremadeSplitTemplate[] = [
  // 3x/week
  { id: 'full-body-3x', name: 'Full Body 3x', daysBreakdown: 'Full · Full · Full', dayNames: ['Full Body A', 'Full Body B', 'Full Body C'] },
  { id: 'upper-lower-3x', name: 'Upper/Lower', daysBreakdown: 'Upper · Lower · Upper', badge: 'Recommended', dayNames: ['Upper', 'Lower', 'Upper'] },
  // 4x/week
  { id: 'upper-lower-4x', name: 'Upper/Lower Split', daysBreakdown: 'Upper · Lower · Upper · Lower', badge: 'Most Popular', dayNames: ['Upper', 'Lower', 'Upper', 'Lower'] },
  { id: 'ppl-lite', name: 'PPL Lite', daysBreakdown: 'Push · Pull · Legs · Upper', dayNames: ['Push', 'Pull', 'Legs', 'Upper'] },
  // 5x/week
  { id: 'ppl-5x', name: 'PPL (Push/Pull/Legs)', daysBreakdown: 'Push · Pull · Legs · Push · Pull', badge: 'Most Popular', dayNames: ['Push', 'Pull', 'Legs', 'Push', 'Pull'] },
  { id: 'arnold-split', name: 'Arnold Split', daysBreakdown: 'Chest & Back · Shoulders & Arms · Legs · Repeat', dayNames: ['Chest & Back', 'Shoulders & Arms', 'Legs', 'Chest & Back', 'Shoulders & Arms'] },
  // 6x/week
  { id: 'ppl-6x', name: 'PPL 6-Day', daysBreakdown: 'Push · Pull · Legs · Push · Pull · Legs', badge: 'Recommended', dayNames: ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs'] },
  { id: 'bro-split-6x', name: 'Bro Split 6-Day', daysBreakdown: 'Chest · Back · Shoulders · Arms · Legs · Core', dayNames: ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core'] },
];

export function getTemplatesForDaysPerWeek(daysPerWeek: number): PremadeSplitTemplate[] {
  const effective = daysPerWeek >= 3 ? daysPerWeek : 3;
  const list = PREMADE_SPLIT_TEMPLATES.filter(t => {
    if (effective <= 3) return t.dayNames.length === 3;
    if (effective === 4) return t.dayNames.length === 4;
    if (effective === 5) return t.dayNames.length === 5;
    if (effective >= 6) return t.dayNames.length === 6;
    return false;
  });
  return list.slice(0, 3);
}

export function templateToSplit(template: PremadeSplitTemplate): Omit<TrainingSplit, 'createdAt' | 'updatedAt'> & { createdAt?: string; updatedAt?: string } {
  const now = new Date().toISOString();
  const days: SplitDay[] = template.dayNames.map((name, i) => ({
    id: crypto.randomUUID(),
    name,
    exerciseIds: [],
    order: i,
  }));
  return {
    id: crypto.randomUUID(),
    name: template.name,
    days,
    createdAt: now,
    updatedAt: now,
  };
}
