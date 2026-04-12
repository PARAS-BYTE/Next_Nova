"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Check, CheckCheck, Trash2, Sparkles, AlertTriangle, Flame, Trophy, BookOpen, Brain, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const typeConfig: Record<string, { color: string; icon: any }> = {
  warning:     { color: "#EF4444", icon: AlertTriangle },
  streak:      { color: "#FBBF24", icon: Flame },
  achievement: { color: "#7C6AFA", icon: Trophy },
  reminder:    { color: "#22D3EE", icon: BookOpen },
  tip:         { color: "#10B981", icon: Brain },
  system:      { color: "rgba(255,255,255,0.4)", icon: Zap },
};

export default function NotificationBell({ align = "right" }: { align?: "left" | "right" }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get("/api/notifications", { withCredentials: true });
      setNotifications(data.notifications || []);
      setUnread(data.unreadCount || 0);
    } catch {}
  };

  // Generate smart notifications on mount (background)
  const generateSmart = async () => {
    try {
      await axios.post("/api/notifications/generate", {}, { withCredentials: true });
      fetchNotifications();
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    generateSmart();
    const interval = setInterval(fetchNotifications, 120000); // refresh every 2 min
    return () => clearInterval(interval);
  }, []);

  // Close panel on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const markAllRead = async () => {
    try {
      await axios.put("/api/notifications/read", { markAll: true }, { withCredentials: true });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnread(0);
    } catch {}
  };

  const deleteNote = async (id: string) => {
    try {
      await axios.delete(`/api/notifications/${id}`, { withCredentials: true });
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setUnread((u) => Math.max(0, u - 1));
    } catch {}
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2.5 rounded-xl border border-white/10 transition-all hover:border-[#7C6AFA]/40 hover:bg-[#7C6AFA]/10"
        style={{ background: open ? "rgba(124,106,250,0.1)" : "transparent" }}
        title="Notifications"
      >
        <Bell size={18} className="text-white/50" style={{ color: open ? "#7C6AFA" : undefined }} />
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white"
            style={{ background: "#EF4444", boxShadow: "0 0 8px rgba(239,68,68,0.6)" }}
          >
            {unread > 9 ? "9+" : unread}
          </motion.span>
        )}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: align === "right" ? 10 : -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: align === "right" ? 10 : -10, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className={cn(
              "absolute w-[calc(100vw-2rem)] sm:w-96 rounded-3xl border-2 shadow-[0_20px_70px_-10px_rgba(0,0,0,0.7)] z-[100] overflow-hidden",
              align === "right" 
                ? "right-0 md:-right-2 top-full mt-4" 
                : "left-0 md:left-full md:ml-6 bottom-0 md:-bottom-2"
            )}
            style={{ 
              background: "rgba(10, 10, 12, 0.95)", 
              backdropFilter: "blur(20px)",
              borderColor: "rgba(124,106,250,0.3)",
              boxShadow: "0 0 40px rgba(124,106,250,0.1), 0 20px 70px rgba(0,0,0,0.8)"
            }}
          >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/[0.03] to-transparent" />

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Bell size={14} style={{ color: "#7C6AFA" }} />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Alerts</span>
                {unread > 0 && (
                  <span className="px-2 py-0.5 rounded-lg text-[9px] font-black" style={{ background: "rgba(239,68,68,0.2)", color: "#EF4444" }}>
                    {unread} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button onClick={markAllRead} title="Mark all read"
                    className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-white/30 hover:text-white">
                    <CheckCheck size={14} />
                  </button>
                )}
                <button onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-white/30 hover:text-white">
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-[450px] overflow-y-auto custom-scrollbar relative">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/5 border border-white/10">
                    <Bell size={28} className="text-white/20" />
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">All Clear</p>
                    <p className="text-[9px] text-white/20 font-medium mt-1">No new transmissions found.</p>
                  </div>
                </div>
              ) : (
                notifications.map((n) => {
                  const cfg = typeConfig[n.type] || typeConfig.system;
                  const Icon = cfg.icon;
                  return (
                    <motion.div
                      layout
                      key={n._id}
                      className="relative flex items-start gap-4 px-5 py-4 border-b border-white/[0.03] hover:bg-white/[0.03] transition-all group cursor-default"
                    >
                      {/* Unread Indicator dot */}
                      {!n.read && (
                        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full" style={{ background: cfg.color }} />
                      )}
                      
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 relative overflow-hidden"
                        style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10" />
                        <Icon size={16} style={{ color: cfg.color }} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: cfg.color }}>{n.type}</span>
                          <span className="text-[9px] text-white/20 font-bold">{formatTime(n.createdAt)}</span>
                        </div>
                        <p className="text-[12px] font-black text-white/90 leading-tight mb-1">{n.title}</p>
                        <p className="text-[11px] text-white/40 leading-relaxed font-medium line-clamp-2">{n.message}</p>
                      </div>

                      <button onClick={() => deleteNote(n._id)}
                        className="opacity-0 group-hover:opacity-100 transition-all p-2 rounded-xl hover:bg-red-500/20 text-white/10 hover:text-red-400 shrink-0 self-center">
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-white/5 flex justify-between items-center">
              <button onClick={generateSmart}
                className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest transition-colors"
                style={{ color: "#7C6AFA" }}>
                <Sparkles size={11} /> Refresh Alerts
              </button>
              <span className="text-[9px] text-white/20 font-black uppercase">{notifications.length} total</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
