import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { UserProfile } from '@/types/workout';
import { Exercise } from '@/types/workout';
import { TrainingSplit } from '@/types/workout';
import { getTemplatesForDaysPerWeek, templateToSplit, PremadeSplitTemplate } from '@/data/splits';
import SplitBuilder from './SplitBuilder';

interface SplitSelectionScreenProps {
  profile: UserProfile;
  exercises: Exercise[];
  onAddSplit: (split: TrainingSplit) => void;
  onComplete: () => void;
}

const SplitSelectionScreen: React.FC<SplitSelectionScreenProps> = ({
  profile,
  exercises,
  onAddSplit,
  onComplete,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreateSplit, setShowCreateSplit] = useState(false);

  const daysPerWeek = profile.daysPerWeek ?? 3;
  const templates = getTemplatesForDaysPerWeek(daysPerWeek);

  const handleContinue = () => {
    if (selectedId === 'custom') {
      setShowCreateSplit(true);
      return;
    }
    const template = templates.find(t => t.id === selectedId);
    if (template) {
      const split = templateToSplit(template);
      onAddSplit(split as TrainingSplit);
    }
    onComplete();
  };

  const handleSaveCustom = (split: Omit<TrainingSplit, 'createdAt' | 'updatedAt'> & { createdAt?: string; updatedAt?: string }) => {
    const now = new Date().toISOString();
    const full: TrainingSplit = {
      ...split,
      createdAt: split.createdAt ?? now,
      updatedAt: split.updatedAt ?? now,
    };
    onAddSplit(full);
    setShowCreateSplit(false);
    onComplete();
  };

  if (showCreateSplit) {
    return (
      <SplitBuilder
        open
        onClose={() => setShowCreateSplit(false)}
        exercises={exercises}
        onSave={handleSaveCustom}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-deep max-w-lg mx-auto px-6 pt-12 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex-1 max-w-[400px] mx-auto w-full"
      >
        <h1 className="text-xl font-sans font-semibold text-text-primary mb-2">Set up your training split</h1>
        <p className="text-text-secondary text-sm font-sans mb-8">Choose a template or build your own</p>

        <div className="space-y-3 mb-8">
          {templates.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              selected={selectedId === t.id}
              onSelect={() => setSelectedId(t.id)}
            />
          ))}
          <button
            type="button"
            onClick={() => setSelectedId('custom')}
            className={`w-full rounded-[16px] border p-5 flex items-center gap-4 text-left transition-smooth ${
              selectedId === 'custom'
                ? 'border-accent bg-bg-raised'
                : 'border-border bg-bg-card hover:bg-[#161616] hover:border-border-bright'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-bg-raised flex items-center justify-center flex-shrink-0">
              <Plus className="w-6 h-6 text-text-tertiary" />
            </div>
            <div>
              <p className="font-sans font-semibold text-text-primary">Build my own</p>
              <p className="text-xs text-text-secondary font-sans mt-0.5">Create a custom split</p>
            </div>
          </button>
        </div>
      </motion.div>

      <div className="flex-shrink-0 space-y-4 max-w-[400px] mx-auto w-full">
        <motion.button
          whileTap={{ scale: 0.99 }}
          onClick={handleContinue}
          className="w-full h-14 rounded-[10px] bg-accent text-primary-foreground font-sans font-bold text-[15px] uppercase tracking-wider"
        >
          Continue
        </motion.button>
        <button
          type="button"
          onClick={onComplete}
          className="w-full text-center text-sm text-text-secondary hover:text-text-primary font-sans transition-smooth"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
};

function TemplateCard({
  template,
  selected,
  onSelect,
}: {
  template: PremadeSplitTemplate;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`w-full rounded-[16px] border p-5 text-left transition-smooth ${
        selected ? 'border-accent bg-bg-raised' : 'border-border bg-bg-card hover:bg-[#161616] hover:border-border-bright'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-sans font-semibold text-text-primary">{template.name}</p>
          <p className="text-xs text-text-secondary mt-1 font-sans">{template.daysBreakdown}</p>
        </div>
        {template.badge && (
          <span className="flex-shrink-0 text-[10px] font-sans font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/30">
            {template.badge}
          </span>
        )}
      </div>
    </motion.button>
  );
}

export default SplitSelectionScreen;
