"use client";
import { useNavStore } from '@/store/useNavStore';
import { usePathname, useRouter } from 'next/navigation';
import React from "react";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  PolarRadiusAxis,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trophy, BarChart3, Target, Percent, AlertTriangle, Zap, Sword, CheckCircle2, XCircle, TrendingUp, Users, Brain, Scroll } from "lucide-react";
import { cn } from "@/lib/utils";

// Strict Theme Palette
const COLORS = ["#1E4D3B", "#000000", "#F8FAFC", "#E2E8F0"]; // Correct, Incorrect, Neutral
const CHART_ACCENT = "#1E4D3B";

const Summary = () => {
  const state = useNavStore(s => s.navState);
  const router = useRouter();

  if (!state || !state.userPerformance || !state.analytics)
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] bg-white animate-in fade-in duration-500">
        <div className="w-20 h-20 rounded-[32px] bg-slate-50 flex items-center justify-center mb-8 border border-slate-100">
           <AlertTriangle className="text-black w-8 h-8" />
        </div>
        <p className="text-sm font-black uppercase tracking-[0.4em] mb-8 text-slate-300">Data Desynchronized</p>
        <Button 
          onClick={() => router.push("/student/battleground")}
          className="h-14 px-10 rounded-2xl bg-[#1E4D3B] text-white hover:bg-black font-black uppercase tracking-[0.2em] text-[10px]"
        >
          Return to Combat Base
        </Button>
      </div>
    );

  const { analytics, userPerformance, players } = state;

  const accuracyData = [
    { name: "Correct Hits", value: userPerformance.correctCount ?? 0 },
    { name: "Fumbles", value: userPerformance.incorrectCount ?? 0 },
  ];

  const leaderboardData = (players || []).map((p) => ({
    name: p.username,
    score: p.score,
    accuracy: Number(p.accuracy),
  }));

  const radarData = [
    { metric: "Accuracy", value: userPerformance.accuracy ?? 0 },
    { metric: "Clearance", value: userPerformance.completedQuestions > 0 ? (userPerformance.completedQuestions / (analytics.totalQuestions || userPerformance.completedQuestions)) * 100 : 0 },
    { metric: "Potency", value: analytics.highestScore > 0 ? (userPerformance.totalScore / analytics.highestScore) * 100 : 0 },
    { metric: "Resilience", value: 85 }, // Placeholder for consistency in radar visual
    { metric: "Speed", value: 70 },
  ];

  const timelineData = (userPerformance.timeline || []).map((t) => ({
    name: `Q${t.questionNumber}`,
    correct: t.correct ? 1 : 0,
  }));

  const tagData = (analytics.tagWisePerformance || []).map((t) => ({
    tag: t.tag,
    accuracy: t.accuracy,
  }));

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-24">
      
      {/* ═══ Header Section ═══ */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-4">
        <div className="space-y-2 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-black flex items-center gap-4 uppercase tracking-tighter text-black">
            <Trophy className="text-[#1E4D3B] w-10 h-10" /> Battle Intel
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Synchronized Post-Combat Analysis</p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/student/arena")}
          className="h-14 px-8 rounded-2xl border-2 border-slate-100 bg-white text-black hover:bg-[#1E4D3B] hover:text-white font-black uppercase tracking-[0.2em] text-[10px] transition-all"
        >
          <ArrowLeft className="mr-3 h-4 w-4" /> System Backtrack
        </Button>
      </div>

      {/* ═══ Top Score Analytics Grid ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <ScoreMetric 
          label="Final Points" 
          value={userPerformance.totalScore} 
          subValue={`Rank #${analytics.rank} / ${analytics.totalPlayers}`} 
          icon={<Sword size={24}/>}
          accent="green"
        />
        <ScoreMetric 
          label="Combat Accuracy" 
          value={`${userPerformance.accuracy}%`} 
          subValue={`${userPerformance.correctCount} Hits / ${userPerformance.completedQuestions}`} 
          icon={<Target size={24}/>}
          accent="black"
        />
        <ScoreMetric 
          label="Global Average" 
          value={(analytics.averageScore ?? 0).toFixed(1)} 
          subValue={`Target: ${analytics.highestScore}`} 
          icon={<Percent size={24}/>}
          accent="slate"
        />
      </div>

      {/* ═══ Charts Grid ═══ */}
      <div className="grid gap-8 lg:grid-cols-2">
        <SummaryChart title="Impact Distribution" icon={<PieChart size={16}/>}>
           <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={accuracyData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={8} label>
                  {accuracyData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '24px', border: '0', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} />
              </PieChart>
           </ResponsiveContainer>
        </SummaryChart>

        <SummaryChart title="Leaderboard Standings" icon={<Users size={16}/>}>
           <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leaderboardData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} stroke="#94a3b8" axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: '24px', border: '0', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="score" fill="#000000" radius={[10, 10, 0, 0]} barSize={24} />
                <Bar dataKey="accuracy" fill="#1E4D3B" radius={[10, 10, 0, 0]} barSize={24} />
              </BarChart>
           </ResponsiveContainer>
        </SummaryChart>

        <SummaryChart title="Cognitive Resonance" icon={<Brain size={16}/>}>
           <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                <PolarRadiusAxis hide domain={[0, 100]} />
                <Radar name="Performance" dataKey="value" stroke={CHART_ACCENT} fill={CHART_ACCENT} fillOpacity={0.15} />
                <Tooltip contentStyle={{ borderRadius: '24px', border: '0' }} />
              </RadarChart>
           </ResponsiveContainer>
        </SummaryChart>

        <SummaryChart title="Execution Timeline" icon={<TrendingUp size={16}/>}>
           <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} stroke="#94a3b8" axisLine={false} tickLine={false} />
                <YAxis domain={[0, 1]} ticks={[0, 1]} hide />
                <Tooltip contentStyle={{ borderRadius: '20px', border: '0' }} />
                <Line type="stepAfter" dataKey="correct" stroke="#1E4D3B" strokeWidth={5} dot={{ r: 6, fill: '#1E4D3B', strokeWidth: 0 }} activeDot={{ r: 8, strokeWidth: 0 }} />
              </LineChart>
           </ResponsiveContainer>
        </SummaryChart>
      </div>

      {/* ═══ Detailed Subject Breakdown ═══ */}
      <Card className="rounded-[40px] border-slate-100 shadow-sm overflow-hidden bg-white">
        <CardHeader className="p-10 border-b border-slate-50">
           <CardTitle className="text-xl font-black uppercase tracking-[0.2em] text-black flex items-center gap-4">
              <Scroll className="w-6 h-6 text-[#1E4D3B]" /> Technical Feedback Archive
           </CardTitle>
        </CardHeader>
        <CardContent className="p-10 space-y-6">
           {tagData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tagData.map((t, idx) => (
                   <div key={idx} className="p-8 rounded-[32px] bg-slate-50/50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-2xl hover:shadow-emerald-900/5 transition-all duration-500">
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-2">Subject Target</p>
                         <h4 className="text-lg font-black text-black uppercase tracking-tight">{t.tag}</h4>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-2">Sync</p>
                         <div className="flex items-center gap-3">
                            <div className="w-24 h-2 bg-white rounded-full overflow-hidden shadow-inner">
                               <div className="h-full bg-[#1E4D3B]" style={{ width: `${t.accuracy}%` }} />
                            </div>
                            <span className="text-sm font-black text-[#1E4D3B]">{t.accuracy}%</span>
                         </div>
                      </div>
                   </div>
                ))}
              </div>
           ) : (
              <div className="py-20 text-center opacity-30 italic">
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 font-black">Subject Analytics De-synchronized</p>
              </div>
           )}
        </CardContent>
      </Card>

      {/* ═══ Paragraph Feedback Section ═══ */}
      {userPerformance.paragraphFeedback?.length > 0 && (
        <Card className="rounded-[40px] border-slate-100 shadow-sm overflow-hidden bg-white">
          <CardHeader className="p-10 border-b border-slate-50 bg-[#1E4D3B] text-white">
            <CardTitle className="text-xl font-black uppercase tracking-[0.2em] flex items-center gap-4">
               <Brain className="w-6 h-6 text-white" /> Intelligence Evaluation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-10 space-y-8">
            {userPerformance.paragraphFeedback.map((fb, idx) => (
              <div key={idx} className="p-10 border-2 border-slate-50 rounded-[32px] space-y-4 group hover:border-[#1E4D3B]/20 transition-all duration-500">
                <div className="flex items-center justify-between">
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Target ID: {fb.questionId}</p>
                   <Badge className="bg-black text-white px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest leading-none">+{fb.points} POTENCY</Badge>
                </div>
                <p className="text-lg font-bold text-black leading-relaxed italic">"{fb.feedback}"</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ═══ Footer Finalize ═══ */}
      <div className="flex justify-center pt-12">
        <Button
           onClick={() => router.push("/student/arena")}
           className="h-18 px-16 rounded-3xl bg-black text-white hover:bg-[#1E4D3B] font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl transition-all active:scale-95"
        >
           Finalize Combat Data Summary
        </Button>
      </div>

    </div>
  );
};

/* ── UI HELPERS ── */

function ScoreMetric({ label, value, subValue, icon, accent }: any) {
   const styles: any = {
      green: "bg-[#1E4D3B] text-white border-[#1E4D3B] shadow-emerald-900/40",
      black: "bg-black text-white border-black shadow-black/30",
      slate: "bg-white text-black border-slate-100 shadow-sm",
   };
   
   return (
      <Card className={cn("rounded-[36px] overflow-hidden border-2 shadow-2xl transition-all duration-500 hover:-translate-y-2", styles[accent])}>
         <CardContent className="p-10 flex items-center justify-between">
            <div className="space-y-4">
               <div>
                  <p className={cn("text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-1", accent === 'slate' && 'text-slate-500')}>
                     {label}
                  </p>
                  <p className="text-5xl font-black tracking-tighter leading-none">{value}</p>
               </div>
               <p className={cn("text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mt-2", accent === 'slate' && 'text-[#1E4D3B] opacity-100')}>{subValue}</p>
            </div>
            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center border transition-all duration-500", 
               accent === 'slate' ? 'bg-slate-50 border-slate-100 text-[#1E4D3B]' : 'bg-white/10 border-white/10 text-white'
            )}>
               {icon}
            </div>
         </CardContent>
      </Card>
   );
}

function SummaryChart({ title, icon, children }: any) {
   return (
      <Card className="rounded-[48px] border-slate-100 shadow-sm bg-white overflow-hidden group">
         <CardHeader className="p-10 border-b border-slate-50">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-4">
               <div className="text-[#1E4D3B] group-hover:scale-110 transition-transform">{icon}</div> {title}
            </CardTitle>
         </CardHeader>
         <CardContent className="h-80 p-10">
            {children}
         </CardContent>
      </Card>
   );
}

export default Summary;
