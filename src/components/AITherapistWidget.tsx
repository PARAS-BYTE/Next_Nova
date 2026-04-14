"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, Brain, Zap, Coffee, RefreshCw, ChevronRight,
  Flame, ChevronDown, ChevronUp, Sparkles, AlertTriangle,
  Smile, Meh, Frown, Skull, CheckCircle
} from "lucide-react";
import { palette } from "@/theme/palette";

/* ── STRICT COLOR MAP ── */
const burnoutColors: Record<string, string> = {
  none: "#1E4D3B",
  low: "#000000",
  moderate: "#1E4D3B",
  high: "#000000",
  critical: "#000000",
};

const burnoutIcon: Record<string, any> = {
  none: <CheckCircle className="w-4 h-4 text-emerald-700" />,
  low: <Smile className="w-4 h-4 text-black opacity-40" />,
  moderate: <Meh className="w-4 h-4 text-emerald-800" />,
  high: <Frown className="w-4 h-4 text-black opacity-60" />,
  critical: <Skull className="w-4 h-4 text-black" />,
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

  useEffect(() => {
    const timer = setTimeout(fetchMotivation, 2000);
    return () => clearTimeout(timer);
  }, []);

  const burnoutLevel = data?.burnoutLevel || "none";
  const accentColor = burnoutColors[burnoutLevel] || "#1E4D3B";

  return (
    <div
      className="rounded-3xl border transition-all duration-500 overflow-hidden bg-white shadow-sm hover:shadow-md"
      style={{
        borderColor: `${accentColor}20`,
      }}
    >
      {/* Header */}
      <div
        role="button"
        tabIndex={0}
        className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer transition-colors hover:bg-slate-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100"
            style={{ background: `${accentColor}08` }}
          >
            <Heart size={18} style={{ color: accentColor }} />
          </div>
          <div>
            <p
              className="text-[10px] font-black uppercase tracking-[0.2em] mb-0.5"
              style={{ color: accentColor }}
            >
              AI Performance Lab
            </p>
            {data ? (
              <p className="flex items-center gap-2 text-xs font-bold text-black opacity-40">
                {burnoutIcon[burnoutLevel]}
                {burnoutLevel.toUpperCase()} LEVEL DETECTED
              </p>
            ) : (
              <p className="text-xs font-bold text-slate-300">
                {loading ? "Analyzing biometric data…" : "Click for AI consultation"}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {!fetched && !loading && (
            <button
              onClick={(e) => { e.stopPropagation(); fetchMotivation(); }}
              className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-black text-white hover:bg-[#1E4D3B] transition-all"
            >
              Consult
            </button>
          )}
          {loading && <RefreshCw size={14} className="animate-spin text-slate-300" />}
          {expanded ? (
            <ChevronUp size={16} className="text-slate-300" />
          ) : (
            <ChevronDown size={16} className="text-slate-300" />
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
            className="overflow-hidden border-t border-slate-50 bg-slate-50/10"
          >
            <div className="px-6 pb-6 space-y-6 pt-2">
              {/* Message */}
              <div
                className="p-5 rounded-2xl border bg-white"
                style={{
                  borderColor: `${accentColor}10`,
                }}
              >
                <p className="text-sm text-black/70 leading-relaxed font-bold italic">
                  "{data.motivationalMessage}"
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                 {/* Daily Goal */}
                 <div className="flex items-center gap-3 p-4 rounded-3xl border border-slate-100 bg-white">
                   <Zap size={16} className="text-[#1E4D3B] shrink-0" />
                   <div>
                     <p className="text-[9px] font-black uppercase tracking-widest text-[#1E4D3B] mb-0.5">Primary Target</p>
                     <p className="text-xs font-bold text-black opacity-70">{data.dailyGoal}</p>
                   </div>
                 </div>

                 {/* Recommendation */}
                 {data.breakRecommendation?.shouldTakeBreak && (
                   <div
                     className="flex items-center gap-3 p-4 rounded-3xl border bg-black text-white"
                   >
                     <Coffee size={16} className="text-white shrink-0 opacity-50" />
                     <div>
                       <p className="text-[9px] font-black uppercase tracking-widest text-[#1E4D3B] mb-0.5">
                         Break Required — {data.breakRecommendation.breakDuration}m
                       </p>
                       <p className="text-xs font-bold">{data.breakRecommendation.activity}</p>
                     </div>
                   </div>
                 )}
              </div>

              {/* Action Suggestions */}
              <div className="space-y-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  Optimization Directives
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(data.actionSuggestions || []).map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 text-xs font-bold text-black/50 bg-white hover:border-[#1E4D3B]/20 transition-all"
                    >
                      <ChevronRight size={14} className="text-[#1E4D3B]" />
                      {s}
                    </div>
                  ))}
                </div>
              </div>

              {/* Refresh */}
              <button
                onClick={fetchMotivation}
                disabled={loading}
                className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest transition-colors disabled:opacity-40 hover:text-black mt-2"
                style={{ color: accentColor }}
              >
                <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
                Re-Analyze Biometrics
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
