"use client";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
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
  Blocks,
  Menu,
  X,
  Flame,
  Zap,
  Target,
  MessageSquare,
  FileText,
  Swords,
  Map,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { palette, rankColors } from '../theme/palette';
import Footer from './Footer';
import XPPopup from './XPPopup';

interface StudentLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Command Hub', href: '/student', icon: Home, color: '#7C3AED' },
  { name: 'Quest Board', href: '/student/assignments', icon: Target, color: '#F59E0B' },
  { name: 'Courses', href: '/student/courses', icon: BookOpen, color: '#06B6D4' },
  { name: 'Arena', href: '/student/arena', icon: Swords, color: '#EF4444' },
  { name: 'Quizzes', href: '/student/quizzes', icon: FileQuestion, color: '#10B981' },
  { name: 'My Learning', href: '/student/learning', icon: Zap, color: '#9D6FF7' },
  { name: 'Road Map', href: '/student/roadmap', icon: Map, color: '#06B6D4' },
  { name: 'Calendar', href: '/student/calendar', icon: Calendar, color: '#F59E0B' },
  { name: 'Notes', href: '/student/notion', icon: FileText, color: '#7C3AED' },
  { name: 'Forum', href: '/student/forum', icon: MessageSquare, color: '#06B6D4' },
  { name: 'AI Oracle', href: '/student/chatbot', icon: Bot, color: '#10B981' },
  { name: 'Store', href: '/student/store', icon: StoreIcon, color: '#F59E0B' },
  { name: 'History', href: '/student/hist', icon: History, color: '#7B85B0' },
  { name: 'Settings', href: '/student/settings', icon: Settings, color: '#7B85B0' },
];

const getRankIcon = (rank: string) => {
  const icons: Record<string, string> = {
    Bronze: '🥉', Silver: '🥈', Gold: '🥇', Platinum: '💎', Diamond: '⚡',
  };
  return icons[rank] || '🎖️';
};

const StudentLayout = ({ children }: StudentLayoutProps) => {
  const pathname = usePathname();
  const user = useStore((state) => state.user);
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const rank = user?.rank || 'Bronze';
  const rankInfo = rankColors[rank] || rankColors['Bronze'];
  const xp = user?.xp || 0;
  const level = user?.level || 1;
  const xpGoal = level * 100;
  const xpPct = Math.min(100, Math.round((xp / xpGoal) * 100));

  const isActive = (path: string) => {
    if (path === '/student') return pathname === path;
    return pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen game-bg overflow-hidden">
      <XPPopup />

      {/* ── MOBILE TOP BAR ── */}
      <div
        className="md:hidden flex items-center justify-between px-4 py-3 z-50 fixed top-0 left-0 w-full glass-dark"
        style={{ borderBottom: `1px solid ${palette.border}` }}
      >
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center btn-game">
            <Blocks className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-gradient-purple">LearnNova</span>
        </Link>
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full glass border-neon-purple">
              <Flame className="w-3 h-3" style={{ color: palette.gold }} />
              <span className="text-xs font-bold" style={{ color: palette.gold }}>{user.streak}d</span>
            </div>
          )}
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-lg glass"
            style={{ color: palette.text }}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── SIDEBAR ── */}
      <aside
        className={cn(
          'fixed md:static top-0 left-0 h-full transition-all duration-300 z-40 flex flex-col hud-scanline',
          collapsed ? 'w-16' : 'w-64',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
        style={{
          background: 'linear-gradient(180deg, #0A0D1A 0%, #080B16 100%)',
          borderRight: `1px solid ${palette.borderGlow}`,
          boxShadow: '4px 0 20px rgba(124,58,237,0.08)',
        }}
      >
        {/* ── Logo ── */}
        <div
          className={cn("p-4 flex items-center", collapsed ? "justify-center" : "justify-between")}
          style={{ borderBottom: `1px solid ${palette.border}` }}
        >
          {!collapsed ? (
            <>
              <Link href="/" className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center btn-game">
                  <Blocks className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-base font-bold text-gradient-purple">LearnNova</span>
                  <div className="text-[10px] font-mono" style={{ color: palette.cyan }}>// GAME MODE</div>
                </div>
              </Link>
              <button
                onClick={() => setCollapsed(true)}
                className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
                style={{ color: palette.text2 }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button onClick={() => setCollapsed(false)} className="flex flex-col items-center gap-1">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center btn-game">
                <Blocks className="w-5 h-5 text-white" />
              </div>
              <ChevronRight className="w-3 h-3" style={{ color: palette.text2 }} />
            </button>
          )}
        </div>

        {/* ── Player Card ── */}
        {!collapsed && user && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-3 mt-3 p-3 rounded-xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(6,182,212,0.06))',
              border: `1px solid ${palette.borderGlow}`,
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="relative flex-shrink-0">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${rankInfo.color}33, ${rankInfo.color}66)`,
                    border: `2px solid ${rankInfo.color}`,
                    boxShadow: `0 0 12px ${rankInfo.glow}`,
                  }}
                >
                  {user.name?.[0] || 'P'}
                </div>
                <div
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border-2"
                  style={{ background: palette.bgCard, borderColor: palette.accent, color: palette.accentSoft }}
                >
                  {level}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate" style={{ color: palette.text }}>{user.name}</p>
                <div
                  className="rank-badge mt-0.5 inline-block"
                  style={{ background: `${rankInfo.color}22`, color: rankInfo.color, border: `1px solid ${rankInfo.color}55` }}
                >
                  {getRankIcon(rank)} {rank}
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-mono" style={{ color: palette.text2 }}>XP</span>
                <span className="text-[10px] font-mono" style={{ color: palette.accentSoft }}>{xp} / {xpGoal}</span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: palette.progressTrack }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPct}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${palette.accent}, ${palette.cyan})`,
                    boxShadow: `0 0 8px ${palette.accentGlow}`,
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 mt-2">
              <Flame className="w-3 h-3" style={{ color: palette.gold }} />
              <span className="text-[11px] font-semibold" style={{ color: palette.gold }}>{user.streak} day streak</span>
            </div>
          </motion.div>
        )}

        {collapsed && user && (
          <div className="flex flex-col items-center py-3 gap-2">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
              style={{
                background: `${rankInfo.color}33`,
                border: `2px solid ${rankInfo.color}`,
                boxShadow: `0 0 10px ${rankInfo.glow}`,
              }}
            >
              {user.name?.[0] || 'P'}
            </div>
            <div className="w-8 h-1 rounded-full overflow-hidden" style={{ background: palette.progressTrack }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${xpPct}%`, background: `linear-gradient(90deg, ${palette.accent}, ${palette.cyan})` }}
              />
            </div>
          </div>
        )}

        {/* ── Navigation ── */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto mt-1">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center transition-all duration-200 group relative rounded-xl',
                  collapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5',
                )}
                style={active ? {
                  background: `linear-gradient(90deg, ${item.color}22, transparent)`,
                  borderLeft: `2px solid ${item.color}`,
                  boxShadow: `inset 0 0 20px ${item.color}0A`,
                  color: palette.text,
                } : { color: palette.text2 }}
                onClick={() => setOpen(false)}
              >
                <item.icon
                  className="w-4 h-4 flex-shrink-0 transition-colors"
                  style={{ color: active ? item.color : undefined }}
                />
                {!collapsed && (
                  <span className="text-sm font-medium">
                    {item.name}
                  </span>
                )}
                {active && !collapsed && (
                  <div
                    className="ml-auto w-1.5 h-1.5 rounded-full"
                    style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }}
                  />
                )}
                {collapsed && (
                  <div
                    className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 glass-dark"
                    style={{ color: palette.text, border: `1px solid ${palette.border}` }}
                  >
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Bottom stats ── */}
        {!collapsed && (
          <div
            className="p-3 mx-2 mb-3 rounded-xl"
            style={{ background: palette.bgCard, border: `1px solid ${palette.border}` }}
          >
            <div className="grid grid-cols-3 gap-1 text-center">
              <div>
                <p className="text-xs font-bold" style={{ color: palette.accentSoft }}>{xp.toLocaleString()}</p>
                <p className="text-[9px]" style={{ color: palette.text2 }}>XP</p>
              </div>
              <div>
                <p className="text-xs font-bold" style={{ color: palette.gold }}>Lv.{level}</p>
                <p className="text-[9px]" style={{ color: palette.text2 }}>Level</p>
              </div>
              <div>
                <p className="text-xs font-bold" style={{ color: palette.cyan }}>{user?.streak || 0}🔥</p>
                <p className="text-[9px]" style={{ color: palette.text2 }}>Streak</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm md:hidden z-30"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-auto game-bg pt-[60px] md:pt-0">
        {children}
        <Footer />
      </main>
    </div>
  );
};

export default StudentLayout;
