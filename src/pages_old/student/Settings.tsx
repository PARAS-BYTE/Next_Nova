"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  Mail,
  Image,
  Settings,
  Save,
  Brain,
  Zap,
  ShieldCheck,
  Link as LinkIcon,
  Flame,
  Trophy,
  Coins,
  Activity,
  Target,
  Star,
  ChevronRight,
  Sparkles,
  Lock,
  Globe
} from "lucide-react";

import { palette } from "@/theme/palette";
import { getXPProgress, getRankForLevel } from "@/game/gameConfig";
import GameAvatar from "@/components/game/AvatarSystem";

const UserProfile = () => {
  const [user, setUser] = useState<any>(null);
  const [editData, setEditData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("profile");

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get("/api/auth/getuserprofile", { withCredentials: true });
      setUser(data);
      setEditData({
        username: data.username,
        name: data.name,
        avatarUrl: data.avatarUrl,
        learningPreferences: data.learningPreferences || {},
        email: data.email,
      });
    } catch (err) {
      console.error("Profile Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handlePreferenceChange = (key: string, value: any) => {
    setEditData({
      ...editData,
      learningPreferences: {
        ...editData.learningPreferences,
        [key]: value,
      },
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data } = await axios.post("/api/auth/update", editData, { withCredentials: true });
      setMessage("✅ Data persistence synchronized!");
      setUser(data.user);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("❌ Sync failed!");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  if (loading) return (
    <div className="h-screen flex flex-col justify-center items-center gap-4 bg-[#050507]">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
        <Zap className="text-[#7C6AFA] w-12 h-12" />
      </motion.div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Syncing Profile...</p>
    </div>
  );

  if (!user) return <div className="h-screen flex justify-center items-center text-red-500 font-black">SYSTEM OFFLINE.</div>;

  const xpProgress = getXPProgress(user.xp || 0);
  const rankCfg = getRankForLevel(user.level || 1);

  return (
    <div className="min-h-screen bg-[#050507] text-white p-4 sm:p-8 lg:p-12 overflow-x-hidden">
      
      {/* ─── GAMIFIED HUD HEADER ─────────────────────── */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto mb-12 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center"
      >
        {/* Avatar Section */}
        <div className="flex items-center gap-6 p-6 rounded-3xl border-2 border-white/5 bg-[#0A0A0C] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#7C6AFA]/10 to-transparent opacity-0 group-hover:opacity-100 transition-all" />
          <div className="relative z-10">
            <GameAvatar skin={user.avatarUrl || "default"} level={user.level} size={80} showRing={true} mood="happy" />
          </div>
          <div className="relative z-10 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#7C6AFA] bg-[#7C6AFA]/10 px-2 py-0.5 rounded-lg border border-[#7C6AFA]/20">
                Lvl {user.level}
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Student</span>
            </div>
            <h2 className="text-2xl font-black tracking-tighter truncate">{user.name || user.username}</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">{rankCfg.title} · {rankCfg.rank}</p>
            
            {/* XP PROGRESS BAR */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                <span className="text-white/30">Experience Points</span>
                <span className="text-[#7C6AFA]">{xpProgress.current} / {xpProgress.required}</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress.percent}%` }}
                  className="h-full bg-gradient-to-r from-[#7C6AFA] to-[#22D3EE] rounded-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Core Stats */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4 h-full">
          {[
            { label: "Day Streak", value: user.streakDays, icon: Flame, color: "#FBBF24" },
            { label: "Nova Coins", value: user.coins, icon: Coins, color: "#34D399" },
            { label: "Accuracy", value: `${user.accuracyScore}%`, icon: Target, color: "#22D3EE" },
            { label: "Focus Rank", value: `${user.focusScore}%`, icon: Activity, color: "#EF4444" },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className="p-5 rounded-3xl border-2 border-white/5 bg-[#0A0A0C] flex flex-col justify-center items-center text-center gap-2"
            >
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}30` }}>
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-0.5">{stat.label}</p>
                <p className="text-xl font-black text-white">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ─── MAIN CONTENT ─────────────────────── */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Nav Tabs */}
        <div className="lg:col-span-3 space-y-2">
          {[
            { id: "profile", label: "Identity", icon: User },
            { id: "preferences", label: "Learning DNA", icon: Brain },
            { id: "security", label: "Protocol", icon: Lock },
            { id: "social", label: "Network", icon: Globe },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${
                activeTab === tab.id ? "bg-[#7C6AFA]/10 border-[#7C6AFA]/40 text-[#7C6AFA]" : "bg-transparent border-transparent text-white/30 hover:bg-white/5 hover:text-white/60"
              }`}
            >
              <tab.icon size={16} /> {tab.label}
              {activeTab === tab.id && <ChevronRight size={14} className="ml-auto" />}
            </button>
          ))}
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-9">
          <Card className="rounded-[40px] border-2 bg-[#0A0A0C] border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
              <Sparkles size={300} />
            </div>
            
            <CardHeader className="px-8 pt-8 border-b border-white/5 mb-6">
              <CardTitle className="text-2xl font-black tracking-tighter flex items-center gap-3">
                <Settings className="text-[#7C6AFA]" /> 
                System Parameters
              </CardTitle>
            </CardHeader>

            <CardContent className="px-8 pb-8">
              <AnimatePresence mode="wait">
                {activeTab === "profile" && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                  >
                    {[
                      { label: "Nom de Guerre (Username)", name: "username", icon: User },
                      { label: "Real Name", name: "name", icon: Target },
                      { label: "Encrypted Email", name: "email", icon: Mail },
                      { label: "Avatar Data Matrix (URL)", name: "avatarUrl", icon: Image },
                    ].map((field) => (
                      <div key={field.name} className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-1 flex items-center gap-2">
                          <field.icon size={10} /> {field.label}
                        </label>
                        <Input
                          name={field.name}
                          value={editData[field.name] || ""}
                          onChange={handleChange}
                          className="h-14 rounded-2xl border-white/10 bg-[#050507]/50 focus:border-[#7C6AFA] font-bold text-sm tracking-tight"
                        />
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeTab === "preferences" && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-1">Computation Speed (Pace)</label>
                        <select
                          value={editData.learningPreferences?.pace || "moderate"}
                          onChange={(e) => handlePreferenceChange("pace", e.target.value)}
                          className="w-full h-14 rounded-2xl border-2 border-white/10 bg-[#050507]/50 px-4 font-black uppercase text-[10px] tracking-widest"
                        >
                          <option value="slow">Slow & Deep</option>
                          <option value="moderate">Balanced</option>
                          <option value="fast">Aggressive (Fast)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-1">Primary Skillsets</label>
                        <Input
                          value={(editData.learningPreferences?.preferredTopics || []).join(", ")}
                          onChange={(e) => handlePreferenceChange("preferredTopics", e.target.value.split(",").map(v => v.trim()))}
                          className="h-14 rounded-2xl border-white/10 bg-[#050507]/50 font-bold"
                          placeholder="React, CSS, AI..."
                        />
                      </div>
                    </div>
                    
                    <div className="p-6 rounded-3xl bg-[#7C6AFA]/5 border border-[#7C6AFA]/20">
                      <div className="flex items-center gap-3 mb-4">
                         <div className="w-8 h-8 rounded-xl bg-[#7C6AFA]/20 flex items-center justify-center">
                           <Brain size={16} className="text-[#7C6AFA]" />
                         </div>
                         <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Neural Weaknesses</h3>
                      </div>
                      <p className="text-[10px] text-white/30 uppercase mb-4 leading-relaxed">
                        Specify topics you struggle with. Our AI will prioritize these in your personal dungeon crawls and quizzes.
                      </p>
                      <Input
                        value={(editData.learningPreferences?.weakAreas || []).join(", ")}
                        onChange={(e) => handlePreferenceChange("weakAreas", e.target.value.split(",").map(v => v.trim()))}
                        className="h-14 rounded-2xl border-white/10 bg-[#050507]/50 font-bold"
                        placeholder="Algorithms, State Management..."
                      />
                    </div>
                  </motion.div>
                )}

                {activeTab === "security" && (
                   <motion.div 
                   initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                   className="space-y-6"
                 >
                    <div className="p-8 rounded-[32px] border-2 border-[#7C6AFA]/10 bg-gradient-to-br from-[#7C6AFA]/5 to-transparent relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 opacity-10">
                         <ShieldCheck size={80} className="text-[#7C6AFA]" />
                      </div>
                      <h3 className="text-lg font-black tracking-tight mb-2">On-Chain Certification Identity</h3>
                      <p className="text-xs text-white/40 mb-6 max-w-lg leading-relaxed">
                        Your educational integrity is cryptographically secured. Every XP earned and course passed is logged to our decentralized proof-of-knowledge ledger.
                      </p>
                      
                      <div className="flex flex-col gap-3">
                         <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#7C6AFA]/20 flex items-center justify-center shrink-0">
                               <LinkIcon size={18} className="text-[#7C6AFA]" />
                            </div>
                            <div className="min-w-0">
                               <p className="text-[9px] font-black uppercase tracking-widest text-[#7C6AFA]">Permanent Soulbound Address</p>
                               <p className="text-xs font-mono truncate text-white/60">nova_proof_{user._id.toString()}_ledger</p>
                            </div>
                         </div>
                         
                         <Button variant="outline" className="h-12 rounded-2xl border-white/10 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest"
                           onClick={() => window.location.href = '/student/certificates'}>
                            View Verifiable Credentials
                         </Button>
                      </div>
                    </div>
                 </motion.div>
                )}
              </AnimatePresence>

              {/* ACTION FOOTER */}
              <div className="mt-12 flex items-center justify-between pt-8 border-t border-white/5">
                <p className="text-[10px] font-bold text-[#10B981]">{message}</p>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="h-14 px-10 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl transition-all"
                  style={{ 
                    background: saving ? "#1A1A1E" : "linear-gradient(135deg, #7C6AFA, #5D4AD4)",
                    color: "white",
                    boxShadow: saving ? "none" : "0 10px 30px rgba(124,106,250,0.3)"
                  }}
                >
                  {saving ? "Syncing..." : "Commit Changes"}
                  <Save className="ml-2" size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
