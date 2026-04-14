"use client";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ReactNode, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

import { cn } from '@/lib/utils';
import { useGameStore } from '@/game/useGameStore';
import { getRankForLevel, getXPProgress } from '@/game/gameConfig';
import GameAvatar from '@/components/game/AvatarSystem';
import PlayerHUD from '@/components/game/PlayerHUD';
import ParticleField from '@/components/game/ParticleField';
import XPPopup from '@/components/game/XPPopup';
import LevelUpModal from '@/components/game/LevelUpModal';
import AchievementToast from '@/components/game/AchievementToast';
import {
  Home,
  Calendar,
  BookOpen,
  FileQuestion,
  Trophy,
  Settings,
  History,
  Bot,
  Store as StoreIcon,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Award,
  Swords,
  Shield,
  Scroll,
  MessageSquare,
  FileText,
  Gamepad2,
  Zap,
  Flame,
  Coins,
  BarChart2,
  Timer,
  BookMarked,
} from 'lucide-react';

import { palette } from '../theme/palette';
import Footer from './Footer';
import NotificationBell from './NotificationBell';


interface StudentLayoutProps {
  children: ReactNode;
}

const StudentLayout = ({ children }: StudentLayoutProps) => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false); // mobile drawer open
  const [collapsed, setCollapsed] = useState(false); // desktop collapsed

  /* Game state */
  const stats = useGameStore(s => s.stats);
  const syncStats = useGameStore(s => s.syncStats);
  const avatarSkin = useGameStore(s => s.avatarSkin);
  const xpProgress = getXPProgress(stats.totalXP);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers: any = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        
        const res = await axios.get("/api/auth/profile", { headers, withCredentials: true });
        const data = res.data;
        
        syncStats({
          totalXP: data.xp || 0,
          level: data.level || 1,
          coins: data.coins || 0,
          streak: data.streak || 0,
          longestStreak: data.personalBestStreak || 0,
        });
      } catch (err) {
        console.warn("Failed to sync stats in layout");
      }
    };
    fetchStats();
  }, [syncStats]);

  const navigation = [
    { name: 'Dashboard', href: '/student', icon: Home, glow: true },
    { name: 'Calendar', href: '/student/calendar', icon: Calendar },
    { name: 'Quest Board', href: '/student/courses', icon: Swords },
    { name: 'Assignments', href: '/student/assignments', icon: FileQuestion },
    { name: 'Battle Arena', href: '/student/quizzes', icon: Shield },
    { name: 'Global Arena', href: '/student/arena', icon: Trophy },
    { name: 'Scroll Vault', href: '/student/flashcards', icon: BookMarked },
    { name: 'Certificates', href: '/student/certificates', icon: Award },
    { name: 'My Progress', href: '/student/learning', icon: Scroll },
    { name: 'Study Notes', href: '/student/notion', icon: FileText },
    { name: 'Guild Hall', href: '/student/forum', icon: MessageSquare },
    { name: 'AI Companion', href: '/student/chatbot', icon: Bot },
    { name: 'Item Shop', href: '/student/store', icon: StoreIcon },
    { name: 'Histories', href: '/student/hist', icon: History },
    { name: 'Analytics Hub', href: '/student/analytics', icon: BarChart2 },
    { name: 'Focus Mode', href: '/student/focusmode', icon: Timer },
    { name: 'Settings', href: '/student/settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/student') return pathname === path;
    return pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen relative" style={{ background: '#FFFFFF' }}>
      
      {/* Game Overlays */}
      <ParticleField />
      <XPPopup />
      <LevelUpModal />
      <AchievementToast />

      {/* MOBILE TOP BAR */}
      <div
        className="md:hidden flex items-center justify-between p-3 z-50 fixed top-0 left-0 w-full"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${palette.border}`,
        }}
      >
        <Link href="/" className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-black"
          >
            <Gamepad2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-[#1E4D3B]">
             LearnNova
          </span>
        </Link>

        {/* Mobile quick stats */}
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button onClick={() => setOpen(!open)} className="p-2 rounded-xl border border-slate-200" style={{ color: '#000000' }}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>


      {/* ═══ SIDEBAR ═══ */}
      <aside
        className={cn(
          'fixed md:static top-0 left-0 h-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] z-40 flex flex-col',
          collapsed ? 'w-[72px]' : 'w-64',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
        style={{ 
          background: '#F9FAFB',
          borderRight: `1px solid ${palette.border}`,
        }}
      >
        {/* Logo Section */}
        <div
          className={cn(
            "p-4 flex items-center",
            collapsed ? "justify-center flex-col gap-3 py-5" : "justify-between"
          )}
          style={{ borderBottom: `1px solid ${palette.border}` }}
        >
          {!collapsed ? (
            <>
              <Link href="/" className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl bg-black flex items-center justify-center flex-shrink-0"
                >
                  <Gamepad2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-[#1E4D3B] tracking-tight">
                   LEARNNOVA
                </span>
              </Link>
              <button 
                onClick={() => setCollapsed(!collapsed)} 
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all text-slate-400"
              >
                <ChevronLeft size={14} />
              </button>
            </>
          ) : (
            <>
              <Link href="/" className="flex items-center justify-center">
                <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5 text-white" />
                </div>
              </Link>
              <button 
                onClick={() => setCollapsed(!collapsed)} 
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all text-slate-400"
              >
                <ChevronRight size={14} />
              </button>
            </>
          )}
        </div>

        {/* Player Status Card */}
        {!collapsed && (
          <div className="p-4 border-b border-slate-100 bg-white shadow-sm shadow-[#1E4D3B]/5 mx-2 my-2 rounded-2xl border border-[#1E4D3B]/5">
             <div className="flex items-center gap-3">
                <GameAvatar skin={avatarSkin} level={stats.level} size={44} mood="idle" showRing={true} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-black leading-none pb-1">LEVEL {stats.level}</p>
                  <p className="text-[9px] uppercase font-black tracking-widest text-[#1E4D3B] truncate">
                    {stats.rank}
                  </p>
                </div>
             </div>

             <div className="mt-4">
                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-[#1E4D3B] mb-1">
                   <span>XP PROGRESS</span>
                   <span>{xpProgress.percent}%</span>
                </div>
                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                   <motion.div
                    className="h-full bg-[#1E4D3B] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress.percent}%` }}
                   />
                </div>
             </div>
             
             <div className="flex items-center justify-between mt-4 px-1">
                <MiniStat icon={<Flame className="w-3.5 h-3.5" />} value={stats.streak} label="Streak" />
                <MiniStat icon={<Coins className="w-3.5 h-3.5" />} value={stats.coins} label="Loot" />
                <MiniStat icon={<Trophy className="w-3.5 h-3.5" />} value={stats.questsCompleted} label="Quests" />
             </div>
          </div>
        )}

        {/* Navigation - Restoring all features */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto custom-scrollbar">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center transition-all duration-300 group relative rounded-xl',
                  collapsed ? 'justify-center p-3.5' : 'gap-3 px-3 py-2.5',
                  active ? 'bg-[#1E4D3B] text-white shadow-lg shadow-[#1E4D3B]/10' : 'bg-transparent text-slate-500 hover:bg-slate-50'
                )}
                onClick={() => setOpen(false)}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="flex-1 text-[11px] font-black uppercase tracking-wider">{item.name}</span>
                )}
                {active && !collapsed && (
                   <motion.div layoutId="activeInd" className="w-1 h-3 bg-white/30 rounded-full" />
                )}
              </Link>
          )})}
        </nav>

        {/* Sidebar Footer Padding */}
        <div className="p-4" />
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PlayerHUD />
        <main
          className="flex-1 overflow-auto pt-14 md:pt-0"
          style={{ background: '#FFFFFF' }}
        >
          <div className="relative z-10 px-4 md:px-8 py-8">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;

function MiniStat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="p-1 px-1.5 rounded-lg bg-slate-50 text-[#1E4D3B] mb-0.5 border border-[#1E4D3B]/10">{icon}</div>
      <span className="text-[10px] font-black text-black leading-none">{value}</span>
      <span className="text-[7px] font-black uppercase tracking-widest text-[#1E4D3B] opacity-50">{label}</span>
    </div>
  );
}
