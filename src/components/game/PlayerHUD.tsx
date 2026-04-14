'use client';
/* ═══════════════════════════════════════════════════════
   Player HUD — Strict G/W/B with original shapes
   ═══════════════════════════════════════════════════════ */

import { motion } from 'framer-motion';
import { Flame, Coins, Zap, Trophy, Star } from 'lucide-react';
import { useGameStore } from '@/game/useGameStore';
import { getXPProgress } from '@/game/gameConfig';
import GameAvatar from './AvatarSystem';
import { palette } from '@/theme/palette';

export default function PlayerHUD() {
  const stats = useGameStore(s => s.stats);
  const avatarSkin = useGameStore(s => s.avatarSkin);
  const xpProgress = getXPProgress(stats.totalXP);

  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center justify-between px-6 py-3 z-30 relative"
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${palette.border}`,
      }}
    >
      {/* Left: Avatar + Player Info */}
      <div className="flex items-center gap-4">
        <GameAvatar skin={avatarSkin} level={stats.level} size={48} mood="idle" showRing={true} />

        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-black uppercase tracking-tight">
              Level {stats.level}
            </span>
            <span
              className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 bg-[#1E4D3B] text-white rounded-full"
            >
              {stats.title}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-1.5">
            <div
              className="w-40 h-1.5 bg-slate-100 rounded-full overflow-hidden"
            >
              <motion.div
                className="h-full bg-[#1E4D3B] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress.percent}%` }}
                transition={{ duration: 1.5 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Center: Quick Stats */}
      <div className="flex items-center gap-3 lg:gap-6">
        <HUDStat
          icon={<Zap className="w-4 h-4" />}
          value={stats.totalXP.toLocaleString()}
          label="Total XP"
          color="#1E4D3B"
          glowColor="rgba(30, 77, 59, 0.05)"
        />

        <HUDStat
          icon={<Flame className="w-4 h-4" />}
          value={`${stats.streak}`}
          label="Streak"
          color="#000000"
          glowColor="rgba(0, 0, 0, 0.05)"
        />

        <HUDStat
          icon={<Coins className="w-4 h-4" />}
          value={stats.coins.toLocaleString()}
          label="Loot"
          color="#1E4D3B"
          glowColor="rgba(30, 77, 59, 0.05)"
        />

        <div className="hidden lg:block">
          <HUDStat
            icon={<Trophy className="w-4 h-4" />}
            value={`${stats.questsCompleted}`}
            label="Modules"
            color="#000000"
            glowColor="rgba(0, 0, 0, 0.05)"
          />
        </div>
      </div>

      {/* Right: Rank Status */}
      <motion.div
        className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-xl border border-slate-100 bg-white shadow-sm"
        whileHover={{ scale: 1.05 }}
      >
        <Star className="w-5 h-5 text-[#1E4D3B]" />
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold text-black leading-none pb-0.5">
            {stats.rank}
          </p>
          <p className="text-[9px] font-bold uppercase tracking-widest text-[#1E4D3B]">
             Active Portal
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
      className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl cursor-default border border-transparent hover:border-slate-100 hover:bg-white hover:shadow-sm"
      style={{ background: glowColor }}
      whileHover={{ y: -2 }}
    >
      <div style={{ color }}>{icon}</div>
      <div className="text-left">
        <p className="text-sm font-bold leading-none text-black">{value}</p>
        <p className="text-[8px] uppercase tracking-widest font-black text-slate-400">{label}</p>
      </div>
    </motion.div>
  );
}
