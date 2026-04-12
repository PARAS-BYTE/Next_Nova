/* ═══════════════════════════════════════════════════════
   LearnNova Game System — Configuration & Constants
   ═══════════════════════════════════════════════════════ */

import type { RankTier, RankTitle, Achievement, Badge, DailyChallenge } from './types';

/* ── XP Rewards Table ── */
export const XP_REWARDS = {
  COMPLETE_LESSON: 25,
  COMPLETE_QUIZ: 50,
  PERFECT_QUIZ: 150,
  COMPLETE_COURSE: 500,
  DAILY_LOGIN: 10,
  STREAK_BONUS_7: 100,
  STREAK_BONUS_30: 500,
  FORUM_POST: 15,
  ASSIGNMENT_SUBMIT: 30,
  FIRST_COURSE_ENROLL: 20,
  CERTIFICATE_EARNED: 200,
  DAILY_CHALLENGE: 35,
  HELP_ANSWER: 25,
} as const;

/* ── Coin Rewards ── */
export const COIN_REWARDS = {
  COMPLETE_LESSON: 5,
  COMPLETE_QUIZ: 15,
  PERFECT_QUIZ: 50,
  COMPLETE_COURSE: 200,
  DAILY_LOGIN: 3,
  STREAK_BONUS_7: 50,
  DAILY_CHALLENGE: 10,
  ACHIEVEMENT_UNLOCK: 25,
} as const;

/* ── Level Thresholds ── */
export function xpForLevel(level: number): number {
  // Exponential curve: each level requires ~15% more XP
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) total += xpForLevel(i);
  return total;
}

export function getLevelFromXP(totalXP: number): number {
  let level = 1;
  let remaining = totalXP;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level++;
  }
  return level;
}

export function getXPProgress(totalXP: number): { current: number; required: number; percent: number } {
  const level = getLevelFromXP(totalXP);
  const xpForCurrent = totalXpForLevel(level);
  const currentLevelXP = totalXP - xpForCurrent;
  const requiredXP = xpForLevel(level);
  return {
    current: currentLevelXP,
    required: requiredXP,
    percent: Math.min(100, Math.round((currentLevelXP / requiredXP) * 100)),
  };
}

/* ── Rank Progression ── */
interface RankConfig {
  tier: RankTier;
  title: RankTitle;
  minLevel: number;
  maxLevel: number;
  color: string;
  glowColor: string;
  bgGradient: string;
}

export const RANKS: RankConfig[] = [
  {
    tier: 'Bronze',
    title: 'Apprentice',
    minLevel: 1, maxLevel: 5,
    color: '#CD7F32',
    glowColor: 'rgba(205, 127, 50, 0.3)',
    bgGradient: 'linear-gradient(135deg, #CD7F32, #8B5A2B)',
  },
  {
    tier: 'Silver',
    title: 'Scholar',
    minLevel: 6, maxLevel: 15,
    color: '#C0C0C0',
    glowColor: 'rgba(192, 192, 192, 0.3)',
    bgGradient: 'linear-gradient(135deg, #C0C0C0, #808080)',
  },
  {
    tier: 'Gold',
    title: 'Master',
    minLevel: 16, maxLevel: 30,
    color: '#FFD700',
    glowColor: 'rgba(255, 215, 0, 0.3)',
    bgGradient: 'linear-gradient(135deg, #FFD700, #FFA500)',
  },
  {
    tier: 'Platinum',
    title: 'Legend',
    minLevel: 31, maxLevel: 50,
    color: '#E5E4E2',
    glowColor: 'rgba(229, 228, 226, 0.3)',
    bgGradient: 'linear-gradient(135deg, #E5E4E2, #B0C4DE)',
  },
  {
    tier: 'Diamond',
    title: 'Mythic',
    minLevel: 51, maxLevel: 999,
    color: '#B9F2FF',
    glowColor: 'rgba(185, 242, 255, 0.4)',
    bgGradient: 'linear-gradient(135deg, #B9F2FF, #7C6AFA)',
  },
];

export function getRankForLevel(level: number): RankConfig {
  return RANKS.find(r => level >= r.minLevel && level <= r.maxLevel) || RANKS[0];
}

/* ── Achievement Definitions ── */
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_quest',
    name: 'First Steps',
    description: 'Complete your first quest',
    icon: 'Footprints',
    category: 'learning',
    xpReward: 50,
    coinReward: 20,
    requirement: { type: 'quests', target: 1 },
  },
  {
    id: 'streak_7',
    name: 'On Fire',
    description: 'Maintain a 7-day study streak',
    icon: 'Flame',
    category: 'streak',
    xpReward: 100,
    coinReward: 50,
    requirement: { type: 'streak', target: 7 },
  },
  {
    id: 'streak_30',
    name: 'Unstoppable',
    description: 'Maintain a 30-day study streak',
    icon: 'Zap',
    category: 'streak',
    xpReward: 500,
    coinReward: 200,
    requirement: { type: 'streak', target: 30 },
  },
  {
    id: 'level_10',
    name: 'Rising Star',
    description: 'Reach Level 10',
    icon: 'Star',
    category: 'mastery',
    xpReward: 200,
    coinReward: 100,
    requirement: { type: 'level', target: 10 },
  },
  {
    id: 'level_25',
    name: 'Master Scholar',
    description: 'Reach Level 25',
    icon: 'Crown',
    category: 'mastery',
    xpReward: 500,
    coinReward: 250,
    requirement: { type: 'level', target: 25 },
  },
  {
    id: 'cert_1',
    name: 'Certified',
    description: 'Earn your first blockchain certificate',
    icon: 'Award',
    category: 'special',
    xpReward: 200,
    coinReward: 100,
    requirement: { type: 'certificates', target: 1 },
  },
  {
    id: 'cert_5',
    name: 'Certificate Collector',
    description: 'Earn 5 blockchain certificates',
    icon: 'Trophy',
    category: 'special',
    xpReward: 1000,
    coinReward: 500,
    requirement: { type: 'certificates', target: 5 },
  },
  {
    id: 'xp_1000',
    name: 'Knowledge Seeker',
    description: 'Earn 1,000 total XP',
    icon: 'Sparkles',
    category: 'mastery',
    xpReward: 100,
    coinReward: 50,
    requirement: { type: 'xp', target: 1000 },
  },
  {
    id: 'xp_10000',
    name: 'Grand Scholar',
    description: 'Earn 10,000 total XP',
    icon: 'GraduationCap',
    category: 'mastery',
    xpReward: 500,
    coinReward: 250,
    requirement: { type: 'xp', target: 10000 },
  },
  {
    id: 'quests_10',
    name: 'Quest Hunter',
    description: 'Complete 10 quests',
    icon: 'Swords',
    category: 'learning',
    xpReward: 300,
    coinReward: 150,
    requirement: { type: 'quests', target: 10 },
  },
];

/* ── Default Badges ── */
export const DEFAULT_BADGES: Badge[] = [
  { id: 'newcomer', name: 'Newcomer', description: 'Joined the platform', icon: 'UserPlus', rarity: 'common', earned: true },
  { id: 'first_blood', name: 'First Blood', description: 'Completed first lesson', icon: 'Sword', rarity: 'common', earned: false },
  { id: 'quiz_ace', name: 'Quiz Ace', description: 'Scored 100% on a quiz', icon: 'Target', rarity: 'rare', earned: false },
  { id: 'marathon', name: 'Marathon Learner', description: '5+ hours in one day', icon: 'Timer', rarity: 'rare', earned: false },
  { id: 'chain_master', name: 'Chain Master', description: 'Verified on blockchain', icon: 'Link', rarity: 'epic', earned: false },
  { id: 'mythic_scholar', name: 'Mythic Scholar', description: 'Reach Diamond rank', icon: 'Gem', rarity: 'legendary', earned: false },
];

/* ── Daily Challenges Generator ── */
export function generateDailyChallenges(): DailyChallenge[] {
  const challenges: Omit<DailyChallenge, 'id' | 'expiresAt'>[] = [
    { title: 'Study Sprint', description: 'Complete 3 lessons today', xpReward: 35, coinReward: 10, completed: false },
    { title: 'Quiz Master', description: 'Score 80%+ on any quiz', xpReward: 50, coinReward: 15, completed: false },
    { title: 'Social Butterfly', description: 'Post in the forum', xpReward: 20, coinReward: 8, completed: false },
  ];

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  return challenges.map((c, i) => ({
    ...c,
    id: `daily_${Date.now()}_${i}`,
    expiresAt: endOfDay.toISOString(),
  }));
}

/* ── Avatar Configurations ── */
export const AVATAR_SKINS = {
  default: { name: 'Nova Explorer', color: '#7C6AFA', unlockLevel: 1, cost: 0 },
  cyber: { name: 'Cyber Knight', color: '#22D3EE', unlockLevel: 5, cost: 100 },
  mystic: { name: 'Mystic Sage', color: '#A78BFA', unlockLevel: 10, cost: 250 },
  flame: { name: 'Flame Walker', color: '#F97316', unlockLevel: 15, cost: 500 },
  frost: { name: 'Frost Herald', color: '#38BDF8', unlockLevel: 20, cost: 750 },
  void: { name: 'Void Reaver', color: '#EC4899', unlockLevel: 30, cost: 1500 },
} as const;

/* ── Difficulty Colors ── */
export const DIFFICULTY_COLORS = {
  easy: { bg: 'rgba(52, 211, 153, 0.15)', text: '#34D399', border: 'rgba(52, 211, 153, 0.3)' },
  medium: { bg: 'rgba(251, 191, 36, 0.15)', text: '#FBBF24', border: 'rgba(251, 191, 36, 0.3)' },
  hard: { bg: 'rgba(248, 113, 113, 0.15)', text: '#F87171', border: 'rgba(248, 113, 113, 0.3)' },
  legendary: { bg: 'rgba(168, 85, 247, 0.15)', text: '#A855F7', border: 'rgba(168, 85, 247, 0.3)' },
} as const;

/* ── Rarity Colors ── */
export const RARITY_COLORS = {
  common: { bg: 'rgba(156, 163, 175, 0.15)', text: '#9CA3AF', border: 'rgba(156, 163, 175, 0.3)', glow: 'rgba(156, 163, 175, 0.2)' },
  rare: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3B82F6', border: 'rgba(59, 130, 246, 0.3)', glow: 'rgba(59, 130, 246, 0.2)' },
  epic: { bg: 'rgba(168, 85, 247, 0.15)', text: '#A855F7', border: 'rgba(168, 85, 247, 0.3)', glow: 'rgba(168, 85, 247, 0.3)' },
  legendary: { bg: 'rgba(255, 215, 0, 0.15)', text: '#FFD700', border: 'rgba(255, 215, 0, 0.3)', glow: 'rgba(255, 215, 0, 0.3)' },
} as const;
