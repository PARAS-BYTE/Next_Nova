'use client';
/* ═══════════════════════════════════════════════════════
   Quest Card — RPG-style mission card component
   ═══════════════════════════════════════════════════════ */

import { motion } from 'framer-motion';
import { Swords, Clock, Zap, Coins, Lock, CheckCircle2, ChevronRight } from 'lucide-react';
import type { Quest } from '@/game/types';
import { DIFFICULTY_COLORS } from '@/game/gameConfig';
import { palette } from '@/theme/palette';

interface QuestCardProps {
  quest: Quest;
  index?: number;
  onStart?: () => void;
}

export default function QuestCard({ quest, index = 0, onStart }: QuestCardProps) {
  const diffColors = DIFFICULTY_COLORS[quest.difficulty];
  const isLocked = quest.status === 'locked';
  const isCompleted = quest.status === 'completed';
  const isActive = quest.status === 'in_progress';

  const typeLabels = {
    main: '⚔️ Main Quest',
    side: '📜 Side Quest',
    daily: '☀️ Daily',
    weekly: '📅 Weekly',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={!isLocked ? { scale: 1.02, y: -2 } : {}}
      className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${isLocked ? 'opacity-50' : 'cursor-pointer'}`}
      style={{
        background: palette.card,
        border: `1px solid ${isCompleted ? 'rgba(52, 211, 153, 0.3)' : isActive ? `${palette.accent}30` : palette.border}`,
        boxShadow: isActive ? `0 0 20px ${palette.accent}15` : 'none',
      }}
    >
      {/* Top accent line */}
      <div
        className="h-0.5 w-full"
        style={{
          background: isCompleted
            ? 'linear-gradient(90deg, #34D399, #22D3EE)'
            : isActive
            ? palette.gradient1
            : 'transparent',
        }}
      />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {/* Quest type icon */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: isCompleted ? 'rgba(52, 211, 153, 0.15)' : palette.accentSoft,
              }}
            >
              {isLocked ? (
                <Lock className="w-4 h-4" style={{ color: palette.text2 }} />
              ) : isCompleted ? (
                <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
              ) : (
                <Swords className="w-4 h-4" style={{ color: palette.accent }} />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: palette.text2 }}>
                  {typeLabels[quest.type]}
                </span>
                {/* Difficulty badge */}
                <span
                  className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                  style={{
                    background: diffColors.bg,
                    color: diffColors.text,
                    border: `1px solid ${diffColors.border}`,
                  }}
                >
                  {quest.difficulty}
                </span>
              </div>
              <h3 className="text-sm font-bold mt-0.5" style={{ color: palette.text }}>
                {quest.title}
              </h3>
            </div>
          </div>

          {/* Rewards */}
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#7C6AFA]" />
              <span className="text-[10px] font-bold text-[#7C6AFA]">+{quest.xpReward}</span>
            </div>
            <div className="flex items-center gap-1">
              <Coins className="w-3 h-3 text-[#34D399]" />
              <span className="text-[10px] font-bold text-[#34D399]">+{quest.coinReward}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs mb-3" style={{ color: palette.text2 }}>
          {quest.description}
        </p>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-medium" style={{ color: palette.text2 }}>
              {quest.currentStep}/{quest.totalSteps} steps
            </span>
            <span className="text-[10px] font-bold" style={{ color: isCompleted ? '#34D399' : palette.accent }}>
              {quest.progress}%
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: palette.progressTrack }}>
            <motion.div
              className="h-full rounded-full"
              style={{
                background: isCompleted
                  ? 'linear-gradient(90deg, #34D399, #22D3EE)'
                  : palette.gradient1,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${quest.progress}%` }}
              transition={{ duration: 1, delay: index * 0.1, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Action */}
        {!isLocked && !isCompleted && (
          <motion.button
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold"
            style={{
              background: palette.accentSoft,
              color: palette.accent,
              border: `1px solid ${palette.accent}20`,
            }}
            whileHover={{
              background: palette.accent,
              color: '#fff',
              boxShadow: `0 0 20px ${palette.accent}30`,
            }}
            whileTap={{ scale: 0.97 }}
            onClick={onStart}
          >
            {isActive ? 'Continue Quest' : 'Start Quest'}
            <ChevronRight className="w-3.5 h-3.5" />
          </motion.button>
        )}

        {isCompleted && (
          <div className="flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold"
            style={{ background: 'rgba(52, 211, 153, 0.1)', color: '#34D399' }}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Quest Complete
          </div>
        )}
      </div>
    </motion.div>
  );
}
