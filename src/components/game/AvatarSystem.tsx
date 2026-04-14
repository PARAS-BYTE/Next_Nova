'use client';
/* ═══════════════════════════════════════════════════════
   Avatar System — SVG Character with animated states
   ═══════════════════════════════════════════════════════ */

import { motion, AnimatePresence } from 'framer-motion';
import type { AvatarSkin, AvatarMood } from '@/game/types';
import { AVATAR_SKINS } from '@/game/gameConfig';
import { getRankForLevel } from '@/game/gameConfig';

interface AvatarProps {
  skin?: AvatarSkin;
  mood?: AvatarMood;
  level?: number;
  size?: number;
  showRing?: boolean;
  className?: string;
}

/*
  SVG-based avatar with glow ring matching skin color.
  The ring pulses on levelup mood and shows rank-colored border.
*/
export default function GameAvatar({
  skin = 'default',
  mood = 'idle',
  level = 1,
  size = 64,
  showRing = true,
  className = '',
}: AvatarProps) {
  const cfg = AVATAR_SKINS[skin as keyof typeof AVATAR_SKINS] || AVATAR_SKINS.default;
  const rankCfg = getRankForLevel(level);

  /* Animation variants per mood */
  const bodyVariants = {
    idle: {
      y: [0, -3, 0],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    },
    happy: {
      y: [0, -8, 0],
      scale: [1, 1.05, 1],
      transition: { duration: 0.6, repeat: Infinity, repeatDelay: 1.5 },
    },
    success: {
      rotate: [0, -5, 5, -5, 0],
      scale: [1, 1.1, 1],
      transition: { duration: 0.5 },
    },
    levelup: {
      y: [0, -12, 0],
      scale: [1, 1.15, 1],
      transition: { duration: 0.8, repeat: 2 },
    },
    thinking: {
      rotate: [0, 3, -3, 0],
      transition: { duration: 2, repeat: Infinity },
    },
  };

  const eyeVariants = {
    idle: {
      scaleY: [1, 1, 0.1, 1],
      transition: { duration: 4, repeat: Infinity, repeatDelay: 2 },
    },
    happy: {
      scaleY: [1, 0.3, 1],
      transition: { duration: 0.3, repeat: Infinity, repeatDelay: 2 },
    },
    success: { scaleY: 0.3 },
    levelup: {
      scaleY: [1, 0.2, 1, 0.2, 1],
      transition: { duration: 1,  repeat: 2},
    },
    thinking: {
      x: [0, 2, 0, -2, 0],
      transition: { duration: 2, repeat: Infinity },
    },
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {/* Rank glow ring */}
      {showRing && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(${cfg.color}, ${rankCfg.color}, ${cfg.color})`,
            padding: 2,
          }}
          animate={
            mood === 'levelup'
              ? { scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }
              : { rotate: 360 }
          }
          transition={
            mood === 'levelup'
              ? { duration: 0.6, repeat: Infinity }
              : { duration: 8, repeat: Infinity, ease: 'linear' }
          }
        >
          <div className="w-full h-full rounded-full" style={{ background: '#0B0D17' }} />
        </motion.div>
      )}

      {/* Avatar body */}
      <motion.svg
        viewBox="0 0 100 100"
        width={size * 0.75}
        height={size * 0.75}
        className="relative z-10"
        variants={bodyVariants}
        animate={mood}
      >
        {/* Head glow */}
        <defs>
          <radialGradient id={`glow-${skin}`} cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor={cfg.color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={cfg.color} stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`body-${skin}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={cfg.color} />
            <stop offset="100%" stopColor={cfg.color + '88'} />
          </linearGradient>
        </defs>

        {/* Glow behind */}
        <circle cx="50" cy="45" r="40" fill={`url(#glow-${skin})`} />

        {/* Body */}
        <ellipse cx="50" cy="70" rx="22" ry="18" fill={`url(#body-${skin})`} opacity="0.6" />
        
        {/* Head */}
        <circle cx="50" cy="40" r="24" fill={`url(#body-${skin})`} />
        
        {/* Face visor / mask line */}
        <path
          d="M30 38 Q50 52 70 38"
          fill="none"
          stroke={cfg.color}
          strokeWidth="1.5"
          opacity="0.5"
        />

        {/* Eyes */}
        <motion.g variants={eyeVariants} animate={mood}>
          <circle cx="40" cy="37" r="3" fill="#fff" />
          <circle cx="60" cy="37" r="3" fill="#fff" />
          {/* Pupils */}
          <circle cx="41" cy="37" r="1.5" fill="#0B0D17" />
          <circle cx="61" cy="37" r="1.5" fill="#0B0D17" />
        </motion.g>

        {/* Mouth - changes with mood */}
        {mood === 'happy' || mood === 'success' || mood === 'levelup' ? (
          <path d="M42 46 Q50 52 58 46" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
        ) : mood === 'thinking' ? (
          <circle cx="52" cy="48" r="2" fill="#fff" opacity="0.5" />
        ) : (
          <line x1="44" y1="47" x2="56" y2="47" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        )}

        {/* Level badge */}
        <circle cx="72" cy="22" r="10" fill="#0B0D17" stroke={rankCfg.color} strokeWidth="1.5" />
        <text x="72" y="26" textAnchor="middle" fontSize="9" fontWeight="bold" fill={rankCfg.color}>
          {level}
        </text>
      </motion.svg>

      {/* Level-up sparkle effects */}
      <AnimatePresence>
        {mood === 'levelup' && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{ background: cfg.color }}
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                  x: Math.cos((i / 6) * Math.PI * 2) * size * 0.6,
                  y: Math.sin((i / 6) * Math.PI * 2) * size * 0.6,
                }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
