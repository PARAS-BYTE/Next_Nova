"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Sparkles, Plus, RefreshCw, Check, X,
  RotateCcw, ChevronLeft, ChevronRight, Brain, Flame,
  Clock, Trophy, Filter, Star, Zap
} from "lucide-react";
import { toast } from "sonner";

const C = { purple: "#7C6AFA", cyan: "#22D3EE", green: "#10B981", red: "#EF4444", yellow: "#FBBF24", bg: "#050507", card: "#0A0A0C" };

// ─── SM-2 Quality ratings
const QUALITY_LABELS = [
  { q: 0, label: "Blackout", color: C.red, desc: "Complete forgot" },
  { q: 1, label: "Wrong", color: "#F97316", desc: "Wrong, close" },
  { q: 2, label: "Hard", color: C.yellow, desc: "Correct with effort" },
  { q: 3, label: "Good", color: C.cyan, desc: "Correct, some effort" },
  { q: 4, label: "Easy", color: C.green, desc: "Correct, easy" },
  { q: 5, label: "Perfect", color: C.purple, desc: "Instant recall" },
];

export default function Flashcards() {
  const [view, setView] = useState<"library" | "study" | "generate">("library");
  const [cards, setCards] = useState<any[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [dueCount, setDueCount] = useState(0);
  const [filterTopic, setFilterTopic] = useState("all");
  const [loading, setLoading] = useState(true);

  // Study session state
  const [studyCards, setStudyCards] = useState<any[]>([]);
  const [studyIndex, setStudyIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionResults, setSessionResults] = useState<any[]>([]);
  const [sessionDone, setSessionDone] = useState(false);

  // Generate state
  const [genTopic, setGenTopic] = useState("");
  const [genCount, setGenCount] = useState(10);
  const [generating, setGenerating] = useState(false);

  const fetchCards = async (filter = "all") => {
    setLoading(true);
    try {
      const param = filter === "all" ? "" : filter === "due" ? "due" : filter;
      const { data } = await axios.get(`/api/ai/flashcards?filter=${param}`, { withCredentials: true });
      setCards(data.flashcards || []);
      setTopics(data.topics || []);
      setDueCount((data.flashcards || []).filter((c: any) => new Date(c.nextReview) <= new Date()).length);
    } catch {
      toast.error("Failed to fetch flashcards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCards(); }, []);

  const startStudy = (onlyDue = false) => {
    const toStudy = onlyDue
      ? cards.filter((c) => new Date(c.nextReview) <= new Date())
      : filterTopic === "all" ? cards : cards.filter((c) => c.topic === filterTopic);
    if (!toStudy.length) { toast.warning("No cards to study!"); return; }
    setStudyCards(toStudy);
    setStudyIndex(0);
    setFlipped(false);
    setSessionResults([]);
    setSessionDone(false);
    setView("study");
  };

  const handleReview = async (quality: number) => {
    const currentCard = studyCards[studyIndex];
    try {
      await axios.put("/api/ai/flashcards/review", 
        { flashcardId: currentCard._id, quality }, 
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Review update failed:", err);
    }

    setSessionResults((p) => [...p, { card: currentCard, quality }]);

    if (studyIndex + 1 >= studyCards.length) {
      setSessionDone(true);
    } else {
      setStudyIndex((i) => i + 1);
      setFlipped(false);
    }
  };

  const generateCards = async () => {
    if (!genTopic.trim()) { toast.error("Enter a topic!"); return; }
    setGenerating(true);
    try {
      const { data } = await axios.post("/api/ai/flashcards", { topic: genTopic, count: genCount }, { withCredentials: true });
      toast.success(`Generated ${data.count} flashcards for "${data.topic}"!`);
      fetchCards();
      setView("library");
    } catch {
      toast.error("Failed to generate flashcards");
    } finally {
      setGenerating(false);
    }
  };

  const goodResults = sessionResults.filter((r) => r.quality >= 3).length;
  const currentCard = studyCards[studyIndex];

  return (
    <div className="min-h-screen" style={{ background: C.bg, color: "#fff" }}>

      {/* ── STUDY VIEW ──────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {view === "study" && (
          <motion.div key="study" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center p-6 gap-8">

            {sessionDone ? (
              /* ── Session Complete ── */
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-6 max-w-sm">
                <Trophy size={64} className="mx-auto" style={{ color: C.yellow, filter: `drop-shadow(0 0 20px ${C.yellow}80)` }} />
                <h2 className="text-3xl font-black uppercase tracking-tight">Session Complete!</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 rounded-2xl border border-white/5 text-center" style={{ background: C.card }}>
                    <p className="text-xl font-black text-white">{sessionResults.length}</p>
                    <p className="text-[9px] uppercase font-black tracking-widest text-white/30 mt-1">Reviewed</p>
                  </div>
                  <div className="p-3 rounded-2xl border border-white/5 text-center" style={{ background: C.card }}>
                    <p className="text-xl font-black" style={{ color: C.green }}>{goodResults}</p>
                    <p className="text-[9px] uppercase font-black tracking-widest text-white/30 mt-1">Correct</p>
                  </div>
                  <div className="p-3 rounded-2xl border border-white/5 text-center" style={{ background: C.card }}>
                    <p className="text-xl font-black" style={{ color: C.red }}>{sessionResults.length - goodResults}</p>
                    <p className="text-[9px] uppercase font-black tracking-widest text-white/30 mt-1">Missed</p>
                  </div>
                </div>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => { fetchCards(); setView("library"); }}
                    className="px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-white"
                    style={{ background: `linear-gradient(135deg, ${C.purple}, #5D4AD4)` }}>
                    Back to Library
                  </button>
                  <button onClick={() => { setStudyIndex(0); setFlipped(false); setSessionResults([]); setSessionDone(false); }}
                    className="px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-white border border-white/10">
                    Study Again
                  </button>
                </div>
              </motion.div>
            ) : (
              <>
                {/* Progress */}
                <div className="w-full max-w-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{filterTopic !== "all" ? filterTopic : "All Topics"}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{studyIndex + 1} / {studyCards.length}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <motion.div animate={{ width: `${((studyIndex + 1) / studyCards.length) * 100}%` }}
                      className="h-full rounded-full" style={{ background: C.purple }} />
                  </div>
                </div>

                {/* Card */}
                <motion.div className="w-full max-w-xl cursor-pointer" onClick={() => setFlipped(!flipped)} style={{ perspective: "1200px" }}>
                  <motion.div animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.5, type: "spring" }}
                    style={{ transformStyle: "preserve-3d", position: "relative", minHeight: "280px" }}>
                    {/* Front */}
                    <div className="absolute inset-0 rounded-3xl border-2 flex flex-col items-center justify-center p-8 text-center overflow-y-auto"
                      style={{ background: C.card, borderColor: `${C.purple}30`, backfaceVisibility: "hidden" }}>
                      <div className="px-3 py-1 rounded-xl mb-4 text-[9px] font-black uppercase tracking-widest" style={{ background: `${C.purple}20`, color: C.purple }}>
                        {currentCard?.topic || "General"}
                      </div>
                      <p className="text-lg font-bold text-white leading-relaxed">{currentCard?.front}</p>
                      <p className="text-[10px] text-white/20 mt-4 font-black uppercase tracking-widest shrink-0">Tap to Reveal</p>
                    </div>
                    {/* Back */}
                    <div className="absolute inset-0 rounded-3xl border-2 flex flex-col items-center justify-center p-8 text-center overflow-y-auto"
                      style={{ background: `${C.card}`, borderColor: `${C.green}30`, backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                      <p className="text-sm font-medium text-white/80 leading-relaxed italic mb-4">The Answer Is:</p>
                      <p className="text-base font-bold text-white leading-relaxed">{currentCard?.back}</p>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Rating (only when flipped) */}
                <AnimatePresence>
                  {flipped && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="w-full max-w-xl">
                      <p className="text-center text-[9px] font-black uppercase tracking-widest text-white/30 mb-3">How well did you recall?</p>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {QUALITY_LABELS.map(({ q, label, color, desc }) => (
                          <button key={q} onClick={() => handleReview(q)}
                            className="p-3 rounded-2xl border-2 text-center transition-all hover:scale-105 active:scale-95"
                            style={{ borderColor: `${color}40`, background: `${color}15` }}>
                            <p className="text-sm font-black" style={{ color }}>{label}</p>
                            <p className="text-[8px] text-white/30 mt-0.5">{desc}</p>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Skip */}
                <button onClick={() => setView("library")} className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">
                  Exit Session
                </button>
              </>
            )}
          </motion.div>
        )}

        {/* ── GENERATE VIEW ─────────────────────────────────────── */}
        {view === "generate" && (
          <motion.div key="generate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="p-6 max-w-lg mx-auto space-y-6 pt-12">
            <div>
              <button onClick={() => setView("library")} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors mb-6">
                <ChevronLeft size={14} /> Back
              </button>
              <h2 className="text-2xl font-black uppercase tracking-tight text-white">Generate Flashcards</h2>
              <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mt-1">AI will create spaced-repetition cards for you</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-white/30 block mb-2">Topic</label>
                <input value={genTopic} onChange={(e) => setGenTopic(e.target.value)}
                  placeholder="e.g. React Hooks, Calculus, World War 2..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#7C6AFA] transition-colors" />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-white/30 block mb-2">Number of Cards ({genCount})</label>
                <input type="range" min={5} max={30} value={genCount} onChange={(e) => setGenCount(Number(e.target.value))}
                  className="w-full accent-[#7C6AFA]" />
                <div className="flex justify-between text-[9px] text-white/20 font-black uppercase">
                  <span>5</span><span>30</span>
                </div>
              </div>
              <button onClick={generateCards} disabled={generating}
                className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-white shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, ${C.purple}, #5D4AD4)`, boxShadow: `0 8px 30px ${C.purple}50` }}>
                {generating ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw size={16} className="animate-spin" /> Summoning Cards...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2"><Sparkles size={16} /> Generate {genCount} Cards</span>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* ── LIBRARY VIEW ────────────────────────────────────────── */}
        {view === "library" && (
          <motion.div key="library" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="p-4 sm:p-6 lg:p-8 space-y-6">

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter" style={{ background: `linear-gradient(135deg, ${C.purple}, ${C.cyan})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Scroll Vault
                </h1>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-1">Spaced Repetition Flashcards</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setView("generate")}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest text-white"
                  style={{ background: `${C.purple}20`, border: `1px solid ${C.purple}40`, color: C.purple }}>
                  <Sparkles size={14} /> Generate
                </button>
                {dueCount > 0 && (
                  <button onClick={() => startStudy(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest text-white shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${C.green}, #059669)` }}>
                    <Flame size={14} /> Study Due ({dueCount})
                  </button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Total Cards", value: cards.length, color: C.purple },
                { label: "Due Today", value: dueCount, color: dueCount > 0 ? C.yellow : C.green },
                { label: "Topics", value: topics.length, color: C.cyan },
              ].map(({ label, value, color }) => (
                <div key={label} className="p-4 rounded-2xl border-2 text-center" style={{ background: C.card, borderColor: `${color}20` }}>
                  <p className="text-2xl font-black" style={{ color }}>{value}</p>
                  <p className="text-[9px] uppercase font-black tracking-widest text-white/30 mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* Filter + Study */}
            {cards.length > 0 && (
              <div className="flex flex-wrap gap-3 items-center">
                <select value={filterTopic} onChange={(e) => setFilterTopic(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-[#7C6AFA] cursor-pointer">
                  <option value="all">All Topics</option>
                  {topics.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <button onClick={() => startStudy(false)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest text-white"
                  style={{ background: `linear-gradient(135deg, ${C.purple}, #5D4AD4)` }}>
                  <Brain size={14} /> Study {filterTopic !== "all" ? filterTopic : "All"}
                </button>
              </div>
            )}

            {/* Cards Grid */}
            {loading ? (
              <div className="text-center py-20">
                <RefreshCw className="animate-spin mx-auto mb-4 text-[#7C6AFA]" size={32} />
                <p className="text-[10px] uppercase font-black tracking-widest text-white/30">Loading scrolls...</p>
              </div>
            ) : cards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-6">
                <BookOpen size={48} className="opacity-20" />
                <p className="text-xs font-black uppercase tracking-widest text-white/30">No scrolls yet. Generate your first flashcards!</p>
                <button onClick={() => setView("generate")}
                  className="px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-white"
                  style={{ background: `linear-gradient(135deg, ${C.purple}, #5D4AD4)` }}>
                  <Sparkles className="inline mr-2" size={14} />Generate Cards
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.filter((c) => filterTopic === "all" || c.topic === filterTopic).map((c, i) => {
                  const isDue = new Date(c.nextReview) <= new Date();
                  return (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      className="p-5 rounded-2xl border-2 space-y-3 cursor-pointer hover:scale-[1.01] transition-transform"
                      style={{ background: C.card, borderColor: isDue ? `${C.yellow}30` : "rgba(255,255,255,0.08)" }}>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg" style={{ background: `${C.purple}20`, color: C.purple }}>{c.topic}</span>
                        {isDue && <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg" style={{ background: `${C.yellow}20`, color: C.yellow }}>Due</span>}
                      </div>
                      <p className="text-sm font-bold text-white leading-snug line-clamp-2">{c.front}</p>
                      <div className="border-t border-white/5 pt-3">
                        <p className="text-xs text-white/30 line-clamp-2">{c.back}</p>
                      </div>
                      <div className="flex items-center gap-3 text-[9px] text-white/20 font-black uppercase">
                        <span>Rep {c.repetitions}</span>
                        <span>·</span>
                        <span>EF {Number(c.easeFactor).toFixed(1)}</span>
                        <span>·</span>
                        <span>+{c.interval}d</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
