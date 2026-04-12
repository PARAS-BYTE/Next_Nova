"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Coffee, Brain, Eye, EyeOff, Zap, Clock, Target, Flame, CheckCircle2, AlertTriangle, Settings2, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const C = { purple: "#7C6AFA", cyan: "#22D3EE", green: "#10B981", red: "#EF4444", yellow: "#FBBF24", bg: "#050507", card: "#0A0A0C" };

type Phase = "focus" | "break" | "longBreak" | "idle";

export default function FocusMode() {
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

  const phaseColor = phase === "focus" ? C.purple : phase === "break" ? C.green : phase === "longBreak" ? C.cyan : C.purple;
  const phaseLabel = phase === "focus" ? "Focus Phase" : phase === "break" ? "Short Break" : phase === "longBreak" ? "Long Break" : "Ready";

  const focusScoreColor = (s: number) => s >= 80 ? C.green : s >= 50 ? C.yellow : C.red;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ background: C.bg, color: "#fff" }}>
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter" style={{ color: phaseColor }}>Focus Mode</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-1">AI-Powered Pomodoro + Real-Time Distraction Tracking</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40">
              Global Focus: <span style={{ color: focusScoreColor(currentGlobalFocus) }}>{currentGlobalFocus}%</span>
            </div>
            <button onClick={() => setShowSettings(!showSettings)} className="p-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white transition-colors">
              <Settings2 size={16} />
            </button>
          </div>
        </motion.div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: C.card }}>
              <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Focus (min)", key: "focusDuration" },
                  { label: "Break (min)", key: "breakDuration" },
                  { label: "Long Break (min)", key: "longBreakDuration" },
                  { label: "Sessions before long break", key: "sessionsBeforeLongBreak" },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/30 block mb-2">{label}</label>
                    <input type="number" value={(settings as any)[key]}
                      onChange={(e) => setSettings((s) => ({ ...s, [key]: Number(e.target.value) }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-black focus:outline-none focus:border-[#7C6AFA]" />
                  </div>
                ))}
              </div>
              <div className="px-6 pb-4 flex gap-3">
                <button onClick={() => { setSecondsLeft(settings.focusDuration * 60); setShowSettings(false); }}
                  className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white" style={{ background: C.purple }}>
                  Apply Settings
                </button>
                <button onClick={() => setShowSettings(false)} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/30 border border-white/10">Cancel</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Timer Circle */}
        <motion.div className="flex flex-col items-center gap-6">
          <div className="relative flex items-center justify-center">
            {/* SVG Ring */}
            <svg width="260" height="260" className="absolute">
              <circle cx="130" cy="130" r="120" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle cx="130" cy="130" r="120" fill="none" stroke={phaseColor} strokeWidth="8"
                strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 120}`}
                strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                transform="rotate(-90 130 130)"
                style={{ transition: "stroke-dashoffset 0.5s ease", filter: `drop-shadow(0 0 12px ${phaseColor}80)` }} />
            </svg>
            {/* Timer inner */}
            <div className="w-64 h-64 rounded-full flex flex-col items-center justify-center" style={{ background: `radial-gradient(circle at center, ${phaseColor}10, transparent 70%)` }}>
              <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: phaseColor }}>{phaseLabel}</p>
              <p className="text-6xl font-black text-white tabular-nums">{mins}:{secs}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-2">
                Session {sessionsCompleted + 1} of ∞
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button onClick={resetTimer} className="p-3 rounded-2xl border border-white/10 text-white/40 hover:text-white transition-all hover:border-white/30">
              <RotateCcw size={20} />
            </button>
            <button onClick={running ? pauseTimer : startTimer}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-white shadow-xl transition-all hover:scale-105 active:scale-95"
              style={{ background: `linear-gradient(135deg, ${phaseColor}, ${phaseColor}BB)`, boxShadow: `0 8px 30px ${phaseColor}50` }}>
              {running ? <><Pause size={20} /> Pause</> : phase === "idle" ? <><Play size={20} /> Start Session</> : <><Play size={20} /> Resume</>}
            </button>
            {phase !== "idle" && (
              <button onClick={handlePhaseComplete} className="p-3 rounded-2xl border border-white/10 text-white/40 hover:text-white transition-all hover:border-white/30">
                <CheckCircle2 size={20} />
              </button>
            )}
          </div>
        </motion.div>

        {/* Live Distraction Tracker */}
        {(running || phase !== "idle") && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-4">
            {[
              { label: "Tab Switches", value: tabSwitches, icon: <EyeOff size={16} />, danger: tabSwitches > 3, color: tabSwitches > 3 ? C.red : C.green },
              { label: "Distractions", value: distractions, icon: <AlertTriangle size={16} />, danger: distractions > 2, color: distractions > 2 ? C.red : C.yellow },
              { label: "Inactivity", value: `${Math.floor(inactivitySeconds / 60)}m ${inactivitySeconds % 60}s`, icon: <Clock size={16} />, danger: inactivitySeconds > 120, color: inactivitySeconds > 120 ? C.red : C.cyan },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-2xl border-2 text-center" style={{ background: C.card, borderColor: `${stat.color}25` }}>
                <div className="flex justify-center mb-2" style={{ color: stat.color }}>{stat.icon}</div>
                <p className="text-xl font-black text-white">{stat.value}</p>
                <p className="text-[9px] font-black uppercase tracking-widest mt-1" style={{ color: `${stat.color}99` }}>{stat.label}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Session Result */}
        <AnimatePresence>
          {focusScore !== null && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="p-6 rounded-2xl border-2 text-center"
              style={{ background: `${focusScoreColor(focusScore)}08`, borderColor: `${focusScoreColor(focusScore)}30` }}>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">Last Session Score</p>
              <p className="text-5xl font-black mb-2" style={{ color: focusScoreColor(focusScore) }}>{focusScore}%</p>
              <p className="text-xs text-white/40">
                {focusScore >= 80 ? "Legendary focus! XP awarded 🏆" : focusScore >= 50 ? "Decent session. Keep improving!" : "Too many distractions. XP reduced."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Session Summary */}
        {sessionsCompleted > 0 && (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-white/5 text-center" style={{ background: C.card }}>
              <p className="text-[9px] uppercase font-black tracking-widest text-white/30 mb-1">Sessions Today</p>
              <p className="text-2xl font-black text-white">{sessionsCompleted}</p>
            </div>
            <div className="p-4 rounded-2xl border border-white/5 text-center" style={{ background: C.card }}>
              <p className="text-[9px] uppercase font-black tracking-widest text-white/30 mb-1">Study Time</p>
              <p className="text-2xl font-black text-white">{sessionsCompleted * settings.focusDuration}m</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
