import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Flame, Zap, Target } from 'lucide-react';
import type { UserProfile, TrainingGoal, ExperienceLevel } from '@/types/workout';

const GOAL_OPTIONS: { id: TrainingGoal; label: string; icon: React.ElementType }[] = [
  { id: 'build_muscle', label: 'Build Muscle', icon: Dumbbell },
  { id: 'lose_fat', label: 'Lose Fat', icon: Flame },
  { id: 'get_stronger', label: 'Get Stronger', icon: Zap },
  { id: 'stay_consistent', label: 'Stay Consistent', icon: Target },
];

const EXPERIENCE_OPTIONS: { id: ExperienceLevel; label: string }[] = [
  { id: 'beginner', label: 'Beginner (under 1 year)' },
  { id: 'intermediate', label: 'Intermediate (1–3 years)' },
  { id: 'advanced', label: 'Advanced (3+ years)' },
];

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    name: '',
    age: null,
    heightCm: null,
    heightFeet: null,
    heightInches: null,
    heightUnit: 'cm',
    weightKg: null,
    weightLbs: null,
    weightUnit: 'kg',
    bodyFatPct: null,
    goal: null,
    experience: null,
    daysPerWeek: null,
  });

  const update = (partial: Partial<UserProfile>) => setProfile(p => ({ ...p, ...partial }));

  const handleFinish = () => {
    const completed: UserProfile = {
      name: profile.name ?? '',
      age: profile.age ?? null,
      heightCm: profile.heightCm ?? null,
      heightFeet: profile.heightFeet ?? null,
      heightInches: profile.heightInches ?? null,
      heightUnit: profile.heightUnit ?? 'cm',
      weightKg: profile.weightKg ?? null,
      weightLbs: profile.weightLbs ?? null,
      weightUnit: profile.weightUnit ?? 'kg',
      bodyFatPct: profile.bodyFatPct ?? null,
      goal: profile.goal ?? null,
      experience: profile.experience ?? null,
      daysPerWeek: profile.daysPerWeek ?? null,
      completedOnboardingAt: new Date().toISOString(),
    };
    onComplete(completed);
  };

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col max-w-lg mx-auto">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center px-6"
          >
            <h1 className="text-5xl font-bold text-[#f97316] tracking-tight">Iron</h1>
            <p className="mt-3 text-white/50 text-lg">Built around you.</p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setStep(2)}
              className="mt-12 w-full max-w-sm py-4 rounded-2xl bg-[#f97316] text-white font-semibold text-lg shadow-premium-glow"
            >
              Get Started
            </motion.button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col justify-center px-6 pt-12"
          >
            <h2 className="text-2xl font-bold text-white mb-2">What's your name?</h2>
            <input
              value={profile.name ?? ''}
              onChange={e => update({ name: e.target.value })}
              placeholder="Your name"
              className="w-full bg-[#111111] border border-[#252525] rounded-2xl px-5 py-4 text-lg text-white placeholder:text-white/40 outline-none focus:border-[#f97316]/50 mb-8"
              autoFocus
            />
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setStep(3)}
              disabled={!profile.name?.trim()}
              className="w-full py-4 rounded-2xl bg-[#f97316] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </motion.button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 px-6 pt-12 pb-8 overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Your stats</h2>

            <label className="block text-sm text-white/60 mb-1">Age</label>
            <input
              type="number"
              min={13}
              max={120}
              value={profile.age ?? ''}
              onChange={e => update({ age: e.target.value ? Number(e.target.value) : null })}
              placeholder="25"
              className="w-full bg-[#111111] border border-[#252525] rounded-xl px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-[#f97316]/50 mb-4"
            />

            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-white/60">Height</label>
              <button
                type="button"
                onClick={() => update({ heightUnit: profile.heightUnit === 'cm' ? 'ft' : 'cm' })}
                className="text-sm text-[#f97316] font-medium"
              >
                {profile.heightUnit === 'cm' ? 'Switch to ft/in' : 'Switch to cm'}
              </button>
            </div>
            {profile.heightUnit === 'cm' ? (
              <input
                type="number"
                min={100}
                max={250}
                value={profile.heightCm ?? ''}
                onChange={e => update({ heightCm: e.target.value ? Number(e.target.value) : null })}
                placeholder="175 cm"
                className="w-full bg-[#111111] border border-[#252525] rounded-xl px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-[#f97316]/50 mb-4"
              />
            ) : (
              <div className="flex gap-2 mb-4">
                <input
                  type="number"
                  min={4}
                  max={8}
                  value={profile.heightFeet ?? ''}
                  onChange={e => update({ heightFeet: e.target.value ? Number(e.target.value) : null })}
                  placeholder="5 ft"
                  className="flex-1 bg-[#111111] border border-[#252525] rounded-xl px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-[#f97316]/50"
                />
                <input
                  type="number"
                  min={0}
                  max={11}
                  value={profile.heightInches ?? ''}
                  onChange={e => update({ heightInches: e.target.value ? Number(e.target.value) : null })}
                  placeholder="10 in"
                  className="flex-1 bg-[#111111] border border-[#252525] rounded-xl px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-[#f97316]/50"
                />
              </div>
            )}

            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-white/60">Weight</label>
              <button
                type="button"
                onClick={() => update({ weightUnit: profile.weightUnit === 'kg' ? 'lbs' : 'kg' })}
                className="text-sm text-[#f97316] font-medium"
              >
                {profile.weightUnit === 'kg' ? 'Switch to lbs' : 'Switch to kg'}
              </button>
            </div>
            <input
              type="number"
              step={profile.weightUnit === 'kg' ? 0.5 : 1}
              value={profile.weightUnit === 'kg' ? (profile.weightKg ?? '') : (profile.weightLbs ?? '')}
              onChange={e => {
                const v = e.target.value ? Number(e.target.value) : null;
                if (profile.weightUnit === 'kg') update({ weightKg: v }); else update({ weightLbs: v });
              }}
              placeholder={profile.weightUnit === 'kg' ? '70 kg' : '154 lbs'}
              className="w-full bg-[#111111] border border-[#252525] rounded-xl px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-[#f97316]/50 mb-4"
            />

            <label className="block text-sm text-white/60 mb-1">Body fat % (optional)</label>
            <div className="flex items-center gap-3 mb-2">
              <input
                type="range"
                min={5}
                max={40}
                value={profile.bodyFatPct ?? 20}
                onChange={e => update({ bodyFatPct: Number(e.target.value) })}
                className="flex-1 accent-[#f97316]"
              />
              <span className="text-white font-medium w-10">{(profile.bodyFatPct ?? 20)}%</span>
            </div>
            <p className="text-xs text-white/40 mb-4">Slide to set or leave default</p>

            <label className="block text-sm text-white/60 mb-2">Training experience</label>
            <div className="flex flex-wrap gap-2 mb-8">
              {EXPERIENCE_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => update({ experience: opt.id })}
                  className={`px-4 py-2.5 rounded-full text-sm font-medium border transition-colors ${
                    profile.experience === opt.id
                      ? 'bg-[#f97316] text-white border-[#f97316]'
                      : 'bg-[#111111] border-[#252525] text-white/70 hover:border-white/30'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setStep(4)}
              className="w-full py-4 rounded-2xl bg-[#f97316] text-white font-semibold"
            >
              Continue
            </motion.button>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 px-6 pt-12 pb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Your goal</h2>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {GOAL_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const selected = profile.goal === opt.id;
                return (
                  <motion.button
                    key={opt.id}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => update({ goal: opt.id })}
                    className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-3 text-left ${
                      selected ? 'border-[#f97316] bg-[#f97316]/10' : 'border-[#252525] bg-[#111111]'
                    }`}
                  >
                    <Icon size={32} className={selected ? 'text-[#f97316]' : 'text-white/60'} />
                    <span className="font-semibold text-white text-sm text-center">{opt.label}</span>
                  </motion.button>
                );
              })}
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setStep(5)}
              className="w-full py-4 rounded-2xl bg-[#f97316] text-white font-semibold"
            >
              Continue
            </motion.button>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div
            key="5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 px-6 pt-12 pb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-2">How often do you train?</h2>
            <p className="text-white/50 text-sm mb-6">Sessions per week</p>
            <div className="flex flex-wrap gap-2 mb-8">
              {[2, 3, 4, 5, 6].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => update({ daysPerWeek: n })}
                  className={`px-6 py-3 rounded-full text-base font-semibold border transition-colors ${
                    profile.daysPerWeek === n
                      ? 'bg-[#f97316] text-white border-[#f97316]'
                      : 'bg-[#111111] border-[#252525] text-white/70'
                  }`}
                >
                  {n}x
                </button>
              ))}
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setStep(6)}
              className="w-full py-4 rounded-2xl bg-[#f97316] text-white font-semibold"
            >
              Continue
            </motion.button>
          </motion.div>
        )}

        {step === 6 && (
          <motion.div
            key="6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 px-6 pt-12 pb-8 overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-white mb-2">Here's your profile</h2>
            <p className="text-white/50 text-sm mb-6">Review and continue to start training.</p>

            <div className="bg-[#111111] border border-[#252525] rounded-2xl p-5 mb-8 space-y-3">
              <p className="text-white font-medium">{profile.name || '—'}</p>
              <p className="text-sm text-white/50">Age: {profile.age ?? '—'}</p>
              <p className="text-sm text-white/50">
                Height: {profile.heightUnit === 'cm'
                  ? (profile.heightCm ? `${profile.heightCm} cm` : '—')
                  : (profile.heightFeet != null && profile.heightInches != null ? `${profile.heightFeet}'${profile.heightInches}"` : '—')}
              </p>
              <p className="text-sm text-white/50">
                Weight: {profile.weightUnit === 'kg'
                  ? (profile.weightKg ? `${profile.weightKg} kg` : '—')
                  : (profile.weightLbs ? `${profile.weightLbs} lbs` : '—')}
              </p>
              {profile.bodyFatPct != null && (
                <p className="text-sm text-white/50">Body fat: {profile.bodyFatPct}%</p>
              )}
              <p className="text-sm text-white/50">
                Goal: {profile.goal ? GOAL_OPTIONS.find(g => g.id === profile.goal)?.label : '—'}
              </p>
              <p className="text-sm text-white/50">
                Experience: {profile.experience ? EXPERIENCE_OPTIONS.find(e => e.id === profile.experience)?.label : '—'}
              </p>
              <p className="text-sm text-white/50">Train: {profile.daysPerWeek ?? '—'}x per week</p>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleFinish}
              className="w-full py-4 rounded-2xl bg-[#f97316] text-white font-semibold text-lg shadow-premium-glow"
            >
              Continue
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {step > 1 && step < 6 && (
        <div className="px-6 pb-8">
          <button
            type="button"
            onClick={() => setStep(s => Math.max(1, s - 1))}
            className="text-sm text-white/50 hover:text-white/80"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}
