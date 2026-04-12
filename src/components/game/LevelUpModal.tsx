'use client';
/* ═══════════════════════════════════════════════════════
   Level-Up Modal — Celebration screen
   ═══════════════════════════════════════════════════════ */

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/game/useGameStore';
import { getRankForLevel } from '@/game/gameConfig';
import GameAvatar from './AvatarSystem';
import { palette } from '@/theme/palette';

export default function LevelUpModal() {
  const levelUpEvent = useGameStore(s => s.levelUpEvent);
  const dismissLevelUp = useGameStore(s => s.dismissLevelUp);
  const avatarSkin = useGameStore(s => s.avatarSkin);

  if (!levelUpEvent) return null;

  const rankCfg = getRankForLevel(levelUpEvent.newLevel);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }}
          onClick={dismissLevelUp}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Content */}
        <motion.div
          className="relative z-10 text-center max-w-md w-full mx-4"
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {/* Radial glow */}
          <motion.div
            className="absolute -inset-20 rounded-full"
            style={{
              background: `radial-gradient(circle, ${rankCfg.color}20 0%, transparent 70%)`,
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Particle ring */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: i % 2 === 0 ? rankCfg.color : '#22D3EE',
                left: '50%',
                top: '50%',
              }}
              animate={{
                x: Math.cos((i / 12) * Math.PI * 2) * 160,
                y: Math.sin((i / 12) * Math.PI * 2) * 160,
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}

          {/* Card */}
          <div
            className="relative rounded-3xl p-8 overflow-hidden"
            style={{
              background: palette.card,
              border: `2px solid ${rankCfg.color}50`,
              boxShadow: `0 0 60px ${rankCfg.glowColor}, 0 20px 60px rgba(0,0,0,0.5)`,
            }}
          >
            {/* Top glow line */}
            <div className="absolute top-0 left-0 right-0 h-1" style={{ background: rankCfg.bgGradient }} />

            {/* LEVEL UP Text */}
            <motion.h2
              className="text-4xl font-black mb-2"
              style={{
                background: `linear-gradient(135deg, ${rankCfg.color}, #22D3EE)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
              animate={{
                scale: [1, 1.05, 1],
                textShadow: [
                  `0 0 20px ${rankCfg.color}40`,
                  `0 0 40px ${rankCfg.color}60`,
                  `0 0 20px ${rankCfg.color}40`,
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              LEVEL UP!
            </motion.h2>

            <p className="text-lg font-semibold mb-6" style={{ color: palette.text }}>
              You reached <span style={{ color: rankCfg.color }}>Level {levelUpEvent.newLevel}</span>
            </p>

            {/* Avatar celebration */}
            <div className="flex justify-center mb-6">
              <GameAvatar
                skin={avatarSkin}
                level={levelUpEvent.newLevel}
                mood="levelup"
                size={100}
              />
            </div>

            {/* New rank */}
            {levelUpEvent.newRank && (
              <motion.div
                className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-full"
                style={{
                  background: rankCfg.glowColor,
                  border: `1px solid ${rankCfg.color}50`,
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
              >
                <span className="text-sm font-bold" style={{ color: rankCfg.color }}>
                  🎖️ New Rank: {levelUpEvent.newRank} — {levelUpEvent.newTitle}
                </span>
              </motion.div>
            )}

            {/* Continue button */}
            <motion.button
              className="mt-6 px-8 py-3 rounded-xl font-bold text-white border-0 cursor-pointer"
              style={{
                background: rankCfg.bgGradient,
                boxShadow: `0 4px 20px ${rankCfg.glowColor}`,
              }}
              whileHover={{ scale: 1.05, boxShadow: `0 8px 30px ${rankCfg.glowColor}` }}
              whileTap={{ scale: 0.95 }}
              onClick={dismissLevelUp}
            >
              Continue Adventure →
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
