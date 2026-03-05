import React from 'react';
import { Dumbbell, Clock, List, User } from 'lucide-react';
import { motion } from 'framer-motion';

export type TabId = 'workout' | 'history' | 'exercises' | 'profile';

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'workout', label: 'Workout', icon: Dumbbell },
  { id: 'history', label: 'History', icon: Clock },
  { id: 'exercises', label: 'Exercises', icon: List },
  { id: 'profile', label: 'Profile', icon: User },
];

interface BottomTabBarProps {
  active: TabId;
  onTabChange: (tab: TabId) => void;
}

const BottomTabBar: React.FC<BottomTabBarProps> = ({ active, onTabChange }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-tab-bar border-t border-border safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className="flex flex-col items-center justify-center gap-1 w-16 h-full relative"
            >
              <Icon
                size={22}
                className={isActive ? 'text-primary' : 'text-muted-foreground'}
              />
              <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute -bottom-0 w-1 h-1 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomTabBar;
