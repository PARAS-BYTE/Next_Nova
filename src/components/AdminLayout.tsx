"use client";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ReactNode, useEffect, useState } from 'react';

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
  ChevronRight
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

      {/* MOBILE TOP BAR (FIXED MATCHING STUDENT LAYOUT) */}
      <div
        className="md:hidden flex items-center justify-between p-4 border-b z-50 fixed top-0 left-0 w-full"
        style={{ background: palette.card, borderColor: palette.border }}
      >
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: palette.accent }}>
            <Sparkles className="w-4 h-4" style={{ color: palette.card }} />
          </div>
          <span className="text-lg font-bold" style={{ color: palette.text }}>learnNova</span>
        </Link>

        <button onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" style={{ color: palette.text }} /> : <Menu className="w-6 h-6" style={{ color: palette.text }} />}
        </button>
      </div>

      {/* SIDEBAR */}
      <aside
        className={cn(
          'fixed md:static top-0 left-0 h-full transition-all duration-300 z-40 border-r flex flex-col',
          collapsed ? 'w-16' : 'w-64',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
        style={{ background: palette.card, borderColor: palette.border }}
      >

        {/* Logo Section */}
        <div
          className={cn(
            "p-4 border-b flex items-center",
            collapsed ? "justify-center flex-col gap-2 py-4" : "justify-between"
          )}
          style={{ borderColor: palette.border }}
        >
          {!collapsed ? (
            <>
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: palette.accent }}>
                  <Sparkles className="w-4 h-4" style={{ color: palette.card }} />
                </div>
                <div>
                  <span className="text-lg font-bold block" style={{ color: palette.text }}>Learn Nova</span>
                  <span className="text-xs" style={{ color: palette.text2 }}>Educator Portal</span>
                </div>
              </Link>
              <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronLeft className="w-4 h-4" style={{ color: palette.text2 }} />
              </button>
            </>
          ) : (
            <>
              <Link href="/" className="flex items-center justify-center">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: palette.accent }}>
                  <Sparkles className="w-4 h-4" style={{ color: palette.card }} />
                </div>
              </Link>
              <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded-lg hover:bg-gray-100 transition-colors mt-2">
                <ChevronRight className="w-4 h-4" style={{ color: palette.text2 }} />
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
                'flex items-center transition-all group relative',
                collapsed ? 'justify-center p-3 rounded-lg' : 'gap-3 px-3 py-2.5 rounded-xl'
              )}
              style={{
                color: isActive ? palette.text : palette.text2,
                background: isActive ? palette.accentSoft : 'transparent',
              }}
              onClick={() => setOpen(false)}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}

              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </Link>
          )})}
        </nav>

        {/* User Profile */}
        {!loading && (
          <div className="p-3 border-t" style={{ borderColor: palette.border }}>
            <div className={cn("rounded-xl p-3", collapsed && "p-2 flex justify-center")} style={{ background: palette.cardHover }}>
              <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
                <Avatar className={collapsed ? "w-8 h-8" : "w-10 h-10"}>
                  <AvatarFallback style={{ background: palette.accent, color: palette.card }}>
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
      {open && (
        <div
          className="fixed inset-0 bg-black/30 md:hidden z-30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* RIGHT SIDE AREA */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">

        {/* TOP BAR (DESKTOP) */}
        <header
          className="hidden md:flex h-14 border-b items-center justify-between px-6"
          style={{ background: palette.card, borderColor: palette.border }}
        >
          <h1 className="text-lg font-semibold" style={{ color: palette.text }}>
            {navigation.find(n => pathname.startsWith(n.href))?.name || "Dashboard"}
          </h1>

          <button onClick={() => setCollapsed(!collapsed)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
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
