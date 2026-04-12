/* ═══════════════════════════════════════════════════════
   LearnNova Game System — Type Definitions
   ═══════════════════════════════════════════════════════ */

export type RankTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
export type RankTitle = 'Apprentice' | 'Scholar' | 'Master' | 'Legend' | 'Mythic';

export type AvatarSkin = 'default' | 'cyber' | 'mystic' | 'flame' | 'frost' | 'void';
export type AvatarMood = 'idle' | 'happy' | 'success' | 'levelup' | 'thinking';

export interface PlayerStats {
  totalXP: number;
  level: number;
  rank: RankTier;
  title: RankTitle;
  coins: number;
  streak: number;
  longestStreak: number;
  questsCompleted: number;
  certificatesEarned: number;
  totalStudyMinutes: number;
  dailyChallengesDone: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;         // lucide icon name
  category: 'learning' | 'social' | 'streak' | 'mastery' | 'special';
  xpReward: number;
  coinReward: number;
  unlockedAt?: string;  // ISO date
  requirement: {
    type: 'xp' | 'level' | 'quests' | 'streak' | 'certificates' | 'custom';
    target: number;
  };
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'main' | 'side' | 'daily' | 'weekly';
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  xpReward: number;
  coinReward: number;
  progress: number;       // 0-100
  totalSteps: number;
  currentStep: number;
  courseId?: string;
  deadline?: string;      // ISO date
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned: boolean;
  earnedAt?: string;
}

export interface Certificate {
  id: string;
  courseId: string;
  courseTitle: string;
  studentName: string;
  completionDate: string;
  score: number;
  blockchainHash?: string;
  tokenId?: number;
  verified: boolean;
  nftUrl?: string;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  coinReward: number;
  completed: boolean;
  expiresAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: AvatarSkin;
  level: number;
  xp: number;
  title: RankTitle;
  tier: RankTier;
  isCurrentUser: boolean;
}

export interface XPEvent {
  id: string;
  amount: number;
  source: string;
  timestamp: number;
}

export interface LevelUpEvent {
  newLevel: number;
  newRank?: RankTier;
  newTitle?: RankTitle;
  unlockedFeatures: string[];
}
