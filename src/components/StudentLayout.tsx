"use client";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const avatarSkin = useGameStore(s => s.avatarSkin);
  const rankCfg = getRankForLevel(stats.level);
  const xpProgress = getXPProgress(stats.totalXP);

  const navigation = [
    { name: 'Command Center', href: '/student', icon: Gamepad2, glow: true },
    { name: 'Calendar', href: '/student/calendar', icon: Calendar },
    { name: 'Quest Board', href: '/student/courses', icon: Swords },
    { name: 'Assignments', href: '/student/assignments', icon: FileQuestion },
    { name: 'Battle Arena', href: '/student/quizzes', icon: Shield },
    { name: 'Arena', href: '/student/arena', icon: Trophy },
    { name: 'Certificates', href: '/student/certificates', icon: Award },
    { name: 'My Progress', href: '/student/learning', icon: Scroll },
    { name: 'Notes', href: '/student/notion', icon: FileText },
    { name: 'Guild Hall', href: '/student/forum', icon: MessageSquare },
    { name: 'AI Companion', href: '/student/chatbot', icon: Bot },
    { name: 'Item Shop', href: '/student/store', icon: StoreIcon },
    { name: 'History', href: '/student/hist', icon: History },
    { name: 'Analytics Hub', href: '/student/analytics', icon: BarChart2 },
    { name: 'Focus Mode', href: '/student/focusmode', icon: Timer },
    { name: 'Scroll Vault', href: '/student/flashcards', icon: BookMarked },
    { name: 'Settings', href: '/student/settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/student') return pathname === path;
    return pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen relative" style={{ background: palette.bg }}>
      {/* ── Particle Background ── */}
      <ParticleField />

      {/* ── Game Overlay System ── */}
      <XPPopup />
      <LevelUpModal />
      <AchievementToast />

      {/* MOBILE TOP BAR (FIXED) */}
      <div
        className="md:hidden flex items-center justify-between p-3 z-50 fixed top-0 left-0 w-full"
        style={{
          background: 'rgba(11, 13, 23, 0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${palette.border}`,
        }}
      >
        <Link href="/" className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: palette.gradient1 }}
          >
            <Gamepad2 className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold shimmer-text">
            LearnNova
          </span>
        </Link>

        {/* Mobile quick stats */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: palette.accentSoft }}>
            <Zap className="w-3 h-3 text-[#7C6AFA]" />
            <span className="text-[10px] font-bold text-[#7C6AFA]">{stats.totalXP}</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: 'rgba(251, 191, 36, 0.15)' }}>
            <Flame className="w-3 h-3 text-[#FBBF24]" />
            <span className="text-[10px] font-bold text-[#FBBF24]">{stats.streak}</span>
          </div>
          <NotificationBell />
          <button onClick={() => setOpen(!open)} className="p-2 rounded-xl transition-colors" style={{ color: palette.text }}>
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
          background: 'rgba(11, 13, 23, 0.95)',
          backdropFilter: 'blur(20px)',
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
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: palette.gradient1 }}
                >
                  <Gamepad2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold shimmer-text">
                  LearnNova
                </span>
              </Link>

              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-1.5 rounded-lg transition-all duration-200 hover:scale-110"
                style={{ color: palette.text2 }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link href="/" className="flex items-center justify-center">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: palette.gradient1 }}
                >
                  <Gamepad2 className="w-5 h-5 text-white" />
                </div>
              </Link>

              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-1.5 rounded-lg transition-all duration-200 hover:scale-110"
                style={{ color: palette.text2 }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Player Card (expanded only) */}
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3"
            style={{ borderBottom: `1px solid ${palette.border}` }}
          >
            <div className="rounded-xl p-3" style={{ background: palette.bgSecondary }}>
              <div className="flex items-center gap-3">
                <GameAvatar skin={avatarSkin} level={stats.level} size={40} mood="idle" showRing={true} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate" style={{ color: palette.text }}>
                    Level {stats.level}
                  </p>
                  <p className="text-[9px] font-medium" style={{ color: rankCfg.color }}>
                    {stats.rank} · {stats.title}
                  </p>
                </div>
              </div>

              {/* XP Mini Bar */}
              <div className="mt-2">
                <div className="flex justify-between mb-0.5">
                  <span className="text-[8px]" style={{ color: palette.text2 }}>XP</span>
                  <span className="text-[8px] font-mono" style={{ color: palette.accent }}>
                    {xpProgress.current}/{xpProgress.required}
                  </span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: palette.progressTrack }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: palette.gradient1 }}
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress.percent}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>

              {/* Quick Stats Row */}
              <div className="flex items-center justify-between mt-2">
                <MiniStat icon={<Flame className="w-3 h-3" />} value={stats.streak} color="#FBBF24" />
                <MiniStat icon={<Coins className="w-3 h-3" />} value={stats.coins} color="#34D399" />
                <MiniStat icon={<Trophy className="w-3 h-3" />} value={stats.questsCompleted} color="#22D3EE" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center transition-all duration-300 group relative rounded-xl',
                collapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5',
              )}
              style={{
                color: active ? palette.text : palette.text2,
                background: active ? palette.accentSoft : 'transparent',
                boxShadow: active ? `inset 3px 0 0 ${palette.accent}, 0 0 15px ${palette.accent}15` : 'none',
              }}
              onClick={() => setOpen(false)}
            >
              <motion.div
                whileHover={{ scale: 1.15, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" style={{ color: active ? palette.accent : palette.text2 }} />
              </motion.div>
              {!collapsed && (
                <span className={cn("flex-1 text-sm", active && "font-medium")}>{item.name}</span>
              )}

              {/* Active indicator dot for collapsed */}
              {collapsed && active && (
                <div className="absolute -right-0.5 w-1.5 h-1.5 rounded-full" style={{ background: palette.accent }} />
              )}

              {collapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none"
                  style={{ background: palette.card, color: palette.text, border: `1px solid ${palette.border}`, boxShadow: `0 4px 20px rgba(0,0,0,0.3)` }}
                >
                  {item.name}
                </div>
              )}
            </Link>
          )})}
        </nav>

        {/* Sidebar footer - Notifications + Game tip */}
        <div className="p-3 space-y-2" style={{ borderTop: `1px solid ${palette.border}` }}>
          {/* Notification bell row */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: palette.text2 }}>
              {collapsed ? "" : "Alerts"}
            </span>
            <NotificationBell align="left" />
          </div>
          {!collapsed && (
            <div className="rounded-xl p-3" style={{ background: 'rgba(124, 106, 250, 0.08)', border: `1px solid ${palette.accent}15` }}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" style={{ color: palette.accent }} />
                <p className="text-xs font-medium" style={{ color: palette.accent }}>Quest Tip</p>
              </div>
              <p className="text-[11px] mt-1" style={{ color: palette.text2 }}>
                Complete daily challenges to boost your streak and earn bonus XP!
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 md:hidden z-30"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 overflow-auto transition-all duration-500 pt-14 md:pt-0",
          collapsed ? "md:ml-0" : "md:ml-0"
        )}
        style={{ background: 'transparent' }}
      >
        {/* Player HUD removed as per request - moved to Settings/Gamified UI */}
        <div className="hidden md:block">
          {/* <PlayerHUD /> */}
        </div>

        <div className="relative z-10">
          {children}
        </div>

        <Footer/>
      </main>
    </div>
  );
};

export default StudentLayout;

/* ── Mini stat for sidebar ── */
function MiniStat({ icon, value, color }: { icon: React.ReactNode; value: number; color: string }) {
  return (
    <div className="flex items-center gap-1">
      <div style={{ color }}>{icon}</div>
      <span className="text-[10px] font-bold" style={{ color }}>{value}</span>
    </div>
  );
}
