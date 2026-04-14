"use client";
import { useNavStore } from '@/store/useNavStore';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

import axios from "axios";
import {
  Sword,
  BookOpen,
  Clock,
  Target,
  BarChart3,
  CheckCircle,
  XCircle,
  Info,
  Search,
  Trophy,
  Users,
  ChevronRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { palette } from "@/theme/palette";
import { cn } from "@/lib/utils";

const QUIZ_API = "/api/quiz/getquizattempts";
const BATTLE_API = "/api/battle/battlehist";

const PerformanceHistory = () => {
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [battles, setBattles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const [quizRes, battleRes] = await Promise.all([
          axios.get(QUIZ_API, { withCredentials: true }),
          axios.get(BATTLE_API, { withCredentials: true }),
        ]);
        setQuizAttempts(quizRes.data.attempts || []);
        setBattles(battleRes.data.battles || []);
      } catch (err) {
        setError("Failed to load your history.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filterBySearch = (name) =>
    (name || "").toLowerCase().includes(searchQuery.toLowerCase());

  const filteredQuizzes = quizAttempts.filter((a) =>
    filterBySearch(a.quizTitle || a.resultData?.quizTitle)
  );
  const filteredBattles = battles.filter((b) =>
    filterBySearch(b.battleName)
  );

  const openQuizAnalysis = (resultData) =>
    (useNavStore.getState().setNavState(resultData), router.push("/student/quizresult"));

  const openBattleAnalysis = (battle) => {
    const analytics = {
      rank: battle.rank ?? battle.performance?.rank ?? null,
      totalPlayers: battle.totalPlayers ?? battle.performance?.totalPlayers ?? (battle.performance ? (battle.performance.totalPlayers || 0) : 0),
      highestScore: battle.performance?.highestScore ?? 0,
      lowestScore: battle.performance?.lowestScore ?? 0,
      averageScore: battle.performance?.averageScore ?? 0,
      totalQuestions: battle.totalQuestions ?? battle.completedQuestions ?? (battle.performance?.totalQuestions ?? 0),
      tagWisePerformance: battle.tagWisePerformance ?? battle.performance?.tagWisePerformance ?? [],
    };
    const userPerformance = {
      totalScore: battle.totalScore ?? battle.performance?.userScore ?? 0,
      correctCount: battle.correctCount ?? battle.performance?.correctCount ?? 0,
      incorrectCount: battle.incorrectCount ?? battle.performance?.incorrectCount ?? 0,
      completedQuestions: battle.completedQuestions ?? battle.performance?.completedQuestions ?? 0,
      accuracy: Number(((battle.accuracy ?? battle.performance?.accuracy ?? 0)).toFixed(1)),
      timeline: battle.timeline ?? battle.performance?.timeline ?? [],
      tagWisePerformance: battle.tagWisePerformance ?? battle.performance?.tagWisePerformance ?? [],
      paragraphFeedback: battle.paragraphFeedback ?? battle.performance?.paragraphFeedback ?? [],
    };
    const players = (battle.players || battle.performance?.leaderboard || []).map((p) => ({
      username: p.username || p.user || "Unknown",
      score: p.score ?? p.points ?? 0,
      accuracy: Number((p.accuracy ?? 0)),
    }));
    useNavStore.getState().setNavState({ analytics, userPerformance, players });
    router.push("/student/summary");
  };

  const safeNumber = (v) => (v === undefined || v === null ? "N/A" : v);

  return (
    <div className="p-4 sm:p-10 min-h-screen bg-white" style={{ background: '#FFFFFF' }}>
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black text-black flex items-center gap-4 italic uppercase tracking-tighter">
              <BarChart3 className="w-10 h-10 text-[#1E4D3B]" /> Performance Archive
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 pl-1 opacity-70">Reviewing Intelligence Logs</p>
          </div>

          <div className="relative w-full md:w-[400px]">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search data logs…"
              className="h-16 pl-14 rounded-[28px] bg-slate-50 border-slate-100 focus:border-[#1E4D3B] font-bold text-lg shadow-sm transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center space-y-4">
             <div className="w-12 h-12 border-4 border-slate-50 border-t-[#1E4D3B] rounded-full animate-spin mx-auto" />
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 animate-pulse">Decrypting Records…</p>
          </div>
        ) : (
          <div className="space-y-16">
            
            {/* Quiz Section */}
            {filteredQuizzes.length > 0 && (
              <section className="space-y-8">
                <div className="flex items-center justify-between px-4 border-l-[6px] border-[#1E4D3B]">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-black uppercase tracking-tight flex items-center gap-3">
                      <BookOpen size={24} className="text-[#1E4D3B]" /> Academic Cycles
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{filteredQuizzes.length} Attempts Identified</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredQuizzes.map((attempt, index) => {
                    const result = attempt.resultData || {};
                    const isDetailed = !!result.totalQuestions;
                    return (
                      <HistoryCard 
                        key={index} 
                        icon={<BookOpen size={20}/>}
                        title={attempt.quizTitle || result.quizTitle || "Untitled Module"}
                        date={new Date(attempt.attemptedOn || attempt.attemptDate).toLocaleString()}
                        isDetailed={isDetailed}
                        stats={[
                          { label: "Correct Hits", value: result.correctCount, icon: <CheckCircle className="text-[#1E4D3B]"/> },
                          { label: "Fumbles", value: result.wrongCount, icon: <XCircle className="text-black"/> },
                          { label: "Accuracy", value: `${result.accuracy}%`, icon: <Target className="text-[#1E4D3B]"/> }
                        ]}
                        onClick={() => openQuizAnalysis(result)}
                      />
                    );
                  })}
                </div>
              </section>
            )}

            {/* Battle Section */}
            {filteredBattles.length > 0 && (
              <section className="space-y-8">
                <div className="flex items-center justify-between px-4 border-l-[6px] border-black">
                   <div className="space-y-1">
                      <h2 className="text-2xl font-black text-black uppercase tracking-tight flex items-center gap-3">
                        <Sword size={24} className="text-black" /> Combat Engagements
                      </h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{filteredBattles.length} Skirmishes Logged</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredBattles.map((battle, index) => {
                    const performance = battle.performance || {};
                    const totalScore = battle.totalScore ?? performance.userScore ?? 0;
                    const accuracy = Number((battle.accuracy ?? performance.accuracy ?? 0).toFixed(1));
                    const highest = performance.highestScore ?? 0;
                    const date = battle.date ? new Date(battle.date).toLocaleString() : "Unknown Timestamp";

                    return (
                      <HistoryCard 
                        key={index} 
                        icon={<Trophy size={20}/>}
                        title={battle.battleName || "Shadow Battle"}
                        date={date}
                        isDetailed={true}
                        accent="black"
                        stats={[
                          { label: "Final Score", value: `${totalScore}/${highest}`, icon: <Trophy className="text-black"/> },
                          { label: "Accuracy", value: `${accuracy}%`, icon: <Target className="text-[#1E4D3B]"/> },
                          { label: "Participants", value: battle.totalPlayers || "N/A", icon: <Users className="text-black"/> }
                        ]}
                        onClick={() => openBattleAnalysis(battle)}
                      />
                    );
                  })}
                </div>
              </section>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

/* ── UI SUBCOMPONENTS ── */

function HistoryCard({ icon, title, date, stats, isDetailed, onClick, accent = "green" }: any) {
  const primaryColor = accent === "green" ? "#1E4D3B" : "#000000";
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      className="group"
      onClick={onClick}
    >
      <Card className="rounded-[36px] border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-emerald-900/5 transition-all duration-500 bg-white overflow-hidden cursor-pointer h-full flex flex-col">
        <CardHeader className="p-8 pb-4">
           <div className="flex items-center gap-4 mb-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors",
                accent === "green" ? "bg-emerald-50 border-emerald-100 text-[#1E4D3B]" : "bg-slate-50 border-slate-100 text-black"
              )}>
                 {icon}
              </div>
              <div className="min-w-0">
                 <h3 className="text-lg font-black text-black leading-tight truncate group-hover:text-[#1E4D3B] transition-colors">{title}</h3>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mt-1">{date}</p>
              </div>
           </div>
        </CardHeader>
        <CardContent className="p-8 pt-2 flex-1 flex flex-col justify-between">
           {isDetailed ? (
             <div className="space-y-5 py-4 border-y border-slate-50">
                {stats.map((s: any, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                     <p className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {s.icon} {s.label}
                     </p>
                     <span className="text-sm font-black text-black">{s.value}</span>
                  </div>
                ))}
             </div>
           ) : (
             <div className="py-8 text-center italic opacity-30">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Deep Analytics Unavailable</p>
             </div>
           )}

           <div className="pt-8">
              <Button 
                className={cn(
                  "w-full h-12 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all",
                  accent === "green" ? "bg-[#1E4D3B] text-white hover:bg-black" : "bg-black text-white hover:bg-[#1E4D3B]"
                )}
              >
                Sync Analysis <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
           </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default PerformanceHistory;
