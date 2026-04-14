"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Coffee, Brain, Eye, EyeOff, Zap, Clock, Target, Flame, CheckCircle2, AlertTriangle, Settings2, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useGameStore } from "@/game/useGameStore";

// ─── Theme (Strict University Palette) ────────────────────────────────────────────────────
const C = { 
  primary: "#1E4D3B", 
  black: "#000000", 
  white: "#FFFFFF", 
  slate: "#F8FAFC", 
  error: "#000000", 
  success: "#1E4D3B", 
  bg: "#FFFFFF", 
  card: "#FFFFFF" 
};

type Phase = "focus" | "break" | "longBreak" | "idle";

export default function FocusMode() {
  const { addXP, addCoins } = useGameStore();

  // Timer State
  const [phase, setPhase] = useState<Phase>("idle");
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [settings, setSettings] = useState({ focusDuration: 25, breakDuration: 5, longBreakDuration: 15, sessionsBeforeLongBreak: 4 });
  const [showSettings, setShowSettings] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(false);

  // Focus Tracking State
  const [tabSwitches, setTabSwitches] = useState(0);
  const [inactivitySeconds, setInactivitySeconds] = useState(0);
  const [distractions, setDistractions] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [focusScore, setFocusScore] = useState<number | null>(null);
  const [currentGlobalFocus, setCurrentGlobalFocus] = useState(0);

  const inactivityRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inactivityTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch AI timer settings on mount ──────────────────────
  useEffect(() => {
    const fetchSettings = async () => {
      setLoadingSettings(true);
      try {
        const { data } = await axios.get("/api/focus/timer-settings", { withCredentials: true });
        setSettings(data.settings);
        setSecondsLeft(data.settings.focusDuration * 60);
        toast.success(`AI tuned your timer: ${data.settings.focusDuration}m focus, ${data.settings.breakDuration}m break`);
      } catch {
        // Use defaults silently
      } finally {
        setLoadingSettings(false);
      }
    };
    fetchSettings();

    // Fetch current focus score
    axios.get("/api/focus/score", { withCredentials: true })
      .then(({ data }) => setCurrentGlobalFocus(data.currentFocusScore || 0))
      .catch(() => {});
  }, []);

  // ── Tab-switch detection ───────────────────────────────────
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && running && phase === "focus") {
        setTabSwitches((p) => p + 1);
        setDistractions((p) => p + 1);
        toast.warning("⚠️ Tab switch detected! Stay focused, warrior!");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [running, phase]);

  // ── Inactivity detection ───────────────────────────────────
  const resetInactivity = useCallback(() => { inactivityRef.current = 0; }, []);
  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetInactivity));
    if (running && phase === "focus") {
      inactivityTimerRef.current = setInterval(() => {
        inactivityRef.current += 5;
        setInactivitySeconds(inactivityRef.current);
        if (inactivityRef.current >= 60 && inactivityRef.current % 60 === 0) {
          setDistractions((p) => p + 1);
          toast.warning(`${Math.floor(inactivityRef.current / 60)}m of inactivity! Are you still there?`);
        }
      }, 5000);
    } else {
      if (inactivityTimerRef.current) clearInterval(inactivityTimerRef.current);
    }
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetInactivity));
      if (inactivityTimerRef.current) clearInterval(inactivityTimerRef.current);
    };
  }, [running, phase, resetInactivity]);

  // ── Main countdown timer ───────────────────────────────────
  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(timerRef.current!);
            handlePhaseComplete();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running]);

  const handlePhaseComplete = async () => {
    setRunning(false);
    if (phase === "focus") {
      const mins = settings.focusDuration;
      const newSessions = sessionsCompleted + 1;
      setSessionsCompleted(newSessions);

      // Log to backend
      try {
        const { data } = await axios.post("/api/focus/log", {
          tabSwitches,
          activeTimeMinutes: mins,
          distractions,
          sessionType: "pomodoro",
        }, { withCredentials: true });
        setFocusScore(data.focusScore);
        setCurrentGlobalFocus(data.focusScore);
        
        // SYNC WITH GAME STORE
        if (data.xpReward > 0) addXP(data.xpReward, "Focus Session");
        else if (data.xpPenalty > 0) addXP(-data.xpPenalty, "Focus Distraction");
        
        if (data.focusScore >= 70) {
           addCoins(25); // Bonus loot for high focus
        }

        toast.success(`🎉 Focus session complete! Score: ${data.focusScore}% | ${data.xpReward > 0 ? `+${data.xpReward} XP` : data.xpPenalty > 0 ? `-${data.xpPenalty} XP (distraction penalty)` : "No XP change"}`);
      } catch {
        toast.success("Focus session complete!");
      }

      // Reset tracking counters
      setTabSwitches(0);
      setDistractions(0);
      inactivityRef.current = 0;
      setInactivitySeconds(0);

      // Determine next phase
      if (newSessions % settings.sessionsBeforeLongBreak === 0) {
        setPhase("longBreak");
        setSecondsLeft(settings.longBreakDuration * 60);
        toast.info(`Long break earned! ${settings.longBreakDuration}m rest.`);
      } else {
        setPhase("break");
        setSecondsLeft(settings.breakDuration * 60);
        toast.info(`Short break! ${settings.breakDuration}m.`);
      }
    } else {
      // Break done → back to focus
      setPhase("focus");
      setSecondsLeft(settings.focusDuration * 60);
      toast.info("Break over! Time to focus again.");
    }
  };

  const startTimer = () => {
    if (phase === "idle") {
      setPhase("focus");
      setSecondsLeft(settings.focusDuration * 60);
      setSessionStartTime(new Date());
      setTabSwitches(0);
      setDistractions(0);
      inactivityRef.current = 0;
      setFocusScore(null);
    }
    setRunning(true);
  };

  const pauseTimer = () => setRunning(false);

  const resetTimer = () => {
    setRunning(false);
    setPhase("idle");
    setSecondsLeft(settings.focusDuration * 60);
    setTabSwitches(0);
    setDistractions(0);
    setFocusScore(null);
    inactivityRef.current = 0;
    setInactivitySeconds(0);
  };

  const mins = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const secs = (secondsLeft % 60).toString().padStart(2, "0");
  const totalSeconds = (phase === "break" ? settings.breakDuration : phase === "longBreak" ? settings.longBreakDuration : settings.focusDuration) * 60;
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  const phaseColor = phase === "focus" ? C.primary : phase === "break" ? C.primary : phase === "longBreak" ? C.black : C.primary;
  const phaseLabel = phase === "focus" ? "Strategic Focus" : phase === "break" ? "Recovery Interval" : phase === "longBreak" ? "Extended Rest" : "Standby";

  const focusScoreColor = (s: number) => s >= 80 ? C.primary : s >= 50 ? C.black : C.black;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ background: C.bg, color: "#000" }}>
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic" style={{ color: C.black }}>Focus Vault</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#1E4D3B] mt-1 italic">Scholar Precision Tracking System</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl border-2 border-slate-50 text-[10px] font-black uppercase tracking-widest text-black/40 bg-white shadow-sm">
              Global Mastery: <span style={{ color: C.primary }}>{currentGlobalFocus}%</span>
            </div>
            <button onClick={() => setShowSettings(!showSettings)} className="p-2.5 rounded-xl border-2 border-slate-50 text-black/40 hover:text-black bg-white shadow-sm transition-colors">
              <Settings2 size={16} />
            </button>
          </div>
        </motion.div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="rounded-2xl border-2 border-slate-50 overflow-hidden shadow-xl" style={{ background: C.card }}>
              <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Focus (min)", key: "focusDuration" },
                  { label: "Break (min)", key: "breakDuration" },
                  { label: "Long Break (min)", key: "longBreakDuration" },
                  { label: "Sessions Limit", key: "sessionsBeforeLongBreak" },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="text-[9px] font-black uppercase tracking-widest text-black/30 block mb-2">{label}</label>
                    <input type="number" value={(settings as any)[key]}
                      onChange={(e) => setSettings((s) => ({ ...s, [key]: Number(e.target.value) }))}
                      className="w-full bg-slate-50 border-2 border-transparent rounded-xl px-3 py-2 text-sm text-black font-black focus:outline-none focus:border-[#1E4D3B] transition-colors" />
                  </div>
                ))}
              </div>
              <div className="px-6 pb-4 flex gap-3">
                <button onClick={() => { setSecondsLeft(settings.focusDuration * 60); setShowSettings(false); }}
                  className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all bg-black hover:bg-[#1E4D3B]">
                  Initialize Profile
                </button>
                <button onClick={() => setShowSettings(false)} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-black/30 border border-slate-100">Cancel</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Timer Circle */}
        <div className="flex flex-col items-center gap-8">
          <div className="relative flex items-center justify-center">
            {/* SVG Ring */}
            <svg width="280" height="280" className="absolute">
              <circle cx="140" cy="140" r="130" fill="none" stroke="rgba(0,0,0,0.02)" strokeWidth="12" />
              <circle cx="140" cy="140" r="130" fill="none" stroke={phaseColor} strokeWidth="12"
                strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 130}`}
                strokeDashoffset={`${2 * Math.PI * 130 * (1 - progress / 100)}`}
                transform="rotate(-90 140 140)"
                style={{ transition: "stroke-dashoffset 0.5s ease" }} />
            </svg>
            {/* Timer inner */}
            <div className="w-72 h-72 rounded-full flex flex-col items-center justify-center bg-white shadow-2xl border-2 border-slate-50">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 italic" style={{ color: phaseColor }}>{phaseLabel}</p>
              <p className="text-7xl font-black text-black tabular-nums tracking-tighter">{mins}:{secs}</p>
              <div className="flex items-center gap-2 mt-4 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                <Target size={12} className="text-[#1E4D3B]" />
                <p className="text-[9px] font-black uppercase tracking-widest text-black/40">
                   Session {sessionsCompleted + 1}
                </p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button onClick={resetTimer} className="p-4 rounded-2xl border-2 border-slate-50 text-black/30 hover:text-black bg-white shadow-sm transition-all hover:border-black/10">
              <RotateCcw size={24} />
            </button>
            <button onClick={running ? pauseTimer : startTimer}
              className="flex items-center gap-4 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-2xl transition-all hover:scale-105 active:scale-95 bg-black hover:bg-[#1E4D3B]">
              {running ? <><Pause size={20} /> Suspend</> : phase === "idle" ? <><Play size={20} /> Inscribe Session</> : <><Play size={20} /> Resume</>}
            </button>
            {phase !== "idle" && (
              <button onClick={handlePhaseComplete} className="p-4 rounded-2xl border-2 border-slate-50 text-black/30 hover:text-black bg-white shadow-sm transition-all hover:border-black/10">
                <CheckCircle2 size={24} />
              </button>
            )}
          </div>
        </div>

        {/* Live Distraction Tracker */}
        {(running || phase !== "idle") && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-6">
            {[
              { label: "Tab Deviations", value: tabSwitches, icon: <EyeOff size={18} />, color: tabSwitches > 3 ? C.black : C.primary, bg: tabSwitches > 3 ? '#F8FAFC' : '#F0FDF4' },
              { label: "Neural Noise", value: distractions, icon: <AlertTriangle size={18} />, color: distractions > 2 ? C.black : C.primary, bg: distractions > 2 ? '#F8FAFC' : '#F0FDF4' },
              { label: "Idle State", value: `${Math.floor(inactivitySeconds / 60)}M ${inactivitySeconds % 60}S`, icon: <Clock size={16} />, color: inactivitySeconds > 120 ? C.black : C.primary, bg: inactivitySeconds > 120 ? '#F8FAFC' : '#F0FDF4' },
            ].map((stat) => (
              <div key={stat.label} className="p-6 rounded-3xl border-2 text-center bg-white shadow-sm transition-all hover:shadow-md" style={{ borderColor: 'rgba(0,0,0,0.03)' }}>
                <div className="flex justify-center mb-3" style={{ color: stat.color }}>{stat.icon}</div>
                <p className="text-2xl font-black text-black">{stat.value}</p>
                <p className="text-[9px] font-black uppercase tracking-widest mt-1 text-black/30">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Session Result */}
        <AnimatePresence>
          {focusScore !== null && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="p-8 rounded-[32px] border-2 text-center bg-white shadow-xl"
              style={{ borderColor: 'rgba(30, 77, 59, 0.1)' }}>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 mb-3">Efficiency Coefficient</p>
              <p className="text-6xl font-black mb-3" style={{ color: C.primary }}>{focusScore}%</p>
              <p className="text-[10px] text-black/40 font-bold uppercase tracking-tight">
                {focusScore >= 80 ? "Perfect technical execution. XP rewards synchronized." : focusScore >= 50 ? "Satisfactory session. Optimization required." : "Sub-optimal stability. XP penalty applied."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Session Summary */}
        {sessionsCompleted > 0 && (
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl border-2 border-slate-50 text-center bg-white shadow-sm">
              <p className="text-[10px] uppercase font-black tracking-widest text-black/20 mb-1">Archived Cycles</p>
              <p className="text-2xl font-black text-black">{sessionsCompleted}</p>
            </div>
            <div className="p-6 rounded-3xl border-2 border-slate-50 text-center bg-white shadow-sm">
              <p className="text-[10px] uppercase font-black tracking-widest text-black/20 mb-1">Temporal Mastery</p>
              <p className="text-2xl font-black text-[#1E4D3B]">{sessionsCompleted * settings.focusDuration}M</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
