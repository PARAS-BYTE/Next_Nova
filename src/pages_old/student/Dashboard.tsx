"use client";
import Link from 'next/link';
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Flame,
  BookOpen,
  Clock,
  Zap,
  ChevronRight,
  Trophy,
  Swords,
  Star,
  Shield,
  TrendingUp,
  Calendar,
  Bot,
  Map,
  CheckCircle2,
  Circle,
} from "lucide-react";
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import { useStopwatch } from "@/components/Providers";
import { palette, rankColors } from "../../theme/palette";
import { triggerXP } from "@/components/XPPopup";

const getRankIcon = (rank: string) => {
  const icons: Record<string, string> = { Bronze: '🥉', Silver: '🥈', Gold: '🥇', Platinum: '💎', Diamond: '⚡' };
  return icons[rank] || '🎖️';
};

const DAILY_QUESTS = [
  { id: 1, title: "Complete 1 lesson", xp: 50, icon: BookOpen, color: '#06B6D4', done: false },
  { id: 2, title: "Answer a quiz", xp: 100, icon: Zap, color: '#7C3AED', done: false },
  { id: 3, title: "Log in today", xp: 20, icon: CheckCircle2, color: '#10B981', done: true },
  { id: 4, title: "Visit the Arena", xp: 75, icon: Swords, color: '#EF4444', done: false },
];

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quests, setQuests] = useState(DAILY_QUESTS);
  const { elapsedTime, formatTime } = useStopwatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers: any = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await axios.get("/api/auth/dashboard", { headers, withCredentials: true });
        setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleQuestClaim = (questId: number, xpAmount: number) => {
    setQuests((prev) => prev.map((q) => q.id === questId ? { ...q, done: true } : q));
    triggerXP(xpAmount, "Quest Complete!");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center game-bg">
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="w-16 h-16 rounded-2xl btn-game flex items-center justify-center animate-pulse-glow">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <p className="font-mono text-sm" style={{ color: palette.cyan }}>Initializing Command Hub...</p>
      </motion.div>
    </div>
  );

  const studyTimeData = (user?.last7DaysStudy || [
    { day: 'Mon', hours: 1.2 }, { day: 'Tue', hours: 2.4 }, { day: 'Wed', hours: 1.8 },
    { day: 'Thu', hours: 3.1 }, { day: 'Fri', hours: 2.2 }, { day: 'Sat', hours: 0.8 }, { day: 'Sun', hours: 2.0 },
  ]).map((item: any) => ({ day: item.day || 'Mon', hours: item.hours || 0 }));

  const xpGrowthData = (user?.xpHistory || [
    { day: 'Mon', xp: 120 }, { day: 'Tue', xp: 340 }, { day: 'Wed', xp: 290 },
    { day: 'Thu', xp: 510 }, { day: 'Fri', xp: 440 }, { day: 'Sat', xp: 180 }, { day: 'Sun', xp: 390 },
  ]).map((item: any) => ({ day: item.day || 'Mon', xp: item.xp || 0 }));

  const courses = user?.courses || [];
  const upcomingTasks = user?.upcomingTasks || [];
  const stats = user?.statistics || {};
  const streakStats = user?.streakStats || { currentStreak: 7, longestStreak: 21 };
  const rank = user?.rank || 'Gold';
  const rankInfo = rankColors[rank] || rankColors['Gold'];
  const masteryScore = Math.round(stats?.completionRate || user?.masteryScore || 72);
  const totalXP = user?.xp || 2450;
  const level = user?.level || 12;
  const xpGoal = level * 100;
  const xpPct = Math.min(100, Math.round((totalXP / xpGoal) * 100));
  const weakTopics = user?.weakTopics || ['Neural Networks', 'Async Programming', 'Recursion'];

  return (
    <div className="min-h-screen game-bg">
      {/* ── HEADER / PLAYER HUD ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-4 flex items-center justify-between glass-dark sticky top-0 z-20"
        style={{ borderBottom: `1px solid ${palette.borderGlow}` }}
      >
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <motion.div
              animate={{ boxShadow: [`0 0 12px ${rankInfo.glow}`, `0 0 24px ${rankInfo.glow}`, `0 0 12px ${rankInfo.glow}`] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold"
              style={{
                background: `linear-gradient(135deg, ${rankInfo.color}44, ${rankInfo.color}22)`,
                border: `2px solid ${rankInfo.color}`,
              }}
            >
              {(user?.name || 'S')[0]}
            </motion.div>
            <div
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2"
              style={{ background: palette.bgCard, borderColor: palette.accent, color: '#fff' }}
            >
              {level}
            </div>
          </div>

          <div>
            <h1 className="text-lg font-bold" style={{ color: palette.text }}>
              Welcome back,{" "}
              <span className="text-gradient-purple">{user?.name || "Commander"}</span>
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="rank-badge" style={{ background: `${rankInfo.color}22`, color: rankInfo.color, border: `1px solid ${rankInfo.color}55` }}>
                {getRankIcon(rank)} {rank} Rank
              </div>
              <div className="flex items-center gap-1">
                <Flame className="w-3 h-3" style={{ color: palette.gold }} />
                <span className="text-xs font-bold" style={{ color: palette.gold }}>{streakStats.currentStreak}d</span>
              </div>
            </div>
          </div>
        </div>

        {/* XP meter */}
        <div className="hidden md:flex flex-col items-end gap-1 min-w-[180px]">
          <div className="flex items-center gap-2 w-full justify-between">
            <span className="text-xs font-mono" style={{ color: palette.text2 }}>XP to Level {level + 1}</span>
            <span className="text-xs font-mono font-bold" style={{ color: palette.accentSoft }}>{totalXP}/{xpGoal}</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: palette.progressTrack }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpPct}%` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${palette.accent}, ${palette.cyan})`, boxShadow: `0 0 10px ${palette.accentGlow}` }}
            />
          </div>
          <span className="text-[10px]" style={{ color: palette.text2 }}>{xpPct}% to next level</span>
        </div>
      </motion.div>

      <div className="px-4 md:px-6 py-6 space-y-6">

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Zap} label="Total XP" value={totalXP.toLocaleString()} sub={`+${user?.weeklyXP || 340} this week`} color={palette.accent} glow={palette.accentGlow} progress={xpPct} />
          <StatCard icon={Flame} label="Streak" value={`${streakStats.currentStreak}d`} sub={`Best: ${streakStats.longestStreak}d`} color={palette.gold} glow={palette.goldGlow} streak={streakStats.currentStreak} />
          <StatCard icon={Target} label="Mastery" value={`${masteryScore}%`} sub={`Tasks done: ${stats.totalTasksCompleted || 14}`} color={palette.green} glow={palette.greenGlow} progress={masteryScore} />
          <StatCard icon={Clock} label="Session Time" value={formatTime(elapsedTime)} sub="Today's active time" color={palette.cyan} glow={palette.cyanGlow} />
        </div>

        {/* ── QUICK ACTIONS ── */}
        <div>
          <SectionTitle icon={Trophy} label="Quick Actions" color={palette.gold} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            {[
              { label: 'Enter Arena', href: '/student/arena', icon: Swords, color: '#EF4444', glow: 'rgba(239,68,68,0.4)' },
              { label: 'Start Quiz', href: '/student/quizzes', icon: Zap, color: '#7C3AED', glow: 'rgba(124,58,237,0.4)' },
              { label: 'Browse Courses', href: '/student/courses', icon: BookOpen, color: '#06B6D4', glow: 'rgba(6,182,212,0.4)' },
              { label: 'AI Oracle', href: '/student/chatbot', icon: Bot, color: '#10B981', glow: 'rgba(16,185,129,0.4)' },
            ].map((action) => (
              <Link key={action.label} href={action.href}>
                <motion.div
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 rounded-xl flex flex-col items-center gap-2 cursor-pointer transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${action.color}15, ${action.color}08)`,
                    border: `1px solid ${action.color}35`,
                    boxShadow: `0 4px 20px ${action.glow}20`,
                  }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${action.color}22` }}>
                    <action.icon className="w-5 h-5" style={{ color: action.color }} />
                  </div>
                  <span className="text-xs font-semibold text-center" style={{ color: palette.text }}>{action.label}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── DAILY QUESTS ── */}
        <div>
          <SectionTitle icon={Map} label="Daily Quests" color={palette.cyan} badge="DAILY" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            {quests.map((quest, i) => (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{
                  background: quest.done ? `${quest.color}0A` : palette.bgCard,
                  border: `1px solid ${quest.done ? quest.color + '33' : palette.border}`,
                }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${quest.color}20` }}>
                  <quest.icon className="w-4 h-4" style={{ color: quest.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: quest.done ? palette.text2 : palette.text, textDecoration: quest.done ? 'line-through' : 'none' }}>
                    {quest.title}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Zap className="w-3 h-3" style={{ color: palette.gold }} />
                    <span className="text-[11px] font-bold" style={{ color: palette.gold }}>+{quest.xp} XP</span>
                  </div>
                </div>
                {quest.done ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: palette.green }} />
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleQuestClaim(quest.id, quest.xp)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg flex-shrink-0"
                    style={{ background: `${quest.color}22`, color: quest.color, border: `1px solid ${quest.color}44` }}
                  >
                    Claim
                  </motion.button>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── CHARTS ── */}
        <div className="grid lg:grid-cols-2 gap-4">
          <ChartCard title="Study Hours" icon={Clock} type="area" data={studyTimeData} xKey="day" yKey="hours" color={palette.cyan} glow={palette.cyanGlow} />
          <ChartCard title="XP Growth" icon={Zap} type="line" data={xpGrowthData} xKey="day" yKey="xp" color={palette.accent} glow={palette.accentGlow} />
        </div>

        {/* ── BOTTOM SECTION ── */}
        <div className="grid lg:grid-cols-3 gap-4">
          <QuestSection upcomingTasks={upcomingTasks} />
          <CoursesSection courses={courses} />
          <FocusSection weakTopics={weakTopics} />
        </div>

      </div>
    </div>
  );
}

/* ── STAT CARD ── */
function StatCard({ icon: Icon, label, value, sub, color, glow, progress, streak }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -3 }}
      className="p-4 rounded-xl relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${color}12, ${color}05)`,
        border: `1px solid ${color}30`,
        boxShadow: `0 4px 20px ${glow}18`,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: palette.text2 }}>{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold" style={{ color: palette.text }}>{value}</p>
      <p className="text-xs mt-1" style={{ color: palette.text2 }}>{sub}</p>
      {progress !== undefined && (
        <div className="w-full h-1 rounded-full mt-3 overflow-hidden" style={{ background: palette.progressTrack }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${color}, ${color}88)`, boxShadow: `0 0 6px ${glow}` }}
          />
        </div>
      )}
      {streak !== undefined && (
        <div className="flex gap-1 mt-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: i * 0.08 }}
              className="flex-1 h-2 rounded-full"
              style={{ background: i < streak ? color : palette.progressTrack, boxShadow: i < streak ? `0 0 4px ${glow}` : 'none' }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ── CHART CARD ── */
function ChartCard({ title, icon: Icon, type, data, xKey, yKey, color, glow }: any) {
  const fill = color + '22';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-xl"
      style={{ background: palette.bgCard, border: `1px solid ${palette.border}` }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <h3 className="font-semibold text-sm" style={{ color: palette.text }}>{title}</h3>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        {type === "area" ? (
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`grad-${yKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={palette.chartGrid} strokeDasharray="3 3" />
            <XAxis dataKey={xKey} stroke={palette.textMuted} tick={{ fontSize: 10 }} />
            <YAxis stroke={palette.textMuted} tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ background: palette.bgCard, border: `1px solid ${palette.borderGlow}`, color: palette.text, borderRadius: 8 }} />
            <Area type="monotone" dataKey={yKey} stroke={color} fill={`url(#grad-${yKey})`} strokeWidth={2} />
          </AreaChart>
        ) : (
          <LineChart data={data}>
            <CartesianGrid stroke={palette.chartGrid} strokeDasharray="3 3" />
            <XAxis dataKey={xKey} stroke={palette.textMuted} tick={{ fontSize: 10 }} />
            <YAxis stroke={palette.textMuted} tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ background: palette.bgCard, border: `1px solid ${palette.borderGlow}`, color: palette.text, borderRadius: 8 }} />
            <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2.5} dot={{ fill: color, r: 3, strokeWidth: 0 }} activeDot={{ r: 5, boxShadow: `0 0 8px ${glow}` }} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </motion.div>
  );
}

/* ── QUEST SECTION ── */
function QuestSection({ upcomingTasks }: any) {
  const mockTasks = [
    { title: 'Complete ML Assignment 4', dueDate: '2025-11-15', priority: 'high' },
    { title: 'Review React Hooks', dueDate: '2025-11-12', priority: 'medium' },
    { title: 'DSA Problem Set', dueDate: '2025-11-18', priority: 'low' },
  ];
  const tasks = upcomingTasks?.length > 0 ? upcomingTasks : mockTasks;
  const priorityColor: Record<string, string> = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' };

  return (
    <div className="p-4 rounded-xl" style={{ background: palette.bgCard, border: `1px solid ${palette.border}` }}>
      <SectionTitle icon={Target} label="Active Quests" color={palette.gold} />
      <div className="space-y-2 mt-3">
        {tasks.slice(0, 3).map((task: any, i: number) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-2 p-2.5 rounded-lg"
            style={{ background: palette.bgCardHover, border: `1px solid ${palette.border}` }}
          >
            <div className="w-1.5 h-full rounded-full mt-1 flex-shrink-0" style={{ background: priorityColor[task.priority] || palette.accent }} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: palette.text }}>{task.title}</p>
              <p className="text-[10px] mt-0.5" style={{ color: palette.text2 }}>
                Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'TBD'}
              </p>
            </div>
          </motion.div>
        ))}
        {tasks.length === 0 && <p className="text-xs" style={{ color: palette.text2 }}>No active quests. Go complete something!</p>}
      </div>
      <Link href="/student/calendar">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 btn-game text-white"
        >
          View Quest Board <ChevronRight className="w-3 h-3" />
        </motion.button>
      </Link>
    </div>
  );
}

/* ── COURSES SECTION ── */
function CoursesSection({ courses }: any) {
  const mockCourses = [
    { title: 'Advanced Machine Learning', progress: 68 },
    { title: 'Web Dev Masterclass', progress: 45 },
    { title: 'Data Structures & Algo', progress: 82 },
  ];
  const list = courses?.length > 0 ? courses : mockCourses;

  return (
    <div className="p-4 rounded-xl" style={{ background: palette.bgCard, border: `1px solid ${palette.border}` }}>
      <SectionTitle icon={BookOpen} label="Active Missions" color={palette.cyan} />
      <div className="space-y-3 mt-3">
        {list.slice(0, 3).map((course: any, i: number) => (
          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}>
            <div className="flex justify-between mb-1">
              <p className="text-xs font-medium truncate flex-1 mr-2" style={{ color: palette.text }}>{course.title}</p>
              <span className="text-[10px] font-mono flex-shrink-0" style={{ color: palette.accentSoft }}>{course.progress}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: palette.progressTrack }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${course.progress}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: i * 0.15 }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${palette.cyan}, ${palette.accent})`, boxShadow: `0 0 6px ${palette.cyanGlow}` }}
              />
            </div>
          </motion.div>
        ))}
      </div>
      <Link href="/student/courses">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 btn-game-cyan text-white"
        >
          All Missions <ChevronRight className="w-3 h-3" />
        </motion.button>
      </Link>
    </div>
  );
}

/* ── FOCUS SECTION ── */
function FocusSection({ weakTopics }: any) {
  return (
    <div className="p-4 rounded-xl" style={{ background: palette.bgCard, border: `1px solid ${palette.border}` }}>
      <SectionTitle icon={TrendingUp} label="Weakness Intel" color={palette.red} />
      <div className="space-y-2 mt-3">
        {weakTopics?.length > 0 ? (
          weakTopics.slice(0, 4).map((topic: string, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-2 p-2 rounded-lg"
              style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                style={{ background: 'rgba(239,68,68,0.2)', color: palette.red }}
              >
                {i + 1}
              </div>
              <span className="text-xs" style={{ color: palette.text }}>{topic}</span>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-4">
            <Star className="w-8 h-8 mx-auto mb-2" style={{ color: palette.gold }} />
            <p className="text-xs" style={{ color: palette.text2 }}>No weak areas — you're crushing it!</p>
          </div>
        )}
      </div>
      {weakTopics?.length > 0 && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-3 py-2 rounded-xl text-xs font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.3), rgba(239,68,68,0.15))', border: '1px solid rgba(239,68,68,0.35)' }}
          onClick={() => triggerXP(25, "Practice Started!")}
        >
          Start Drill Session
        </motion.button>
      )}
    </div>
  );
}

/* ── SECTION TITLE ── */
function SectionTitle({ icon: Icon, label, color, badge }: any) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4" style={{ color }} />
      <h2 className="text-sm font-bold" style={{ color: palette.text }}>{label}</h2>
      {badge && (
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider"
          style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}
