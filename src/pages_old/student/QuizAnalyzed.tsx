"use client";
import React from "react";
import { useNavStore } from '@/store/useNavStore';
import { useRouter } from 'next/navigation';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  XCircle,
  Target,
  Clock,
  ArrowLeft,
  BarChart3,
  PieChart as PieIcon,
  Sword,
  Trophy,
  Zap,
  Sparkles,
  Scroll,
  TrendingUp,
  Brain,
} from "lucide-react";

import { palette } from "@/theme/palette";
import { useGameStore } from "@/game/useGameStore";

// Strict Theme Colors
const COLORS = ["#1E4D3B", "#000000"]; // Forest Green for Correct, Black for Wrong
const CHART_ACCENT = "#1E4D3B";

const QuizAnalyzed = () => {
  const sessionAwarded = React.useRef(false);
  const { addXP, addCoins } = useGameStore();

  const state = useNavStore(s => s.navState);
  const router = useRouter();
  const analysis = state?.analysis || state;

  React.useEffect(() => {
    if (analysis?.xpGained && !sessionAwarded.current) {
       addXP(analysis.xpGained, "Assessment Mastery");
       // Estimate coins based on accuracy
       const coinReward = Math.floor((analysis.accuracy / 100) * 50);
       if (coinReward > 0) addCoins(coinReward);
       sessionAwarded.current = true;
    }
  }, [analysis, addXP, addCoins]);

  if (!analysis)
    return (
      <div className="flex justify-center items-center h-[80vh] text-black font-black uppercase tracking-[0.4em] text-xs">
        Protocol Desynchronized. Return to Base.
      </div>
    );

  const {
    quizTitle = "Mission Analysis",
    correctCount = 0,
    wrongCount = 0,
    accuracy = 0,
    totalMarks = 0,
    scoredMarks = 0,
    timeTaken = "0m 0s",
    xpGained = 0,
    questionAnalysis = [],
    charts = { pie: [], bar: [] },
  } = analysis;

  const timeValue = (() => {
    const t = String(timeTaken).split(" ")[0];
    return isNaN(parseInt(t)) ? 0 : parseInt(t);
  })();

  const isVictory = Number(accuracy) >= 50;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">
      
      {/* ─── Hero Section: Victory/Defeat (STRICT G/W/B) ───────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-10 md:p-16 rounded-[48px] border-2 overflow-hidden text-center bg-white shadow-2xl"
        style={{
          borderColor: isVictory ? '#1E4D3B' : '#000000',
        }}
      >
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        
        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12 }}
          >
            {isVictory ? (
              <div className="w-24 h-24 rounded-[32px] bg-[#1E4D3B] text-white flex items-center justify-center mb-6 shadow-2xl shadow-emerald-900/30">
                 <Trophy className="w-12 h-12" />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-[32px] bg-black text-white flex items-center justify-center mb-6 shadow-2xl shadow-black/30">
                 <Sword className="w-12 h-12" />
              </div>
            )}
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2 text-black leading-none">
            {isVictory ? 'Mastery Confirmed' : 'Sync Interrupted'}
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-8">
            ANALYSIS REPORT: {quizTitle}
          </p>

          <div className="flex flex-wrap justify-center gap-6">
            <StatPill label="Accuracy" value={`${accuracy}%`} />
            <StatPill label="Time Cycle" value={timeTaken} />
            <StatPill label="Mastery Point" value={`+${xpGained} XP`} highlight />
          </div>
        </div>
      </motion.div>

      {/* ─── Navigation ───────────────────────────── */}
      <div className="flex justify-between items-center px-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/student/quizzes")}
          className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-400 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-3" /> System Backtrack
        </Button>
        <div className="h-px flex-1 mx-10 bg-slate-100" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1E4D3B]">LOG AUTH: {Math.floor(Math.random()*999)}</p>
      </div>

      {/* ─── Battle Stats Grid ───────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Critical Success", val: correctCount, icon: <CheckCircle2 className="text-white" />, bg: "bg-[#1E4D3B]", border: "border-[#1E4D3B]" },
          { label: "Sync Fumbles", val: wrongCount, icon: <XCircle className="text-white" />, bg: "bg-black", border: "border-black" },
          { label: "Module Rating", val: `${scoredMarks}/${totalMarks}`, icon: <Target className="text-black" />, bg: "bg-slate-50", border: "border-slate-100" },
          { label: "Level Progression", val: `+${xpGained}`, icon: <Zap className="text-black" />, bg: "bg-slate-50", border: "border-slate-100" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={cn("rounded-[32px] border-2 h-full overflow-hidden shadow-sm", stat.border)}>
              <CardContent className={cn("p-8 flex items-center justify-between", stat.bg)}>
                <div>
                  <p className={cn("text-[9px] font-black uppercase tracking-widest mb-1", stat.bg.includes('slate') ? 'text-slate-400' : 'text-white/60')}>{stat.label}</p>
                  <p className={cn("text-3xl font-black", stat.bg.includes('slate') ? 'text-black' : 'text-white')}>{stat.val}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10 bg-white/10">
                  {stat.icon}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ─── Charts ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard title="Intelligence Distribution" icon={<PieIcon size={16}/>}>
           <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={charts?.pie || []} dataKey="value" innerRadius={70} outerRadius={110} paddingAngle={8}>
                  {(charts?.pie || []).map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '24px', border: '0', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '30px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }} />
              </PieChart>
           </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Strike Sequence Delta" icon={<TrendingUp size={16}/>}>
           <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.bar || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="question" stroke="#cbd5e1" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: '24px', border: '0', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="result" fill={CHART_ACCENT} radius={[10, 10, 0, 0]} barSize={24}>
                  {(charts?.bar || []).map((entry, index) => (
                    <Cell key={index} fill={entry.result === 1 ? '#1E4D3B' : '#000000'} />
                  ))}
                </Bar>
              </BarChart>
           </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ─── Cognitive Radar ───────────────────────────── */}
      <ChartCard title="Cognitive Resonance" icon={<Brain size={16}/>}>
         <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={[
               { metric: "Accuracy", value: Number(accuracy) || 0 },
               { metric: "Speed", value: Math.max(0, 100 - timeValue * 10) },
               { metric: "Mastery", value: Math.min(100, (scoredMarks / totalMarks) * 100) },
               { metric: "Cycles", value: Math.min(100, questionAnalysis.length * 10) },
               { metric: "XP Potency", value: Math.min(100, xpGained * 5) },
            ]}>
               <PolarGrid stroke="#f1f5f9" />
               <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
               <PolarRadiusAxis hide domain={[0, 100]} />
               <Radar name="Cognition" dataKey="value" stroke={CHART_ACCENT} fill={CHART_ACCENT} fillOpacity={0.15} />
               <Tooltip contentStyle={{ borderRadius: '24px', border: '0' }} />
            </RadarChart>
         </ResponsiveContainer>
      </ChartCard>

      {/* ─── Combat Log: Detailed Breakdown ───────────────────────────── */}
      <Card className="rounded-[40px] border-slate-100 shadow-sm overflow-hidden bg-white">
        <CardHeader className="p-10 border-b border-slate-50">
          <CardTitle className="text-xl font-black uppercase tracking-[0.2em] text-black flex items-center gap-4">
            <Scroll className="w-6 h-6 text-[#1E4D3B]" /> Intelligence Archive
          </CardTitle>
        </CardHeader>
        <CardContent className="p-10 space-y-6">
           {questionAnalysis.map((q, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={cn(
                  "p-8 rounded-[32px] border-2 transition-all flex flex-col md:flex-row gap-8",
                  q.result === "✅" ? 'bg-emerald-50/20 border-emerald-100' : 'bg-slate-50 border-slate-100'
                )}
              >
                <div className={cn(
                  "w-16 h-16 rounded-[20px] flex items-center justify-center shrink-0 border-2 shadow-lg",
                  q.result === "✅" ? 'bg-[#1E4D3B] border-[#1E4D3B] text-white' : 'bg-black border-black text-white'
                )}>
                  {q.result === "✅" ? <CheckCircle2 size={28} /> : <XCircle size={28} />}
                </div>
                
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">MOD {i + 1}</span>
                    <Badge className={cn("text-[9px] font-black uppercase px-3 py-1", q.result === "✅" ? 'bg-[#1E4D3B] text-white' : 'bg-black text-white')}>
                      {q.result === "✅" ? 'PROTOCOL SUCCESS' : 'SYNC FAILURE'}
                    </Badge>
                  </div>
                  <p className="text-xl font-bold text-black leading-tight">{q.questionText}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                      <p className="text-[9px] uppercase font-black text-slate-300 tracking-[0.1em] mb-2">Subject Input</p>
                      <p className={cn("text-sm font-black uppercase tracking-tight", q.result === "✅" ? 'text-[#1E4D3B]' : 'text-black opacity-50')}>
                        {q.selected || "UNDEFINED"}
                      </p>
                    </div>
                    <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                      <p className="text-[9px] uppercase font-black text-slate-300 tracking-[0.1em] mb-2">Validated Core</p>
                      <p className="text-sm font-black uppercase text-[#1E4D3B] tracking-tight">
                        {q.correct}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
           ))}
        </CardContent>
      </Card>

      {/* ─── Footer Action ───────────────────────────── */}
      <div className="flex justify-center pt-10">
        <Button
          onClick={() => router.push("/student/quizzes")}
          className="h-16 px-12 rounded-[24px] bg-black text-white hover:bg-[#1E4D3B] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95"
        >
          <Sparkles className="w-5 h-5 mr-4" /> Finalize System Session
        </Button>
      </div>

    </div>
  );
};

/* ── HELPERS ── */

function StatPill({ label, value, highlight }: any) {
   return (
      <div className={cn(
         "px-8 py-4 rounded-[20px] border-2 backdrop-blur-sm shadow-sm",
         highlight ? "bg-[#1E4D3B] border-[#1E4D3B] text-white" : "bg-white border-slate-50 text-black"
      )}>
         <span className={cn("text-[9px] block uppercase font-black tracking-[0.2em] mb-1 opacity-50", highlight && "text-white/60")}>{label}</span>
         <span className="text-xl font-black">{value}</span>
      </div>
   );
}

function ChartCard({ title, icon, children }: any) {
   return (
      <Card className="rounded-[40px] border-slate-100 shadow-sm bg-white overflow-hidden">
         <CardHeader className="p-8 border-b border-slate-50">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
               <div className="text-[#1E4D3B]">{icon}</div> {title}
            </CardTitle>
         </CardHeader>
         <CardContent className="h-80 p-8">
            {children}
         </CardContent>
      </Card>
   );
}

export default QuizAnalyzed;
