"use client";
import { useNavStore } from '@/store/useNavStore';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from "react";

import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle2, RefreshCw, XCircle, ArrowLeft, BellRing, AlertTriangle, ChevronRight, ChevronLeft, Zap, Shield, Target } from "lucide-react";
import { palette } from "@/theme/palette";
import { cn } from "@/lib/utils";

const TakeQuiz = () => {
  const quizId = useNavStore(s => s.navState);
  const router = useRouter();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [tabSwitches, setTabSwitches] = useState(0);

  // ─── Fetch Quiz Data ───────────────────────────────
  async function fetchQuiz() {
    if (typeof quizId === 'object' && quizId !== null && quizId.questions) {
      setQuiz(quizId);
      setTimeLeft((quizId.timeLimit || 20) * 60);
      setStartTime(Date.now());
      setLoading(false);
      return;
    }

    if (!quizId) {
      setError("Authorization Metadata Missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(
        "/api/quiz/single",
        { id: quizId },
        { withCredentials: true }
      );
      setQuiz(data);
      setTimeLeft(data.timeLimit * 60);
      setStartTime(Date.now());
    } catch (err) {
      setError("Failed to initialize curriculum log.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchQuiz(); }, []);

  // ─── Timer Logic ───────────────────────────────
  useEffect(() => {
    if (!timeLeft || submitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  // ─── Anti-Cheating ─────────────────────
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !submitted && quiz) {
        setTabSwitches(prev => {
          const newCount = prev + 1;
          if (newCount >= 3) {
            alert("Protocol Terminated: Multiple desynchronizations detected.");
            handleSubmit(true);
          } else {
            alert(`Warning ${newCount}/3: Desynchronization detected! Maintain portal focus.`);
          }
          return newCount;
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [submitted, quiz, answers]);

  const handleOptionSelect = (qId, optionIndex) => {
    if (submitted) return;
    setError("");
    setAnswers((prev) => ({ ...prev, [qId]: optionIndex + 1 }));
  };

  const handleSubmit = async(auto = false) => {
    if (!quiz || submitted) return;
    const totalQuestions = quiz.questions.length;
    const answeredCount = Object.keys(answers).length;

    if (answeredCount < totalQuestions && !auto) {
      setError(`All ${totalQuestions} checkpoints must be validated.`);
      return;
    }

    const endTime = Date.now();
    const diffSec = Math.round((endTime - startTime) / 1000);
    const formattedTime = `${Math.floor(diffSec / 60)}m ${diffSec % 60}s`;
    const selectedArray = quiz.questions.map((q) => answers[q.id] ? answers[q.id] : null);

    const submission = { selected: selectedArray, timeTaken: formattedTime, quizId :quizId };

    setSubmitted(true);
    try {
        let some = await axios.post("/api/quiz/evaluate", submission, { withCredentials: true });
        (useNavStore.getState().setNavState(some.data), router.push("/student/quizresult"));
    } catch(err) {
        alert("Analytics Sync Failed.");
        setSubmitted(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center min-h-[80vh] gap-6">
       <div className="w-12 h-12 border-4 border-slate-50 border-t-[#1E4D3B] rounded-full animate-spin" />
       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Synchronizing Curriculum…</p>
    </div>
  );

  if (!quiz) return (
    <div className="flex flex-col justify-center items-center min-h-[80vh] text-center p-8 space-y-8">
      <div className="w-20 h-20 rounded-[32px] bg-slate-50 flex items-center justify-center border border-slate-100">
         <XCircle className="w-10 h-10 text-black" />
      </div>
      <div className="space-y-2">
         <h2 className="text-2xl font-black uppercase tracking-tighter">Mission Log Absent</h2>
         <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Curriculum data could not be initialized.</p>
      </div>
      <Button onClick={() => router.push(-1)} className="h-14 px-10 rounded-2xl bg-black text-white hover:bg-[#1E4D3B] font-black uppercase tracking-widest text-[10px]">
        Abort and Return
      </Button>
    </div>
  );

  if (submitted) return (
    <div className="flex flex-col justify-center items-center min-h-screen text-center space-y-8 p-8 bg-white">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}>
         <div className="w-24 h-24 rounded-[40px] bg-[#1E4D3B] flex items-center justify-center shadow-2xl shadow-emerald-900/40">
            <RefreshCw className="w-12 h-12 text-white animate-spin-slow" />
         </div>
      </motion.div>
      <div className="space-y-3">
         <h2 className="text-3xl font-black uppercase tracking-tighter animate-pulse text-black">Synthesizing Analytics…</h2>
         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Generating Neural Performance Map</p>
      </div>
    </div>
  );

  const q = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="p-4 sm:p-10 max-w-5xl mx-auto space-y-10 min-h-screen animate-in fade-in slide-in-from-bottom-8 duration-1000">
      
      {/* Header (STRICT G/W/B) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[40px] border border-slate-50 shadow-sm">
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(-1)}
            className="w-12 h-12 rounded-2xl bg-slate-50 text-black hover:bg-black hover:text-white transition-all shadow-sm"
          >
            <ChevronLeft size={24} />
          </Button>
          <div className="space-y-1">
             <h1 className="text-2xl font-black text-black uppercase tracking-tight italic">{quiz.title}</h1>
             <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Phase {currentQuestion + 1} of {quiz.questions.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-black text-white shadow-xl shadow-black/20">
          <Clock className="w-5 h-5 text-[#1E4D3B] animate-pulse" />
          <span className="font-black text-lg tracking-widest">{formatTime(timeLeft)}</span>
        </div>
      </div>

      <Progress value={progress} className="h-2 rounded-full bg-slate-50" />

      {/* Warnings */}
      <AnimatePresence>
         {tabSwitches > 0 && (
           <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex items-center gap-4 p-4 rounded-2xl bg-black text-white border-l-8 border-[#1E4D3B]">
             <AlertTriangle className="w-5 h-5 text-[#1E4D3B]" />
             <p className="text-[10px] font-black uppercase tracking-[0.2em]">Desynchronization Warnings: {tabSwitches}/3</p>
           </motion.div>
         )}
      </AnimatePresence>

      {/* Main Question Interface */}
      <div className="grid lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 space-y-8">
            <motion.div
              key={q.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="rounded-[48px] border-slate-50 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] overflow-hidden bg-white">
                <CardHeader className="p-10 pb-6">
                  <div className="flex items-center gap-3 text-[#1E4D3B] mb-2 font-black text-[10px] uppercase tracking-[0.3em]">
                    <Target size={14} /> Question Focus
                  </div>
                  <CardTitle className="text-2xl font-bold text-black leading-tight tracking-tight">
                    {q.questionText}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-10 pt-4 space-y-4">
                  {q.options.map((opt, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.01, x: 4 }}
                      whileTap={{ scale: 0.99 }}
                      className={cn(
                        "w-full p-6 rounded-[24px] border-2 text-left transition-all duration-300 flex items-center gap-6",
                        answers[q.id] === i + 1
                          ? "bg-black border-black text-white shadow-xl shadow-black/20"
                          : "bg-white border-slate-50 text-black hover:border-[#1E4D3B]/40 hover:bg-slate-50/50 shadow-sm"
                      )}
                      onClick={() => handleOptionSelect(q.id, i)}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-2 font-black text-sm",
                        answers[q.id] === i + 1 ? "bg-[#1E4D3B] border-[#1E4D3B] text-white" : "bg-slate-50 border-slate-100 text-slate-400"
                      )}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className="font-bold text-base">{opt}</span>
                    </motion.button>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
         </div>

         {/* Sidebar Stats */}
         <div className="space-y-6">
            <Card className="rounded-[40px] border-slate-50 shadow-sm bg-white p-8 space-y-6">
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Mission Status</h3>
               <div className="space-y-4">
                  <StatRow label="Analyzed" value={`${Object.keys(answers).length}/${quiz.questions.length}`} icon={<CheckCircle2 size={16}/>} color="#1E4D3B" />
                  <StatRow label="Integrity" value={tabSwitches === 0 ? "STABLE" : "COMPROMISED"} icon={<Shield size={16}/>} color={tabSwitches > 0 ? "#000000" : "#1E4D3B"} />
                  <StatRow label="Yield" value="500 XP" icon={<Zap size={16}/>} color="#000000" />
               </div>
            </Card>

            <Button
               onClick={() => handleSubmit(false)}
               disabled={currentQuestion !== quiz.questions.length - 1}
               className={cn(
                  "w-full h-20 rounded-[32px] font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl transition-all active:scale-95",
                  currentQuestion === quiz.questions.length - 1 ? "bg-black text-white hover:bg-[#1E4D3B]" : "bg-slate-50 text-slate-200 cursor-not-allowed border-0"
               )}
            >
               Finalize Sync
            </Button>
         </div>
      </div>

      {/* Bottom Nav */}
      <div className="flex justify-between items-center bg-white p-6 rounded-[32px] border border-slate-50 shadow-sm">
         <Button
           variant="ghost"
           onClick={() => setCurrentQuestion((prev) => prev - 1)}
           disabled={currentQuestion === 0}
           className="h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400"
         >
           <ChevronLeft className="mr-3" /> Step Back
         </Button>
         <Button
           onClick={() => setCurrentQuestion((prev) => prev + 1)}
           disabled={currentQuestion === quiz.questions.length - 1}
           className="h-14 px-8 rounded-2xl bg-[#1E4D3B] text-white hover:bg-black font-black text-[10px] uppercase tracking-widest transition-all"
         >
           Advance Phase <ChevronRight className="ml-3" />
         </Button>
      </div>

    </div>
  );
};

function StatRow({ label, value, icon, color }) {
   return (
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            {icon} {label}
         </div>
         <span className="text-sm font-black" style={{ color }}>{value}</span>
      </div>
   );
}

export default TakeQuiz;