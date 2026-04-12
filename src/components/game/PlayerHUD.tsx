'use client';
/* ═══════════════════════════════════════════════════════
   Player HUD — Heads-Up Display for the game bar
   ═══════════════════════════════════════════════════════ */

import { motion } from 'framer-motion';
import { Flame, Coins, Zap, Trophy, Star } from 'lucide-react';
import { useGameStore } from '@/game/useGameStore';
import { getXPProgress, getRankForLevel } from '@/game/gameConfig';
import GameAvatar from './AvatarSystem';
import { palette } from '@/theme/palette';

export default function PlayerHUD() {
  const stats = useGameStore(s => s.stats);
  const avatarSkin = useGameStore(s => s.avatarSkin);
  const xpProgress = getXPProgress(stats.totalXP);
  const rankCfg = getRankForLevel(stats.level);

  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center justify-between px-4 py-2 z-30 relative"
      style={{
        background: 'rgba(11, 13, 23, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${palette.border}`,
      }}
    >
      {/* Left: Avatar + Player Info */}
      <div className="flex items-center gap-3">
        <GameAvatar skin={avatarSkin} level={stats.level} size={44} mood="idle" />

        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold" style={{ color: palette.text }}>
              Level {stats.level}
            </span>
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{
                background: rankCfg.glowColor,
                color: rankCfg.color,
                border: `1px solid ${rankCfg.color}40`,
              }}
            >
              {stats.title}
            </span>
          </div>

          {/* XP Bar */}
          <div className="flex items-center gap-2 mt-1">
            <div
              className="w-32 h-1.5 rounded-full overflow-hidden"
              style={{ background: palette.progressTrack }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: palette.gradient1 }}
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress.percent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <span className="text-[10px] font-mono" style={{ color: palette.text2 }}>
              {xpProgress.current}/{xpProgress.required}
            </span>
          </div>
        </div>
      </div>

      {/* Center: Quick Stats */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* XP */}
        <HUDStat
          icon={<Zap className="w-3.5 h-3.5" />}
          value={stats.totalXP.toLocaleString()}
          label="XP"
          color="#7C6AFA"
          glowColor="rgba(124, 106, 250, 0.15)"
        />

        {/* Streak */}
        <HUDStat
          icon={<Flame className="w-3.5 h-3.5" />}
          value={`${stats.streak}`}
          label="Streak"
          color="#FBBF24"
          glowColor="rgba(251, 191, 36, 0.15)"
        />

        {/* Coins */}
        <HUDStat
          icon={<Coins className="w-3.5 h-3.5" />}
          value={stats.coins.toLocaleString()}
          label="Coins"
          color="#34D399"
          glowColor="rgba(52, 211, 153, 0.15)"
        />

        {/* Quests */}
        <div className="hidden md:block">
          <HUDStat
            icon={<Trophy className="w-3.5 h-3.5" />}
            value={`${stats.questsCompleted}`}
            label="Quests"
            color="#22D3EE"
            glowColor="rgba(34, 211, 238, 0.15)"
          />
        </div>
      </div>

      {/* Right: Rank Badge */}
      <motion.div
        className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl"
        style={{
          background: rankCfg.glowColor,
          border: `1px solid ${rankCfg.color}30`,
        }}
        whileHover={{ scale: 1.05 }}
      >
        <Star className="w-4 h-4" style={{ color: rankCfg.color }} />
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: rankCfg.color }}>
            {stats.rank}
          </p>
          <p className="text-[9px]" style={{ color: palette.text2 }}>
            Rank
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── HUD Stat Pill ── */
function HUDStat({
  icon,
  value,
  label,
  color,
  glowColor,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
  glowColor: string;
}) {
  return (
    <motion.div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg cursor-default"
      style={{ background: glowColor }}
      whileHover={{ scale: 1.08, boxShadow: `0 0 15px ${glowColor}` }}
      transition={{ duration: 0.2 }}
    >
      <div style={{ color }}>{icon}</div>
      <div className="text-right">
        <p className="text-xs font-bold leading-none" style={{ color }}>{value}</p>
        <p className="text-[8px] uppercase tracking-wider" style={{ color: palette.text2 }}>{label}</p>
      </div>
    </motion.div>
  );
}
