'use client';
/* ═══════════════════════════════════════════════════════
   LearnNova Game System — Zustand Game Store
   ═══════════════════════════════════════════════════════ */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  PlayerStats,
  Achievement,
  Quest,
  Badge,
  DailyChallenge,
  XPEvent,
  LevelUpEvent,
  AvatarSkin,
  LeaderboardEntry,
} from './types';
import {
  getLevelFromXP,
  getRankForLevel,
  ACHIEVEMENTS,
  DEFAULT_BADGES,
  generateDailyChallenges,
} from './gameConfig';

/* ── Store Shape ── */
interface GameState {
  /* Player */
  stats: PlayerStats;
  avatarSkin: AvatarSkin;
  unlockedSkins: AvatarSkin[];

  /* Collections */
  achievements: Achievement[];
  quests: Quest[];
  badges: Badge[];
  dailyChallenges: DailyChallenge[];

  /* Event queues (consumed by UI components) */
  xpEvents: XPEvent[];
  levelUpEvent: LevelUpEvent | null;
  achievementUnlockQueue: Achievement[];

  /* Leaderboard (mock) */
  leaderboard: LeaderboardEntry[];

  /* Actions */
  syncStats: (stats: Partial<PlayerStats>) => void;
  addXP: (amount: number, source: string) => void;
  addCoins: (amount: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  completeQuest: (questId: string) => void;
  completeDailyChallenge: (id: string) => void;
  setAvatarSkin: (skin: AvatarSkin) => void;
  unlockSkin: (skin: AvatarSkin) => void;
  dismissXPEvent: (id: string) => void;
  dismissLevelUp: () => void;
  dismissAchievement: () => void;
  refreshDailyChallenges: () => void;
  incrementCertificates: () => void;
}

/* ── Initial Leaderboard ── */
const initialLeaderboard: LeaderboardEntry[] = [];

/* ── Initial Quests ── */
const initialQuests: Quest[] = [
  {
    id: 'quest_daily_study',
    title: 'Daily Scholar',
    description: 'Study for 30 minutes today',
    type: 'daily',
    status: 'available',
    xpReward: 35,
    coinReward: 10,
    progress: 0,
    totalSteps: 1,
    currentStep: 0,
    difficulty: 'easy',
  },
  {
    id: 'quest_weekly_quiz',
    title: 'Quiz Champion',
    description: 'Complete 3 quizzes this week',
    type: 'weekly',
    status: 'in_progress',
    xpReward: 150,
    coinReward: 75,
    progress: 0,
    totalSteps: 3,
    currentStep: 0,
    difficulty: 'medium',
  },
];

/* ── Initial State ── */
const initialStats: PlayerStats = {
  totalXP: 0,
  level: 1,
  rank: 'Bronze',
  title: 'Apprentice',
  coins: 0,
  streak: 0,
  longestStreak: 0,
  questsCompleted: 0,
  certificatesEarned: 0,
  totalStudyMinutes: 0,
  dailyChallengesDone: 0,
};

/* ── Store ── */
export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      stats: initialStats,
      avatarSkin: 'default' as AvatarSkin,
      unlockedSkins: ['default'] as AvatarSkin[],

      achievements: ACHIEVEMENTS,
      quests: initialQuests,
      badges: DEFAULT_BADGES,
      dailyChallenges: generateDailyChallenges(),

      xpEvents: [],
      levelUpEvent: null,
      achievementUnlockQueue: [],

      leaderboard: initialLeaderboard,

      /* ── Sync from Backend ── */
      syncStats: (stats) => set(s => {
        const newTotalXP = stats.totalXP ?? s.stats.totalXP;
        const derivedLevel = getLevelFromXP(newTotalXP);
        const rankCfg = getRankForLevel(derivedLevel);
        
        return {
          stats: { 
            ...s.stats, 
            ...stats,
            totalXP: newTotalXP,
            level: derivedLevel,
            rank: rankCfg.tier,
            title: rankCfg.title
          }
        };
      }),

      /* ── Add XP ── */
      addXP: (amount, source) => {
        const state = get();
        const oldLevel = state.stats.level;
        const newTotalXP = state.stats.totalXP + amount;
        const newLevel = getLevelFromXP(newTotalXP);
        const rankConfig = getRankForLevel(newLevel);

        const xpEvent: XPEvent = {
          id: `xp_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          amount,
          source,
          timestamp: Date.now(),
        };

        let levelUpEvent: LevelUpEvent | null = null;
        if (newLevel > oldLevel) {
          const oldRank = getRankForLevel(oldLevel);
          levelUpEvent = {
            newLevel,
            newRank: rankConfig.tier !== oldRank.tier ? rankConfig.tier : undefined,
            newTitle: rankConfig.title !== oldRank.title ? rankConfig.title : undefined,
            unlockedFeatures: [],
          };
        }

        // Check achievements
        const newAchievements: Achievement[] = [];
        const updatedAchievements = state.achievements.map(a => {
          if (a.unlockedAt) return a;
          let unlocked = false;
          switch (a.requirement.type) {
            case 'xp': unlocked = newTotalXP >= a.requirement.target; break;
            case 'level': unlocked = newLevel >= a.requirement.target; break;
            case 'streak': unlocked = state.stats.streak >= a.requirement.target; break;
            case 'quests': unlocked = state.stats.questsCompleted >= a.requirement.target; break;
            case 'certificates': unlocked = state.stats.certificatesEarned >= a.requirement.target; break;
          }
          if (unlocked) {
            const unlockedAchievement = { ...a, unlockedAt: new Date().toISOString() };
            newAchievements.push(unlockedAchievement);
            return unlockedAchievement;
          }
          return a;
        });

        set({
          stats: {
            ...state.stats,
            totalXP: newTotalXP,
            level: newLevel,
            rank: rankConfig.tier,
            title: rankConfig.title,
          },
          achievements: updatedAchievements,
          xpEvents: [...state.xpEvents, xpEvent],
          levelUpEvent: levelUpEvent || state.levelUpEvent,
          achievementUnlockQueue: [...state.achievementUnlockQueue, ...newAchievements],
        });
      },

      /* ── Add Coins ── */
      addCoins: (amount) => set(s => ({
        stats: { ...s.stats, coins: s.stats.coins + amount },
      })),

      /* ── Streak ── */
      incrementStreak: () => set(s => {
        const newStreak = s.stats.streak + 1;
        return {
          stats: {
            ...s.stats,
            streak: newStreak,
            longestStreak: Math.max(newStreak, s.stats.longestStreak),
          },
        };
      }),

      resetStreak: () => set(s => ({
        stats: { ...s.stats, streak: 0 },
      })),

      /* ── Quests ── */
      completeQuest: (questId) => set(s => ({
        quests: s.quests.map(q =>
          q.id === questId
            ? { ...q, status: 'completed' as const, progress: 100, currentStep: q.totalSteps }
            : q
        ),
        stats: { ...s.stats, questsCompleted: s.stats.questsCompleted + 1 },
      })),

      /* ── Daily Challenges ── */
      completeDailyChallenge: (id) => set(s => ({
        dailyChallenges: s.dailyChallenges.map(c =>
          c.id === id ? { ...c, completed: true } : c
        ),
        stats: { ...s.stats, dailyChallengesDone: s.stats.dailyChallengesDone + 1 },
      })),

      /* ── Avatar ── */
      setAvatarSkin: (skin) => set({ avatarSkin: skin }),
      unlockSkin: (skin) => set(s => ({
        unlockedSkins: [...new Set([...s.unlockedSkins, skin])],
      })),

      /* ── Event Dismissal ── */
      dismissXPEvent: (id) => set(s => ({
        xpEvents: s.xpEvents.filter(e => e.id !== id),
      })),

      dismissLevelUp: () => set({ levelUpEvent: null }),

      dismissAchievement: () => set(s => ({
        achievementUnlockQueue: s.achievementUnlockQueue.slice(1),
      })),

      /* ── Refresh ── */
      refreshDailyChallenges: () => set({
        dailyChallenges: generateDailyChallenges(),
      }),

      /* ── Certificates ── */
      incrementCertificates: () => set(s => ({
        stats: { ...s.stats, certificatesEarned: s.stats.certificatesEarned + 1 },
      })),
    }),
    {
      name: 'learnnova-game-v2', // Bumped version to clear old dummy data from localStorage
      partialize: (state) => ({
        stats: state.stats,
        avatarSkin: state.avatarSkin,
        unlockedSkins: state.unlockedSkins,
        badges: state.badges,
      }),
    }
  )
);
