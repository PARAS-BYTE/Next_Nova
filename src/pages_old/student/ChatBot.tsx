"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Bot, User, Loader2, X, Copy, Check, Sparkles, AlertCircle,
  Lightbulb, Brain, BookOpen, Zap, Target, Trophy, ChevronRight,
  MessageSquare, Trash2, RotateCcw, Flame, Award, Star,
  GraduationCap, HelpCircle, FileQuestion, Map, BarChart3,
  Search, PanelLeftOpen, PanelLeftClose, MoreVertical, Settings
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { palette as themePalette } from "@/theme/palette";
import { toast } from "sonner";
import axios from "axios";
import TutorSettings from "@/components/ui/TutorSettings";

/* ── Quick Action Chips ── */
const QUICK_ACTIONS = [
  { label: "Explain simpler", icon: "💡", message: "Explain that again in simpler terms" },
  { label: "Give example", icon: "📝", message: "Give me another example" },
  { label: "Quick quiz", icon: "🎯", message: "Test me on what we just discussed" },
  { label: "Summarize", icon: "📋", message: "Summarize this topic briefly" },
];

const STARTER_PROMPTS = [
  { label: "Get a hint for recursion", icon: HelpCircle, color: "#10b981" },
  { label: "Explain pointers simply", icon: Brain, color: "#34d399" },
  { label: "I'm struggling with math", icon: AlertCircle, color: "#059669" },
  { label: "Summarize React Hooks", icon: BookOpen, color: "#10b981" },
  { label: "Generate a quiz on Arrays", icon: Target, color: "#047857" },
  { label: "Create a roadmap for Python", icon: Map, color: "#10b981" },
];

/* ── Hint Panel Component ── */
function HintPanel({ onClose }: { onClose: () => void }) {
  const [question, setQuestion] = useState("");
  const [step, setStep] = useState(1);
  const [hint, setHint] = useState("");
  const [loading, setLoading] = useState(false);

  const getHint = async () => {
    if (!question.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post("/api/chatbot/hint", { question, step }, { withCredentials: true });
      setHint(res.data.hint);
    } catch { setHint("Failed to generate hint. Try again."); }
    finally { setLoading(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-2xl p-6 mb-6 border border-emerald-500/20 shadow-xl shadow-emerald-500/10"
      style={{ background: "rgba(16, 185, 129, 0.05)" }}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <Lightbulb className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="font-bold text-zinc-900 text-base">Nova Smart Hints</h3>
        </div>
        <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors rounded-lg hover:bg-zinc-100"><X className="w-4 h-4" /></button>
      </div>

      <Input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="What are you working on? Paste your question here..."
        className="mb-4 bg-white border-zinc-200 text-zinc-900 text-sm rounded-xl h-11 placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
      />

      <div className="flex items-center gap-2 mb-4">
        {[1, 2, 3].map(s => (
          <button
            key={s}
            onClick={() => { setStep(s); setHint(""); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${step === s ? "text-white bg-emerald-600 border-emerald-600 shadow-md" : "text-zinc-500 bg-white border-zinc-200 hover:bg-zinc-50"} border`}
          >
            {s === 1 ? "Small Clue" : s === 2 ? "Partial Step" : "Full Solution"}
          </button>
        ))}
      </div>

      <Button onClick={getHint} disabled={loading || !question.trim()} className="w-full h-11 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg shadow-emerald-500/20 border-0">
        {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
        Generate Hint
      </Button>

      {hint && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 rounded-xl text-sm text-zinc-700 leading-relaxed bg-white border border-zinc-100 shadow-sm">
          {hint}
        </motion.div>
      )}
    </motion.div>
  );
}

/* ── Daily Challenge Widget ── */
function DailyChallengeWidget() {
  const [challenge, setChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const fetchChallenge = async () => {
    setLoading(true);
    setResult(null);
    setSelected(null);
    try {
      const res = await axios.get("/api/chatbot/daily-challenge", { withCredentials: true });
      setChallenge(res.data.challenge);
    } catch { toast.error("Failed to load challenge"); }
    finally { setLoading(false); }
  };

  const submitAnswer = async () => {
    if (!selected || !challenge) return;
    try {
      const res = await axios.post("/api/chatbot/daily-challenge/complete", {
        answer: selected,
        correctAnswer: challenge.correctAnswer,
        difficulty: challenge.difficulty,
      }, { withCredentials: true });
      setResult(res.data);
      if (res.data.isCorrect) toast.success(`+${res.data.xpGained} XP earned!`);
      else toast.error("Wrong answer! Keep learning.");
    } catch { toast.error("Failed to submit answer"); }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl p-5 border border-emerald-500/20 shadow-xl shadow-emerald-500/5 overflow-hidden relative"
      style={{ background: "rgba(16, 185, 129, 0.05)" }}
    >
      <div className="absolute top-0 right-0 p-8 bg-emerald-500/10 rounded-full -mr-10 -mt-10 blur-2xl opacity-20" />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10">
            <Trophy className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="font-bold text-zinc-900 text-sm">Daily Quest</h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">35 XP</span>
        </div>
        <Button onClick={fetchChallenge} size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100">
          {loading ? <Loader2 className="animate-spin w-3 h-3" /> : <RotateCcw className="w-3 h-3" />}
        </Button>
      </div>

      {!challenge ? (
        <Button onClick={fetchChallenge} className="w-full h-11 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-lg shadow-emerald-500/20">
          Unlock Today's Challenge
        </Button>
      ) : (
        <div className="relative z-10">
          <p className="text-sm text-zinc-700 mb-4 leading-relaxed">{challenge.question}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            {(challenge.options || []).map((opt: string) => (
              <button
                key={opt}
                onClick={() => !result && setSelected(opt)}
                disabled={!!result}
                className={`p-3 rounded-xl text-xs font-semibold transition-all border text-left ${
                  result
                    ? opt === challenge.correctAnswer ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                      : opt === selected ? "border-rose-500 bg-rose-500/10 text-rose-600"
                      : "border-zinc-100 text-zinc-300"
                    : selected === opt ? "border-emerald-500 bg-emerald-500/10 text-zinc-900"
                      : "border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          {!result ? (
            <Button onClick={submitAnswer} disabled={!selected} className="w-full h-11 rounded-xl text-sm font-bold shadow-lg transition-all"
              style={{ 
                background: selected ? "linear-gradient(135deg, #10b981, #059669)" : "#f4f4f5", 
                color: selected ? "#fff" : "#a1a1aa",
                boxShadow: selected ? "0 4px 15px rgba(16, 185, 129, 0.3)" : "none"
              }}>
              Confirm Answer
            </Button>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl text-sm ${result.isCorrect ? "bg-emerald-50 border border-emerald-100 text-emerald-700" : "bg-rose-50 border border-rose-100 text-rose-700"}`}>
              <div className="flex items-center gap-2 mb-1">
                {result.isCorrect ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                <span className="font-bold">{result.isCorrect ? `Quest Complete! +${result.xpGained} XP` : "Incorrect Submission"}</span>
              </div>
              {!result.isCorrect && <p className="text-xs text-rose-600/70 mb-2">The correct answer was: {challenge.correctAnswer}</p>}
              {challenge.explanation && <p className="text-xs text-zinc-600 leading-relaxed font-medium bg-white/50 p-2 rounded-lg mt-2">{challenge.explanation}</p>}
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}

/* ── Topic Sidebar ── */
function TopicSidebar({ onSelectTopic, currentTopic }: { onSelectTopic: (t: string) => void; currentTopic: string }) {
  const [topics, setTopics] = useState<any[]>([]);
  
  useEffect(() => {
    axios.get("/api/chatbot/conversations", { withCredentials: true })
      .then(res => setTopics(res.data.topics || []))
      .catch(() => {});
  }, [currentTopic]);

  return (
    <div className="space-y-1.5 px-3 py-2">
      <button
        onClick={() => onSelectTopic("general")}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${currentTopic === "general" ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 shadow-sm" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 border border-transparent"}`}
      >
        <div className={`w-2 h-2 rounded-full ${currentTopic === "general" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" : "bg-zinc-200"}`} />
        General Lab
      </button>
      
      {topics.filter((t: any) => t.topic !== "general").map((t: any) => (
        <button
          key={t.topic}
          onClick={() => onSelectTopic(t.topic)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all truncate border ${currentTopic === t.topic ? "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 border-transparent"}`}
        >
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${currentTopic === t.topic ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.3)]" : "bg-zinc-200"}`} />
          <span className="truncate flex-1 text-left">{t.topic}</span>
          <span className="text-[9px] font-black opacity-30">{t.messageCount}</span>
        </button>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN CHATBOT COMPONENT
   ══════════════════════════════════════════════════════════════════ */
export default function ChatBot() {
  const [input, setInput] = useState("");
  const [currentTopic, setCurrentTopic] = useState("general");
  const [historyLoading, setHistoryLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<any>(null);
  const [showHints, setShowHints] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [progress, setProgress] = useState<any>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTopic = sessionStorage.getItem("nova_current_topic");
      if (savedTopic) setCurrentTopic(savedTopic);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("nova_current_topic", currentTopic);
  }, [currentTopic]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Load conversation history for current topic
  useEffect(() => {
    const loadHistory = async () => {
      setHistoryLoading(true);
      try {
        const res = await axios.get(`/api/chatbot/history?topic=${currentTopic}`, { withCredentials: true });
        if (res.data.messages?.length) {
          const loadedMsgs = res.data.messages.map((m: any, i: number) => ({
            role: m.role === "user" ? "user" : "model",
            content: m.content,
            id: m._id || Date.now() + i,
            time: new Date(m.timestamp),
            emotionsDetected: m.emotionsDetected,
          }));
          setMessages(loadedMsgs);
        } else {
          setMessages([]);
        }
      } catch (err) { 
        console.error("History fetch error", err);
      }
      finally { setHistoryLoading(false); }
    };
    loadHistory();
  }, [currentTopic]);

  // Load progress data
  useEffect(() => {
    axios.get("/api/chatbot/progress", { withCredentials: true })
      .then(res => setProgress(res.data.dashboard))
      .catch(() => {});
  }, []);

  const sendMsg = async (e: React.FormEvent | null, overrideMsg?: string) => {
    if (e) e.preventDefault();
    const msgText = overrideMsg || input;
    if (!msgText.trim() || loading) return;

    const userMsg = { role: "user", content: msgText, id: "temp-" + Date.now(), time: new Date() };
    setMessages((p) => [...p, userMsg]);
    if (!overrideMsg) setInput("");
    setLoading(true);

    try {
      const response = await axios.post(
        "/api/chatbot/smart-chat",
        { message: msgText, topic: currentTopic },
        { withCredentials: true }
      );

      const reply = response.data.reply;
      const emotionDetected = response.data.emotionDetected;
      const emotionAdjusted = response.data.emotionAdjusted;
      const xpGained = response.data.xpGained || 0;
      const newTotalXp = response.data.newTotalXp;

      setMessages((p) => [...p, {
        role: "model",
        content: reply,
        id: Date.now() + 1,
        time: new Date(),
        emotionDetected,
        emotionAdjusted,
        xpGained,
      }]);

      if (xpGained > 0) {
        toast.success(`+${xpGained} XP`, { description: "Knowledge points earned!" });
        if (newTotalXp !== undefined) {
          setProgress((prev: any) => prev ? ({ ...prev, xp: newTotalXp }) : prev);
        }
      }

    } catch (err: any) {
      const backendReply = err?.response?.data?.reply || err?.response?.data?.message || err?.message;
      setMessages((p) => [...p, {
        role: "model",
        content: backendReply || "⚠️ Neural link unstable. Recalibrating...",
        id: Date.now() + 1,
        time: new Date(),
        isError: true,
      }]);
      toast.error("NovaAI Connection Interrupted");
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    if (!confirm("Clear this conversation history?")) return;
    setMessages([]);
    try {
      await axios.post("/api/chatbot/clear", { topic: currentTopic }, { withCredentials: true });
      toast.success("History purged.");
    } catch { /* ignore */ }
  };

  const handleTopicChange = (topic: string) => {
    setCurrentTopic(topic);
    if (window.innerWidth < 768) setShowSidebar(false);
  };

  return (
    <div className="flex h-full min-h-[calc(100vh-64px)] overflow-hidden font-sans bg-white text-zinc-900">
      
      {/* ═══ SIDEBAR (Topics) ═══ */}
      <AnimatePresence mode="wait">
        {showSidebar && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-full border-r border-zinc-200 flex flex-col bg-zinc-50 z-30"
          >
            <div className="h-16 flex items-center px-6 border-b border-zinc-200 gap-3 bg-white">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <Bot className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="font-black text-sm uppercase tracking-[0.2em] text-zinc-900">Nova Lab</span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 px-2">Active Protocols</p>
                <TopicSidebar onSelectTopic={handleTopicChange} currentTopic={currentTopic} />
                
                <div className="mt-8 px-5">
                   <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                      <div className="flex items-center gap-2 mb-2">
                         <div className="p-1 rounded bg-emerald-500/20">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                         </div>
                         <h4 className="text-[11px] font-bold text-emerald-700 uppercase tracking-tighter">Pro Sync</h4>
                      </div>
                      <p className="text-[10px] text-zinc-500 leading-relaxed">Personalized memory adapts to your growth in real-time.</p>
                   </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-zinc-200 bg-white">
               <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-all">
                  <Settings className="w-4 h-4" /> System Settings
               </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 relative bg-white">
        {/* ═══ HEADER ═══ */}
        <header className="h-16 border-b border-zinc-200 flex items-center justify-between px-4 sm:px-8 bg-white sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowSidebar(!showSidebar)} 
              className="p-2.5 rounded-xl bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 transition-all text-zinc-600 hover:text-zinc-900"
            >
              {showSidebar ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>
            
            <div className="h-4 w-[1px] bg-zinc-200 hidden sm:block" />
            
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-sm sm:text-base uppercase tracking-[0.15em] text-zinc-900 leading-none">
                  Nova<span className="text-emerald-500">AI</span>
                </h1>
                <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-black uppercase text-emerald-600">Core Online</span>
                </div>
              </div>
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                {currentTopic === "general" ? "Neural Engine: v1.5 Stable" : `Topic Context: ${currentTopic}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {progress && (
              <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-2xl bg-zinc-50 border border-zinc-200 mr-2">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  <span className="text-xs font-black text-zinc-700">{progress.streakDays}</span>
                </div>
                <div className="w-px h-3 bg-zinc-200" />
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-black text-zinc-700">{progress.xp} <span className="text-[10px] text-zinc-400 font-bold">XP</span></span>
                </div>
              </div>
            )}
            
            <button 
              onClick={() => setShowHints(!showHints)} 
              className={`p-2.5 rounded-xl transition-all border ${showHints ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-zinc-100 border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200"}`}
              title="Smart Hints"
            >
              <Lightbulb className="w-5 h-5" />
            </button>
            
            <button 
              onClick={clearChat} 
              className="p-2.5 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-all" 
              title="Purge Intelligence"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            
            <div className="h-6 w-px bg-zinc-200 mx-1" />
            <TutorSettings />
          </div>
        </header>

        {/* ═══ MAIN CHAT AREA ═══ */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 space-y-8 custom-scrollbar scroll-smooth">
            <div className="max-w-4xl mx-auto w-full">
              
              {/* Hints Panel */}
              <AnimatePresence>
                {showHints && <HintPanel onClose={() => setShowHints(false)} />}
              </AnimatePresence>

              {/* Loading History */}
              {historyLoading && messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                  <div className="relative">
                    <Loader2 className="animate-spin w-8 h-8 text-emerald-400" />
                    <Bot className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Syncing Intelligence...</span>
                </div>
              )}

              {/* Empty State */}
              {!historyLoading && messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-10"
                >
                  <div className="w-24 h-24 rounded-[2.5rem] bg-emerald-50 flex items-center justify-center mb-8 relative group">
                    <div className="absolute inset-0 rounded-[2.5rem] border-2 border-dashed border-zinc-200 group-hover:border-emerald-500/30 transition-colors duration-500" />
                    <Sparkles className="w-10 h-10 text-emerald-600 group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  
                  <h2 className="text-2xl sm:text-3xl font-black text-center text-zinc-900 mb-3 tracking-tight">
                    Quantum Learning <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600">Accelerated.</span>
                  </h2>
                  <p className="text-sm text-center max-w-lg text-zinc-500 leading-relaxed mb-10">
                    Your adaptive AI tutor is ready. I store every insight, track every weak point, and craft personalized paths for your mastery.
                  </p>

                  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                    <DailyChallengeWidget />
                    <div className="space-y-4">
                       <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-100 self-start">
                          <h3 className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-4 flex items-center gap-2">
                             <BarChart3 className="w-3.5 h-3.5" /> Intelligence Metrics
                          </h3>
                          {progress ? (
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                   <p className="text-[9px] font-bold text-zinc-400 uppercase mb-1">Success Rate</p>
                                   <p className="text-xl font-black text-zinc-900">{progress.averageAccuracy}%</p>
                                </div>
                                <div>
                                   <p className="text-[9px] font-bold text-zinc-400 uppercase mb-1">Rank Level</p>
                                   <p className="text-xl font-black text-emerald-600">{progress.currentRank}</p>
                                </div>
                             </div>
                          ) : (
                             <div className="h-10 w-full bg-zinc-100 animate-pulse rounded-lg" />
                          )}
                       </div>
                       
                       <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                          <p className="text-[10px] font-bold text-emerald-700 leading-relaxed italic">
                             "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice."
                          </p>
                       </div>
                    </div>
                  </div>

                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300 mb-5">Initial Injection Patterns</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
                    {STARTER_PROMPTS.map((q) => (
                      <button
                        key={q.label}
                        onClick={() => sendMsg(null, q.label)}
                        className="flex flex-col items-start gap-3 p-4 rounded-2xl border border-zinc-200 bg-white transition-all hover:bg-zinc-50 hover:border-emerald-500/30 group shadow-sm hover:shadow-md"
                      >
                        <div className="p-2 rounded-lg bg-zinc-50 group-hover:bg-emerald-50 transition-colors">
                           <q.icon className="w-4 h-4 transition-colors" style={{ color: q.color }} />
                        </div>
                        <span className="text-xs font-bold text-zinc-600 group-hover:text-zinc-900 transition-colors text-left leading-snug">{q.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ═══ MESSAGES ═══ */}
              <div className="space-y-8">
                <AnimatePresence mode="popLayout">
                  {messages.map((m, idx) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 20, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} w-full group`}
                    >
                      <div className={`flex gap-3 sm:gap-4 max-w-[90%] sm:max-w-[80%] ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                        
                        {/* Avatar / Icon */}
                        <div className="flex-shrink-0 mt-1">
                          {m.role === "user" ? (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-zinc-900 flex items-center justify-center border border-zinc-800 shadow-lg">
                              <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-white border border-emerald-500/20 flex items-center justify-center shadow-lg group-hover:border-emerald-500/50 transition-colors overflow-hidden relative">
                              <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors" />
                              <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 relative z-10" />
                            </div>
                          )}
                        </div>

                        {/* Content Bubble */}
                        <div className="flex flex-col min-w-0">
                          <div className={`flex items-center gap-2 mb-1.5 ${m.role === "user" ? "justify-end mr-1" : "ml-1"}`}>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                              {m.role === "user" ? "Student" : "NovaAI v1.5"}
                            </span>
                            {m.role === "model" && m.xpGained > 0 && (
                              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 text-[8px] font-black group-hover:animate-bounce">+{m.xpGained} XP</span>
                            )}
                            {m.emotionAdjusted && (
                              <span className="px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-600 text-[8px] font-black flex items-center gap-1 border border-rose-500/10">
                                <Flame className="w-2.5 h-2.5" /> EMOTION SYNC
                              </span>
                            )}
                          </div>

                          <div
                            className={`px-5 py-4 rounded-3xl border transition-all relative overflow-hidden ${m.role === "user"
                              ? "bg-zinc-900 text-white border-zinc-800 rounded-tr-none shadow-xl"
                              : m.isError
                                ? "bg-rose-50 border-rose-100 text-rose-700 rounded-tl-none"
                                : "bg-white border-emerald-500/10 text-zinc-900 rounded-tl-none shadow-md shadow-emerald-500/5"
                              }`}
                          >
                            {m.role === "user" && <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full -mr-16 -mt-16 opacity-20" />}
                            
                            <div className="text-sm sm:text-[15px] leading-relaxed relative z-10">
                              {m.role === 'model' && !m.isError ? (
                                <MarkdownPreview
                                  source={m.content}
                                  data-color-mode="light"
                                  style={{
                                    background: 'transparent',
                                    color: 'inherit',
                                    fontSize: 'inherit',
                                    fontFamily: 'inherit'
                                  }}
                                  className="markdown-override-premium"
                                />
                              ) : (
                                <div className="whitespace-pre-wrap">{m.content}</div>
                              )}
                            </div>
                          </div>

                          {m.role === "model" && !m.isError && (
                            <div className="flex items-center gap-4 mt-2 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(m.content);
                                  setCopiedId(m.id);
                                  setTimeout(() => setCopiedId(null), 1500);
                                }}
                                className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-emerald-600 transition-colors flex items-center gap-1.5"
                              >
                                {copiedId === m.id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                                {copiedId === m.id ? "Copied" : "Copy"}
                              </button>
                              <div className="w-1 h-1 rounded-full bg-zinc-200" />
                              <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-tighter">
                                {m.time?.toLocaleTimeString?.([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Thinking Indicator */}
              {loading && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-50 border border-indigo-100 flex items-center justify-center">
                    <Loader2 className="animate-spin w-5 h-5 text-indigo-500" />
                  </div>
                  <div className="flex flex-col gap-2 mt-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 flex items-center gap-2">
                      Decrypting Neural Stream
                      <span className="flex gap-1">
                        {[0, 1, 2].map(i => (
                          <motion.span key={i} className="w-1 h-1 rounded-full bg-indigo-400"
                            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                            transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                          />
                        ))}
                      </span>
                    </span>
                  </div>
                </motion.div>
              )}

              <div ref={endRef} className="h-4" />
            </div>
          </div>

          {/* ═══ QUICK ACTIONS ═══ */}
          {messages.length > 0 && !loading && (
            <div className="px-4 sm:px-8 pb-3 max-w-4xl mx-auto w-full flex gap-2.5 overflow-x-auto no-scrollbar">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  onClick={() => sendMsg(null, action.message)}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl text-[11px] font-bold whitespace-nowrap bg-zinc-50 border border-zinc-100 text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100 transition-all active:scale-95"
                >
                  <span className="text-xs">{action.icon}</span>
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* ═══ INPUT ═══ */}
          <footer className="p-4 sm:p-8 pt-2 bg-white/80 backdrop-blur-xl border-t border-zinc-100">
            <form onSubmit={(e) => sendMsg(e)} className="max-w-4xl mx-auto relative group">
              <div className="absolute inset-x-0 bottom-full mb-4 px-4 flex justify-center">
                 {input.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] bg-white px-3 py-1 rounded-full shadow-sm border border-zinc-100">
                       Press Enter to Transmit
                    </motion.div>
                 )}
              </div>
              
              <div className="relative flex items-center gap-3">
                <div className="relative flex-1 group">
                  <div className="absolute inset-0 bg-emerald-500/5 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Inquire with NovaAI... (e.g. 'Explain Dark Matter' or 'Test me on CSS')"
                    className="h-14 bg-zinc-50 border border-zinc-200 rounded-[2rem] text-zinc-900 placeholder:text-zinc-400 px-7 text-sm focus:bg-white focus:border-emerald-500/50 transition-all focus:ring-4 focus:ring-emerald-500/5 pr-14 relative z-10"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex gap-2">
                     <button type="button" className="p-2 text-zinc-300 hover:text-indigo-500 transition-colors">
                        <MoreVertical size={18} />
                     </button>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="h-14 w-14 rounded-[2rem] p-0 transition-all hover:scale-105 active:scale-95 shadow-lg relative z-10 overflow-hidden flex-shrink-0"
                  style={{ 
                    background: input.trim() ? '#10b981' : '#f4f4f5', 
                    color: input.trim() ? '#ffffff' : '#a1a1aa',
                    border: 'none',
                    boxShadow: input.trim() ? '0 4px 15px rgba(16, 185, 129, 0.3)' : 'none'
                  }}
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} className={input.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />}
                </Button>
              </div>
            </form>
            <div className="mt-4 flex justify-center">
              <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest text-center">
                NovaAI may provide optimized hints. Verified Accuracy Phase: Final Beta.
              </p>
            </div>
          </footer>
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.2);
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .markdown-override-premium {
          word-break: break-word;
        }
        .markdown-override-premium p {
          margin-bottom: 1rem;
        }
        .markdown-override-premium p:last-child {
          margin-bottom: 0;
        }
        .markdown-override-premium code {
          background: rgba(0, 0, 0, 0.05);
          padding: 0.2rem 0.4rem;
          border-radius: 0.4rem;
          font-size: 0.85em;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
        .markdown-override-premium pre {
          background: #f8fafc !important;
          border-radius: 1rem !important;
          padding: 1.25rem !important;
          border: 1px solid rgba(0, 0, 0, 0.05) !important;
        }
        .markdown-override-premium pre code {
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
        }
        .markdown-override-premium ul, .markdown-override-premium ol {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }
        .markdown-override-premium li {
          margin-bottom: 0.5rem;
        }
        .markdown-override-premium h1, .markdown-override-premium h2, .markdown-override-premium h3 {
          font-weight: 800;
          color: #18181b;
          margin: 1.5rem 0 1rem 0;
          letter-spacing: -0.02em;
        }
        .markdown-override-premium blockquote {
          border-left: 4px solid #10b981;
          background: rgba(16, 185, 129, 0.05);
          padding: 1rem 1.5rem;
          border-radius: 0 1rem 1rem 0;
          margin: 1.5rem 0;
          color: #374151;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}