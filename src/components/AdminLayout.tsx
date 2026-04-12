"use client";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ReactNode, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { NavLink } from '@/components/NavLink';
import { cn } from '@/lib/utils';
import {
  Home,
  BookOpen,
  Users,
  FileText,
  Settings,
  Sparkles,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Rocket,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import axios from 'axios';
import { palette } from '@/theme/palette';
import Footer from './Footer';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const pathname = usePathname();
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Fetch admin profile
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const { data } = await axios.get('/api/admin/auth/profile', {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (data.success && data.admin) {
          setAdmin(data.admin);
        }
      } catch (err) {
        console.error('Failed to fetch admin profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Courses', href: '/admin/courses', icon: BookOpen },
    { name: 'Students', href: '/admin/students', icon: Users },
    { name: 'Assessments', href: '/admin/assessments', icon: FileText },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen" style={{ background: palette.bg }}>

      {/* MOBILE TOP BAR (FIXED) */}
      <div
        className="md:hidden flex items-center justify-between p-4 z-50 fixed top-0 left-0 w-full glass"
        style={{ borderBottom: `1px solid ${palette.border}` }}
      >
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: palette.gradient1 }}>
            <Rocket className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold shimmer-text">LearnNova</span>
        </Link>

        <button onClick={() => setOpen(!open)} className="p-2 rounded-xl" style={{ color: palette.text }}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* SIDEBAR */}
      <aside
        className={cn(
          'fixed md:static top-0 left-0 h-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] z-40 flex flex-col',
          collapsed ? 'w-[72px]' : 'w-64',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
        style={{ background: palette.card, borderRight: `1px solid ${palette.border}` }}
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
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: palette.gradient1 }}>
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-lg font-bold block shimmer-text">LearnNova</span>
                  <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: palette.text2 }}>Educator Portal</span>
                </div>
              </Link>
              <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg transition-all duration-200 hover:scale-110" style={{ color: palette.text2 }}>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link href="/" className="flex items-center justify-center">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: palette.gradient1 }}>
                  <Rocket className="w-5 h-5 text-white" />
                </div>
              </Link>
              <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg transition-all duration-200 hover:scale-110" style={{ color: palette.text2 }}>
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center transition-all duration-300 group relative rounded-xl',
                collapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'
              )}
              style={{
                color: isActive ? palette.text : palette.text2,
                background: isActive ? palette.accentSoft : 'transparent',
                boxShadow: isActive ? `inset 3px 0 0 ${palette.accent}` : 'none',
              }}
              onClick={() => setOpen(false)}
            >
              <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>
                <item.icon className="w-5 h-5 flex-shrink-0" style={{ color: isActive ? palette.accent : palette.text2 }} />
              </motion.div>
              {!collapsed && <span className={cn("text-sm", isActive && "font-medium")}>{item.name}</span>}

              {collapsed && isActive && (
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

        {/* User Profile */}
        {!loading && (
          <div className="p-3" style={{ borderTop: `1px solid ${palette.border}` }}>
            <div className={cn("rounded-xl p-3", collapsed && "p-2 flex justify-center")} style={{ background: palette.accentSoft }}>
              <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
                <Avatar className={collapsed ? "w-8 h-8" : "w-10 h-10"}>
                  <AvatarFallback style={{ background: palette.gradient1, color: '#fff', fontWeight: 700, fontSize: '0.75rem' }}>
                    {admin?.fullName
                      ? admin.fullName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
                      : "AD"}
                  </AvatarFallback>
                </Avatar>

                {!collapsed && (
                  <div>
                    <p className="font-medium text-sm" style={{ color: palette.text }}>{admin?.fullName || "Admin"}</p>
                    <p className="text-xs" style={{ color: palette.text2 }}>{admin?.role || "Instructor"}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* MOBILE OVERLAY */}
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

      {/* RIGHT SIDE AREA */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">

        {/* TOP BAR (DESKTOP) */}
        <header
          className="hidden md:flex h-14 items-center justify-between px-6"
          style={{ background: palette.card, borderBottom: `1px solid ${palette.border}` }}
        >
          <h1 className="text-lg font-semibold" style={{ color: palette.text }}>
            {navigation.find(n => pathname.startsWith(n.href))?.name || "Dashboard"}
          </h1>

          <button onClick={() => setCollapsed(!collapsed)} className="p-2 rounded-lg transition-all duration-200 hover:scale-110" style={{ color: palette.text2 }}>
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </header>

        {/* MAIN CONTENT */}
        <main
          className="flex-1 overflow-auto pt-16 md:pt-0"
          style={{ background: palette.bg }}
        >
          {children}
          {<Footer />}
        </main>

      </div>
    </div>
  );
};


export default AdminLayout;
