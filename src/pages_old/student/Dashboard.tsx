import Link from 'next/link';
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import {
  Target,
  Flame,
  BookOpen,
  Clock,
  Zap,
  ChevronRight,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Swords,
  Trophy,
  Coins,
  Star,
  Award,
  Calendar,
  Gamepad2,
} from "lucide-react";

import axios from "axios";
import { useStopwatch } from "@/components/Providers";
import { palette } from "../../theme/palette";
import { useGameStore } from "@/game/useGameStore";
import { getXPProgress, getRankForLevel, DIFFICULTY_COLORS } from "@/game/gameConfig";
import GameAvatar from "@/components/game/AvatarSystem";
import QuestCard from "@/components/game/QuestCard";
import Leaderboard from "@/components/game/Leaderboard";
import AITherapistWidget from "@/components/AITherapistWidget";


/* ── Animation helpers ────────────────────────── */
const cardVariant = (i: number) => ({
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
});

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { elapsedTime, formatTime } = useStopwatch();

  /* Game Store */
  const stats = useGameStore(s => s.stats);
  const quests = useGameStore(s => s.quests);
  const avatarSkin = useGameStore(s => s.avatarSkin);
  const dailyChallenges = useGameStore(s => s.dailyChallenges);
  const addXP = useGameStore(s => s.addXP);
  const addCoins = useGameStore(s => s.addCoins);
  const achievements = useGameStore(s => s.achievements);

  const xpProgress = getXPProgress(stats.totalXP);
  const rankCfg = getRankForLevel(stats.level);
  const earnedAchievements = achievements.filter(a => a.unlockedAt);

  /* FETCH DATA */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers: any = {};
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await axios.get("/api/auth/dashboard", {
          headers,
          withCredentials: true,
        });

        setUser(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: palette.bg }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          {/* Game-style loading */}
          <motion.div
            className="relative w-20 h-20"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <div className="absolute inset-0 rounded-full" style={{ border: `3px solid ${palette.border}` }} />
            <div className="absolute inset-0 rounded-full" style={{ border: '3px solid transparent', borderTopColor: palette.accent, borderRightColor: '#22D3EE' }} />
            <div className="absolute inset-2 rounded-full flex items-center justify-center" style={{ background: palette.card }}>
              <Gamepad2 className="w-6 h-6" style={{ color: palette. accent }} />
            </div>
          </motion.div>
          <p className="text-sm font-medium shimmer-text">Loading Command Center…</p>
        </motion.div>
      </div>
    );

  if (error)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: palette.bg }}
      >
        <div className="text-center">
          <p className="mb-4" style={{ color: palette.error }}>
            {error}
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="font-semibold rounded-xl border-0"
            style={{ background: palette.gradient1, color: '#fff' }}
          >
            Retry
          </Button>
        </div>
      </div>
    );

  /* MAP DATA */
  const studyTimeData = (user?.last7DaysStudy || []).map((item: any) => ({
    day: item.day || "Mon",
    hours: item.hours || 0,
  }));

  const xpGrowthData = (user?.xpHistory || []).map((item: any) => ({
    day: item.day || "Mon",
    xp: item.xp || 0,
  }));

  const courses = user?.courses || [];
  const upcomingTasks = user?.upcomingTasks || [];
  const streakStats =
    user?.streakStats || { currentStreak: stats.streak, longestStreak: stats.longestStreak };

  const dailyGoalMinutes = user?.onboardingData?.dailyGoalMinutes || 30;
  const goalHours = Math.round((dailyGoalMinutes / 60) * 10) / 10;

  return (
    <div
      className="flex flex-col h-screen"
      style={{ background: palette.bg }}
    >
      {/* ╔═══════════════════════════════════════════════╗
             PLAYER COMMAND CENTER HEADER
         ╚═══════════════════════════════════════════════╝ */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="px-4 sm:px-6 py-4" 
        style={{ borderBottom: `1px solid ${palette.border}`, background: palette.card }}
      >
        <div className="flex items-center justify-between">
          {/* Left: Avatar + Welcome */}
          <div className="flex items-center gap-4">
            <GameAvatar skin={avatarSkin} level={stats.level} size={56} mood="idle" />
            
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate" style={{ color: palette.text }}>
                Welcome back,{" "}
                <span className="text-gradient">
                  {user?.name || "Hero"}
                </span>
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span
                  className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    background: rankCfg.glowColor,
                    color: rankCfg.color,
                    border: `1px solid ${rankCfg.color}40`,
                  }}
                >
                  {stats.rank} · {stats.title}
                </span>
                <div className="hidden sm:flex items-center gap-1.5">
                  <div
                    className="w-24 h-1.5 rounded-full overflow-hidden"
                    style={{ background: palette.progressTrack }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: palette.gradient1 }}
                      initial={{ width: 0 }}
                      animate={{ width: `${xpProgress.percent}%` }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="text-[9px] font-mono" style={{ color: palette.text2 }}>
                    Lv.{stats.level} · {xpProgress.current}/{xpProgress.required} XP
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Quick stats */}
          <div className="hidden md:flex items-center gap-3">
            <HUDPill icon={<Flame className="w-3.5 h-3.5" />} value={`${streakStats.currentStreak}`} label="Streak" color="#FBBF24" />
            <HUDPill icon={<Trophy className="w-3.5 h-3.5" />} value={`${stats.questsCompleted}`} label="Quests" color="#22D3EE" />
            <HUDPill icon={<Coins className="w-3.5 h-3.5" />} value={`${stats.coins}`} label="Coins" color="#34D399" />
            <HUDPill icon={<Award className="w-3.5 h-3.5" />} value={`${earnedAchievements.length}`} label="Feats" color="#A78BFA" />
          </div>
        </div>
      </motion.div>

      {/* ╔═══════════════════════════════════════════════╗
             MAIN CONTENT AREA
         ╚═══════════════════════════════════════════════╝ */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 sm:py-6 space-y-5 sm:space-y-6" style={{ background: palette.bg }}>

      {/* ── ROW 1: Player Stats ── */}
      <motion.div 
        initial="hidden" 
        animate="visible" 
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
      >
        <motion.div variants={cardVariant(0)}>
          <PlayerStatCard
            title="Total XP"
            icon={Zap}
            value={stats.totalXP.toLocaleString()}
            sub={`Level ${stats.level} • ${xpProgress.percent}% to next`}
            progress={xpProgress.percent}
            iconColor="#7C6AFA"
            glowColor="rgba(124,106,250,0.15)"
          />
        </motion.div>

        <motion.div variants={cardVariant(1)}>
          <PlayerStatCard
            title="Study Streak"
            icon={Flame}
            value={`${streakStats.currentStreak} days`}
            sub={`Best: ${streakStats.longestStreak}`}
            streak={streakStats.currentStreak}
            iconColor="#FBBF24"
            glowColor="rgba(251,191,36,0.12)"
          />
        </motion.div>

        <motion.div variants={cardVariant(2)}>
          <PlayerStatCard
            title="Coins Earned"
            icon={Coins}
            value={stats.coins.toLocaleString()}
            sub="Spend in store"
            iconColor="#34D399"
            glowColor="rgba(52,211,153,0.12)"
          />
        </motion.div>

        <motion.div variants={cardVariant(3)}>
          <Card
            className="rounded-2xl border-0 overflow-hidden group hover:scale-[1.02] transition-all duration-300"
            style={{ background: palette.card, boxShadow: `0 0 0 1px ${palette.border}` }}
          >
            <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #22D3EE, #7C6AFA)' }} />
            <CardHeader className="flex flex-row justify-between items-center pb-2 pt-4">
              <CardTitle className="text-xs sm:text-sm font-medium" style={{ color: palette.text2 }}>
                Session Timer
              </CardTitle>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ background: palette.secondarySoft }}>
                <Clock className="w-4 h-4" style={{ color: palette.secondary }} />
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="text-2xl sm:text-3xl font-bold font-mono tracking-wider"
                style={{ color: palette.text }}
              >
                {formatTime(elapsedTime)}
              </div>
              <p className="text-[10px] sm:text-xs mt-1" style={{ color: palette.text2 }}>Today's play time</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ── AI THERAPIST WIDGET ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <AITherapistWidget />
      </motion.div>

      {/* ── ROW 2: Active Quests + Daily Challenges ── */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Active Quests */}
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3 }}
        >
          <Card
            className="rounded-2xl border-0 overflow-hidden h-full"
            style={{ background: palette.card, boxShadow: `0 0 0 1px ${palette.border}` }}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2" style={{ color: palette.text }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: palette.accentSoft }}>
                  <Swords className="w-4 h-4" style={{ color: palette.accent }} />
                </div>
                Active Quests
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full ml-auto" style={{ background: palette.accentSoft, color: palette.accent }}>
                  {quests.filter(q => q.status === 'in_progress').length} In Progress
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quests
                .filter(q => q.status !== 'locked' && q.status !== 'completed')
                .slice(0, 3)
                .map((quest, i) => (
                  <QuestCard 
                    key={quest.id} 
                    quest={quest} 
                    index={i} 
                    onStart={() => router.push('/student/courses')}
                  />
                ))}
              <Link href="/student/courses">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    className="w-full mt-2 rounded-xl shadow-lg transition-all duration-200 border-0 font-medium"
                    style={{ background: palette.gradient1, color: '#fff' }}
                  >
                    View All Quests <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </motion.div>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily Challenges */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.35 }}
        >
          <Card
            className="rounded-2xl border-0 overflow-hidden h-full"
            style={{ background: palette.card, boxShadow: `0 0 0 1px ${palette.border}` }}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2" style={{ color: palette.text }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(251, 191, 36, 0.15)' }}>
                  <Sparkles className="w-4 h-4 text-[#FBBF24]" />
                </div>
                Nova AI Daily Mission
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingTasks.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-xl transition-all duration-300 border-2"
                  style={{
                    background: 'linear-gradient(135deg, rgba(124,106,250,0.1), rgba(34,211,238,0.1))',
                    borderColor: 'rgba(124,106,250,0.2)',
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Target Acquired</span>
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-[#7C6AFA]" />
                      <span className="text-[10px] font-bold text-[#7C6AFA]">+50 XP</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-base text-white mb-1">{upcomingTasks[0].title}</h3>
                  <p className="text-[11px] text-white/50 mb-5 line-clamp-2 leading-relaxed">
                    Primary Objective: Master this {upcomingTasks[0].type} module to stay on track with your {user?.onboardingData?.primaryGoal || 'learning goal'}.
                  </p>
                  
                  <Link href={`/student/daily-task?taskId=${upcomingTasks[0].taskId}`}>
                    <Button 
                      className="w-full h-10 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20"
                      style={{ background: palette.gradient1, color: '#fff' }}
                    >
                      Commence Trial
                    </Button>
                  </Link>
                </motion.div>
              ) : (
                <div className="text-center py-8 px-4 border-2 border-dashed border-white/5 rounded-2xl">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-6 h-6 text-white/10" />
                  </div>
                  <p className="text-sm font-bold text-white/20 mb-1 uppercase tracking-widest">No Active Objective</p>
                  <p className="text-[10px] text-white/10 mb-6 font-medium">Consult the library or calendar to forge a new path.</p>
                  <Link href="/student/calendar">
                    <Button variant="outline" className="text-[9px] font-black uppercase tracking-widest h-9 px-6 rounded-xl border-white/10 hover:bg-white/5 text-white/40">
                      Sync New Goal
                    </Button>
                  </Link>
                </div>
              )}
              
              <div className="pt-3 border-t border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Mastery Level</p>
                  <span className="text-[10px] font-black text-[#FBBF24]">{user?.onboardingData?.skillLevel || 'Aspirant'}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-white/40 bg-white/5 p-2.5 rounded-xl border border-white/5">
                  <Trophy size={12} className="text-yellow-500/50" />
                  <span>Reach your best streak of {streakStats.longestStreak + 1}!</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── ROW 3: Charts ── */}
      <div className="grid lg:grid-cols-2 gap-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <ChartCard
            title="Goal Performance (Actual vs Target)"
            icon={Target}
            type="area"
            data={studyTimeData.map((d: any) => ({ ...d, target: goalHours }))}
            xKey="day"
            yKeys={["hours", "target"]}
            colors={[palette.accent, "#FBBF24"]}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <ChartCard
            title="XP Growth Trend"
            icon={Zap}
            type="line"
            data={xpGrowthData}
            xKey="day"
            yKey="xp"
          />
        </motion.div>
      </div>

      {/* ── ROW 4: Courses + Leaderboard + Achievements ── */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Continue Quests (Courses) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <CoursesSection courses={courses} />
        </motion.div>

        {/* Leaderboard */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
          <Leaderboard />
        </motion.div>

        {/* Achievements */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <AchievementsShowcase achievements={achievements} />
        </motion.div>
      </div>
      </div>
    </div>
  );
};

export default Dashboard;

/* ──────────────────────────────────────────────────── */
/* ── HUD PILL ── */
function HUDPill({ icon, value, label, color }: { icon: React.ReactNode; value: string; label: string; color: string }) {
  return (
    <motion.div
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
      style={{ background: `${color}18` }}
      whileHover={{ scale: 1.05, boxShadow: `0 0 15px ${color}25` }}
    >
      <div style={{ color }}>{icon}</div>
      <span className="text-sm font-bold" style={{ color }}>{value}</span>
      <span className="text-[8px] uppercase" style={{ color: palette.text2 }}>{label}</span>
    </motion.div>
  );
}

/* ── PLAYER STAT CARD ── */
const PlayerStatCard = ({ title, icon: Icon, value, sub, progress, streak, iconColor, glowColor }: any) => (
  <Card
    className="rounded-2xl p-3 sm:p-4 transition-all duration-300 border-0 overflow-hidden group hover:scale-[1.02]"
    style={{
      background: palette.card,
      boxShadow: `0 0 0 1px ${palette.border}`,
    }}
  >
    <div className="h-0.5 w-full -mx-4 -mt-4 mb-3 sm:mb-4" style={{ background: `linear-gradient(90deg, ${iconColor}44, ${iconColor})` }} />
    <CardHeader className="flex flex-row justify-between items-center p-0 pb-2 sm:pb-3">
      <CardTitle className="text-[10px] sm:text-sm font-medium" style={{ color: palette.text2 }}>
        {title}
      </CardTitle>
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
        style={{ background: glowColor || palette.accentSoft }}
      >
        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: iconColor || palette.accent }} />
      </div>
    </CardHeader>

    <CardContent className="p-0">
      <p className="text-xl sm:text-3xl font-bold" style={{ color: palette.text }}>
        {value}
      </p>
      <p className="text-[10px] sm:text-xs mt-1" style={{ color: palette.text2 }}>
        {sub}
      </p>

      {progress !== undefined && (
        <div className="mt-2 sm:mt-3">
          <Progress
            value={progress}
            className="h-1.5 rounded-full"
            style={{ background: palette.progressTrack }}
          />
        </div>
      )}

      {streak !== undefined && (
        <div className="flex gap-0.5 sm:gap-1 mt-2 sm:mt-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.5 + i * 0.05 }}
              className="flex-1 h-1.5 sm:h-2 rounded-full"
              style={{
                background: i < (streak || 0)
                  ? `linear-gradient(180deg, #FBBF24, #F59E0B)`
                  : palette.progressTrack,
              }}
            />
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

/* ── CHART CARD ── */
const ChartCard = ({ title, icon: Icon, type, data, xKey, yKey, yKeys, colors }: any) => {
  const keys = yKeys || [yKey];
  const itemColors = colors || [palette.accent, palette.secondary, "#FBBF24"];

  return (
  <Card
    className="rounded-2xl border-0 overflow-hidden"
    style={{
      background: palette.card,
      boxShadow: `0 0 0 1px ${palette.border}`,
    }}
  >
    <CardHeader className="pb-2">
      <CardTitle
        className="flex items-center gap-2 text-base font-semibold"
        style={{ color: palette.text }}
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: palette.accentSoft }}>
          <Icon className="w-4 h-4" style={{ color: palette.accent }} />
        </div>
        {title}
      </CardTitle>
    </CardHeader>

    <CardContent>
      <ResponsiveContainer width="100%" height={260}>
        {type === "area" ? (
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              {keys.map((k: string, i: number) => (
                <linearGradient key={k} id={`areaGradient-${k}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={itemColors[i]} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={itemColors[i]} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke={palette.chartGrid} strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey={xKey} 
              stroke={palette.textMuted} 
              tick={{ fontSize: 11 }} 
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis 
              stroke={palette.textMuted} 
              tick={{ fontSize: 11 }} 
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "#0F111A",
                border: `1px solid ${palette.border}`,
                color: palette.text,
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              }}
              itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
            />
            <Legend 
              verticalAlign="top" 
              align="right" 
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}
            />
            {keys.map((k: string, i: number) => (
              <Area
                key={k}
                type="monotone"
                dataKey={k}
                stroke={itemColors[i]}
                fill={`url(#areaGradient-${k})`}
                strokeWidth={3}
                name={k === "hours" ? "Hours Plays" : k === "target" ? "Goal Target" : "Daily XP"}
                animationDuration={1500}
              />
            ))}
          </AreaChart>
        ) : (
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid stroke={palette.chartGrid} strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey={xKey} 
              stroke={palette.textMuted} 
              tick={{ fontSize: 11 }} 
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis 
              stroke={palette.textMuted} 
              tick={{ fontSize: 11 }} 
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "#0F111A",
                border: `1px solid ${palette.border}`,
                color: palette.text,
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              }}
              itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
            />
            <Legend 
              verticalAlign="top" 
              align="right" 
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}
            />
            <Line
              type="monotone"
              dataKey={yKey}
              stroke={palette.accent}
              strokeWidth={4}
              dot={{ fill: palette.accent, r: 4, stroke: "#0F111A", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: palette.secondary, stroke: "#0F111A", strokeWidth: 2 }}
              name="Mastery Trend"
              animationDuration={2000}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </CardContent>
  </Card>
)};

/* ── COURSES SECTION (Quest Style) ── */
const CoursesSection = ({ courses }: any) => (
  <Card
    className="rounded-2xl border-0 overflow-hidden h-full"
    style={{
      background: palette.card,
      boxShadow: `0 0 0 1px ${palette.border}`,
    }}
  >
    <CardHeader>
      <CardTitle className="text-base font-bold flex items-center gap-2" style={{ color: palette.text }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: palette.secondarySoft }}>
          <BookOpen className="w-4 h-4" style={{ color: palette.secondary }} />
        </div>
        Quest Progress
      </CardTitle>
    </CardHeader>

    <CardContent className="space-y-3">
      {courses?.length > 0 ? (
        courses.slice(0, 3).map((course: any, i: number) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="p-3 rounded-xl transition-all duration-200 hover:scale-[1.01]"
            style={{
              background: palette.bgSecondary,
              border: `1px solid ${course.progress === 100 ? 'rgba(52, 211, 153, 0.3)' : palette.border}`,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Swords className="w-4 h-4" style={{ color: palette.accent }} />
              <p className="font-medium text-sm flex-1" style={{ color: palette.text }}>
                {course.title}
              </p>
              {course.progress === 100 && (
                <div className="flex items-center gap-1 bg-green-500/10 px-1.5 py-0.5 rounded-full border border-green-500/20">
                  <ShieldCheck className="w-3 h-3 text-green-400" />
                  <span className="text-[8px] font-bold text-green-400 uppercase tracking-tighter">Complete</span>
                </div>
              )}
            </div>

            <Progress
              value={course.progress}
              className="h-1.5 rounded-full"
              style={{ background: palette.progressTrack }}
            />

            <div className="flex justify-between items-center mt-1.5">
              <p className="text-[10px]" style={{ color: palette.text2 }}>
                {course.progress}% cleared
              </p>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-[#7C6AFA]" />
                <span className="text-[9px] font-bold text-[#7C6AFA]">+500 XP</span>
              </div>
            </div>
          </motion.div>
        ))
      ) : (
        <p className="text-sm" style={{ color: palette.text2 }}>
          No active quests. Start a new adventure!
        </p>
      )}

      <Link href="/student/courses">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            className="w-full mt-2 rounded-xl shadow-lg transition-all duration-200 border-0 font-medium"
            style={{ background: palette.gradient1, color: '#fff' }}
          >
            Browse Quests <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </motion.div>
      </Link>
    </CardContent>
  </Card>
);

/* ── ACHIEVEMENTS SHOWCASE ── */
const AchievementsShowcase = ({ achievements }: { achievements: any[] }) => {
  const earned = achievements.filter(a => a.unlockedAt);
  const locked = achievements.filter(a => !a.unlockedAt);

  return (
    <Card
      className="rounded-2xl border-0 overflow-hidden h-full"
      style={{
        background: palette.card,
        boxShadow: `0 0 0 1px ${palette.border}`,
      }}
    >
      <CardHeader>
        <CardTitle className="text-base font-bold flex items-center gap-2" style={{ color: palette.text }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(168, 85, 247, 0.15)' }}>
            <Star className="w-4 h-4 text-[#A855F7]" />
          </div>
          Achievements
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full ml-auto" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#A855F7' }}>
            {earned.length}/{achievements.length}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        {/* Earned */}
        {earned.slice(0, 3).map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="flex items-center gap-3 p-2.5 rounded-xl"
            style={{ background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.2)' }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(168, 85, 247, 0.2)' }}>
              <Award className="w-4 h-4 text-[#A855F7]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: palette.text }}>{a.name}</p>
              <p className="text-[10px] truncate" style={{ color: palette.text2 }}>{a.description}</p>
            </div>
            <Zap className="w-3 h-3 text-[#7C6AFA] flex-shrink-0" />
          </motion.div>
        ))}

        {/* Locked preview */}
        {locked.slice(0, 2).map((a, i) => (
          <div
            key={a.id}
            className="flex items-center gap-3 p-2.5 rounded-xl opacity-40"
            style={{ background: palette.bgSecondary, border: `1px solid ${palette.border}` }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: palette.progressTrack }}>
              <span className="text-xs">🔒</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: palette.text2 }}>{a.name}</p>
              <p className="text-[10px] truncate" style={{ color: palette.textMuted }}>{a.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
