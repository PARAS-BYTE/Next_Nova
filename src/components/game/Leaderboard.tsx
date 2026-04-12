'use client';
/* ═══════════════════════════════════════════════════════
   Leaderboard Component — Ranked player list
   ═══════════════════════════════════════════════════════ */

import { motion } from 'framer-motion';
import { Crown, TrendingUp, Medal } from 'lucide-react';
import { useGameStore } from '@/game/useGameStore';
import { getRankForLevel } from '@/game/gameConfig';
import GameAvatar from './AvatarSystem';
import { palette } from '@/theme/palette';
import type { AvatarSkin } from '@/game/types';

export default function Leaderboard() {
  const leaderboard = useGameStore(s => s.leaderboard);

  const topThreeColors = ['#FFD700', '#C0C0C0', '#CD7F32'];

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: palette.card,
        border: `1px solid ${palette.border}`,
      }}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${palette.border}` }}>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(255, 215, 0, 0.15)' }}
          >
            <Crown className="w-4 h-4 text-[#FFD700]" />
          </div>
          <h3 className="text-sm font-bold" style={{ color: palette.text }}>
            Leaderboard
          </h3>
        </div>
        <span className="text-[10px] font-medium px-2 py-1 rounded-full" style={{ background: palette.accentSoft, color: palette.accent }}>
          This Week
        </span>
      </div>

      {/* List */}
      <div className="p-2 space-y-1">
        {leaderboard.slice(0, 8).map((entry, i) => {
          const rankCfg = getRankForLevel(entry.level);
          const isTop3 = entry.rank <= 3;

          return (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                entry.isCurrentUser ? 'ring-1' : ''
              }`}
              style={{
                background: entry.isCurrentUser ? palette.accentSoft : 'transparent',
                borderColor: entry.isCurrentUser ? palette.accent + '30' : 'transparent',
                ringColor: entry.isCurrentUser ? palette.accent + '30' : undefined,
              }}
            >
              {/* Rank number */}
              <div className="w-6 text-center flex-shrink-0">
                {isTop3 ? (
                  <Medal className="w-4 h-4 mx-auto" style={{ color: topThreeColors[entry.rank - 1] }} />
                ) : (
                  <span className="text-xs font-bold" style={{ color: palette.text2 }}>
                    #{entry.rank}
                  </span>
                )}
              </div>

              {/* Avatar */}
              <GameAvatar skin={entry.avatar as AvatarSkin} level={entry.level} size={32} showRing={false} mood="idle" />

              {/* Name & Title */}
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold truncate ${entry.isCurrentUser ? 'text-gradient' : ''}`}
                  style={{ color: entry.isCurrentUser ? undefined : palette.text }}
                >
                  {entry.name} {entry.isCurrentUser && '(You)'}
                </p>
                <p className="text-[9px]" style={{ color: rankCfg.color }}>
                  Lv.{entry.level} · {entry.title}
                </p>
              </div>

              {/* XP */}
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-bold" style={{ color: palette.accent }}>
                  {entry.xp.toLocaleString()}
                </p>
                <p className="text-[8px]" style={{ color: palette.text2 }}>XP</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
