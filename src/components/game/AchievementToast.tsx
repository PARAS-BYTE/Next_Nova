'use client';
/* ═══════════════════════════════════════════════════════
   Achievement Toast — Popup when achievement unlocks
   ═══════════════════════════════════════════════════════ */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Zap, Coins } from 'lucide-react';
import { useGameStore } from '@/game/useGameStore';
import { palette } from '@/theme/palette';

export default function AchievementToast() {
  const queue = useGameStore(s => s.achievementUnlockQueue);
  const dismiss = useGameStore(s => s.dismissAchievement);

  const current = queue[0];

  useEffect(() => {
    if (!current) return;
    const timer = setTimeout(dismiss, 4000);
    return () => clearTimeout(timer);
  }, [current, dismiss]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[150]">
      <AnimatePresence>
        {current && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 60, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.6 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="flex items-center gap-4 px-6 py-4 rounded-2xl cursor-pointer max-w-md"
            style={{
              background: 'rgba(21, 24, 41, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(124, 106, 250, 0.4)',
              boxShadow: '0 0 40px rgba(124, 106, 250, 0.25), 0 20px 50px rgba(0,0,0,0.4)',
            }}
            onClick={dismiss}
          >
            {/* Icon */}
            <motion.div
              className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #7C6AFA20, #22D3EE20)',
                border: '1px solid rgba(124, 106, 250, 0.3)',
              }}
              animate={{
                boxShadow: [
                  '0 0 10px rgba(124, 106, 250, 0.2)',
                  '0 0 30px rgba(124, 106, 250, 0.5)',
                  '0 0 10px rgba(124, 106, 250, 0.2)',
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Award className="w-7 h-7" style={{ color: '#7C6AFA' }} />
            </motion.div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-widest font-bold mb-0.5 shimmer-text">
                Achievement Unlocked
              </p>
              <p className="text-sm font-bold truncate" style={{ color: palette.text }}>
                {current.name}
              </p>
              <p className="text-xs truncate" style={{ color: palette.text2 }}>
                {current.description}
              </p>

              {/* Rewards */}
              <div className="flex items-center gap-3 mt-1.5">
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-[#7C6AFA]" />
                  <span className="text-[10px] font-bold text-[#7C6AFA]">
                    +{current.xpReward} XP
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Coins className="w-3 h-3 text-[#34D399]" />
                  <span className="text-[10px] font-bold text-[#34D399]">
                    +{current.coinReward}
                  </span>
                </div>
              </div>
            </div>

            {/* Shimmer overlay */}
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
              initial={false}
            >
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(124, 106, 250, 0.1), transparent)',
                }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
