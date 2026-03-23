import React from 'react';
import { Dumbbell, Clock, BookOpen, FlaskConical, User } from 'lucide-react';
import { motion } from 'framer-motion';

export type TabId = 'workout' | 'history' | 'exercises' | 'science' | 'profile';

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'workout', label: 'Train', icon: Dumbbell },
  { id: 'history', label: 'Log', icon: Clock },
  { id: 'exercises', label: 'Library', icon: BookOpen },
  { id: 'science', label: 'Science', icon: FlaskConical },
  { id: 'profile', label: 'You', icon: User },
];

interface BottomTabBarProps {
  active: TabId;
  onTabChange: (tab: TabId) => void;
}

const BottomTabBar: React.FC<BottomTabBarProps> = ({ active, onTabChange }) => {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 safe-bottom max-w-lg mx-auto border-t border-[#1e1e1e]"
      style={{
        height: 72,
        background: 'var(--tab-bar-bg)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      }}
    >
      <div className="flex items-center justify-around h-full">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <motion.button
              key={id}
              whileTap={{ scale: 0.98 }}
              onClick={() => onTabChange(id)}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-full relative transition-smooth"
            >
              <Icon
                size={22}
                className={isActive ? 'text-accent' : 'text-text-tertiary'}
              />
              <span
                className={`text-[10px] font-sans font-semibold uppercase tracking-wider ${
                  isActive ? 'text-accent' : 'text-text-tertiary'
                }`}
              >
                {label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[3px] h-[3px] rounded-sm bg-accent"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomTabBar;
