import React from 'react';
import { Dumbbell, Clock, BookOpen, User } from 'lucide-react';
import { motion } from 'framer-motion';

export type TabId = 'workout' | 'history' | 'exercises' | 'profile';

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'workout', label: 'Train', icon: Dumbbell },
  { id: 'history', label: 'Log', icon: Clock },
  { id: 'exercises', label: 'Library', icon: BookOpen },
  { id: 'profile', label: 'You', icon: User },
];

interface BottomTabBarProps {
  active: TabId;
  onTabChange: (tab: TabId) => void;
}

const BottomTabBar: React.FC<BottomTabBarProps> = ({ active, onTabChange }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-[#252525] safe-bottom shadow-[0_-4px_24px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <motion.button
              key={id}
              whileTap={{ scale: 0.97 }}
              onClick={() => onTabChange(id)}
              className="flex flex-col items-center justify-center gap-1 w-16 h-full relative"
            >
              <Icon
                size={22}
                className={isActive ? 'text-[#f97316]' : 'text-white/40'}
              />
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${isActive ? 'text-[#f97316]' : 'text-white/40'}`}>
                {label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute -bottom-0 w-1 h-1 rounded-full bg-[#f97316]"
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
