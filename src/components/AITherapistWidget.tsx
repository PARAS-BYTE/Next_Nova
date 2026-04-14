"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, Brain, Zap, Coffee, RefreshCw, ChevronRight,
  Flame, ChevronDown, ChevronUp, Sparkles, AlertTriangle,
  Smile, Meh, Frown, Skull, CheckCircle
} from "lucide-react";

const burnoutColors: Record<string, string> = {
  none: "#10B981",
  low: "#22D3EE",
  moderate: "#FBBF24",
  high: "#F97316",
  critical: "#EF4444",
};

const burnoutIcon: Record<string, any> = {
  none: <CheckCircle className="w-4 h-4 text-green-500" />,
  low: <Smile className="w-4 h-4 text-cyan-400" />,
  moderate: <Meh className="w-4 h-4 text-yellow-400" />,
  high: <Frown className="w-4 h-4 text-orange-400" />,
  critical: <Skull className="w-4 h-4 text-red-500" />,
};

interface TherapistData {
  burnoutLevel: string;
  motivationalMessage: string;
  actionSuggestions: string[];
  breakRecommendation: { shouldTakeBreak: boolean; breakDuration: number; activity: string };
  dailyGoal: string;
}

export default function AITherapistWidget() {
  const [data, setData] = useState<TherapistData | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchMotivation = async () => {
    setLoading(true);
    try {
      const { data: res } = await axios.post(
        "/api/ai/motivation",
        {},
        { withCredentials: true }
      );
      setData(res);
      setExpanded(true);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setFetched(true);
    }
  };

  // Auto-fetch once when mounted (with a delay to not block page load)
  useEffect(() => {
    const timer = setTimeout(fetchMotivation, 3000);
    return () => clearTimeout(timer);
  }, []);

  const burnoutLevel = data?.burnoutLevel || "none";
  const color = burnoutColors[burnoutLevel] || "#10B981";

  return (
    <div
      className="rounded-2xl border-2 overflow-hidden transition-all"
      style={{
        background: "#0A0A0C",
        borderColor: `${color}25`,
        boxShadow: `0 0 20px ${color}08`,
      }}
    >
      {/* Header — always visible */}
      <div
        role="button"
        tabIndex={0}
        className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer"
        onClick={() => setExpanded(!expanded)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setExpanded(!expanded); }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${color}15` }}
          >
            <Heart size={16} style={{ color }} />
          </div>
          <div>
            <p
              className="text-[10px] font-black uppercase tracking-widest"
              style={{ color }}
            >
              AI Study Therapist
            </p>
            {data ? (
              <p className="flex items-center gap-1.5 text-[11px] text-white/40 mt-0.5">
                {burnoutIcon[burnoutLevel]}&nbsp;
                {burnoutLevel === "none"
                  ? "You're on fire!"
                  : burnoutLevel === "low"
                  ? "Slight fatigue detected"
                  : burnoutLevel === "moderate"
                  ? "Moderate burnout detected"
                  : burnoutLevel === "high"
                  ? "High burnout — rest recommended"
                  : "Critical burnout — take a break!"}
              </p>
            ) : (
              <p className="text-[11px] text-white/30 mt-0.5">
                {loading ? "Consulting therapist…" : "Click to get motivation"}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!fetched && !loading && (
            <button
              onClick={(e) => { e.stopPropagation(); fetchMotivation(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-white"
              style={{ background: `${color}20`, color }}
            >
              <Sparkles size={11} /> Energize
            </button>
          )}
          {loading && <RefreshCw size={14} className="animate-spin text-white/30" />}
          {expanded ? (
            <ChevronUp size={16} className="text-white/20" />
          ) : (
            <ChevronDown size={16} className="text-white/20" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && data && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-white/5">
              {/* Motivational Message */}
              <div
                className="mt-4 p-4 rounded-2xl border"
                style={{
                  background: `${color}08`,
                  borderColor: `${color}20`,
                }}
              >
                <p className="text-sm text-white/80 leading-relaxed font-medium">
                  "{data.motivationalMessage}"
                </p>
              </div>

              {/* Daily Goal */}
              <div className="flex items-center gap-3 p-3 rounded-xl border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                <Zap size={14} style={{ color: "#FBBF24" }} className="shrink-0" />
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-0.5">Today's Mission</p>
                  <p className="text-xs font-bold text-white/70">{data.dailyGoal}</p>
                </div>
              </div>

              {/* Break Recommendation */}
              {data.breakRecommendation?.shouldTakeBreak && (
                <div
                  className="flex items-center gap-3 p-3 rounded-xl border"
                  style={{ background: "rgba(251,191,36,0.08)", borderColor: "rgba(251,191,36,0.2)" }}
                >
                  <Coffee size={14} style={{ color: "#FBBF24" }} className="shrink-0" />
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-yellow-400/60 mb-0.5">
                      Break Suggested — {data.breakRecommendation.breakDuration}m
                    </p>
                    <p className="text-xs text-white/50">{data.breakRecommendation.activity}</p>
                  </div>
                </div>
              )}

              {/* Action Suggestions */}
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">
                  Power Moves
                </p>
                <div className="space-y-2">
                  {(data.actionSuggestions || []).map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl border border-white/5 text-xs text-white/50"
                      style={{ background: "rgba(255,255,255,0.02)" }}
                    >
                      <ChevronRight size={12} style={{ color }} className="shrink-0" />
                      {s}
                    </div>
                  ))}
                </div>
              </div>

              {/* Refresh */}
              <button
                onClick={fetchMotivation}
                disabled={loading}
                className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest transition-colors disabled:opacity-40"
                style={{ color }}
              >
                <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
                Refresh Analysis
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
