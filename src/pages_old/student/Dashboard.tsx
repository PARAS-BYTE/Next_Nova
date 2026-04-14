import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  Target, Flame, BookOpen, Clock, Zap, ChevronRight, Sparkles, ShieldCheck, Swords, Trophy, Coins, Star, Award, Calendar, Gamepad2,
} from "lucide-react";

import axios from "axios";
import { useRouter } from 'next/navigation';
import { useStopwatch } from "@/components/Providers";
import { palette } from "../../theme/palette";
import { useGameStore } from "@/game/useGameStore";
import { getXPProgress, getRankForLevel, getLevelFromXP } from "@/game/gameConfig";
import GameAvatar from "@/components/game/AvatarSystem";
import QuestCard from "@/components/game/QuestCard";
import Leaderboard from "@/components/game/Leaderboard";
import AITherapistWidget from "@/components/AITherapistWidget";


const cardVariant = (i: number) => ({
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: "easeOut" },
  },
});

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { elapsedTime, formatTime } = useStopwatch();
  const router = useRouter();

  const stats = useGameStore(s => s.stats);
  const quests = useGameStore(s => s.quests);
  const avatarSkin = useGameStore(s => s.avatarSkin);
  const syncStats = useGameStore(s => s.syncStats);
  const achievements = useGameStore(s => s.achievements);

  const currentLevel = getLevelFromXP(stats.totalXP);
  const xpProgress = getXPProgress(stats.totalXP);
  const rankCfg = getRankForLevel(currentLevel);
  const earnedAchievements = achievements.filter(a => a.unlockedAt);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers: any = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await axios.get("/api/auth/dashboard", { headers, withCredentials: true });
        const data = res.data;
        setUser(data);
        syncStats({
          totalXP: data.totalXp || data.xp || 0,
          coins: data.coins || 0,
          streak: data.streak || 0,
          longestStreak: data.personalBestStreak || 0,
          questsCompleted: data.questsCompleted || 0,
        });
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [syncStats]);

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
        <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-[#1E4D3B] animate-spin" />
        <p className="text-[#1E4D3B] font-black uppercase tracking-widest text-[10px]">Synchronizing...</p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center p-8 bg-white border border-black shadow-none max-w-md">
          <p className="mb-4 text-black font-bold uppercase tracking-tight">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-black text-white rounded-none px-8 font-bold">Retry Connection</Button>
        </div>
      </div>
    );

  const studyTimeData = (user?.last7DaysStudy || []).map((item: any) => ({ day: item.day || "Mon", hours: item.hours || 0 }));
  const xpGrowthData = (user?.xpHistory || []).map((item: any) => ({ day: item.day || "Mon", xp: item.xp || 0 }));
  const courses = user?.courses || [];
  const upcomingTasks = user?.upcomingTasks || [];
  const streakStats = user?.streakStats || { currentStreak: stats.streak, longestStreak: stats.longestStreak };
  const dailyGoalMinutes = user?.onboardingData?.dailyGoalMinutes || 30;
  const goalHours = Math.round((dailyGoalMinutes / 60) * 10) / 10;

  return (
    <div className="flex flex-col space-y-8 pb-12">
      
      {/* ═══ RESTORED ORIGINAL POSITIONS ═══ */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <GameAvatar skin={avatarSkin} level={currentLevel} size={72} mood="idle" showRing={true} />
          <div className="text-left space-y-1">
            <h1 className="text-3xl font-black text-black">
              Student: <span className="text-[#1E4D3B]">{user?.name || "Member"}</span>
            </h1>
            <div className="flex items-center gap-3 pt-1">
               <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-black text-white rounded-full">
                  Rank: {rankCfg.tier}
               </span>
               <p className="text-[10px] text-black font-bold uppercase tracking-wide">
                  Live Session: <span className="text-[#1E4D3B]">{formatTime(elapsedTime)}</span>
               </p>
            </div>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-4">
           <HUDPill icon={<Flame className="w-4 h-4" />} value={`${streakStats.currentStreak}`} label="Streak" color="#1E4D3B" />
           <HUDPill icon={<Trophy className="w-4 h-4" />} value={`${stats.questsCompleted}`} label="Quests" color="#1E4D3B" />
           <HUDPill icon={<Coins className="w-4 h-4" />} value={`${stats.coins}`} label="Coins" color="#1E4D3B" />
        </div>
      </motion.div>

      {/* STATS GRID */}
      <motion.div initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-0">
        <PlayerStatCard title="Total Mastery (XP)" icon={Zap} value={stats.totalXP.toLocaleString()} sub={`Level ${currentLevel} Milestone`} progress={xpProgress.percent} iconColor="#1E4D3B" glowColor="#F0FDF4" />
        <PlayerStatCard title="Study Consistency" icon={Flame} value={`${streakStats.currentStreak} Days`} sub={`Personal Best: ${streakStats.longestStreak}`} iconColor="#000000" glowColor="#F8FAFC" />
        <PlayerStatCard title="Academics Coins" icon={Coins} value={stats.coins.toLocaleString()} sub="Redeem for equipment" iconColor="#1E4D3B" glowColor="#F0FDF4" />
        <PlayerStatCard title="Achievements" icon={Award} value={earnedAchievements.length.toString()} sub={`${achievements.length} Total Targets`} progress={(earnedAchievements.length / achievements.length) * 100} iconColor="#000000" glowColor="#F8FAFC" />
      </motion.div>

      <AITherapistWidget />

      {/* ORIGINAL TWO-COLUMN LAYOUT RESTORED */}
      <div className="grid lg:grid-cols-3 gap-8 px-4 md:px-0">
        <div className="lg:col-span-2 space-y-6">
           <Card className="rounded-3xl border border-slate-200 shadow-sm bg-white overflow-hidden">
             <CardHeader className="p-6 border-b border-slate-50">
               <CardTitle className="flex items-center justify-between text-lg font-black uppercase tracking-widest">
                 <div className="flex items-center gap-3">
                    <Swords size={20} className="text-black" />
                    <span>Learning Modules</span>
                 </div>
               </CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-4">
               {quests.filter(q => q.status !== 'locked' && q.status !== 'completed').slice(0, 3).map((quest, i) => (
                   <QuestCard key={quest.id} quest={quest} index={i} onStart={() => router.push('/student/courses')} />
               ))}
               <Button className="w-full h-12 bg-black text-white hover:bg-[#1E4D3B] rounded-2xl font-black uppercase tracking-widest text-xs transition-colors" onClick={() => router.push('/student/courses')}>
                  Browse Store Board
               </Button>
             </CardContent>
           </Card>

           <div className="grid md:grid-cols-2 gap-6">
              <ChartCard title="Study Metrics" icon={Target} data={studyTimeData.map((d: any) => ({ ...d, target: goalHours }))} type="area" xKey="day" yKeys={["hours", "target"]} colors={["#1E4D3B", "#000000"]} />
              <ChartCard title="Experience Curve" icon={Zap} data={xpGrowthData} type="line" xKey="day" yKey="xp" />
           </div>
        </div>

        <div className="space-y-6">
           <Card className="rounded-3xl border border-slate-200 shadow-sm bg-white overflow-hidden h-full">
              <CardHeader className="p-6 border-b border-slate-50">
                 <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-3">
                    <Sparkles className="text-[#1E4D3B]" size={20} />
                    AI Briefing
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                 {upcomingTasks.length > 0 ? (
                    <div className="p-6 rounded-3xl bg-[#1E4D3B] text-white space-y-6 shadow-xl">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-[#E2E8F0]">
                          <span>Report #042</span>
                          <span>+50 Mastery</span>
                       </div>
                       <h3 className="text-xl font-black uppercase leading-tight tracking-tight">{upcomingTasks[0].title}</h3>
                       <p className="text-xs text-slate-100/70 font-medium leading-relaxed">Directive: Master curriculum to maintain optimal performance.</p>
                       <Button className="w-full bg-white text-black hover:bg-slate-100 rounded-xl font-black text-[10px] uppercase tracking-widest h-11" onClick={() => router.push(`/student/daily-task?taskId=${upcomingTasks[0].taskId}`)}>Execute Mission</Button>
                    </div>
                 ) : (
                    <div className="py-16 text-center text-black space-y-4 opacity-30"><Calendar size={32} className="mx-auto" /><p className="text-xs font-black uppercase tracking-[0.1em]">All Missions Synchronized</p></div>
                 )}
                 <Leaderboard />
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
};

function HUDPill({ icon, value, label, color }: any) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 border border-slate-100 bg-white rounded-2xl shadow-sm">
      <div className="text-black">{icon}</div>
      <div className="flex flex-col">
         <span className="text-sm font-black leading-none text-black">{value}</span>
         <span className="text-[9px] font-black uppercase tracking-widest text-[#1E4D3B]">{label}</span>
      </div>
    </div>
  );
}

const PlayerStatCard = ({ title, icon: Icon, value, sub, progress, iconColor, glowColor }: any) => (
  <Card className="rounded-3xl border border-slate-100 shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow">
    <div className="h-1.5 w-full" style={{ background: iconColor || '#1E4D3B' }} />
    <CardHeader className="flex flex-row justify-between items-center p-6 pb-2">
      <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</CardTitle>
      <div className="p-3 rounded-2xl bg-slate-50" style={{ background: glowColor || '#F0FDF4' }}><Icon size={18} style={{ color: iconColor || '#1E4D3B' }} /></div>
    </CardHeader>
    <CardContent className="p-6 pt-0">
      <h3 className="text-3xl font-black text-black tracking-tight">{value}</h3>
      <p className="text-[10px] font-bold text-[#1E4D3B] mt-2 uppercase tracking-wide">{sub}</p>
      {progress !== undefined && <Progress value={progress} className="h-1.5 mt-6 rounded-full" />}
    </CardContent>
  </Card>
);

const ChartCard = ({ title, icon: Icon, type, data, xKey, yKey, yKeys, colors }: any) => {
  const keys = yKeys || [yKey];
  const itemColors = colors || ["#1E4D3B", "#000000"];
  return (
  <Card className="rounded-3xl border border-slate-100 shadow-sm overflow-hidden bg-white">
    <CardHeader className="p-6 border-b border-slate-50">
      <CardTitle className="flex items-center gap-3 text-xs font-black text-black uppercase tracking-widest">
        <Icon size={18} className="text-[#1E4D3B]" /> {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="p-6">
      <ResponsiveContainer width="100%" height={200}>
        {type === "area" ? (
          <AreaChart data={data}><CartesianGrid stroke="#f8fafc" vertical={false} /><XAxis dataKey={xKey} hide /><YAxis hide /><Tooltip />
            {keys.map((k, i) => <Area key={k} type="monotone" dataKey={k} stroke={itemColors[i]} fill={itemColors[i]} fillOpacity={0.05} strokeWidth={3} />)}
          </AreaChart>
        ) : (
          <LineChart data={data}><CartesianGrid stroke="#f8fafc" vertical={false} /><XAxis dataKey={xKey} hide /><YAxis hide /><Tooltip /><Line type="monotone" dataKey={yKey} stroke="#000000" strokeWidth={4} dot={false} /></LineChart>
        )}
      </ResponsiveContainer>
    </CardContent>
  </Card>
)};

export default Dashboard;
