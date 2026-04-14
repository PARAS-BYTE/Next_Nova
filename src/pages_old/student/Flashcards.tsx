"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Sparkles, Plus, RefreshCw, Check, X,
  RotateCcw, ChevronLeft, ChevronRight, Brain, Flame,
  Clock, Trophy, Filter, Star, Zap, CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { useGameStore } from "@/game/useGameStore";

const C = { 
  primary: "#1E4D3B", 
  black: "#000000", 
  white: "#FFFFFF", 
  slate: "#F8FAFC", 
  bg: "#FFFFFF", 
  card: "#FFFFFF",
  error: "#000000",
  success: "#1E4D3B"
};

// ─── SM-2 Quality ratings
const QUALITY_LABELS = [
  { q: 0, label: "Blackout", color: "#000000", desc: "Forgot" },
  { q: 1, label: "Wrong", color: "#000000", desc: "Close" },
  { q: 2, label: "Hard", color: "#000000", desc: "Effort" },
  { q: 3, label: "Good", color: "#1E4D3B", desc: "Solid" },
  { q: 4, label: "Easy", color: "#1E4D3B", desc: "Natural" },
  { q: 5, label: "Perfect", color: "#1E4D3B", desc: "Instant" },
];

export default function Flashcards() {
  const { addXP, addCoins } = useGameStore();
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
      // Award collective XP for session
      const gainedXP = studyCards.length * 10;
      const accurateCount = sessionResults.filter(r => r.quality >= 3).length + (quality >= 3 ? 1 : 0);
      const acc = (accurateCount / studyCards.length) * 100;
      const bonusCoins = Math.floor(acc / 2);

      addXP(gainedXP, "Neural Archival");
      if (bonusCoins > 0) addCoins(bonusCoins);
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
    <div className="min-h-screen" style={{ background: C.bg, color: "#000" }}>

      {/* ── STUDY VIEW ──────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {view === "study" && (
          <motion.div key="study" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center p-6 gap-8">

            {sessionDone ? (
              /* ── Session Complete ── */
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-6 max-w-sm rounded-3xl p-8 border-2 border-slate-50 bg-white shadow-xl">
                <Trophy size={64} className="mx-auto text-[#1E4D3B]" />
                <h2 className="text-3xl font-black uppercase tracking-tight">Session Complete!</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 rounded-2xl border border-slate-100 text-center bg-slate-50">
                    <p className="text-xl font-black text-black">{sessionResults.length}</p>
                    <p className="text-[9px] uppercase font-black tracking-widest text-black/40 mt-1">Reviewed</p>
                  </div>
                  <div className="p-3 rounded-2xl border border-slate-100 text-center bg-[#F0FDF4]">
                    <p className="text-xl font-black text-[#1E4D3B]">{goodResults}</p>
                    <p className="text-[9px] uppercase font-black tracking-widest text-[#1E4D3B]/60 mt-1">Correct</p>
                  </div>
                  <div className="p-3 rounded-2xl border border-slate-100 text-center bg-slate-50">
                    <p className="text-xl font-black text-black">{sessionResults.length - goodResults}</p>
                    <p className="text-[9px] uppercase font-black tracking-widest text-black/40 mt-1">Missed</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 justify-center">
                  <button onClick={() => { fetchCards(); setView("library"); }}
                    className="h-12 rounded-xl font-black text-[10px] uppercase tracking-widest text-white bg-[#1E4D3B] hover:bg-black transition-all">
                    Back to Library
                  </button>
                  <button onClick={() => { setStudyIndex(0); setFlipped(false); setSessionResults([]); setSessionDone(false); }}
                    className="h-12 rounded-xl font-black text-[10px] uppercase tracking-widest text-black border-2 border-slate-100 hover:bg-slate-50 transition-all">
                    Study Again
                  </button>
                </div>
              </motion.div>
            ) : (
              <>
                {/* Progress */}
                <div className="w-full max-w-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#1E4D3B]">{filterTopic !== "all" ? filterTopic : "All Topics"}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-black/40">{studyIndex + 1} / {studyCards.length}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <motion.div animate={{ width: `${((studyIndex + 1) / studyCards.length) * 100}%` }}
                      className="h-full rounded-full bg-[#1E4D3B]" />
                  </div>
                </div>

                {/* Card */}
                <motion.div className="w-full max-w-xl cursor-pointer" onClick={() => setFlipped(!flipped)} style={{ perspective: "1200px" }}>
                  <motion.div animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.5, type: "spring" }}
                    style={{ transformStyle: "preserve-3d", position: "relative", minHeight: "280px" }}>
                    {/* Front */}
                    <div className="absolute inset-0 rounded-3xl border-2 flex flex-col items-center justify-center p-8 text-center bg-white"
                      style={{ borderColor: 'rgba(30, 77, 59, 0.1)', backfaceVisibility: "hidden" }}>
                      <div className="px-3 py-1 rounded-xl mb-4 text-[9px] font-black uppercase tracking-widest bg-[#F0FDF4] text-[#1E4D3B]">
                        {currentCard?.topic || "General"}
                      </div>
                      <p className="text-lg font-bold text-black leading-relaxed">{currentCard?.front}</p>
                      <p className="text-[10px] text-black/20 mt-4 font-black uppercase tracking-widest shrink-0">Tap to Reveal</p>
                    </div>
                    {/* Back */}
                    <div className="absolute inset-0 rounded-3xl border-2 flex flex-col items-center justify-center p-8 text-center bg-black"
                      style={{ borderColor: '#000', backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                      <p className="text-sm font-medium text-white/40 leading-relaxed italic mb-4">The Answer Is:</p>
                      <p className="text-base font-bold text-white leading-relaxed">{currentCard?.back}</p>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Rating (only when flipped) */}
                <AnimatePresence>
                  {flipped && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="w-full max-w-xl">
                      <p className="text-center text-[9px] font-black uppercase tracking-widest text-black/30 mb-3">How well did you recall?</p>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {QUALITY_LABELS.map(({ q, label, color, desc }) => (
                          <button key={q} onClick={() => handleReview(q)}
                            className="p-3 rounded-2xl border-2 text-center transition-all hover:scale-105 active:scale-95 bg-white shadow-sm"
                            style={{ borderColor: q >= 3 ? 'rgba(30, 77, 59, 0.2)' : 'rgba(0,0,0,0.03)' }}>
                            <p className="text-xs font-black uppercase" style={{ color }}>{label}</p>
                            <p className="text-[8px] text-black/30 mt-0.5 uppercase font-bold">{desc}</p>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Skip */}
                <button onClick={() => setView("library")} className="text-[10px] font-black uppercase tracking-widest text-black/20 hover:text-black transition-colors">
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
              <button onClick={() => setView("library")} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black/30 hover:text-black transition-colors mb-6">
                <ChevronLeft size={14} /> Back
              </button>
              <h2 className="text-2xl font-black uppercase tracking-tight text-black">Generate Flashcards</h2>
              <p className="text-[10px] text-black/30 uppercase font-black tracking-widest mt-1">AI will create spaced-repetition cards for you</p>
            </div>
            <div className="space-y-4 p-8 rounded-3xl border-2 border-slate-50 bg-white">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-[#1E4D3B] block">Topic</label>
                <input value={genTopic} onChange={(e) => setGenTopic(e.target.value)}
                  placeholder="e.g. React Hooks, Calculus..."
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl px-4 py-3 text-sm text-black placeholder:text-slate-200 focus:outline-none focus:border-[#1E4D3B] transition-colors" />
              </div>
              <div className="space-y-1.5 pt-4">
                <label className="text-[9px] font-black uppercase tracking-widest text-[#1E4D3B] block">Number of Cards ({genCount})</label>
                <input type="range" min={5} max={30} value={genCount} onChange={(e) => setGenCount(Number(e.target.value))}
                  className="w-full accent-[#1E4D3B]" />
                <div className="flex justify-between text-[9px] text-black/20 font-black uppercase">
                  <span>5</span><span>30</span>
                </div>
              </div>
              <button onClick={generateCards} disabled={generating}
                className="w-full py-4 mt-6 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-xl bg-[#1E4D3B] hover:bg-black transition-all disabled:opacity-30">
                {generating ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw size={16} className="animate-spin" /> Summoning...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2"><Sparkles size={16} /> Generate Cards</span>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* ── LIBRARY VIEW ────────────────────────────────────────── */}
        {view === "library" && (
          <motion.div key="library" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="p-4 sm:p-6 lg:p-8 space-y-8">

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter text-black italic">
                   Flashcard Vault
                </h1>
                <p className="text-[10px] font-black uppercase tracking-widest text-black/30 mt-1">Spaced Repetition Archival</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setView("generate")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest text-black border-2 border-slate-100 hover:bg-slate-50 transition-all">
                  <Sparkles size={14} className="text-[#1E4D3B]" /> Generate
                </button>
                {dueCount > 0 && (
                  <button onClick={() => startStudy(true)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest text-white bg-[#1E4D3B] hover:bg-black transition-all shadow-lg">
                    <Flame size={14} /> Study Due ({dueCount})
                  </button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: "Total Cards", value: cards.length, color: "#000000", icon: BookOpen },
                { label: "Due Today", value: dueCount, color: "#1E4D3B", icon: Clock },
                { label: "Neural Topics", value: topics.length, color: "#1E4D3B", icon: Brain },
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} className="p-6 rounded-2xl border-2 bg-white shadow-sm transition-all hover:shadow-lg" style={{ borderColor: 'rgba(0,0,0,0.03)' }}>
                  <div className="flex items-center justify-between mb-2">
                     <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-black/20"><Icon size={20} /></div>
                     <p className="text-2xl font-black" style={{ color }}>{value}</p>
                  </div>
                  <p className="text-[9px] uppercase font-black tracking-widest text-black/30">{label}</p>
                </div>
              ))}
            </div>

            {/* Filter + Study */}
            {cards.length > 0 && (
              <div className="flex flex-wrap gap-3 items-center bg-slate-50 p-4 rounded-2xl">
                <select value={filterTopic} onChange={(e) => setFilterTopic(e.target.value)}
                  className="bg-white border-2 border-transparent rounded-xl px-4 h-11 text-[10px] font-black uppercase tracking-widest text-black focus:outline-none focus:border-[#1E4D3B] cursor-pointer shadow-sm">
                  <option value="all">All Topics</option>
                  {topics.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <button onClick={() => startStudy(false)}
                  className="flex items-center gap-3 px-6 h-11 rounded-xl font-black text-[10px] uppercase tracking-widest text-white bg-black hover:bg-[#1E4D3B] transition-all">
                  <Brain size={16} /> Study {filterTopic !== "all" ? filterTopic : "All"}
                </button>
              </div>
            )}

            {/* Cards Grid */}
            {loading ? (
              <div className="text-center py-20">
                <RefreshCw className="animate-spin mx-auto mb-4 text-[#1E4D3B]" size={32} />
                <p className="text-[10px] uppercase font-black tracking-widest text-black/30">Retrieving files...</p>
              </div>
            ) : cards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <BookOpen size={48} className="text-slate-200" />
                <p className="text-[10px] font-black uppercase tracking-widest text-black/30">No flashcards found. Create your first set!</p>
                <button onClick={() => setView("generate")}
                  className="h-11 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest text-white bg-black hover:bg-[#1E4D3B] transition-all">
                  Initialize Summoning
                </button>
              </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.filter((c) => filterTopic === "all" || c.topic === filterTopic).map((c, i) => {
                  const isDue = new Date(c.nextReview) <= new Date();
                  return (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                      className="p-6 rounded-2xl border-2 space-y-4 cursor-pointer hover:bg-slate-50 transition-all shadow-sm"
                      style={{ background: 'white', borderColor: isDue ? 'rgba(30, 77, 59, 0.2)' : 'rgba(0,0,0,0.03)' }}>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-lg bg-[#F0FDF4] text-[#1E4D3B]">{c.topic}</span>
                        {isDue && <span className="text-[9px] font-black uppercase tracking-widest text-[#1E4D3B] animate-pulse italic">Sync Due</span>}
                      </div>
                      <p className="text-sm font-black text-black leading-snug line-clamp-2">{c.front}</p>
                      <div className="border-t border-slate-50 pt-4">
                        <p className="text-xs font-bold text-black/30 line-clamp-2 italic">{c.back}</p>
                      </div>
                      <div className="flex items-center gap-4 text-[9px] text-black/20 font-black uppercase tracking-widest pt-2">
                        <span className="flex items-center gap-1.5"><RefreshCw size={12} /> {c.repetitions}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1.5"><Zap size={12} className="text-[#1E4D3B]" /> {Number(c.easeFactor).toFixed(1)}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1.5"><Clock size={12} /> +{c.interval}D</span>
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
